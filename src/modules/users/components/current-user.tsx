'use client'

import { useGetMe } from '@/modules/users/hooks/use-get-me'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

export const CurrentUser = () => {
  const { data, isPending, isError, error } = useGetMe()

  if (isPending) {
    return <div>Завантаження профілю...</div>
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-y-3">
        <h2 className="text-2xl font-medium text-foreground">
          Не вдалося завантажити профіль. Спробуйте пізніше
        </h2>
        <p className="text-sm text-destructive">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Оновити сторінку
        </Button>
      </div>
    )
  }

  if (!data) {
    return <div>Дані відсутні</div>
  }

  return (
    <div className="flex flex-col gap-y-2">
      {data.avatarUrl ? (
        <Image
          src={data.avatarUrl}
          alt="Аватар користувача"
          width={200}
          height={200}
        />
      ) : null}
      <h2>
        {data.lastName} {data.firstName}
      </h2>
      <p>Email: {data.email}</p>
      <p>Дата народження: {data.birthday ? data.birthday : '-'}</p>
    </div>
  )
}
