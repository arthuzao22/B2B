import { z } from 'zod'

// CNPJ validation regex: XX.XXX.XXX/XXXX-XX or just 14 digits
const cnpjRegex = /^(\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}|\d{14})$/

export const cnpjSchema = z.string()
  .regex(cnpjRegex, 'CNPJ inválido. Use o formato XX.XXX.XXX/XXXX-XX ou 14 dígitos')
  .transform((val) => val.replace(/[^\d]/g, '')) // Remove formatting
  .refine((val) => val.length === 14, 'CNPJ deve ter 14 dígitos')

export const createClienteSchema = z.object({
  usuarioId: z.string().cuid('ID de usuário inválido'),
  razaoSocial: z.string().min(1, 'Razão social é obrigatória').max(255),
  nomeFantasia: z.string().max(255).optional().nullable(),
  cnpj: cnpjSchema,
  telefone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  email: z.string().email('E-mail inválido').max(255).optional().nullable(),
  endereco: z.string().max(500).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres (UF)').optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  ativo: z.boolean().optional().default(true),
})

export const updateClienteSchema = z.object({
  razaoSocial: z.string().min(1, 'Razão social é obrigatória').max(255).optional(),
  nomeFantasia: z.string().max(255).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  email: z.string().email('E-mail inválido').max(255).optional().nullable(),
  endereco: z.string().max(500).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres (UF)').optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  ativo: z.boolean().optional(),
})

export const associateClienteSchema = z.object({
  clienteId: z.string().cuid('ID de cliente inválido'),
  fornecedorId: z.string().cuid('ID de fornecedor inválido'),
  listaPrecoId: z.string().cuid('ID de lista de preço inválido').optional().nullable(),
})

export const assignPriceListSchema = z.object({
  listaPrecoId: z.string().cuid('ID de lista de preço inválido'),
})

export const createOrAssociateSchema = z.object({
  cnpj: cnpjSchema,
  razaoSocial: z.string().min(1, 'Razão social é obrigatória').max(255),
  nomeFantasia: z.string().max(255).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  whatsapp: z.string().max(20).optional().nullable(),
  email: z.string().email('E-mail inválido').max(255).optional().nullable(),
  endereco: z.string().max(500).optional().nullable(),
  cidade: z.string().max(100).optional().nullable(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres (UF)').optional().nullable(),
  cep: z.string().max(10).optional().nullable(),
  fornecedorId: z.string().cuid('ID de fornecedor inválido'),
  listaPrecoId: z.string().cuid('ID de lista de preço inválido').optional().nullable(),
})

export const clienteFiltersSchema = z.object({
  search: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(10),
})

export type CreateClienteInput = z.infer<typeof createClienteSchema>
export type UpdateClienteInput = z.infer<typeof updateClienteSchema>
export type AssociateClienteInput = z.infer<typeof associateClienteSchema>
export type AssignPriceListInput = z.infer<typeof assignPriceListSchema>
export type CreateOrAssociateInput = z.infer<typeof createOrAssociateSchema>
export type ClienteFiltersInput = z.infer<typeof clienteFiltersSchema>
