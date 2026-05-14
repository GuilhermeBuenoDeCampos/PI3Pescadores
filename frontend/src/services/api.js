// Centraliza o contrato HTTP usado pelo frontend.
// Para trocar backend em produção, defina VITE_BACKEND_URL sem barra final.
export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000').replace(/\/+$/, '');

const API_URL = `${BACKEND_URL}/api`;

async function parseApiError(response, fallbackMessage) {
  try {
    const body = await response.json();
    return body?.error?.message || body?.message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${BACKEND_URL}${normalized}`;
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
    throw new Error(await parseApiError(response, `Failed to fetch products: ${response.statusText}`));
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
    throw new Error(await parseApiError(response, `Failed to fetch product: ${response.statusText}`));
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
    throw new Error(await parseApiError(response, `Produto não encontrado: ${response.statusText}`));
  }

  const result = await response.json();
  return result.data;
}

/**
 * Busca 5 produtos aleatórios para auditoria
 * 
 * @returns {Promise<Array>} Lista de 5 produtos aleatórios
 * @throws {Error} Se falhar requisição
 */
export async function fetchProdutosAleatorios() {
  const response = await fetch(`${API_URL}/auditoria/aleatorios`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch random products: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Salva registros de auditoria de estoque
 * 
 * @param {Array} auditorias - Array com dados de auditoria
 * @returns {Promise<Object>} Resultado da operação
 * @throws {Error} Se falhar requisição
 */
export async function salvarAuditoria(auditorias) {
  const response = await fetch(`${API_URL}/auditoria/salvar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auditorias })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to save audit: ${response.statusText}`);
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
    throw new Error(await parseApiError(response, `Failed to fetch categories: ${response.statusText}`));
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
    throw new Error(await parseApiError(response, `Failed to update product status: ${response.statusText}`));
  }

  const result = await response.json();
  return result.data;
}
