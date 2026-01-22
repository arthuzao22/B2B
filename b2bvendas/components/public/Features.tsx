import { Package, ShoppingBag, BarChart3, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const features = [
  {
    icon: Package,
    title: 'Gestão de Produtos Simplificada',
    description: 'Cadastre e organize seus produtos com facilidade. Sistema completo de categorias e controle de estoque em tempo real.',
  },
  {
    icon: ShoppingBag,
    title: 'Pedidos Otimizados',
    description: 'Processo de compra ágil e intuitivo. Acompanhe seus pedidos do início ao fim com notificações em tempo real.',
  },
  {
    icon: BarChart3,
    title: 'Inventário em Tempo Real',
    description: 'Controle total do seu estoque. Alertas automáticos, relatórios detalhados e sincronização instantânea.',
  },
  {
    icon: Shield,
    title: 'Pagamentos Seguros',
    description: 'Transações protegidas com criptografia de ponta a ponta. Múltiplas formas de pagamento disponíveis.',
  },
];

export function Features() {
  return (
    <section className="py-20 sm:py-32 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Tudo que você precisa para vender e comprar
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Recursos completos para fornecedores e clientes gerenciarem seus negócios com eficiência
          </p>
        </div>
        
        <div className="mx-auto mt-16 grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} variant="elevated" className="text-center">
                <CardContent className="p-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
