# Guia de Desenvolvimento - Ecossistema iAgru

## Visão Geral
Este documento orienta o desenvolvimento dos sistemas do ecossistema iAgru, mantendo consistência e boas práticas.

## Stack Tecnológico Padrão

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilos**: TailwindCSS
- **State Management**: React Query
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express + TypeScript
- **Banco de Dados**: PostgreSQL
- **ORM**: Knex.js
- **Autenticação**: JWT
- **Validação**: Joi
- **HTTP Client**: Axios

## Estrutura de Projetos

### Frontend
```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes UI básicos
│   │   ├── forms/          # Formulários
│   │   └── layout/         # Layout components
│   ├── pages/              # Páginas da aplicação
│   ├── hooks/              # Hooks customizados
│   ├── services/           # Serviços de API
│   ├── utils/              # Utilitários
│   ├── types/              # Tipos TypeScript
│   └── styles/             # Estilos globais
├── public/                 # Arquivos estáticos
└── package.json
```

### Backend
```
backend/
├── src/
│   ├── routes/             # Rotas da API
│   ├── controllers/        # Controllers
│   ├── services/           # Lógica de negócio
│   ├── models/             # Models do banco
│   ├── middleware/         # Middlewares
│   ├── utils/              # Utilitários
│   ├── database/           # Configurações do DB
│   │   ├── migrations/     # Migrations
│   │   └── seeds/          # Seeds
│   └── types/              # Tipos TypeScript
├── .env.example            # Variáveis de ambiente
└── package.json
```

## Padrões de Código

### TypeScript
- Usar tipos estritos
- Interfaces para objetos
- Enums para constantes
- Evitar `any`

### React
- Componentes funcionais
- Hooks para estado e efeitos
- Props com interfaces
- Nomes descritivos

### Backend
- Controllers finos
- Services com lógica
- Middleware para validação
- Tratamento de erros

## Integrações

### Aegro API
- Endpoint base: `https://api.aegro.com.br`
- Autenticação: Bearer Token
- Rate limit: 1000 req/hora

### Irancho API
- Endpoint base: `https://api.irancho.com.br`
- Autenticação: API Key
- Rate limit: 500 req/hora

## Ambiente de Desenvolvimento

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Git

### Setup
```bash
# Clonar repositório
git clone <repo-url>
cd iagru-ecosystem

# Instalar dependências
npm install

# Configurar ambiente
cp backend/.env.example backend/.env
# Editar .env com suas credenciais

# Setup do banco
npm run migrate
npm run seed

# Iniciar desenvolvimento
npm run dev
```

## Deploy

### Frontend (Vercel)
```bash
npm run build
vercel --prod
```

### Backend (Railway/Heroku)
```bash
npm run build
npm start
```

## Testes

### Unitários
- Jest + React Testing Library
- Cobertura mínima: 80%

### Integração
- Supertest para APIs
- Banco de dados de teste

## Boas Práticas

### Git
- Commits semânticos
- Branches por feature
- Pull requests obrigatórios

### Performance
- Lazy loading de componentes
- Cache de requisições
- Otimização de imagens

### Segurança
- Variáveis de ambiente
- Validação de entrada
- HTTPS em produção

## Monitoramento

### Logs
- Estruturados com JSON
- Níveis: ERROR, WARN, INFO, DEBUG
- Centralizados em serviço externo

### Métricas
- Tempo de resposta
- Taxa de erro
- Uso de recursos

## Suporte

### Documentação
- README em cada projeto
- Comentários no código
- API docs com Swagger

### Canais
- Slack para desenvolvimento
- GitHub Issues para bugs
- Confluence para documentação
