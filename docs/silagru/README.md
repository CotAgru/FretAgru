# SilAgru — Módulo de Armazenamento de Grãos

> Módulo do ecossistema iAgru para gestão completa de armazenamento agrícola.
> 3 fases de desenvolvimento concluídas.

## Visão Geral

O SilAgru gerencia todo o ciclo de armazenamento de grãos: recebimento com classificação e descontos, controle de estoque por depositante, tarifas de serviço, quebra técnica diária, cobranças e fechamento mensal com extrato PDF.

## Páginas (10)

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard Armazém | `/armazem/dashboard` | 7 KPIs + gráfico barras movimentação mensal + gráfico pizza estoque por produto |
| Unidades/Silos | `/armazem/unidades` | CRUD unidades armazenadoras + estruturas de armazenamento |
| Romaneios Entrada | `/armazem/entrada` | Classificação + descontos automáticos + vínculo FretAgru |
| Romaneios Saída | `/armazem/saida` | Expedição + vínculo ContAgru (contrato de venda) |
| Estoque | `/armazem/estoque` | Saldo por depositante × produto (entradas - saídas) |
| Tabelas de Desconto | `/armazem/tabelas-desconto` | CRUD + faixas grau→desconto% + importação Excel |
| Tarifas de Serviço | `/armazem/tarifas` | 12 categorias configuráveis por produto |
| Quebra Técnica | `/armazem/quebra-tecnica` | Cálculo diário (0,01%/dia) por depositante × produto |
| Cobranças | `/armazem/cobrancas` | CRUD + geração em lote a partir de tarifas × volume |
| Fechamento Mensal | `/armazem/fechamento` | Extrato consolidado por depositante + exportação PDF |

## Fases de Desenvolvimento

### Fase 1 — Recebimento, Classificação, Estoque e Tarifas
- Migration v25: 9 tabelas
- 7 páginas iniciais
- Cálculo automático de descontos por interpolação nas tabelas
- Estoque por depositante × produto
- Menu lateral cor âmbar

### Fase 2 — Quebra Técnica, Cobranças e Fechamento
- Quebra Técnica (0,01%/dia configurável)
- Cobranças (CRUD + geração em lote)
- Fechamento Mensal (extrato consolidado)
- Dashboard BI avançado (7 KPIs + gráficos Recharts)

### Fase 3 — Vínculos, Importação Excel e PDF
- Vínculo FretAgru → SilAgru (romaneio_frete_id)
- Vínculo SilAgru → ContAgru (contrato_venda_id)
- Importação Excel de faixas de desconto (.xlsx/.xls/.csv)
- Extrato PDF (jsPDF + autoTable)

## Lógicas Complexas

### Cálculo de Descontos na Recepção
1. Busca tabelas de desconto vigentes para o produto
2. Para cada tipo (umidade, impureza, etc.), interpola grau medido na faixa grau→desconto
3. Calcula desconto em kg: `peso_liquido × (desconto% / 100)`
4. Soma todos os descontos → `peso_corrigido = peso_liquido - desconto_total`
5. Credita peso_corrigido ao saldo do depositante

### 12 Categorias de Tarifas
Recebimento, secagem, estocagem, ad valorem, expedição, transbordo, pesagem avulsa, classificação, expurgo, transgenia, taxa permanência, outros.

## Tabelas Supabase (Migration v25)

| Tabela | Descrição |
|--------|-----------|
| `unidades_armazenadoras` | Armazéns físicos |
| `estruturas_armazenamento` | Silos/tulhas dentro de cada unidade |
| `tabelas_desconto` | Tabelas por produto × tipo × safra |
| `faixas_desconto` | Faixas grau→desconto% |
| `tarifas_armazenagem` | Tarifas por categoria |
| `tarifa_itens` | Itens vinculados a cada tarifa |
| `romaneios_armazem` | Romaneios entrada/saída com classificação e vínculos |
| `quebra_tecnica` | Registro diário de perda técnica |
| `cobrancas_armazenagem` | Cobranças geradas |

## Status: ✅ Produção (3 fases concluídas)
