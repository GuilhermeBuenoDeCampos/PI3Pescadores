/**
 * API Configuration & Utilities
 * 
 * Gerencia todas as chamadas HTTP para o backend
 * Centraliza a URL base para facilitar mudanças entre dev/produção
 * 
 * IMPORTANTE: Para produção, configurar VITE_BACKEND_URL no .env
 * Exemplo .env:
 * - DEV: VITE_BACKEND_URL=http://localhost:3000
 * - PROD: VITE_BACKEND_URL=https://api.seudominio.com
 */

// URL base do backend - Configurável via variáveis de ambiente
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const API_URL = `${BACKEND_URL}/api`;

/**
 * Constrói URL completa para imagens
 * Lida com três casos:
 * 1. URL vazia/null → retorna vazio
 * 2. URL completa (http/https) → retorna como está
 * 3. Caminho relativo → prepende BACKEND_URL
 * 
 * Exemplo:
 * getImageUrl('/uploads/Banner/imagem.jpg') 
 * → 'http://localhost:3000/uploads/Banner/imagem.jpg'
 * 
 * @param {string} url - URL ou caminho da imagem
 * @returns {string} URL completa da imagem
 */
export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  // ensure we don't accidentally join without a slash: handle 'uploads/img.jpg' and '/uploads/img.jpg'
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${normalized}`;
}


/**
 * Busca produtos com filtros opcionais
 * 
 * @param {Object} filters - Filtros (category, active, etc)
 * @returns {Promise<Array>} Lista de produtos
 * @throws {Error} Se falhar requisição
 */
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


/**
 * Busca um produto específico por ID
 * 
 * @param {string|number} id - ID do produto
 * @returns {Promise<Object>} Dados do produto
 * @throws {Error} Se falhar requisição
 */
export async function fetchProductById(id) {
  const response = await fetch(`${API_URL}/produtos/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Busca um produto específico pelo nome (slug)
 * 
 * @param {string} nome - Nome/slug do produto
 * @returns {Promise<Object>} Dados do produto
 * @throws {Error} Se falhar requisição ou produto não encontrado
 */
export async function fetchProductByName(nome) {
  const response = await fetch(`${API_URL}/produtos/nome/${encodeURIComponent(nome)}`);
  
  if (!response.ok) {
    throw new Error(`Produto não encontrado: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}


/**
 * Busca todas as categorias de produtos
 * 
 * @returns {Promise<Array>} Lista de categorias
 * @throws {Error} Se falhar requisição
 */
export async function fetchCategories() {
  const response = await fetch(`${API_URL}/categorias`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Atualiza o status ativo de um produto
 * 
 * @param {string|number} id - ID do produto
 * @param {boolean} ativo - Novo valor para ativo
 * @returns {Promise<Object>} Dados do produto atualizado
 * @throws {Error} Se falhar requisição
 */
export async function updateProductStatus(id, ativo) {
  const response = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ativo })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update product status: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}
