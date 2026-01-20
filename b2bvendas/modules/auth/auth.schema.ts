import { z } from 'zod';
import { emailSchema, senhaSchema, cnpjSchema, telefoneSchema } from '@/shared/schemas/common';

export const loginSchema = z.object({
  email: emailSchema,
  senha: z.string().min(1, 'Senha é obrigatória'),
});

export const registroClienteSchema = z.object({
  email: emailSchema,
  senha: senhaSchema,
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  telefone: telefoneSchema,
  razaoSocial: z.string().min(3, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: cnpjSchema,
  inscricaoEstadual: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  cep: z.string().optional(),
});

export const registroFornecedorSchema = z.object({
  email: emailSchema,
  senha: senhaSchema,
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres').max(200),
  telefone: telefoneSchema,
  razaoSocial: z.string().min(3, 'Razão social é obrigatória'),
  nomeFantasia: z.string().optional(),
  cnpj: cnpjSchema,
  descricao: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  cep: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroClienteInput = z.infer<typeof registroClienteSchema>;
export type RegistroFornecedorInput = z.infer<typeof registroFornecedorSchema>;
