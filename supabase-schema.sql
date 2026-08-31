-- ADYFIRE PMS - Complete Supabase Schema
-- Run this in your Supabase SQL Editor

ALTER TABLE IF EXISTS load_items DROP CONSTRAINT IF EXISTS load_items_load_id_fkey;
ALTER TABLE IF EXISTS sale_items DROP CONSTRAINT IF EXISTS sale_items_sale_id_fkey;
ALTER TABLE IF EXISTS extra_charges DROP CONSTRAINT IF EXISTS extra_charges_booking_id_fkey;
ALTER TABLE IF EXISTS employee_payments DROP CONSTRAINT IF EXISTS employee_payments_employee_id_fkey;
ALTER TABLE IF EXISTS hk_tasks DROP CONSTRAINT IF EXISTS hk_tasks_room_id_fkey;
ALTER TABLE IF EXISTS room_date_pricing DROP CONSTRAINT IF EXISTS room_date_pricing_room_id_fkey;
ALTER TABLE IF EXISTS bookings DROP CONSTRAINT IF EXISTS bookings_room_id_fkey;
ALTER TABLE IF EXISTS loads DROP CONSTRAINT IF EXISTS loads_vehicle_id_fkey;
ALTER TABLE IF EXISTS room_types DROP CONSTRAINT IF EXISTS room_types_organization_id_fkey;
ALTER TABLE IF EXISTS departments DROP CONSTRAINT IF EXISTS departments_organization_id_fkey;
ALTER TABLE IF EXISTS employees DROP CONSTRAINT IF EXISTS employees_organization_id_fkey;
ALTER TABLE IF EXISTS employee_payments DROP CONSTRAINT IF EXISTS employee_payments_organization_id_fkey;
ALTER TABLE IF EXISTS expenses DROP CONSTRAINT IF EXISTS expenses_organization_id_fkey;
ALTER TABLE IF EXISTS notes DROP CONSTRAINT IF EXISTS notes_organization_id_fkey;
ALTER TABLE IF EXISTS categories DROP CONSTRAINT IF EXISTS categories_organization_id_fkey;
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_organization_id_fkey;
ALTER TABLE IF EXISTS suppliers DROP CONSTRAINT IF EXISTS suppliers_organization_id_fkey;
ALTER TABLE IF EXISTS customers DROP CONSTRAINT IF EXISTS customers_organization_id_fkey;
ALTER TABLE IF EXISTS sales DROP CONSTRAINT IF EXISTS sales_organization_id_fkey;
ALTER TABLE IF EXISTS sale_items DROP CONSTRAINT IF EXISTS sale_items_organization_id_fkey;
ALTER TABLE IF EXISTS vehicles DROP CONSTRAINT IF EXISTS vehicles_organization_id_fkey;
ALTER TABLE IF EXISTS loads DROP CONSTRAINT IF EXISTS loads_organization_id_fkey;
ALTER TABLE IF EXISTS load_items DROP CONSTRAINT IF EXISTS load_items_organization_id_fkey;
ALTER TABLE IF EXISTS cheques DROP CONSTRAINT IF EXISTS cheques_organization_id_fkey;
ALTER TABLE IF EXISTS banks DROP CONSTRAINT IF EXISTS banks_organization_id_fkey;
ALTER TABLE IF EXISTS bank_details DROP CONSTRAINT IF EXISTS bank_details_organization_id_fkey;
ALTER TABLE IF EXISTS settings DROP CONSTRAINT IF EXISTS settings_organization_id_fkey;
ALTER TABLE IF EXISTS rooms DROP CONSTRAINT IF EXISTS rooms_organization_id_fkey;
ALTER TABLE IF EXISTS room_date_pricing DROP CONSTRAINT IF EXISTS room_date_pricing_organization_id_fkey;
ALTER TABLE IF EXISTS extra_charges DROP CONSTRAINT IF EXISTS extra_charges_organization_id_fkey;
ALTER TABLE IF EXISTS bookings DROP CONSTRAINT IF EXISTS bookings_organization_id_fkey;
ALTER TABLE IF EXISTS hk_tasks DROP CONSTRAINT IF EXISTS hk_tasks_organization_id_fkey;
ALTER TABLE IF EXISTS notifications DROP CONSTRAINT IF EXISTS notifications_organization_id_fkey;
ALTER TABLE IF EXISTS users DROP CONSTRAINT IF EXISTS users_organization_id_fkey;

DROP TABLE IF EXISTS load_items CASCADE;
DROP TABLE IF EXISTS sale_items CASCADE;
DROP TABLE IF EXISTS extra_charges CASCADE;
DROP TABLE IF EXISTS employee_payments CASCADE;
DROP TABLE IF EXISTS hk_tasks CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS room_date_pricing CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS loads CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS bank_details CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS room_types CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS cheques CASCADE;
DROP TABLE IF EXISTS banks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  owner_uid TEXT NOT NULL,
  subscription_plan TEXT,
  subscription_status TEXT DEFAULT 'trial',
  subscription_end_date TIMESTAMPTZ,
  last_payment_date TIMESTAMPTZ,
  billing_cycle TEXT DEFAULT 'monthly',
  dodo_subscription_id TEXT,
  dodo_customer_id TEXT,
  receipt_settings JSONB,
  invoice_settings JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  uid TEXT NOT NULL UNIQUE,
  email TEXT,
  username TEXT,
  display_name TEXT,
  role TEXT DEFAULT 'staff',
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ,
  cashier_permissions JSONB,
  photo_url TEXT,
  last_location JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rooms (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  floor INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  pricing_tiers JSONB DEFAULT '[]',
  amenities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  hk_status TEXT NOT NULL DEFAULT 'clean',
  last_cleaned TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE room_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE room_date_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE(room_id, date)
);

CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_id_passport TEXT,
  phone TEXT,
  email TEXT,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  check_in_time TEXT,
  check_out_time TEXT,
  guests INTEGER DEFAULT 1,
  advance DECIMAL(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming',
  total_amount DECIMAL(10,2) DEFAULT 0,
  booking_type TEXT DEFAULT 'Per Night',
  pricing_tier_id TEXT,
  stay_mode TEXT DEFAULT 'daily',
  duration_units INTEGER DEFAULT 0,
  time_range TEXT DEFAULT '',
  completed_at TEXT,
  source TEXT,
  external_id TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE extra_charges (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TEXT NOT NULL,
  source TEXT DEFAULT 'staff',
  sale_id TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE departments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE employees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  department TEXT,
  salary DECIMAL(10,2) DEFAULT 0,
  phone TEXT,
  joining_date TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE employee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TEXT NOT NULL,
  status TEXT DEFAULT 'paid',
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE hk_tasks (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  assigned_to TEXT,
  type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'task_assigned',
  related_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'paid',
  payment_method TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  color TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  generic_name TEXT,
  manufacturer TEXT,
  pack_size TEXT,
  batch_number TEXT,
  manufacturing_date TEXT,
  rack_location TEXT,
  price DECIMAL(10,2) NOT NULL,
  buying_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  category TEXT,
  emoji TEXT DEFAULT '📦',
  supplier TEXT,
  expire_date TEXT,
  has_warranty BOOLEAN DEFAULT false,
  warranty_period TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT[] DEFAULT '{}',
  address TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  total_loan_amount DECIMAL(10,2) DEFAULT 0,
  total_paid_amount DECIMAL(10,2) DEFAULT 0,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  sale_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'Completed',
  total_amount DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  taxes DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  service_charge DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  customer_id TEXT,
  user_id TEXT,
  organization_id TEXT REFERENCES organizations(id) ON DELETE CASCADE,
  table_number TEXT,
  customer_name TEXT,
  order_type TEXT,
  payment_details JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id TEXT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  is_prepared BOOLEAN DEFAULT false,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE vehicles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  license_plate TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE loads (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'planning',
  total_value DECIMAL(10,2) DEFAULT 0,
  total_items INTEGER DEFAULT 0,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE load_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id TEXT NOT NULL REFERENCES loads(id) ON DELETE CASCADE,
  product_id TEXT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) DEFAULT 0,
  emoji TEXT DEFAULT '📦',
  rack_location TEXT,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE cheques (
  id TEXT PRIMARY KEY,
  invoice_no TEXT,
  cheque_no TEXT NOT NULL,
  cheque_issue_date TEXT NOT NULL,
  cheque_printed_date TEXT,
  cheque_clear_date TEXT,
  duration INTEGER,
  bank TEXT,
  cheque_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'Pending',
  date TIMESTAMPTZ DEFAULT now(),
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE banks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bank_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  branch TEXT,
  important_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  yearly_discount DECIMAL(5,2) DEFAULT 0,
  duration_days INTEGER DEFAULT 7,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  rooms INTEGER DEFAULT 0,
  products INTEGER DEFAULT 0,
  stores INTEGER,
  cashiers INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id TEXT UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  store_name TEXT DEFAULT 'Adyfire (PMS)',
  store_address TEXT DEFAULT '',
  store_phone TEXT DEFAULT '',
  store_email TEXT DEFAULT '',
  currency TEXT DEFAULT 'lkr',
  tax_rate DECIMAL(5,2) DEFAULT 12,
  theme TEXT DEFAULT 'light',
  zoom INTEGER DEFAULT 100,
  auto_print_receipt BOOLEAN DEFAULT false,
  payment_methods JSONB,
  cash_denominations JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_rooms_org ON rooms(organization_id);
CREATE INDEX idx_bookings_org ON bookings(organization_id);
CREATE INDEX idx_bookings_room ON bookings(room_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_employees_org ON employees(organization_id);
CREATE INDEX idx_hk_tasks_org ON hk_tasks(organization_id);
CREATE INDEX idx_hk_tasks_room ON hk_tasks(room_id);
CREATE INDEX idx_notifications_org ON notifications(organization_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_expenses_org ON expenses(organization_id);
CREATE INDEX idx_notes_org ON notes(organization_id);
CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_categories_org ON categories(organization_id);
CREATE INDEX idx_suppliers_org ON suppliers(organization_id);
CREATE INDEX idx_customers_org ON customers(organization_id);
CREATE INDEX idx_sales_org ON sales(organization_id);
CREATE INDEX idx_sales_status ON sales(status);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX idx_loads_org ON loads(organization_id);
CREATE INDEX idx_cheques_org ON cheques(organization_id);
CREATE INDEX idx_banks_org ON banks(organization_id);
CREATE INDEX idx_room_date_pricing_org ON room_date_pricing(organization_id);
CREATE INDEX idx_room_date_pricing_room ON room_date_pricing(room_id);
CREATE INDEX idx_extra_charges_booking ON extra_charges(booking_id);
CREATE INDEX idx_employee_payments_employee ON employee_payments(employee_id);

DROP FUNCTION IF EXISTS current_user_org_id();

CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id FROM users WHERE uid = auth.uid()::text LIMIT 1;
$$;

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_date_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE extra_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE hk_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cheques ENABLE ROW LEVEL SECURITY;
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_isolation_select" ON organizations
  FOR SELECT USING (id IN (SELECT organization_id FROM users WHERE uid = auth.uid()::text));

CREATE POLICY "org_isolation_insert" ON organizations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "org_isolation_update" ON organizations
  FOR UPDATE USING (owner_uid = auth.uid()::text);

CREATE POLICY "users_select" ON users
  FOR SELECT USING (uid = auth.uid()::text OR organization_id = current_user_org_id());

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update" ON users
  FOR UPDATE USING (uid = auth.uid()::text OR (organization_id = current_user_org_id() AND current_user_org_id() IN (SELECT organization_id FROM users WHERE uid = auth.uid()::text AND role IN ('super-admin', 'admin'))));

CREATE POLICY "org_select_rooms" ON rooms FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_rooms" ON rooms FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_rooms" ON rooms FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_rooms" ON rooms FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_room_types" ON room_types FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_room_types" ON room_types FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_room_types" ON room_types FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_room_types" ON room_types FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_room_date_pricing" ON room_date_pricing FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_room_date_pricing" ON room_date_pricing FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_room_date_pricing" ON room_date_pricing FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_room_date_pricing" ON room_date_pricing FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_bookings" ON bookings FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_bookings" ON bookings FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_bookings" ON bookings FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_bookings" ON bookings FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_extra_charges" ON extra_charges FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_extra_charges" ON extra_charges FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_extra_charges" ON extra_charges FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_extra_charges" ON extra_charges FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_departments" ON departments FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_departments" ON departments FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_departments" ON departments FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_departments" ON departments FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_employees" ON employees FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_employees" ON employees FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_employees" ON employees FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_employees" ON employees FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_employee_payments" ON employee_payments FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_employee_payments" ON employee_payments FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_employee_payments" ON employee_payments FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_employee_payments" ON employee_payments FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_hk_tasks" ON hk_tasks FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_hk_tasks" ON hk_tasks FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_hk_tasks" ON hk_tasks FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_hk_tasks" ON hk_tasks FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_notifications" ON notifications FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_notifications" ON notifications FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_notifications" ON notifications FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_notifications" ON notifications FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_expenses" ON expenses FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_expenses" ON expenses FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_expenses" ON expenses FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_expenses" ON expenses FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_notes" ON notes FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_notes" ON notes FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_notes" ON notes FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_notes" ON notes FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_categories" ON categories FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_categories" ON categories FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_categories" ON categories FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_categories" ON categories FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_products" ON products FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_products" ON products FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_products" ON products FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_products" ON products FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_suppliers" ON suppliers FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_suppliers" ON suppliers FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_suppliers" ON suppliers FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_suppliers" ON suppliers FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_customers" ON customers FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_customers" ON customers FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_customers" ON customers FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_customers" ON customers FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_sales" ON sales FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_sales" ON sales FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_sales" ON sales FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_sales" ON sales FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_sale_items" ON sale_items FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_sale_items" ON sale_items FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_sale_items" ON sale_items FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_sale_items" ON sale_items FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_vehicles" ON vehicles FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_vehicles" ON vehicles FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_vehicles" ON vehicles FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_vehicles" ON vehicles FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_loads" ON loads FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_loads" ON loads FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_loads" ON loads FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_loads" ON loads FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_load_items" ON load_items FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_load_items" ON load_items FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_load_items" ON load_items FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_load_items" ON load_items FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_cheques" ON cheques FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_cheques" ON cheques FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_cheques" ON cheques FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_cheques" ON cheques FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_banks" ON banks FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_banks" ON banks FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_banks" ON banks FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_banks" ON banks FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_bank_details" ON bank_details FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_bank_details" ON bank_details FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_bank_details" ON bank_details FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_bank_details" ON bank_details FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "org_select_settings" ON settings FOR SELECT USING (organization_id = current_user_org_id());
CREATE POLICY "org_insert_settings" ON settings FOR INSERT WITH CHECK (organization_id = current_user_org_id());
CREATE POLICY "org_update_settings" ON settings FOR UPDATE USING (organization_id = current_user_org_id());
CREATE POLICY "org_delete_settings" ON settings FOR DELETE USING (organization_id = current_user_org_id());

CREATE POLICY "pricing_plans_select" ON pricing_plans
  FOR SELECT USING (true);

CREATE POLICY "pricing_plans_all" ON pricing_plans
  USING (current_user_org_id() IS NOT NULL AND EXISTS (
    SELECT 1 FROM users WHERE uid = auth.uid()::text AND role IN ('super-admin', 'admin')
  ));
