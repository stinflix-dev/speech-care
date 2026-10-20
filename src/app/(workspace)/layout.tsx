import { type ReactNode } from 'react'
import { AuthGate } from '@/app/_components/auth-gate'
import { LogoutButton } from '@/modules/auth/components/logout-button'

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <AuthGate mode="protected">
        <aside className="flex w-64 shrink-0 flex-col border-r p-4">
          <div>Logo</div>

          <div className="mt-auto pt-6">
            <LogoutButton />
          </div>
        </aside>
        <div className="flex flex-col">
          <header className="h-14"></header>
          <main className="flex-1 p-4">{children}</main>
        </div>
      </AuthGate>
    </div>
  )
}
