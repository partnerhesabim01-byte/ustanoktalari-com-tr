/* ====== SEPET SİSTEMİ (localStorage tabanlı) ====== */
const CART_KEY = 'ypCart';
const PHONE_NUMBER = ''; // örn: '905XXXXXXXXX' — netleşince girilecek
const WHATSAPP_NUMBER = ''; // örn: '905XXXXXXXXX' — netleşince girilecek

const Cart = {
  read() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || {};
    } catch (e) {
      return {};
    }
  },
  write(data) {
    localStorage.setItem(CART_KEY, JSON.stringify(data));
    Cart.updateBadge();
  },
  add(id, qty = 1) {
    const data = Cart.read();
    data[id] = (data[id] || 0) + qty;
    Cart.write(data);
  },
  setQty(id, qty) {
    const data = Cart.read();
    if (qty <= 0) delete data[id];
    else data[id] = qty;
    Cart.write(data);
  },
  remove(id) {
    const data = Cart.read();
    delete data[id];
    Cart.write(data);
  },
  clear() {
    Cart.write({});
  },
  totalCount() {
    const data = Cart.read();
    return Object.values(data).reduce((sum, q) => sum + q, 0);
  },
  getItems() {
    const data = Cart.read();
    return Object.entries(data)
      .map(([id, qty]) => {
        const product = PRODUCTS.find((p) => p.id === Number(id));
        if (!product) return null;
        return { ...product, qty };
      })
      .filter(Boolean);
  },
  getTotal() {
    return Cart.getItems().reduce((sum, item) => sum + item.price * item.qty, 0);
  },
  updateBadge() {
    document.querySelectorAll('[data-cart-badge]').forEach((el) => {
      const count = Cart.totalCount();
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  },
};

function formatPrice(n) {
  return n.toLocaleString('tr-TR') + ' ₺';
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M8 12.5l2.6 2.6L16.5 9"/></svg><span></span>';
    document.body.appendChild(toast);
  }
  toast.querySelector('span').textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function buildWhatsAppOrderText() {
  const items = Cart.getItems();
  const lines = [
    'Merhaba, aşağıdaki ürünler için sipariş vermek istiyorum:',
    '',
    ...items.map((it) => `• ${it.name} (${it.sku}) x${it.qty} — ${formatPrice(it.price * it.qty)}`),
    '',
    `Toplam: ${formatPrice(Cart.getTotal())}`,
  ];
  return encodeURIComponent(lines.join('\n'));
}

function cartRowHTML(item) {
  const thumbHTML = item.image
    ? `<div class="cart-row__thumb cart-row__thumb--img"><img src="${item.image}" alt="${item.name}" loading="lazy" width="64" height="64"></div>`
    : `<div class="img-placeholder img-placeholder--square cart-row__thumb" data-label=""></div>`;
  return `
    <tr class="cart-row" data-row="${item.id}">
      <td>
        <div class="cart-row__product">
          ${thumbHTML}
          <div>
            <div class="cart-row__name">${item.name}</div>
            <div class="cart-row__sku">Stok Kodu: ${item.sku}</div>
          </div>
        </div>
      </td>
      <td>${formatPrice(item.price)}</td>
      <td>
        <div class="qty-control">
          <button type="button" data-qty-dec="${item.id}" aria-label="Azalt">−</button>
          <input type="text" value="${item.qty}" data-qty-input="${item.id}" inputmode="numeric" aria-label="Adet">
          <button type="button" data-qty-inc="${item.id}" aria-label="Artır">+</button>
        </div>
      </td>
      <td class="cart-row__price">${formatPrice(item.price * item.qty)}</td>
      <td><button type="button" class="cart-row__remove" data-remove="${item.id}">Kaldır</button></td>
    </tr>`;
}

function renderCartPage() {
  const container = document.getElementById('cartContent');
  if (!container) return;

  const items = Cart.getItems();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
        <p>Sepetiniz şu anda boş.</p>
        <a href="index.html" class="btn btn--red" style="margin-top:16px;display:inline-flex">Alışverişe Başla</a>
      </div>`;
    return;
  }

  const total = Cart.getTotal();
  const shipping = total >= 1500 ? 0 : 89;

  container.innerHTML = `
    <div class="cart-layout">
      <div>
        <table class="cart-table">
          <thead><tr><th>Ürün</th><th>Fiyat</th><th>Adet</th><th>Ara Toplam</th><th></th></tr></thead>
          <tbody>${items.map(cartRowHTML).join('')}</tbody>
        </table>
      </div>
      <aside class="cart-summary">
        <h3>Sipariş Özeti</h3>
        <div class="cart-summary__row"><span>Ürün Toplamı</span><span>${formatPrice(total)}</span></div>
        <div class="cart-summary__row"><span>Kargo</span><span>${shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}</span></div>
        <div class="cart-summary__row cart-summary__row--total"><span>Genel Toplam</span><span>${formatPrice(total + shipping)}</span></div>
        <a href="#" class="btn btn--red btn--block btn--lg" style="margin-top:16px" id="waOrderBtn">
          <svg class="icon" style="width:18px;height:18px"><use href="#ic-whatsapp"/></svg> WhatsApp ile Sipariş Ver
        </a>
        <button type="button" class="btn btn--outline btn--block" style="margin-top:10px" id="clearCartBtn">Sepeti Temizle</button>
      </aside>
    </div>`;

  container.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => { Cart.remove(Number(btn.dataset.remove)); renderCartPage(); });
  });
  container.querySelectorAll('[data-qty-inc]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.qtyInc);
      const current = Cart.read()[id] || 0;
      Cart.setQty(id, current + 1);
      renderCartPage();
    });
  });
  container.querySelectorAll('[data-qty-dec]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.qtyDec);
      const current = Cart.read()[id] || 0;
      Cart.setQty(id, current - 1);
      renderCartPage();
    });
  });
  container.querySelectorAll('[data-qty-input]').forEach((input) => {
    input.addEventListener('change', () => {
      const id = Number(input.dataset.qtyInput);
      const qty = Math.max(0, parseInt(input.value, 10) || 0);
      Cart.setQty(id, qty);
      renderCartPage();
    });
  });

  const waBtn = document.getElementById('waOrderBtn');
  if (waBtn) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const number = WHATSAPP_NUMBER || '';
      const url = `https://wa.me/${number}?text=${buildWhatsAppOrderText()}`;
      window.open(url, '_blank', 'noopener');
    });
  }
  const clearBtn = document.getElementById('clearCartBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => { Cart.clear(); renderCartPage(); });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  Cart.updateBadge();
  renderCartPage();
});
