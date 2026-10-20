import { LoginForm } from '@/modules/auth/components/login-form'
import { Logo } from '@/components/logo/logo'

export default function LoginPage() {
  return (
    <div className="grid h-full w-full grid-cols-2">
      <div className="flex flex-col justify-center gap-y-4 bg-linear-to-br from-auth-gradient-from to-auth-gradient-to px-20 text-primary-foreground">
        <Logo />
        <div>
          <h2 className="mb-2 text-4xl font-bold">
            Кожен маленький крок — великий прогрес.
          </h2>
          <p className="text-primary-foreground/90">
            Організовуйте заняття, ведіть звітність та спостерігайте за
            розвитком кожної дитини.
          </p>
        </div>
      </div>
      <div className="grid place-items-center bg-background text-foreground">
        <LoginForm />
      </div>
    </div>
  )
}
