export function getStoredCustomer() {
  const saved = localStorage.getItem('bharatmart-customer');
  return saved ? JSON.parse(saved) : null;
}

export function setStoredCustomer(user, token) {
  if (token) localStorage.setItem('bharatmart-customer-token', token);
  localStorage.setItem('bharatmart-customer', JSON.stringify(user));
  window.dispatchEvent(new Event('bharatmart-customer-change'));
}

export function clearStoredCustomer() {
  localStorage.removeItem('bharatmart-customer-token');
  localStorage.removeItem('bharatmart-customer');
  window.dispatchEvent(new Event('bharatmart-customer-change'));
}

export function getTrackingLabel(status) {
  if (status === 'Delivered') return 'Delivered';
  if (status === 'Shipped') return 'Shipped';
  return 'Order packed';
}

export function getTrackingColor(status) {
  if (status === 'Delivered') return 'bg-emerald-100 text-emerald-700';
  if (status === 'Shipped') return 'bg-blue-100 text-blue-700';
  return 'bg-orange-100 text-orange-700';
}
