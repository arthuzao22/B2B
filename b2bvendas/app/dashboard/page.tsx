'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sair
            </button>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-2">Informações do Usuário</h2>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <span className="font-medium">Nome:</span> {session.user.nome}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Email:</span> {session.user.email}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Role:</span>{' '}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {session.user.tipo}
                  </span>
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">ID:</span> {session.user.id}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Acesso Permitido</h2>
              <div className="space-y-2">
                {session.user.tipo === 'admin' && (
                  <p className="text-green-600">✓ Acesso total ao sistema</p>
                )}
                {session.user.tipo === 'fornecedor' && (
                  <p className="text-green-600">✓ Acesso ao painel de fornecedor</p>
                )}
                {session.user.tipo === 'cliente' && (
                  <p className="text-green-600">✓ Acesso ao painel de cliente</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
