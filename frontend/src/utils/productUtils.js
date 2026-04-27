/**
 * Retorna todas as categorias únicas incluidas no catálogo de produtos.
 */
export function getProductCategories(products) {
  return ['Todos', ...new Set(products.map((product) => product.category))];
}

/**
 * Retorna o produto com o id correspondente.
 */
export function getProductById(products, productId) {
  return products.find((product) => product.id === productId) ?? null;
}

/**
 * Retorna produtos relacionados pela mesma categoria, excluindo o produto atual.
 */
export function getRelatedProducts(products, currentProduct, limit = 4) {
  if (!currentProduct) {
    return [];
  }

  return products
    .filter((product) => product.category === currentProduct.category && product.id !== currentProduct.id)
    .slice(0, limit);
}

/**
 * Converte string de preço para número.
 */
export function parsePrice(priceString) {
  return parseFloat(priceString.replace('R$ ', '').replace(',', '.'));
}

/**
 * Ordena produtos por preço.
 */
export function sortProductsByPrice(products, ascending) {
  return [...products].sort((a, b) => {
    const priceA = a.preco_venda || 0;
    const priceB = b.preco_venda || 0;
    return ascending ? priceA - priceB : priceB - priceA;
  });
}

/**
 * Filtra produtos por intervalo de preço.
 */
export function filterProductsByPrice(products, min, max) {
  return products.filter((product) => {
    const price = parsePrice(product.price);
    return price >= min && price <= max;
  });
}

/**
 * Filtra produtos por categoria, termo de busca e preço.
 */
export function filterProducts(products, selectedCategory, searchTerm, minPrice, maxPrice) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return products.filter((product) => {
    const categoryMatches = selectedCategory === 'Todos' || product.category === selectedCategory;
    const searchMatches = product.name.toLowerCase().includes(normalizedSearch);
    const price = parsePrice(product.price);
    const priceMatches = price >= minPrice && price <= maxPrice;
    return categoryMatches && searchMatches && priceMatches;
  });
}
