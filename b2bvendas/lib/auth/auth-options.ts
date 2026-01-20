import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma/client';
import { TipoUsuario } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          throw new Error('Credenciais inválidas');
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: {
            fornecedor: true,
            cliente: true,
          },
        });

        if (!usuario || !usuario.ativo) {
          throw new Error('Usuário não encontrado ou inativo');
        }

        const senhaValida = await bcrypt.compare(credentials.senha, usuario.senha);

        if (!senhaValida) {
          throw new Error('Senha incorreta');
        }

        return {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          tipo: usuario.tipo,
          fornecedorId: usuario.fornecedor?.id,
          clienteId: usuario.cliente?.id,
          avatar: usuario.avatar || undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tipo = user.tipo;
        token.fornecedorId = user.fornecedorId;
        token.clienteId = user.clienteId;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tipo = token.tipo as TipoUsuario;
        session.user.fornecedorId = token.fornecedorId as string | undefined;
        session.user.clienteId = token.clienteId as string | undefined;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
