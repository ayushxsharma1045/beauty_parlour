# Durga Beauty Parlour — Premium Women's Salon Website & Management System

> **Brand Name:** Durga Beauty Parlour  
> **Tagline:** *"Your Beauty, Our Passion."*  
> **Currency:** Indian Rupees (₹)

A modern, elegant, fully responsive, and full-stack web application designed for **Durga Beauty Parlour**, a premier women's beauty salon and spa. The platform combines a luxurious, welcoming, feminine digital brand presence with a real-time appointment booking engine, retail beauty product catalog, customer portal, and comprehensive salon owner admin dashboard.

---

## 🌸 Brand Identity & Design System

- **Color Palette:**
  - **Blush Pink:** Soft, calming backgrounds and highlight accents (`#FDF2F4`, `#FCE7EC`, `#F8CAD5`)
  - **Rose Gold:** Delicate metallic borders, icons, and gradients (`#B76E79`, `#D4A5AC`)
  - **Deep Maroon / Wine:** Strong, sophisticated typography and primary action buttons (`#541224`, `#681E34`, `#450E1E`)
  - **Cream & Alabaster:** Warm, welcoming page backgrounds (`#FDFBF7`, `#F8F4EE`)
  - **Pure White:** Clean, crisp card surfaces (`#FFFFFF`)
- **Typography:**
  - Headings: `Playfair Display` & `Cormorant Garamond` (luxury editorial serif)
  - Body Text: `Plus Jakarta Sans` (ultra-readable modern geometric sans)
- **Visuals:**
  - Custom generated luxury lotus & feminine profile brand logo emblem (`/images/logo.jpg`)
  - High-resolution salon interior banner with warm ambient lighting and arched mirrors (`/images/hero-banner.jpg`)
  - Authentic Indian bridal makeover portfolio photography (`/images/bridal-hero.jpg`)
  - Soothing botanical facial treatment imagery (`/images/facial-hero.jpg`)

---

## ✨ Features & Functional Modules

### 1. Homepage (`/`)
- **Hero Section:** Full-width salon banner, "Your Beauty, Your Confidence" promotional badge, headline, subtitle, and primary CTAs.
- **Popular Services Grid:** 8 highlighted services (Haircut & Styling, Facials, Hair Spa, Waxing, Bridal Makeup, Party Makeup, Manicure & Pedicure, Hair Coloring) with starting prices in ₹ and direct booking triggers.
- **Why Choose Us:** 6 core pillars highlighting experienced aestheticians, personalized consultations, medical-grade hygiene, quality products, and transparent pricing.
- **Special Offers:** Editable promotional cards (First-Time Customer 20% OFF, Royal Bridal Package, Hair Spa Combos).
- **Client Testimonials:** Verified reviews with star ratings and treatment feedback.
- **Rich Footer:** Complete contact info, opening hours (10:00 AM - 08:00 PM, Tuesday Closed), WhatsApp booking link, and Google Maps embed.

### 2. Hair Services Menu (`/hair-services`)
- All 12 hair services with starting sample prices in Indian Rupees (₹):
  - Basic Haircut (₹150)
  - U-Cut / V-Cut (₹200)
  - Layer Cut (₹350)
  - Feather Cut (₹400)
  - Step Cut (₹350)
  - Bob Cut (₹300)
  - Pixie Cut (₹350)
  - Hair Trimming (₹100)
  - Hair Wash and Blow Dry (₹250)
  - Hair Straightening (₹800)
  - Hair Spa (₹600)
  - Hair Coloring (₹700)
- Interactive category filters: *Haircuts*, *Hair Styling*, *Hair Spa*, and *Hair Coloring*.
- **Dynamic Hair Length Pricing:** Interactive toggles for Short, Medium, and Long hair with live price recalculation.

### 3. Facial & Skincare Menu (`/facials`)
- All 12 facial treatments with treatment duration, skin type suitability, and starting prices in ₹:
  - Basic Cleanup (₹300, 35 mins)
  - Fruit Facial (₹500, 45 mins)
  - Gold Facial (₹800, 60 mins)
  - Diamond Facial (₹1,000, 60 mins)
  - Pearl Facial (₹900, 50 mins)
  - Anti-Tan Facial (₹700, 50 mins)
  - Hydrating Facial (₹800, 50 mins)
  - Brightening Facial (₹900, 60 mins)
  - Anti-Aging Facial (₹1,200, 75 mins)
  - Herbal Facial (₹600, 45 mins)
  - Sensitive Skin Facial (₹800, 45 mins)
  - Premium Bridal Facial (₹1,500, 90 mins)
- **Skin Consultation Modal:** Dedicated form allowing guests to submit skin concerns and receive expert recommendations from a certified aesthetician without misleading lightening claims.

### 4. Beauty Products Catalog & Shopping Cart (`/products`)
- Switchable modes: **Shop Retail Products** and **Products We Use in Salon Treatments**.
- 8 product categories: *Cleansers & Face Wash*, *Facial Kits*, *Face Masks*, *Moisturizers*, *Serums*, *Sunscreens*, *Haircare Products*, and *Bridal Makeup Products*.
- Product cards with price in ₹, size, suitability, and quick modal view.
- Slide-over Shopping Bag drawer with quantity modifiers, instant total calculation, and seamless order checkout flow.

### 5. Appointment Booking System
- **Real-Time Database Persistence:** Saves bookings directly into the SQLite/PostgreSQL database.
- **Past Date Prevention:** Calendar disables all past dates.
- **Weekly Maintenance Awareness:** Tuesday closure is enforced with a helpful advisory.
- **Dynamic Time Slots:** Fetches available slots (`10:00 AM` to `07:00 PM`) and prevents double bookings.
- **Unique Booking Reference:** Auto-generates reference numbers (e.g., `DBP-2026-XXXX`).
- **Instant WhatsApp Confirmation:** Pre-populates a WhatsApp message for one-tap slot confirmation.

### 6. Authentication & Customer Portal (`/auth`, `/portal`)
- Secure registration and login with bcrypt password hashing and JWT session tokens.
- Customer dashboard to view upcoming appointments, reschedule, cancel according to policy, and view product orders.
- Quick 1-click demo logins for instant testing:
  - **Salon Admin:** `admin@durgasalon.com` / `DurgaAdmin@2026`
  - **Customer:** `priya@example.com` / `Customer@123`

### 7. Salon Owner Admin Dashboard (`/admin`)
- **Key Performance Indicators (KPIs):** Today's bookings, total bookings, upcoming, completed, cancelled, and **Earned Revenue** (computed strictly from completed appointments).
- **Appointment Controls:** Real-time filter by status (`confirmed`, `completed`, `cancelled`), search by name/phone/ref, and 1-click status transitions.
- **Services & Pricing CRUD:** Add new services, edit base/short/medium/long pricing, update descriptions, and toggle active status.
- **Products Inventory CRUD:** Add and update salon retail and treatment products.
- **Special Offers Management:** Create and edit promotional discount codes and packages.
- **Salon Settings:** Live update salon timings, weekly off day, address, phone, and WhatsApp contact.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 with Vite 8 (TypeScript) |
| **Styling & Design System** | Tailwind CSS v4, Custom CSS Tokens, Glassmorphism |
| **Animations** | Framer Motion & CSS transitions |
| **Icons** | Lucide React |
| **Backend API** | Node.js with Express 5 (RESTful architecture) |
| **Database** | SQLite via `better-sqlite3` (Zero-config local persistence) |
| **PostgreSQL Schema** | Supabase Migration script (`supabase/migrations/20260101_init_schema.sql`) |
| **Security & Auth** | JSON Web Tokens (JWT) + `bcryptjs` password hashing |

---

## 📁 Project Folder Structure

```
durga/
├── index.html                   # HTML entrypoint with SEO meta, Google Fonts & JSON-LD Schema
├── package.json                 # Scripts and dependencies
├── vite.config.ts               # Vite configuration with Tailwind & /api proxy to port 5001
├── tsconfig.app.json            # TypeScript frontend compiler settings
├── .env.example                 # Example environment variables
├── salon.db                     # Persistent SQLite database file
├── public/
│   └── images/                  # High-resolution brand assets
│       ├── logo.jpg             # Durga Beauty Parlour luxury emblem
│       ├── hero-banner.jpg      # Salon interior styling suite
│       ├── bridal-hero.jpg      # Indian bridal makeover photography
│       └── facial-hero.jpg      # Rejuvenating facial treatment photography
├── server/
│   ├── db.ts                    # SQLite database schema, initialization & seed data
│   ├── auth.ts                  # JWT token helpers & role middleware (admin, staff, customer)
│   └── index.ts                 # Express REST API endpoints & business logic
├── supabase/
│   └── migrations/
│       └── 20260101_init_schema.sql # Complete PostgreSQL DDL & RLS policies for Supabase
└── src/
    ├── main.tsx                 # React DOM root mounting
    ├── App.tsx                  # Routes, layout, and global modals
    ├── index.css                # Luxury design tokens, fonts, and gradients
    ├── types.ts                 # TypeScript interfaces (Service, Product, Appointment, etc.)
    ├── context/
    │   ├── AuthContext.tsx      # User authentication & role state
    │   ├── CartContext.tsx      # Shopping bag state & checkout helpers
    │   └── ToastContext.tsx     # Animated slide-in toast notifications
    ├── components/
    │   ├── Navbar.tsx           # Responsive header with CTA, bag counter & user menu
    │   ├── Footer.tsx           # Salon details, business hours, Google Maps link
    │   ├── BookingModal.tsx     # Multi-step appointment booking engine
    │   ├── SkinConsultationModal.tsx # Personalized skin consultation dialog
    │   ├── CartDrawer.tsx       # Slide-over bag & order checkout
    │   ├── ServiceCard.tsx      # Service presentation with length pricing
    │   ├── ProductCard.tsx      # Product card with Quick Details modal
    │   └── LightboxModal.tsx    # Responsive gallery image viewer
    └── pages/
        ├── HomePage.tsx         # Salon landing page
        ├── HairServicesPage.tsx # Haircut, styling, spa & coloring menu
        ├── FacialSkincarePage.tsx # 12 facial treatments & consultation banner
        ├── ProductsPage.tsx     # Retail & in-salon products catalog
        ├── GalleryPage.tsx      # Categorized portfolio with lightbox
        ├── AboutPage.tsx        # Story, mission, and hygiene protocols
        ├── ContactPage.tsx      # Contact details, map, and inquiry form
        ├── AuthPage.tsx         # Customer & admin login/register
        ├── CustomerPortalPage.tsx # Appointment management & order history
        └── AdminDashboardPage.tsx # Salon owner analytics, appointments & CRUD
```

---

## 🚀 Setup & Installation Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the example file:
```bash
cp .env.example .env
```
*(Default settings work out-of-the-box for local development.)*

### Step 3: Run the Application
Start both the backend server (`http://localhost:5001`) and frontend client (`http://localhost:5173` or `5174`) concurrently:
```bash
npm run dev
```

### Step 4: Access the Website
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔐 Credentials & Default Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Salon Owner (Admin)** | `admin@durgasalon.com` | `DurgaAdmin@2026` | Full administrative access to Dashboard, Pricing, Appointments, Services, Products, and Settings |
| **Customer** | `priya@example.com` | `Customer@123` | Personal appointment booking, reschedule/cancel, order history |
| **Staff Member** | `staff@durgasalon.com` | `DurgaAdmin@2026` | Appointment status management & service assistance |

> **Note:** Quick 1-click login buttons are also provided directly on the `/auth` page for seamless testing!

---

## 🧪 Testing Instructions

1. **Appointment Booking Test:**
   - Click **"Book an Appointment"** on the navbar or hero.
   - Select any service (e.g. *Layer Cut* or *Gold Facial*).
   - If a hair service is chosen, select **Short**, **Medium**, or **Long** hair to observe instant price adjustments.
   - Select an available date and pick an active time slot.
   - Enter your name and phone number, then click **"Confirm Appointment"**.
   - Verify the unique `DBP-2026-XXXX` reference code and WhatsApp confirmation button.

2. **Customer Portal Test:**
   - Log in as `priya@example.com`.
   - Navigate to `/portal` to view upcoming and past appointments.
   - Test **Reschedule** (selects a new slot) or **Cancel Slot**.

3. **Admin Dashboard Test:**
   - Log in as `admin@durgasalon.com`.
   - Navigate to `/admin`.
   - Inspect the KPI cards: observe that **Earned Revenue** strictly counts completed appointments.
   - In the **Appointments** tab, click **"Complete"** or **"Cancel"** on any booking.
   - In the **Services & Pricing** tab, click **"Add New Service"** or edit an existing service price.
   - In the **Salon Settings** tab, adjust opening hours or address and click **"Save Salon Settings"**.

4. **Product Bag & Checkout Test:**
   - Go to `/products`.
   - Click **"Add to Bag"** on any product.
   - The slide-over bag opens with the calculated subtotal in ₹.
   - Click **"Proceed to Checkout"**, fill details, and confirm the order.

---

## ☁️ Deployment Instructions

### Option 1: Frontend on Vercel / Netlify + Backend on Render / Railway
1. **Frontend:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Set environment variable: `VITE_API_URL=https://your-backend-api.onrender.com`
2. **Backend:**
   - Deploy `server/` to Render, Railway, or Fly.io with command: `npm run start`
   - Set `PORT`, `JWT_SECRET`, and persistent volume or Supabase database URL.

### Option 2: Full-Stack on Supabase & Node
1. Create a project in [Supabase](https://supabase.com/).
2. Run the SQL migration script located at `supabase/migrations/20260101_init_schema.sql` in the Supabase SQL Editor.
3. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`.
