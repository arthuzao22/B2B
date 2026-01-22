'use client'

import Link from 'next/link'

interface Cliente {
  id: string
  razaoSocial: string
  nomeFantasia?: string | null
  cnpj: string
  cidade?: string | null
  estado?: string | null
  ativo: boolean
  associacao?: {
    listaPreco?: {
      id: string
      nome: string
    } | null
  }
}

interface ClientTableProps {
  clientes: Cliente[]
  onDelete?: (id: string) => void
}

export function ClientTable({ clientes, onDelete }: ClientTableProps) {
  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              CNPJ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Localização
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Lista de Preços
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientes.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                Nenhum cliente encontrado
              </td>
            </tr>
          ) : (
            clientes.map((cliente) => (
              <tr key={cliente.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {cliente.razaoSocial}
                    </div>
                    {cliente.nomeFantasia && (
                      <div className="text-sm text-gray-500">{cliente.nomeFantasia}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCNPJ(cliente.cnpj)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.cidade && cliente.estado
                    ? `${cliente.cidade} - ${cliente.estado}`
                    : cliente.cidade || cliente.estado || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cliente.associacao?.listaPreco?.nome || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      cliente.ativo
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/fornecedor/clientes/${cliente.id}`}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Ver Detalhes
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(cliente.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remover
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
