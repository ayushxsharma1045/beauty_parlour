export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  is_approved?: number;
  designation?: string;
  created_at?: string;
}

export interface Service {
  id: number;
  category: 'haircut' | 'hairstyling' | 'hairspa' | 'haircoloring' | 'facial' | 'makeup' | 'waxing' | 'nails' | string;
  name: string;
  description: string;
  duration_mins: number;
  price: number;
  price_short?: number | null;
  price_medium?: number | null;
  price_long?: number | null;
  suitable_skin?: string | null;
  image_url: string;
  is_popular?: number;
  is_active?: number;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  size: string;
  price: number;
  description: string;
  suitability?: string;
  in_stock: number;
  is_used_in_salon: number;
  image_url: string;
}

export interface Appointment {
  id: number;
  booking_ref: string;
  user_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  service_category: string;
  service_id?: number | null;
  service_name: string;
  hair_length?: 'short' | 'medium' | 'long';
  appointment_date: string;
  time_slot: string;
  notes?: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Promotion {
  id: number;
  title: string;
  tagline?: string;
  code?: string;
  discount_text: string;
  description: string;
  category: string;
  is_active: number;
}

export interface Review {
  id: number;
  customer_name: string;
  service_name: string;
  rating: number;
  comment: string;
  is_featured: number;
  created_at: string;
}

export interface SalonSettings {
  salon_name?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  opening_time?: string;
  closing_time?: string;
  weekly_off?: string;
  announcement?: string;
}

export interface AdminStats {
  today_appointments: number;
  total_bookings: number;
  upcoming_appointments: number;
  completed_appointments: number;
  cancelled_appointments: number;
  earned_revenue: number;
  popular_services: Array<{
    service_name: string;
    bookings: number;
    revenue: number;
  }>;
  recent_appointments: Appointment[];
}

export interface GalleryPhoto {
  id: number;
  title: string;
  category: 'hair' | 'facial' | 'bridal' | 'makeup' | 'interiors' | 'festive' | string;
  url: string;
  description?: string;
  created_at?: string;
}

export interface AdminLog {
  id: number;
  admin_name: string;
  action: string;
  target_type: string;
  target_id?: string | null;
  details: string;
  ip_address?: string;
  created_at: string;
}

export interface MakeoverVideo {
  id: number;
  title: string;
  category: 'bridal' | 'hair' | 'festive' | 'facial' | 'makeover' | string;
  video_url: string;
  thumbnail_url: string;
  duration?: string;
  views?: number;
  likes?: number;
  before_image?: string | null;
  after_image?: string | null;
  service_id?: number | null;
  service_name?: string | null;
  description?: string | null;
  music_url?: string | null;
  music_title?: string | null;
  created_at?: string;
}

export interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    totalBookings: number;
    completedBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    completionRate: number;
    averageOrderValue: number;
    uniqueCustomers: number;
    repeatCustomers: number;
    repeatRate: number;
    busiestDay: string;
    topCategory: string;
  };
  monthlyTrends: Array<{
    key: string;
    month: string;
    revenue: number;
    bookings: number;
    completed: number;
    growth: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    label: string;
    count: number;
    revenue: number;
    percentage: number;
    color: string;
  }>;
  dayOfWeekTrends: Array<{
    key: string;
    day: string;
    fullDay: string;
    bookings: number;
    revenue: number;
  }>;
  hourlyTraffic: Array<{
    slot: string;
    count: number;
    percentage: number;
  }>;
  statusBreakdown: {
    completed: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  topServices: Array<{
    name: string;
    category: string;
    bookings: number;
    revenue: number;
    share: number;
  }>;
  topClients: Array<{
    name: string;
    phone: string;
    email: string;
    visits: number;
    totalSpent: number;
    lastVisit: string;
    favoriteService: string;
  }>;
}

