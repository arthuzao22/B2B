import { NextResponse } from 'next/server';
import { authService } from '@/modules/auth/auth.service';
import { registroClienteSchema, registroFornecedorSchema } from '@/modules/auth/auth.schema';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger';
import { sanitizeForLog } from '@/lib/utils/helpers';

export async function POST(request: Request) {
  let bodyData: any = {};
  
  try {
    bodyData = await request.json();
    const { tipo, ...dados } = bodyData;

    if (!tipo || !['cliente', 'fornecedor'].includes(tipo)) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    let usuario;

    if (tipo === 'cliente') {
      const dadosValidados = registroClienteSchema.parse(dados);
      usuario = await authService.registrarCliente(dadosValidados);
    } else {
      const dadosValidados = registroFornecedorSchema.parse(dados);
      usuario = await authService.registrarFornecedor(dadosValidados);
    }

    return NextResponse.json({
      success: true,
      data: usuario,
    }, { status: 201 });

  } catch (error) {
    logger.error('Erro ao registrar usuário', {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      body: sanitizeForLog(bodyData),
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
