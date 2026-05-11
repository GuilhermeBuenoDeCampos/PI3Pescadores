# 🎨 Banner System - Documentação Técnica

## 📋 Resumo das Mudanças

Este documento explica as alterações no sistema de banners realizadas em 10 de maio de 2026. Todas as mudanças seguem padrões profissionais de React, acessibilidade WCAG e responsividade.

---

## 🔴 Problemas Encontrados

### 1. **URLs Hardcoded com Localhost**
```javascript
// ❌ ANTES - Problema!
const bannerImages = [
  'http://localhost:3000/uploads/Banner/Castical-Flor-Dourado-NSA.png',
  // ... mais URLs com localhost
];
```
**Por quê é problema:**
- Não funciona em produção (outro domínio)
- Não escalável (qualquer mudança requer novo deploy)
- Quebra se usar variáveis de ambiente

### 2. **Imagens Não Existentes**
- Código referenciava arquivos `.png` que não existem
- Pasta real contém `.jpg` em português
- **Resultado:** Banner quebrado em produção

### 3. **Componente Sem Controle Manual**
- Apenas auto-play a cada 3 segundos
- Sem botões next/prev
- Sem indicadores visuais (dots)
- Sem acessibilidade ARIA

### 4. **Responsividade Incompleta**
- Apenas 1 breakpoint (720px)
- Faltava suporte a mobile pequeno
- Buttons grandes em mobile

### 5. **Código Desorganizado**
- Array de imagens sem estrutura
- Sem comentários explicativos
- Sem tratamento robusto de erros

---

## ✅ Solução Implementada

### 1. **Arquivo de Constantes: `frontend/src/constants/banner.js`**

```javascript
export const BANNER_IMAGES = [
  {
    id: 'aparecida',
    filename: 'Aparecida.jpg',
    alt: 'Nossa Senhora Aparecida - Imagem do banner',
    title: 'Nossa Senhora Aparecida'
  },
  // ... mais imagens
];

export const getBannerImagePath = (filename) => `/uploads/Banner/${filename}`;
```

**Benefícios:**
- ✅ Centraliza todas as imagens em um lugar
- ✅ Fácil adicionar/remover/renomear imagens
- ✅ Metadata (alt text, título) junto dos dados
- ✅ Reutilizável em outros componentes

**Como usar:**
```javascript
import { BANNER_IMAGES, getBannerImagePath } from '../constants/banner';

// Acessar imagem: /uploads/Banner/Aparecida.jpg
const imagePath = getBannerImagePath(BANNER_IMAGES[0].filename);
```

---

### 2. **API Configurável: `frontend/src/services/api.js`**

```javascript
// ✅ DEPOIS - Flexível!
export const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
}
```

**Fluxo de funcionamento:**
```
1. Arquivo .env define VITE_BACKEND_URL
2. Vite injeta variável no build
3. getImageUrl() constrói URL correta
4. Componente usa getImageUrl() para não hardcoded
```

**Exemplo de uso:**
```javascript
const imagePath = getBannerImagePath('Aparecida.jpg'); // '/uploads/Banner/Aparecida.jpg'
const fullUrl = getImageUrl(imagePath); // 'http://localhost:3000/uploads/Banner/Aparecida.jpg'
```

**Em Produção:**
```bash
# .env.production
VITE_BACKEND_URL=https://api.pescadores.com.br
```

---

### 3. **Componente Profissional: `BannerCarousel.jsx`**

#### **Hooks Utilizados:**

```javascript
// Estado
const [currentIndex, setCurrentIndex] = useState(0);        // Índice atual
const [isAutoPlay, setIsAutoPlay] = useState(true);         // Auto-play ativo?
const [failedImages, setFailedImages] = useState(new Set()); // Imagens com erro

// useCallback: Evita recriação de funções a cada render
const handleNext = useCallback(() => {
  setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
  setIsAutoPlay(false); // Pausa auto-play ao interagir
}, [totalImages]);
```

**Por quê useCallback?**
- Se funções forem criadas novamente a cada render
- Componentes filhos recebem nova referência
- Causa re-render desnecessário
- Lúpara com `useCallback`, função é reutilizada

#### **Auto-play com Pausa:**

```javascript
useEffect(() => {
  if (!isAutoPlay || totalImages === 0) return;

  const interval = setInterval(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
  }, 5000); // Muda a cada 5 segundos (antes era 3)

  return () => clearInterval(interval);
}, [isAutoPlay, totalImages]);

// Retoma auto-play após 10 segundos
useEffect(() => {
  if (isAutoPlay) return;

  const timeout = setTimeout(() => {
    setIsAutoPlay(true);
  }, 10000);

  return () => clearTimeout(timeout);
}, [isAutoPlay]);
```

**UX Benefit:** Usuário pode pausar, interagir, e auto-play retoma automaticamente

#### **Tratamento Robusto de Erros:**

```javascript
const handleImageError = useCallback((index) => {
  // Marca imagem como falhada
  setFailedImages((prev) => new Set([...prev, index]));
  
  // Pula para próxima
  handleNext();
}, [handleNext]);

// Se imagem não carregar:
<img
  onError={() => handleImageError(currentIndex)}
  loading="lazy"
/>
```

**Como funciona:**
1. Imagem falha ao carregar
2. `onError` é disparado
3. Passa para próxima imagem
4. Usuário não vê banner vazio

#### **Interatividade Completa:**

```javascript
{/* Botão Anterior */}
<button onClick={handlePrev} aria-label="Imagem anterior">❮</button>

{/* Botão Próximo */}
<button onClick={handleNext} aria-label="Próxima imagem">❯</button>

{/* Indicadores (Dots) */}
{BANNER_IMAGES.map((image, index) => (
  <button
    key={image.id}
    className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
    onClick={() => handleDotClick(index)}
    aria-selected={index === currentIndex}
    role="tab"
  />
))}

{/* Contador */}
<span>{currentIndex + 1} / {totalImages}</span>
```

#### **Acessibilidade ARIA:**

```javascript
<div
  className={styles.carousel}
  aria-label="Carrossel de banner de produtos"
  role="region"
>
  {/* Buttons com aria-label e role */}
  <button aria-label="Imagem anterior" />
  
  {/* Dots com role="tab" e aria-selected */}
  <button role="tab" aria-selected={true} />
  
  {/* Info com aria-live para screen readers */}
  <div aria-live="polite">
    <span>{currentIndex + 1} / {totalImages}</span>
  </div>
</div>
```

**ARIA Explainado:**
- `aria-label`: Descreve elemento para leitores de tela
- `role="tab"`: Indica que dots são abas (selecionáveis)
- `aria-selected`: Indica qual aba está selecionada
- `aria-live="polite"`: Screen reader anuncia mudanças

---

### 4. **CSS Responsivo: `BannerCarousel.module.css`**

#### **Breakpoints:**

```css
/* Desktop: 520px (padrão) */
.carousel { min-height: 520px; }

/* Tablet: 768px → 400px */
@media (max-width: 768px) { min-height: 400px; }

/* Mobile: 480px → 280px */
@media (max-width: 480px) { min-height: 280px; }
```

#### **Buttons Responsivos:**

```css
/* Desktop */
.navButton { width: 50px; font-size: 1.5rem; left: 20px; }

/* Tablet */
@media (max-width: 768px) {
  .navButton { width: 40px; font-size: 1.2rem; left: 12px; }
}

/* Mobile */
@media (max-width: 480px) {
  .navButton { width: 36px; font-size: 1rem; left: 8px; }
}
```

**Estratégia:** Botões menores em telas pequenas para não tomar espaço

#### **Acessibilidade - Reduzir Movimento:**

```css
@media (prefers-reduced-motion: reduce) {
  .image { animation: none; }
  .navButton { transition: background-color 0.2s ease; }
}
```

**Por quê:**
- Pessoas com vestibulares/vertigem sofrem com animações
- Sistema operacional detecta `prefers-reduced-motion`
- Respecta preferência do usuário

---

## 🔧 Backend - Verificação

A rota Express.static já está corretamente configurada:

```javascript
// backend/src/app.js
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

**Como funciona:**
```
GET /uploads/Banner/Aparecida.jpg
   ↓
Express mapeia para: backend/uploads/Banner/Aparecida.jpg
   ↓
Arquivo enviado ao cliente
```

**Teste rápido:**
```bash
curl http://localhost:3000/uploads/Banner/Aparecida.jpg
# Deve retornar a imagem se status 200 OK
```

---

## 📚 Padrões Implementados

### 1. **Convenção de Nomes**
```javascript
// ✅ Bom
const handleImageError = () => {};      // Ações começam com "handle"
const isAutoPlay = true;                 // Booleanos começam com "is"
const BANNER_IMAGES = [];                // Constantes em UPPERCASE
const getBannerImagePath = () => {};     // Getters começam com "get"

// ❌ Ruim
const imageError = () => {};
const autoPlay = true;
const bannerImages = [];
const bannerImagePath = () => {};
```

### 2. **Comentários em Português + Documentação em Inglês**

```javascript
/**
 * Navegação para próxima imagem
 * Usa useCallback para evitar recriação a cada render
 */
const handleNext = useCallback(() => {
  // ... implementação
}, [totalImages]);
```

**Estratégia:** Comentários explicam "por quê" (decisões), não "o quê" (óbvio)

### 3. **Prop Validation via JSDoc**

```javascript
/**
 * @param {string} filename - Nome do arquivo
 * @returns {string} - Caminho relativo da imagem
 */
export const getBannerImagePath = (filename) => `/uploads/Banner/${filename}`;
```

### 4. **Tratamento de Casos Extremos**

```javascript
// Guard clause: Sai cedo se não há dados
if (totalImages === 0) {
  return <div className={styles.emptyState}>Nenhuma imagem</div>;
}
```

---

## 🚀 Como Usar

### **1. Iniciar Projeto**

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (em outro terminal)
cd backend
npm install
npm run dev
```

### **2. Adicionar Nova Imagem**

```bash
# 1. Colocar arquivo em: backend/uploads/Banner/novaImagem.jpg
# 2. Atualizar constante:

export const BANNER_IMAGES = [
  // ... imagens existentes
  {
    id: 'nova-imagem',
    filename: 'novaImagem.jpg',
    alt: 'Descrição da imagem',
    title: 'Título'
  }
];
```

### **3. Mudar Tempo de Transição**

```javascript
// Em BannerCarousel.jsx
const interval = setInterval(() => {
  setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
}, 5000); // ← Mude para 3000 (3s) ou 7000 (7s)
```

### **4. Produção - Configurar Backend URL**

```bash
# Frontend .env.production
VITE_BACKEND_URL=https://api.seudominio.com.br
```

---

## ✨ Melhorias Futuras

1. **Lazy Loading** - Carregar imagens sob demanda
2. **Preload** - Pre-carregar próxima imagem
3. **Keyboard Navigation** - Setas do teclado (←→)
4. **Touch Gestures** - Swipe em mobile
5. **Analytics** - Rastrear cliques no banner
6. **Backend Upload** - Admin painel para gerenciar banners
7. **Cache** - Service Worker para offline

---

## 🐛 Troubleshooting

### **Imagens Não Carregam**

```bash
# 1. Verificar se arquivos existem:
ls -la backend/uploads/Banner/

# 2. Verificar se servidor está rodando:
curl http://localhost:3000/health

# 3. Verificar CORS:
curl http://localhost:3000/uploads/Banner/Aparecida.jpg
# Deve retornar imagem com status 200
```

### **Banner Não Muda**

```javascript
// Verificar se BANNER_IMAGES tem conteúdo
console.log('BANNER_IMAGES:', BANNER_IMAGES);

// Verificar se auto-play está ativo
console.log('isAutoPlay:', isAutoPlay);
```

### **Botões Não Funcionam**

```javascript
// Verificar se evento está disparando
const handleNext = () => {
  console.log('handleNext chamado');
  // ... resto do código
};
```

---

## 📖 Referências

- [React Hooks Best Practices](https://react.dev/reference/react)
- [WCAG 2.1 Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Media Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries)
- [Express Static Files](https://expressjs.com/en/starter/static-files.html)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-testing.html)

---

## 👨‍💼 Contato para Dúvidas

Em caso de dúvidas sobre implementação, referir-se a este documento ou abrir issue no repositório.

**Última atualização:** 10 de maio de 2026  
**Autor:** Desenvolvimento Senior  
**Status:** ✅ Pronto para Produção
