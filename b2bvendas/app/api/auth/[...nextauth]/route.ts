<<<<<<< HEAD
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
=======
import NextAuth from 'next-auth'
import { authOptions } from '@/src/lib/authOptions'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
>>>>>>> copilot/vscode-mkn71nko-h6fp
