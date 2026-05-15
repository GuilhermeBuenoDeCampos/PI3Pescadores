# 🚀 Banner System - Teste Completo

## ✅ Verificação Pré-Teste

```bash
# 1. Verificar se imagens existem
ls -la backend/uploads/Banner/

# Output esperado:
# Aparecida.jpg
# barco.jpg
# crucifixo.jpg
# kitoracao.jpg
# oratoria.jpg
# rosario.jpg
```

---

## 🧪 Teste Local - Passo a Passo

### Passo 1: Terminal 1 - Rodar Backend

```bash
cd /home/mpaula/PI3Pescadores/backend

# Instalar dependências (apenas 1ª vez)
npm install

# Rodar servidor
npm run dev

# Output esperado:
# > backend@1.0.0 dev
# > nodemon src/index.js
# Server running on port 3000
```

### Passo 2: Terminal 2 - Rodar Frontend

```bash
cd /home/mpaula/PI3Pescadores/frontend

# Instalar dependências (apenas 1ª vez)
npm install

# Rodar dev server
npm run dev

# Output esperado:
# VITE v4.x.x  ready in xxx ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### Passo 3: Abrir Navegador

```bash
# Abrir em navegador
open http://localhost:5173

# Ou
firefox http://localhost:5173
chromium http://localhost:5173
```

---

## 🎯 Checklist de Testes

### ✅ Test 1: Banner Carrega

- [ ] Abrir http://localhost:5173
- [ ] Ver imagem no topo da página
- [ ] Sem erros em Console (F12)
- [ ] Sem erros em Network tab

**Se falhar:**
```bash
# Verificar logs do backend
# Terminal 1: npm run dev

# Se backend rodando e ainda falha:
# Verificar Network tab (F12)
# Status esperado: 200
```

---

### ✅ Test 2: Auto-play Funciona

- [ ] Observar imagem por 5 segundos
- [ ] Imagem muda automaticamente
- [ ] Contador atualiza (1/6 → 2/6 → ...)

**Se falhar:**
```javascript
// F12 Console:
// Verificar se component renderizou
console.log('Banner mounted');

// Verificar estado
React DevTools → Components → BannerCarousel → Hooks
```

---

### ✅ Test 3: Botão Próximo (❯)

- [ ] Clicar botão ❯ (lado direito)
- [ ] Imagem muda imediatamente
- [ ] Contador atualiza
- [ ] Auto-play pausa

**Se falhar:**
```javascript
// F12 Console:
// Verificar se botão disparando evento
const btn = document.querySelector('button');
btn.click();
// Deve mudar de imagem
```

---

### ✅ Test 4: Botão Anterior (❮)

- [ ] Clicar botão ❮ (lado esquerdo)
- [ ] Imagem muda para anterior
- [ ] Funciona em ciclo (última → primeira)

**Teste:**
```
Começar em imagem 3
Clicar ❮ → imagem 2
Clicar ❮ → imagem 1
Clicar ❮ → imagem 6 (volta)
```

---

### ✅ Test 5: Dots (Indicadores)

- [ ] Ver 6 dots na parte inferior
- [ ] Dot branco = imagem atual
- [ ] Clicar dot 3 → pula para imagem 3
- [ ] Contador atualiza

**Teste:**
```
Clique no 4º dot
Deve ir para imagem 4
Dot 4 fica brancaço
Contador mostra 4/6
```

---

### ✅ Test 6: Resume Auto-play

- [ ] Clicar um dot (pausa auto-play)
- [ ] Esperar 10 segundos
- [ ] Auto-play retoma (imagem muda)

**Teste:**
```
1. Clicar dot
2. Observar relógio
3. Após 10s, imagem muda sozinha
```

---

### ✅ Test 7: Hover Pausa Auto-play

- [ ] Passar mouse sobre banner
- [ ] Auto-play pausa
- [ ] Tirar mouse
- [ ] Auto-play retoma

**Teste:**
```
1. Observar imagem mudando
2. Passar mouse = para de mudar
3. Tirar mouse = volta a mudar
```

---

### ✅ Test 8: Responsividade

**Desktop (1200px)**
- [ ] F12 → Responsive Mode
- [ ] Set para 1200x800
- [ ] Botões grandes
- [ ] Banner altura 520px

**Tablet (768px)**
- [ ] Set para 768x1024
- [ ] Botões menores
- [ ] Banner altura 400px
- [ ] Tudo confortável

**Mobile (375px)**
- [ ] Set para 375x667
- [ ] Botões pequenos mas clicáveis
- [ ] Banner altura 280px
- [ ] Sem overflow

**Teste rápido:**
```
F12 → Toggle device toolbar (Ctrl+Shift+M)
Arrastar slider para testar diferentes resoluções
```

---

### ✅ Test 9: Acessibilidade

**Screen Reader (NVDA/JAWS)**
- [ ] Banner anunciado como "Carrossel"
- [ ] Botões descrevem ação ("Imagem anterior")
- [ ] Dots descrevem destino

**Keyboard Navigation**
- [ ] Tab navega entre elementos
- [ ] Enter / Space ativa botões
- [ ] Setas (←→) navegam (se implementado)

**Teste rápido:**
```bash
# Linux: orca (screen reader)
# Mac: VoiceOver (Cmd+F5)
# Windows: NVDA (livre) ou Narrator

# Testar com Tab
Tab → Tab → Tab → Deve destacar botões
```

---

### ✅ Test 10: URLs Corretas

**Verificar que URLs não têm localhost hardcoded:**

```javascript
// F12 → Network
// Ao carregar imagem, deve ser:
// GET https://pi3pescadores.onrender.com/uploads/Banner/Aparecida.jpg

// Verificar em Console:
import { getImageUrl } from './src/services/api.js';
import { getBannerImagePath } from './src/constants/banner.js';

const path = getBannerImagePath('Aparecida.jpg');
console.log('Path:', path); // /uploads/Banner/Aparecida.jpg

const url = getImageUrl(path);
console.log('URL:', url); // https://pi3pescadores.onrender.com/uploads/Banner/Aparecida.jpg
```

---

### ✅ Test 11: Modo Escuro

**Se tiver dark mode:**
- [ ] Abrir DevTools
- [ ] Settings → Preferences
- [ ] Ativar "Emulate CSS media feature prefers-color-scheme"
- [ ] Mudar para "dark"
- [ ] Botões devem escurecer
- [ ] Ainda legível

---

### ✅ Test 12: Erro de Imagem

**Simular falha:**

```javascript
// F12 → Network → Throttling
// Selecionar "Offline"
// Atualizar página
// Banner não carrega? Tenta próxima imagem automaticamente
```

Ou editar arquivo:

```bash
# Temporariamente renomear uma imagem
cd backend/uploads/Banner/
mv Aparecida.jpg Aparecida.jpg.bak

# Atualizar página
# Se primeira falha, pula para segunda
# Renomear de volta
mv Aparecida.jpg.bak Aparecida.jpg
```

---

## 📊 Console Debugging

### Verificar se component renderizou

```javascript
// F12 → Console
// Procurar BannerCarousel nas React DevTools
React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactDebugCurrentOwner;
```

### Verificar dados de imagens

```javascript
// F12 → Console
// Abrir Network → XHR
// Deve estar vazio (sem requisições ao backend para dados)

// Imagens devem aparecer em:
// Network → Img
// Deve haver 6 imagens JPG
```

### Verificar variáveis de ambiente

```javascript
// F12 → Console
import.meta.env.VITE_BACKEND_URL // Deve ser https://pi3pescadores.onrender.com
import.meta.env.VITE_DEBUG        // Deve ser true
```

### Verificar estado do component

```javascript
// F12 → React DevTools
// Components → BannerCarousel
// Hooks:
// - currentIndex: 0-5
// - isAutoPlay: true/false
// - failedImages: Set([])
```

---

## 🔴 Troubleshooting

### Problema: "Imagens não carregam"

**Solução 1: Backend rodando?**
```bash
curl https://pi3pescadores.onrender.com/health
# Deve retornar: {"ok":true,"service":"pi3-pescadores-backend",...}
```

**Solução 2: Arquivos existem?**
```bash
ls -la backend/uploads/Banner/
# Deve mostrar 6 arquivos JPG
```

**Solução 3: CORS ativado?**
```bash
curl -H "Origin: http://localhost:5173" https://pi3pescadores.onrender.com/uploads/Banner/Aparecida.jpg
# Deve retornar imagem com status 200
```

---

### Problema: "TypeError: Cannot read property 'map' of undefined"

**Causa:** `BANNER_IMAGES` não carregou

**Solução:**
```bash
# 1. Verificar se arquivo existe:
ls frontend/src/constants/banner.js

# 2. Verificar import:
# Em BannerCarousel.jsx, deve ter:
import { BANNER_IMAGES } from '../constants/banner';

# 3. Se ainda falhar, restart frontend:
# Terminal 2: Ctrl+C
npm run dev
```

---

### Problema: "Cannot find module 'react'"

**Solução:**
```bash
cd frontend
npm install
npm run dev
```

---

### Problema: "Port 3000 already in use"

**Solução:**
```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>

# Ou mudar porta em backend/.env
PORT=3001
```

---

## 🚀 Deploy Checklist

- [ ] Testar localmente completo
- [ ] Sem erros no Console
- [ ] Responsivo (desktop/tablet/mobile)
- [ ] Acessível (keyboard, screen reader)
- [ ] Criar `.env.production`
- [ ] Build: `npm run build`
- [ ] Testar build localmente: `npm run preview`
- [ ] Push para repositório
- [ ] Deploy para server

---

## 📝 Exemplo de .env.production

```env
# Production environment variables
VITE_BACKEND_URL=https://api.seudominio.com.br
VITE_DEBUG=false
```

---

## 🎯 Próximos Passos

1. ✅ Testar tudo localmente (este guia)
2. ✅ Ler `DETAILED_EXPLANATION.md` para entender decisões
3. ✅ Ler `docs/BANNER_SYSTEM.md` para referência
4. ✅ Deploy para produção
5. ✅ Monitorar erros (Sentry, etc)

---

## ✨ Tudo OK?

Se passou em todos os testes, seu banner está **100% profissional, acessível e pronto para produção**!

🎉 Parabéns!

---

**Última atualização:** 10 de maio de 2026  
**Versão:** 1.0.0 - Pronto para Produção
