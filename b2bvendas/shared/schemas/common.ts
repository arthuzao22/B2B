import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Email inválido')
  .toLowerCase()
  .trim();

export const senhaSchema = z
  .string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número');

export const cnpjSchema = z
  .string()
  .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos');

export const telefoneSchema = z
  .string()
  .regex(/^\d{10,11}$/, 'Telefone inválido')
  .optional();

export const cepSchema = z
  .string()
  .regex(/^\d{8}$/, 'CEP deve conter 8 dígitos')
  .optional();

export const paginacaoSchema = z.object({
  pagina: z.number().int().positive().default(1),
  limite: z.number().int().positive().max(100).default(10),
  ordenarPor: z.string().optional(),
  ordem: z.enum(['asc', 'desc']).default('desc'),
});
