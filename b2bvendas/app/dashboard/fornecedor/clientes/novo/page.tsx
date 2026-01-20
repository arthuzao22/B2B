'use client'

import { useState, useEffect } from 'react'
import { ClientForm } from '@/src/components/clientes'

interface ListaPreco {
  id: string
  nome: string
}

export default function NovoClientePage() {
  const [listasPreco, setListasPreco] = useState<ListaPreco[]>([])

  useEffect(() => {
    fetchListasPreco()
  }, [])

  const fetchListasPreco = async () => {
    try {
      const response = await fetch('/api/precos')
      if (response.ok) {
        const data = await response.json()
        setListasPreco(data.data || [])
      }
    } catch (err) {
      console.error('Erro ao carregar listas de preço:', err)
    }
  }

  const handleSubmit = async (data: any) => {
    const response = await fetch('/api/clientes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Erro ao criar/associar cliente')
    }

    return response.json()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Novo Cliente</h1>
        <p className="text-gray-600">
          Se o cliente já existir (mesmo CNPJ), apenas a associação será criada.
        </p>
      </div>
      <ClientForm onSubmit={handleSubmit} listasPreco={listasPreco} />
    </div>
  )
}
