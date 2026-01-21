'use client'

interface Produto {
  id: string
  nome: string
  sku: string
  descricao?: string | null
  precoBase: number | string
  quantidadeEstoque: number
  unidade: string
  imagens: string[]
  ativo: boolean
  destaque: boolean
}

interface ProductCardProps {
  produto: Produto
  onClick?: () => void
}

export default function ProductCard({ produto, onClick }: ProductCardProps) {
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numPrice)
  }

  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      {produto.imagens.length > 0 ? (
        <img
          src={produto.imagens[0]}
          alt={produto.nome}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">Sem imagem</span>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {produto.nome}
          </h3>
          {produto.destaque && (
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
              Destaque
            </span>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mb-2">SKU: {produto.sku}</p>
        
        {produto.descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {produto.descricao}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(produto.precoBase)}
            </p>
            <p className="text-sm text-gray-500">
              Estoque: {produto.quantidadeEstoque} {produto.unidade}
            </p>
          </div>
          
          <div>
            {produto.ativo ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Ativo
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Inativo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
