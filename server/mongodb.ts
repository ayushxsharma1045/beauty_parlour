import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;

export async function connectMongoDB(): Promise<boolean> {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim() === '' || uri.includes('YOUR_ACTUAL_PASSWORD') || uri.includes('<db_password>') || uri.includes('<password>')) {
    console.log('ℹ️  MONGODB_URI in .env contains "<db_password>". Waiting for real password. Running with local SQLite database.');
    isConnected = false;
    return false;
  }

  try {
    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas successfully! (Database: durga_salon)');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB Atlas:', (error as Error).message);
    console.log('ℹ️  Falling back to local SQLite database so the salon website continues running smoothly.');
    isConnected = false;
    return false;
  }
}

export function isMongoDBConnected(): boolean {
  return isConnected && mongoose.connection.readyState === 1;
}

// Sync existing salon records from SQLite into MongoDB Atlas so collections are populated
export async function syncDatabaseToMongoDB(sqliteDb: any) {
  if (!isMongoDBConnected()) return;

  try {
    const { UserModel, ServiceModel, AppointmentModel, MakeoverReelModel } = await import('./models/index.js');

    // 1. Sync Services
    const sqliteServices = sqliteDb.prepare('SELECT * FROM services').all() as any[];
    for (const s of sqliteServices) {
      await ServiceModel.findOneAndUpdate(
        { name: s.name, category: s.category },
        {
          category: s.category,
          name: s.name,
          description: s.description,
          durationMins: s.duration_mins,
          price: s.price,
          priceShort: s.price_short,
          priceMedium: s.price_medium,
          priceLong: s.price_long,
          suitableSkin: s.suitable_skin,
          imageUrl: s.image_url,
          isPopular: Boolean(s.is_popular),
          isActive: Boolean(s.is_active),
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // 2. Sync Users (Admin & Customer accounts)
    const sqliteUsers = sqliteDb.prepare('SELECT * FROM users').all() as any[];
    for (const u of sqliteUsers) {
      await UserModel.findOneAndUpdate(
        { email: u.email.toLowerCase() },
        {
          name: u.name,
          email: u.email.toLowerCase(),
          phone: u.phone,
          passwordHash: u.password_hash,
          role: u.role,
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // 3. Sync Appointments
    const sqliteAppointments = sqliteDb.prepare('SELECT * FROM appointments').all() as any[];
    for (const a of sqliteAppointments) {
      await AppointmentModel.findOneAndUpdate(
        { bookingRef: a.booking_ref },
        {
          bookingRef: a.booking_ref,
          customerName: a.customer_name,
          customerPhone: a.customer_phone,
          customerEmail: a.customer_email,
          serviceCategory: a.service_category,
          serviceId: a.service_id,
          serviceName: a.service_name,
          hairLength: a.hair_length || 'medium',
          appointmentDate: a.appointment_date,
          timeSlot: a.time_slot,
          notes: a.notes,
          price: a.price,
          status: a.status,
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    // 4. Sync Makeover Video Reels
    const sqliteReels = sqliteDb.prepare('SELECT * FROM makeover_videos').all() as any[];
    for (const r of sqliteReels) {
      await MakeoverReelModel.findOneAndUpdate(
        { title: r.title },
        {
          title: r.title,
          category: r.category,
          duration: r.duration,
          videoUrl: r.video_url,
          beforePhotoUrl: r.before_photo_url,
          afterPhotoUrl: r.after_photo_url,
          caption: r.caption,
          artistNotes: r.artist_notes,
          likesCount: r.likes_count,
          viewsCount: r.views_count,
          serviceId: r.service_id,
          serviceName: r.service_name,
          musicUrl: r.music_url,
          musicTitle: r.music_title,
          isActive: Boolean(r.is_active),
        },
        { upsert: true, returnDocument: 'after' }
      );
    }

    console.log('🌸 [MongoDB Atlas] All salon services, users, bookings, and makeover reels synchronized successfully!');
  } catch (err) {
    console.error('⚠️ [MongoDB Atlas] Sync error:', (err as Error).message);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  if (isConnected) {
    await mongoose.connection.close();
  }
  process.exit(0);
});
