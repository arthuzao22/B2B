import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth/session';
import { produtoService } from '@/modules/produtos/produto.service';
import { atualizarProdutoSchema } from '@/modules/produtos/produto.schema';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireRole(['fornecedor', 'cliente', 'admin']);

    const fornecedorId = user.tipo === 'fornecedor' ? user.fornecedorId : undefined;
    const produto = await produtoService.buscarPorId(id, fornecedorId);

    return NextResponse.json({
      success: true,
      data: produto,
    });
  } catch (error) {
    logger.error('Erro ao buscar produto', {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireRole(['fornecedor', 'admin']);

    if (user.tipo === 'fornecedor' && !user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const dados = atualizarProdutoSchema.parse(body);

    const produto = await produtoService.atualizar(id, user.fornecedorId!, dados);

    return NextResponse.json({
      success: true,
      data: produto,
    });
  } catch (error) {
    logger.error('Erro ao atualizar produto', {
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireRole(['fornecedor', 'admin']);

    if (user.tipo === 'fornecedor' && !user.fornecedorId) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    await produtoService.deletar(id, user.fornecedorId!);

    return NextResponse.json({
      success: true,
      message: 'Produto deletado com sucesso',
    });
  } catch (error) {
    logger.error('Erro ao deletar produto', {
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
