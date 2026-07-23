# AGENTS.md

> Guia de instruções para agentes de IA trabalhando neste projeto.

---

## Visão Geral

**Neves Finance** é um PWA de controle financeiro pessoal construído com React + Vite + TailwindCSS. O foco é mobile-first com experiência nativa via PWA.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework | React 18.2 |
| Build | Vite 6.1 |
| Roteamento | React Router 6.26 |
| Estilização | TailwindCSS 3.4 + shadcn/ui |
| Estado | React Context + TanStack Query |
| Armazenamento | localStorage (via StorageService) |
| Animações | Framer Motion |
| PWA | vite-plugin-pwa + Workbox |

---

## Convenções de Código

### Nomenclatura

```
Componentes:   PascalCase    → TransactionForm.jsx
Hooks:         camelCase     → usePullToRefresh.js
Services:      PascalCase    → TransactionService.js
Utils:         camelCase     → formatCurrency()
Arquivos:      PascalCase    → SummaryCard.jsx
Pastas:        kebab-case    → components/finance/
```

### Estrutura de Componentes

```jsx
// Ordem preferida dentro do arquivo:

// 1. Imports externos primeiro, internos depois
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import LocalComponent from './LocalComponent';

// 2. Constantes e helpers fora do componente
const COLORS = ['#007AFF', '#34C759'];

// 3. Componente principal (default export)
export default function ComponentName({ prop1, prop2 }) {
  // Hooks no topo
  const [state, setState] = useState(null);
  const { data } = useCustomHook();
  
  // Handlers nomeados
  const handleClick = () => { /* ... */ };
  
  // Early returns para loading/empty states
  if (!data) return <Loading />;
  
  // JSX retornando
  return (
    <div className="...">...</div>
  );
}

// 4. Sub-componentes (se houver)
function SubComponent() { /* ... */ }
```

### TailwindCSS

- Usar classes utilitárias inline
- Para classes complexas/repetidas, usar `@apply` em `index.css` ou `cn()` helper
- Breakpoints: `sm:`, `md:`, `lg:` (mobile-first)
- Dark mode: `dark:` prefix automaticamente aplicado

```jsx
// Prefira:
<div className="flex items-center gap-3 p-4 rounded-xl bg-card">

// Para condicionais:
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === 'dark' && "dark-classes"
)}>
```

### Imports com Aliases

```jsx
// Sempre use aliases @/ para imports internos
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

// Nunca use paths relativos longos
// ❌ import { Button } from '../../components/ui/button';
```

---

## Arquitetura de Pastas

```
src/
├── api/           # Clientes de API externa
├── components/
│   ├── finance/   # Componentes de domínio/negócio
│   └── ui/        # Componentes de UI genéricos (shadcn)
├── hooks/         # Custom hooks reutilizáveis
├── lib/           # Context providers, utils, configs
├── pages/         # Páginas/rotas da aplicação
├── services/      # Camada de abstração de dados
└── utils/         # Utilitários genéricos
```

### Quando criar onde?

| Tipo | Local |
|------|-------|
| UI genérica (button, input, dialog) | `components/ui/` |
| Componente de negócio (transaction list) | `components/finance/` |
| Lógica reutilizável (pull-to-refresh) | `hooks/` |
| Estado global (theme, auth) | `lib/` |
| Acesso a dados | `services/` |
| Página/rota | `pages/` |

---

## Padrões de Código

### Services (Data Layer)

```javascript
// Sempre usar StorageService como base
import { StorageService } from './StorageService';

const KEY = 'entity_name';

export const EntityService = {
  list(sort) {
    return StorageService.list(KEY, sort);
  },
  filter(query, sort) {
    return StorageService.filter(KEY, query);
  },
  create(data) {
    return StorageService.create(KEY, data);
  },
  update(id, data) {
    return StorageService.update(KEY, id, data);
  },
  delete(id) {
    return StorageService.delete(KEY, id);
  },
};
```

### Custom Hooks

```javascript
// hooks/useSomething.js
import { useState, useEffect } from 'react';

export function useSomething(config) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Lógica do hook
  }, [dependencies]);
  
  return { state, setState, /* derivados */ };
}
```

### Context Providers

```jsx
// lib/SomeContext.jsx
import React, { createContext, useContext, useState } from 'react';

const Context = createContext(null);

export function SomeProvider({ children }) {
  const [value, setValue] = useState(defaultValue);
  
  const contextValue = {
    value,
    setValue,
    // helpers derivados
  };
  
  return (
    <Context.Provider value={contextValue}>
      {children}
    </Context.Provider>
  );
}

export function useSome() {
  const context = useContext(Context);
  if (!context) {
    throw new Error('useSome must be used within SomeProvider');
  }
  return context;
}
```

---

## Modelo de Dados

### Transaction

```typescript
interface Transaction {
  id: string;                    // Auto-gerado: id_${timestamp}_${random}
  name: string;                  // Pessoa responsável (PEOPLE_OPTIONS)
  type: 'receita' | 'despesa';   // Tipo
  payment_method: 'Pix' | 'Dinheiro' | 'Cartão';
  status: 'Pago' | 'Pendente' | 'Recebido';
  amount: number;                // Valor em BRL
  description: string;           // Descrição livre
  category: string;              // Categoria (CATEGORY_OPTIONS)
  due_date: string;              // YYYY-MM-DD
  month: string;                 // YYYY-MM (chave de filtro principal)
  scope: 'pessoal' | 'empresa';
  created_date: string;          // ISO timestamp
  updated_date: string;          // ISO timestamp
}
```

### Constantes de Domínio

```javascript
// src/lib/finance-utils.js

export const CATEGORY_OPTIONS = ['Moradia', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros'];
export const PAYMENT_OPTIONS = ['Pix', 'Dinheiro', 'Cartão'];
export const PEOPLE_OPTIONS = ['Jeferson', 'Ana Clara', 'Reserva'];
export const STATUS_OPTIONS = ['Pago', 'Pendente', 'Recebido'];
export const SCOPE_OPTIONS = [
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'empresa', label: 'Empresa' }
];
```

---

## Regras de UI/UX

### Mobile-First

- Design para telas pequenas primeiro
- Usar `max-w-lg mx-auto` para container principal
- Touch targets de no mínimo 44x44px
- Bottom navigation fixa com safe-area-bottom

### Dark Mode

- Sempre testar em ambos os temas
- Usar variáveis CSS do Tailwind: `bg-background`, `text-foreground`, etc.
- Nunca hardcodar cores que precisam variar entre temas

### Animações

```jsx
// Padrão de entrada com stagger
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05, duration: 0.3 }}
>

// Transição de página (slide)
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};
```

### Formulários

- Usar `react-hook-form` + `zod` para validação
- `MobileSelect` para selects (drawer em mobile)
- Labels sempre com `Label` do shadcn/ui

---

## PWA

### Manifest

Configurado em `vite.config.js` e `public/manifest.json`:

```javascript
{
  name: 'Neves Finance',
  short_name: 'Neves',
  theme_color: '#0080FF',
  background_color: '#F7F7F7',
  display: 'standalone',
  orientation: 'portrait',
}
```

### Service Worker

- Gerado automaticamente pelo `vite-plugin-pwa`
- Workbox para cache de assets e fontes
- `registerType: 'autoUpdate'` para atualizações automáticas

---

## Dependências Importantes

### shadcn/ui Components

Localizados em `src/components/ui/`. Principais:

- `button.jsx` - Botões com variantes
- `dialog.jsx` - Modais
- `drawer.jsx` - Bottom sheets (Vaul)
- `dropdown-menu.jsx` - Menus contextuais
- `alert-dialog.jsx` - Confirmações destrutivas
- `badge.jsx` - Tags/status
- `input.jsx`, `select.jsx`, `label.jsx` - Formulário

### Lucide Icons

```jsx
import { IconName } from 'lucide-react';

<IconName size={16} strokeWidth={2} className="text-muted-foreground" />
```

### Framer Motion

```jsx
import { motion, AnimatePresence } from 'framer-motion';

// Animação de lista
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
  />
))}

// Animação de troca de página
<AnimatePresence mode="popLayout">
  <motion.div key={page} ... />
</AnimatePresence>
```

---

## Comandos

```bash
# Desenvolvimento
npm run dev          # Servidor em localhost:5173

# Build
npm run build        # Build de produção em dist/

# Linting
npm run lint         # Verificar erros
npm run lint:fix     # Corrigir automaticamente

# Type checking
npm run typecheck    # Verificar tipos

# Preview
npm run preview      # Preview do build
```

---

## Notas Importantes

### localStorage

- Prefixo de keys: `nevesfinance_` (ex: `nevesfinance_transactions`)
- Dados persistem entre sessões
- Usar `TransactionService` para todas as operações

### Pessoas

O campo `name` em transações deve ser uma das opções em `PEOPLE_OPTIONS`. Atualmente hardcoded, futuramente pode vir de uma tabela separada.

### Filtro por Mês

O campo `month` (formato `YYYY-MM`) é a chave principal de filtro. Todos os dashboards são agrupados por mês.

### Tema

Controlado por `ThemeProvider` com 3 opções:
- `light` - Sempre claro
- `dark` - Sempre escuro
- `system` - Segue preferência do OS

Valor salvo em `localStorage.getItem('theme')`.

---

## Erros Comuns a Evitar

1. **Não usar alias @/**: Imports relativos longos são difíceis de manter
2. **Hardcodar cores**: Usar sempre variáveis do Tailwind para temas
3. **Ignorar safe-area**: Em mobile, considerar notch/home indicator
4. **Touch targets pequenos**: Mínimo 44px para botões
5. **Esquecer dark mode**: Testar sempre ambos os temas
6. **State derivado**: Se pode derivar de props/state, não criar novo state

---

## Fluxo de Trabalho Sugerido

1. **Nova feature**: Criar branch, implementar, testar em mobile
2. **Bug fix**: Reproduzir, identificar causa, corrigir com teste
3. **Refactor**: Garantir que comportamento permanece igual
4. **Build**: Sempre rodar `npm run build` antes de commit final
