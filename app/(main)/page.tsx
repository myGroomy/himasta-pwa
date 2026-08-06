import { getOptionalSession } from '@/lib/permissions'
import { getPublishedAnnouncements } from '@/lib/feed'
import WelcomePage from '@/app/welcome/page'
import { HomePortalView } from '@/components/shared/home-portal-view'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getOptionalSession()

  if (!user) {
    return <WelcomePage />
  }

  const announcements = await getPublishedAnnouncements(user)

  return <HomePortalView user={user} initialAnnouncements={announcements as any} />
}
