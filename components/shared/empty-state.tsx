import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export function EmptyState({
  title,
  description,
  action,
  className,
  icon: Icon = Inbox,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
  icon?: React.ElementType
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-[#EAEAEA] bg-background px-6 py-16 text-center',
        className
      )}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-secondary border border-[#EAEAEA]">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
