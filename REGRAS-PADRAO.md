# REGRAS-PADRAO — Convenções Obrigatórias do Ecossistema iAgru

> Estas regras são OBRIGATÓRIAS em TODOS os módulos e TODAS as telas do ecossistema iAgru.
> Última atualização: 26/03/2026

---

## 1. Formatação de Números

| Tipo | Separador Milhar | Separador Decimal | Exemplo | Função |
|------|-----------------|-------------------|---------|--------|
| Inteiro | `.` (ponto) | — | `45.000` | `fmtInt()` |
| Decimal | `.` (ponto) | `,` (vírgula) | `1.234,56` | `fmtDec(v, decimals)` |
| Moeda | `.` (ponto) | `,` (vírgula) | `R$ 1.234,56` | `fmtBRL()` |
| Percentual | — | `,` (vírgula) | `12,50%` | `fmtPerc()` |
| Peso KG | `.` (ponto) | — | `45.000` | `fmtKg()` |

> **NUNCA** usar `toLocaleString()` direto — SEMPRE usar as funções de `utils/format.ts`.

## 2. Formatação de Datas

| Tipo | Formato | Exemplo | Função |
|------|---------|---------|--------|
| Data | `DD/MM/AAAA` | `26/03/2026` | `fmtData()` |
| Data+Hora | `DD/MM/AAAA HH:mm` | `26/03/2026 10:30` | `fmtDataHora()` |
| Inputs | `type="date"` (nativo YYYY-MM-DD) | — | Exibição sempre DD/MM/AAAA |

## 3. Tabelas — Ordenação Obrigatória

- **TODAS** as tabelas DEVEM ter colunas clicáveis para ordenação crescente/decrescente
- Hook: `hooks/useSort.ts`
- Componente: `components/SortHeader.tsx`
- Ícones: ArrowUp (asc), ArrowDown (desc), ArrowUpDown (neutro) do Lucide

## 4. Tabelas — Paginação

- Componente: `components/Pagination.tsx`
- Padrão: 25 registros por página
- Opções: 25 / 50 / 100

## 5. Tabelas — Exportação

- **TODAS** as tabelas principais DEVEM ter botões de exportação PDF e Excel
- Componente: `components/ExportButtons.tsx`
- Funções: `utils/export.ts` → `exportToPDF()`, `exportToExcel()`

## 6. Selects com Busca

- **TODOS** os campos de seleção (select) DEVEM ter capacidade de busca/autocomplete
- Componente: `components/SearchableSelect.tsx` (single) ou `components/MultiSearchableSelect.tsx` (multi)
- Aplicar em: produtos, safras, cadastros, origem, destino, status, e QUALQUER outro select

## 7. Responsividade (Mobile + Desktop)

- **TODAS** as telas DEVEM ser responsivas
- Tabelas: `overflow-x-auto` + `min-w-[Xpx]` para scroll horizontal
- Modais: tela cheia em mobile com scroll interno
- Botões: touch-friendly (min 44px)
- Menu lateral: colapsa em mobile
- Breakpoints: sm (640px), md (768px), lg (1024px)

## 8. Conversão de Unidades

- O banco armazena TUDO em **KG** (quilogramas)
- Conversão para exibição:
  - **SC** (saca) = kg / 60
  - **TN** (tonelada) = kg / 1000
- Inputs aceitam qualquer unidade, convertem para KG antes de salvar

## 9. Convenções de Código

### Imports
- Sempre no topo do arquivo
- Ordem: React → libs externas → componentes → services → utils → hooks → types

### TypeScript
- Evitar `any` (usar interfaces tipadas)
- Interfaces para dados de formulário e dados da API

### Componentes
- Componentes reutilizáveis em `components/`
- Páginas em `pages/` organizadas por módulo (`frete/`, `contratos/`, `armazem/`)
- Páginas universais na raiz de `pages/`

### Estilização
- TailwindCSS exclusivamente (nenhum CSS custom exceto `index.css` base)
- Ícones: Lucide React

### API
- Todas as queries Supabase centralizadas em `services/api.ts`
- Cliente Aegro em `services/aegro.ts`

## 10. Idioma

- **SEMPRE** pt-BR em todo o frontend (labels, mensagens, tooltips, erros)
- **SEMPRE** pt-BR nas respostas do assistente IA
- Termos técnicos em inglês são aceitos em código (variáveis, funções)

## 11. Arquivos de Referência

| Arquivo | Caminho | Propósito |
|---------|---------|-----------|
| `format.ts` | `frontend/src/utils/format.ts` | Funções de formatação pt-BR |
| `export.ts` | `frontend/src/utils/export.ts` | Exportação Excel/PDF |
| `useSort.ts` | `frontend/src/hooks/useSort.ts` | Hook de ordenação |
| `SortHeader.tsx` | `frontend/src/components/SortHeader.tsx` | Cabeçalho ordenável |
| `Pagination.tsx` | `frontend/src/components/Pagination.tsx` | Paginação client-side |
| `ExportButtons.tsx` | `frontend/src/components/ExportButtons.tsx` | Botões PDF/Excel |
| `SearchableSelect.tsx` | `frontend/src/components/SearchableSelect.tsx` | Select com busca |
| `supabase.ts` | `frontend/src/lib/supabase.ts` | Cliente Supabase |
