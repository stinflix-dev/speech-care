'use client'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  type RegisterInput,
  registerSchema,
} from '@/modules/auth/schemas/register.schema'
import { useRegister } from '@/modules/auth/hooks/use-register'
import { getErrorMessage } from '@/lib/errors/get-error-message'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { AppRoutes } from '@/constants/routes'

export const RegisterForm = () => {
  const registration = useRegister()

  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  async function onSubmit(input: RegisterInput) {
    try {
      await registration.mutateAsync(input)
      reset()

      await queryClient.cancelQueries()
      queryClient.removeQueries()

      router.replace(AppRoutes.PROFILE)
    } catch (error) {
      setError('root.server', {
        type: 'server',
        message: getErrorMessage(error, 'Не вдалося виконати реєстрацію.'),
      })
    } finally {
      registration.reset()
    }
  }

  return (
    <div className="flex flex-col gap-y-6 rounded-lg border border-border bg-card px-6 py-8 text-card-foreground shadow-md">
      <h1 className="text-center text-2xl font-semibold text-foreground">
        Створення облікового запису
      </h1>
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
        className="flex flex-col gap-y-6"
        aria-busy={isSubmitting}
      >
        <div className="flex items-center gap-x-6">
          <Field data-invalid={Boolean(errors.firstName)}>
            <FieldLabel htmlFor="register-first-name">Ім’я</FieldLabel>
            <Input
              {...register('firstName')}
              id="register-first-name"
              type="text"
              className="border-input bg-background text-foreground"
              autoComplete="given-name"
              readOnly={isSubmitting || isSubmitSuccessful}
              aria-invalid={Boolean(errors.firstName)}
              aria-describedby={
                errors.firstName ? 'register-first-name-error' : undefined
              }
            />
            {errors.firstName && (
              <FieldError id="register-first-name-error">
                {errors.firstName.message}
              </FieldError>
            )}
          </Field>

          <Field data-invalid={Boolean(errors.lastName)}>
            <FieldLabel htmlFor="register-last-name">Прізвище</FieldLabel>
            <Input
              {...register('lastName')}
              id="register-last-name"
              type="text"
              className="border-input bg-background text-foreground"
              autoComplete="family-name"
              readOnly={isSubmitting || isSubmitSuccessful}
              aria-invalid={Boolean(errors.lastName)}
              aria-describedby={
                errors.lastName ? 'register-last-name-error' : undefined
              }
            />
            {errors.lastName && (
              <FieldError id="register-last-name-error">
                {errors.lastName.message}
              </FieldError>
            )}
          </Field>
        </div>

        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="register-email">Електронна пошта</FieldLabel>
          <Input
            {...register('email')}
            id="register-email"
            type="email"
            className="border-input bg-background text-foreground"
            autoComplete="username"
            readOnly={isSubmitting || isSubmitSuccessful}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'register-email-error' : undefined}
          />
          {errors.email && (
            <FieldError id="register-email-error">
              {errors.email.message}
            </FieldError>
          )}
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="register-password">Пароль</FieldLabel>
          <Input
            {...register('password')}
            id="register-password"
            type="password"
            className="border-input bg-background text-foreground"
            autoComplete="new-password"
            readOnly={isSubmitting || isSubmitSuccessful}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'register-password-error' : undefined
            }
          />
          {errors.password && (
            <FieldError id="register-password-error">
              {errors.password.message}
            </FieldError>
          )}
        </Field>

        {errors.root?.server && (
          <FieldError>{errors.root.server.message}</FieldError>
        )}

        {isSubmitSuccessful && (
          <p role="status">Обліковий запис створено. Ви увійшли в систему.</p>
        )}

        <Button
          className="mt-4"
          type="submit"
          disabled={isSubmitting || isSubmitSuccessful}
        >
          {isSubmitting ? 'Створюємо обліковий запис…' : 'Зареєструватися'}
        </Button>
      </form>
      <div>
        <h2 className="text-center text-muted-foreground">
          Вже маєте обліковий запис?{' '}
          <Link
            href="/login"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Увійти
          </Link>
        </h2>
      </div>
    </div>
  )
}
