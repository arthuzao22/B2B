import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export function CallToAction() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Pronto para começar?
          </h2>
          <p className="mt-6 text-lg leading-8 text-blue-100">
            Junte-se a centenas de empresas que já utilizam nossa plataforma para 
            gerenciar suas vendas B2B de forma eficiente.
          </p>
          <div className="mt-10 flex items-center justify-center gap-6">
            <Button 
              asChild 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              <Link href="/register">
                Criar Conta Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
