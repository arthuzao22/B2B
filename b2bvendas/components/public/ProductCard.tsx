import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Package } from 'lucide-react';

interface ProductCardProps {
  id: string;
  nome: string;
  precoBase: number;
  imagens: string[];
  fornecedor: {
    nomeFantasia?: string;
    razaoSocial: string;
  };
  ativo: boolean;
}

export function ProductCard({ id, nome, precoBase, imagens, fornecedor, ativo }: ProductCardProps) {
  const imagemPrincipal = imagens[0];
  const nomeFornecedor = fornecedor.nomeFantasia || fornecedor.razaoSocial;

  return (
    <Card variant="elevated" className="overflow-hidden h-full flex flex-col">
      <div className="relative aspect-square w-full bg-gray-100">
        {imagemPrincipal ? (
          <Image
            src={imagemPrincipal}
            alt={nome}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-16 w-16 text-gray-300" />
          </div>
        )}
        {!ativo && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Indisponível</span>
          </div>
        )}
      </div>
      
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
          {nome}
        </h3>
        <p className="text-sm text-gray-500 mb-3">
          {nomeFornecedor}
        </p>
        <p className="text-2xl font-bold text-blue-600">
          R$ {precoBase.toFixed(2)}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          asChild 
          variant="primary" 
          className="w-full"
          disabled={!ativo}
        >
          <Link href={`/catalogo/${id}`}>
            Ver Detalhes
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
