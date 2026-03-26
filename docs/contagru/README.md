# ContAgru — Módulo de Contratos Agrícolas

> Módulo do ecossistema iAgru para gestão de contratos de venda futura e compra de insumos agrícolas.
> Anteriormente chamado "VendAgu", foi renomeado e integrado à plataforma iAgru.

## Visão Geral

O ContAgru gerencia contratos de venda futura de commodities (soja, milho, sorgo, feijão) e contratos de compra de insumos agrícolas. Permite rastrear compradores, corretores, volumes, preços, modalidades e status de cada contrato.

## Páginas (3)

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard Contratos | `/contratos/dashboard` | Cards resumo + gráficos de status por tipo de contrato |
| Contratos de Venda | `/contratos/venda` | CRUD completo: comprador, corretor, produto, safra, volume, preço, modalidade |
| Compra de Insumos | `/contratos/compra` | CRUD completo: fornecedor, produto, safra, quantidade, preço |

## Funcionalidades Principais

- **Contratos de venda**: número, comprador, corretor, produto, safra, volume (tons), preço (R$/ton, R$/sc), modalidade (FOB/CIF), status
- **Compra de insumos**: fornecedor, produto, safra, quantidade, unidade de medida, preço
- **Status workflow**: negociação → confirmado → em entrega → finalizado → cancelado
- **Multi-safra**: um contrato pode abranger múltiplas safras
- **Exportação**: Excel em ambas as telas
- **Vinculação**: contrato de venda ↔ romaneio FretAgru (rastreio de entregas)
- **Vinculação**: contrato de venda ↔ romaneio de saída SilAgru (expedição)

## Tabelas Supabase

| Tabela | Descrição |
|--------|-----------|
| `contratos_venda` | Venda futura: comprador, corretor, produto, safra, volume, preço, modalidade, status |
| `contratos_compra_insumo` | Compra de insumos: fornecedor, produto, safra, quantidade, preço |
| `contrato_venda_safras` | Relação N:N entre contratos de venda e safras |

## Próximas Melhorias

- Fixações parciais (X sacas a preço Y dentro de um contrato)
- Dashboard com gráficos de volume entregue vs contratado

## Status: ✅ MVP funcional
