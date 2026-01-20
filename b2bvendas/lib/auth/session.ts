import { getServerSession as getNextAuthSession } from 'next-auth';
import { authOptions } from './auth-options';
import { UnauthorizedError } from '@/lib/errors/app-error';
import { SessionUser } from '@/shared/types';

export async function getServerSession() {
  const session = await getNextAuthSession(authOptions);
  return session;
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getServerSession();
  
  if (!session || !session.user) {
    throw new UnauthorizedError('Autenticação necessária');
  }

  return session.user as SessionUser;
}

export async function requireRole(roles: string[]) {
  const user = await requireAuth();
  
  if (!roles.includes(user.tipo)) {
    throw new UnauthorizedError('Permissão insuficiente');
  }

  return user;
}
