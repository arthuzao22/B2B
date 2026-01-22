'use client'

interface Cliente {
  id: string
  razaoSocial: string
  nomeFantasia?: string | null
  cnpj: string
  telefone?: string | null
  whatsapp?: string | null
  email?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  ativo: boolean
  associacao?: {
    listaPreco?: {
      id: string
      nome: string
      descricao?: string | null
    } | null
  }
}

interface ClientCardProps {
  cliente: Cliente
}

export function ClientCard({ cliente }: ClientCardProps) {
  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{cliente.razaoSocial}</h3>
            {cliente.nomeFantasia && (
              <p className="text-sm text-gray-600">{cliente.nomeFantasia}</p>
            )}
          </div>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {cliente.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      <div className="px-6 py-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase">CNPJ</p>
          <p className="mt-1 text-sm text-gray-900">{formatCNPJ(cliente.cnpj)}</p>
        </div>

        {(cliente.telefone || cliente.whatsapp || cliente.email) && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Contato</p>
            <div className="mt-1 space-y-1">
              {cliente.telefone && (
                <p className="text-sm text-gray-900">
                  <span className="font-medium">Tel:</span> {cliente.telefone}
                </p>
              )}
              {cliente.whatsapp && (
                <p className="text-sm text-gray-900">
                  <span className="font-medium">WhatsApp:</span> {cliente.whatsapp}
                </p>
              )}
              {cliente.email && (
                <p className="text-sm text-gray-900">
                  <span className="font-medium">E-mail:</span> {cliente.email}
                </p>
              )}
            </div>
          </div>
        )}

        {(cliente.endereco || cliente.cidade || cliente.estado) && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Endereço</p>
            <div className="mt-1">
              {cliente.endereco && <p className="text-sm text-gray-900">{cliente.endereco}</p>}
              {(cliente.cidade || cliente.estado) && (
                <p className="text-sm text-gray-900">
                  {cliente.cidade}
                  {cliente.cidade && cliente.estado && ' - '}
                  {cliente.estado}
                  {cliente.cep && ` - ${cliente.cep}`}
                </p>
              )}
            </div>
          </div>
        )}

        {cliente.associacao?.listaPreco && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase">Lista de Preços</p>
            <p className="mt-1 text-sm text-gray-900">{cliente.associacao.listaPreco.nome}</p>
            {cliente.associacao.listaPreco.descricao && (
              <p className="text-xs text-gray-600">{cliente.associacao.listaPreco.descricao}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
