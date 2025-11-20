export const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered'
} as const

export const SESSION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed'
} as const

export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  CLEANING: 'cleaning'
} as const

export const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000 // 10 minutes
export const MAX_VERIFICATION_ATTEMPTS = 3

export const CURRENCY_SYMBOL = '$'

export const ROUTES = {
  HOME: '/',
  SCAN: '/scan',
  PHONE_VERIFY: '/scan/phone-verify',
  MENU: '/menu',
  CART: '/cart',
  ORDER_STATUS: '/order-status'
} as const