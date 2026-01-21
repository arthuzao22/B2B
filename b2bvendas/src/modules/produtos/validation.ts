import { z } from 'zod'

export const createProdutoSchema = z.object({
  fornecedorId: z.string().cuid('ID do fornecedor inválido'),
  categoriaId: z.string().cuid('ID da categoria inválido').optional().nullable(),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255, 'Nome muito longo'),
  descricao: z.string().max(5000, 'Descrição muito longa').optional().nullable(),
  sku: z.string().min(1, 'SKU é obrigatório').max(100, 'SKU muito longo'),
  precoBase: z.number().positive('Preço base deve ser positivo'),
  imagens: z.array(z.string().url('URL de imagem inválida')).optional().default([]),
  unidade: z.string().max(10, 'Unidade muito longa').optional().default('UN'),
  quantidadeEstoque: z.number().int().min(0, 'Estoque não pode ser negativo').optional().default(0),
  estoqueMinimo: z.number().int().min(0, 'Estoque mínimo não pode ser negativo').optional().default(0),
  estoqueMaximo: z.number().int().min(0, 'Estoque máximo não pode ser negativo').optional().nullable(),
  ativo: z.boolean().optional().default(true),
  destaque: z.boolean().optional().default(false),
})

export const updateProdutoSchema = z.object({
  categoriaId: z.string().cuid('ID da categoria inválido').optional().nullable(),
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(255, 'Nome muito longo').optional(),
  descricao: z.string().max(5000, 'Descrição muito longa').optional().nullable(),
  sku: z.string().min(1, 'SKU é obrigatório').max(100, 'SKU muito longo').optional(),
  precoBase: z.number().positive('Preço base deve ser positivo').optional(),
  imagens: z.array(z.string().url('URL de imagem inválida')).optional(),
  unidade: z.string().max(10, 'Unidade muito longa').optional(),
  quantidadeEstoque: z.number().int().min(0, 'Estoque não pode ser negativo').optional(),
  estoqueMinimo: z.number().int().min(0, 'Estoque mínimo não pode ser negativo').optional(),
  estoqueMaximo: z.number().int().min(0, 'Estoque máximo não pode ser negativo').optional().nullable(),
  ativo: z.boolean().optional(),
  destaque: z.boolean().optional(),
})

export const produtoFiltersSchema = z.object({
  search: z.string().optional(),
  categoriaId: z.string().cuid().optional(),
  ativo: z.string().transform(val => val === 'true').optional(),
  destaque: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => parseInt(val, 10)).optional(),
  limit: z.string().transform(val => parseInt(val, 10)).optional(),
})

export type CreateProdutoInput = z.infer<typeof createProdutoSchema>
export type UpdateProdutoInput = z.infer<typeof updateProdutoSchema>
export type ProdutoFiltersInput = z.infer<typeof produtoFiltersSchema>
