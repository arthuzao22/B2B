# 🚀 Prompt de Continuação: B2B Marketplace - Implementação Completa

## 📋 Contexto

O projeto B2B Marketplace teve sua **Fase 1 (Fundação)** implementada com sucesso:

### ✅ O Que Já Foi Implementado

| Módulo | Status | Descrição |
|--------|--------|-----------|
| **Schema Prisma** | ✅ Completo | 14 modelos em português |
| **Autenticação** | ✅ Completo | NextAuth.js + JWT + bcrypt |
| **Arquitetura** | ✅ Completo | Controller → Service → Repository |
| **Segurança Base** | ✅ Completo | Zod, multi-tenant, error handling |
| **Logger** | ✅ Completo | Winston estruturado |
| **Módulo Produtos** | ✅ Completo | CRUD completo com paginação |

---

## 🎯 Objetivo Deste Prompt

**Continuar a implementação do B2B Marketplace**, desenvolvendo TODAS as funcionalidades restantes que ainda não foram criadas. Seguir rigorosamente a arquitetura já estabelecida e os padrões do agent `@b2bagent`.

---

## 📦 Funcionalidades a Implementar

### Fase 2: Módulos de Backend Restantes

---

#### 2.1 📁 Módulo de Categorias

**Localização**: `/src/modules/categorias/`

**Funcionalidades:**
- [ ] CRUD completo de categorias
- [ ] Suporte a categorias hierárquicas (pai/filhos)
- [ ] Geração automática de slug
- [ ] Upload de imagem da categoria
- [ ] Listagem com árvore de subcategorias

**API Routes:**
```
POST   /api/categorias           → Criar categoria
GET    /api/categorias           → Listar todas (com hierarquia)
GET    /api/categorias/:id       → Buscar por ID
PUT    /api/categorias/:id       → Atualizar
DELETE /api/categorias/:id       → Deletar (validar se tem produtos)
```

---

#### 2.2 👥 Módulo de Clientes

**Localização**: `/src/modules/clientes/`

**Funcionalidades:**
- [ ] CRUD completo de clientes
- [ ] Associar cliente a fornecedor (ClienteFornecedor)
- [ ] Atribuir lista de preços ao cliente
- [ ] Listar pedidos do cliente
- [ ] Buscar por CNPJ, razão social

**API Routes:**
```
POST   /api/clientes                    → Criar cliente
GET    /api/clientes                    → Listar clientes (do fornecedor)
GET    /api/clientes/:id                → Buscar por ID
PUT    /api/clientes/:id                → Atualizar
DELETE /api/clientes/:id                → Deletar
POST   /api/clientes/:id/lista-preco    → Atribuir lista de preços
GET    /api/clientes/:id/pedidos        → Listar pedidos do cliente
```

---

#### 2.3 💰 Módulo de Precificação

**Localização**: `/src/modules/precos/`

**Funcionalidades:**

**Listas de Preços:**
- [ ] CRUD de listas de preços
- [ ] Definir desconto percentual ou fixo
- [ ] Adicionar/remover produtos da lista
- [ ] Definir preço especial por produto na lista
- [ ] Atribuir clientes à lista

**Preços Customizados:**
- [ ] Definir preço específico por cliente/produto
- [ ] Hierarquia: Customizado > Lista > Base
- [ ] Função utilitária para calcular preço final

**API Routes:**
```
# Listas de Preços
POST   /api/listas-preco                      → Criar lista
GET    /api/listas-preco                      → Listar todas
GET    /api/listas-preco/:id                  → Buscar por ID
PUT    /api/listas-preco/:id                  → Atualizar
DELETE /api/listas-preco/:id                  → Deletar
POST   /api/listas-preco/:id/produtos         → Adicionar produto
DELETE /api/listas-preco/:id/produtos/:prodId → Remover produto

# Preços Customizados
POST   /api/precos-customizados               → Criar preço customizado
GET    /api/precos-customizados               → Listar por cliente
PUT    /api/precos-customizados/:id           → Atualizar
DELETE /api/precos-customizados/:id           → Deletar

# Utilitário
GET    /api/produtos/:id/preco?clienteId=xxx  → Calcular preço final
```

---

#### 2.4 📦 Módulo de Estoque

**Localização**: `/src/modules/estoque/`

**Funcionalidades:**
- [ ] Registrar movimentações (entrada, saída, ajuste)
- [ ] Histórico completo de movimentações por produto
- [ ] Alertas de estoque baixo (quantidade ≤ mínimo)
- [ ] Dashboard de estoque com métricas
- [ ] Atualização automática ao confirmar/cancelar pedido

**API Routes:**
```
POST   /api/estoque/movimentacoes                → Criar movimentação
GET    /api/estoque/movimentacoes                → Listar movimentações
GET    /api/estoque/movimentacoes/:produtoId     → Histórico do produto
GET    /api/estoque/alertas                      → Produtos com estoque baixo
GET    /api/estoque/dashboard                    → Métricas de estoque
```

---

#### 2.5 🛒 Módulo de Pedidos (Completo)

**Localização**: `/src/modules/pedidos/`

**Funcionalidades:**

**Carrinho:**
- [ ] Adicionar item ao carrinho
- [ ] Atualizar quantidade
- [ ] Remover item
- [ ] Limpar carrinho
- [ ] Calcular totais com preços do cliente

**Pedidos:**
- [ ] Criar pedido a partir do carrinho
- [ ] Listar pedidos (fornecedor/cliente)
- [ ] Buscar pedido por ID ou número
- [ ] Atualizar status do pedido
- [ ] Cancelar pedido (com reposição de estoque)
- [ ] Histórico de status
- [ ] Adicionar código de rastreio

**API Routes:**
```
# Carrinho (pode ser stateless com localStorage ou stateful)
POST   /api/carrinho/calcular                 → Calcular totais

# Pedidos
POST   /api/pedidos                           → Criar pedido
GET    /api/pedidos                           → Listar pedidos
GET    /api/pedidos/:id                       → Buscar por ID
GET    /api/pedidos/numero/:numero            → Buscar por número
PUT    /api/pedidos/:id/status                → Atualizar status
PUT    /api/pedidos/:id/rastreio              → Adicionar rastreio
POST   /api/pedidos/:id/cancelar              → Cancelar pedido
GET    /api/pedidos/:id/historico             → Histórico de status
```

---

#### 2.6 🔔 Módulo de Notificações

**Localização**: `/src/modules/notificacoes/`

**Funcionalidades:**
- [ ] Criar notificações (pedido, estoque, sistema)
- [ ] Listar notificações do usuário
- [ ] Marcar como lida
- [ ] Marcar todas como lidas
- [ ] Contador de não lidas
- [ ] WebSocket para tempo real (Socket.io)

**API Routes:**
```
GET    /api/notificacoes                      → Listar notificações
GET    /api/notificacoes/nao-lidas/count      → Contador
PUT    /api/notificacoes/:id/lida             → Marcar como lida
PUT    /api/notificacoes/marcar-todas-lidas   → Marcar todas
DELETE /api/notificacoes/:id                  → Deletar
```

**WebSocket Events:**
```typescript
// Servidor → Cliente
'nova-notificacao'      → Notificação criada
'pedido-atualizado'     → Status do pedido mudou
'estoque-baixo'         → Alerta de estoque

// Cliente → Servidor
'entrar-sala'           → Join room do usuário
'marcar-lida'           → Marcar notificação
```

---

#### 2.7 📊 Módulo de Analytics/Dashboard

**Localização**: `/src/modules/analytics/`

**Funcionalidades:**
- [ ] KPIs do fornecedor (faturamento, pedidos, ticket médio, etc)
- [ ] Vendas por período (dia, semana, mês, ano)
- [ ] Top 10 produtos mais vendidos
- [ ] Distribuição de pedidos por status
- [ ] Vendas por categoria
- [ ] Clientes mais ativos

**API Routes:**
```
GET /api/analytics/kpis                   → KPIs gerais
GET /api/analytics/vendas?periodo=30d     → Vendas por período
GET /api/analytics/top-produtos?limit=10  → Top produtos
GET /api/analytics/pedidos-por-status     → Distribuição de status
GET /api/analytics/vendas-por-categoria   → Vendas por categoria
GET /api/analytics/top-clientes?limit=10  → Clientes mais ativos
```

---

### Fase 3: Frontend - Páginas Públicas

---

#### 3.1 🏠 Landing Page

**Rota**: `/`

**Elementos:**
- [ ] Hero section com proposta de valor
- [ ] Como funciona (para fornecedores e compradores)
- [ ] Fornecedores em destaque
- [ ] CTA para cadastro
- [ ] Footer com links

---

#### 3.2 🏭 Lista de Fornecedores

**Rota**: `/fornecedores`

**Elementos:**
- [ ] Grid de cards de fornecedores
- [ ] Busca por nome
- [ ] Filtros (cidade, categoria)
- [ ] Paginação
- [ ] Link para catálogo de cada fornecedor

---

#### 3.3 📦 Catálogo Público

**Rota**: `/catalogo-publico`

**Elementos:**
- [ ] Lista de produtos de todos os fornecedores
- [ ] Filtros (categoria, fornecedor, preço)
- [ ] Busca por nome/SKU
- [ ] Ordenação
- [ ] Paginação
- [ ] Visualização em grid/lista

---

#### 3.4 🏪 Página do Fornecedor

**Rota**: `/fornecedor/:slug`

**Elementos:**
- [ ] Banner e logo do fornecedor
- [ ] Informações da empresa
- [ ] Catálogo de produtos filtrado
- [ ] Busca dentro do catálogo
- [ ] Categorias do fornecedor

---

### Fase 4: Frontend - Área do Fornecedor

---

#### 4.1 📊 Dashboard do Fornecedor

**Rota**: `/dashboard/fornecedor`

**Elementos:**
- [ ] Cards de KPIs (faturamento, pedidos, ticket médio, clientes)
- [ ] Gráfico de vendas (últimos 30 dias)
- [ ] Top 5 produtos mais vendidos
- [ ] Pedidos recentes (últimos 5)
- [ ] Alertas de estoque baixo
- [ ] Acesso rápido às funcionalidades

---

#### 4.2 📦 Gestão de Produtos

**Rota**: `/dashboard/fornecedor/produtos`

**Elementos:**
- [ ] DataTable com todos os produtos
- [ ] Busca, filtros, ordenação
- [ ] Botão adicionar produto
- [ ] Modal/página de criação
- [ ] Modal/página de edição
- [ ] Confirmação de exclusão
- [ ] Status ativo/inativo toggle
- [ ] Badge de estoque baixo

---

#### 4.3 📁 Gestão de Categorias

**Rota**: `/dashboard/fornecedor/categorias` (ou dentro de produtos)

**Elementos:**
- [ ] Árvore de categorias
- [ ] CRUD de categorias
- [ ] Drag and drop para reorganizar (opcional)

---

#### 4.4 🛒 Gestão de Pedidos

**Rota**: `/dashboard/fornecedor/pedidos`

**Elementos:**
- [ ] DataTable com pedidos
- [ ] Filtros por status, data, cliente
- [ ] Drawer/modal com detalhes do pedido
- [ ] Botões para alterar status
- [ ] Timeline de histórico
- [ ] Campo para código de rastreio
- [ ] Impressão de pedido

---

#### 4.5 📦 Gestão de Estoque

**Rota**: `/dashboard/fornecedor/estoque`

**Elementos:**
- [ ] Lista de produtos com estoque
- [ ] Indicadores visuais (baixo, normal, alto)
- [ ] Modal para registrar movimentação
- [ ] Histórico de movimentações
- [ ] Alertas em destaque

---

#### 4.6 💰 Gestão de Preços

**Rota**: `/dashboard/fornecedor/precos`

**Elementos:**
- [ ] Tabs: Listas de Preços | Preços Customizados
- [ ] CRUD de listas de preços
- [ ] Adicionar produtos à lista
- [ ] Definir preços especiais
- [ ] Vincular clientes à lista
- [ ] Tabela de preços customizados por cliente

---

#### 4.7 👥 Gestão de Clientes

**Rota**: `/dashboard/fornecedor/clientes`

**Elementos:**
- [ ] DataTable de clientes
- [ ] Drawer com detalhes
- [ ] Histórico de pedidos do cliente
- [ ] Lista de preços atribuída
- [ ] Preços customizados do cliente

---

#### 4.8 ⚙️ Configurações

**Rota**: `/dashboard/fornecedor/configuracoes`

**Elementos:**
- [ ] Dados da empresa
- [ ] Upload de logo e banner
- [ ] Configuração de slug
- [ ] Dados de contato
- [ ] Preferências de notificação

---

### Fase 5: Frontend - Área do Cliente

---

#### 5.1 📊 Dashboard do Cliente

**Rota**: `/dashboard/cliente`

**Elementos:**
- [ ] Resumo de pedidos
- [ ] Últimos pedidos
- [ ] Fornecedores favoritos
- [ ] Acesso rápido ao catálogo

---

#### 5.2 🛒 Carrinho de Compras

**Rota**: `/carrinho`

**Elementos:**
- [ ] Lista de itens
- [ ] Preço unitário (personalizado)
- [ ] Quantidade editável
- [ ] Subtotal por item
- [ ] Remover item
- [ ] Total geral
- [ ] Botão finalizar compra
- [ ] Estado persistente (Zustand + localStorage)

---

#### 5.3 ✅ Checkout

**Rota**: `/checkout`

**Elementos:**
- [ ] Resumo do pedido
- [ ] Endereço de entrega
- [ ] Observações
- [ ] Confirmação final
- [ ] Redirecionamento para página de sucesso

---

#### 5.4 📋 Meus Pedidos

**Rota**: `/pedidos`

**Elementos:**
- [ ] Lista de pedidos do cliente
- [ ] Filtros por status, data
- [ ] Cards ou tabela de pedidos
- [ ] Link para detalhes

---

#### 5.5 📦 Detalhes do Pedido

**Rota**: `/pedidos/:id`

**Elementos:**
- [ ] Número do pedido
- [ ] Status atual com destaque
- [ ] Timeline de histórico
- [ ] Lista de itens
- [ ] Totais
- [ ] Código de rastreio (se houver)
- [ ] Dados do fornecedor

---

#### 5.6 🚚 Rastreamento

**Rota**: `/rastreamento/:id`

**Elementos:**
- [ ] Status visual do pedido
- [ ] Timeline de eventos
- [ ] Previsão de entrega
- [ ] Link de rastreio externo (se houver)

---

### Fase 6: Área Administrativa

---

#### 6.1 📊 Dashboard Admin

**Rota**: `/admin`

**Elementos:**
- [ ] KPIs globais do marketplace
- [ ] Total de usuários, fornecedores, clientes
- [ ] Pedidos totais
- [ ] Faturamento geral
- [ ] Fornecedores recentes
- [ ] Alertas do sistema

---

#### 6.2 👥 Gestão de Usuários

**Rota**: `/admin/usuarios`

**Elementos:**
- [ ] DataTable de todos os usuários
- [ ] Filtros por tipo, status
- [ ] Ativar/desativar usuário
- [ ] Detalhes do usuário
- [ ] Reset de senha

---

#### 6.3 🏭 Gestão de Fornecedores

**Rota**: `/admin/fornecedores`

**Elementos:**
- [ ] Lista de fornecedores
- [ ] Aprovar/rejeitar novos fornecedores
- [ ] Verificar/desverificar
- [ ] Estatísticas por fornecedor

---

### Fase 7: Componentes Reutilizáveis

---

- [ ] **DataTable**: Tabela com paginação, busca, ordenação, filtros
- [ ] **FormField**: Input com label, erro, validação visual
- [ ] **Modal/Dialog**: Para confirmações e formulários
- [ ] **Drawer**: Painel lateral para detalhes
- [ ] **StatusBadge**: Badge colorido por status
- [ ] **PriceDisplay**: Formatação de preço em BRL
- [ ] **QuantitySelector**: Input de quantidade com +/-
- [ ] **ImageUpload**: Upload de imagens com preview
- [ ] **LoadingSkeleton**: Skeletons para loading states
- [ ] **EmptyState**: Mensagem quando não há dados
- [ ] **ErrorBoundary**: Tratamento de erros em componentes
- [ ] **Breadcrumbs**: Navegação hierárquica
- [ ] **NotificationDropdown**: Dropdown de notificações no header
- [ ] **SearchInput**: Input de busca com debounce

---

## 🛠️ Instruções de Implementação

### Ordem de Implementação Sugerida

```
1. Módulos de Backend restantes (Fase 2)
   ├── 2.1 Categorias
   ├── 2.2 Clientes
   ├── 2.3 Precificação
   ├── 2.4 Estoque
   ├── 2.5 Pedidos (completo)
   ├── 2.6 Notificações
   └── 2.7 Analytics

2. Componentes UI reutilizáveis (Fase 7)

3. Páginas Públicas (Fase 3)

4. Área do Fornecedor (Fase 4)

5. Área do Cliente (Fase 5)

6. Área Administrativa (Fase 6)

7. WebSocket e tempo real
```

### Padrões a Seguir

1. **Arquitetura**: Seguir o padrão Controller → Service → Repository
2. **Segurança**: Zod para validação, RBAC para autorização, filtro de tenant
3. **Código**: TypeScript strict, tratamento de erros, logs estruturados
4. **UI**: Shadcn/ui, Tailwind CSS, responsivo, dark mode
5. **Estado**: Zustand para global, React Query para server state

### Validações Obrigatórias

Antes de cada implementação:
- [ ] Input validado com Zod
- [ ] Autenticação verificada
- [ ] Autorização por role
- [ ] Filtro de tenant aplicado
- [ ] Erros tratados
- [ ] Logs adicionados
- [ ] Paginação implementada (onde aplicável)
- [ ] Transações em operações críticas

---

## ✅ Checklist de Conclusão

Ao finalizar, o sistema deve ter:

- [ ] Todos os módulos de backend funcionais
- [ ] Todas as páginas frontend implementadas
- [ ] Autenticação e autorização funcionando
- [ ] Carrinho e checkout funcionais
- [ ] Notificações em tempo real
- [ ] Dashboard com analytics
- [ ] Área administrativa
- [ ] Build sem erros
- [ ] Sem vulnerabilidades de segurança

---

## 📝 Observação Final

Este prompt é uma **continuação** do projeto existente. NÃO recriar o que já existe:
- Schema Prisma ✅
- Módulo de autenticação ✅
- Módulo de produtos ✅
- Estrutura de pastas ✅
- Logger Winston ✅

Implementar **APENAS** o que está listado acima como pendente.
