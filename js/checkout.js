document.addEventListener('DOMContentLoaded', () => {
  const orderList = document.getElementById('orderList');
  const subtotalEl = document.getElementById('subtotal');
  const totalEl = document.getElementById('total');
  const form = document.getElementById('checkoutForm');

  function loadCart() {
    return JSON.parse(localStorage.getItem('cart_items') || '[]');
  }

  function renderCart() {
    const items = loadCart();
    orderList.innerHTML = '';
    let subtotal = 0;
    if (!items.length) orderList.innerHTML = '<div>Your cart is empty.</div>';
    items.forEach(it => {
      const row = document.createElement('div');
      row.className = 'checkout-row';
      row.innerHTML = `<div style="display:flex;gap:12px;align-items:center;"><img src="${it.img||''}" style="width:56px;height:56px;object-fit:cover;border-radius:6px"><div><div style="font-weight:700">${it.name}</div><div style="font-size:13px;color:#bbb">${it.sku||''} ${it.size?'- '+it.size:''}</div></div></div><div style="font-weight:800">$${(it.price||0).toFixed(2)} x ${it.qty||1}</div>`;
      orderList.appendChild(row);
      subtotal += (parseFloat(it.price) || 0) * (it.qty || 1);
    });
    subtotalEl.textContent = '$' + subtotal.toFixed(2);
    totalEl.textContent = '$' + subtotal.toFixed(2);
    return { items: loadCart(), subtotal };
  }

  const cartState = renderCart();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!cartState.items.length) { alert('Your cart is empty. Add items before checkout.'); return; }
    const data = new FormData(form);
    const order = {
      id: 'ORD' + Date.now(),
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      address: data.get('address'),
      city: data.get('city'),
      zip: data.get('zip'),
      items: cartState.items,
      total: cartState.subtotal,
      createdAt: new Date().toISOString()
    };

    // simulate processing
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Processing...';
    setTimeout(() => {
      // save order
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order); localStorage.setItem('orders', JSON.stringify(orders));
      // clear cart
      localStorage.setItem('cart_items', JSON.stringify([]));
      // redirect to confirmation
      location.href = 'order-confirmation.html?orderId=' + encodeURIComponent(order.id);
    }, 900);
  });
});
