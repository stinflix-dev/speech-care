import { type ReactNode } from 'react'
import { AuthGate } from '@/app/_components/auth-gate'

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="grid min-h-screen place-items-center">
      <AuthGate mode="guest">{children}</AuthGate>
    </main>
  )
}
