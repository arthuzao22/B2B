import { UserPlus, Package, ShoppingCart } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '1',
    title: 'Cadastre-se na Plataforma',
    description: 'Crie sua conta como fornecedor ou cliente em poucos minutos. Processo simples e gratuito.',
  },
  {
    icon: Package,
    step: '2',
    title: 'Navegue ou Adicione Produtos',
    description: 'Fornecedores cadastram seus produtos. Clientes exploram o catálogo completo com filtros avançados.',
  },
  {
    icon: ShoppingCart,
    step: '3',
    title: 'Realize Pedidos',
    description: 'Faça pedidos com segurança. Acompanhe o status em tempo real até a entrega.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-32 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Como Funciona
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Comece a usar em 3 passos simples
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="relative">
                  {index < steps.length - 1 && (
                    <div className="absolute top-12 left-1/2 hidden h-0.5 w-full bg-blue-200 lg:block" />
                  )}
                  <div className="relative text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                      {step.step}
                    </div>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
