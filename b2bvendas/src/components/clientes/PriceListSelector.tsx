'use client'

import { useState } from 'react'

interface PriceListSelectorProps {
  currentListaPrecoId?: string | null
  listasPreco: Array<{ id: string; nome: string; descricao?: string | null }>
  onAssign: (listaPrecoId: string) => Promise<void>
  onRemove: () => Promise<void>
}

export function PriceListSelector({
  currentListaPrecoId,
  listasPreco,
  onAssign,
  onRemove,
}: PriceListSelectorProps) {
  const [selectedId, setSelectedId] = useState(currentListaPrecoId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAssign = async () => {
    if (!selectedId) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onAssign(selectedId)
      setSuccess('Lista de preços atribuída com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atribuir lista de preços')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await onRemove()
      setSelectedId('')
      setSuccess('Lista de preços removida com sucesso!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover lista de preços')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Preços</h3>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="listaPreco" className="block text-sm font-medium text-gray-700 mb-2">
            Selecione uma lista de preços
          </label>
          <select
            id="listaPreco"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <option value="">Sem lista de preços</option>
            {listasPreco.map((lista) => (
              <option key={lista.id} value={lista.id}>
                {lista.nome}
                {lista.descricao && ` - ${lista.descricao}`}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAssign}
            disabled={loading || !selectedId || selectedId === currentListaPrecoId}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Salvando...' : 'Atribuir Lista'}
          </button>

          {currentListaPrecoId && (
            <button
              onClick={handleRemove}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Removendo...' : 'Remover Lista'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
