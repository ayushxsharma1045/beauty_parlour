import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Scissors,
  Sparkles,
  ShoppingBag,
  Tag,
  Settings,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Search,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  Save,
  MessageSquare,
  Camera,
  FileText,
  Upload,
  Layers,
  Filter,
  CalendarDays,
  Image as ImageIcon,
  ExternalLink,
  ChevronDown,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  ShieldAlert,
  ArrowRight,
  Video,
  Film,
  Sliders,
  Heart
} from 'lucide-react';
import {
  AdminStats,
  Appointment,
  Service,
  Product,
  Promotion,
  SalonSettings,
  AdminLog,
  GalleryPhoto,
  User,
  MakeoverVideo
} from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const AdminDashboardPage: React.FC = () => {
  const { user, token, isAdmin, isStaff, login, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Authentication form state for unauthenticated admin access (no hardcoded credentials)
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin Gateway Authentication Mode ('signin' | 'register')
  const [adminAuthMode, setAdminAuthMode] = useState<'signin' | 'register'>('signin');
  const [publicAdminStatus, setPublicAdminStatus] = useState<{
    count: number;
    maxLimit: number;
    canRegisterAdmin: boolean;
  } | null>(null);
  const [regAdminForm, setRegAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isRegisteringAdmin, setIsRegisteringAdmin] = useState(false);

  // Edit Logged-in Administrator's Profile & Credentials
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'appointments' | 'services' | 'products' | 'gallery' | 'videos' | 'admins' | 'logs' | 'promotions' | 'settings'
  >('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [settings, setSettings] = useState<SalonSettings>({});
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [makeoverVideos, setMakeoverVideos] = useState<MakeoverVideo[]>([]);
  const [isAddVideoOpen, setIsAddVideoOpen] = useState(false);
  const [newVideoForm, setNewVideoForm] = useState({
    title: '',
    category: 'bridal',
    video_url: '',
    thumbnail_url: '',
    duration: '0:30',
    before_image: '',
    after_image: '',
    service_name: '',
    description: ''
  });
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);

  // Admins management state (Max 2 Admins Rule)
  const [adminsList, setAdminsList] = useState<User[]>([]);
  const [adminCount, setAdminCount] = useState<number>(1);
  const [canAddAdmin, setCanAddAdmin] = useState<boolean>(true);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);

  // Appointment filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchAppointment, setSearchAppointment] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'today', 'tomorrow', 'custom'
  const [customDate, setCustomDate] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grouped' | 'table'>('grouped');

  // Service Edit / Add Modal
  const [editingService, setEditingService] = useState<Partial<Service> | null>(null);
  const [isNewService, setIsNewService] = useState(false);

  // Product Edit / Add Modal
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  // Add Photo Modal
  const [isAddPhotoOpen, setIsAddPhotoOpen] = useState(false);
  const [newPhoto, setNewPhoto] = useState({
    title: '',
    category: 'hair',
    url: '',
    description: ''
  });
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);

  // Admin Log Filters
  const [logActionFilter, setLogActionFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');

  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data once authenticated
  const loadAllData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [statsRes, apptsRes, servicesRes, productsRes, promosRes, settingsRes, galleryRes, videosRes, logsRes, adminsRes] =
        await Promise.all([
          fetch('/api/admin/stats', { headers }),
          fetch('/api/appointments', { headers }),
          fetch('/api/services?all=true'),
          fetch('/api/products'),
          fetch('/api/promotions?all=true'),
          fetch('/api/settings'),
          fetch('/api/gallery'),
          fetch('/api/videos'),
          fetch('/api/admin/logs', { headers }),
          fetch('/api/admin/admins', { headers })
        ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (apptsRes.ok) setAppointments(await apptsRes.json());
      if (servicesRes.ok) setServices(await servicesRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (promosRes.ok) setPromotions(await promosRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (galleryRes.ok) setGalleryPhotos(await galleryRes.json());
      if (videosRes.ok) setMakeoverVideos(await videosRes.json());
      if (logsRes.ok) setAdminLogs(await logsRes.json());
      if (adminsRes.ok) {
        const aData = await adminsRes.json();
        setAdminsList(aData.admins);
        setAdminCount(aData.count);
        setCanAddAdmin(aData.canAddAdmin);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showToast('Error loading admin dashboard records.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && (isAdmin || isStaff)) {
      loadAllData();
    }
  }, [token, isAdmin, isStaff]);

  // Check admin availability status for login gateway
  const fetchPublicAdminStatus = async () => {
    try {
      const res = await fetch('/api/auth/admin-status');
      if (res.ok) {
        const data = await res.json();
        setPublicAdminStatus(data);
      }
    } catch (err) {
      console.error('Failed to load admin status:', err);
    }
  };

  useEffect(() => {
    fetchPublicAdminStatus();
  }, []);

  // Handle Admin Portal Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!adminEmail.trim() || !adminPassword.trim()) {
      setLoginError('Please enter your administrator ID (email or mobile number) and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail.trim(), password: adminPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Authentication failed. Please verify your credentials.');
        return;
      }

      if (data.user.role !== 'admin' && data.user.role !== 'staff') {
        setLoginError('Access Denied. This account has customer privileges only. Administrator credentials required.');
        return;
      }

      login(data.token, data.user);
      showToast(`Welcome back, ${data.user.name}! Administrator session authorized.`, 'success');
    } catch {
      setLoginError('Connection error while contacting salon authentication server.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Admin Self-Registration from Gateway (Only allowed if total admins < 2)
  const handleRegisterAdminGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!regAdminForm.name.trim() || !regAdminForm.email.trim() || !regAdminForm.password) {
      setLoginError('Full name, email ID, and password are required.');
      return;
    }

    if (regAdminForm.password.length < 6) {
      setLoginError('Password must be at least 6 characters.');
      return;
    }

    if (regAdminForm.password !== regAdminForm.confirmPassword) {
      setLoginError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsRegisteringAdmin(true);
    try {
      const res = await fetch('/api/auth/register-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regAdminForm.name.trim(),
          email: regAdminForm.email.trim(),
          phone: regAdminForm.phone.trim(),
          password: regAdminForm.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || 'Failed to register your administrator account.');
        return;
      }

      login(data.token, data.user);
      showToast(`Welcome ${data.user.name}! Your administrator credentials have been created and session activated.`, 'success');
    } catch {
      setLoginError('Network connection error while registering administrator.');
    } finally {
      setIsRegisteringAdmin(false);
    }
  };

  // Handle Logged-In Administrator Updating Their Own Profile / Credentials
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProfileForm.name.trim() || !editProfileForm.email.trim()) {
      showToast('Name and email are required.', 'error');
      return;
    }

    if (editProfileForm.password && editProfileForm.password !== editProfileForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editProfileForm.name.trim(),
          email: editProfileForm.email.trim(),
          phone: editProfileForm.phone.trim(),
          password: editProfileForm.password ? editProfileForm.password.trim() : undefined
        })
      });

      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        showToast('Your administrator profile & credentials have been updated successfully!', 'success');
        setIsEditProfileOpen(false);

        // Refresh admin records and activity logs
        const [adRes, logRes] = await Promise.all([
          fetch('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (adRes.ok) {
          const aData = await adRes.json();
          setAdminsList(aData.admins);
          setAdminCount(aData.count);
          setCanAddAdmin(aData.canAddAdmin);
        }
        if (logRes.ok) setAdminLogs(await logRes.json());
      } else {
        showToast(data.error || 'Failed to update credentials.', 'error');
      }
    } catch {
      showToast('Network error while updating administrator credentials.', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Adding Second Admin (Strictly capped at 2 admins)
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCount >= 2) {
      showToast('Administrator limit reached! Only 2 admin accounts are permitted.', 'error');
      return;
    }
    if (!newAdminForm.name.trim() || !newAdminForm.email.trim() || !newAdminForm.password) {
      showToast('Full name, email, and password are required.', 'error');
      return;
    }

    setIsSavingAdmin(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdminForm)
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Second Administrator account created! Add Admin option is now CLOSED (2/2 admins reached).', 'success');
        setIsAddAdminOpen(false);
        setNewAdminForm({ name: '', email: '', phone: '', password: '' });

        // Reload admins and logs
        const [adRes, logRes] = await Promise.all([
          fetch('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (adRes.ok) {
          const aData = await adRes.json();
          setAdminsList(aData.admins);
          setAdminCount(aData.count);
          setCanAddAdmin(aData.canAddAdmin);
        }
        if (logRes.ok) setAdminLogs(await logRes.json());
      } else {
        showToast(data.error || 'Failed to create administrator account.', 'error');
      }
    } catch {
      showToast('Network error creating administrator.', 'error');
    } finally {
      setIsSavingAdmin(false);
    }
  };

  // Handle Deleting Administrator
  const handleDeleteAdmin = async (id: number) => {
    if (id === user?.id) {
      showToast('You cannot delete your own logged-in admin account.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to remove this administrator account? One admin slot will reopen.')) return;

    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Administrator account removed. 1 admin slot is now open.', 'success');
        const [adRes, logRes] = await Promise.all([
          fetch('/api/admin/admins', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (adRes.ok) {
          const aData = await adRes.json();
          setAdminsList(aData.admins);
          setAdminCount(aData.count);
          setCanAddAdmin(aData.canAddAdmin);
        }
        if (logRes.ok) setAdminLogs(await logRes.json());
      } else {
        showToast(data.error || 'Failed to remove administrator.', 'error');
      }
    } catch {
      showToast('Network error removing administrator.', 'error');
    }
  };

  // Handle appointment status change
  const handleUpdateAppointmentStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Appointment status updated to ${newStatus.toUpperCase()}`, 'success');
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus as any } : a))
        );
        // Refresh stats & logs
        const [statsRes, logsRes] = await Promise.all([
          fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to update appointment status.', 'error');
      }
    } catch {
      showToast('Network error updating status.', 'error');
    }
  };

  // Handle save service (Add or Edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name || !editingService.price) {
      showToast('Service name and price are required.', 'error');
      return;
    }

    try {
      const url = isNewService ? '/api/services' : `/api/services/${editingService.id}`;
      const method = isNewService ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingService)
      });

      if (res.ok) {
        showToast(isNewService ? 'New service added!' : 'Service updated successfully!', 'success');
        setEditingService(null);
        // Reload services & logs
        const [servRes, logsRes] = await Promise.all([
          fetch('/api/services?all=true'),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (servRes.ok) setServices(await servRes.json());
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to save service.', 'error');
      }
    } catch {
      showToast('Network error saving service.', 'error');
    }
  };

  // Handle delete service
  const handleDeleteService = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Service deleted.', 'success');
        setServices((prev) => prev.filter((s) => s.id !== id));
        const logsRes = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to delete service.', 'error');
      }
    } catch {
      showToast('Network error deleting service.', 'error');
    }
  };

  // Handle save product (Add or Edit)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) {
      showToast('Product name and price are required.', 'error');
      return;
    }

    try {
      const url = isNewProduct ? '/api/products' : `/api/products/${editingProduct.id}`;
      const method = isNewProduct ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingProduct)
      });

      if (res.ok) {
        showToast(isNewProduct ? 'Product created!' : 'Product updated!', 'success');
        setEditingProduct(null);
        const [prodRes, logsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (prodRes.ok) setProducts(await prodRes.json());
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to save product.', 'error');
      }
    } catch {
      showToast('Network error saving product.', 'error');
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Product removed.', 'success');
        setProducts((prev) => prev.filter((p) => p.id !== id));
        const logsRes = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to delete product.', 'error');
      }
    } catch {
      showToast('Network error deleting product.', 'error');
    }
  };

  // Handle save settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        showToast('Salon settings updated successfully!', 'success');
        const logsRes = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to save settings.', 'error');
      }
    } catch {
      showToast('Network error saving settings.', 'error');
    }
  };

  // Handle upload & save photo
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size exceeds 5MB limit. Please choose a smaller file.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewPhoto((prev) => ({ ...prev, url: result }));
        setPhotoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoto.title.trim() || !newPhoto.url.trim()) {
      showToast('Please enter a photo title and provide an image URL or upload.', 'error');
      return;
    }

    setIsSavingPhoto(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPhoto)
      });

      if (res.ok) {
        showToast('Photo added to gallery successfully!', 'success');
        setIsAddPhotoOpen(false);
        setNewPhoto({ title: '', category: 'hair', url: '', description: '' });
        setPhotoPreview('');
        // Reload gallery & logs
        const [galRes, logRes] = await Promise.all([
          fetch('/api/gallery'),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (galRes.ok) setGalleryPhotos(await galRes.json());
        if (logRes.ok) setAdminLogs(await logRes.json());
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to add photo.', 'error');
      }
    } catch {
      showToast('Network error adding photo.', 'error');
    } finally {
      setIsSavingPhoto(false);
    }
  };

  // Handle delete photo
  const handleDeletePhoto = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this photo from the gallery?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('Photo deleted from gallery.', 'success');
        setGalleryPhotos((prev) => prev.filter((p) => p.id !== id));
        const logsRes = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to delete photo.', 'error');
      }
    } catch {
      showToast('Network error deleting photo.', 'error');
    }
  };

  // Handle Before photo file upload
  const handleBeforePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Photo size exceeds 8MB. Please select a smaller photo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVideoForm((prev) => ({ ...prev, before_image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle After photo / cover thumbnail upload
  const handleAfterPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        showToast('Photo size exceeds 8MB. Please select a smaller photo.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        setNewVideoForm((prev) => ({ ...prev, thumbnail_url: res, after_image: res }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Video reel file upload
  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 30 * 1024 * 1024) {
        showToast('Video size exceeds 30MB. Please use a short 15-40s clip or compress.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVideoForm((prev) => ({ ...prev, video_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Save Makeover Video Reel
  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVideoForm.title.trim() || !newVideoForm.thumbnail_url.trim()) {
      showToast('Video title and cover thumbnail image are required.', 'error');
      return;
    }

    setIsSavingVideo(true);
    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newVideoForm)
      });

      if (res.ok) {
        showToast('Makeover video reel published successfully!', 'success');
        setIsAddVideoOpen(false);
        setNewVideoForm({
          title: '',
          category: 'bridal',
          video_url: '',
          thumbnail_url: '',
          duration: '0:30',
          before_image: '',
          after_image: '',
          service_name: '',
          description: ''
        });

        // Refresh videos & logs
        const [vidRes, logRes] = await Promise.all([
          fetch('/api/videos'),
          fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (vidRes.ok) setMakeoverVideos(await vidRes.json());
        if (logRes.ok) setAdminLogs(await logRes.json());
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to publish video reel.', 'error');
      }
    } catch {
      showToast('Network error publishing makeover video.', 'error');
    } finally {
      setIsSavingVideo(false);
    }
  };

  // Handle Delete Makeover Video Reel
  const handleDeleteVideo = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this makeover video reel?')) return;
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showToast('Makeover video reel deleted.', 'success');
        setMakeoverVideos((prev) => prev.filter((v) => v.id !== id));
        const logsRes = await fetch('/api/admin/logs', { headers: { Authorization: `Bearer ${token}` } });
        if (logsRes.ok) setAdminLogs(await logsRes.json());
      } else {
        showToast('Failed to delete video reel.', 'error');
      }
    } catch {
      showToast('Network error deleting makeover video.', 'error');
    }
  };

  // Dates helpers
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split('T')[0];

  // Filtered Appointments
  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchesSearch =
      a.customer_name.toLowerCase().includes(searchAppointment.toLowerCase()) ||
      a.customer_phone.includes(searchAppointment) ||
      a.booking_ref.toLowerCase().includes(searchAppointment.toLowerCase()) ||
      a.service_name.toLowerCase().includes(searchAppointment.toLowerCase());

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = a.appointment_date === todayStr;
    } else if (dateFilter === 'tomorrow') {
      matchesDate = a.appointment_date === tomorrowStr;
    } else if (dateFilter === 'custom' && customDate) {
      matchesDate = a.appointment_date === customDate;
    }

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Group appointments by date
  const appointmentsByDate = filteredAppointments.reduce((acc, appt) => {
    const d = appt.appointment_date;
    if (!acc[d]) {
      acc[d] = [];
    }
    acc[d].push(appt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Sorted date keys: newest/upcoming dates first
  const sortedDates = Object.keys(appointmentsByDate).sort((a, b) => b.localeCompare(a));

  // Filtered Admin Logs
  const filteredLogs = adminLogs.filter((log) => {
    const matchesAction = logActionFilter === 'all' || log.action.includes(logActionFilter);
    const matchesSearch =
      log.admin_name.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.target_type.toLowerCase().includes(logSearch.toLowerCase()) ||
      (log.target_id && log.target_id.includes(logSearch));
    return matchesAction && matchesSearch;
  });

  const getLogBadgeStyle = (action: string) => {
    if (action.includes('ADD') || action.includes('COMPLETE') || action.includes('LOGIN')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (action.includes('CANCEL') || action.includes('DELETE')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    return 'bg-sky-100 text-sky-800 border-sky-200';
  };

  const formatDateHeader = (d: string) => {
    if (d === todayStr) return 'Today • ' + d;
    if (d === tomorrowStr) return 'Tomorrow • ' + d;
    try {
      const dateObj = new Date(d + 'T00:00:00');
      return dateObj.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return d;
    }
  };

  // ---------------------------------------------------------------------------
  // AUTHENTICATION GATEWAY: If not logged in as Admin or Staff, require login!
  // ---------------------------------------------------------------------------
  if (!token || !user || (!isAdmin && !isStaff)) {
    const canRegister = publicAdminStatus?.canRegisterAdmin ?? true;
    const occupiedSlots = publicAdminStatus?.count ?? 1;

    return (
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FDFBF7]">
        <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#D4A5AC]/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-[#541224] via-[#B76E79] to-[#541224]" />

          {/* Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex p-3 rounded-2xl bg-[#FCE7EC] text-[#541224] shadow-xs">
              <ShieldCheck className="w-8 h-8 text-[#B76E79]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B76E79] block">
                Durga Beauty Parlour • Staff & Security
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#541224]">
                Administrator Gateway
              </h2>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                Log in with your own administrator ID and password, or register your credentials if an admin slot is vacant.
              </p>
            </div>

            {/* 2-Admin Allocation Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {occupiedSlots} of 2 Admin Slots Assigned
              </span>
              <span className="text-gray-400">|</span>
              <span className={canRegister ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                {canRegister ? '1 Slot Open' : 'Limit Reached (2/2)'}
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-full">
            <button
              type="button"
              onClick={() => {
                setAdminAuthMode('signin');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                adminAuthMode === 'signin'
                  ? 'bg-white text-[#541224] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Sign In with My ID
            </button>
            <button
              type="button"
              onClick={() => {
                setAdminAuthMode('register');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                adminAuthMode === 'register'
                  ? 'bg-white text-[#541224] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {!canRegister && <Lock className="w-3 h-3 text-gray-400" />}
              <span>Register My Admin ID</span>
            </button>
          </div>

          {/* Customer Warning if logged in as customer */}
          {user && user.role === 'customer' && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Customer Account Active</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                You are currently signed in as <strong>{user.name}</strong> (Customer). Administrator authorization is required to access the salon management console.
              </p>
              <button
                type="button"
                onClick={logout}
                className="text-[11px] font-bold text-[#541224] underline cursor-pointer"
              >
                Sign out of customer account & proceed to admin login
              </button>
            </div>
          )}

          {/* Error Alert */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* TAB 1: SIGN IN WITH MY ID */}
          {adminAuthMode === 'signin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  My Administrator ID (Email or Mobile) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your email ID or registered mobile"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white font-mono"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700">
                    My Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#B76E79] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none bg-white font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4 text-[#F4B8C5]" />
                <span>{isLoggingIn ? 'Authenticating...' : 'Sign In with My ID'}</span>
              </button>

              {canRegister && (
                <div className="pt-2 text-center">
                  <p className="text-xs text-gray-500">
                    Need to set up your own Administrator ID?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAdminAuthMode('register');
                        setLoginError('');
                      }}
                      className="text-[#541224] font-bold underline cursor-pointer hover:text-[#B76E79]"
                    >
                      Register My ID as Admin →
                    </button>
                  </p>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: REGISTER MY OWN ADMIN ID (Max 2 Admins Policy) */}
          {adminAuthMode === 'register' && (
            <div>
              {!canRegister ? (
                <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-amber-100 text-amber-800">
                    <Lock className="w-6 h-6 text-amber-700" />
                  </div>
                  <h4 className="font-serif font-bold text-base text-amber-900">
                    Administrator Registration Closed
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    The maximum capacity of <strong>2 Administrator accounts</strong> has been reached. Only existing registered administrators are permitted to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={() => setAdminAuthMode('signin')}
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-white border border-amber-300 text-[#541224] hover:bg-amber-50 cursor-pointer shadow-xs transition-all"
                  >
                    Return to Sign In with My ID
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterAdminGateway} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-[#FDF2F4] border border-[#D4A5AC]/40 text-xs text-[#541224] space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#B76E79]" />
                      <span>Admin Slot Available ({occupiedSlots}/2 used)</span>
                    </div>
                    <p className="text-[11px] text-gray-600">
                      Create your own personal administrator account. Maximum 2 administrators permitted.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Your Name"
                      value={regAdminForm.name}
                      onChange={(e) => setRegAdminForm({ ...regAdminForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      My Email ID *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter your personal email address"
                      value={regAdminForm.email}
                      onChange={(e) => setRegAdminForm({ ...regAdminForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={regAdminForm.phone}
                      onChange={(e) => setRegAdminForm({ ...regAdminForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Min 6 characters"
                        value={regAdminForm.password}
                        onChange={(e) => setRegAdminForm({ ...regAdminForm, password: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        required
                        placeholder="Confirm password"
                        value={regAdminForm.confirmPassword}
                        onChange={(e) => setRegAdminForm({ ...regAdminForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRegisteringAdmin}
                    className="w-full py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    <UserPlus className="w-4 h-4 text-[#F4B8C5]" />
                    <span>{isRegisteringAdmin ? 'Registering...' : 'Create & Register My Admin ID'}</span>
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-gray-500">
                      Already registered?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAdminAuthMode('signin');
                          setLoginError('');
                        }}
                        className="text-[#541224] font-bold underline cursor-pointer hover:text-[#B76E79]"
                      >
                        Sign in with your ID →
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // AUTHENTICATED ADMINISTRATOR CONSOLE
  // ---------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#541224] text-white">
              Salon Management Console
            </span>
            <span className="text-xs text-gray-500 font-medium">
              • Authenticated as <strong className="text-gray-900">{user.name}</strong> ({user.role})
            </span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#541224] mt-1">
            Durga Beauty Parlour Owner Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="px-4 py-2 rounded-full border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2 rounded-full border border-rose-200 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2 sm:gap-6 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'appointments'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointments ({appointments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'services'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Services ({services.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'gallery'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Gallery & Photos ({galleryPhotos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'videos'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Makeover Reels ({makeoverVideos.length})</span>
        </button>

        {/* TAB FOR 2-ADMIN MAXIMUM ALLOCATION RULE */}
        <button
          onClick={() => setActiveTab('admins')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'admins'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Admins ({adminCount}/2)</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'logs'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Activity Logs ({adminLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'promotions'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Offers ({promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'settings'
              ? 'border-[#541224] text-[#541224]'
              : 'border-transparent text-gray-400 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Today's Bookings
              </span>
              <span className="font-serif text-3xl font-bold text-[#541224] mt-1 block">
                {stats.today_appointments}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Total Bookings
              </span>
              <span className="font-serif text-3xl font-bold text-gray-900 mt-1 block">
                {stats.total_bookings}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Upcoming
              </span>
              <span className="font-serif text-3xl font-bold text-blue-700 mt-1 block">
                {stats.upcoming_appointments}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Completed
              </span>
              <span className="font-serif text-3xl font-bold text-emerald-700 mt-1 block">
                {stats.completed_appointments}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#D4A5AC]/40 shadow-xs">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-bold">
                Cancelled
              </span>
              <span className="font-serif text-3xl font-bold text-red-600 mt-1 block">
                {stats.cancelled_appointments}
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-[#541224] text-white shadow-xs">
              <span className="text-[10px] text-[#F8CAD5] uppercase tracking-wider block font-bold">
                Earned Revenue
              </span>
              <span className="font-serif text-2xl font-bold mt-1 block">
                ₹{stats.earned_revenue.toLocaleString('en-IN')}
              </span>
              <span className="text-[9px] text-[#FCE7EC]/70 mt-1 block">
                *Only completed bookings
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#541224]">
                Top 5 Services by Completed Revenue
              </h3>
              <div className="space-y-3">
                {stats.popular_services.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-semibold text-gray-900 block">{item.service_name}</span>
                      <span className="text-gray-400 text-[11px]">{item.bookings} appointments booked</span>
                    </div>
                    <span className="font-serif font-bold text-emerald-700 text-sm">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#541224]">
                Recent Salon Activity & Inquiries
              </h3>
              <div className="space-y-2">
                {stats.recent_appointments.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl border border-gray-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{a.customer_name}</span>
                      <span className="text-gray-500 block text-[11px]">{a.service_name} • {a.appointment_date}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPOINTMENT MANAGEMENT WITH DATE GROUPING & FILTERING */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                <span className="text-xs font-semibold text-gray-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Status:
                </span>
                {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`py-1.5 px-3.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#541224] text-white shadow-xs'
                        : 'bg-white text-gray-700 border border-gray-200 hover:border-[#B76E79]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <div className="flex items-center p-1 rounded-full bg-gray-100 border border-gray-200 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setViewMode('grouped')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      viewMode === 'grouped'
                        ? 'bg-white text-[#541224] shadow-xs font-bold'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Group by Date
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-[#541224] shadow-xs font-bold'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Flat Table
                  </button>
                </div>

                <div className="relative flex-1 lg:w-72">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search name, phone, ref..."
                    value={searchAppointment}
                    onChange={(e) => setSearchAppointment(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-full border border-gray-200 text-xs bg-white focus:border-[#B76E79] outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-500 flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-[#B76E79]" /> Filter by Date:
                </span>

                <button
                  onClick={() => { setDateFilter('all'); setCustomDate(''); }}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    dateFilter === 'all'
                      ? 'bg-[#541224] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Dates ({appointments.length})
                </button>

                <button
                  onClick={() => { setDateFilter('today'); setCustomDate(todayStr); }}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    dateFilter === 'today'
                      ? 'bg-[#541224] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Today ({appointments.filter(a => a.appointment_date === todayStr).length})
                </button>

                <button
                  onClick={() => { setDateFilter('tomorrow'); setCustomDate(tomorrowStr); }}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    dateFilter === 'tomorrow'
                      ? 'bg-[#541224] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Tomorrow ({appointments.filter(a => a.appointment_date === tomorrowStr).length})
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Pick Date:</span>
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => {
                    setCustomDate(e.target.value);
                    setDateFilter(e.target.value ? 'custom' : 'all');
                  }}
                  className="px-3 py-1 rounded-lg border border-gray-200 text-xs bg-white text-gray-800 outline-none focus:border-[#B76E79] cursor-pointer"
                />
                {customDate && (
                  <button
                    onClick={() => { setCustomDate(''); setDateFilter('all'); }}
                    className="text-[11px] text-gray-400 hover:text-gray-700 underline cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {viewMode === 'grouped' ? (
            <div className="space-y-6">
              {sortedDates.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400 text-xs">
                  No appointments match your date or search criteria.
                </div>
              ) : (
                sortedDates.map((dateKey) => {
                  const dayAppts = appointmentsByDate[dateKey] || [];
                  const dayTotalRevenue = dayAppts.reduce((sum, a) => sum + (a.status !== 'cancelled' ? a.price : 0), 0);
                  const isToday = dateKey === todayStr;

                  return (
                    <div
                      key={dateKey}
                      className={`rounded-3xl border overflow-hidden shadow-xs bg-white transition-all ${
                        isToday ? 'border-[#B76E79] ring-2 ring-[#B76E79]/20' : 'border-gray-200'
                      }`}
                    >
                      <div className={`p-4 sm:px-6 flex flex-wrap items-center justify-between gap-3 border-b ${
                        isToday ? 'bg-[#FDF2F4] border-[#D4A5AC]/40' : 'bg-[#F8F4EE] border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl text-white font-bold text-xs ${
                            isToday ? 'bg-[#541224]' : 'bg-[#B76E79]'
                          }`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-serif text-base font-bold text-[#541224]">
                              {formatDateHeader(dateKey)}
                            </span>
                            <span className="text-[11px] text-gray-500 block">
                              {dayAppts.length} {dayAppts.length === 1 ? 'Booking' : 'Bookings'} scheduled
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            Day Value: <strong className="text-[#541224] font-serif font-bold text-sm">₹{dayTotalRevenue.toLocaleString('en-IN')}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {dayAppts.map((appt) => (
                          <div
                            key={appt.id}
                            className="p-4 sm:px-6 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                          >
                            <div className="flex items-start gap-4">
                              <div className="shrink-0 w-24 px-2.5 py-1.5 rounded-lg bg-gray-100 text-center font-bold text-gray-800 border border-gray-200">
                                <span className="block text-[11px] font-mono text-[#541224]">{appt.time_slot}</span>
                                <span className="block text-[9px] text-gray-400 font-mono mt-0.5">{appt.booking_ref}</span>
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-gray-900">{appt.customer_name}</span>
                                  <span className="text-gray-400 text-xs font-mono">• {appt.customer_phone}</span>
                                </div>
                                <div className="text-gray-600 mt-1 flex items-center gap-2 flex-wrap">
                                  <span className="font-medium text-[#541224]">{appt.service_name}</span>
                                  {appt.hair_length && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-100 text-gray-600 uppercase">
                                      Length: {appt.hair_length}
                                    </span>
                                  )}
                                  {appt.notes && (
                                    <span className="text-[11px] text-gray-400 italic">
                                      "{appt.notes}"
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                              <div className="text-right">
                                <span className="font-serif font-bold text-sm text-[#541224] block">
                                  ₹{appt.price.toLocaleString('en-IN')}
                                </span>
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                                    appt.status === 'confirmed'
                                      ? 'bg-amber-100 text-amber-800'
                                      : appt.status === 'completed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {appt.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {appt.status !== 'completed' && (
                                  <button
                                    onClick={() => handleUpdateAppointmentStatus(appt.id, 'completed')}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold cursor-pointer transition-colors"
                                    title="Mark Completed"
                                  >
                                    Complete
                                  </button>
                                )}

                                {appt.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handleUpdateAppointmentStatus(appt.id, 'cancelled')}
                                    className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-semibold cursor-pointer transition-colors"
                                    title="Cancel"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8F4EE] text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Ref Code</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Price (₹)</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-400">
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#541224]">
                            {appt.booking_ref}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900 block">{appt.customer_name}</span>
                            <span className="text-gray-500 text-[11px]">{appt.customer_phone}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-gray-900 block">{appt.service_name}</span>
                            {appt.hair_length && (
                              <span className="text-gray-400 text-[10px] capitalize">Length: {appt.hair_length}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            <span className="block font-medium">{appt.appointment_date}</span>
                            <span className="text-gray-400 text-[11px]">{appt.time_slot}</span>
                          </td>
                          <td className="py-3 px-4 font-serif font-bold text-gray-900">
                            ₹{appt.price}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                appt.status === 'confirmed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : appt.status === 'completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {appt.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {appt.status !== 'completed' && (
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(appt.id, 'completed')}
                                  className="px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold cursor-pointer"
                                  title="Mark Completed"
                                >
                                  Complete
                                </button>
                              )}

                              {appt.status !== 'cancelled' && (
                                <button
                                  onClick={() => handleUpdateAppointmentStatus(appt.id, 'cancelled')}
                                  className="px-2 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-semibold cursor-pointer"
                                  title="Cancel"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SERVICES & PRICING MANAGEMENT (CRUD) */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#541224]">
              Manage Hair & Facial Services
            </h3>
            <button
              onClick={() => {
                setIsNewService(true);
                setEditingService({
                  category: 'haircoloring',
                  name: '',
                  description: '',
                  duration_mins: 60,
                  price: 700,
                  price_short: 700,
                  price_medium: 1000,
                  price_long: 1400,
                  suitable_skin: '',
                  image_url: '/images/hair-coloring.jpg',
                  is_popular: 0,
                  is_active: 1
                });
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((s) => (
              <div key={s.id} className="p-4 bg-white rounded-2xl border border-gray-200 flex flex-col justify-between space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FCE7EC] text-[#541224]">
                      {s.category}
                    </span>
                    <span className="font-serif font-bold text-[#541224] text-sm">₹{s.price}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-gray-900 mt-2">{s.name}</h4>
                  <p className="text-gray-500 text-[11px] line-clamp-2 mt-1">{s.description}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-400">
                  <span>{s.duration_mins} mins</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsNewService(false);
                        setEditingService(s);
                      }}
                      className="p-1 hover:text-[#541224] cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(s.id)}
                      className="p-1 hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingService && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#541224]">
                    {isNewService ? 'Add Service' : 'Edit Service'}
                  </h3>
                  <button onClick={() => setEditingService(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveService} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Service Name *</label>
                    <input
                      type="text"
                      required
                      value={editingService.name || ''}
                      onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <select
                        value={editingService.category || 'haircoloring'}
                        onChange={(e) => setEditingService({ ...editingService, category: e.target.value as any })}
                        className="w-full px-3 py-2 border rounded-xl cursor-pointer"
                      >
                        <option value="haircut">Haircut</option>
                        <option value="hairstyling">Hair Styling</option>
                        <option value="hairspa">Hair Spa</option>
                        <option value="haircoloring">Hair Coloring</option>
                        <option value="facial">Facial & Skincare</option>
                        <option value="bridal">Bridal & Wedding</option>
                        <option value="festive">Festive Glam</option>
                        <option value="makeup">Party Makeup</option>
                        <option value="waxing">Waxing</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        value={editingService.duration_mins || 45}
                        onChange={(e) => setEditingService({ ...editingService, duration_mins: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="block font-semibold mb-1">Base (₹) *</label>
                      <input
                        type="number"
                        required
                        value={editingService.price || 0}
                        onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                        className="w-full px-2 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Short (₹)</label>
                      <input
                        type="number"
                        value={editingService.price_short || 0}
                        onChange={(e) => setEditingService({ ...editingService, price_short: Number(e.target.value) })}
                        className="w-full px-2 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Med (₹)</label>
                      <input
                        type="number"
                        value={editingService.price_medium || 0}
                        onChange={(e) => setEditingService({ ...editingService, price_medium: Number(e.target.value) })}
                        className="w-full px-2 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Long (₹)</label>
                      <input
                        type="number"
                        value={editingService.price_long || 0}
                        onChange={(e) => setEditingService({ ...editingService, price_long: Number(e.target.value) })}
                        className="w-full px-2 py-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editingService.description || ''}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Image URL</label>
                    <input
                      type="text"
                      value={editingService.image_url || ''}
                      onChange={(e) => setEditingService({ ...editingService, image_url: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="px-4 py-2 border rounded-full text-gray-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full text-white maroon-gradient cursor-pointer"
                    >
                      Save Service
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#541224]">
              Manage Botanical Beauty Products
            </h3>
            <button
              onClick={() => {
                setIsNewProduct(true);
                setEditingProduct({
                  name: '',
                  brand: 'Durga Botanica',
                  category: 'facial_kits',
                  size: '100 ml',
                  price: 499,
                  description: '',
                  suitability: 'All Skin Types',
                  in_stock: 1,
                  is_used_in_salon: 1,
                  image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
                });
              }}
              className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 bg-white rounded-2xl border border-gray-200 flex flex-col justify-between space-y-3 text-xs">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-400 font-semibold">{p.brand}</span>
                    <span className="font-serif font-bold text-[#541224] text-sm">₹{p.price}</span>
                  </div>
                  <h4 className="font-serif font-bold text-sm text-gray-900 mt-1">{p.name}</h4>
                  <p className="text-gray-500 text-[11px] line-clamp-2 mt-1">{p.description}</p>
                </div>

                <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">{p.size}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsNewProduct(false);
                        setEditingProduct(p);
                      }}
                      className="p-1 hover:text-[#541224] cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1 hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingProduct && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#541224]">
                    {isNewProduct ? 'Add Product' : 'Edit Product'}
                  </h3>
                  <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={editingProduct.name || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Brand</label>
                      <input
                        type="text"
                        value={editingProduct.brand || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <input
                        type="text"
                        value={editingProduct.category || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={editingProduct.price || 0}
                        onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-1">Size / Volume</label>
                      <input
                        type="text"
                        value={editingProduct.size || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, size: e.target.value })}
                        className="w-full px-3 py-2 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={editingProduct.description || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Image URL</label>
                    <input
                      type="text"
                      value={editingProduct.image_url || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2 border rounded-full text-gray-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-full text-white maroon-gradient cursor-pointer"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: GALLERY & PHOTOS (OPTION TO ADD PHOTO FROM ADMIN) */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#541224]">
                Salon Portfolio & Gallery Photos
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload new client transformations, hair coloring finishes, and bridal showcases to the live website gallery.
              </p>
            </div>

            <button
              onClick={() => {
                setNewPhoto({ title: '', category: 'hair', url: '', description: '' });
                setPhotoPreview('');
                setIsAddPhotoOpen(true);
              }}
              className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Photo</span>
            </button>
          </div>

          {galleryPhotos.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-200 text-gray-400 text-xs">
              No photos currently in the salon gallery.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="relative h-52 bg-gray-100 overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#541224] text-white">
                        {photo.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2 text-xs flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif font-bold text-gray-900 text-sm">{photo.title}</h4>
                      {photo.description && (
                        <p className="text-gray-500 text-[11px] mt-1 line-clamp-2">{photo.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-gray-400 text-[11px]">
                      <span>{photo.created_at ? photo.created_at.split(' ')[0] : 'Gallery'}</span>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="text-red-500 hover:text-red-700 flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAddPhotoOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#B76E79]" />
                    <h3 className="font-serif text-lg font-bold text-[#541224]">
                      Add Photo to Gallery
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddPhotoOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePhoto} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Photo Title / Client Look *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Honey Caramel Balayage & Blowout"
                      value={newPhoto.title}
                      onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Showcase Category *
                    </label>
                    <select
                      value={newPhoto.category}
                      onChange={(e) => setNewPhoto({ ...newPhoto, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none cursor-pointer"
                    >
                      <option value="hair">Haircuts & Hair Coloring</option>
                      <option value="facial">Facial & Skincare Treatments</option>
                      <option value="bridal">Bridal & Wedding Makeovers</option>
                      <option value="festive">Festive Celebrations (Karwa Chauth/Diwali)</option>
                      <option value="makeup">Party & Reception Makeup</option>
                      <option value="interiors">Salon Luxury Interiors & Suites</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold text-gray-700">
                      Image Source (URL or Upload File) *
                    </label>

                    <div className="p-3 border-2 border-dashed border-gray-200 rounded-2xl text-center hover:border-[#B76E79] transition-colors bg-gray-50/50">
                      <input
                        type="file"
                        id="photo-file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="photo-file" className="cursor-pointer flex flex-col items-center gap-1.5">
                        <Upload className="w-5 h-5 text-[#B76E79]" />
                        <span className="font-semibold text-gray-700">Click to upload image file</span>
                        <span className="text-[10px] text-gray-400">JPG, PNG, WebP up to 5MB</span>
                      </label>
                    </div>

                    <div className="text-center text-[10px] uppercase font-bold text-gray-400">
                      — OR ENTER IMAGE URL —
                    </div>

                    <input
                      type="text"
                      placeholder="https://... or /images/hair-coloring.jpg"
                      value={newPhoto.url}
                      onChange={(e) => {
                        setNewPhoto({ ...newPhoto, url: e.target.value });
                        setPhotoPreview(e.target.value);
                      }}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px]"
                    />
                  </div>

                  {(photoPreview || newPhoto.url) && (
                    <div>
                      <span className="block text-[11px] font-semibold text-gray-500 mb-1">
                        Live Preview:
                      </span>
                      <div className="h-40 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                        <img
                          src={photoPreview || newPhoto.url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as any).src = '/images/hair-coloring.jpg';
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Short Description / Styling Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Freehand French balayage with honey gloss and dimensional highlights..."
                      value={newPhoto.description}
                      onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddPhotoOpen(false)}
                      className="px-4 py-2 border rounded-full text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingPhoto}
                      className="px-6 py-2.5 rounded-full text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingPhoto ? 'Saving...' : 'Add Photo to Gallery'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5B: MAKEOVER SHORT VIDEOS & REELS (BEFORE & AFTER TRANSFORMATION SHOWCASE) */}
      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#541224] flex items-center gap-2">
                <Film className="w-5 h-5 text-[#B76E79]" />
                <span>Makeover Video Reels & Transformation Showcase</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage vertical short video reels and before & after makeover transformations displayed on the client website.
              </p>
            </div>

            <button
              onClick={() => {
                setNewVideoForm({
                  title: '',
                  category: 'bridal',
                  video_url: '',
                  thumbnail_url: '',
                  duration: '0:30',
                  before_image: '',
                  after_image: '',
                  service_name: '',
                  description: ''
                });
                setIsAddVideoOpen(true);
              }}
              className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-all self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Makeover Reel</span>
            </button>
          </div>

          {/* Video Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {makeoverVideos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className="relative aspect-[9/14] bg-black overflow-hidden">
                  <img
                    src={video.after_image || video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/20">
                      {video.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-mono">
                      {video.duration || '0:30'}
                    </span>
                  </div>

                  {/* Views & Likes */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 font-semibold text-[11px]">
                      <Eye className="w-3.5 h-3.5 text-gray-300" />
                      <span>{video.views ? `${(video.views / 1000).toFixed(1)}k` : '1.2k'}</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-[11px] text-rose-300">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>{video.likes || 42}</span>
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-sm text-gray-900 line-clamp-1">
                      {video.title}
                    </h4>
                    {video.service_name && (
                      <p className="text-[11px] text-[#B76E79] font-medium line-clamp-1">
                        {video.service_name}
                      </p>
                    )}
                    {video.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {video.before_image ? '✓ Before/After Active' : 'Single Reel'}
                    </span>

                    <button
                      onClick={() => handleDeleteVideo(video.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Delete Video Reel"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Makeover Reel Modal */}
          {isAddVideoOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-[#B76E79]" />
                    <h3 className="font-serif text-lg font-bold text-[#541224]">
                      Publish New Makeover Short Video Reel
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddVideoOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Reel Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Royal HD Bridal Makeover"
                      value={newVideoForm.title}
                      onChange={(e) => setNewVideoForm({ ...newVideoForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Makeover Category *
                      </label>
                      <select
                        value={newVideoForm.category}
                        onChange={(e) => setNewVideoForm({ ...newVideoForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none cursor-pointer"
                      >
                        <option value="bridal">👑 Bridal Makeover</option>
                        <option value="hair">💇 Hair Transformation</option>
                        <option value="festive">✨ Festive & Sagan Glam</option>
                        <option value="facial">🌸 Facial Glow Reveal</option>
                        <option value="makeover">💄 General Makeover</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Reel Duration
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 0:35"
                        value={newVideoForm.duration}
                        onChange={(e) => setNewVideoForm({ ...newVideoForm, duration: e.target.value })}
                        className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Associated Salon Service (Direct Booking CTA)
                    </label>
                    <select
                      value={newVideoForm.service_name}
                      onChange={(e) => setNewVideoForm({ ...newVideoForm, service_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none cursor-pointer bg-white"
                    >
                      <option value="">-- Select Salon Service (Clients can book directly) --</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} (₹{s.price}) • [{s.category}]
                        </option>
                      ))}
                      <option value="Custom VIP Makeover">✨ Custom VIP Makeover Package</option>
                    </select>
                    <p className="text-[10px] text-gray-500 mt-1">
                      When customers click "Book This Makeover Look", this service is automatically pre-selected in their booking form.
                    </p>
                  </div>

                  {/* Video File / URL Upload */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-[#FDFBF7] border border-[#D4A5AC]/40">
                    <label className="block font-semibold text-[#541224]">
                      1. Short Video Reel (Upload File or Paste Link)
                    </label>

                    <div className="p-3 border-2 border-dashed border-[#D4A5AC]/50 rounded-xl text-center hover:border-[#B76E79] transition-colors bg-white">
                      <input
                        type="file"
                        id="reel-video-file"
                        accept="video/mp4,video/webm,video/quicktime"
                        onChange={handleVideoFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="reel-video-file" className="cursor-pointer flex flex-col items-center gap-1">
                        <Upload className="w-4 h-4 text-[#B76E79]" />
                        <span className="font-semibold text-gray-800">Upload 15–45s Video File from Phone / PC</span>
                        <span className="text-[10px] text-gray-400">MP4, WebM, MOV (Vertical 9:16 recommended)</span>
                      </label>
                    </div>

                    <div className="text-center text-[9px] uppercase font-bold text-gray-400">
                      — OR ENTER VIDEO URL —
                    </div>

                    <input
                      type="text"
                      placeholder="https://... or /videos/bridal-makeover.mp4"
                      value={newVideoForm.video_url}
                      onChange={(e) => setNewVideoForm({ ...newVideoForm, video_url: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px] bg-white"
                    />

                    {newVideoForm.video_url && (
                      <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Video Reel attached and ready to stream</span>
                      </div>
                    )}
                  </div>

                  {/* Before & After Transformation Photos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Before Photo */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-200">
                      <label className="block font-semibold text-gray-700">
                        2. Before Makeover Photo
                      </label>

                      <div className="p-2.5 border-2 border-dashed border-gray-300 rounded-xl text-center hover:border-[#B76E79] bg-white">
                        <input
                          type="file"
                          id="reel-before-file"
                          accept="image/*"
                          onChange={handleBeforePhotoUpload}
                          className="hidden"
                        />
                        <label htmlFor="reel-before-file" className="cursor-pointer flex flex-col items-center gap-1">
                          <Upload className="w-3.5 h-3.5 text-[#B76E79]" />
                          <span className="font-semibold text-gray-700 text-[11px]">Upload Before Photo</span>
                        </label>
                      </div>

                      <input
                        type="text"
                        placeholder="Or paste photo URL..."
                        value={newVideoForm.before_image}
                        onChange={(e) => setNewVideoForm({ ...newVideoForm, before_image: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg focus:border-[#B76E79] outline-none font-mono text-[10px] bg-white"
                      />

                      {newVideoForm.before_image && (
                        <div className="h-28 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                          <img
                            src={newVideoForm.before_image}
                            alt="Before Makeover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* After Photo / Cover Thumbnail */}
                    <div className="space-y-1.5 p-3 rounded-2xl bg-[#FCE7EC]/30 border border-[#D4A5AC]/40">
                      <label className="block font-semibold text-[#541224]">
                        3. After Glam / Cover Photo *
                      </label>

                      <div className="p-2.5 border-2 border-dashed border-[#D4A5AC]/60 rounded-xl text-center hover:border-[#B76E79] bg-white">
                        <input
                          type="file"
                          id="reel-after-file"
                          accept="image/*"
                          onChange={handleAfterPhotoUpload}
                          className="hidden"
                        />
                        <label htmlFor="reel-after-file" className="cursor-pointer flex flex-col items-center gap-1">
                          <Upload className="w-3.5 h-3.5 text-[#B76E79]" />
                          <span className="font-semibold text-[#541224] text-[11px]">Upload After Glam Photo</span>
                        </label>
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Or paste photo URL..."
                        value={newVideoForm.thumbnail_url}
                        onChange={(e) => setNewVideoForm({ ...newVideoForm, thumbnail_url: e.target.value, after_image: e.target.value })}
                        className="w-full px-2.5 py-1.5 border rounded-lg focus:border-[#B76E79] outline-none font-mono text-[10px] bg-white"
                      />

                      {newVideoForm.thumbnail_url && (
                        <div className="h-28 rounded-xl overflow-hidden border border-[#D4A5AC]/40 bg-gray-100">
                          <img
                            src={newVideoForm.thumbnail_url}
                            alt="After Makeover Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pro Tips Box */}
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-950">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      Pro Tip to Attract Customers Like Real Viral Reels:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-800 text-[10.5px]">
                      <li><strong>Before Photo:</strong> Natural face before makeup or hair coloring.</li>
                      <li><strong>After Photo:</strong> Finished glam look in bright, warm salon lighting.</li>
                      <li><strong>Link Service:</strong> Selecting the exact service allows visitors to click <em>"Book This Look"</em> directly!</li>
                    </ul>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Transformation Description & Artist Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the techniques, products, and makeover details..."
                      value={newVideoForm.description}
                      onChange={(e) => setNewVideoForm({ ...newVideoForm, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddVideoOpen(false)}
                      className="px-4 py-2 border rounded-full text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingVideo}
                      className="px-6 py-2.5 rounded-full text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingVideo ? 'Publishing...' : 'Publish Makeover Reel'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: ADMIN ACCOUNTS & 2-ADMIN MAXIMUM ALLOCATION RULE */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#541224]">
                Administrator Accounts & Security Controls
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Salon policy strictly enforces a maximum of 2 Administrators. Once 2 administrators are added, the option to add another administrator is automatically closed.
              </p>
            </div>

            {/* Strict Add Admin Option: Only active if < 2 admins */}
            {canAddAdmin ? (
              <button
                onClick={() => {
                  setNewAdminForm({ name: '', email: '', phone: '', password: '' });
                  setIsAddAdminOpen(true);
                }}
                className="px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-center hover:scale-105 active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4 text-[#F8CAD5]" />
                <span>Add Second Administrator (Slot 2/2)</span>
              </button>
            ) : (
              <div className="px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-400 border border-gray-200 flex items-center gap-2 select-none self-start sm:self-center cursor-not-allowed">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>Add Admin Closed (Max 2 Reached)</span>
              </div>
            )}
          </div>

          {/* Allocation Status Indicator Banner */}
          <div className={`p-6 rounded-3xl border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            canAddAdmin
              ? 'bg-[#FDF2F4] border-[#D4A5AC]/50'
              : 'bg-amber-50/70 border-amber-200'
          }`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  canAddAdmin ? 'bg-[#541224] text-white' : 'bg-amber-800 text-amber-100'
                }`}>
                  {adminCount} of 2 Slots Allocated
                </span>
                <span className="text-xs font-bold text-gray-700">
                  {canAddAdmin ? '✓ 1 Administrator Slot Available' : '🔒 Maximum Allocation Reached'}
                </span>
              </div>
              <h4 className="font-serif text-lg font-bold text-[#541224]">
                {canAddAdmin
                  ? 'One Admin Account Slot is Currently Open'
                  : 'Two Administrators are Active — Option to Add Admins is Now Closed'}
              </h4>
              <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                {canAddAdmin
                  ? 'You have 1 administrator registered. You can add 1 additional administrator. Once the second administrator is registered, the add admin option will close automatically.'
                  : 'Salon security limits administrator access to precisely 2 trusted accounts. To register a new administrator in the future, you must first remove one of the existing accounts.'}
              </p>
            </div>

            {/* Visual 2-Slot Indicators */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white border border-[#D4A5AC]/40 text-center w-36 shadow-xs">
                <span className="block text-[10px] font-bold uppercase text-[#541224] tracking-wider">Slot 1</span>
                <span className="font-serif font-bold text-sm text-gray-900 block mt-0.5">Primary Admin</span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-center w-36 shadow-xs ${
                adminCount >= 2
                  ? 'bg-white border-[#D4A5AC]/40'
                  : 'bg-dashed border-2 border-gray-300 bg-gray-50/50'
              }`}>
                <span className="block text-[10px] font-bold uppercase text-[#B76E79] tracking-wider">Slot 2</span>
                <span className="font-serif font-bold text-sm text-gray-900 block mt-0.5">
                  {adminCount >= 2 ? 'Second Admin' : 'Vacant Slot'}
                </span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  adminCount >= 2
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {adminCount >= 2 ? 'ACTIVE' : 'AVAILABLE'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Administrators Cards List */}
          <div className="space-y-4">
            <h4 className="font-serif text-base font-bold text-[#541224] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#B76E79]" />
              <span>Registered Administrators ({adminsList.length})</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adminsList.map((admin, idx) => {
                const isCurrentUser = admin.id === user?.id;
                const isPrimary = idx === 0;

                return (
                  <div
                    key={admin.id}
                    className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#541224] text-white font-serif font-bold text-base flex items-center justify-center shrink-0">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="font-serif font-bold text-base text-gray-900">{admin.name}</h5>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-[#FCE7EC] text-[#541224] text-[9px] font-bold uppercase">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-gray-500 font-mono text-xs">{admin.email}</p>
                          {admin.phone && (
                            <p className="text-gray-400 text-[11px]">{admin.phone}</p>
                          )}
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPrimary
                          ? 'bg-[#541224] text-white'
                          : 'bg-[#B76E79] text-white'
                      }`}>
                        {isPrimary ? 'Primary Admin' : 'Second Admin'}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                      <span>Registered: {admin.created_at ? admin.created_at.split(' ')[0] : 'System Root'}</span>

                      <div className="flex items-center gap-2">
                        {isCurrentUser && (
                          <button
                            onClick={() => {
                              setEditProfileForm({
                                name: admin.name,
                                email: admin.email,
                                phone: admin.phone || '',
                                password: '',
                                confirmPassword: ''
                              });
                              setIsEditProfileOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg text-[#541224] bg-[#FCE7EC] hover:bg-[#F8CAD5] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                            title="Edit My Administrator Credentials"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#541224]" />
                            <span>Edit My ID & Password</span>
                          </button>
                        )}

                        {/* Delete action for 2nd admin */}
                        {!isPrimary && (
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                            title="Remove Administrator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove Admin</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Vacant Slot Card if 1 admin */}
              {canAddAdmin && (
                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 rounded-full bg-white text-gray-400 shadow-xs">
                    <UserPlus className="w-6 h-6 text-[#B76E79]" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm text-gray-900">Vacant Administrator Slot</h5>
                    <p className="text-xs text-gray-500 max-w-xs mt-0.5">
                      1 administrator slot is open. You may add a trusted partner or manager.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNewAdminForm({ name: '', email: '', phone: '', password: '' });
                      setIsAddAdminOpen(true);
                    }}
                    className="px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-xs cursor-pointer hover:scale-105 transition-all"
                  >
                    Add Second Admin
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Admin Modal */}
          {isAddAdminOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#B76E79]" />
                    <h3 className="font-serif text-lg font-bold text-[#541224]">
                      Register Second Administrator
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsAddAdminOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FDF2F4] border border-[#D4A5AC]/40 text-xs text-[#541224] space-y-1">
                  <strong>Important Salon Security Policy:</strong>
                  <p className="text-[11px] leading-relaxed text-gray-600">
                    Adding this administrator will consume the 2nd and final available administrator slot (2/2). Once this account is created, the option to add additional administrators will be permanently closed.
                  </p>
                </div>

                <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Meera Singhania"
                      value={newAdminForm.name}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Administrator Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="meera@durgasalon.com"
                      value={newAdminForm.email}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98333 44556"
                      value={newAdminForm.phone}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Initial Master Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Create a strong password..."
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddAdminOpen(false)}
                      className="px-4 py-2 border rounded-full text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingAdmin}
                      className="px-6 py-2.5 rounded-full text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingAdmin ? 'Creating...' : 'Confirm & Create Second Admin'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit My Administrator Credentials Modal */}
          {isEditProfileOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#B76E79]" />
                    <h3 className="font-serif text-lg font-bold text-[#541224]">
                      Edit My Administrator Credentials
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditProfileOpen(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FDF2F4] border border-[#D4A5AC]/40 text-xs text-[#541224] space-y-1">
                  <strong>Personalize Your Administrator Login:</strong>
                  <p className="text-[11px] text-gray-600">
                    You can change your login email ID, contact phone, and master password at any time. Leave the password fields blank if you do not want to change your password.
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Administrator Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Your Full Name"
                      value={editProfileForm.name}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Administrator Email ID (Login ID) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. myname@example.com"
                      value={editProfileForm.email}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Mobile Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={editProfileForm.phone}
                      onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px]"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 space-y-3">
                    <span className="block font-bold text-gray-700 text-[11px]">
                      Change Master Password (Optional)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-gray-600 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Leave blank to keep"
                          value={editProfileForm.password}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, password: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px] bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-gray-600 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          value={editProfileForm.confirmPassword}
                          onChange={(e) => setEditProfileForm({ ...editProfileForm, confirmPassword: e.target.value })}
                          className="w-full px-3 py-2 border rounded-xl focus:border-[#B76E79] outline-none font-mono text-[11px] bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(false)}
                      className="px-4 py-2 border rounded-full text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingProfile}
                      className="px-6 py-2.5 rounded-full text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSavingProfile ? 'Saving...' : 'Save My Credentials'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: ADMIN ACTIVITY & AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-3xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#541224]">
                Administrative Activity Logs & Audit Trail
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Complete tamper-evident record of all appointment updates, catalog changes, photo uploads, and admin authentications.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={logActionFilter}
                onChange={(e) => setLogActionFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 text-xs bg-white text-gray-700 outline-none focus:border-[#B76E79] cursor-pointer"
              >
                <option value="all">All Actions</option>
                <option value="LOGIN">Admin Logins</option>
                <option value="ADMIN">Admin Account Actions</option>
                <option value="APPOINTMENT">Appointments</option>
                <option value="SERVICE">Services</option>
                <option value="PRODUCT">Products</option>
                <option value="PHOTO">Gallery Photos</option>
                <option value="SETTINGS">Settings</option>
              </select>

              <div className="relative w-48 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-full border border-gray-200 text-xs bg-white focus:border-[#B76E79] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F4EE] text-gray-600 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Admin User</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4 text-right">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400 font-sans">
                        No admin activity logs found.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '-'}
                        </td>
                        <td className="py-3 px-4 font-sans font-bold text-gray-900 whitespace-nowrap">
                          {log.admin_name}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getLogBadgeStyle(log.action)}`}
                          >
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap font-sans">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold uppercase">
                            {log.target_type} {log.target_id ? `#${log.target_id}` : ''}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans text-gray-700 max-w-md">
                          {log.details}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-400">
                          {log.ip_address || '127.0.0.1'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: SPECIAL OFFERS */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif text-lg font-bold text-[#541224]">
              Active Promotions & Seasonal Codes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotions.map((p) => (
              <div key={p.id} className="p-5 bg-white rounded-2xl border border-gray-200 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#541224] text-white">
                    {p.discount_text}
                  </span>
                  <span className="font-mono font-bold text-gray-500">{p.code}</span>
                </div>
                <h4 className="font-serif font-bold text-base text-gray-900">{p.title}</h4>
                <p className="text-gray-600 text-[11px] leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: SALON SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl bg-white rounded-3xl border border-gray-200 p-8 shadow-xs space-y-6 text-xs">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#541224]">
              Salon Contact & Timings Settings
            </h3>
            <p className="text-gray-500">
              Update business details displayed on the website footer, hero, and appointment confirmations.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Salon Name</label>
              <input
                type="text"
                value={settings.salon_name || 'Durga Beauty Parlour'}
                onChange={(e) => setSettings({ ...settings, salon_name: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={settings.tagline || 'Your Beauty, Our Passion.'}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Opening Time</label>
                <input
                  type="text"
                  value={settings.opening_time || '10:00 AM'}
                  onChange={(e) => setSettings({ ...settings, opening_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Closing Time</label>
                <input
                  type="text"
                  value={settings.closing_time || '08:00 PM'}
                  onChange={(e) => setSettings({ ...settings, closing_time: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Weekly Off Day</label>
                <input
                  type="text"
                  value={settings.weekly_off || 'Tuesday'}
                  onChange={(e) => setSettings({ ...settings, weekly_off: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={settings.whatsapp || '919876543210'}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Salon Address</label>
              <textarea
                rows={2}
                value={settings.address || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3.5 py-2.5 border rounded-xl resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-white maroon-gradient shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Salon Settings</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
