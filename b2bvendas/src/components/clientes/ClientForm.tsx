'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClientFormProps {
  initialData?: {
    cnpj?: string
    razaoSocial?: string
    nomeFantasia?: string
    telefone?: string
    whatsapp?: string
    email?: string
    endereco?: string
    cidade?: string
    estado?: string
    cep?: string
    listaPrecoId?: string
  }
  onSubmit: (data: any) => Promise<any>
  listasPreco?: Array<{ id: string; nome: string }>
  isEdit?: boolean
}

export function ClientForm({ initialData, onSubmit, listasPreco = [], isEdit = false }: ClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    cnpj: initialData?.cnpj || '',
    razaoSocial: initialData?.razaoSocial || '',
    nomeFantasia: initialData?.nomeFantasia || '',
    telefone: initialData?.telefone || '',
    whatsapp: initialData?.whatsapp || '',
    email: initialData?.email || '',
    endereco: initialData?.endereco || '',
    cidade: initialData?.cidade || '',
    estado: initialData?.estado || '',
    cep: initialData?.cep || '',
    listaPrecoId: initialData?.listaPrecoId || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length <= 14) {
      return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
    }
    return value
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
      router.push('/dashboard/fornecedor/clientes')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Informações Básicas</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 mb-1">
              CNPJ *
            </label>
            <input
              type="text"
              id="cnpj"
              name="cnpj"
              value={formData.cnpj}
              onChange={(e) => {
                const formatted = formatCNPJ(e.target.value)
                setFormData(prev => ({ ...prev, cnpj: formatted }))
              }}
              disabled={isEdit}
              required
              maxLength={18}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <label htmlFor="razaoSocial" className="block text-sm font-medium text-gray-700 mb-1">
              Razão Social *
            </label>
            <input
              type="text"
              id="razaoSocial"
              name="razaoSocial"
              value={formData.razaoSocial}
              onChange={handleChange}
              required
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="nomeFantasia" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Fantasia
            </label>
            <input
              type="text"
              id="nomeFantasia"
              name="nomeFantasia"
              value={formData.nomeFantasia}
              onChange={handleChange}
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {!isEdit && listasPreco.length > 0 && (
            <div>
              <label htmlFor="listaPrecoId" className="block text-sm font-medium text-gray-700 mb-1">
                Lista de Preços
              </label>
              <select
                id="listaPrecoId"
                name="listaPrecoId"
                value={formData.listaPrecoId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sem lista de preços</option>
                {listasPreco.map(lista => (
                  <option key={lista.id} value={lista.id}>
                    {lista.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Contato</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(00) 0000-0000"
            />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Endereço</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cidade" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                id="cidade"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1">
                Estado (UF)
              </label>
              <input
                type="text"
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                placeholder="SP"
              />
            </div>

            <div>
              <label htmlFor="cep" className="block text-sm font-medium text-gray-700 mb-1">
                CEP
              </label>
              <input
                type="text"
                id="cep"
                name="cep"
                value={formData.cep}
                onChange={handleChange}
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="00000-000"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : isEdit ? 'Atualizar Cliente' : 'Criar Cliente'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
