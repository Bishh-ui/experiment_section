document.addEventListener('DOMContentLoaded', () => {
  // Enhance clickable cards with depth hover
  document.querySelectorAll('.card, .product-item, .collection-item, .feedback-card').forEach((el, idx) => {
    el.style.setProperty('--card-index', idx);
  });

  // Generic product filter per filter-bar
  document.querySelectorAll('.filter-bar').forEach(bar => {
    const search = bar.querySelector('input[type="search"]');
    const catButtons = Array.from(bar.querySelectorAll('.cat-btn'));
    const sortSelect = bar.querySelector('select');

    // Find product grid in the same section or next sibling
    let grid = bar.closest('section')?.querySelector('.product-grid') || bar.parentElement.querySelector('.product-grid') || document.querySelector('.product-grid');
    if (!grid) return;

    function getActiveCategory() {
      const active = bar.querySelector('.cat-btn.active');
      return active ? active.dataset.cat : 'all';
    }

    function filterProducts() {
      const q = (search && search.value.trim().toLowerCase()) || '';
      const activeCat = getActiveCategory();
      const items = Array.from(grid.querySelectorAll('.product-item'));

      items.forEach(item => {
        const name = (item.dataset.name || '').toLowerCase();
        const cat = (item.dataset.category || '').toLowerCase();

        const matchesQuery = !q || name.includes(q) || cat.includes(q);
        const matchesCat = activeCat === 'all' || cat === activeCat.toLowerCase();

        item.style.display = (matchesQuery && matchesCat) ? '' : 'none';
      });

      applySort();
    }

    function applySort() {
      if (!sortSelect) return;
      const mode = sortSelect.value;
      const items = Array.from(grid.querySelectorAll('.product-item'));
      const visible = items.filter(i => i.style.display !== 'none');
      const hidden = items.filter(i => i.style.display === 'none');

      if (mode === 'price-asc') {
        visible.sort((a, b) => (parseFloat(a.dataset.price) || 0) - (parseFloat(b.dataset.price) || 0));
      } else if (mode === 'price-desc') {
        visible.sort((a, b) => (parseFloat(b.dataset.price) || 0) - (parseFloat(a.dataset.price) || 0));
      }

      visible.forEach(i => grid.appendChild(i));
      hidden.forEach(i => grid.appendChild(i));
    }

    // Events
    if (search) search.addEventListener('input', () => filterProducts());
    catButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        catButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        filterProducts();
      });
    });
    if (sortSelect) sortSelect.addEventListener('change', () => applySort());

    // Init
    filterProducts();
  });

  // Add reveal on scroll for product items and cards
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.product-item, .card, .fashion-card, .collection-item, .feedback-card').forEach(el => {
    observer.observe(el);
  });

  // --- Shopping cart + modal enhancements ---
  const cart = { items: JSON.parse(localStorage.getItem('cart_items') || '[]') };

  // create cart icon in navbar (if not present)
  function ensureCartIcon() {
    if (document.querySelector('.cart-icon')) return document.querySelector('.cart-icon');
    const nav = document.querySelector('header .navbar') || document.querySelector('header');
    if (!nav) return null;
    const container = document.createElement('div');
    container.className = 'cart-icon';
    container.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h15l-1.5 9h-12L4 2H2" stroke="white" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="20" r="1" fill="white"/><circle cx="18" cy="20" r="1" fill="white"/></svg>
      <div class="cart-badge">0</div>
    `;
    nav.appendChild(container);
    container.addEventListener('click', openCartModal);
    return container;
  }

  const cartIcon = ensureCartIcon();
  function updateBadge() {
    if (!cartIcon) return;
    const badge = cartIcon.querySelector('.cart-badge');
    badge.textContent = cart.items.length || 0;
  }
  updateBadge();

  // product modal with carousel
  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.innerHTML = `
    <button class="modal-close">✕</button>
    <div class="modal-card">
      <div style="display:flex;gap:20px;align-items:flex-start;">
        <div>
          <div class="modal-carousel">
            <div class="carousel-controls">
              <button class="prev">‹</button>
              <button class="next">›</button>
            </div>
            <div class="slides"></div>
          </div>
          <div class="carousel-thumbs"></div>
        </div>

        <div class="meta">
          <h3 class="m-title"></h3>
          <p class="m-price"></p>
          <p class="m-desc"></p>
          <p class="m-sku"></p>
          <div style="margin-top:12px;display:flex;gap:8px;align-items:center;">
            <label>Size:</label>
            <select class="m-size"><option>XS</option><option>S</option><option>M</option><option>L</option><option>XL</option></select>
          </div>
          <div style="margin-top:12px;"><button class="add-btn m-add">Add to cart</button></div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('.modal-close').addEventListener('click', () => modal.classList.remove('open'));

  // carousel helpers
  function buildCarousel(images) {
    const slides = modal.querySelector('.slides');
    const thumbs = modal.querySelector('.carousel-thumbs');
    slides.innerHTML = '';
    thumbs.innerHTML = '';
    images.forEach((src, i) => {
      const s = document.createElement('div'); s.className = 'slide' + (i===0? ' active':'');
      const img = document.createElement('img'); img.src = src; s.appendChild(img);
      slides.appendChild(s);

      const t = document.createElement('img'); t.src = src; if(i===0) t.classList.add('active');
      t.addEventListener('click', () => setSlide(i));
      thumbs.appendChild(t);
    });

    modal.querySelector('.prev').onclick = () => shiftSlide(-1);
    modal.querySelector('.next').onclick = () => shiftSlide(1);
    modal._current = 0;
    function setSlide(n) {
      const all = slides.querySelectorAll('.slide');
      const th = thumbs.querySelectorAll('img');
      all.forEach((sl, idx) => sl.classList.toggle('active', idx===n));
      th.forEach((tt, idx) => tt.classList.toggle('active', idx===n));
      modal._current = n;
    }
    function shiftSlide(delta) {
      const count = images.length;
      setSlide((modal._current + delta + count) % count);
    }
    modal.setSlide = setSlide;
    modal.shiftSlide = shiftSlide;
  }

  function openModalFromItem(item) {
    const rawImgs = item.dataset.images || item.querySelector('img')?.src || '';
    const images = rawImgs.split(',').map(s => s.trim()).filter(Boolean);
    const name = item.dataset.name || item.querySelector('h3,h4')?.textContent || 'Product';
    const price = item.dataset.price ? (item.dataset.price[0] === '$' ? item.dataset.price : '$' + item.dataset.price) : '';
    const desc = item.dataset.desc || '';
    const sku = item.dataset.sku || '';

    buildCarousel(images.length ? images : [item.querySelector('img')?.src || '']);
    modal.querySelector('.m-title').textContent = name;
    modal.querySelector('.m-price').textContent = price;
    modal.querySelector('.m-desc').textContent = desc;
    modal.querySelector('.m-sku').textContent = sku ? 'SKU: ' + sku : '';
    modal.classList.add('open');

    const addBtn = modal.querySelector('.m-add');
    addBtn.style.display = '';
    addBtn.onclick = () => {
      const size = modal.querySelector('.m-size').value;
      addToCart({ name, price: parseFloat((item.dataset.price || '0')), img: images[0] || item.querySelector('img')?.src || '', sku, size });
      modal.classList.remove('open');
      animateFly(item.querySelector('img'));
      renderCart();
    };
  }

  // add-to-cart state
  // CART: maintain quantities, render drawer
  function addToCart(product) {
    const existing = cart.items.find(i => i.sku === product.sku && i.size === product.size && i.name === product.name);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.items.push(Object.assign({ qty: 1 }, product));
    localStorage.setItem('cart_items', JSON.stringify(cart.items));
    updateBadge();
    renderCart();
  }

  // cart drawer element
  const drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <h3>Shopping Cart</h3>
    <div class="cart-list"></div>
    <div class="cart-footer">
      <div class="cart-sub">Subtotal: <span class="sub-amt">$0</span></div>
      <button class="checkout-btn">Checkout</button>
    </div>
  `;
  document.body.appendChild(drawer);

  function openCartModal() { drawer.classList.add('open'); }
  function closeCart() { drawer.classList.remove('open'); }

  function renderCart() {
    const list = drawer.querySelector('.cart-list');
    list.innerHTML = '';
    let total = 0;
    cart.items.forEach((it, idx) => {
      total += (parseFloat(it.price || 0) || 0) * (it.qty || 1);
      const row = document.createElement('div'); row.className = 'cart-item';
      row.innerHTML = `
        <img src="${it.img || ''}" alt="${it.name}">
        <div style="flex:1">
          <div style="font-weight:700">${it.name}</div>
          <div style="color:#bbb;font-size:13px">${it.sku || ''} ${it.size? '- ' + it.size : ''}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800">$${it.price}</div>
          <div class="qty-control">
            <button data-idx="${idx}" class="dec">-</button>
            <span>${it.qty}</span>
            <button data-idx="${idx}" class="inc">+</button>
          </div>
          <div><button data-idx="${idx}" class="remove" style="margin-top:8px;background:transparent;border:none;color:#ff6b6b;cursor:pointer">Remove</button></div>
        </div>
      `;
      list.appendChild(row);
    });
    drawer.querySelector('.sub-amt').textContent = '$' + total.toFixed(2);
    updateBadge();

    // attach controls
    drawer.querySelectorAll('.inc').forEach(btn => btn.addEventListener('click', (e) => {
      const i = +e.currentTarget.dataset.idx; cart.items[i].qty = (cart.items[i].qty||1) + 1; localStorage.setItem('cart_items', JSON.stringify(cart.items)); renderCart();
    }));
    drawer.querySelectorAll('.dec').forEach(btn => btn.addEventListener('click', (e) => {
      const i = +e.currentTarget.dataset.idx; cart.items[i].qty = Math.max(1, (cart.items[i].qty||1) - 1); localStorage.setItem('cart_items', JSON.stringify(cart.items)); renderCart();
    }));
    drawer.querySelectorAll('.remove').forEach(btn => btn.addEventListener('click', (e) => {
      const i = +e.currentTarget.dataset.idx; cart.items.splice(i,1); localStorage.setItem('cart_items', JSON.stringify(cart.items)); renderCart();
    }));
  }

  // init render
  renderCart();

  // flying image animation
  function animateFly(imgEl) {
    if (!imgEl || !cartIcon) return;
    const fly = imgEl.cloneNode(true);
    fly.className = 'fly-image';
    const rect = imgEl.getBoundingClientRect();
    fly.style.left = rect.left + 'px';
    fly.style.top = rect.top + 'px';
    fly.style.width = rect.width + 'px';
    fly.style.height = rect.height + 'px';
    document.body.appendChild(fly);

    const target = cartIcon.getBoundingClientRect();
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${target.left - rect.left}px, ${target.top - rect.top}px) scale(0.2)`;
      fly.style.opacity = '0.6';
    });

    setTimeout(() => { fly.remove(); updateBadge(); }, 900);
  }

  // add add-to-cart buttons to each product-item if not present
  document.querySelectorAll('.product-item').forEach(item => {
    if (!item.querySelector('.add-btn')) {
      const btn = document.createElement('button');
      btn.className = 'add-btn';
      btn.textContent = 'Add to cart';
      item.appendChild(btn);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const name = item.dataset.name || item.querySelector('h3,h4')?.textContent || 'Product';
        addToCart({ name, price: parseFloat(item.dataset.price || '0'), img: item.querySelector('img')?.src || '' });
        animateFly(item.querySelector('img'));
      });
    }

    // click on item opens modal with details
    item.addEventListener('click', () => openModalFromItem(item));
  });
});
