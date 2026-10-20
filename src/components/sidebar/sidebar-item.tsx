import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { AppRoutes } from '@/constants/routes'

interface SidebarItemProps {
  Icon: LucideIcon
  title: string
  link: string
}

export const SidebarItem = (props: SidebarItemProps) => {
  const { Icon, title, link } = props

  return (
    <div className="flex items-center gap-x-2 rounded-lg bg-sidebar-primary p-2 text-sidebar-primary-foreground">
      <Icon className="w-4" />
      <Link href={AppRoutes.PROFILE}>{title}</Link>
    </div>
  )
}
