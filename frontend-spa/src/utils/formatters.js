export function formatCurrency(price) {
  const numericPrice = Number(price);
  if (isNaN(numericPrice)) {
    return '';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  })
    .format(numericPrice)
    .replace('₫', 'VND');
}
