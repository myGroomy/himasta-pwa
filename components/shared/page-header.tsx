import * as React from 'react'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && <p className="text-base text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
