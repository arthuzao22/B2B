import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error('Email e senha são obrigatórios')
        }

        try {
          const usuario = await prisma.usuario.findUnique({
            where: { email: credentials.email },
            include: {
              fornecedor: true,
              cliente: true,
            }
          })

          if (!usuario) {
            throw new Error('Credenciais inválidas')
          }

          if (!usuario.ativo) {
            throw new Error('Usuário inativo. Entre em contato com o administrador.')
          }

          const senhaValida = await compare(credentials.senha, usuario.senha)

          if (!senhaValida) {
            throw new Error('Credenciais inválidas')
          }

          return {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            role: usuario.role,
            fornecedorId: usuario.fornecedor?.id,
            clienteId: usuario.cliente?.id,
          }
        } catch (error) {
          if (error instanceof Error) {
            throw error
          }
          throw new Error('Erro ao autenticar usuário')
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.nome = user.nome
        token.role = user.role
        token.fornecedorId = user.fornecedorId
        token.clienteId = user.clienteId
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.nome = token.nome
        session.user.role = token.role
        session.user.fornecedorId = token.fornecedorId
        session.user.clienteId = token.clienteId
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET
}
