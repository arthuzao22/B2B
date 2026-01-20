# 🚀 Prompt: Sistema E-Commerce B2B Marketplace Completo

## Objetivo Principal

Crie um **sistema completo de e-commerce B2B (Business-to-Business)** - uma plataforma marketplace moderna e profissional que conecta fornecedores e compradores empresariais em um ambiente digital sofisticado.

---

## 🛠️ Stack Tecnológica Obrigatória

- **Frontend**: Next.js 14+ (App Router)
- **Estilização**: Tailwind CSS
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: NextAuth.js com JWT
- **Estado Global**: Redux Toolkit ou Zustand
- **Real-time**: Socket.io para WebSockets
- **Logs**: Winston para logging avançado
- **Validação**: Zod para schemas
- **UI Components**: Shadcn/ui ou Radix UI

---

## 👥 Perfis de Usuário e Funcionalidades

### 1. 🌐 Visitantes Públicos (Sem Autenticação)

**Rotas Públicas:**
- `/` - Landing page com apresentação do marketplace
- `/fornecedores` - Lista de todos os fornecedores cadastrados
- `/catalogo-publico` - Navegação de produtos sem login
- `/fornecedor/:slug` - Catálogo específico de cada fornecedor (usando slug único)

**Funcionalidades:**
- Visualização de catálogos sem necessidade de login
- Busca e filtros de produtos
- Visualização de informações dos fornecedores
- Interface responsiva e atrativa

### 2. 🛒 Compradores (Buyers/Clients) - Role: `client`

**Rotas Protegidas:**
- `/dashboard/cliente` - Painel do comprador
- `/carrinho` - Carrinho de compras
- `/pedidos` - Histórico de pedidos
- `/rastreamento/:orderId` - Rastreamento de entregas

**Funcionalidades:**
- Ver **preços personalizados** baseados em suas listas de preços atribuídas
- Carrinho de compras com estado persistente
- Finalização de pedidos
- Acompanhamento de histórico de pedidos
- Rastreamento de entregas em tempo real
- Recebimento de notificações de atualizações de pedidos

### 3. 🏭 Fornecedores (Suppliers) - Role: `supplier`

**Rotas Protegidas:**
- `/dashboard/fornecedor` - Dashboard principal com analytics
- `/dashboard/fornecedor/produtos` - CRUD de produtos
- `/dashboard/fornecedor/pedidos` - Gestão de pedidos
- `/dashboard/fornecedor/estoque` - Controle de estoque
- `/dashboard/fornecedor/precos` - Gestão de precificação
- `/dashboard/fornecedor/clientes` - Gestão de clientes
- `/dashboard/fornecedor/configuracoes` - Configurações do perfil/loja

**Funcionalidades:**

**Dashboard Analytics:**
- KPIs em cards: Total de vendas, Pedidos do mês, Ticket médio, Clientes ativos
- Gráficos de vendas por período (diário, semanal, mensal)
- Top 10 produtos mais vendidos
- Pedidos recentes
- Alertas de estoque baixo

**Gestão de Produtos:**
- CRUD completo (Criar, Ler, Atualizar, Deletar)
- Upload de múltiplas imagens
- Categorização de produtos
- SKU único por produto
- Descrição rica com markdown
- Status: ativo/inativo
- Preço base do produto

**Gerenciamento de Pedidos:**
- Lista de pedidos com filtros (status, data, cliente)
- Visualização detalhada do pedido
- Atualização de status: `pending` → `confirmed` → `processing` → `shipped` → `delivered` → `cancelled`
- Histórico de alterações de status
- Envio de notificações automáticas ao cliente

**Controle de Estoque:**
- Quantidade atual, mínima e máxima por produto
- Movimentações: entrada, saída, ajuste
- Motivo obrigatório para cada movimentação
- Alertas automáticos quando estoque ≤ quantidade mínima
- Histórico completo de movimentações com auditoria

**Sistema de Precificação Avançado (3 Níveis):**

1. **Preço Base**: Definido no cadastro do produto
2. **Listas de Preços (Price Lists)**: Grupos de clientes com % de desconto ou markup
3. **Preços Customizados (Custom Prices)**: Preço específico por produto/cliente

**Hierarquia de Precificação:**
```
Preço Customizado > Lista de Preços > Preço Base
```

### 4. 👑 Administradores - Role: `admin`

**Rotas Protegidas:**
- `/admin` - Painel administrativo
- `/admin/usuarios` - Gestão de usuários
- `/admin/fornecedores` - Gestão de fornecedores
- `/admin/relatorios` - Relatórios gerais

**Funcionalidades:**
- Gestão completa de usuários
- Aprovação de novos fornecedores
- Relatórios consolidados do marketplace
- Configurações globais do sistema

---

## 📊 Modelos de Dados (Prisma Schema) - Em Português

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==========================================
// ENUMS - Tipos Enumerados
// ==========================================

enum TipoUsuario {
  admin       // Administrador do sistema
  fornecedor  // Fornecedor/Vendedor
  cliente     // Comprador/Cliente
}

enum StatusPedido {
  pendente      // Aguardando confirmação
  confirmado    // Pedido confirmado
  processando   // Em processamento/preparação
  enviado       // Enviado para entrega
  entregue      // Entrega realizada
  cancelado     // Pedido cancelado
}

enum TipoMovimentacao {
  entrada   // Entrada de mercadoria
  saida     // Saída de mercadoria
  ajuste    // Ajuste de inventário
}

enum TipoDesconto {
  percentual  // Desconto em porcentagem
  fixo        // Desconto em valor fixo
}

// ==========================================
// MODELO: Usuario
// Usuários do sistema (todos os perfis)
// ==========================================
model Usuario {
  id            String       @id @default(cuid())
  email         String       @unique
  senha         String
  nome          String
  tipo          TipoUsuario  @default(cliente)
  telefone      String?
  avatar        String?
  ativo         Boolean      @default(true)
  criadoEm      DateTime     @default(now()) @map("criado_em")
  atualizadoEm  DateTime     @updatedAt @map("atualizado_em")
  
  // Relacionamentos
  fornecedor    Fornecedor?
  cliente       Cliente?
  notificacoes  Notificacao[]
  
  @@map("usuarios")
}

// ==========================================
// MODELO: Fornecedor
// Empresas que vendem produtos na plataforma
// ==========================================
model Fornecedor {
  id              String    @id @default(cuid())
  usuarioId       String    @unique @map("usuario_id")
  usuario         Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  razaoSocial     String    @map("razao_social")
  nomeFantasia    String?   @map("nome_fantasia")
  slug            String    @unique
  cnpj            String    @unique
  descricao       String?
  logo            String?
  banner          String?
  endereco        String?
  cidade          String?
  estado          String?
  cep             String?
  verificado      Boolean   @default(false)
  criadoEm        DateTime  @default(now()) @map("criado_em")
  atualizadoEm    DateTime  @updatedAt @map("atualizado_em")
  
  // Relacionamentos
  produtos        Produto[]
  pedidos         Pedido[]
  listasPreco     ListaPreco[]
  clientes        ClienteFornecedor[]
  
  @@map("fornecedores")
}

// ==========================================
// MODELO: Cliente
// Empresas compradoras na plataforma
// ==========================================
model Cliente {
  id              String    @id @default(cuid())
  usuarioId       String    @unique @map("usuario_id")
  usuario         Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  razaoSocial     String    @map("razao_social")
  nomeFantasia    String?   @map("nome_fantasia")
  cnpj            String    @unique
  inscricaoEstadual String? @map("inscricao_estadual")
  endereco        String?
  cidade          String?
  estado          String?
  cep             String?
  criadoEm        DateTime  @default(now()) @map("criado_em")
  atualizadoEm    DateTime  @updatedAt @map("atualizado_em")
  
  // Relacionamentos
  pedidos         Pedido[]
  precosCustomizados PrecoCustomizado[]
  fornecedores    ClienteFornecedor[]
  
  @@map("clientes")
}

// ==========================================
// MODELO: ClienteFornecedor
// Relacionamento N:N entre Cliente e Fornecedor
// ==========================================
model ClienteFornecedor {
  id              String      @id @default(cuid())
  clienteId       String      @map("cliente_id")
  cliente         Cliente     @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  fornecedorId    String      @map("fornecedor_id")
  fornecedor      Fornecedor  @relation(fields: [fornecedorId], references: [id], onDelete: Cascade)
  listaPrecoId    String?     @map("lista_preco_id")
  listaPreco      ListaPreco? @relation(fields: [listaPrecoId], references: [id])
  criadoEm        DateTime    @default(now()) @map("criado_em")
  
  @@unique([clienteId, fornecedorId])
  @@map("clientes_fornecedores")
}

// ==========================================
// MODELO: Categoria
// Categorias de produtos (hierárquica)
// ==========================================
model Categoria {
  id              String      @id @default(cuid())
  nome            String
  slug            String      @unique
  descricao       String?
  imagem          String?
  categoriaPaiId  String?     @map("categoria_pai_id")
  categoriaPai    Categoria?  @relation("CategoriaFilhos", fields: [categoriaPaiId], references: [id])
  subcategorias   Categoria[] @relation("CategoriaFilhos")
  produtos        Produto[]
  criadoEm        DateTime    @default(now()) @map("criado_em")
  atualizadoEm    DateTime    @updatedAt @map("atualizado_em")
  
  @@map("categorias")
}

// ==========================================
// MODELO: Produto
// Produtos do catálogo
// ==========================================
model Produto {
  id                  String    @id @default(cuid())
  fornecedorId        String    @map("fornecedor_id")
  fornecedor          Fornecedor @relation(fields: [fornecedorId], references: [id], onDelete: Cascade)
  categoriaId         String?   @map("categoria_id")
  categoria           Categoria? @relation(fields: [categoriaId], references: [id])
  nome                String
  slug                String
  sku                 String
  descricao           String?
  precoBase           Decimal   @map("preco_base") @db.Decimal(10, 2)
  imagens             String[]
  ativo               Boolean   @default(true)
  
  // Controle de Estoque
  quantidadeEstoque   Int       @default(0) @map("quantidade_estoque")
  estoqueMinimo       Int       @default(0) @map("estoque_minimo")
  estoqueMaximo       Int       @default(1000) @map("estoque_maximo")
  
  // Informações adicionais
  peso                Decimal?  @db.Decimal(10, 3) // em kg
  unidadeMedida       String?   @map("unidade_medida") // un, kg, cx, etc
  
  criadoEm            DateTime  @default(now()) @map("criado_em")
  atualizadoEm        DateTime  @updatedAt @map("atualizado_em")
  
  // Relacionamentos
  itensPedido         ItemPedido[]
  precosCustomizados  PrecoCustomizado[]
  itensListaPreco     ItemListaPreco[]
  movimentacoesEstoque MovimentacaoEstoque[]
  
  @@unique([fornecedorId, sku])
  @@unique([fornecedorId, slug])
  @@map("produtos")
}

// ==========================================
// MODELO: ListaPreco
// Listas de preços para grupos de clientes
// ==========================================
model ListaPreco {
  id              String        @id @default(cuid())
  fornecedorId    String        @map("fornecedor_id")
  fornecedor      Fornecedor    @relation(fields: [fornecedorId], references: [id], onDelete: Cascade)
  nome            String
  descricao       String?
  tipoDesconto    TipoDesconto  @default(percentual) @map("tipo_desconto")
  valorDesconto   Decimal       @map("valor_desconto") @db.Decimal(10, 2)
  ativo           Boolean       @default(true)
  criadoEm        DateTime      @default(now()) @map("criado_em")
  atualizadoEm    DateTime      @updatedAt @map("atualizado_em")
  
  // Relacionamentos
  itens           ItemListaPreco[]
  clientes        ClienteFornecedor[]
  
  @@map("listas_preco")
}

// ==========================================
// MODELO: ItemListaPreco
// Itens específicos de uma lista de preços
// ==========================================
model ItemListaPreco {
  id              String      @id @default(cuid())
  listaPrecoId    String      @map("lista_preco_id")
  listaPreco      ListaPreco  @relation(fields: [listaPrecoId], references: [id], onDelete: Cascade)
  produtoId       String      @map("produto_id")
  produto         Produto     @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  precoEspecial   Decimal?    @map("preco_especial") @db.Decimal(10, 2)
  
  @@unique([listaPrecoId, produtoId])
  @@map("itens_lista_preco")
}

// ==========================================
// MODELO: PrecoCustomizado
// Preço específico por cliente/produto
// ==========================================
model PrecoCustomizado {
  id              String    @id @default(cuid())
  clienteId       String    @map("cliente_id")
  cliente         Cliente   @relation(fields: [clienteId], references: [id], onDelete: Cascade)
  produtoId       String    @map("produto_id")
  produto         Produto   @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  preco           Decimal   @db.Decimal(10, 2)
  criadoEm        DateTime  @default(now()) @map("criado_em")
  atualizadoEm    DateTime  @updatedAt @map("atualizado_em")
  
  @@unique([clienteId, produtoId])
  @@map("precos_customizados")
}

// ==========================================
// MODELO: Pedido
// Pedidos de compra
// ==========================================
model Pedido {
  id                    String        @id @default(cuid())
  numeroPedido          String        @unique @map("numero_pedido")
  clienteId             String        @map("cliente_id")
  cliente               Cliente       @relation(fields: [clienteId], references: [id])
  fornecedorId          String        @map("fornecedor_id")
  fornecedor            Fornecedor    @relation(fields: [fornecedorId], references: [id])
  status                StatusPedido  @default(pendente)
  subtotal              Decimal       @db.Decimal(10, 2)
  desconto              Decimal       @default(0) @db.Decimal(10, 2)
  frete                 Decimal       @default(0) @db.Decimal(10, 2)
  total                 Decimal       @db.Decimal(10, 2)
  observacoes           String?
  
  // Endereço de entrega
  enderecoEntrega       String?       @map("endereco_entrega")
  cidadeEntrega         String?       @map("cidade_entrega")
  estadoEntrega         String?       @map("estado_entrega")
  cepEntrega            String?       @map("cep_entrega")
  
  // Rastreamento
  codigoRastreio        String?       @map("codigo_rastreio")
  previsaoEntrega       DateTime?     @map("previsao_entrega")
  dataEntrega           DateTime?     @map("data_entrega")
  
  criadoEm              DateTime      @default(now()) @map("criado_em")
  atualizadoEm          DateTime      @updatedAt @map("atualizado_em")
  
  // Relacionamentos
  itens                 ItemPedido[]
  historicoStatus       HistoricoStatusPedido[]
  
  @@map("pedidos")
}

// ==========================================
// MODELO: ItemPedido
// Itens de um pedido
// ==========================================
model ItemPedido {
  id              String    @id @default(cuid())
  pedidoId        String    @map("pedido_id")
  pedido          Pedido    @relation(fields: [pedidoId], references: [id], onDelete: Cascade)
  produtoId       String    @map("produto_id")
  produto         Produto   @relation(fields: [produtoId], references: [id])
  quantidade      Int
  precoUnitario   Decimal   @map("preco_unitario") @db.Decimal(10, 2)
  precoTotal      Decimal   @map("preco_total") @db.Decimal(10, 2)
  
  @@unique([pedidoId, produtoId])
  @@map("itens_pedido")
}

// ==========================================
// MODELO: HistoricoStatusPedido
// Histórico de alterações de status do pedido
// ==========================================
model HistoricoStatusPedido {
  id              String        @id @default(cuid())
  pedidoId        String        @map("pedido_id")
  pedido          Pedido        @relation(fields: [pedidoId], references: [id], onDelete: Cascade)
  status          StatusPedido
  observacao      String?
  criadoEm        DateTime      @default(now()) @map("criado_em")
  criadoPor       String?       @map("criado_por")
  
  @@map("historico_status_pedidos")
}

// ==========================================
// MODELO: MovimentacaoEstoque
// Registro de movimentações de estoque
// ==========================================
model MovimentacaoEstoque {
  id                String           @id @default(cuid())
  produtoId         String           @map("produto_id")
  produto           Produto          @relation(fields: [produtoId], references: [id], onDelete: Cascade)
  tipo              TipoMovimentacao
  quantidade        Int
  estoqueAnterior   Int              @map("estoque_anterior")
  estoqueAtual      Int              @map("estoque_atual")
  motivo            String
  referencia        String?          // Ex: ID do pedido, número do ajuste
  criadoEm          DateTime         @default(now()) @map("criado_em")
  criadoPor         String?          @map("criado_por")
  
  @@map("movimentacoes_estoque")
}

// ==========================================
// MODELO: Notificacao
// Notificações do sistema
// ==========================================
model Notificacao {
  id              String    @id @default(cuid())
  usuarioId       String    @map("usuario_id")
  usuario         Usuario   @relation(fields: [usuarioId], references: [id], onDelete: Cascade)
  titulo          String
  mensagem        String
  tipo            String    // pedido, estoque, sistema
  lida            Boolean   @default(false)
  dados           Json?     // Dados adicionais (pedidoId, produtoId, etc)
  criadoEm        DateTime  @default(now()) @map("criado_em")
  
  @@map("notificacoes")
}
```

---

## 🔐 Sistema de Autenticação

### Implementar com NextAuth.js:

```typescript
// Configurações requeridas:
- Provider: Credentials (email/password)
- JWT Strategy
- Session com dados do usuário e role
- Middleware para proteção de rotas
- Refresh token rotation

// Páginas de autenticação:
- /login
- /registro (com seleção de tipo: comprador ou fornecedor)
- /esqueci-senha
- /redefinir-senha
```

### Middleware de Proteção:

```typescript
// Verificar role do usuário para cada rota:
- /dashboard/cliente/* → role: client
- /dashboard/fornecedor/* → role: supplier
- /admin/* → role: admin
```

---

## 🛒 Carrinho de Compras

### Funcionalidades:

1. **Estado Persistente**: Usar Redux/Zustand + localStorage
2. **Por Fornecedor**: Um carrinho por fornecedor (não misturar produtos)
3. **Cálculos Automáticos**: 
   - Subtotal
   - Descontos (se aplicável)
   - Frete (integração futura)
   - Total

### Estrutura do Estado:

```typescript
interface CartState {
  supplierId: string;
  supplierName: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number; // Preço aplicado (customizado, lista ou base)
  totalPrice: number;
}
```

---

## 📦 Sistema de Estoque

### Regras de Negócio:

1. **Atualização Automática**: Ao confirmar pedido, decrementar estoque
2. **Cancelamento**: Ao cancelar pedido, incrementar estoque
3. **Alertas**: Quando `stockQuantity <= minStock`, gerar alerta
4. **Validação**: Não permitir pedido se `quantity > stockQuantity`
5. **Auditoria**: Toda movimentação deve ser registrada com motivo

### Tipos de Movimentação:

- `entry`: Entrada de mercadoria
- `exit`: Saída (venda, perda, etc)
- `adjustment`: Ajuste de inventário

---

## 💰 Sistema de Precificação

### Lógica de Cálculo de Preço:

```typescript
function getProductPrice(productId: string, clientId: string): Decimal {
  // 1. Verificar se existe preço customizado
  const customPrice = await getCustomPrice(productId, clientId);
  if (customPrice) return customPrice.price;
  
  // 2. Verificar se cliente está em uma lista de preços
  const priceListItem = await getPriceListItem(productId, clientId);
  if (priceListItem) {
    if (priceListItem.customPrice) return priceListItem.customPrice;
    // Aplicar desconto da lista
    return applyDiscount(product.basePrice, priceList.discountType, priceList.discountValue);
  }
  
  // 3. Retornar preço base
  return product.basePrice;
}
```

---

## 🔔 Sistema de Notificações em Tempo Real

### Implementação com Socket.io:

```typescript
// Eventos a implementar:

// Servidor → Cliente
- 'new-order': Novo pedido recebido (para fornecedor)
- 'order-status-update': Atualização de status (para cliente)
- 'low-stock-alert': Alerta de estoque baixo (para fornecedor)
- 'notification': Notificação genérica

// Cliente → Servidor
- 'join-room': Entrar na sala do usuário
- 'mark-as-read': Marcar notificação como lida
```

### Persistência:

- Salvar notificações no banco de dados
- Carregar notificações não lidas ao fazer login
- Badge com contador de não lidas no header

---

## 📊 Dashboard Analytics

### KPIs para Fornecedores:

```typescript
interface SupplierKPIs {
  totalRevenue: number;          // Faturamento total
  monthlyRevenue: number;        // Faturamento do mês
  totalOrders: number;           // Total de pedidos
  monthlyOrders: number;         // Pedidos do mês
  averageTicket: number;         // Ticket médio
  activeClients: number;         // Clientes ativos
  pendingOrders: number;         // Pedidos pendentes
  lowStockProducts: number;      // Produtos com estoque baixo
}
```

### Gráficos:

1. **Vendas por Período**: Line chart com filtro (7d, 30d, 90d, 1y)
2. **Top Produtos**: Bar chart horizontal
3. **Status de Pedidos**: Pie chart
4. **Vendas por Categoria**: Doughnut chart

---

## 🎨 Design e UX

### Requisitos de Interface:

1. **Design System**: Usar Shadcn/ui para consistência
2. **Tema**: Suporte a dark/light mode
3. **Responsividade**: Mobile-first
4. **Loading States**: Skeletons em todas as listas
5. **Error States**: Tratamento visual de erros
6. **Empty States**: Mensagens amigáveis quando não há dados
7. **Toasts**: Feedback de ações (sucesso, erro, info)

### Componentes Reutilizáveis:

- DataTable com paginação, busca e filtros
- Form fields com validação visual
- Modal/Dialog para confirmações
- Breadcrumbs para navegação
- Cards de estatísticas
- Badges de status

---

## 📁 Estrutura de Pastas Sugerida

```
/src
├── /app
│   ├── /(auth)
│   │   ├── /login
│   │   ├── /registro
│   │   └── /esqueci-senha
│   ├── /(public)
│   │   ├── /page.tsx (landing)
│   │   ├── /fornecedores
│   │   ├── /catalogo-publico
│   │   └── /fornecedor/[slug]
│   ├── /(protected)
│   │   ├── /dashboard
│   │   │   ├── /cliente
│   │   │   └── /fornecedor
│   │   ├── /carrinho
│   │   ├── /pedidos
│   │   └── /rastreamento/[orderId]
│   ├── /admin
│   ├── /api
│   │   ├── /auth
│   │   ├── /products
│   │   ├── /orders
│   │   ├── /inventory
│   │   ├── /pricing
│   │   └── /notifications
│   └── layout.tsx
├── /components
│   ├── /ui (shadcn components)
│   ├── /forms
│   ├── /tables
│   ├── /charts
│   └── /layout
├── /lib
│   ├── prisma.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── validations.ts
├── /hooks
├── /store (redux/zustand)
├── /services
├── /types
└── /styles
```

---

## ✅ Checklist de Entrega

### Fase 1 - Setup e Autenticação
- [ ] Setup inicial do projeto Next.js
- [ ] Configuração do Prisma + PostgreSQL
- [ ] Implementação do NextAuth.js
- [ ] Páginas de login/registro
- [ ] Middleware de proteção de rotas

### Fase 2 - Catálogo Público
- [ ] Landing page
- [ ] Lista de fornecedores
- [ ] Catálogo público de produtos
- [ ] Página do fornecedor (por slug)
- [ ] Busca e filtros

### Fase 3 - Área do Fornecedor
- [ ] Dashboard com KPIs
- [ ] CRUD de produtos
- [ ] Gestão de estoque
- [ ] Sistema de precificação
- [ ] Gestão de pedidos
- [ ] Gestão de clientes

### Fase 4 - Área do Cliente
- [ ] Dashboard do cliente
- [ ] Carrinho de compras
- [ ] Checkout
- [ ] Histórico de pedidos
- [ ] Rastreamento

### Fase 5 - Features Avançadas
- [ ] Notificações em tempo real (Socket.io)
- [ ] Sistema de logs (Winston)
- [ ] Analytics e gráficos
- [ ] Área administrativa

---

## 🚀 Comandos Iniciais

```bash
# Criar projeto
npx create-next-app@latest b2b-marketplace --typescript --tailwind --eslint --app --src-dir

# Instalar dependências principais
npm install prisma @prisma/client next-auth @auth/prisma-adapter
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query axios
npm install socket.io socket.io-client
npm install winston
npm install zustand # ou @reduxjs/toolkit react-redux
npm install recharts # para gráficos
npm install lucide-react # ícones
npm install date-fns # manipulação de datas

# Shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input table dialog toast badge

# Prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

---

## 📝 Observações Importantes

1. **Segurança**: Implementar rate limiting, sanitização de inputs, CORS adequado
2. **Performance**: Usar Server Components onde possível, implementar cache
3. **SEO**: Meta tags dinâmicas para páginas públicas
4. **Acessibilidade**: Seguir guidelines WCAG
5. **Testes**: Implementar testes unitários para lógicas críticas (precificação, estoque)
6. **Documentação**: Comentar funções complexas e criar README detalhado

---

Desenvolva este sistema de forma iterativa, começando pela autenticação e catálogo público, depois evoluindo para as áreas protegidas. Mantenha o código limpo, tipado e bem organizado.
