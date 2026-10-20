import { Baby, CalendarDays, CircleUserRound, Settings } from 'lucide-react'
import { AppRoutes } from '@/constants/routes'
import Link from 'next/link'
import { LogoutButton } from '@/modules/auth/components/logout-button'
import { Logo } from '@/components/logo/logo'

export const Sidebar = () => {
  return (
    <aside className="sidebar-theme flex w-64 shrink-0 flex-col gap-y-8 bg-sidebar p-4 text-sidebar-foreground">
      <Logo />

      <div className="flex flex-1 flex-col gap-y-4">
        <div className="flex items-center gap-x-2 rounded-lg bg-sidebar-primary p-2 text-sidebar-primary-foreground">
          <CircleUserRound className="w-4" />
          <Link href={AppRoutes.PROFILE}>Мій профіль</Link>
        </div>
        <div className="flex items-center gap-x-2 rounded-lg p-2 text-sidebar-inactive transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Baby className="w-4" />
          <Link href={AppRoutes.PROFILE}>Мої діти</Link>
        </div>
        <div className="flex items-center gap-x-2 rounded-lg p-2 text-sidebar-inactive transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <CalendarDays className="w-4" />
          <Link href={AppRoutes.PROFILE}>Календар</Link>
        </div>
        <div className="flex items-center gap-x-2 rounded-lg p-2 text-sidebar-inactive transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Settings className="w-4" />
          <Link href={AppRoutes.PROFILE}>Налаштування</Link>
        </div>
      </div>

      <LogoutButton />
    </aside>
  )
}
