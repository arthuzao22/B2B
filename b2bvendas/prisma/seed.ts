/**
 * Prisma Seed Script
 * 
 * Popula o banco de dados com dados de teste para desenvolvimento
 * 
 * ⚠️ IMPORTANTE: Senhas estão em hash bcrypt com 12 salt rounds
 * Senha padrão para todos: "Senha@123"
 */

import { PrismaClient, TipoUsuario, TipoMovimentacao } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client with PostgreSQL adapter
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Senha padrão (já em hash): "Senha@123"
const SENHA_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIaKIrKlm6';

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ==========================================
  // 1. LIMPAR BANCO (modo desenvolvimento)
  // ==========================================
  console.log('🗑️  Limpando banco de dados...');
  
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.itemListaPreco.deleteMany();
  await prisma.precoCustomizado.deleteMany();
  await prisma.listaPreco.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.clienteFornecedor.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.fornecedor.deleteMany();
  await prisma.notificacao.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('✅ Banco limpo!\n');

  // ==========================================
  // 2. CRIAR USUÁRIOS BASE
  // ==========================================
  console.log('👤 Criando usuários...');

  const usuarioAdmin = await prisma.usuario.create({
    data: {
      email: 'admin@b2b.com',
      senha: SENHA_HASH,
      nome: 'Administrador do Sistema',
      tipo: TipoUsuario.admin,
      telefone: '(11) 98888-0000',
      ativo: true,
    },
  });

  const usuarioFornecedor1 = await prisma.usuario.create({
    data: {
      email: 'fornecedor1@distribuidora.com',
      senha: SENHA_HASH,
      nome: 'João Silva',
      tipo: TipoUsuario.fornecedor,
      telefone: '(11) 98888-1111',
      ativo: true,
    },
  });

  const usuarioFornecedor2 = await prisma.usuario.create({
    data: {
      email: 'fornecedor2@atacado.com',
      senha: SENHA_HASH,
      nome: 'Maria Santos',
      tipo: TipoUsuario.fornecedor,
      telefone: '(11) 98888-2222',
      ativo: true,
    },
  });

  const usuarioCliente1 = await prisma.usuario.create({
    data: {
      email: 'cliente1@empresa.com',
      senha: SENHA_HASH,
      nome: 'Carlos Oliveira',
      tipo: TipoUsuario.cliente,
      telefone: '(11) 98888-3333',
      ativo: true,
    },
  });

  const usuarioCliente2 = await prisma.usuario.create({
    data: {
      email: 'cliente2@comercio.com',
      senha: SENHA_HASH,
      nome: 'Ana Souza',
      tipo: TipoUsuario.cliente,
      telefone: '(11) 98888-4444',
      ativo: true,
    },
  });

  console.log('✅ 5 usuários criados!\n');

  // ==========================================
  // 3. CRIAR FORNECEDORES
  // ==========================================
  console.log('🏢 Criando fornecedores...');

  const fornecedor1 = await prisma.fornecedor.create({
    data: {
      usuarioId: usuarioFornecedor1.id,
      razaoSocial: 'Distribuidora Tech LTDA',
      nomeFantasia: 'Tech Distribuição',
      slug: 'tech-distribuicao',
      cnpj: '12.345.678/0001-90',
      descricao: 'Distribuidora especializada em produtos de tecnologia e eletrônicos com mais de 15 anos de mercado.',
      endereco: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100',
      verificado: true,
    },
  });

  const fornecedor2 = await prisma.fornecedor.create({
    data: {
      usuarioId: usuarioFornecedor2.id,
      razaoSocial: 'Atacado Prime S.A.',
      nomeFantasia: 'Prime Atacado',
      slug: 'prime-atacado',
      cnpj: '98.765.432/0001-10',
      descricao: 'Atacadista de alimentos e produtos de limpeza para empresas e condomínios.',
      endereco: 'Rua do Comércio, 500',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      cep: '20040-020',
      verificado: true,
    },
  });

  console.log('✅ 2 fornecedores criados!\n');

  // ==========================================
  // 4. CRIAR CLIENTES
  // ==========================================
  console.log('🛒 Criando clientes...');

  const cliente1 = await prisma.cliente.create({
    data: {
      usuarioId: usuarioCliente1.id,
      razaoSocial: 'Empresa Tech Solutions LTDA',
      nomeFantasia: 'Tech Solutions',
      cnpj: '11.222.333/0001-44',
      inscricaoEstadual: '123.456.789.012',
      endereco: 'Av. Faria Lima, 2000',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01452-000',
    },
  });

  const cliente2 = await prisma.cliente.create({
    data: {
      usuarioId: usuarioCliente2.id,
      razaoSocial: 'Comércio ABC LTDA ME',
      nomeFantasia: 'ABC Comércio',
      cnpj: '55.666.777/0001-88',
      inscricaoEstadual: '987.654.321.098',
      endereco: 'Rua das Flores, 300',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80010-000',
    },
  });

  console.log('✅ 2 clientes criados!\n');

  // ==========================================
  // 5. CRIAR CATEGORIAS (HIERÁRQUICAS)
  // ==========================================
  console.log('📂 Criando categorias...');

  const catEletronicos = await prisma.categoria.create({
    data: {
      nome: 'Eletrônicos',
      slug: 'eletronicos',
      descricao: 'Produtos eletrônicos em geral',
    },
  });

  const catComputadores = await prisma.categoria.create({
    data: {
      nome: 'Computadores',
      slug: 'computadores',
      descricao: 'Notebooks, desktops e acessórios',
      categoriaPaiId: catEletronicos.id,
    },
  });

  const catSmartphones = await prisma.categoria.create({
    data: {
      nome: 'Smartphones',
      slug: 'smartphones',
      descricao: 'Celulares e tablets',
      categoriaPaiId: catEletronicos.id,
    },
  });

  const catAlimentos = await prisma.categoria.create({
    data: {
      nome: 'Alimentos',
      slug: 'alimentos',
      descricao: 'Alimentos e bebidas',
    },
  });

  const catLimpeza = await prisma.categoria.create({
    data: {
      nome: 'Limpeza',
      slug: 'limpeza',
      descricao: 'Produtos de limpeza e higiene',
    },
  });

  console.log('✅ 5 categorias criadas!\n');

  // ==========================================
  // 6. CRIAR PRODUTOS DO FORNECEDOR 1 (Tech)
  // ==========================================
  console.log('📦 Criando produtos...');

  const produto1 = await prisma.produto.create({
    data: {
      fornecedorId: fornecedor1.id,
      categoriaId: catComputadores.id,
      nome: 'Notebook Dell Inspiron 15',
      slug: 'notebook-dell-inspiron-15',
      sku: 'NB-DELL-INS15-001',
      descricao: 'Notebook Dell Inspiron 15, Intel Core i5, 8GB RAM, 256GB SSD, Windows 11',
      precoBase: 3499.00,
      imagens: ['/produtos/notebook-dell.jpg'],
      ativo: true,
      quantidadeEstoque: 50,
      estoqueMinimo: 10,
      estoqueMaximo: 200,
      peso: 2.5,
      unidadeMedida: 'UN',
    },
  });

  const produto2 = await prisma.produto.create({
    data: {
      fornecedorId: fornecedor1.id,
      categoriaId: catComputadores.id,
      nome: 'Mouse Logitech MX Master 3',
      slug: 'mouse-logitech-mx-master-3',
      sku: 'MS-LOGI-MXM3-001',
      descricao: 'Mouse sem fio ergonômico, sensor 4000 DPI, bateria recarregável',
      precoBase: 499.90,
      imagens: ['/produtos/mouse-logitech.jpg'],
      ativo: true,
      quantidadeEstoque: 150,
      estoqueMinimo: 30,
      estoqueMaximo: 500,
      peso: 0.15,
      unidadeMedida: 'UN',
    },
  });

  const produto3 = await prisma.produto.create({
    data: {
      fornecedorId: fornecedor1.id,
      categoriaId: catSmartphones.id,
      nome: 'Samsung Galaxy S23',
      slug: 'samsung-galaxy-s23',
      sku: 'SM-SAMS-S23-001',
      descricao: 'Smartphone Samsung Galaxy S23, 128GB, 8GB RAM, 5G, Câmera 50MP',
      precoBase: 4299.00,
      imagens: ['/produtos/samsung-s23.jpg'],
      ativo: true,
      quantidadeEstoque: 80,
      estoqueMinimo: 15,
      estoqueMaximo: 300,
      peso: 0.2,
      unidadeMedida: 'UN',
    },
  });

  // ==========================================
  // 7. CRIAR PRODUTOS DO FORNECEDOR 2 (Atacado)
  // ==========================================

  const produto4 = await prisma.produto.create({
    data: {
      fornecedorId: fornecedor2.id,
      categoriaId: catAlimentos.id,
      nome: 'Arroz Branco Tipo 1 - 5kg',
      slug: 'arroz-branco-5kg',
      sku: 'AL-ARROZ-5KG-001',
      descricao: 'Arroz branco tipo 1, pacote com 5kg',
      precoBase: 24.90,
      imagens: ['/produtos/arroz-5kg.jpg'],
      ativo: true,
      quantidadeEstoque: 500,
      estoqueMinimo: 100,
      estoqueMaximo: 2000,
      peso: 5.0,
      unidadeMedida: 'PCT',
    },
  });

  const produto5 = await prisma.produto.create({
    data: {
      fornecedorId: fornecedor2.id,
      categoriaId: catAlimentos.id,
      nome: 'Feijão Preto - 1kg',
      slug: 'feijao-preto-1kg',
      sku: 'AL-FEIJAO-1KG-001',
      descricao: 'Feijão preto tipo 1, pacote com 1kg',
      precoBase: 8.50,
      imagens: ['/produtos/feijao-1kg.jpg'],
      ativo: true,
      quantidadeEstoque: 800,
      estoqueMinimo: 200,
      estoqueMaximo: 3000,
      peso: 1.0,
      unidadeMedida: 'PCT',
    },
  });

  const produto6 = await prisma.produto.create({
    data: {
      fornecedorId: fornecedor2.id,
      categoriaId: catLimpeza.id,
      nome: 'Detergente Líquido 500ml - Cx 24un',
      slug: 'detergente-500ml-cx24',
      sku: 'LP-DETERG-500ML-CX24',
      descricao: 'Detergente líquido neutro, caixa com 24 unidades de 500ml',
      precoBase: 42.00,
      imagens: ['/produtos/detergente-cx24.jpg'],
      ativo: true,
      quantidadeEstoque: 300,
      estoqueMinimo: 50,
      estoqueMaximo: 1000,
      peso: 12.5,
      unidadeMedida: 'CX',
    },
  });

  console.log('✅ 6 produtos criados!\n');

  // ==========================================
  // 8. CRIAR RELACIONAMENTO CLIENTE-FORNECEDOR
  // ==========================================
  console.log('🔗 Criando relacionamentos cliente-fornecedor...');

  await prisma.clienteFornecedor.createMany({
    data: [
      {
        clienteId: cliente1.id,
        fornecedorId: fornecedor1.id,
      },
      {
        clienteId: cliente2.id,
        fornecedorId: fornecedor1.id,
      },
      {
        clienteId: cliente1.id,
        fornecedorId: fornecedor2.id,
      },
      {
        clienteId: cliente2.id,
        fornecedorId: fornecedor2.id,
      },
    ],
  });

  console.log('✅ Relacionamentos criados!\n');

  // ==========================================
  // 9. CRIAR LISTAS DE PREÇOS
  // ==========================================
  console.log('💰 Criando listas de preços...');

  const listaVIP = await prisma.listaPreco.create({
    data: {
      fornecedorId: fornecedor1.id,
      nome: 'Clientes VIP',
      descricao: 'Preços especiais para clientes VIP com desconto de 10%',
      tipoDesconto: 'percentual',
      valorDesconto: 10,
      ativo: true,
    },
  });

  // Adicionar itens à lista VIP
  await prisma.itemListaPreco.createMany({
    data: [
      {
        listaPrecoId: listaVIP.id,
        produtoId: produto1.id,
        precoEspecial: 3149.10, // 10% desconto
      },
      {
        listaPrecoId: listaVIP.id,
        produtoId: produto2.id,
        precoEspecial: 449.91, // 10% desconto
      },
      {
        listaPrecoId: listaVIP.id,
        produtoId: produto3.id,
        precoEspecial: 3869.10, // 10% desconto
      },
    ],
  });

  console.log('✅ Listas de preços criadas!\n');

  // ==========================================
  // 10. CRIAR PEDIDOS DE EXEMPLO
  // ==========================================
  console.log('🛍️  Criando pedidos de exemplo...');

  const pedido1 = await prisma.pedido.create({
    data: {
      clienteId: cliente1.id,
      fornecedorId: fornecedor1.id,
      numeroPedido: 'PED-2026-0001',
      status: 'confirmado',
      subtotal: 4998.90,
      desconto: 0,
      total: 4998.90,
      itens: {
        create: [
          {
            produtoId: produto1.id,
            quantidade: 1,
            precoUnitario: 3499.00,
            precoTotal: 3499.00,
          },
          {
            produtoId: produto2.id,
            quantidade: 3,
            precoUnitario: 499.90,
            precoTotal: 1499.70,
          },
        ],
      },
    },
  });

  const pedido2 = await prisma.pedido.create({
    data: {
      clienteId: cliente2.id,
      fornecedorId: fornecedor2.id,
      numeroPedido: 'PED-2026-0002',
      status: 'processando',
      subtotal: 166.40,
      desconto: 0,
      total: 166.40,
      itens: {
        create: [
          {
            produtoId: produto4.id,
            quantidade: 4,
            precoUnitario: 24.90,
            precoTotal: 99.60,
          },
          {
            produtoId: produto5.id,
            quantidade: 5,
            precoUnitario: 8.50,
            precoTotal: 42.50,
          },
          {
            produtoId: produto6.id,
            quantidade: 1,
            precoUnitario: 42.00,
            precoTotal: 42.00,
          },
        ],
      },
    },
  });

  console.log('✅ 2 pedidos criados!\n');

  // ==========================================
  // 11. CRIAR MOVIMENTAÇÕES DE ESTOQUE
  // ==========================================
  console.log('📊 Criando movimentações de estoque...');

  await prisma.movimentacaoEstoque.createMany({
    data: [
      {
        produtoId: produto1.id,
        tipo: TipoMovimentacao.entrada,
        quantidade: 50,
        estoqueAnterior: 0,
        estoqueAtual: 50,
        motivo: 'Estoque inicial',
      },
      {
        produtoId: produto2.id,
        tipo: TipoMovimentacao.entrada,
        quantidade: 150,
        estoqueAnterior: 0,
        estoqueAtual: 150,
        motivo: 'Estoque inicial',
      },
      {
        produtoId: produto1.id,
        tipo: TipoMovimentacao.saida,
        quantidade: 1,
        estoqueAnterior: 50,
        estoqueAtual: 49,
        motivo: `Pedido ${pedido1.numeroPedido}`,
        referencia: pedido1.id,
      },
      {
        produtoId: produto2.id,
        tipo: TipoMovimentacao.saida,
        quantidade: 3,
        estoqueAnterior: 150,
        estoqueAtual: 147,
        motivo: `Pedido ${pedido1.numeroPedido}`,
        referencia: pedido1.id,
      },
    ],
  });

  console.log('✅ Movimentações criadas!\n');

  // ==========================================
  // 12. CRIAR NOTIFICAÇÕES
  // ==========================================
  console.log('🔔 Criando notificações...');

  await prisma.notificacao.createMany({
    data: [
      {
        usuarioId: usuarioFornecedor1.id,
        titulo: 'Novo pedido recebido',
        mensagem: `O pedido ${pedido1.numeroPedido} foi criado e está aguardando processamento.`,
        tipo: 'info',
        lida: false,
      },
      {
        usuarioId: usuarioCliente1.id,
        titulo: 'Pedido confirmado',
        mensagem: `Seu pedido ${pedido1.numeroPedido} foi confirmado e está sendo processado.`,
        tipo: 'success',
        lida: false,
      },
      {
        usuarioId: usuarioFornecedor2.id,
        titulo: 'Estoque baixo',
        mensagem: `O produto "Detergente Líquido 500ml" está com estoque baixo.`,
        tipo: 'warning',
        lida: false,
      },
    ],
  });

  console.log('✅ Notificações criadas!\n');

  // ==========================================
  // RESUMO
  // ==========================================
  console.log('✅ =============== SEED CONCLUÍDO! ===============\n');
  console.log('📊 Resumo dos dados criados:\n');
  console.log('👤 Usuários:');
  console.log(`   - Admin: admin@b2b.com`);
  console.log(`   - Fornecedor 1: fornecedor1@distribuidora.com`);
  console.log(`   - Fornecedor 2: fornecedor2@atacado.com`);
  console.log(`   - Cliente 1: cliente1@empresa.com`);
  console.log(`   - Cliente 2: cliente2@comercio.com`);
  console.log('\n🔑 Senha padrão para todos: Senha@123\n');
  console.log('🏢 2 Fornecedores');
  console.log('🛒 2 Clientes');
  console.log('📂 5 Categorias (2 hierárquicas)');
  console.log('📦 6 Produtos');
  console.log('🛍️  2 Pedidos');
  console.log('💰 1 Lista de preços');
  console.log('📊 4 Movimentações de estoque');
  console.log('🔔 3 Notificações\n');
  console.log('================================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
