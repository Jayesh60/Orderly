import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public'
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json'
    }
  }
})

// Database helper functions
export const supabaseApi = {
  // Table operations
  async getTableByQR(qrCode: string) {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('qr_code', qrCode)
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async createTable(tableNumber: string, qrCode: string, capacity: number = 4) {
    const { data, error } = await supabase
      .from('tables')
      .insert({
        table_number: tableNumber,
        qr_code: qrCode,
        capacity: capacity,
        status: 'available'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Session operations
  async createSession(tableId: string) {
    const { data, error } = await supabase
      .from('table_sessions')
      .insert({
        table_id: tableId,
        status: 'active',
        sub_orders: [],
        total_amount: 0
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getActiveSession(tableId: string) {
    const { data, error } = await supabase
      .from('table_sessions')
      .select('*')
      .eq('table_id', tableId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Phone verification
  async createPhoneVerification(phoneNumber: string, code: string) {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    
    const { data, error } = await supabase
      .from('phone_verifications')
      .insert({
        phone_number: phoneNumber,
        verification_code: code,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        is_used: false
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async verifyPhone(phoneNumber: string, code: string) {
    const { data, error } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('verification_code', code)
      .eq('is_used', false)
      .is('deleted_at', null)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error) throw error

    // Mark as used
    await supabase
      .from('phone_verifications')
      .update({ is_used: true })
      .eq('id', data.id)

    return data
  },

  // User operations
  async createSessionUser(sessionId: string, phoneNumber: string, userName: string) {
    const { data, error } = await supabase
      .from('session_users')
      .insert({
        session_id: sessionId,
        phone_number: phoneNumber,
        user_name: userName,
        is_verified: true
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Menu operations
  async getMenuCategories() {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('sort_order')

    if (error) throw error
    return data
  },

  async getMenuItems() {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories!inner(*)
      `)
      .eq('is_available', true)
      .is('deleted_at', null)
      .eq('menu_categories.is_active', true)
      .is('menu_categories.deleted_at', null)
      .order('sort_order')

    if (error) throw error
    return data
  },

  // Order operations
  async createOrder(orderData: {
    session_id: string
    sub_order_id: string
    user_id: string
    menu_item_id: string
    menu_item_name: string
    menu_item_price: number
    quantity: number
    special_instructions?: string
    total_price: number
  }) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSessionSubOrders(sessionId: string, subOrders: any[]) {
    const { data, error } = await supabase
      .from('table_sessions')
      .update({ sub_orders: subOrders })
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}