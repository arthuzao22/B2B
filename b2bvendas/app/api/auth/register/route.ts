import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/src/lib/prisma'
import { TipoUsuario } from '@prisma/client'

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  tipo: z.enum(['admin', 'fornecedor', 'cliente'])
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = registerSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { nome, email, senha, tipo } = validation.data

    // Check if email already exists
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já cadastrado' },
        { status: 409 }
      )
    }

    // Hash password
    const senhaHash = await hash(senha, 10)

    // Create user in a transaction with related records
    const usuario = await prisma.$transaction(async (tx) => {
      // Create user
      const newUsuario = await tx.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          tipo: tipo as TipoUsuario
        }
      })

      // Create Fornecedor if tipo is fornecedor
      if (tipo === 'fornecedor') {
        const nomeFantasia = nome
        const razaoSocial = nome
        const cnpj = `TEMP-${newUsuario.id.substring(0, 8)}-${Date.now()}`
        const slug = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-')

        await tx.fornecedor.create({
          data: {
            usuarioId: newUsuario.id,
            razaoSocial,
            nomeFantasia,
            cnpj,
            slug
          }
        })
      }

      // Create Cliente if tipo is cliente
      if (tipo === 'cliente') {
        const razaoSocial = nome
        const cnpj = `TEMP-${newUsuario.id.substring(0, 8)}-${Date.now()}`

        await tx.cliente.create({
          data: {
            usuarioId: newUsuario.id,
            razaoSocial,
            cnpj
          }
        })
      }

      return newUsuario
    })

    return NextResponse.json(
      {
        message: 'Usuário criado com sucesso',
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          tipo: usuario.tipo
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário. Tente novamente.' },
      { status: 500 }
    )
  }
}
