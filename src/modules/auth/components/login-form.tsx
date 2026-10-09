'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { loginSchema, type LoginInput } from '../schemas/login.schema'
import { useLogin } from '@/modules/auth/hooks/use-login'
import { getErrorMessage } from '@/lib/errors/get-error-message'

export function LoginForm() {
  const login = useLogin()

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(input: LoginInput) {
    try {
      await login.mutateAsync(input)
      setValue('password', '')
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: getErrorMessage(error, 'Не вдалося увійти в акаунт'),
      })
    } finally {
      login.reset()
    }
  }

  return (
    <div className="w-full max-w-md rounded-lg border p-6 shadow-sm">
      <h1 className="mb-6 text-center text-2xl font-semibold">
        Вхід до облікового запису
      </h1>

      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
        className="flex flex-col gap-5"
        aria-busy={isSubmitting}
      >
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="login-email">Електронна пошта</FieldLabel>

          <Input
            {...register('email')}
            id="login-email"
            type="email"
            autoComplete="email"
            readOnly={isSubmitting || isSubmitSuccessful}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
          />

          {errors.email && (
            <FieldError id="login-email-error">
              {errors.email.message}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="login-password">Пароль</FieldLabel>

          <Input
            {...register('password')}
            id="login-password"
            type="password"
            autoComplete="current-password"
            readOnly={isSubmitting || isSubmitSuccessful}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'login-password-error' : undefined
            }
          />

          {errors.password && (
            <FieldError id="login-password-error">
              {errors.password.message}
            </FieldError>
          )}
        </Field>

        {errors.root?.server && (
          <FieldError>{errors.root.server.message}</FieldError>
        )}

        {isSubmitSuccessful && <p role="status">Вхід виконано успішно.</p>}

        <Button type="submit" disabled={isSubmitting || isSubmitSuccessful}>
          {isSubmitting ? 'Входимо…' : 'Увійти'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        Немає облікового запису?{' '}
        <Link href="/register" className="underline">
          Зареєструватися
        </Link>
      </p>
    </div>
  )
}
