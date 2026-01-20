import 'next-auth';
import { TipoUsuario } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    nome: string;
    tipo: TipoUsuario;
    fornecedorId?: string;
    clienteId?: string;
    avatar?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      nome: string;
      tipo: TipoUsuario;
      fornecedorId?: string;
      clienteId?: string;
      avatar?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    tipo: TipoUsuario;
    fornecedorId?: string;
    clienteId?: string;
    avatar?: string;
  }
}
