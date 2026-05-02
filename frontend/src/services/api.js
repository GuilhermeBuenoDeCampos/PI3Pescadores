export const BACKEND_URL = 'http://localhost:3000';
const API_URL = `${BACKEND_URL}/api`;

export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
}

export async function fetchProducts(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.category) {
    params.append('id_categoria', filters.category);
  }
  
  if (filters.active !== undefined) {
    params.append('ativo', filters.active);
  }

  const queryString = params.toString();
  const url = queryString ? `${API_URL}/produtos?${queryString}` : `${API_URL}/produtos`;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

export async function fetchProductById(id) {
  const response = await fetch(`${API_URL}/produtos/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

export async function fetchCategories() {
  const response = await fetch(`${API_URL}/categorias`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}
