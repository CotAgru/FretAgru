# iAgru — Plataforma de Gestão Agrícola

> Ecossistema modular para gestão de atividades agrícolas do produtor rural brasileiro.

**Produção:** https://fretagru.vercel.app/

---

## Visão Geral

A iAgru é uma plataforma modular que reúne ferramentas de gestão agrícola em um único sistema. Cada módulo atende uma necessidade específica do produtor rural, compartilhando cadastros, produtos e safras entre si.

### Módulos Ativos

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **FretAgru** | Gestão de fretes agrícolas (operações, ordens, romaneios, veículos, preços) | ✅ Ativo |
| **ContAgru** | Gestão de contratos de venda e compra de insumos agrícolas | 🚧 Em desenvolvimento |

### Entidades Universais (compartilhadas entre módulos)

- **Cadastros** — Produtores, motoristas, transportadoras, fornecedores, compradores, armazéns, fazendas
- **Produtos** — Grãos (soja, milho, sorgo, feijão) e insumos
- **Safra** — Ano safra, culturas, tipos de safra, safras combinadas

---

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18 + TypeScript + Vite + TailwindCSS |
| **Ícones** | Lucide React |
| **Gráficos** | Recharts |
| **Banco de Dados** | Supabase (PostgreSQL gerenciado) |
| **Storage** | Supabase Storage (imagens de romaneios) |
| **Deploy** | Vercel (frontend) |
| **Exportação** | xlsx + jsPDF (Excel e PDF) |
| **Mapas** | Google Maps API (@vis.gl/react-google-maps) |

> O frontend conecta diretamente ao Supabase via client SDK. Não há backend intermediário.

---

## Estrutura do Projeto

```
iAgru/
├── frontend/
│   └── src/
│       ├── components/      # Componentes reutilizáveis (Layout, Pagination, SortHeader, etc.)
│       ├── hooks/           # Hooks (useSort)
│       ├── lib/             # Configuração Supabase
│       ├── pages/           # Páginas de todos os módulos
│       ├── services/        # API (Supabase queries)
│       └── utils/           # Utilitários (format, export, importHelpers)
├── supabase/                # Migrations SQL (v1 a v24)
└── docs/                    # Documentação e planos
```

> Documentação técnica consolidada: [../PROJETO-MEMORIA-CONTEXTO.md](../PROJETO-MEMORIA-CONTEXTO.md)

---

## Módulo FretAgru — Funcionalidades

- **Dashboard BI Fretes** — BI completo estilo Power BI:
  - 5 KPIs: Total Viagens, Vol. s/Desc, Vol. c/Desc, Vlr Unit Médio, Vlr Total a Pagar
  - Seletor de unidade KG/SC/TN (padrão SC) com conversão automática
  - 8 filtros globais interativos (Ano Safra, Safra, Produto, Origem, Destino, Transportadora, Motorista, Placa)
  - 4 gráficos: Volume mensal, Valor frete mensal, Volume por produto, Status ordens
  - Tabela analítica por Transportadora/Placa/Motorista com ordenação e % do total
  - Tabela por Rota (Origem → Destino)
  - Análise de Descontos por Origem (7 tipos abertos, % desconto com badges coloridos)
  - Frete Excedente — Custo do Volume Não Vendável (mini-cards + tabela por rota)
  - Todas as linhas clicáveis → filtram automaticamente
- **Operações** — Gerenciar operações de colheita/transporte por safra
- **Ordens de Carregamento** — Controlar ordens com origem, destino, produto, transportadores
- **Romaneios** — Tickets de pesagem com pesos, 7 tipos de desconto (decimais), cálculo de frete, seletor KG/TN/SC
- **Veículos** — Cadastro de caminhões (placa, tipo, eixos, peso pauta)
- **Preços Contratados** — Tabelas de frete por rota/produto/fornecedor com cálculo de distância
- **Importação** — Wizard de 7 etapas para importar dados históricos via planilha Excel

---

## Módulo ContAgru — Funcionalidades (MVP funcional)

- **Dashboard Contratos** — Visão geral de contratos de venda e compra
- **Contratos de Venda** — Venda futura de commodities (comprador, corretor, volume, preço, FOB/CIF)
- **Compra de Insumos** — Contratos de compra de fertilizantes, defensivos, sementes
- **Vinculação FretAgru ↔ ContAgru** — Campo `contrato_venda_id` em romaneios (migration v24)

---

## Padrões do Ecossistema

### Formatação
- **Números:** ponto para milhar, vírgula para decimal (ex: 45.000 / 12,50)
- **Moeda:** R$ 1.234,56
- **Datas:** DD/MM/AAAA
- **Utilitários:** `frontend/src/utils/format.ts` (fmtInt, fmtDec, fmtBRL, fmtData, fmtKg, etc.)

### Componentes Reutilizáveis
- `SortHeader` — Ordenação clicável em colunas de tabela
- `Pagination` + `usePagination` — Paginação client-side (25/50/100)
- `ExportButtons` — Botões de exportação PDF/Excel
- `ViewModal` — Modal de visualização de detalhes

### Responsividade
- Todas as telas são responsivas (mobile + desktop)
- Sidebar colapsável em mobile
- Tabelas com scroll horizontal
- Modais em tela cheia no mobile

---

## Como Executar Localmente

```bash
cd frontend
npm install
npm run dev
```

Variáveis de ambiente necessárias (`.env`):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

---

## Licença

Projeto privado — Ecossistema iAgru © 2024-2026
