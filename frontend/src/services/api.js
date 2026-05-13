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
<<<<<<< HEAD
export const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL || 'https://pi3pescadores.onrender.com').replace(/\/+$/, '');
=======
// Determine BACKEND_URL like this:
// - If `VITE_BACKEND_URL` is set, use it (useful for production pointing to an external API).
// - If in dev mode (vite), default to localhost:3000 for local development convenience.
// - Otherwise (production and no VITE_BACKEND_URL), use a relative path so the app calls '/api' on same origin.
// Prefer runtime config (window.APP_CONFIG) when available so the backend URL can be changed
// without rebuilding the frontend. Falls back to Vite env or localhost in dev.
const runtimeBackend = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.VITE_BACKEND_URL)
  ? window.APP_CONFIG.VITE_BACKEND_URL
  : undefined;
>>>>>>> b4f6f0c (teste-hospedagem: runtime config, API safe parse, banner URLs)

export const BACKEND_URL = runtimeBackend ?? import.meta.env.VITE_BACKEND_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

export const API_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

// Helper: ensure response is JSON before parsing
async function parseJsonSafe(response){
  /* Central API utilities */

  // Prefer runtime config when available (deployed SPA can update config.json)
  const runtimeBackend = (typeof window !== 'undefined' && window.APP_CONFIG && window.APP_CONFIG.VITE_BACKEND_URL)
    ? String(window.APP_CONFIG.VITE_BACKEND_URL).replace(/\/+$/, '')
    : undefined;

  export const BACKEND_URL = runtimeBackend ?? (import.meta.env.VITE_BACKEND_URL ? String(import.meta.env.VITE_BACKEND_URL).replace(/\/+$/, '') : (import.meta.env.DEV ? 'http://localhost:3000' : ''));
  export const API_URL = BACKEND_URL ? `${BACKEND_URL.replace(/\/+$/, '')}/api` : '/api';

  async function parseJsonSafe(response) {
    const ct = response.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await response.text().catch(() => '');
      const snippet = String(text).slice(0, 200);
      throw new Error(`API returned non-JSON (status ${response.status}): ${snippet}`);
    }
    return response.json();
  }

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
    if (filters.category) params.append('id_categoria', filters.category);
    if (filters.active !== undefined) params.append('ativo', filters.active);
    const qs = params.toString();
    const url = qs ? `${API_URL}/produtos?${qs}` : `${API_URL}/produtos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(await parseApiError(res, `Failed to fetch products: ${res.statusText}`));
    const json = await parseJsonSafe(res);
    return json.data || [];
  }

  export async function fetchProductById(id) {
    const res = await fetch(`${API_URL}/produtos/${id}`);
    if (!res.ok) throw new Error(await parseApiError(res, `Failed to fetch product: ${res.statusText}`));
    const json = await parseJsonSafe(res);
    return json.data;
  }

  export async function fetchProductByName(nome) {
    const res = await fetch(`${API_URL}/produtos/nome/${encodeURIComponent(nome)}`);
    if (!res.ok) throw new Error(await parseApiError(res, `Produto não encontrado: ${res.statusText}`));
    const json = await parseJsonSafe(res);
    return json.data;
  }

  export async function fetchProdutosAleatorios() {
    const res = await fetch(`${API_URL}/auditoria/aleatorios`);
    if (!res.ok) throw new Error(await parseApiError(res, `Failed to fetch random products: ${res.statusText}`));
    const json = await parseJsonSafe(res);
    return json.data;
  }

  export async function salvarAuditoria(auditorias) {
    const res = await fetch(`${API_URL}/auditoria/salvar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auditorias }),
    });
    if (!res.ok) throw new Error(await parseApiError(res, 'Failed to save audit'));
    const json = await parseJsonSafe(res);
    return json.data;
  }

  export async function fetchHistoricoAuditoria(page = 1, limit = 10) {
    const res = await fetch(`${API_URL}/auditoria/historico?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error(await parseApiError(res, `Failed to fetch audit history: ${res.statusText}`));
    return parseJsonSafe(res);
  }

  export async function fetchCategories() {
    const res = await fetch(`${API_URL}/categorias`);
    if (!res.ok) throw new Error(await parseApiError(res, `Failed to fetch categories: ${res.statusText}`));
    const json = await parseJsonSafe(res);
    return json.data || [];
  }

  export async function updateProductStatus(id, ativo) {
    const res = await fetch(`${API_URL}/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo }),
    });
    if (!res.ok) throw new Error(await parseApiError(res, `Failed to update product status: ${res.statusText}`));
    const json = await parseJsonSafe(res);
    return json.data;
  }

  export async function fetchKpiAcuracidade(dataInicio, dataFim) {
    const params = new URLSearchParams();
    if (dataInicio) params.append('dataInicio', dataInicio);
    if (dataFim) params.append('dataFim', dataFim);
    const qs = params.toString();
    const url = qs ? `${API_URL}/auditoria/kpi/acuracidade?${qs}` : `${API_URL}/auditoria/kpi/acuracidade`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(await parseApiError(res, `Failed to fetch KPI accuracy: ${res.statusText}`));
    const json = await parseJsonSafe(res);
    return json.data;
  }
export async function fetchProdutosAleatorios() {
