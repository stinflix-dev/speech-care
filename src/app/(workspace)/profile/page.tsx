import { CurrentUser } from '@/modules/users/components/current-user'

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-y-6">
      <h1>Мій профіль</h1>
      <CurrentUser />
    </div>
  )
}
