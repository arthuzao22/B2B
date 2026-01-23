import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const busca = searchParams.get('busca') || '';
    const categoriaId = searchParams.get('categoriaId') || '';
    const precoMin = searchParams.get('precoMin') ? parseFloat(searchParams.get('precoMin')!) : undefined;
    const precoMax = searchParams.get('precoMax') ? parseFloat(searchParams.get('precoMax')!) : undefined;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      ativo: true, // Only show active products
    };

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { descricao: { contains: busca, mode: 'insensitive' } },
        { sku: { contains: busca, mode: 'insensitive' } },
      ];
    }

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    if (precoMin !== undefined || precoMax !== undefined) {
      where.precoBase = {};
      if (precoMin !== undefined) {
        where.precoBase.gte = precoMin;
      }
      if (precoMax !== undefined) {
        where.precoBase.lte = precoMax;
      }
    }

    // Get products with supplier info
    const [produtos, total] = await Promise.all([
      prisma.produto.findMany({
        where,
        skip,
        take: limit,
        orderBy: { criadoEm: 'desc' },
        select: {
          id: true,
          nome: true,
          slug: true,
          sku: true,
          descricao: true,
          precoBase: true,
          imagens: true,
          ativo: true,
          quantidadeEstoque: true,
          fornecedor: {
            select: {
              id: true,
              nomeFantasia: true,
              razaoSocial: true,
              slug: true,
              logo: true,
            },
          },
          categoria: {
            select: {
              id: true,
              nome: true,
              slug: true,
            },
          },
        },
      }),
      prisma.produto.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: produtos,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error('Erro ao listar produtos públicos', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    return NextResponse.json(
      { error: 'Erro ao carregar produtos', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
