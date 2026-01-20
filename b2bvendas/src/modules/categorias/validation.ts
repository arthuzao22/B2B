import { z } from 'zod'

export const createCategoriaSchema = z.object({
  fornecedorId: z.string().cuid(),
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo'),
  descricao: z.string().max(500, 'Descrição muito longa').optional().nullable(),
  imagem: z.string().url('URL de imagem inválida').optional().nullable(),
  categoriaPaiId: z.string().cuid().optional().nullable(),
  ativo: z.boolean().default(true),
  ordem: z.number().int().min(0).default(0),
})

export const updateCategoriaSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100, 'Nome muito longo').optional(),
  descricao: z.string().max(500, 'Descrição muito longa').optional().nullable(),
  imagem: z.string().url('URL de imagem inválida').optional().nullable(),
  categoriaPaiId: z.string().cuid().optional().nullable(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
})

export type CreateCategoriaInput = z.infer<typeof createCategoriaSchema>
export type UpdateCategoriaInput = z.infer<typeof updateCategoriaSchema>
