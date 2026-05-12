/**
 * Formata o preço para exibição.
 */
export function formatPrice(preco) {
  const v = preco === undefined || preco === null ? null : Number(preco);
  return Number.isFinite(v) ? v.toFixed(2) : '0.00';
}

/**
 * Retorna todas as categorias únicas incluidas no catálogo de produtos.
 */
export function getProductCategories(products) {
  return [
    'Todos',
    ...new Set(
      products
        .map((product) => product.categoria?.nome || product.category)
        .filter(Boolean)
    ),
  ];
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
    .filter((product) => {
      const productCategory = product.categoria?.nome || product.category;
      const currentCategory = currentProduct.categoria?.nome || currentProduct.category;
      return productCategory === currentCategory && product.id !== currentProduct.id;
    })
    .slice(0, limit);
}

/**
 * Converte string de preço para número.
 */
export function parsePrice(priceString) {
  if (priceString === null || priceString === undefined || priceString === '') {
    return 0;
  }

  if (typeof priceString === 'number') {
    return Number.isFinite(priceString) ? priceString : 0;
  }

  const parsed = Number(String(priceString).replace('R$ ', '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
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

/**
 * Filtra produtos por intervalo de preço.
 */
export function filterProductsByPrice(products, min, max) {
  return products.filter((product) => {
    const price = parsePrice(product.preco_venda ?? product.price);
    return price >= min && price <= max;
  });
}

/**
 * Filtra produtos por categoria, termo de busca e preço.
 */
export function filterProducts(products, selectedCategory, searchTerm, minPrice, maxPrice) {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  return products.filter((product) => {
    const category = product.categoria?.nome || product.category;
    const name = product.nome || product.name || '';
    const categoryMatches = selectedCategory === 'Todos' || category === selectedCategory;
    const searchMatches = name.toLowerCase().includes(normalizedSearch);
    const price = parsePrice(product.preco_venda ?? product.price);
    const priceMatches = price >= minPrice && price <= maxPrice;
    return categoryMatches && searchMatches && priceMatches;
  });
}
