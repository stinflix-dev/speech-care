'use client'

import { Button } from '@/components/ui/button'
import { useLogout } from '@/modules/auth/hooks/use-logout'

export function LogoutButton() {
  const logout = useLogout()

  const busy = logout.isPending || logout.isSuccess

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={busy}
        aria-busy={logout.isPending}
        onClick={() => logout.mutate()}
      >
        {busy ? 'Виходимо…' : 'Вийти'}
      </Button>

      {logout.isError && (
        <p role="alert" className="text-sm text-destructive">
          Вихід не підтверджено. {logout.error.message}
        </p>
      )}
    </div>
  )
}
