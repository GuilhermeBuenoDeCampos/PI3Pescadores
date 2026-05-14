/**
 * Formata o preço para exibição.
 */
export function formatPrice(preco) {
  const v = preco === undefined || preco === null ? null : Number(preco);
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
}

/**
 * Ordena produtos por preço.
 */
export function sortProductsByPrice(products, ascending) {
  return [...products].sort((a, b) => {
    const priceA = Number(a.preco_venda || 0);
    const priceB = Number(b.preco_venda || 0);
    return ascending ? priceA - priceB : priceB - priceA;
  });
}
