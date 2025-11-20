-- Cafe Ordering System Database Setup
-- Copy and paste this entire script into Supabase SQL Editor and run it

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tables
CREATE TABLE IF NOT EXISTS public.tables (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number varchar(10) UNIQUE NOT NULL,
    qr_code varchar(255) UNIQUE NOT NULL,
    capacity integer NOT NULL,
    status varchar(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning')),
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- 2. Menu Categories
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- 3. Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid REFERENCES public.menu_categories(id),
    name varchar(150) NOT NULL,
    description text,
    price decimal(10,2) NOT NULL,
    image_url varchar(500),
    is_available boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- 4. Table Sessions
CREATE TABLE IF NOT EXISTS public.table_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id uuid REFERENCES public.tables(id),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    sub_orders jsonb NOT NULL DEFAULT '[]',
    total_amount decimal(10,2) DEFAULT 0,
    created_at timestamp DEFAULT now(),
    completed_at timestamp,
    deleted_at timestamp NULL
);

-- 5. Session Users
CREATE TABLE IF NOT EXISTS public.session_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid REFERENCES public.table_sessions(id),
    phone_number varchar(15) NOT NULL,
    user_name varchar(100) NOT NULL,
    is_verified boolean DEFAULT false,
    joined_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- 6. Phone Verifications
CREATE TABLE IF NOT EXISTS public.phone_verifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number varchar(15) NOT NULL,
    verification_code varchar(6) NOT NULL,
    expires_at timestamp NOT NULL,
    attempts integer DEFAULT 0,
    is_used boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- 7. Orders
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid REFERENCES public.table_sessions(id),
    sub_order_id uuid NOT NULL,
    user_id uuid REFERENCES public.session_users(id),
    menu_item_id uuid REFERENCES public.menu_items(id),
    menu_item_name varchar(150) NOT NULL,
    menu_item_price decimal(10,2) NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    special_instructions text,
    total_price decimal(10,2) NOT NULL,
    ordered_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- Enable Row Level Security and create policies
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Enable all access for all users" ON public.tables FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.menu_categories FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.menu_items FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.table_sessions FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.session_users FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.phone_verifications FOR ALL USING (true);
CREATE POLICY "Enable all access for all users" ON public.orders FOR ALL USING (true);

-- Insert sample tables
INSERT INTO public.tables (table_number, qr_code, capacity) VALUES
('T001', 'table_qr_001', 4),
('T002', 'table_qr_002', 2),
('T003', 'table_qr_003', 6),
('T004', 'table_qr_004', 4),
('T005', 'table_qr_005', 2),
('T006', 'table_qr_006', 8)
ON CONFLICT (table_number) DO NOTHING;

-- Insert sample menu categories
INSERT INTO public.menu_categories (name, description, sort_order) VALUES
('Beverages', 'Hot and cold drinks to refresh you', 1),
('Appetizers', 'Perfect starters to begin your meal', 2),
('Main Courses', 'Hearty meals and delicious entrees', 3),
('Desserts', 'Sweet treats to end your meal perfectly', 4),
('Breakfast', 'Morning favorites to start your day', 5)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
WITH category_ids AS (
    SELECT id, name FROM public.menu_categories
)
INSERT INTO public.menu_items (category_id, name, description, price, sort_order, is_available) VALUES
-- Beverages
((SELECT id FROM category_ids WHERE name = 'Beverages'), 'Coffee', 'Freshly brewed premium coffee', 4.50, 1, true),
((SELECT id FROM category_ids WHERE name = 'Beverages'), 'Cappuccino', 'Rich espresso with steamed milk foam', 5.50, 2, true),
((SELECT id FROM category_ids WHERE name = 'Beverages'), 'Tea', 'Selection of herbal and black teas', 3.50, 3, true),
((SELECT id FROM category_ids WHERE name = 'Beverages'), 'Fresh Orange Juice', 'Squeezed to order', 5.00, 4, true),
((SELECT id FROM category_ids WHERE name = 'Beverages'), 'Latte', 'Smooth espresso with steamed milk', 5.00, 5, true),

-- Appetizers
((SELECT id FROM category_ids WHERE name = 'Appetizers'), 'Bruschetta', 'Toasted bread with fresh tomato and basil', 8.00, 1, true),
((SELECT id FROM category_ids WHERE name = 'Appetizers'), 'Caesar Salad', 'Crisp romaine with parmesan and croutons', 12.00, 2, true),
((SELECT id FROM category_ids WHERE name = 'Appetizers'), 'Soup of the Day', 'Chef''s daily special creation', 7.50, 3, true),
((SELECT id FROM category_ids WHERE name = 'Appetizers'), 'Chicken Wings', 'Crispy wings with your choice of sauce', 11.00, 4, true),

-- Main Courses
((SELECT id FROM category_ids WHERE name = 'Main Courses'), 'Grilled Salmon', 'Atlantic salmon with seasonal vegetables', 24.00, 1, true),
((SELECT id FROM category_ids WHERE name = 'Main Courses'), 'Chicken Parmesan', 'Breaded chicken with marinara sauce', 19.00, 2, true),
((SELECT id FROM category_ids WHERE name = 'Main Courses'), 'Beef Burger', 'Angus beef with fries', 16.00, 3, true),
((SELECT id FROM category_ids WHERE name = 'Main Courses'), 'Vegetable Pasta', 'Fresh pasta with seasonal vegetables', 15.00, 4, true),
((SELECT id FROM category_ids WHERE name = 'Main Courses'), 'Grilled Chicken', 'Herb-seasoned chicken breast', 18.00, 5, true),

-- Desserts
((SELECT id FROM category_ids WHERE name = 'Desserts'), 'Chocolate Cake', 'Rich triple-layer chocolate cake', 8.00, 1, true),
((SELECT id FROM category_ids WHERE name = 'Desserts'), 'Tiramisu', 'Classic Italian dessert', 9.00, 2, true),
((SELECT id FROM category_ids WHERE name = 'Desserts'), 'Ice Cream', 'Vanilla, chocolate, or strawberry', 6.00, 3, true),
((SELECT id FROM category_ids WHERE name = 'Desserts'), 'Cheesecake', 'New York style with berry compote', 7.50, 4, true),

-- Breakfast
((SELECT id FROM category_ids WHERE name = 'Breakfast'), 'Pancakes', 'Fluffy pancakes with maple syrup', 11.00, 1, true),
((SELECT id FROM category_ids WHERE name = 'Breakfast'), 'Eggs Benedict', 'Poached eggs on English muffin', 14.00, 2, true),
((SELECT id FROM category_ids WHERE name = 'Breakfast'), 'Avocado Toast', 'Smashed avocado on sourdough', 10.00, 3, true),
((SELECT id FROM category_ids WHERE name = 'Breakfast'), 'French Toast', 'Thick-cut brioche with syrup', 12.00, 4, true)
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup complete! All tables and sample data created successfully.' as message;