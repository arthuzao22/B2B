import { TipoUsuario, StatusPedido, TipoMovimentacao, TipoDesconto } from '@prisma/client';

export type { TipoUsuario, StatusPedido, TipoMovimentacao, TipoDesconto };

export interface PaginacaoParams {
  pagina: number;
  limite: number;
  ordenarPor?: string;
  ordem?: 'asc' | 'desc';
}

export interface PaginacaoResponse<T> {
  dados: T[];
  meta: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
}

export interface SessionUser {
  id: string;
  email: string;
  nome: string;
  tipo: TipoUsuario;
  fornecedorId?: string;
  clienteId?: string;
  avatar?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
  };
}
