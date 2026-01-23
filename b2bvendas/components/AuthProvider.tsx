'use client'

import { SessionProvider } from 'next-auth/react'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Wrap children in a Fragment to ensure it's a single element
  return (
    <SessionProvider>
      <>
        {children}
      </>
    </SessionProvider>
  )
}
