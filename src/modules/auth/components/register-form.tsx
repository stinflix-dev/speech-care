import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const RegisterForm = () => {
  return (
    <div className="flex flex-col gap-y-6 rounded-lg border border-gray-200 px-6 py-8 shadow-md">
      <h1 className="text-center text-2xl font-semibold text-gray-800">
        Створення облікового запису
      </h1>
      <form className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-6">
          <Field>
            <FieldLabel>Ім&#39;я</FieldLabel>
            <Input type="text" required />
          </Field>
          <Field>
            <FieldLabel>Прізвище</FieldLabel>
            <Input type="text" required />
          </Field>
        </div>
        <Field>
          <FieldLabel>Електронна пошта</FieldLabel>
          <Input type="email" required />
        </Field>
        <Field>
          <FieldLabel>Пароль</FieldLabel>
          <Input type="password" required />
        </Field>
        <Button className="mt-4" type="submit">
          Зареєструватися hello
        </Button>
      </form>
      <div>
        <h2 className="text-center">
          Вже маєте обліковий запис?{' '}
          <Link
            href="/login"
            className="text-blue-800 underline-offset-2 hover:underline"
          >
            Увійти
          </Link>
        </h2>
      </div>
    </div>
  )
}
