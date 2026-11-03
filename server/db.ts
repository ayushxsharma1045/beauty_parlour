import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../salon.db');
export const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer', -- 'admin', 'staff', 'customer'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL, -- 'haircut', 'hairstyling', 'hairspa', 'haircoloring', 'facial', 'makeup', 'waxing', 'nails'
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_mins INTEGER NOT NULL DEFAULT 45,
      price INTEGER NOT NULL,
      price_short INTEGER,
      price_medium INTEGER,
      price_long INTEGER,
      suitable_skin TEXT,
      image_url TEXT NOT NULL,
      is_popular INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL, -- 'cleansers', 'facial_kits', 'face_masks', 'moisturizers', 'serums', 'sunscreens', 'haircare', 'bridal_makeup'
      size TEXT NOT NULL,
      price INTEGER NOT NULL,
      description TEXT NOT NULL,
      suitability TEXT,
      in_stock INTEGER DEFAULT 1,
      is_used_in_salon INTEGER DEFAULT 1,
      image_url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_ref TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      service_category TEXT NOT NULL,
      service_id INTEGER,
      service_name TEXT NOT NULL,
      hair_length TEXT DEFAULT 'medium',
      appointment_date TEXT NOT NULL, -- 'YYYY-MM-DD'
      time_slot TEXT NOT NULL, -- '10:00 AM'
      notes TEXT,
      price INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed', -- 'pending', 'confirmed', 'completed', 'cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_ref TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_email TEXT,
      shipping_address TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      payment_method TEXT DEFAULT 'salon_pickup_cash',
      payment_status TEXT DEFAULT 'pending',
      order_status TEXT DEFAULT 'processing', -- 'processing', 'ready', 'completed', 'cancelled'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tagline TEXT,
      code TEXT UNIQUE,
      discount_text TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      service_name TEXT NOT NULL,
      rating INTEGER NOT NULL DEFAULT 5,
      comment TEXT NOT NULL,
      is_featured INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      skin_type TEXT,
      concerns TEXT,
      preferred_contact TEXT DEFAULT 'whatsapp',
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS salon_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'hair', 'facial', 'bridal', 'makeup', 'interiors', 'festive'
      url TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS makeover_videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'bridal', 'hair', 'festive', 'facial', 'makeover'
      video_url TEXT NOT NULL,
      thumbnail_url TEXT NOT NULL,
      duration TEXT DEFAULT '0:30',
      views INTEGER DEFAULT 1200,
      likes INTEGER DEFAULT 84,
      before_image TEXT,
      after_image TEXT,
      service_id INTEGER,
      service_name TEXT,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_name TEXT NOT NULL,
      action TEXT NOT NULL, -- e.g. 'UPDATE_APPOINTMENT', 'COMPLETE_APPOINTMENT', 'CANCEL_APPOINTMENT', 'ADD_SERVICE', 'EDIT_SERVICE', 'DELETE_SERVICE', 'ADD_PRODUCT', 'ADD_PHOTO', 'DELETE_PHOTO', 'UPDATE_SETTINGS'
      target_type TEXT NOT NULL, -- 'appointment', 'service', 'product', 'gallery', 'settings', 'system'
      target_id TEXT,
      details TEXT NOT NULL,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  // Check if users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const adminPasswordHash = bcrypt.hashSync('DurgaAdmin@2026', 10);
    const customerPasswordHash = bcrypt.hashSync('Customer@123', 10);

    const insertUser = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)
    `);

    insertUser.run('Durga Salon Admin', 'admin@durgasalon.com', '+91 98765 43210', adminPasswordHash, 'admin');
    insertUser.run('Priya Sharma', 'priya@example.com', '+91 98234 56789', customerPasswordHash, 'customer');
    insertUser.run('Kavita Verma (Senior Stylist)', 'staff@durgasalon.com', '+91 98111 22334', adminPasswordHash, 'staff');
  }

  // Check if services exist
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number };
  if (serviceCount.count === 0) {
    const insertService = db.prepare(`
      INSERT INTO services (category, name, description, duration_mins, price, price_short, price_medium, price_long, suitable_skin, image_url, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // 12 Hair Services from prompt
    const hairServices = [
      {
        category: 'haircut',
        name: 'Basic Haircut',
        desc: 'Precision trimming and clean edge shaping tailored for an effortless, neat look.',
        duration: 30,
        price: 150,
        short: 150,
        med: 180,
        long: 220,
        img: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'haircut',
        name: 'U-Cut / V-Cut',
        desc: 'Classic geometric taper creating graceful curvature that accentuates hair volume.',
        duration: 35,
        price: 200,
        short: 200,
        med: 250,
        long: 300,
        img: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'haircut',
        name: 'Layer Cut',
        desc: 'Soft cascading layers that infuse bounce, dimension, and lively movement into your tresses.',
        duration: 45,
        price: 350,
        short: 350,
        med: 450,
        long: 550,
        img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'haircut',
        name: 'Feather Cut',
        desc: 'Delicately textured airy ends framing facial contours with lightweight elegance.',
        duration: 45,
        price: 400,
        short: 400,
        med: 500,
        long: 600,
        img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'haircut',
        name: 'Step Cut',
        desc: 'Distinct tiered graduate sections providing structured dramatic volume.',
        duration: 40,
        price: 350,
        short: 350,
        med: 450,
        long: 550,
        img: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'haircut',
        name: 'Bob Cut',
        desc: 'Chic, modern chin-to-shoulder grazing silhouette with sleek polished lines.',
        duration: 40,
        price: 300,
        short: 300,
        med: 350,
        long: 400,
        img: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'haircut',
        name: 'Pixie Cut',
        desc: 'Daring, playful, low-maintenance cropped cut accentuating cheekbones and eyes.',
        duration: 35,
        price: 350,
        short: 350,
        med: 350,
        long: 400,
        img: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'hairstyling',
        name: 'Hair Trimming',
        desc: 'Split-end removal preserving overall hair length while rejuvenating healthy fiber tips.',
        duration: 20,
        price: 100,
        short: 100,
        med: 120,
        long: 150,
        img: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'hairstyling',
        name: 'Hair Wash and Blow Dry',
        desc: 'Invigorating deep scalp cleanse followed by a silky, voluminous salon blow-dry finish.',
        duration: 35,
        price: 250,
        short: 250,
        med: 300,
        long: 350,
        img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'hairstyling',
        name: 'Hair Straightening',
        desc: 'Silky smooth keratin and thermal alignment leaving hair frizz-free and glossy.',
        duration: 90,
        price: 800,
        short: 800,
        med: 1200,
        long: 1600,
        img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'hairspa',
        name: 'Hair Spa',
        desc: 'Deep conditioning cream bath with steam, scalp massage, and intensive moisture restoration.',
        duration: 60,
        price: 600,
        short: 600,
        med: 800,
        long: 1000,
        img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'haircoloring',
        name: 'Hair Coloring',
        desc: 'Ammonia-free global hues, root touch-ups, and luminous highlights for radiant sheen.',
        duration: 75,
        price: 700,
        short: 700,
        med: 1000,
        long: 1400,
        img: 'https://images.unsplash.com/photo-1522337094133-f4cc48568324?auto=format&fit=crop&w=800&q=80',
        popular: 1
      }
    ];

    for (const s of hairServices) {
      insertService.run(s.category, s.name, s.desc, s.duration, s.price, s.short, s.med, s.long, null, s.img, s.popular);
    }

    // 12 Facial and Skincare Services from prompt
    const facialServices = [
      {
        name: 'Basic Cleanup',
        desc: 'Gentle cleansing, steam, blackhead extraction, and soothing mask for quick instant refresh.',
        duration: 35,
        price: 300,
        skin: 'All Skin Types',
        img: 'https://images.unsplash.com/photo-1512290900672-1f41d916bb4d?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Fruit Facial',
        desc: 'Enriched with fresh natural fruit enzymes to gently exfoliate, nourish, and revitalize.',
        duration: 45,
        price: 500,
        skin: 'Normal to Dry Skin',
        img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Gold Facial',
        desc: 'Infused with colloidal 24K gold dust and botanical serums for radiant festive shimmer.',
        duration: 60,
        price: 800,
        skin: 'Dull & Special Occasions',
        img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Diamond Facial',
        desc: 'Micro-diamond polish providing velvety smooth texture, refinement, and youthful glow.',
        duration: 60,
        price: 1000,
        skin: 'Mature & Uneven Texture',
        img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Pearl Facial',
        desc: 'Natural pearl extract treatment restoring moisture balance, cooling, and subtle luminosity.',
        duration: 50,
        price: 900,
        skin: 'Combination & Pigmented Skin',
        img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Anti-Tan Facial',
        desc: 'Formulated with liquorice and citrus extracts to gently diminish sun dullness and calm skin.',
        duration: 50,
        price: 700,
        skin: 'Sun Exposed & Tan-Prone Skin',
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Hydrating Facial',
        desc: 'Deep hyaluronic moisture surge with soothing cool jade roller massage for plump suppleness.',
        duration: 50,
        price: 800,
        skin: 'Dry & Dehydrated Skin',
        img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Brightening Facial',
        desc: 'Vitamin C and mulberry complex aiding in natural glow and revitalizing tired complexions.',
        duration: 60,
        price: 900,
        skin: 'Tired & Fatigued Complexions',
        img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Anti-Aging Facial',
        desc: 'Peptide firming massage with collagen pack to nurture skin elasticity and soften expression lines.',
        duration: 75,
        price: 1200,
        skin: 'Mature Skin with Fine Lines',
        img: 'https://images.unsplash.com/photo-1512290900672-1f41d916bb4d?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Herbal Facial',
        desc: 'Pure neem, tulsi, and sandalwood concoction calming redness and purifying pores naturally.',
        duration: 45,
        price: 600,
        skin: 'Sensitive, Oily & Blemish-Prone',
        img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Sensitive Skin Facial',
        desc: 'Hypoallergenic, fragrance-free formula with soothing aloe vera and chamomile extract.',
        duration: 45,
        price: 800,
        skin: 'Reactive & Sensitive Skin',
        img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Premium Bridal Facial',
        desc: 'Our crown jewel multi-step royal ritual with gold foil, collagen peel-off, and relaxing back massage.',
        duration: 90,
        price: 1500,
        skin: 'Brides & Special Occasions',
        img: '/images/facial-hero.jpg',
        popular: 1
      }
    ];

    for (const f of facialServices) {
      insertService.run('facial', f.name, f.desc, f.duration, f.price, null, null, null, f.skin, f.img, f.popular);
    }

    // Additional popular services
    insertService.run(
      'makeup',
      'Bridal Makeup',
      'Complete high-definition bridal glam with hairstyling, dupatta draping, and customized lashes.',
      150,
      4500,
      null, null, null,
      'All Skin Types',
      '/images/bridal-hero.jpg',
      1
    );

    insertService.run(
      'makeup',
      'Party Makeup',
      'Glamorous, long-wearing makeup look customized for weddings, anniversaries, and festive celebrations.',
      60,
      1800,
      null, null, null,
      'All Skin Types',
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
      1
    );

    insertService.run(
      'waxing',
      'Eyebrow Threading and Waxing',
      'Flawless precision eyebrow shaping and smooth hygienic hair removal using gentle honey wax.',
      25,
      250,
      null, null, null,
      'All Skin Types',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      1
    );

    insertService.run(
      'nails',
      'Manicure and Pedicure',
      'Exfoliating salt soak, cuticle care, relaxing hand & foot massage, and long-lasting polish.',
      60,
      650,
      null, null, null,
      'All Skin Types',
      'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=800&q=80',
      1
    );
  }

  // Check if products exist
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number };
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (name, brand, category, size, price, description, suitability, in_stock, is_used_in_salon, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const products = [
      {
        name: 'Rose & Aloe Hydrating Cleanser',
        brand: 'Durga Botanica',
        category: 'cleansers',
        size: '150 ml',
        price: 450,
        desc: 'Gentle soap-free face cleanser infused with pure Damask rose water and soothing organic aloe.',
        suitability: 'Normal to Dry & Sensitive Skin',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Radiant 24K Gold Facial Kit',
        brand: 'Luxe Aura',
        category: 'facial_kits',
        size: '5 Steps (100g)',
        price: 950,
        desc: 'Complete 5-step home facial kit with scrub, massage cream, gold gel, and peel-off mask.',
        suitability: 'All Skin Types (Special Events)',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Purifying Multani & Sandalwood Clay Mask',
        brand: 'Durga Botanica',
        category: 'face_masks',
        size: '100 g',
        price: 380,
        desc: 'Traditional cooling herbal clay mask that gently unclogs pores and controls excess sebum.',
        suitability: 'Oily and Combination Skin',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Silk Dew Ceramide Moisturizer',
        brand: 'Luxe Aura',
        category: 'moisturizers',
        size: '75 ml',
        price: 650,
        desc: 'Lightweight, velvety emulsion barrier cream that locks in 24-hour hydration without greasiness.',
        suitability: 'Dry & Dehydrated Skin',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1608248597359-5779c13b2e53?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Glow Boost 10% Vitamin C Serum',
        brand: 'Durga Botanica',
        category: 'serums',
        size: '30 ml',
        price: 790,
        desc: 'Concentrated antioxidant serum with stabilized Vitamin C and ferulic acid for a vibrant complexion.',
        suitability: 'Dull & Sun-Fatigued Skin',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Velvet Shield Matte Sunscreen SPF 50+',
        brand: 'Luxe Aura',
        category: 'sunscreens',
        size: '80 g',
        price: 520,
        desc: 'Non-greasy, zero white-cast broad-spectrum UVA/UVB gel cream ideal for Indian weather.',
        suitability: 'All Skin Types (Matte Finish)',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Moroccan Argan Nourishing Hair Oil & Serum',
        brand: 'Luxe Haircare',
        category: 'haircare',
        size: '100 ml',
        price: 850,
        desc: 'Cold-pressed Argan elixir that tames frizz, protects against heat styling, and restores natural shine.',
        suitability: 'Dry, Frizzy & Colored Hair',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Bridal Velvet Matte Setting Spray & Primer',
        brand: 'Luxe Glamour',
        category: 'bridal_makeup',
        size: '120 ml',
        price: 890,
        desc: 'Professional 16-hour smudge-proof setting spray with rose gold micro-dew finish.',
        suitability: 'Bridal & Long-Wear Looks',
        used_in_salon: 1,
        img: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const p of products) {
      insertProduct.run(p.name, p.brand, p.category, p.size, p.price, p.desc, p.suitability, 1, p.used_in_salon, p.img);
    }
  }

  // Check promotions
  const promoCount = db.prepare('SELECT COUNT(*) as count FROM promotions').get() as { count: number };
  if (promoCount.count === 0) {
    const insertPromo = db.prepare(`
      INSERT INTO promotions (title, tagline, code, discount_text, description, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertPromo.run(
      'First-Time Customer Special',
      'Welcome to Durga Beauty Parlour',
      'WELCOME20',
      '20% OFF',
      'Enjoy an exclusive 20% flat discount on any Haircut or Facial on your very first salon visit.',
      'first_time',
      1
    );

    insertPromo.run(
      'Royal Bridal Glow Package',
      'Your Dream Wedding Makeover',
      'BRIDAL2026',
      '₹1,000 OFF',
      'Includes Premium Bridal Facial, Pre-Bridal Hair Spa, Deluxe Pedicure, and Complete Bridal Makeup.',
      'bridal',
      1
    );

    insertPromo.run(
      'Hair Spa & Styling Combo',
      'Revitalize Your Hair',
      'HAIRCARE15',
      '15% OFF',
      'Get a relaxing deep conditioning Hair Spa paired with a designer haircut and blowout at special combo pricing.',
      'hair',
      1
    );

    insertPromo.run(
      'Monthly Glow Facial Pass',
      'Consistent Self-Care',
      'GLOWPASS',
      'Save ₹500',
      'Book any Gold or Diamond Facial and receive a complimentary herbal eye treatment and neck massage.',
      'facial',
      1
    );
  }

  // Check reviews
  const reviewCount = db.prepare('SELECT COUNT(*) as count FROM reviews').get() as { count: number };
  if (reviewCount.count === 0) {
    const insertReview = db.prepare(`
      INSERT INTO reviews (customer_name, service_name, rating, comment, is_featured)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertReview.run(
      'Ananya Sharma',
      'Premium Bridal Facial & Makeup',
      5,
      'Durga Beauty Parlour made my wedding day unforgettable! The bridal makeover was so natural, radiant, and elegant. The staff took time to understand exactly what I wanted.',
      1
    );

    insertReview.run(
      'Pooja Mehta',
      'Layer Cut & Hair Spa',
      5,
      'Best haircut experience I have had! The stylist knew exactly how to give my flat hair volume and movement. The salon is spotless, hygienic, and very relaxing.',
      1
    );

    insertReview.run(
      'Sunita Rawat',
      'Gold Facial & Threading',
      5,
      'Extremely polite and skilled beauticians. The facial massage was so soothing, and my skin felt deeply hydrated and fresh for days. Truly transparent pricing!',
      1
    );

    insertReview.run(
      'Neha Joshi',
      'Hair Straightening & Coloring',
      5,
      'They use high quality products that do not damage hair. My hair feels so soft and glossy. Highly recommended salon for all women in the area.',
      1
    );
  }

  // Check appointments sample data
  const apptCount = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number };
  if (apptCount.count === 0) {
    const insertAppt = db.prepare(`
      INSERT INTO appointments (booking_ref, user_id, customer_name, customer_phone, customer_email, service_category, service_id, service_name, hair_length, appointment_date, time_slot, notes, price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Sample appointments for demonstration
    insertAppt.run(
      'DBP-2026-1001',
      2,
      'Priya Sharma',
      '+91 98234 56789',
      'priya@example.com',
      'haircut',
      3,
      'Layer Cut',
      'medium',
      '2026-10-30',
      '11:00 AM',
      'Prefers soft curtain bangs in front',
      450,
      'confirmed'
    );

    insertAppt.run(
      'DBP-2026-1002',
      null,
      'Meenakshi Gupta',
      '+91 98450 12345',
      'meenakshi@gmail.com',
      'facial',
      15,
      'Gold Facial',
      'short',
      '2026-10-30',
      '02:00 PM',
      'Attending family anniversary in evening',
      800,
      'confirmed'
    );

    insertAppt.run(
      'DBP-2026-0988',
      null,
      'Ritu Singhania',
      '+91 98711 99887',
      'ritu@singhania.in',
      'hairspa',
      11,
      'Hair Spa',
      'long',
      '2026-10-28',
      '04:00 PM',
      'Deep steam massage requested',
      1000,
      'completed'
    );

    insertAppt.run(
      'DBP-2026-0975',
      null,
      'Divya Rathore',
      '+91 98333 44556',
      'divya.r@outlook.com',
      'facial',
      24,
      'Premium Bridal Facial',
      'medium',
      '2026-10-27',
      '10:30 AM',
      'Pre-wedding consultation',
      1500,
      'completed'
    );
  }

  // Check salon settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM salon_settings').get() as { count: number };
  if (settingsCount.count === 0) {
    const insertSetting = db.prepare('INSERT INTO salon_settings (key, value) VALUES (?, ?)');
    insertSetting.run('salon_name', 'Durga Beauty Parlour');
    insertSetting.run('tagline', 'Your Beauty, Our Passion.');
    insertSetting.run('address', '42, Rose Garden Avenue, Near City Centre, Jaipur, Rajasthan 302001');
    insertSetting.run('phone', '+91 98765 43210');
    insertSetting.run('whatsapp', '919876543210');
    insertSetting.run('email', 'contact@durgabeautyparlour.com');
    insertSetting.run('opening_time', '10:00 AM');
    insertSetting.run('closing_time', '08:00 PM');
    insertSetting.run('weekly_off', 'Tuesday');
    insertSetting.run('announcement', 'Book in advance for festive and bridal slots! Festive discount code: WELCOME20');
  }

  // Ensure diverse hair coloring options are available
  const existingHairColors = db.prepare("SELECT COUNT(*) as count FROM services WHERE category = 'haircoloring'").get() as { count: number };
  if (existingHairColors.count <= 1) {
    const insertService = db.prepare(`
      INSERT INTO services (category, name, description, duration_mins, price, price_short, price_medium, price_long, suitable_skin, image_url, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const additionalHairColors = [
      {
        name: 'Global Hair Color (Ammonia-Free)',
        desc: 'Full head radiant shade using gentle organic ammonia-free gloss formulation for deep luster.',
        duration: 90,
        price: 1200,
        short: 1200,
        med: 1800,
        long: 2400,
        img: '/images/hair-coloring.jpg',
        popular: 1
      },
      {
        name: 'Root Touch-Up & Grey Coverage',
        desc: '100% seamless grey coverage precisely matched to your natural hair tone for fresh roots.',
        duration: 45,
        price: 500,
        short: 500,
        med: 650,
        long: 800,
        img: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Balayage French Freehand Highlights',
        desc: 'Bespoke hand-painted sun-kissed graduation creating soft depth, caramel accents, and dimension.',
        duration: 120,
        price: 2200,
        short: 2200,
        med: 2900,
        long: 3600,
        img: '/images/hair-coloring.jpg',
        popular: 1
      },
      {
        name: 'Ombré Hair Transformation',
        desc: 'Soft gradient transition seamlessly blending deeper roots into radiant sunlit ends.',
        duration: 100,
        price: 2000,
        short: 2000,
        med: 2600,
        long: 3200,
        img: 'https://images.unsplash.com/photo-1522337094133-f4cc48568324?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Crown Foil Highlights & Streaks',
        desc: 'Precision foil highlights framing the face and crown with vibrant contrast and volume.',
        duration: 90,
        price: 1500,
        short: 1500,
        med: 2100,
        long: 2700,
        img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        name: 'Fashion Colors (Burgundy / Copper / Plum)',
        desc: 'Trendsetting vivid shades with bond protecting pre-lightening and rich conditioning tone.',
        duration: 110,
        price: 1800,
        short: 1800,
        med: 2400,
        long: 3000,
        img: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Organic Ayurvedic Henna Treatment',
        desc: 'Pure Rajasthani herbal henna enriched with amla, shikakai and bhringraj for natural sheen.',
        duration: 60,
        price: 400,
        short: 400,
        med: 550,
        long: 700,
        img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        name: 'Keratin Color Gloss & Anti-Brass Toner',
        desc: 'Quick gloss bath canceling unwanted yellow tones while infusing mirror-like gloss and conditioning.',
        duration: 40,
        price: 800,
        short: 800,
        med: 1100,
        long: 1400,
        img: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=800&q=80',
        popular: 0
      }
    ];

    for (const hc of additionalHairColors) {
      // Check if already exists by name
      const exists = db.prepare("SELECT id FROM services WHERE name = ?").get(hc.name);
      if (!exists) {
        insertService.run(
          'haircoloring',
          hc.name,
          hc.desc,
          hc.duration,
          hc.price,
          hc.short,
          hc.med,
          hc.long,
          null,
          hc.img,
          hc.popular
        );
      }
    }
  }

  // Ensure Wedding and Festival packages exist in services
  const existingFestive = db.prepare("SELECT COUNT(*) as count FROM services WHERE category IN ('bridal', 'festive')").get() as { count: number };
  if (existingFestive.count <= 2) {
    const insertService = db.prepare(`
      INSERT INTO services (category, name, description, duration_mins, price, price_short, price_medium, price_long, suitable_skin, image_url, is_popular)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const weddingAndFestiveServices = [
      {
        category: 'bridal',
        name: 'Royal Indian Bridal HD Airbrush Package',
        desc: 'Complete luxury HD Airbrush makeup, bridal hair updo with fresh flower setting, jewellery placement, and dupatta/saree draping.',
        duration: 180,
        price: 11000,
        img: '/images/bridal-hero.jpg',
        popular: 1
      },
      {
        category: 'bridal',
        name: 'Engagement & Sagan Ceremony Glam',
        desc: 'Sophisticated cocktail glam with soft rose-gold smokey eyes, sculpted contour, and textured romantic updo.',
        duration: 90,
        price: 4500,
        img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'bridal',
        name: 'Mehendi & Haldi Sunshine Dewy Glow',
        desc: 'Fresh, radiant dewy makeup with floral hair accessories and long-lasting sweat-proof base for day ceremonies.',
        duration: 75,
        price: 3500,
        img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'bridal',
        name: 'Sangeet Night Bollywood Glam',
        desc: 'High-impact glitter eye artistry, smudge-proof winged liner, and bouncy Hollywood waves crafted for celebration dancing.',
        duration: 90,
        price: 4000,
        img: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'bridal',
        name: 'Pre-Bridal 7-Day Royal Ritual Package',
        desc: 'Complete pre-wedding overhaul: Premium Bridal Facial, full-body Rica waxing, deluxe pedicure & manicure, and restorative hair spa.',
        duration: 240,
        price: 6500,
        img: '/images/facial-hero.jpg',
        popular: 1
      },
      {
        category: 'bridal',
        name: 'Bridesmaid & Sister Makeover Special',
        desc: 'Flawless HD party makeup, false lashes, and festive designer hairstyling for bride sisters and mothers.',
        duration: 60,
        price: 2200,
        img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'festive',
        name: 'Karwa Chauth Moonlit Glow Package',
        desc: '24K Gold Facial, traditional Rajasthani Mehendi hand designing, express manicure, and luminous hair blowout.',
        duration: 90,
        price: 1800,
        img: '/images/festive-hero.jpg',
        popular: 1
      },
      {
        category: 'festive',
        name: 'Diwali Deepavali Dhamaka Glam',
        desc: 'Diamond radiance cleanup, relaxing scalp cream bath, and traditional festive festive makeup with lash enhancement.',
        duration: 90,
        price: 2200,
        img: '/images/festive-hero.jpg',
        popular: 1
      },
      {
        category: 'festive',
        name: 'Navratri Dandiya & Garba Sweat-Proof Package',
        desc: '12-hour sweat-proof makeup, bold smudge-free liner, and braided ethnic hair styling with colorful parandi.',
        duration: 60,
        price: 1500,
        img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
        popular: 1
      },
      {
        category: 'festive',
        name: 'Teej & Raksha Bandhan Festive Special',
        desc: 'Herbal fruit cleanup, organic henna application, eyebrow threading, and festive hair styling.',
        duration: 60,
        price: 1400,
        img: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        popular: 0
      },
      {
        category: 'festive',
        name: 'Eid Radiance & Noor Glow',
        desc: 'Pearl brightening treatment, silk hair blowout, and soft velvet matte finish makeup.',
        duration: 80,
        price: 2000,
        img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        popular: 1
      }
    ];

    for (const ws of weddingAndFestiveServices) {
      const exists = db.prepare("SELECT id FROM services WHERE name = ?").get(ws.name);
      if (!exists) {
        insertService.run(
          ws.category,
          ws.name,
          ws.desc,
          ws.duration,
          ws.price,
          null, null, null,
          'All Skin Types',
          ws.img,
          ws.popular
        );
      }
    }
  }

  // Seed gallery photos if empty
  const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get() as { count: number };
  if (galleryCount.count === 0) {
    const insertGallery = db.prepare(`
      INSERT INTO gallery (title, category, url, description)
      VALUES (?, ?, ?, ?)
    `);

    const defaultGallery = [
      {
        title: 'Luxury Salon Styling Suite & Arched Mirrors',
        category: 'interiors',
        url: '/images/hero-banner.jpg',
        description: 'Our main styling floor with rose gold accents and custom lighting.'
      },
      {
        title: 'Royal Indian Bridal Makeover & Hair Artistry',
        category: 'bridal',
        url: '/images/bridal-hero.jpg',
        description: 'High-definition bridal makeup with authentic jewelry and floral hairstyle.'
      },
      {
        title: 'Hydrating Botanical Facial & Rose Petal Spa',
        category: 'facial',
        url: '/images/facial-hero.jpg',
        description: 'Soothing facial treatment room with fresh damask rose petals.'
      },
      {
        title: 'Caramel Honey Balayage & Soft Waves',
        category: 'hair',
        url: '/images/hair-coloring.jpg',
        description: 'Seamless French freehand balayage with luminous dimension.'
      },
      {
        title: 'Karwa Chauth & Diwali Festive Glow',
        category: 'festive',
        url: '/images/festive-hero.jpg',
        description: 'Radiant festive glam in royal velvet maroon and gold jewelry.'
      },
      {
        title: 'Multi-Dimensional Cascading Layer Haircut',
        category: 'hair',
        url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
        description: 'Face-framing layers tailored for voluminous bounce.'
      },
      {
        title: 'Luminous Party Makeup with Rose Gold Shimmer',
        category: 'makeup',
        url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
        description: 'Evening party glam with champagne and rose gold pigments.'
      },
      {
        title: 'Silky Smooth Keratin Treatment & Blowout',
        category: 'hair',
        url: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&q=80',
        description: 'Frizz-free silk thermal finish with mirror shine.'
      },
      {
        title: 'Reception Waiting Lounge with Warm Accents',
        category: 'interiors',
        url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80',
        description: 'Comfortable waiting lounge welcoming our valued guests.'
      }
    ];

    for (const g of defaultGallery) {
      insertGallery.run(g.title, g.category, g.url, g.description);
    }
  }

  // Seed sample admin logs if empty
  const logCount = db.prepare('SELECT COUNT(*) as count FROM admin_logs').get() as { count: number };
  if (logCount.count === 0) {
    const insertLog = db.prepare(`
      INSERT INTO admin_logs (admin_name, action, target_type, target_id, details, ip_address, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertLog.run(
      'Durga Salon Admin',
      'INITIALIZE_SYSTEM',
      'system',
      'SYS-001',
      'Initial salon management system initialized with security protocols and 28 default service offerings.',
      '127.0.0.1',
      '2026-10-29 08:30:00'
    );
    insertLog.run(
      'Durga Salon Admin',
      'UPDATE_SETTINGS',
      'settings',
      'salon_settings',
      'Salon business hours verified: 10:00 AM – 08:00 PM (Tuesdays Closed for deep sanitization).',
      '127.0.0.1',
      '2026-10-29 08:35:00'
    );
    insertLog.run(
      'Durga Salon Admin',
      'CONFIRM_APPOINTMENT',
      'appointment',
      'DBP-2026-1001',
      'Confirmed appointment for Priya Sharma (Layer Cut) on 2026-10-30 at 11:00 AM.',
      '127.0.0.1',
      '2026-10-29 09:15:00'
    );
    insertLog.run(
      'Durga Salon Admin',
      'COMPLETE_APPOINTMENT',
      'appointment',
      'DBP-2026-0988',
      'Marked appointment DBP-2026-0988 (Ritu Singhania - Hair Spa) as COMPLETED. Earned ₹1,000.',
      '127.0.0.1',
      '2026-10-29 10:20:00'
    );
    insertLog.run(
      'Durga Salon Admin',
      'ADD_GALLERY_PHOTO',
      'gallery',
      'GAL-004',
      'Uploaded new portfolio showcase: Caramel Honey Balayage & Soft Waves in category [Hair].',
      '127.0.0.1',
      '2026-10-30 11:00:00'
    );
  }

  // Ensure dates in appointments have varied dates (today, tomorrow, upcoming)
  const todayDate = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const dayAfterDate = dayAfter.toISOString().split('T')[0];

  const insertAppt = db.prepare(`
    INSERT OR IGNORE INTO appointments (booking_ref, user_id, customer_name, customer_phone, customer_email, service_category, service_id, service_name, hair_length, appointment_date, time_slot, notes, price, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const hasToday = db.prepare("SELECT id FROM appointments WHERE appointment_date = ?").get(todayDate);
  if (!hasToday) {
    insertAppt.run(
      `DBP-${new Date().getFullYear()}-TD01`,
      null,
      'Aarti Khandelwal',
      '+91 98290 11223',
      'aarti.k@gmail.com',
      'bridal',
      null,
      'Royal Indian Bridal HD Airbrush Package',
      'long',
      todayDate,
      '10:00 AM',
      'Wedding evening event at City Palace',
      11000,
      'confirmed'
    );
    insertAppt.run(
      `DBP-${new Date().getFullYear()}-TD02`,
      null,
      'Simran Kaur',
      '+91 98140 55667',
      'simran@yahoo.com',
      'haircoloring',
      null,
      'Balayage French Freehand Highlights',
      'medium',
      todayDate,
      '02:00 PM',
      'Honey blonde tones requested',
      2900,
      'confirmed'
    );
  }

  const hasTomorrow = db.prepare("SELECT id FROM appointments WHERE appointment_date = ?").get(tomorrowDate);
  if (!hasTomorrow) {
    insertAppt.run(
      `DBP-${new Date().getFullYear()}-TM01`,
      null,
      'Rashmi Pareek',
      '+91 97850 44332',
      'rashmi.p@gmail.com',
      'festive',
      null,
      'Karwa Chauth Moonlit Glow Package',
      'medium',
      tomorrowDate,
      '11:00 AM',
      'Mehendi & Gold Facial combo',
      1800,
      'confirmed'
    );
    insertAppt.run(
      `DBP-${new Date().getFullYear()}-TM02`,
      null,
      'Deepika Choudhary',
      '+91 98291 99887',
      'deepika@gmail.com',
      'facial',
      null,
      'Gold Facial',
      'short',
      tomorrowDate,
      '04:00 PM',
      'Family anniversary function',
      800,
      'confirmed'
    );
  }

  const hasDayAfter = db.prepare("SELECT id FROM appointments WHERE appointment_date = ?").get(dayAfterDate);
  if (!hasDayAfter) {
    insertAppt.run(
      `DBP-${new Date().getFullYear()}-DA01`,
      null,
      'Pooja Malpani',
      '+91 98288 33221',
      'pooja.m@rediffmail.com',
      'bridal',
      null,
      'Engagement & Sagan Ceremony Glam',
      'medium',
      dayAfterDate,
      '01:00 PM',
      'Cocktail evening makeover',
      4500,
      'confirmed'
    );
  }

  // Ensure music_url and music_title columns exist in makeover_videos
  try {
    db.exec('ALTER TABLE makeover_videos ADD COLUMN music_url TEXT');
  } catch {}
  try {
    db.exec('ALTER TABLE makeover_videos ADD COLUMN music_title TEXT');
  } catch {}

  // Ensure is_approved and designation columns exist in users
  try {
    db.exec('ALTER TABLE users ADD COLUMN is_approved INTEGER DEFAULT 1');
  } catch {}
  try {
    db.exec("ALTER TABLE users ADD COLUMN designation TEXT DEFAULT 'Salon Stylist'");
  } catch {}

  // Seed / Upsert Makeover Short Videos (Before & After Transformations with Indian Music)
  const upsertVideo = db.prepare(`
    INSERT INTO makeover_videos (title, category, video_url, thumbnail_url, duration, views, likes, before_image, after_image, service_name, description, music_url, music_title)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      category = excluded.category,
      video_url = excluded.video_url,
      music_url = excluded.music_url,
      music_title = excluded.music_title,
      description = excluded.description
  `);

  const initialReels = [
    {
      title: 'Royal Heritage Bridal HD Makeover',
      category: 'bridal',
      video_url: '/videos/bridal-makeover.mp4',
      thumbnail_url: '/images/reels/bridal-makeover.jpg',
      duration: '0:45',
      views: 34800,
      likes: 2150,
      before_image: '/images/reels/bridal-before.jpg',
      after_image: '/images/reels/bridal-makeover.jpg',
      service_name: 'Bridal HD Airbrush Makeover',
      description: 'Complete Royal Kundan bridal transformation with flawless HD dewy base, winged contour eye glam, and authentic heritage velvet lehenga styling.',
      music_url: '/audio/mundian-to-bach-ke.mp3',
      music_title: 'Mundian To Bach Ke (Bhangra Anthem) - Panjabi MC'
    },
    {
      title: 'Moroccan Argan Hair Spa & Scalp Therapy',
      category: 'hair_spa',
      video_url: '/videos/hair-spa.mp4',
      thumbnail_url: '/images/reels/hair-makeover.jpg',
      duration: '0:42',
      views: 41200,
      likes: 3120,
      before_image: '/images/reels/hair-before.jpg',
      after_image: '/images/reels/hair-makeover.jpg',
      service_name: 'Intensive Hair Spa & Scalp Therapy',
      description: 'Deep conditioning steam hair spa with Moroccan argan oil mask, acupressure scalp massage, and anti-frizz mirror gloss treatment.',
      music_url: '/audio/indian-bansuri-spa.mp3',
      music_title: 'Soothing Indian Bansuri Flute & Tanpura Spa'
    },
    {
      title: 'Deep Scalp Detox Steam & Keratin Infusion Hair Spa',
      category: 'hair_spa',
      video_url: '/videos/hair-spa-wash.mp4',
      thumbnail_url: '/images/reels/hair-spa-wash-after.jpg',
      duration: '0:38',
      views: 38400,
      likes: 2790,
      before_image: '/images/reels/hair-spa-wash-before.jpg',
      after_image: '/images/reels/hair-spa-wash-after.jpg',
      service_name: 'Keratin Steam Spa & Scalp Detox',
      description: 'Rejuvenating hot steam rinse, botanical tea-tree scalp scrub, and ultra-hydrating keratin protein masque leaving hair feather-light and mirror smooth.',
      music_url: '/audio/mera-laung-gawacha.mp3',
      music_title: 'Mera Laung Gawacha (Desi Pop) - Bally Sagoo'
    },
    {
      title: 'Rich Burgundy & Mocha Balayage Transformation',
      category: 'hair_color',
      video_url: '/videos/hair-color.mp4',
      thumbnail_url: '/images/reels/hair-makeover.jpg',
      duration: '0:38',
      views: 58900,
      likes: 4310,
      before_image: '/images/reels/hair-before.jpg',
      after_image: '/images/reels/hair-makeover.jpg',
      service_name: 'Global Hair Color + Highlights',
      description: 'Seamless foil balayage blending dark mocha roots into radiant burgundy ribbons with high-shine glossing and blowout curls.',
      music_url: '/audio/mera-laung-gawacha.mp3',
      music_title: 'Mera Laung Gawacha (Desi Pop) - Bally Sagoo'
    },
    {
      title: 'Caramel Honey Balayage & Gloss Transformation',
      category: 'hair_color',
      video_url: '/videos/hair-makeover.mp4',
      thumbnail_url: '/images/reels/hair-makeover.jpg',
      duration: '0:35',
      views: 52100,
      likes: 3890,
      before_image: '/images/reels/hair-before.jpg',
      after_image: '/images/reels/hair-makeover.jpg',
      service_name: 'Global Hair Color + Balayage',
      description: 'Dull uncolored hair transformed into multidimensional warm honey caramel balayage with signature bouncy blowout curls and mirror shine.',
      music_url: '/audio/mast-kalandar-remix.mp3',
      music_title: 'Mast Kalandar (Modern Dance Beat)'
    },
    {
      title: 'Hazelnut Toffee Balayage & Bounce Blowout Transformation',
      category: 'hair_color',
      video_url: '/videos/hair-color-balayage.mp4',
      thumbnail_url: '/images/reels/hair-color-balayage-after.jpg',
      duration: '0:42',
      views: 46700,
      likes: 3410,
      before_image: '/images/reels/hair-color-balayage-before.jpg',
      after_image: '/images/reels/hair-color-balayage-after.jpg',
      service_name: 'Premium Balayage & Gloss Toner',
      description: 'Hand-painted sun-kissed toffee ribbon highlights on deep espresso hair, enriched with Bond-builder plex shield and finished with voluminous 90s blowout waves.',
      music_url: '/audio/mundian-to-bach-ke.mp3',
      music_title: 'Mundian To Bach Ke (Bhangra Anthem) - Panjabi MC'
    },
    {
      title: '24K Gold Hydra-Glow Facial Reveal',
      category: 'facial',
      video_url: '/videos/facial-glow.mp4',
      thumbnail_url: '/images/reels/facial-glow.jpg',
      duration: '0:40',
      views: 29300,
      likes: 1940,
      before_image: '/images/reels/facial-before.jpg',
      after_image: '/images/reels/facial-glow.jpg',
      service_name: 'Gold Radiance Facial',
      description: 'Instant Korean glass-skin transformation. Botanical micro-massage, herbal peel, and 24K gold foil infused moisture lock for deep rejuvenation.',
      music_url: '/audio/mast-kalandar-remix.mp3',
      music_title: 'Mast Kalandar (Modern Dance Beat)'
    },
    {
      title: 'Botanical Herbal Deep Cleanse & Glow Facial',
      category: 'facial',
      video_url: '/videos/facial-mask.mp4',
      thumbnail_url: '/images/reels/facial-glow.jpg',
      duration: '0:36',
      views: 37400,
      likes: 2850,
      before_image: '/images/reels/facial-before.jpg',
      after_image: '/images/reels/facial-glow.jpg',
      service_name: 'Herbal & Fruit Radiance Facial',
      description: 'Pure herbal mask infusion with lymphatic drainage for instant pore tightening and rosy pink natural glow.',
      music_url: '/audio/mera-laung-gawacha.mp3',
      music_title: 'Mera Laung Gawacha (Desi Pop) - Bally Sagoo'
    },
    {
      title: 'Luxury Jade Roller & Kumkumadi Glow Facial Massage',
      category: 'facial',
      video_url: '/videos/facial-massage.mp4',
      thumbnail_url: '/images/reels/facial-massage-after.jpg',
      duration: '0:35',
      views: 33100,
      likes: 2420,
      before_image: '/images/reels/facial-massage-before.jpg',
      after_image: '/images/reels/facial-massage-after.jpg',
      service_name: 'Ayurvedic Kumkumadi Glow Facial',
      description: 'Acupressure face sculpting, chilled jade roller toning, and cold-pressed saffron kumkumadi oil massage for luminous glass radiance and lifted facial contours.',
      music_url: '/audio/raga-yaman-sitar.mp3',
      music_title: 'Raga Yaman - Peaceful Sitar & Tanpura'
    },
    {
      title: 'Festive Sagan & Cocktail Glam Reveal',
      category: 'festive',
      video_url: '/videos/festive-makeover.mp4',
      thumbnail_url: '/images/reels/festive-makeover.jpg',
      duration: '0:30',
      views: 24700,
      likes: 1680,
      before_image: '/images/reels/festive-before.jpg',
      after_image: '/images/reels/festive-makeover.jpg',
      service_name: 'Festive Sagan Evening Glow',
      description: 'Soft rose-gold smokey eye, luminous blush cheeks, and romantic cascading waves styled for an evening festive celebration.',
      music_url: '/audio/bollywood-dance-beat.mp3',
      music_title: 'Chamiya No. 1 (Bollywood Dance Anthem)'
    }
  ];

  for (const reel of initialReels) {
    const existing = db.prepare('SELECT id FROM makeover_videos WHERE title = ?').get(reel.title) as { id: number } | undefined;
    if (existing) {
      db.prepare(`
        UPDATE makeover_videos
        SET category = ?, video_url = ?, thumbnail_url = ?, before_image = ?, after_image = ?, music_url = ?, music_title = ?, description = ?
        WHERE id = ?
      `).run(reel.category, reel.video_url, reel.thumbnail_url, reel.before_image, reel.after_image, reel.music_url, reel.music_title, reel.description, existing.id);
    } else {
      db.prepare(`
        INSERT INTO makeover_videos (title, category, video_url, thumbnail_url, duration, views, likes, before_image, after_image, service_name, description, music_url, music_title)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        reel.title,
        reel.category,
        reel.video_url,
        reel.thumbnail_url,
        reel.duration,
        reel.views,
        reel.likes,
        reel.before_image,
        reel.after_image,
        reel.service_name,
        reel.description,
        reel.music_url,
        reel.music_title
      );
    }
  }
}
