import { isApiEnabled } from '../http/apiClient'
import { httpNotificationService } from './httpNotificationService'
import { MockNotificationService } from './mockNotificationService'
import type { NotificationService } from './types'

export * from './types'
export * from './format'
export { MockNotificationService, seedNotifications, type MockNotificationStore } from './mockNotificationService'

export const notificationService: NotificationService = isApiEnabled()
  ? httpNotificationService
  : new MockNotificationService({ persist: true })
