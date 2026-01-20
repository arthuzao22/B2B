import { getServerSession as nextAuthGetServerSession } from 'next-auth'
import { authOptions } from './authOptions'
import { Role } from '@prisma/client'

export async function getServerSession() {
  return await nextAuthGetServerSession(authOptions)
}

export async function requireAuth() {
  const session = await getServerSession()
  
  if (!session || !session.user) {
    throw new Error('Unauthorized: Authentication required')
  }
  
  return session
}

export async function requireRole(requiredRole: Role | Role[]) {
  const session = await requireAuth()
  
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  
  if (!roles.includes(session.user.role)) {
    throw new Error(`Unauthorized: Required role ${roles.join(' or ')}`)
  }
  
  return session
}
