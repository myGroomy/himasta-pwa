'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { DiscussionPanel } from '@/components/discussions/discussion-panel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Division = { id: string; name: string; slug: string }
type User = { id: string; role: string; divisionId: string | null }

export function DivisionDiscussion({
  user,
  divisions,
}: {
  user: User
  divisions: Division[]
}) {
  const pathname = usePathname()
  const [divisionId, setDivisionId] = useState(
    user.divisionId && divisions.some((d) => d.id === user.divisionId)
      ? user.divisionId
      : divisions[0]?.id ?? ''
  )

  if (!divisionId) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada divisi. Diskusi aktif setelah divisi dibuat.
      </p>
    )
  }

  const current = divisions.find((d) => d.id === divisionId)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={divisionId} onValueChange={(v) => setDivisionId(v)}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {current && <span className="text-sm text-muted-foreground">Diskusi {current.name}</span>}
      </div>
      <DiscussionPanel
        key={divisionId}
        divisionId={divisionId}
        currentUserId={user.id}
        canPost
      />
    </div>
  )
}
