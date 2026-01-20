import { z } from 'zod';

export const criarProdutoSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  sku: z.string().regex(/^[A-Z0-9-]+$/, 'SKU deve conter apenas letras maiúsculas, números e hífens'),
  descricao: z.string().optional(),
  precoBase: z.number().positive('Preço deve ser positivo').max(999999.99),
  categoriaId: z.string().optional(),
  imagens: z.array(z.string().url()).default([]),
  quantidadeEstoque: z.number().int().min(0).default(0),
  estoqueMinimo: z.number().int().min(0).default(0),
  estoqueMaximo: z.number().int().min(0).default(1000),
  peso: z.number().positive().optional(),
  unidadeMedida: z.string().optional(),
  ativo: z.boolean().default(true),
});

export const atualizarProdutoSchema = criarProdutoSchema.partial();

export const filtrarProdutosSchema = z.object({
  busca: z.string().optional(),
  categoriaId: z.string().optional(),
  ativo: z.boolean().optional(),
  estoqueMinimo: z.number().int().optional(),
});

export type CriarProdutoInput = z.infer<typeof criarProdutoSchema>;
export type AtualizarProdutoInput = z.infer<typeof atualizarProdutoSchema>;
export type FiltrarProdutosInput = z.infer<typeof filtrarProdutosSchema>;
