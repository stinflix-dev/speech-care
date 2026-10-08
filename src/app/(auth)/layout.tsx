import { ReactNode } from 'react'

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="grid min-h-screen place-items-center">{children}</main>
  )
}
