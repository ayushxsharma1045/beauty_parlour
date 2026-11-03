import mongoose, { Schema, Document } from 'mongoose';

// 1. User Schema (Admins, Staff, Customers)
export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'admin' | 'staff' | 'customer';
  createdAt: Date;
}

export const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
  createdAt: { type: Date, default: Date.now },
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// 2. Appointment Booking Schema
export interface IAppointment extends Document {
  bookingRef: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceCategory: string;
  serviceId?: number;
  serviceName: string;
  hairLength: string;
  appointmentDate: string; // YYYY-MM-DD
  timeSlot: string; // e.g. '10:00 AM'
  notes?: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
}

export const AppointmentSchema = new Schema<IAppointment>({
  bookingRef: { type: String, required: true, unique: true },
  userId: { type: String },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  serviceCategory: { type: String, required: true },
  serviceId: { type: Number },
  serviceName: { type: String, required: true },
  hairLength: { type: String, default: 'medium' },
  appointmentDate: { type: String, required: true },
  timeSlot: { type: String, required: true },
  notes: { type: String },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'confirmed' },
  createdAt: { type: Date, default: Date.now },
});

export const AppointmentModel = mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

// 3. Salon Service Schema
export interface IService extends Document {
  category: string;
  name: string;
  description: string;
  durationMins: number;
  price: number;
  priceShort?: number;
  priceMedium?: number;
  priceLong?: number;
  suitableSkin?: string;
  imageUrl: string;
  isPopular: boolean;
  isActive: boolean;
  createdAt: Date;
}

export const ServiceSchema = new Schema<IService>({
  category: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  durationMins: { type: Number, default: 45 },
  price: { type: Number, required: true },
  priceShort: { type: Number },
  priceMedium: { type: Number },
  priceLong: { type: Number },
  suitableSkin: { type: String },
  imageUrl: { type: String, required: true },
  isPopular: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const ServiceModel = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);

// 4. Makeover Video Reels Schema
export interface IMakeoverReel extends Document {
  title: string;
  category: string;
  duration: string;
  videoUrl: string;
  beforePhotoUrl?: string;
  afterPhotoUrl: string;
  caption?: string;
  artistNotes?: string;
  likesCount: number;
  viewsCount: number;
  serviceId?: number;
  serviceName?: string;
  musicUrl?: string;
  musicTitle?: string;
  isActive: boolean;
  createdAt: Date;
}

export const MakeoverReelSchema = new Schema<IMakeoverReel>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  duration: { type: String, default: '0:30' },
  videoUrl: { type: String, required: true },
  beforePhotoUrl: { type: String },
  afterPhotoUrl: { type: String, required: true },
  caption: { type: String },
  artistNotes: { type: String },
  likesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  serviceId: { type: Number },
  serviceName: { type: String },
  musicUrl: { type: String },
  musicTitle: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export const MakeoverReelModel = mongoose.models.MakeoverReel || mongoose.model<IMakeoverReel>('MakeoverReel', MakeoverReelSchema);
