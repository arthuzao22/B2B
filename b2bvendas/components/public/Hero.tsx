import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ShoppingCart } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 py-20 sm:py-32">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Marketplace B2B Completo para Seu Negócio
          </h1>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Conecte-se com fornecedores e clientes de todo o Brasil. 
            Gerencie seus produtos, pedidos e estoque em uma única plataforma moderna e eficiente.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              asChild 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 min-w-[200px]"
            >
              <Link href="/register">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 min-w-[200px]"
            >
              <Link href="/catalogo">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ver Catálogo
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
