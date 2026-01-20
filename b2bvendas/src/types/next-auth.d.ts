import { Role } from '@prisma/client'
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      nome: string
      role: Role
      fornecedorId?: string
      clienteId?: string
    }
  }

  interface User {
    id: string
    email: string
    nome: string
    role: Role
    fornecedorId?: string
    clienteId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    email: string
    nome: string
    role: Role
    fornecedorId?: string
    clienteId?: string
  }
}
