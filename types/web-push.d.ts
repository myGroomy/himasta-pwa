declare module 'web-push' {
  interface PushSubscriptionKeys {
    p256dh: string
    auth: string
  }
  interface PushSubscription {
    endpoint: string
    keys: PushSubscriptionKeys
  }
  interface PushPayload {
    title?: string
    body?: string
    url?: string
    [key: string]: unknown
  }
  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void
  export function sendNotification(
    subscription: PushSubscription,
    payload?: string | Buffer | PushPayload,
    options?: Record<string, unknown>
  ): Promise<unknown>
  export function generateVAPIDKeys(): { publicKey: string; privateKey: string }
  const webpush: {
    setVapidDetails: typeof setVapidDetails
    sendNotification: typeof sendNotification
    generateVAPIDKeys: typeof generateVAPIDKeys
  }
  export default webpush
}
