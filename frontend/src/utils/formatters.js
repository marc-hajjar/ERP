export function formatCurrency(amount, currency = 'USD') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function statusBadgeClass(status) {
  const map = {
    active:'badge-green', planning:'badge-blue', completed:'badge-purple', on_hold:'badge-yellow', cancelled:'badge-red',
    paid:'badge-green', unpaid:'badge-yellow', partial:'badge-blue', overdue:'badge-red',
    new:'badge-blue', contacted:'badge-orange', qualified:'badge-purple', lost:'badge-red', converted:'badge-green',
    draft:'badge-gray', sent:'badge-blue', accepted:'badge-green', rejected:'badge-red',
    available:'badge-green', on_project:'badge-orange', off:'badge-gray',
  };
  return map[status] || 'badge-gray';
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}