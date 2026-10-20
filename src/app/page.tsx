import { AuthGate } from '@/app/_components/auth-gate'

export default function Home() {
  return <AuthGate mode="redirect">{null}</AuthGate>
}
