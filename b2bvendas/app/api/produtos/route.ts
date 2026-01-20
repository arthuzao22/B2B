import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { produtoService } from '@/modules/produtos/produto.service';
import { criarProdutoSchema, filtrarProdutosSchema } from '@/modules/produtos/produto.schema';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger';
import { getPaginationParams } from '@/lib/utils/helpers';

export async function GET(request: Request) {
  try {
    const user = await requireRole(['fornecedor', 'admin']);

    if (user.tipo === 'fornecedor' && !user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paginacao = getPaginationParams(searchParams);
    
    const filtros = filtrarProdutosSchema.parse({
      busca: searchParams.get('busca') || undefined,
      categoriaId: searchParams.get('categoriaId') || undefined,
      ativo: searchParams.get('ativo') === 'true' ? true : searchParams.get('ativo') === 'false' ? false : undefined,
      estoqueMinimo: searchParams.get('estoqueMinimo') ? parseInt(searchParams.get('estoqueMinimo')!) : undefined,
    });

    const resultado = await produtoService.listar(user.fornecedorId!, filtros, paginacao);

    return NextResponse.json({
      success: true,
      data: resultado.dados,
      meta: resultado.meta,
    });
  } catch (error) {
    logger.error('Erro ao listar produtos', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole(['fornecedor', 'admin']);

    if (user.tipo === 'fornecedor' && !user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const dados = criarProdutoSchema.parse(body);

    const produto = await produtoService.criar(user.fornecedorId!, dados);

    return NextResponse.json({
      success: true,
      data: produto,
    }, { status: 201 });
  } catch (error) {
    logger.error('Erro ao criar produto', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });

    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
