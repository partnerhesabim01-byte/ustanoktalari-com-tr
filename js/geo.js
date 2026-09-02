/* ===== Konum tespiti — ziyaretçinin IP'sinden yaklaşık il/ilçe bulup
   hero'daki rozeti dolduruyor. İzin istemez, arka planda sessiz çalışır;
   tespit edilemezse rozet gizli kalır (sayfa akışını bozmaz). ===== */
(function () {
  const badge = document.getElementById('locationBadge');
  const badgeText = document.getElementById('locationBadgeText');
  if (!badge || !badgeText) return;

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
    ]);
  }

  // Lat/lng'i il/ilçe ismine çevirir (ücretsiz, API anahtarı gerekmez).
  async function reverseGeocode(lat, lng) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=tr`;
    const res = await withTimeout(fetch(url), 4000);
    if (!res.ok) throw new Error('reverse geocode failed');
    const d = await res.json();
    const admin = d.localityInfo && d.localityInfo.administrative ? d.localityInfo.administrative : [];
    const district =
      (admin.find((a) => a.adminLevel === 6) || {}).name ||
      (admin.find((a) => a.adminLevel === 8) || {}).name ||
      null;
    const city = d.city || d.principalSubdivision || null;
    return { city, district };
  }

  // IP'den yaklaşık konum (izin istemez, otomatik). Ücretsiz, API anahtarı gerekmez.
  async function detectFromIp() {
    const res = await withTimeout(fetch('https://ipwho.is/?lang=tr'), 4000);
    if (!res.ok) throw new Error('ip lookup failed');
    const d = await res.json();
    if (!d.success || !d.city) throw new Error('konum tespit edilemedi');
    const isTr =
      d.country_code === 'TR' ||
      (d.country && /t[üu]rki?ye|turkey/i.test(d.country));
    if (!isTr) throw new Error('TR dışı ziyaretçi');

    if (d.latitude && d.longitude) {
      try {
        const geo = await reverseGeocode(d.latitude, d.longitude);
        if (geo.city || geo.district) return geo;
      } catch { /* reverse geocode başarısız — IP verisiyle devam */ }
    }
    return { city: d.region || d.city, district: d.city !== d.region ? d.city : null };
  }

  function render(loc) {
    if (!loc) return;
    const place = loc.district && loc.district !== loc.city ? loc.district : loc.city;
    const region = loc.city && loc.city !== place ? loc.city : null;
    if (!place) return;
    badgeText.textContent = `Konumunuz: ${place}${region ? ', ' + region : ''} — hızlı kargo gönderiyoruz`;
    badge.hidden = false;
  }

  detectFromIp().then(render).catch(() => { /* sessizce vazgeç, rozet gizli kalır */ });
})();
