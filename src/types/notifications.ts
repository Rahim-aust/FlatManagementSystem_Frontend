export type AppNotification = {
  notificationId: number
  title: string
  message: string
  link?: string | null
  isRead: boolean
  createdAt: string
}
