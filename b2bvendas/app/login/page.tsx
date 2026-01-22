'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Conta criada com sucesso! Faça login para continuar.')
    }
  }, [searchParams])

  // Redirect based on user type after login
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.tipo) {
      const tipo = session.user.tipo
      let redirectPath = '/dashboard'
      
      switch (tipo) {
        case 'admin':
          redirectPath = '/dashboard/admin'
          break
        case 'fornecedor':
          redirectPath = '/dashboard/fornecedor'
          break
        case 'cliente':
          redirectPath = '/dashboard/cliente'
          break
        default:
          redirectPath = '/dashboard'
      }
      
      router.push(redirectPath)
      router.refresh()
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        senha,
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else if (result?.ok) {
        // Don't set loading to false here, let the useEffect handle redirect
        // The loading state will be shown while redirecting
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md" variant="elevated">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {successMessage && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            autoComplete="email"
          />

          <Input
            label="Senha"
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Cadastre-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={
        <Card className="w-full max-w-md" variant="elevated">
          <CardContent className="p-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
