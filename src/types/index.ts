export interface Table {
  id: string;
  table_number: string;
  qr_code: string;
  capacity: number;
  status: 'available' | 'occupied' | 'cleaning';
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  deleted_at?: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface SubOrder {
  id: string;
  user_id: string;
  user_name: string;
  sub_order_name: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  total_amount: number;
  created_at: string;
}

export interface TableSession {
  id: string;
  table_id: string;
  status: 'active' | 'completed';
  sub_orders: SubOrder[];
  total_amount: number;
  created_at: string;
  completed_at?: string;
  deleted_at?: string;
}

export interface SessionUser {
  id: string;
  session_id: string;
  phone_number: string;
  user_name: string;
  is_verified: boolean;
  joined_at: string;
  deleted_at?: string;
}

export interface Order {
  id: string;
  session_id: string;
  sub_order_id: string;
  user_id: string;
  menu_item_id: string;
  menu_item_name: string;
  menu_item_price: number;
  quantity: number;
  special_instructions?: string;
  total_price: number;
  ordered_at: string;
  deleted_at?: string;
}

export interface PhoneVerification {
  id: string;
  phone_number: string;
  verification_code: string;
  expires_at: string;
  attempts: number;
  is_used: boolean;
  created_at: string;
  deleted_at?: string;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
  total_price: number;
}