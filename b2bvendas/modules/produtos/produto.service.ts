import { NotFoundError, BusinessError, ConflictError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger';
import { slugify } from '@/lib/utils/helpers';
import { produtoRepository } from './produto.repository';
import { CriarProdutoInput, AtualizarProdutoInput, FiltrarProdutosInput } from './produto.schema';
import { PaginacaoParams } from '@/shared/types';

export class ProdutoService {
  async criar(fornecedorId: string, dados: CriarProdutoInput) {
    logger.info('Criando produto', { fornecedorId, sku: dados.sku });

    // Verificar se SKU já existe para este fornecedor
    const skuExiste = await produtoRepository.buscarPorSku(dados.sku, fornecedorId);
    if (skuExiste) {
      throw new ConflictError('SKU já cadastrado para este fornecedor');
    }

    // Gerar slug único
    const baseSlug = slugify(dados.nome);
    let slug = baseSlug;
    let contador = 1;

    while (true) {
      const slugExiste = await produtoRepository.buscarPorSlug(slug, fornecedorId);
      if (!slugExiste) break;
      slug = `${baseSlug}-${contador}`;
      contador++;
    }

    const produto = await produtoRepository.criar(fornecedorId, {
      ...dados,
      slug,
      fornecedor: {
        connect: { id: fornecedorId },
      },
      ...(dados.categoriaId && {
        categoria: {
          connect: { id: dados.categoriaId },
        },
      }),
    });

    logger.info('Produto criado com sucesso', {
      produtoId: produto.id,
      fornecedorId,
      sku: produto.sku,
    });

    return produto;
  }

  async buscarPorId(id: string, fornecedorId?: string) {
    const produto = await produtoRepository.buscarPorId(id, fornecedorId);

    if (!produto) {
      throw new NotFoundError('Produto');
    }

    return produto;
  }

  async listar(
    fornecedorId: string,
    filtros: FiltrarProdutosInput,
    paginacao: PaginacaoParams
  ) {
    return produtoRepository.listar(fornecedorId, filtros, paginacao);
  }

  async atualizar(id: string, fornecedorId: string, dados: AtualizarProdutoInput) {
    logger.info('Atualizando produto', { produtoId: id, fornecedorId });

    // Verificar se produto existe
    const produtoExiste = await produtoRepository.buscarPorId(id, fornecedorId);
    if (!produtoExiste) {
      throw new NotFoundError('Produto');
    }

    // Se SKU está sendo alterado, verificar duplicação
    if (dados.sku && dados.sku !== produtoExiste.sku) {
      const skuExiste = await produtoRepository.buscarPorSku(dados.sku, fornecedorId);
      if (skuExiste) {
        throw new ConflictError('SKU já cadastrado para este fornecedor');
      }
    }

    // Se nome está sendo alterado, gerar novo slug
    let slug = produtoExiste.slug;
    if (dados.nome && dados.nome !== produtoExiste.nome) {
      const baseSlug = slugify(dados.nome);
      slug = baseSlug;
      let contador = 1;

      while (true) {
        const slugExiste = await produtoRepository.buscarPorSlug(slug, fornecedorId);
        if (!slugExiste || slugExiste.id === id) break;
        slug = `${baseSlug}-${contador}`;
        contador++;
      }
    }

    const produto = await produtoRepository.atualizar(id, fornecedorId, {
      ...dados,
      slug,
    });

    logger.info('Produto atualizado com sucesso', { produtoId: id });

    return produto;
  }

  async deletar(id: string, fornecedorId: string) {
    logger.info('Deletando produto', { produtoId: id, fornecedorId });

    const produtoExiste = await produtoRepository.buscarPorId(id, fornecedorId);
    if (!produtoExiste) {
      throw new NotFoundError('Produto');
    }

    await produtoRepository.deletar(id, fornecedorId);

    logger.info('Produto deletado com sucesso', { produtoId: id });
  }

  async alternarStatus(id: string, fornecedorId: string) {
    const produto = await this.buscarPorId(id, fornecedorId);
    
    return produtoRepository.atualizar(id, fornecedorId, {
      ativo: !produto.ativo,
    });
  }

  async buscarComEstoqueBaixo(fornecedorId: string) {
    return produtoRepository.buscarComEstoqueBaixo(fornecedorId);
  }
}

export const produtoService = new ProdutoService();
