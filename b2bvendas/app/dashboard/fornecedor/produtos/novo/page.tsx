'use client'

import { ProductForm } from '@/src/components/produtos'

export default function NovoProdutoPage() {
  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        precoBase: parseFloat(data.precoBase),
        quantidadeEstoque: parseInt(data.quantidadeEstoque, 10),
        estoqueMinimo: parseInt(data.estoqueMinimo, 10),
        estoqueMaximo: data.estoqueMaximo ? parseInt(data.estoqueMaximo, 10) : null,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar produto')
    }

    return response.json()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Novo Produto</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  )
}
