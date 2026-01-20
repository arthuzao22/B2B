import { prisma } from '@/lib/prisma/client';
import { Prisma } from '@prisma/client';
import { PaginacaoParams } from '@/shared/types';

export class ProdutoRepository {
  async criar(fornecedorId: string, dados: Prisma.ProdutoCreateInput) {
    return prisma.produto.create({
      data: dados,
      include: {
        categoria: true,
        fornecedor: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
            slug: true,
          },
        },
      },
    });
  }

  async buscarPorId(id: string, fornecedorId?: string) {
    return prisma.produto.findFirst({
      where: {
        id,
        ...(fornecedorId && { fornecedorId }),
      },
      include: {
        categoria: true,
        fornecedor: {
          select: {
            id: true,
            nomeFantasia: true,
            razaoSocial: true,
            slug: true,
          },
        },
      },
    });
  }

  async buscarPorSku(sku: string, fornecedorId: string) {
    return prisma.produto.findUnique({
      where: {
        fornecedorId_sku: {
          fornecedorId,
          sku,
        },
      },
    });
  }

  async buscarPorSlug(slug: string, fornecedorId: string) {
    return prisma.produto.findUnique({
      where: {
        fornecedorId_slug: {
          fornecedorId,
          slug,
        },
      },
    });
  }

  async listar(
    fornecedorId: string,
    filtros: {
      busca?: string;
      categoriaId?: string;
      ativo?: boolean;
      estoqueMinimo?: number;
    },
    paginacao: PaginacaoParams
  ) {
    const { pagina, limite, ordenarPor, ordem } = paginacao;
    const skip = (pagina - 1) * limite;

    const where: Prisma.ProdutoWhereInput = {
      fornecedorId,
      ...(filtros.ativo !== undefined && { ativo: filtros.ativo }),
      ...(filtros.categoriaId && { categoriaId: filtros.categoriaId }),
      ...(filtros.busca && {
        OR: [
          { nome: { contains: filtros.busca, mode: 'insensitive' } },
          { sku: { contains: filtros.busca, mode: 'insensitive' } },
          { descricao: { contains: filtros.busca, mode: 'insensitive' } },
        ],
      }),
      ...(filtros.estoqueMinimo !== undefined && {
        quantidadeEstoque: { lte: filtros.estoqueMinimo },
      }),
    };

    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limite,
        orderBy: ordenarPor ? { [ordenarPor]: ordem } : { criadoEm: 'desc' },
        include: {
          categoria: true,
        },
      }),
      prisma.produto.count({ where }),
    ]);

    return {
      dados: produtos,
      meta: {
        pagina,
        limite,
        total,
        totalPaginas: Math.ceil(total / limite),
      },
    };
  }

  async atualizar(id: string, fornecedorId: string, dados: Prisma.ProdutoUpdateInput) {
    return prisma.produto.update({
      where: {
        id,
        fornecedorId,
      },
      data: dados,
      include: {
        categoria: true,
      },
    });
  }

  async deletar(id: string, fornecedorId: string) {
    return prisma.produto.delete({
      where: {
        id,
        fornecedorId,
      },
    });
  }

  async contarPorFornecedor(fornecedorId: string, ativo?: boolean) {
    return prisma.produto.count({
      where: {
        fornecedorId,
        ...(ativo !== undefined && { ativo }),
      },
    });
  }

  async buscarComEstoqueBaixo(fornecedorId: string) {
    // Using raw SQL to compare two columns (quantidadeEstoque <= estoqueMinimo)
    return prisma.$queryRaw<Array<{
      id: string;
      fornecedorId: string;
      nome: string;
      sku: string;
      quantidadeEstoque: number;
      estoqueMinimo: number;
    }>>`
      SELECT id, fornecedor_id as "fornecedorId", nome, sku, quantidade_estoque as "quantidadeEstoque", estoque_minimo as "estoqueMinimo"
      FROM produtos
      WHERE fornecedor_id = ${fornecedorId}
        AND ativo = true
        AND quantidade_estoque <= estoque_minimo
      ORDER BY quantidade_estoque ASC
    `;
  }
}

export const produtoRepository = new ProdutoRepository();
