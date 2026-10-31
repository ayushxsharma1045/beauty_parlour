-- =============================================================================
-- Durga Beauty Parlour - Database Schema & Initial Migrations (PostgreSQL / Supabase)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SERVICES TABLE
CREATE TABLE IF NOT EXISTS public.services (
  id BIGSERIAL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('haircut', 'hairstyling', 'hairspa', 'haircoloring', 'facial', 'makeup', 'waxing', 'nails')),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_mins INT NOT NULL DEFAULT 45,
  price INT NOT NULL,
  price_short INT,
  price_medium INT,
  price_long INT,
  suitable_skin TEXT,
  image_url TEXT NOT NULL,
  is_popular BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  price INT NOT NULL,
  description TEXT NOT NULL,
  suitability TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  is_used_in_salon BOOLEAN DEFAULT TRUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
  id BIGSERIAL PRIMARY KEY,
  booking_ref TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_category TEXT NOT NULL,
  service_id BIGINT REFERENCES public.services(id) ON DELETE SET NULL,
  service_name TEXT NOT NULL,
  hair_length TEXT DEFAULT 'medium',
  appointment_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  notes TEXT,
  price INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_ref TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  items_json JSONB NOT NULL,
  total_amount INT NOT NULL,
  payment_method TEXT DEFAULT 'salon_pickup_cash',
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'processing' CHECK (order_status IN ('processing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.promotions (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  code TEXT UNIQUE,
  discount_text TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id BIGSERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  service_name TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_featured BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  skin_type TEXT,
  concerns TEXT,
  preferred_contact TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SALON SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.salon_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Services & Products: Anyone can read active, only admin can mutate
CREATE POLICY "Public can view active services" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public can view promotions" ON public.promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view featured reviews" ON public.reviews FOR SELECT USING (is_featured = true);

-- Appointments: Customers can view their own, insert new appointments
CREATE POLICY "Anyone can create appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (
  auth.uid() = user_id OR auth.role() = 'service_role'
);
