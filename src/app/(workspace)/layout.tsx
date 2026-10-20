import { type ReactNode } from 'react'
import { AuthGate } from '@/app/_components/auth-gate'
import { Sidebar } from '@/components/sidebar/sidebar'

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <AuthGate mode="protected">
        <Sidebar />
        <div className="flex flex-col">
          <header className="h-14"></header>
          <main className="flex-1 p-4">{children}</main>
        </div>
      </AuthGate>
    </div>
  )
}
