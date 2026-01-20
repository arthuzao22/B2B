export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PED-${timestamp}-${random}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function sanitizeForLog(data: any): any {
  if (!data) return data;
  
  const sensitive = ['senha', 'password', 'token', 'secret', 'authorization'];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}

export function calculateDiscount(
  basePrice: number,
  discountType: 'percentual' | 'fixo',
  discountValue: number
): number {
  if (discountType === 'percentual') {
    return basePrice * (1 - discountValue / 100);
  }
  return basePrice - discountValue;
}

export function getPaginationParams(searchParams: URLSearchParams) {
  const pagina = Math.max(1, parseInt(searchParams.get('pagina') || '1'));
  const limite = Math.min(100, Math.max(1, parseInt(searchParams.get('limite') || '10')));
  const ordenarPor = searchParams.get('ordenarPor') || undefined;
  const ordem = (searchParams.get('ordem') || 'desc') as 'asc' | 'desc';
  
  return { pagina, limite, ordenarPor, ordem };
}
