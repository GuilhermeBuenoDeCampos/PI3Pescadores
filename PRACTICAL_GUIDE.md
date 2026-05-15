# 🎯 Banner System - Guia Prático

## Exemplos de Uso Real

### 1️⃣ Usar o Banner em um Componente

```jsx
import BannerCarousel from './components/BannerCarousel';
import styles from './App.module.css';

function Home() {
  return (
    <div>
      <BannerCarousel />
      {/* Resto do conteúdo */}
    </div>
  );
}

export default Home;
```

**Simples assim!** O componente gerencia tudo internamente.

---

### 2️⃣ Acessar Dados das Imagens Manualmente

```jsx
import { BANNER_IMAGES, getBannerImagePath } from '../constants/banner';

function MyCustomComponent() {
  return (
    <div>
      {BANNER_IMAGES.map((image) => (
        <div key={image.id}>
          <img 
            src={getBannerImagePath(image.filename)} 
            alt={image.alt}
          />
          <p>{image.title}</p>
        </div>
      ))}
    </div>
  );
}

export default MyCustomComponent;
```

**Use case:** Gerar galeria de todas as imagens em página separada

---

### 3️⃣ Construir URL Completa para API

```jsx
import { getImageUrl } from '../services/api';

function ProductCard({ product }) {
  const imageUrl = getImageUrl(product.imagePath);
  
  return (
    <img src={imageUrl} alt={product.name} />
  );
}

export default ProductCard;
```

**Como funciona:**
```javascript
// Input
getImageUrl('/uploads/products/produto1.jpg')

// Output (dev)
'https://pi3pescadores.onrender.com/uploads/products/produto1.jpg'

// Output (prod)
'https://api.pescadores.com/uploads/products/produto1.jpg'
```

---

### 4️⃣ Adicionar Nova Imagem ao Banner

**Passo 1:** Coloque arquivo em `backend/uploads/Banner/`

```bash
backend/uploads/Banner/
├── Aparecida.jpg
├── barco.jpg
└── minha-nova-imagem.jpg  ← Novo!
```

**Passo 2:** Atualize constantes

```javascript
// frontend/src/constants/banner.js
export const BANNER_IMAGES = [
  {
    id: 'aparecida',
    filename: 'Aparecida.jpg',
    alt: 'Nossa Senhora Aparecida',
    title: 'Nossa Senhora Aparecida'
  },
  // ... outras
  {
    id: 'minha-imagem',
    filename: 'minha-nova-imagem.jpg',
    alt: 'Descrição da minha imagem',
    title: 'Título da Imagem'
  }
];
```

**Pronto!** Imagem aparece automaticamente no carousel.

---

### 5️⃣ Testar Diferentes Tempos de Transição

```jsx
// Em BannerCarousel.jsx, procure por:

useEffect(() => {
  if (!isAutoPlay || totalImages === 0) return;

  const interval = setInterval(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
  }, 5000); // ← AQUI! Mude este número
            // 3000 = 3 segundos (rápido)
            // 5000 = 5 segundos (padrão)
            // 8000 = 8 segundos (lento)

  return () => clearInterval(interval);
}, [isAutoPlay, totalImages]);
```

---

### 6️⃣ Personalizar Estilos do Banner

```css
/* frontend/src/components/BannerCarousel.module.css */

/* Mudar cor de fundo em caso de erro */
.carousel {
  background: linear-gradient(135deg, #00d4ff, #0099cc);
}

/* Mudar cor dos botões */
.navButton {
  background: rgba(255, 255, 255, 0.5); /* ← Ajuste opacity */
}

.navButton:hover {
  background: rgba(255, 255, 255, 0.8); /* ← Hover color */
}

/* Mudar cor dos dots */
.dot {
  background: rgba(255, 255, 255, 0.5);
}

.dot.active {
  background: rgba(255, 200, 50, 1); /* Dourado ao invés de branco */
}

/* Mudar tamanho dos botões */
.navButton {
  width: 60px;  /* De 50px para 60px */
  height: 60px;
  font-size: 1.8rem;
}
```

---

### 7️⃣ Integrar com Sistema de Admin (Exemplo)

```jsx
// admin/pages/BannerManagement.jsx
import { BANNER_IMAGES, getBannerImagePath } from '../../constants/banner';

function BannerManagement() {
  const [banners, setBanners] = useState(BANNER_IMAGES);

  const handleDelete = (id) => {
    // Remover do state
    setBanners((prev) => prev.filter((b) => b.id !== id));
    
    // Depois enviar para backend para persistir
  };

  const handleReorder = (newOrder) => {
    setBanners(newOrder);
    // Persistir no backend
  };

  return (
    <div>
      <h1>Gerenciar Banners</h1>
      
      {banners.map((banner, index) => (
        <div key={banner.id} className={styles.bannerItem}>
          <img 
            src={getBannerImagePath(banner.filename)} 
            alt={banner.alt}
          />
          <div>
            <p>{banner.title}</p>
            <button onClick={() => handleDelete(banner.id)}>
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BannerManagement;
```

---

### 8️⃣ Troubleshooting com Console

```javascript
// Abra DevTools (F12) e rode no console:

// Verificar imagens carregadas
import { BANNER_IMAGES } from './src/constants/banner.js';
console.table(BANNER_IMAGES);

// Testar URL
import { getImageUrl } from './src/services/api.js';
console.log(getImageUrl('/uploads/Banner/Aparecida.jpg'));

// Verificar BACKEND_URL
import { BACKEND_URL } from './src/services/api.js';
console.log('BACKEND_URL:', BACKEND_URL);
```

---

### 9️⃣ Configurar Variáveis de Ambiente

**Dev - `frontend/.env`**
```
VITE_BACKEND_URL=https://pi3pescadores.onrender.com
VITE_DEBUG=true
```

**Prod - `frontend/.env.production`**
```
VITE_BACKEND_URL=https://api.pescadores.com.br
VITE_DEBUG=false
```

**Para usar em código:**
```javascript
const backendUrl = import.meta.env.VITE_BACKEND_URL;
const debug = import.meta.env.VITE_DEBUG === 'true';

if (debug) {
  console.log('Modo debug ativo');
}
```

---

### 🔟 Monitorar Performance

```javascript
// Em BannerCarousel.jsx
useEffect(() => {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    console.log(`Banner carregou em ${endTime - startTime}ms`);
  };
}, []);

// Ou no console:
performance.measure('banner-load-start', 'navigationStart');
// ... código aqui
performance.measure('banner-load-end', 'navigationStart');
performance.getEntriesByName('banner-load-end')[0].duration // ms
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────┐
│       BANNER_IMAGES (constantes)        │
│  [{ id, filename, alt, title }, ...]    │
└──────────────┬──────────────────────────┘
               │
               ├─→ getBannerImagePath()
               │   ('/uploads/Banner/...')
               │
               ├─→ getImageUrl()
               │   ('http://...:3000/uploads/Banner/...')
               │
               └─→ BannerCarousel.jsx
                   ├─ Auto-play
                   ├─ Controles manual
                   ├─ Dots interativos
                   ├─ Tratamento de erros
                   └─ Acessibilidade
```

---

## 📋 Checklist de Implementação Rápida

- [ ] `npm install` no frontend
- [ ] Criar `.env` com `VITE_BACKEND_URL`
- [ ] Importar `BannerCarousel` no `Home.jsx`
- [ ] Rodar `npm run dev` e testar
- [ ] Abrir DevTools para verificar erros
- [ ] Testar em mobile via DevTools
- [ ] Testar com imagem faltando
- [ ] Comitar mudanças

---

## ⚡ Performance Tips

1. **Usar `getBannerImagePath()` sempre**
   ```jsx
   // ✅ Certo
   const url = getBannerImagePath('imagem.jpg');
   
   // ❌ Errado
   const url = `/uploads/Banner/imagem.jpg`;
   ```

2. **Não harcodear URLs**
   ```jsx
   // ✅ Certo
   const url = getImageUrl(path);
   
   // ❌ Errado
   const url = 'https://pi3pescadores.onrender.com/uploads/...';
   ```

3. **Usar dados de constantes**
   ```jsx
   // ✅ Certo
   BANNER_IMAGES.map(img => ...)
   
   // ❌ Errado
   [{ id: 1, ... }, { id: 2, ... }].map(...)
   ```

---

## 🎓 Lições Aprendidas

### Problema 1: Localhost Hardcoded
**Aprendizado:** Sempre use variáveis de ambiente
```javascript
// ❌ Nunca
const api = 'https://pi3pescadores.onrender.com';

// ✅ Sempre
const api = process.env.REACT_APP_API || 'https://pi3pescadores.onrender.com';
```

### Problema 2: Imagens Não Sincronizadas
**Aprendizado:** Centralize dados em uma fonte única (single source of truth)
```javascript
// ✅ Um lugar único de verdade
export const BANNER_IMAGES = [...];
// Usado em qualquer lugar que precisa
```

### Problema 3: Componente Rígido
**Aprendizado:** Use props para flexibilidade
```jsx
<BannerCarousel images={BANNER_IMAGES} />
// Permite reutilizar em diferentes contextos
```

### Problema 4: Sem Acessibilidade
**Aprendizado:** Sempre inclua ARIA labels
```jsx
<button aria-label="Próxima imagem">❯</button>
```

---

## 🚀 Deploy Checklist

- [ ] `.env.production` configurado com URL correta
- [ ] `npm run build` testado localmente
- [ ] Imagens verificadas no servidor
- [ ] CORS configurado no backend
- [ ] Testar em produção antes de soltar
- [ ] Criar rollback plan
- [ ] Monitorar erros em APM (Sentry, etc)

---

**Referência rápida:** Para 90% dos usos, basta importar e usar `<BannerCarousel />`!

Dúvidas? Consulte `docs/BANNER_SYSTEM.md` para documentação técnica completa.
