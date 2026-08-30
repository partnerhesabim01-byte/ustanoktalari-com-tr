/* ====== ÜRÜN IZGARASI OLUŞTURMA ====== */

// products.js hem kök sayfalardan (index.html) hem bir alt klasördeki
// kategori sayfalarından (kategori/*.html) yüklenir; oradaki göreli
// "images/..." yolu kök sayfada çalışır ama kategori sayfasında bir üst
// klasöre çıkması gerekir — bu yüzden çalışma zamanında konuma göre önek eklenir.
const ASSET_PREFIX = location.pathname.includes('/kategori/') ? '../' : '';

function productCardHTML(p) {
  const oldPriceHTML = p.oldPrice ? `<span class="product-card__old-price">${formatPrice(p.oldPrice)}</span>` : '';
  const badgeHTML = p.oldPrice ? `<span class="product-card__badge">İndirim</span>` : '';
  const stockClass = p.stock <= 5 ? 'low' : '';
  const stockText = p.stock <= 5 ? `Son ${p.stock} adet` : 'Stokta var';
  const mediaHTML = p.image
    ? `<div class="product-card__media"><img src="${ASSET_PREFIX}${p.image}" alt="${p.name}" loading="lazy" width="700" height="700"></div>`
    : `<div class="img-placeholder img-placeholder--product" data-label="${p.name}"></div>`;
  return `
    <div class="product-card" data-id="${p.id}">
      ${badgeHTML}
      ${mediaHTML}
      <div class="product-card__body">
        <span class="product-card__brand">${p.brand}</span>
        <h3 class="product-card__name">${p.name}</h3>
        <span class="product-card__sku">Stok Kodu: ${p.sku}</span>
        <span class="product-card__stock ${stockClass}">${stockText}</span>
        <div class="product-card__price-row">
          <span class="product-card__price">${formatPrice(p.price)}</span>
          ${oldPriceHTML}
        </div>
      </div>
      <button type="button" class="product-card__add" data-add-to-cart="${p.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
        Sepete Ekle
      </button>
    </div>
  `;
}

function renderProductGrid(container, products) {
  container.innerHTML = products.map(productCardHTML).join('');
  container.querySelectorAll('[data-add-to-cart]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.getAttribute('data-add-to-cart'));
      const product = PRODUCTS.find((p) => p.id === id);
      Cart.add(id, 1);
      showToast(`${product.name} sepete eklendi`);
      btn.classList.add('added');
      const original = btn.innerHTML;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.6 2.6L16.5 9"/></svg> Eklendi`;
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = original;
      }, 1300);
    });
  });
}

function sortProducts(products, mode) {
  const list = [...products];
  if (mode === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (mode === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (mode === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name, 'tr'));
  return list;
}

document.addEventListener('DOMContentLoaded', () => {
  /* Kategori sayfası: [data-category-grid] elementine o kategorinin ürünlerini bas */
  const grid = document.querySelector('[data-category-grid]');
  if (grid) {
    const slug = grid.getAttribute('data-category-grid');
    let products = PRODUCTS.filter((p) => p.category === slug);
    const countEl = document.querySelector('[data-product-count]');
    if (countEl) countEl.textContent = products.length;

    renderProductGrid(grid, products);

    const sortSelect = document.querySelector('[data-sort-select]');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        const sorted = sortProducts(products, sortSelect.value);
        renderProductGrid(grid, sorted);
      });
    }
  }

  /* Anasayfa: [data-featured-grid] elementine öne çıkan ürünleri bas */
  const featured = document.querySelector('[data-featured-grid]');
  if (featured) {
    const count = Number(featured.getAttribute('data-featured-grid')) || 8;
    const picks = PRODUCTS.filter((p) => p.oldPrice).slice(0, count);
    const fill = PRODUCTS.filter((p) => !p.oldPrice).slice(0, Math.max(0, count - picks.length));
    renderProductGrid(featured, [...picks, ...fill].slice(0, count));
  }
});
