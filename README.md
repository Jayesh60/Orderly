# Cafe Ordering System - PWA

A table-based cafe ordering system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

### Customer App (PWA)
- **QR Code Table Detection** - Scan table QR codes to join sessions
- **Phone Verification** - SMS-based user authentication
- **Digital Menu** - Browse categories and menu items
- **Multi-user Ordering** - Multiple people can order from the same table
- **Real-time Cart** - Add/remove items with live updates
- **Order Tracking** - Live status updates for all table orders
- **Progressive Web App** - Works offline, installable on mobile devices

### Order Management
- **Sub-orders** - Organize items by person/round
- **Order History** - Complete tracking of all orders
- **Real-time Updates** - Live status changes via Supabase
- **Session Management** - Active table sessions with user tracking

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **PWA**: @ducanh2912/next-pwa
- **QR Scanner**: html5-qrcode
- **Real-time**: Supabase Realtime

## Database Schema

### Core Tables
- `tables` - Physical tables with QR codes
- `menu_categories` - Menu organization
- `menu_items` - Items with prices and descriptions
- `table_sessions` - Active table sessions with sub-orders JSON
- `session_users` - Users joined to table sessions
- `orders` - Individual item orders
- `phone_verifications` - OTP verification system

## Setup Instructions

### 1. Clone and Install
```bash
git clone <repository>
cd cafe-ordering-pwa
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
Run the following SQL in your Supabase SQL editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tables
CREATE TABLE tables (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_number varchar(10) UNIQUE NOT NULL,
    qr_code varchar(255) UNIQUE NOT NULL,
    capacity integer NOT NULL,
    status varchar(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'cleaning')),
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- Menu Categories
CREATE TABLE menu_categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name varchar(100) NOT NULL,
    description text,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- Menu Items
CREATE TABLE menu_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid REFERENCES menu_categories(id),
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

-- Table Sessions
CREATE TABLE table_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id uuid REFERENCES tables(id),
    status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'completed')),
    sub_orders jsonb NOT NULL DEFAULT '[]',
    total_amount decimal(10,2) DEFAULT 0,
    created_at timestamp DEFAULT now(),
    completed_at timestamp,
    deleted_at timestamp NULL
);

-- Session Users
CREATE TABLE session_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid REFERENCES table_sessions(id),
    phone_number varchar(15) NOT NULL,
    user_name varchar(100) NOT NULL,
    is_verified boolean DEFAULT false,
    joined_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- Phone Verifications
CREATE TABLE phone_verifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number varchar(15) NOT NULL,
    verification_code varchar(6) NOT NULL,
    expires_at timestamp NOT NULL,
    attempts integer DEFAULT 0,
    is_used boolean DEFAULT false,
    created_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);

-- Orders
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid REFERENCES table_sessions(id),
    sub_order_id uuid NOT NULL,
    user_id uuid REFERENCES session_users(id),
    menu_item_id uuid REFERENCES menu_items(id),
    menu_item_name varchar(150) NOT NULL,
    menu_item_price decimal(10,2) NOT NULL,
    quantity integer NOT NULL DEFAULT 1,
    special_instructions text,
    total_price decimal(10,2) NOT NULL,
    ordered_at timestamp DEFAULT now(),
    deleted_at timestamp NULL
);
```

### 4. Sample Data
```sql
-- Sample table
INSERT INTO tables (table_number, qr_code, capacity) 
VALUES ('T001', 'table_qr_001', 4);

-- Sample menu category
INSERT INTO menu_categories (name, description, sort_order) 
VALUES ('Beverages', 'Hot and cold drinks', 1);

-- Sample menu item
INSERT INTO menu_items (category_id, name, description, price, sort_order) 
VALUES (
    (SELECT id FROM menu_categories WHERE name = 'Beverages'), 
    'Coffee', 
    'Freshly brewed coffee', 
    4.50, 
    1
);
```

### 5. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## User Flow

1. **Scan QR Code** - Customer scans table QR code
2. **Phone Verification** - Enter phone number and verify with OTP
3. **Enter Name** - Provide display name for table session
4. **Browse Menu** - View categorized menu items
5. **Add to Cart** - Select items and quantities
6. **Place Order** - Name the sub-order and submit
7. **Track Status** - Real-time updates on order progress

## Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── page.tsx        # Home (redirects to scan)
│   ├── scan/           # QR scanning and phone verification
│   ├── menu/           # Menu browsing
│   ├── cart/           # Cart and order placement
│   └── order-status/   # Order tracking
├── components/         # React components
├── lib/               # Utilities and API functions
├── store/             # Zustand state management
├── types/             # TypeScript type definitions
└── constants/         # App constants
```

## Development Notes

- The app uses soft deletes (`deleted_at` timestamps)
- Sub-orders are stored as JSON in the `table_sessions` table
- Real-time updates use Supabase's real-time subscriptions
- Phone verification is demo-only (shows code in alert)
- PWA configuration automatically handles caching and offline functionality

## Next Steps

- Implement actual SMS sending for phone verification
- Add admin panel for cafe management
- Implement payment processing
- Add push notifications for order updates
- Enhance error handling and offline capabilities