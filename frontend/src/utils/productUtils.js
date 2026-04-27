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
 * Filtra produtos por categoria e termo de busca.
 */
export function filterProducts(products, selectedCategory, searchTerm) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return products.filter((product) => {
    const categoryMatches = selectedCategory === 'Todos' || product.category === selectedCategory;
    const searchMatches = product.name.toLowerCase().includes(normalizedSearch);
    return categoryMatches && searchMatches;
  });
}
