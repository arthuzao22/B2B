# B2B Marketplace - Sistema E-Commerce Completo

Sistema completo de e-commerce B2B (Business-to-Business) desenvolvido com Next.js 14+, seguindo as melhores práticas de arquitetura e segurança.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 16.1+ (App Router)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL com Prisma ORM 5.22
- **Autenticação**: NextAuth.js com JWT
- **Validação**: Zod
- **Logging**: Winston
- **Linguagem**: TypeScript (Strict Mode)

## 📦 Estrutura do Projeto

```
/b2bvendas
├── /app
│   ├── /api                # API Routes (Controllers)
│   │   ├── /auth           # Autenticação e registro
│   │   └── /produtos       # CRUD de produtos
│   ├── layout.tsx
│   └── page.tsx
├── /lib                    # Infraestrutura
│   ├── /prisma            # Cliente Prisma
│   ├── /auth              # NextAuth config e sessões
│   ├── /logger            # Winston logging
│   ├── /errors            # Classes de erro
│   └── /utils             # Utilitários
├── /modules               # Módulos de domínio (DDD)
│   ├── /auth             # Autenticação
│   └── /produtos         # Gestão de produtos
├── /shared                # Código compartilhado
│   ├── /types
│   └── /schemas
└── /prisma
    └── schema.prisma      # Schema do banco de dados
```

## 🏛️ Arquitetura

O sistema segue uma **Layered Architecture** com separação clara de responsabilidades.

## 🔐 Segurança

✅ **Autenticação**: NextAuth.js com JWT  
✅ **Validação de Entrada**: Zod schemas  
✅ **Multi-tenancy**: Filtro obrigatório por tenant  
✅ **Hash de Senhas**: bcrypt com 12 salt rounds  

## 🔧 Instalação

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run dev
```

## 📊 Status do Projeto

**Fase 1 Concluída**: ✅  
- ✅ Prisma Schema completo
- ✅ Sistema de autenticação
- ✅ Módulo de Produtos (CRUD)
- ✅ Arquitetura em camadas
- ✅ Build TypeScript com sucesso

**Próxima Fase**: Pedidos e Estoque
