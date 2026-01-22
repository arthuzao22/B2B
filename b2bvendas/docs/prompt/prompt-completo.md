# Prompt: Sistema B2B Vendas - Correção, Organização e Frontend Completo

## 🎯 Objetivo Principal

Você é um desenvolvedor sênior especializado em Next.js 14+, TypeScript e React. Sua tarefa é:

1. **Corrigir todos os erros** do projeto
2. **Organizar a estrutura de código** (remover duplicações)
3. **Criar o frontend completo** da aplicação B2B de vendas

---

## 📋 Contexto do Projeto

### Descrição
Sistema B2B de vendas que conecta fornecedores a clientes empresariais. O backend e schema do banco já existem, mas o frontend está incompleto.

### Stack Tecnológica
- **Framework**: Next.js 14+ (App Router)
- **Linguagem**: TypeScript
- **Estilização**: TailwindCSS
- **UI Components**: Radix UI / shadcn/ui
- **Banco de Dados**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **Autenticação**: NextAuth.js

### Tipos de Usuário
1. **Admin** - Gerencia toda a plataforma
2. **Fornecedor** - Cadastra produtos, gerencia pedidos, define preços
3. **Cliente** - Visualiza catálogo, faz pedidos, acompanha entregas

---

## 🔧 Problema 1: Estrutura Duplicada

O projeto tem código duplicado em duas pastas:
- `/lib/` e `/src/lib/` (duplicados)
- `/modules/` e `/src/modules/` (duplicados)
- `/src/components/` (deveria estar em `/components/`)

### Solução Necessária:
1. Mover `/src/components/` → `/components/`
2. Unificar `/lib/` + `/src/lib/` → `/lib/`
3. Unificar `/modules/` + `/src/modules/` → `/modules/`
4. Mover `/src/types/` → `/types/`
5. Remover pasta `/src/`
6. Atualizar TODOS os imports de `@/src/...` para `@/...`

---

## 🔧 Problema 2: Erros de TypeScript

### Erros Conhecidos:
1. **Logger imports**: Usar `import { logger } from '@/lib/logger'` (named export)
2. **Prisma Client**: Configurar com adapter PostgreSQL para Prisma 7
3. **Role vs TipoUsuario**: O schema usa `TipoUsuario`, não `Role`
4. **Session types**: Usar tipos corretos do NextAuth

---

## 🎨 Problema 3: Frontend Incompleto

### Páginas que Precisam Ser Criadas:

#### Páginas Públicas
- [ ] `/` - Landing page atraente
- [ ] `/login` - Tela de login (existe, precisa melhorar UI)
- [ ] `/register` - Tela de cadastro (existe, precisa melhorar UI)
- [ ] `/catalogo` - Catálogo público de produtos

#### Dashboard do Fornecedor (`/dashboard/fornecedor/`)
- [ ] `/dashboard/fornecedor` - Página inicial com métricas
- [ ] `/dashboard/fornecedor/produtos` - Lista de produtos (existe parcialmente)
- [ ] `/dashboard/fornecedor/produtos/novo` - Criar produto
- [ ] `/dashboard/fornecedor/produtos/[id]/editar` - Editar produto
- [ ] `/dashboard/fornecedor/categorias` - Gerenciar categorias
- [ ] `/dashboard/fornecedor/pedidos` - Lista de pedidos recebidos
- [ ] `/dashboard/fornecedor/pedidos/[id]` - Detalhes do pedido
- [ ] `/dashboard/fornecedor/clientes` - Lista de clientes
- [ ] `/dashboard/fornecedor/precos` - Listas de preços
- [ ] `/dashboard/fornecedor/estoque` - Controle de estoque
- [ ] `/dashboard/fornecedor/configuracoes` - Configurações da conta

#### Dashboard do Cliente (`/dashboard/cliente/`)
- [ ] `/dashboard/cliente` - Página inicial
- [ ] `/dashboard/cliente/catalogo` - Catálogo de produtos
- [ ] `/dashboard/cliente/carrinho` - Carrinho de compras
- [ ] `/dashboard/cliente/pedidos` - Meus pedidos
- [ ] `/dashboard/cliente/pedidos/[id]` - Detalhes do pedido
- [ ] `/dashboard/cliente/favoritos` - Produtos favoritos
- [ ] `/dashboard/cliente/configuracoes` - Configurações

#### Dashboard Admin (`/dashboard/admin/`)
- [ ] `/dashboard/admin` - Visão geral
- [ ] `/dashboard/admin/usuarios` - Gerenciar usuários
- [ ] `/dashboard/admin/fornecedores` - Gerenciar fornecedores
- [ ] `/dashboard/admin/relatorios` - Relatórios

---

## 🗄️ Schema do Banco (Modelos Principais)

```prisma
// Usuários
Usuario { id, email, senha, nome, tipo: TipoUsuario, telefone, avatar, ativo }

// Fornecedores
Fornecedor { id, usuarioId, razaoSocial, nomeFantasia, slug, cnpj, descricao, logo }

// Clientes
Cliente { id, usuarioId, razaoSocial, cnpj, endereco }

// Produtos
Produto { id, fornecedorId, nome, slug, sku, descricao, precoBase, imagens[], quantidadeEstoque }

// Categorias
Categoria { id, nome, slug, descricao, categoriaPaiId }

// Pedidos
Pedido { id, numeroPedido, clienteId, fornecedorId, status, subtotal, total, itens[] }

// Notificações
Notificacao { id, usuarioId, titulo, mensagem, tipo, lida }
```

---

## 🎨 Diretrizes de Design

### Estilo Visual
- **Tema**: Moderno, profissional, modo claro
- **Cores Primárias**: Azul (#2563EB), Cinza escuro para texto
- **Estilo**: Clean, com cards, sombras suaves, bordas arredondadas
- **Responsivo**: Mobile-first

### Componentes UI Necessários
- [ ] Sidebar navegável com menu colapsível
- [ ] Header com busca, notificações e perfil
- [ ] Cards de métricas/estatísticas
- [ ] Tabelas com filtros, paginação e ordenação
- [ ] Formulários com validação
- [ ] Modais de confirmação
- [ ] Toasts para feedback
- [ ] Loading states e skeleton loaders
- [ ] Empty states

---

## ✅ Ordem de Execução

### Fase 1: Correção de Estrutura
1. Unificar pastas duplicadas
2. Atualizar todos os imports
3. Corrigir erros de TypeScript
4. Verificar build (`npm run build`)

### Fase 2: Componentes Base
1. Criar sistema de layout (Sidebar, Header)
2. Implementar componentes UI reutilizáveis
3. Configurar tema e variáveis CSS

### Fase 3: Autenticação
1. Melhorar páginas de login/registro
2. Configurar redirecionamento por tipo de usuário
3. Implementar proteção de rotas

### Fase 4: Dashboard Fornecedor
1. Página inicial com métricas
2. CRUD completo de produtos
3. Gerenciamento de categorias
4. Gestão de pedidos
5. Controle de estoque

### Fase 5: Dashboard Cliente
1. Catálogo de produtos
2. Sistema de carrinho
3. Fluxo de pedidos
4. Histórico de compras

### Fase 6: Dashboard Admin
1. Gestão de usuários
2. Relatórios e métricas

---

## 📝 Notas Importantes

1. **Prisma 7**: Usar com adapter PostgreSQL (`@prisma/adapter-pg`)
2. **Imports**: Sempre usar `@/` para caminho absoluto
3. **Validação**: Usar Zod para validação de formulários
4. **Estado**: Usar React Query para fetching, Zustand se necessário
5. **Seed**: Criar script de seed funcional para testes

---

## 🚀 Resultado Esperado

Uma aplicação B2B completamente funcional com:
- Interface profissional e responsiva
- Código organizado e sem duplicações
- Zero erros de TypeScript
- Todas as funcionalidades CRUD funcionando
- UX/UI de alta qualidade
