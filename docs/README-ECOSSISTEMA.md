# Ecossistema iAgru — Visão Geral

> Atualizado em: 26/03/2026
> Documentação técnica completa: [PROJETO-MEMORIA-CONTEXTO.md](./PROJETO-MEMORIA-CONTEXTO.md)
> Roadmap detalhado: [PLANO-DESENVOLVIMENTO-iAgru.md](./PLANO-DESENVOLVIMENTO-iAgru.md)

---

## Visão Geral

Ecossistema de ferramentas de gestão agrícola desenvolvido **por produtor rural para produtores rurais**, com integração nativa aos sistemas Aegro e Irancho.

## Sistemas do Ecossistema

| Sistema | Descrição | Status | Deploy |
|---------|-----------|--------|--------|
| **CotAgru** | Gestão de orçamentos agrícolas | ✅ Ativo | GitHub |
| **PecAgru** | Análise de dados Irancho + dashboards | ✅ Ativo | GitHub |
| **DocAgru** | Gestão, análise e arquivamento de documentos | ✅ Ativo | GitHub |
| **PlanAgru** | Planejamento financeiro + comparativo Planejado × Realizado (API Aegro) | ✅ Ativo | GitHub |
| **FretAgru** | Gestão de fretes agrícolas + BI completo (17 páginas, 8 componentes) | ✅ Produção | Vercel + Supabase |
| **ContAgru** | Contratos de venda futura + compra de insumos (integrado ao FretAgru) | ✅ MVP | (integrado) |
| **SilAgru** | Armazenamento de grãos (10 páginas, 3 fases concluídas) | ✅ Produção | (integrado) |

**URL de Produção:** https://fretagru.vercel.app/

> O módulo "VendAgu" foi renomeado para **ContAgru** e está integrado à plataforma iAgru.
> O **SilAgru** (armazenamento) está completo com 3 fases: recebimento/classificação, cobranças/quebra técnica, vínculos entre módulos + PDF.

## Stack Tecnológica Real

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Estilização | TailwindCSS |
| Ícones | Lucide React |
| Gráficos | Recharts |
| Backend/DB | Supabase (PostgreSQL + Auth + Storage) — **sem backend intermediário** |
| Deploy | Vercel (auto-deploy branch master) |

> O frontend conecta diretamente ao Supabase via client SDK (`@supabase/supabase-js`).

## Estrutura de Pastas

```
FretAgru/                          # Repositório principal (GitHub: CotAgru/FretAgru)
├── frontend/src/                  # React 18 + TS + Vite + TailwindCSS
│   ├── components/                # 8 componentes reutilizáveis
│   ├── pages/                     # 27 páginas (FretAgru + ContAgru + SilAgru + Universais)
│   │   └── armazem/               # 10 páginas SilAgru
│   ├── services/api.ts            # Queries Supabase (790+ linhas)
│   └── utils/format.ts            # Formatação pt-BR
├── supabase/                      # 29 migrations (v1 a v25)
├── docs/                          # Documentação do ecossistema
│   ├── PROJETO-MEMORIA-CONTEXTO.md # Memória técnica consolidada
│   ├── PLANO-DESENVOLVIMENTO-iAgru.md # Roadmap detalhado
│   ├── README-ECOSSISTEMA.md      # Este arquivo
│   └── PLANO-AUTH-iAgru.md        # Plano de autenticação
├── iAgru-Ecosystem/               # Lib compartilhada (em avaliação)
└── README.md
```

## Integrações

- **Aegro** — ERP agrícola: sync de safras, produtos, cadastros (fase 1 concluída: conexão + teste)
- **Irancho** — Gestão pecuária: análise de dados via PecAgru

## Convenções do Ecossistema

- **Números:** ponto `"."` para milhar, vírgula `","` para decimal (ex: 45.000 / 12,50)
- **Moeda:** R$ 1.234,56
- **Datas:** DD/MM/AAAA
- **Volumes:** armazenados em KG, exibidos em KG/SC/TN conforme seletor
- **Tabelas:** ordenação clicável em todas as colunas (obrigatório)

## Como Executar

```bash
cd FretAgru/frontend
npm install
npm run dev          # http://localhost:3000
```

---

Desenvolvido por produtor rural para produtores rurais.
Contato: contato@cotagru.com.br
GitHub: CotAgru (contato@cotagru.com.br)

*"De produtor para produtor, simplificando a gestão do campo"*
