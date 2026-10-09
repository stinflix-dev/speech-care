import { type ReactNode } from 'react'

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64">Logo</aside>
      <div className="flex flex-col">
        <header className="h-14"></header>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}
