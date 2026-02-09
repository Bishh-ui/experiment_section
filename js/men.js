document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('search');
  const catButtons = Array.from(document.querySelectorAll('.cat-btn'));
  const sortSelect = document.getElementById('sort');
  const grid = document.getElementById('productGrid');
  const sizeChecks = Array.from(document.querySelectorAll('.sizes input[type="checkbox"]'));
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');

  function getActiveCategory() {
    const active = document.querySelector('.cat-btn.active');
    return active ? active.dataset.cat : 'all';
  }

  function filterProducts() {
    const q = searchInput.value.trim().toLowerCase();
    const activeCat = getActiveCategory();
    const items = Array.from(grid.querySelectorAll('.product-item'));
    const activeSizes = sizeChecks.filter(c => c.checked).map(c => c.value);
    const maxPrice = priceRange ? parseFloat(priceRange.value) : Infinity;

    items.forEach(item => {
      const name = (item.dataset.name || '').toLowerCase();
      const cat = item.dataset.category || '';
      const price = parseFloat(item.dataset.price) || 0;

      const matchesQuery = !q || name.includes(q) || cat.toLowerCase().includes(q);
      const matchesCat = activeCat === 'all' || cat === activeCat;
      const priceOk = price <= maxPrice;
      let sizeOk = true;
      if (activeSizes.length) {
        const sizes = (item.dataset.sizes || '').split(',').map(s => s.trim());
        sizeOk = activeSizes.some(sz => sizes.includes(sz));
      }

      item.style.display = (matchesQuery && matchesCat && priceOk && sizeOk) ? '' : 'none';
    });

    // After filtering, apply sorting to visible items
    applySort();
  }

  function applySort() {
    const mode = sortSelect.value;
    const items = Array.from(grid.querySelectorAll('.product-item'));
    const visible = items.filter(i => i.style.display !== 'none');
    const hidden = items.filter(i => i.style.display === 'none');

    if (mode === 'price-asc') {
      visible.sort((a, b) => (parseFloat(a.dataset.price) || 0) - (parseFloat(b.dataset.price) || 0));
    } else if (mode === 'price-desc') {
      visible.sort((a, b) => (parseFloat(b.dataset.price) || 0) - (parseFloat(a.dataset.price) || 0));
    }

    // Re-append in order: visible first, then hidden (so hidden remain out of view)
    visible.forEach(i => grid.appendChild(i));
    hidden.forEach(i => grid.appendChild(i));
  }

  // Events
  searchInput.addEventListener('input', () => filterProducts());

  if (priceRange) {
    priceRange.addEventListener('input', () => { if (priceValue) priceValue.textContent = priceRange.value; filterProducts(); });
  }

  sizeChecks.forEach(ch => ch.addEventListener('change', () => filterProducts()));

  catButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      catButtons.forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      filterProducts();
    });
  });

  sortSelect.addEventListener('change', () => applySort());

  // Initial layout
  filterProducts();
});
