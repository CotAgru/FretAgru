# Padrões de UI — Sistema de Filtros Avançados

> Documento de referência para manter consistência visual e funcional em todas as páginas do ecossistema iAgru.
> Última atualização: 31/03/2026

---

## 1. Visão Geral

Todas as páginas de listagem do sistema devem seguir o padrão **"Filtros Avançados Dinâmicos"** (FAD). Este padrão permite ao usuário adicionar, combinar e remover filtros de forma flexível, com suporte a **busca textual** e **seleção múltipla**.

---

## 2. Componentes do Sistema de Filtros

### 2.1 Barra de Busca Global (SearchBar)

- **Nome:** `SearchBar`
- **Descrição:** Campo de texto livre para busca rápida por múltiplos campos simultaneamente.
- **Posição:** Topo da área de filtros, ocupando toda a largura.
- **Ícone:** `Filter` (lucide) à esquerda do campo.
- **Placeholder:** Descritivo com os campos pesquisáveis. Ex: `"Buscar por ordem, ticket, produtor, produto, placa..."`
- **Estilo:** `w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500`

### 2.2 Botão Adicionar Filtro (AddFilterButton)

- **Nome:** `AddFilterButton`
- **Descrição:** Botão que abre um dropdown com os campos filtráveis disponíveis.
- **Texto:** `"+ Adicionar Filtro"`
- **Ícones:** `Plus` + `ChevronDown` (lucide)
- **Dropdown:** Lista de campos filtráveis, excluindo os já adicionados.
- **Estilo do botão:** `px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm`
- **Estilo do dropdown:** `absolute bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto w-64`

### 2.3 Filtro Ativo — Select com Busca e Multi-Seleção (MultiSearchableSelect)

- **Nome:** `MultiSearchableSelect`
- **Componente:** `frontend/src/components/MultiSearchableSelect.tsx`
- **Descrição:** Dropdown com campo de busca integrado e seleção múltipla com checkboxes.
- **Comportamento:**
  - Ao expandir, exibe um **campo de busca** (input com ícone `Search`) no topo do dropdown.
  - Lista de opções com **checkboxes** — o usuário pode marcar/desmarcar múltiplas opções.
  - Itens selecionados aparecem como **badges azuis** com botão `X` para remoção individual.
  - Filtragem em tempo real conforme o usuário digita no campo de busca.
  - Fecha ao clicar fora (click outside).
- **Props:**
  - `values: string[]` — Array de valores selecionados.
  - `onChange: (values: string[]) => void` — Callback ao alterar seleção.
  - `options: { value: string, label: string }[]` — Lista de opções disponíveis.
  - `placeholder?: string` — Texto quando nenhum item selecionado.
  - `className?: string` — Classes CSS adicionais.
  - `disabled?: boolean` — Desabilitar o componente.
  - `minSelected?: number` — Mínimo de itens que devem permanecer selecionados.
- **Estilo dos badges:** `bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full`
- **Estilo do checkbox selecionado:** `bg-blue-600 border-blue-600 text-white`
- **Largura mínima no filtro:** `min-w-[200px]`

### 2.4 Filtro Ativo — Texto Livre (TextFilter)

- **Nome:** `TextFilter`
- **Descrição:** Input de texto simples para filtros baseados em busca textual (ex: placa, NF-e, ticket).
- **Estilo:** `text-sm border-0 bg-transparent focus:ring-0 p-0 w-32`

### 2.5 Filtro Ativo — Data (DateFilter)

- **Nome:** `DateFilter`
- **Descrição:** Input do tipo `date` para filtros de período.
- **Estilo:** `text-sm border-0 bg-transparent focus:ring-0 p-0`

### 2.6 Botão Limpar Todos (ClearAllButton)

- **Nome:** `ClearAllButton`
- **Descrição:** Remove todos os filtros ativos e limpa o campo de busca.
- **Texto:** `"Limpar todos"`
- **Estilo:** `text-xs text-red-600 hover:text-red-700 font-medium px-2`
- **Visível apenas quando:** `activeFilters.length > 0`

### 2.7 Container de Filtro Ativo (FilterChip)

- **Nome:** `FilterChip`
- **Descrição:** Container visual que agrupa o label do filtro + componente de seleção + botão remover.
- **Estilo:** `flex items-center gap-2 bg-gray-100 rounded-lg p-2 pr-3`
- **Label:** `text-xs font-medium text-gray-600 whitespace-nowrap`
- **Botão remover:** Ícone `X` (w-3 h-3) com hover `bg-gray-200 rounded`

---

## 3. Estrutura de Dados

### 3.1 Estado dos Filtros Ativos

```typescript
const [activeFilters, setActiveFilters] = useState<{
  id: string       // Identificador único (Date.now().toString())
  field: string    // Chave do campo (ex: 'produto', 'origem')
  values: string[] // Array de valores selecionados (multi-seleção)
}[]>([])
```

### 3.2 Definição dos Campos Filtráveis

```typescript
const FILTER_FIELDS = [
  {
    key: string,          // Chave única do filtro (ex: 'produto')
    label: string,        // Label exibido ao usuário (ex: 'Produto')
    type: 'select' | 'text' | 'date',  // Tipo do filtro
    options?: () => { value: string, label: string }[]  // Função que retorna opções (apenas para type: 'select')
  }
]
```

### 3.3 Funções de Gerenciamento

```typescript
// Adicionar novo filtro
const addFilter = (field: string) => {
  const id = Date.now().toString()
  setActiveFilters([...activeFilters, { id, field, values: [] }])
  setShowFilterOptions(false)
}

// Atualizar valores de um filtro (multi-seleção)
const updateFilterValues = (id: string, values: string[]) => {
  setActiveFilters(activeFilters.map(f => f.id === id ? { ...f, values } : f))
}

// Remover um filtro
const removeFilter = (id: string) => {
  setActiveFilters(activeFilters.filter(f => f.id !== id))
}

// Limpar todos os filtros
const clearAllFilters = () => {
  setActiveFilters([])
  setSearchTerm('')
}
```

---

## 4. Lógica de Filtragem

### 4.1 Regra Geral

- **Entre filtros diferentes:** Lógica **AND** (todos devem passar).
- **Dentro de um mesmo filtro (multi-seleção):** Lógica **OR** (basta estar em pelo menos um valor selecionado).

### 4.2 Padrão para filtros tipo `select`

```typescript
// Para campos com ID (ex: produto_id, origem_id)
case 'produto':
  if (!filter.values.includes(item.produto_id)) return false
  break

// Para campos com valor direto (ex: status, tipo_caminhao)
case 'status':
  if (!filter.values.includes(item.status)) return false
  break
```

### 4.3 Padrão para filtros tipo `text`

```typescript
// Busca parcial (contains) usando o primeiro valor do array
case 'placa': {
  const term = filter.values[0]?.toLowerCase() || ''
  if (!(item.placa || '').toLowerCase().includes(term)) return false
  break
}
```

### 4.4 Padrão para filtros tipo `date`

```typescript
// Comparação exata de data
case 'data_saida':
  if (!filter.values.includes(item.data_saida_origem)) return false
  break
```

---

## 5. Layout da Área de Filtros

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Buscar por ordem, ticket, produtor, produto...      │  ← SearchBar
└─────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────┐
│ Produto: [badges]│ │ Origem: [badges] │ │Limpar    │    ← FilterChips + ClearAll
│            ✕     │ │            ✕     │ │todos     │
└──────────────────┘ └──────────────────┘ └──────────┘

┌──────────────────────┐
│ + Adicionar Filtro ▾ │                                    ← AddFilterButton
├──────────────────────┤
│ ○ Operação           │                                    ← Dropdown de campos
│ ○ Status             │
│ ○ Destino            │
│ ○ Transportadora     │
└──────────────────────┘
```

---

## 6. Hierarquia de Componentes

```
<div className="mb-4 space-y-3">
  ├── SearchBar (input texto livre)
  ├── FilterChips (activeFilters.length > 0)
  │   ├── FilterChip × N
  │   │   ├── Label (fieldDef.label)
  │   │   ├── MultiSearchableSelect | TextFilter | DateFilter
  │   │   └── RemoveButton (X)
  │   └── ClearAllButton
  └── AddFilterButton + Dropdown
</div>
```

---

## 7. Páginas que Implementam o Padrão

| Página | Arquivo | Filtros Disponíveis |
|--------|---------|-------------------|
| **Ordens de Carregamento** | `pages/frete/Ordens.tsx` | Operação, Status, Origem, Destino, Produto, Nome da Ordem |
| **Romaneios** | `pages/frete/Romaneios.tsx` | Operação, Ordem, Produtor, Produto, Origem, Destino, Veículo, Motorista, Transportadora, Ticket, NF-e, Ano Safra, Tipo Ticket, Tipo NF, Data Saída, Transgenia |
| **Veículos** | `pages/frete/Veiculos.tsx` | Tipo Caminhão, Proprietário, Placa, Marca |
| **Preços Contratados** | `pages/frete/Precos.tsx` | Origem, Destino, Produto, Transportador, Unidade de Preço |

---

## 8. Checklist para Novas Páginas

Ao criar uma nova página de listagem, siga este checklist:

- [ ] Importar `MultiSearchableSelect` de `../../components/MultiSearchableSelect`
- [ ] Importar ícones: `Filter`, `Plus`, `ChevronDown`, `X` do lucide-react
- [ ] Definir estado `activeFilters` com tipo `{id: string, field: string, values: string[]}[]`
- [ ] Definir estado `showFilterOptions` (boolean)
- [ ] Definir estado `searchTerm` (string)
- [ ] Criar array `FILTER_FIELDS` com campos filtráveis da página
- [ ] Implementar funções: `addFilter`, `updateFilterValues`, `removeFilter`, `clearAllFilters`
- [ ] Na lógica `filteredItems`, verificar `filter.values.length === 0` antes de aplicar
- [ ] Para filtros `select`: usar `filter.values.includes(item.campo)`
- [ ] Para filtros `text`: usar `filter.values[0]?.toLowerCase()` com `.includes()`
- [ ] Renderizar SearchBar + FilterChips + AddFilterButton na ordem correta
- [ ] Usar `MultiSearchableSelect` para filtros tipo `select`
- [ ] Adicionar botão "Limpar todos" visível quando houver filtros ativos

---

## 9. Regras de Formatação (Globais)

Estas regras se aplicam a **todas as páginas** do sistema, não apenas filtros:

| Regra | Formato | Exemplo |
|-------|---------|---------|
| Separador de milhar | Ponto `.` | `45.000` |
| Separador decimal | Vírgula `,` | `1.234,56` |
| Data | `DD/MM/AAAA` | `31/03/2026` |
| Ordenação de colunas | Click para ordenar crescente/decrescente | ↑ ↓ ↕ |

---

*Documento mantido como referência técnica para garantir consistência em todo o ecossistema iAgru.*
