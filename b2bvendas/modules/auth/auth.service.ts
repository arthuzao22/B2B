import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma/client';
import { ConflictError, ValidationError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger';
import { slugify } from '@/lib/utils/helpers';
import { RegistroClienteInput, RegistroFornecedorInput } from './auth.schema';
import { TipoUsuario } from '@prisma/client';

export class AuthService {
  async registrarCliente(dados: RegistroClienteInput) {
    logger.info('Iniciando registro de cliente', { email: dados.email });

    // Verificar email duplicado
    const emailExiste = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (emailExiste) {
      throw new ConflictError('Email já cadastrado');
    }

    // Verificar CNPJ duplicado
    const cnpjExiste = await prisma.cliente.findUnique({
      where: { cnpj: dados.cnpj },
    });

    if (cnpjExiste) {
      throw new ConflictError('CNPJ já cadastrado');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(dados.senha, 12);

    // Criar usuário e cliente em transação
    const usuario = await prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuario.create({
        data: {
          email: dados.email,
          senha: senhaHash,
          nome: dados.nome,
          tipo: TipoUsuario.cliente,
          telefone: dados.telefone,
        },
      });

      await tx.cliente.create({
        data: {
          usuarioId: novoUsuario.id,
          razaoSocial: dados.razaoSocial,
          nomeFantasia: dados.nomeFantasia,
          cnpj: dados.cnpj,
          inscricaoEstadual: dados.inscricaoEstadual,
          endereco: dados.endereco,
          cidade: dados.cidade,
          estado: dados.estado,
          cep: dados.cep,
        },
      });

      return novoUsuario;
    });

    logger.info('Cliente registrado com sucesso', {
      usuarioId: usuario.id,
      email: usuario.email,
    });

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
    };
  }

  async registrarFornecedor(dados: RegistroFornecedorInput) {
    logger.info('Iniciando registro de fornecedor', { email: dados.email });

    // Verificar email duplicado
    const emailExiste = await prisma.usuario.findUnique({
      where: { email: dados.email },
    });

    if (emailExiste) {
      throw new ConflictError('Email já cadastrado');
    }

    // Verificar CNPJ duplicado
    const cnpjExiste = await prisma.fornecedor.findUnique({
      where: { cnpj: dados.cnpj },
    });

    if (cnpjExiste) {
      throw new ConflictError('CNPJ já cadastrado');
    }

    // Gerar slug único
    const baseSlug = slugify(dados.nomeFantasia || dados.razaoSocial);
    let slug = baseSlug;
    let contador = 1;

    while (await prisma.fornecedor.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${contador}`;
      contador++;
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(dados.senha, 12);

    // Criar usuário e fornecedor em transação
    const usuario = await prisma.$transaction(async (tx) => {
      const novoUsuario = await tx.usuario.create({
        data: {
          email: dados.email,
          senha: senhaHash,
          nome: dados.nome,
          tipo: TipoUsuario.fornecedor,
          telefone: dados.telefone,
        },
      });

      await tx.fornecedor.create({
        data: {
          usuarioId: novoUsuario.id,
          razaoSocial: dados.razaoSocial,
          nomeFantasia: dados.nomeFantasia,
          slug,
          cnpj: dados.cnpj,
          descricao: dados.descricao,
          endereco: dados.endereco,
          cidade: dados.cidade,
          estado: dados.estado,
          cep: dados.cep,
          verificado: false,
        },
      });

      return novoUsuario;
    });

    logger.info('Fornecedor registrado com sucesso', {
      usuarioId: usuario.id,
      email: usuario.email,
      slug,
    });

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
    };
  }

  async alterarSenha(usuarioId: string, senhaAtual: string, novaSenha: string) {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new ValidationError('Usuário não encontrado');
    }

    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      throw new ValidationError('Senha atual incorreta');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 12);

    await prisma.usuario.update({
      where: { id: usuarioId },
      data: { senha: senhaHash },
    });

    logger.info('Senha alterada com sucesso', { usuarioId });
  }
}

export const authService = new AuthService();
