import express, { Request, Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, initDatabase } from './db.js';
import { connectMongoDB, isMongoDBConnected, syncDatabaseToMongoDB } from './mongodb.js';
import {
  signToken,
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  AuthenticatedRequest,
  AuthUser
} from './auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Initialize Local SQLite Database
initDatabase();

// Connect to MongoDB Atlas (if MONGODB_URI configured in .env) and sync collections
connectMongoDB().then((connected) => {
  if (connected) {
    syncDatabaseToMongoDB(db);
  }
});

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    salon: 'Durga Beauty Parlour API',
    databases: {
      sqlite: 'connected',
      mongodb: isMongoDBConnected() ? 'connected' : 'not_configured_or_disconnected'
    },
    timestamp: new Date().toISOString()
  });
});

// Admin activity logging helper
export function logAdminActivity(
  adminName: string,
  action: string,
  targetType: string,
  targetId: string | number | null,
  details: string,
  ipAddress?: string
) {
  try {
    const insert = db.prepare(`
      INSERT INTO admin_logs (admin_name, action, target_type, target_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(
      adminName || 'Admin User',
      action,
      targetType,
      targetId !== null && targetId !== undefined ? String(targetId) : null,
      details,
      ipAddress || '127.0.0.1'
    );
  } catch (err) {
    console.error('Failed to write admin log:', err);
  }
}

// -----------------------------------------------------------------------------
// 1. AUTHENTICATION & USERS
// -----------------------------------------------------------------------------

app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const insert = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, 'customer')
    `);
    const result = insert.run(name.trim(), email.toLowerCase().trim(), phone || '', passwordHash);
    const newId = Number(result.lastInsertRowid);

    const user: AuthUser = {
      id: newId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone || '',
      role: 'customer'
    };

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account.' });
  }
});

// Check public admin availability status (Count & whether new admin registration is allowed)
app.get('/api/auth/admin-status', (req: Request, res: Response) => {
  try {
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    res.json({
      count: adminCount.count,
      maxLimit: 2,
      canRegisterAdmin: adminCount.count < 2
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve admin status.' });
  }
});

// Self-register an Administrator account (Allowed only if total admins < 2)
app.post('/api/auth/register-admin', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    // Enforce 2-admin limit
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    if (adminCount.count >= 2) {
      res.status(403).json({
        error: 'Administrator limit reached! Only 2 admin accounts are permitted in the system. The option to register or add admins is closed.'
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id, role FROM users WHERE email = ?').get(cleanEmail) as any;
    if (existing) {
      if (existing.role === 'customer') {
        // Upgrade existing customer to admin
        const passwordHash = bcrypt.hashSync(password, 10);
        db.prepare("UPDATE users SET role = 'admin', name = ?, phone = ?, password_hash = ? WHERE id = ?").run(
          name.trim(), phone || '', passwordHash, existing.id
        );
        const user: AuthUser = {
          id: existing.id,
          name: name.trim(),
          email: cleanEmail,
          phone: phone || '',
          role: 'admin'
        };
        const token = signToken(user);

        logAdminActivity(
          user.name,
          'ADD_ADMIN',
          'user',
          user.id,
          `User ${user.name} (${user.email}) registered/claimed an Administrator account. Total admins: ${adminCount.count + 1}/2.`,
          req.ip
        );

        res.status(200).json({ token, user, message: 'Your account has been registered as Administrator!' });
        return;
      } else {
        res.status(409).json({ error: 'An administrator account with this email already exists. Please log in with your password.' });
        return;
      }
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const insert = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, 'admin')
    `);
    const result = insert.run(name.trim(), cleanEmail, phone || '', passwordHash);
    const newId = Number(result.lastInsertRowid);

    const user: AuthUser = {
      id: newId,
      name: name.trim(),
      email: cleanEmail,
      phone: phone || '',
      role: 'admin'
    };

    const token = signToken(user);

    logAdminActivity(
      user.name,
      'ADD_ADMIN',
      'user',
      newId,
      `New Administrator self-registered: ${user.name} (${user.email}). Total admins: ${adminCount.count + 1}/2.`,
      req.ip
    );

    res.status(201).json({
      token,
      user,
      message: 'Administrator account registered successfully! You are now logged in.'
    });
  } catch (err: any) {
    console.error('Admin self-registration error:', err);
    res.status(500).json({ error: 'Failed to create administrator account.' });
  }
});

// Check public staff capacity status (Max 10 staff limit)
app.get('/api/auth/staff-status', (req: Request, res: Response) => {
  try {
    const staffCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'staff' AND (is_approved = 1 OR is_approved IS NULL)").get() as { count: number };
    const maxLimit = 10;
    res.json({
      count: staffCount.count,
      maxLimit,
      canRegisterStaff: staffCount.count < maxLimit
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve staff status.' });
  }
});

// Self-register as a Salon Staff Member (Requires Admin Approval before login)
app.post('/api/auth/register-staff', (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, designation } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Full name, email address, and password are required.' });
      return;
    }

    // Enforce 10-staff limit
    const staffCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'staff' AND (is_approved = 1 OR is_approved IS NULL)").get() as { count: number };
    if (staffCount.count >= 10) {
      res.status(403).json({
        error: 'Staff registration limit reached! A maximum of 10 staff members are permitted in the salon system.'
      });
      return;
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = db.prepare('SELECT id, role, is_approved FROM users WHERE email = ?').get(cleanEmail) as any;
    if (existing) {
      if (existing.role === 'staff' && existing.is_approved === 0) {
        res.status(400).json({
          error: 'A staff registration request with this email is already pending Administrator approval.'
        });
        return;
      }
      res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const insert = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role, is_approved, designation)
      VALUES (?, ?, ?, ?, 'staff', 0, ?)
    `);
    const result = insert.run(
      name.trim(),
      cleanEmail,
      phone ? phone.trim() : '',
      passwordHash,
      designation ? designation.trim() : 'Salon Stylist'
    );
    const newId = Number(result.lastInsertRowid);

    logAdminActivity(
      'System',
      'STAFF_REGISTRATION_REQUEST',
      'user',
      newId,
      `New staff registration submitted by ${name.trim()} (${cleanEmail}, Role: ${designation || 'Salon Stylist'}). Pending Administrator Approval.`,
      req.ip
    );

    res.status(201).json({
      message: 'Staff registration request submitted successfully! Your account is currently pending Administrator approval. The salon owner must approve your account before you can log in.',
      pendingApproval: true
    });
  } catch (err: any) {
    console.error('Staff registration error:', err);
    res.status(500).json({ error: 'Failed to submit staff registration.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const identifier = (email || '').trim();
    const row = db.prepare('SELECT * FROM users WHERE email = ? OR phone = ?').get(identifier.toLowerCase(), identifier) as any;
    if (!row) {
      res.status(401).json({ error: 'Invalid email/ID or password.' });
      return;
    }

    const isValid = bcrypt.compareSync(password, row.password_hash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email address or password.' });
      return;
    }

    // Check if staff registration is pending admin approval
    if (row.role === 'staff' && (row.is_approved === 0 || row.is_approved === '0')) {
      res.status(403).json({
        error: 'Your staff account is pending Administrator Approval! The Salon Owner must approve your registration from the Admin Dashboard before you can sign in.'
      });
      return;
    }

    const user: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      is_approved: row.is_approved,
      designation: row.designation
    };

    const token = signToken(user);

    // Log admin/staff login activity
    if (row.role === 'admin' || row.role === 'staff') {
      logAdminActivity(
        row.name,
        'ADMIN_LOGIN',
        'system',
        row.id,
        `Administrator ${row.name} (${row.email}) authenticated successfully`,
        req.ip
      );
    }

    res.json({ token, user });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to authenticate.' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const row = db.prepare('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!row) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: row });
});

// -----------------------------------------------------------------------------
// ADMIN ACCOUNTS MANAGEMENT (MAXIMUM 2 ADMINS LIMIT)
// -----------------------------------------------------------------------------

// Get all admin accounts and check slot availability (Max 2)
app.get('/api/admin/admins', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const admins = db.prepare(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE role = 'admin' ORDER BY id ASC"
    ).all() as Array<{ id: number; name: string; email: string; phone: string; role: string; created_at: string }>;

    const count = admins.length;
    const maxLimit = 2;
    const canAddAdmin = count < maxLimit;

    res.json({
      admins,
      count,
      maxLimit,
      canAddAdmin,
      message: canAddAdmin
        ? `1 slot available (${count}/2 admins registered).`
        : `Admin limit reached (${count}/2 admins registered). Add admin option is closed.`
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch administrator accounts.' });
  }
});

// Add a second admin account (Strictly capped at max 2)
app.post('/api/admin/admins', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    // Strict rule: "only two can be added as admin, if two admin add then close add admin option"
    const adminCheck = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    if (adminCheck.count >= 2) {
      res.status(403).json({
        error: 'Administrator limit reached! Only a maximum of 2 admin accounts are permitted in the system. The option to add more admins is closed.'
      });
      return;
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const insert = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, 'admin')
    `);
    const result = insert.run(name.trim(), email.toLowerCase().trim(), phone || '', passwordHash);

    const newAdminCount = adminCheck.count + 1;

    logAdminActivity(
      req.user!.name,
      'ADD_ADMIN',
      'user',
      result.lastInsertRowid,
      `Added new Administrator: ${name.trim()} (${email.toLowerCase().trim()}). Total admins: ${newAdminCount}/2 (Max limit reached; add admin option is now closed).`,
      req.ip
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      message: `Administrator "${name.trim()}" added successfully. Total admins: ${newAdminCount}/2. Add admin option is now closed.`,
      count: newAdminCount,
      canAddAdmin: false
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add administrator.' });
  }
});

// Delete an administrator (must leave at least 1 admin, cannot delete oneself)
app.delete('/api/admin/admins/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const targetId = parseInt(req.params.id);
    const targetAdmin = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'admin'").get(targetId) as any;
    if (!targetAdmin) {
      res.status(404).json({ error: 'Administrator account not found.' });
      return;
    }

    // Verify total admins
    const adminCheck = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    if (adminCheck.count <= 1) {
      res.status(400).json({ error: 'Cannot delete the only remaining administrator account.' });
      return;
    }

    if (req.user!.id === targetId) {
      res.status(400).json({ error: 'You cannot delete your own admin account while currently logged in.' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(targetId);

    logAdminActivity(
      req.user!.name,
      'DELETE_ADMIN',
      'user',
      targetId,
      `Removed Administrator ${targetAdmin.name} (${targetAdmin.email}). Remaining admins: ${adminCheck.count - 1}/2. Admin slot is reopened.`,
      req.ip
    );

    res.json({ message: 'Administrator account removed. 1 admin slot is now open.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete administrator.' });
  }
});

// Update current logged-in Administrator's own profile (Change email, password, name)
app.put('/api/admin/profile', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    const userId = req.user!.id;

    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(cleanEmail, userId);
      if (existing) {
        res.status(409).json({ error: 'This email is already in use by another account.' });
        return;
      }
    }

    let passwordHash: string | null = null;
    if (password && password.trim()) {
      passwordHash = bcrypt.hashSync(password.trim(), 10);
    }

    const update = db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          email = COALESCE(?, email),
          phone = COALESCE(?, phone),
          password_hash = COALESCE(?, password_hash)
      WHERE id = ?
    `);

    update.run(
      name ? name.trim() : null,
      email ? email.toLowerCase().trim() : null,
      phone ? phone.trim() : null,
      passwordHash,
      userId
    );

    const updated = db.prepare('SELECT id, name, email, phone, role FROM users WHERE id = ?').get(userId) as any;
    const newToken = signToken(updated);

    logAdminActivity(
      updated.name,
      'UPDATE_ADMIN_PROFILE',
      'user',
      userId,
      `Administrator profile updated: ${updated.name} (${updated.email})`,
      req.ip
    );

    res.json({ user: updated, token: newToken, message: 'Your administrator profile was updated successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update administrator profile.' });
  }
});

// Admin endpoint to manage staff accounts
app.get('/api/admin/users', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const users = db.prepare('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

app.post('/api/admin/staff', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password required.' });
    return;
  }

  // If role is admin, enforce maximum 2 admin limit
  if (role === 'admin') {
    const adminCheck = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    if (adminCheck.count >= 2) {
      res.status(403).json({ error: 'Administrator limit reached (Maximum 2 admins). Add admin option is closed.' });
      return;
    }
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  try {
    const insert = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(name.trim(), email.toLowerCase().trim(), phone || '', passwordHash, role || 'staff');

    logAdminActivity(
      req.user!.name,
      role === 'admin' ? 'ADD_ADMIN' : 'ADD_STAFF',
      'user',
      result.lastInsertRowid,
      `Added team member: ${name.trim()} (${email.toLowerCase().trim()}, Role: ${role || 'staff'})`,
      req.ip
    );

    res.status(201).json({ id: result.lastInsertRowid, message: `${role === 'admin' ? 'Administrator' : 'Staff'} account created successfully.` });
  } catch (err: any) {
    res.status(400).json({ error: err.message.includes('UNIQUE') ? 'Email already in use.' : 'Failed to create account.' });
  }
});

// Get all staff members (Approved & Pending) - Admin only
app.get('/api/admin/staff-list', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = db.prepare(
      "SELECT id, name, email, phone, role, designation, is_approved, created_at FROM users WHERE role = 'staff' ORDER BY is_approved ASC, created_at DESC"
    ).all();
    res.json(staff);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch staff members.' });
  }
});

// Approve pending staff member registration - Admin only
app.post('/api/admin/staff/:id/approve', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'staff'").get(req.params.id) as any;
    if (!staff) {
      res.status(404).json({ error: 'Staff account not found.' });
      return;
    }

    db.prepare("UPDATE users SET is_approved = 1 WHERE id = ?").run(req.params.id);

    logAdminActivity(
      req.user!.name,
      'APPROVE_STAFF',
      'user',
      staff.id,
      `Approved staff registration for ${staff.name} (${staff.email}, Role: ${staff.designation || 'Staff'})`,
      req.ip
    );

    res.json({ message: `Staff member ${staff.name} approved successfully! They can now log in.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve staff account.' });
  }
});

// Reject / Delete staff registration - Admin only
app.delete('/api/admin/staff/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const staff = db.prepare("SELECT * FROM users WHERE id = ? AND role = 'staff'").get(req.params.id) as any;
    if (!staff) {
      res.status(404).json({ error: 'Staff account not found.' });
      return;
    }

    db.prepare("DELETE FROM users WHERE id = ?").run(req.params.id);

    logAdminActivity(
      req.user!.name,
      'REMOVE_STAFF',
      'user',
      staff.id,
      `Removed staff account for ${staff.name} (${staff.email})`,
      req.ip
    );

    res.json({ message: `Staff member ${staff.name} was removed.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove staff account.' });
  }
});

// -----------------------------------------------------------------------------
// 2. SERVICES & PRICING
// -----------------------------------------------------------------------------

app.get('/api/services', (req: Request, res: Response) => {
  try {
    const { category, search, all } = req.query;
    let query = 'SELECT * FROM services';
    const conditions: string[] = [];
    const params: any[] = [];

    if (all !== 'true') {
      conditions.push('is_active = 1');
    }

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY is_popular DESC, price ASC';
    const services = db.prepare(query).all(...params);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch services.' });
  }
});

app.get('/api/services/:id', (req: Request, res: Response) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
  if (!service) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }
  res.json(service);
});

app.post('/api/services', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, name, description, duration_mins, price, price_short, price_medium, price_long, suitable_skin, image_url, is_popular } = req.body;
    if (!category || !name || !price) {
      res.status(400).json({ error: 'Category, name, and starting price are required.' });
      return;
    }

    const insert = db.prepare(`
      INSERT INTO services (category, name, description, duration_mins, price, price_short, price_medium, price_long, suitable_skin, image_url, is_popular, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const result = insert.run(
      category,
      name,
      description || '',
      duration_mins || 45,
      price,
      price_short || price,
      price_medium || price,
      price_long || price,
      suitable_skin || null,
      image_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      is_popular ? 1 : 0
    );

    logAdminActivity(
      req.user?.name || 'Admin',
      'ADD_SERVICE',
      'service',
      result.lastInsertRowid,
      `Created service "${name}" in category ${category} (₹${price})`,
      req.ip
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Service added successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create service.' });
  }
});

app.put('/api/services/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, name, description, duration_mins, price, price_short, price_medium, price_long, suitable_skin, image_url, is_popular, is_active } = req.body;
    const update = db.prepare(`
      UPDATE services
      SET category = COALESCE(?, category),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          duration_mins = COALESCE(?, duration_mins),
          price = COALESCE(?, price),
          price_short = ?,
          price_medium = ?,
          price_long = ?,
          suitable_skin = ?,
          image_url = COALESCE(?, image_url),
          is_popular = COALESCE(?, is_popular),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `);

    const result = update.run(
      category,
      name,
      description,
      duration_mins,
      price,
      price_short,
      price_medium,
      price_long,
      suitable_skin,
      image_url,
      is_popular,
      is_active,
      req.params.id
    );

    if (result.changes === 0) {
      res.status(404).json({ error: 'Service not found.' });
      return;
    }

    logAdminActivity(
      req.user?.name || 'Admin',
      'EDIT_SERVICE',
      'service',
      req.params.id,
      `Updated service #${req.params.id} (${name || 'details'})`,
      req.ip
    );

    res.json({ message: 'Service updated successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update service.' });
  }
});

app.delete('/api/services/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const service = db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id) as any;
  const result = db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }

  logAdminActivity(
    req.user?.name || 'Admin',
    'DELETE_SERVICE',
    'service',
    req.params.id,
    `Deleted service #${req.params.id} (${service?.name || 'Unnamed'})`,
    req.ip
  );

  res.json({ message: 'Service deleted successfully.' });
});

// -----------------------------------------------------------------------------
// 3. PRODUCTS (RETAIL & IN-SALON USE)
// -----------------------------------------------------------------------------

app.get('/api/products', (req: Request, res: Response) => {
  try {
    const { category, used_in_salon } = req.query;
    let query = 'SELECT * FROM products';
    const conditions: string[] = [];
    const params: any[] = [];

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (used_in_salon !== undefined) {
      conditions.push('is_used_in_salon = ?');
      params.push(used_in_salon === 'true' ? 1 : 0);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';
    const products = db.prepare(query).all(...params);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json(product);
});

app.post('/api/products', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, brand, category, size, price, description, suitability, in_stock, is_used_in_salon, image_url } = req.body;
    if (!name || !price || !category) {
      res.status(400).json({ error: 'Name, price, and category are required.' });
      return;
    }

    const insert = db.prepare(`
      INSERT INTO products (name, brand, category, size, price, description, suitability, in_stock, is_used_in_salon, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insert.run(
      name,
      brand || 'Durga Botanica',
      category,
      size || '100 ml',
      price,
      description || '',
      suitability || 'All Skin Types',
      in_stock !== undefined ? (in_stock ? 1 : 0) : 1,
      is_used_in_salon !== undefined ? (is_used_in_salon ? 1 : 0) : 1,
      image_url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80'
    );

    logAdminActivity(
      req.user?.name || 'Admin',
      'ADD_PRODUCT',
      'product',
      result.lastInsertRowid,
      `Added product "${name}" (${brand || 'Durga Botanica'}) at ₹${price}`,
      req.ip
    );

    res.status(201).json({ id: result.lastInsertRowid, message: 'Product added successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add product.' });
  }
});

app.put('/api/products/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, brand, category, size, price, description, suitability, in_stock, is_used_in_salon, image_url } = req.body;
    const update = db.prepare(`
      UPDATE products
      SET name = COALESCE(?, name),
          brand = COALESCE(?, brand),
          category = COALESCE(?, category),
          size = COALESCE(?, size),
          price = COALESCE(?, price),
          description = COALESCE(?, description),
          suitability = COALESCE(?, suitability),
          in_stock = COALESCE(?, in_stock),
          is_used_in_salon = COALESCE(?, is_used_in_salon),
          image_url = COALESCE(?, image_url)
      WHERE id = ?
    `);

    const result = update.run(
      name, brand, category, size, price, description, suitability,
      in_stock !== undefined ? (in_stock ? 1 : 0) : null,
      is_used_in_salon !== undefined ? (is_used_in_salon ? 1 : 0) : null,
      image_url,
      req.params.id
    );

    if (result.changes === 0) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    logAdminActivity(
      req.user?.name || 'Admin',
      'EDIT_PRODUCT',
      'product',
      req.params.id,
      `Updated product #${req.params.id} (${name || 'details'})`,
      req.ip
    );

    res.json({ message: 'Product updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

app.delete('/api/products/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id) as any;
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  logAdminActivity(
    req.user?.name || 'Admin',
    'DELETE_PRODUCT',
    'product',
    req.params.id,
    `Deleted product #${req.params.id} (${product?.name || 'Product'})`,
    req.ip
  );

  res.json({ message: 'Product deleted.' });
});

// -----------------------------------------------------------------------------
// 4. APPOINTMENT BOOKING SYSTEM
// -----------------------------------------------------------------------------

const STANDARD_TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM'
];

app.get('/api/appointments/available-slots', (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date is required (YYYY-MM-DD).' });
      return;
    }

    // Check if Tuesday (Weekly Off)
    const appointmentDate = new Date(date + 'T00:00:00');
    if (appointmentDate.getDay() === 2) {
      res.json({
        date,
        is_closed: true,
        message: 'Durga Beauty Parlour is closed on Tuesdays for weekly maintenance.',
        slots: []
      });
      return;
    }

    // Fetch confirmed/pending appointments for this date
    const booked = db.prepare(`
      SELECT time_slot, COUNT(*) as count
      FROM appointments
      WHERE appointment_date = ? AND status IN ('confirmed', 'pending')
      GROUP BY time_slot
    `).all(date) as Array<{ time_slot: string; count: number }>;

    const bookedMap = new Map<string, number>();
    booked.forEach(b => bookedMap.set(b.time_slot, b.count));

    // Limit each slot to 2 concurrent salon appointments to avoid double bookings
    const MAX_CONCURRENT_PER_SLOT = 2;

    const slots = STANDARD_TIME_SLOTS.map(time => {
      const currentBookings = bookedMap.get(time) || 0;
      const isAvailable = currentBookings < MAX_CONCURRENT_PER_SLOT;
      return {
        time,
        available: isAvailable,
        remainingCapacity: Math.max(0, MAX_CONCURRENT_PER_SLOT - currentBookings)
      };
    });

    res.json({
      date,
      is_closed: false,
      slots
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve available slots.' });
  }
});

app.post('/api/appointments', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_email,
      service_category,
      service_id,
      service_name,
      hair_length,
      appointment_date,
      time_slot,
      notes
    } = req.body;

    if (!customer_name || !customer_phone || !appointment_date || !time_slot) {
      res.status(400).json({ error: 'Please fill in all required appointment fields.' });
      return;
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(appointment_date + 'T00:00:00');
    if (targetDate < today) {
      res.status(400).json({ error: 'Appointments cannot be booked for past dates.' });
      return;
    }

    // Validate Tuesday off day
    if (targetDate.getDay() === 2) {
      res.status(400).json({ error: 'The salon is closed on Tuesdays. Please choose another date.' });
      return;
    }

    // Check slot availability
    const existing = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE appointment_date = ? AND time_slot = ? AND status IN ('confirmed', 'pending')
    `).get(appointment_date, time_slot) as { count: number };

    if (existing.count >= 2) {
      res.status(409).json({ error: `The ${time_slot} time slot on this date is fully booked. Please pick another available time slot.` });
      return;
    }

    // Determine price from service table
    let price = 350;
    let actualServiceName = service_name || 'Salon Beauty Service';
    let actualCategory = service_category || 'general';

    if (service_id) {
      const s = db.prepare('SELECT * FROM services WHERE id = ?').get(service_id) as any;
      if (s) {
        actualServiceName = s.name;
        actualCategory = s.category;
        if (s.category.startsWith('hair') && hair_length) {
          if (hair_length === 'short' && s.price_short) price = s.price_short;
          else if (hair_length === 'long' && s.price_long) price = s.price_long;
          else if (s.price_medium) price = s.price_medium;
          else price = s.price;
        } else {
          price = s.price;
        }
      }
    }

    // Generate unique booking reference
    const timestampPart = Date.now().toString().slice(-4);
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `DBP-${new Date().getFullYear()}-${timestampPart}${randomPart}`;

    const userId = req.user ? req.user.id : null;

    const insert = db.prepare(`
      INSERT INTO appointments (
        booking_ref, user_id, customer_name, customer_phone, customer_email,
        service_category, service_id, service_name, hair_length,
        appointment_date, time_slot, notes, price, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `);

    insert.run(
      bookingRef,
      userId,
      customer_name.trim(),
      customer_phone.trim(),
      customer_email ? customer_email.trim() : null,
      actualCategory,
      service_id || null,
      actualServiceName,
      hair_length || 'medium',
      appointment_date,
      time_slot,
      notes || '',
      price
    );

    // Prepare WhatsApp Confirmation Link
    const salonWhatsApp = '919876543210';
    const waMessage = encodeURIComponent(
      `Hello Durga Beauty Parlour! I have booked an appointment.\n\n` +
      `*Ref:* ${bookingRef}\n` +
      `*Name:* ${customer_name}\n` +
      `*Service:* ${actualServiceName}\n` +
      `*Date:* ${appointment_date}\n` +
      `*Time:* ${time_slot}\n` +
      `*Estimated Price:* ₹${price}\n\n` +
      `Please confirm my slot. Thank you!`
    );
    const whatsappUrl = `https://wa.me/${salonWhatsApp}?text=${waMessage}`;

    res.status(201).json({
      success: true,
      booking_ref: bookingRef,
      service_name: actualServiceName,
      appointment_date,
      time_slot,
      price,
      whatsapp_url: whatsappUrl,
      message: 'Appointment booked successfully!'
    });
  } catch (err: any) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to process appointment booking.' });
  }
});

app.get('/api/appointments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, date, search } = req.query;
    const userRole = req.user!.role;

    let query = 'SELECT * FROM appointments';
    const conditions: string[] = [];
    const params: any[] = [];

    // If customer, only show their own appointments
    if (userRole === 'customer') {
      conditions.push('(user_id = ? OR customer_email = ?)');
      params.push(req.user!.id, req.user!.email);
    }

    if (status && status !== 'all') {
      conditions.push('status = ?');
      params.push(status);
    }

    if (date) {
      conditions.push('appointment_date = ?');
      params.push(date);
    }

    if (search && (userRole === 'admin' || userRole === 'staff')) {
      conditions.push('(customer_name LIKE ? OR customer_phone LIKE ? OR booking_ref LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY appointment_date DESC, time_slot DESC';
    const appointments = db.prepare(query).all(...params);
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments.' });
  }
});

app.patch('/api/appointments/:id/status', authMiddleware, requireRole(['admin', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      res.status(400).json({ error: 'Invalid appointment status.' });
      return;
    }

    const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id) as any;
    if (!appt) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }

    const result = db.prepare('UPDATE appointments SET status = ? WHERE id = ?').run(status, req.params.id);
    if (result.changes === 0) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }

    const actionType = status === 'completed'
      ? 'COMPLETE_APPOINTMENT'
      : status === 'cancelled'
        ? 'CANCEL_APPOINTMENT'
        : 'UPDATE_APPOINTMENT_STATUS';

    logAdminActivity(
      req.user?.name || 'Salon Staff',
      actionType,
      'appointment',
      req.params.id,
      `Updated booking ${appt.booking_ref} (${appt.customer_name}) status from ${appt.status} to ${status}`,
      req.ip
    );

    res.json({ message: `Appointment status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment status.' });
  }
});

// Customer cancel appointment
app.post('/api/appointments/:id/cancel', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id) as any;
    if (!appt) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }

    if (req.user!.role === 'customer' && appt.user_id !== req.user!.id && appt.customer_email !== req.user!.email) {
      res.status(403).json({ error: 'You are not authorized to cancel this appointment.' });
      return;
    }

    if (appt.status === 'completed') {
      res.status(400).json({ error: 'Completed appointments cannot be cancelled.' });
      return;
    }

    db.prepare("UPDATE appointments SET status = 'cancelled' WHERE id = ?").run(req.params.id);

    logAdminActivity(
      req.user?.name || 'Customer',
      'CANCEL_APPOINTMENT',
      'appointment',
      req.params.id,
      `Appointment ${appt.booking_ref} (${appt.customer_name} - ${appt.service_name}) cancelled by ${req.user?.role}`,
      req.ip
    );

    res.json({ message: 'Appointment cancelled successfully according to salon policy.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel appointment.' });
  }
});

// Customer or admin reschedule appointment
app.post('/api/appointments/:id/reschedule', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { new_date, new_time_slot } = req.body;
    if (!new_date || !new_time_slot) {
      res.status(400).json({ error: 'New date and time slot are required.' });
      return;
    }

    const appt = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id) as any;
    if (!appt) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }

    if (req.user!.role === 'customer' && appt.user_id !== req.user!.id && appt.customer_email !== req.user!.email) {
      res.status(403).json({ error: 'Not authorized.' });
      return;
    }

    // Check slot
    const targetDate = new Date(new_date + 'T00:00:00');
    if (targetDate.getDay() === 2) {
      res.status(400).json({ error: 'Salon is closed on Tuesdays.' });
      return;
    }

    const count = db.prepare(`
      SELECT COUNT(*) as count FROM appointments
      WHERE appointment_date = ? AND time_slot = ? AND status IN ('confirmed', 'pending') AND id != ?
    `).get(new_date, new_time_slot, req.params.id) as { count: number };

    if (count.count >= 2) {
      res.status(409).json({ error: 'Selected time slot is already fully booked.' });
      return;
    }

    db.prepare(`
      UPDATE appointments
      SET appointment_date = ?, time_slot = ?, status = 'confirmed'
      WHERE id = ?
    `).run(new_date, new_time_slot, req.params.id);

    res.json({ message: 'Appointment rescheduled successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reschedule appointment.' });
  }
});

// -----------------------------------------------------------------------------
// 5. ORDERS (E-COMMERCE FLOW)
// -----------------------------------------------------------------------------

app.post('/api/orders', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customer_name, customer_phone, customer_email, shipping_address, items, total_amount, payment_method } = req.body;
    if (!customer_name || !customer_phone || !items || !items.length || !total_amount) {
      res.status(400).json({ error: 'Incomplete order details.' });
      return;
    }

    const orderRef = `ORD-DBP-${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;
    const userId = req.user ? req.user.id : null;

    const insert = db.prepare(`
      INSERT INTO orders (order_ref, user_id, customer_name, customer_phone, customer_email, shipping_address, items_json, total_amount, payment_method, payment_status, order_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'processing')
    `);

    insert.run(
      orderRef,
      userId,
      customer_name,
      customer_phone,
      customer_email || null,
      shipping_address || 'Salon Pickup (Durga Beauty Parlour)',
      JSON.stringify(items),
      total_amount,
      payment_method || 'salon_pickup_cash'
    );

    res.status(201).json({
      success: true,
      order_ref: orderRef,
      total_amount,
      message: 'Order placed successfully! We will prepare your products.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order.' });
  }
});

app.get('/api/orders', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  try {
    if (req.user!.role === 'admin' || req.user!.role === 'staff') {
      const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
      res.json(orders);
    } else {
      const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY created_at DESC').all(req.user!.id, req.user!.email);
      res.json(orders);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// -----------------------------------------------------------------------------
// 6. PROMOTIONS & OFFERS
// -----------------------------------------------------------------------------

app.get('/api/promotions', (req: Request, res: Response) => {
  const { all } = req.query;
  const query = all === 'true' ? 'SELECT * FROM promotions ORDER BY id ASC' : 'SELECT * FROM promotions WHERE is_active = 1 ORDER BY id ASC';
  const promos = db.prepare(query).all();
  res.json(promos);
});

app.post('/api/promotions', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, tagline, code, discount_text, description, category } = req.body;
    const insert = db.prepare(`
      INSERT INTO promotions (title, tagline, code, discount_text, description, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const result = insert.run(title, tagline || '', code || '', discount_text, description, category || 'general');
    res.status(201).json({ id: result.lastInsertRowid, message: 'Promotion created.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create promotion.' });
  }
});

app.put('/api/promotions/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, tagline, code, discount_text, description, category, is_active } = req.body;
    db.prepare(`
      UPDATE promotions
      SET title = COALESCE(?, title),
          tagline = COALESCE(?, tagline),
          code = COALESCE(?, code),
          discount_text = COALESCE(?, discount_text),
          description = COALESCE(?, description),
          category = COALESCE(?, category),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(title, tagline, code, discount_text, description, category, is_active, req.params.id);
    res.json({ message: 'Promotion updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update promotion.' });
  }
});

app.delete('/api/promotions/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  db.prepare('DELETE FROM promotions WHERE id = ?').run(req.params.id);
  res.json({ message: 'Promotion deleted.' });
});

// -----------------------------------------------------------------------------
// 7. REVIEWS & TESTIMONIALS
// -----------------------------------------------------------------------------

app.get('/api/reviews', (req: Request, res: Response) => {
  const reviews = db.prepare('SELECT * FROM reviews WHERE is_featured = 1 ORDER BY created_at DESC').all();
  res.json(reviews);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  try {
    const { customer_name, service_name, rating, comment } = req.body;
    if (!customer_name || !comment) {
      res.status(400).json({ error: 'Name and review text required.' });
      return;
    }
    const insert = db.prepare(`
      INSERT INTO reviews (customer_name, service_name, rating, comment, is_featured)
      VALUES (?, ?, ?, ?, 1)
    `);
    insert.run(customer_name, service_name || 'Salon Treatment', rating || 5, comment);
    res.status(201).json({ message: 'Thank you for sharing your review!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit review.' });
  }
});

// -----------------------------------------------------------------------------
// 8. SKIN CONSULTATIONS
// -----------------------------------------------------------------------------

app.post('/api/consultations', (req: Request, res: Response) => {
  try {
    const { name, phone, email, skin_type, concerns, preferred_contact } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: 'Name and contact phone are required.' });
      return;
    }
    const insert = db.prepare(`
      INSERT INTO consultations (name, phone, email, skin_type, concerns, preferred_contact)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insert.run(name, phone, email || '', skin_type || 'Unsure / Combination', concerns || '', preferred_contact || 'whatsapp');
    res.status(201).json({ message: 'Skin consultation request received. Our beauty expert will reach out to you shortly!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit consultation.' });
  }
});

app.get('/api/consultations', authMiddleware, requireRole(['admin', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  const list = db.prepare('SELECT * FROM consultations ORDER BY created_at DESC').all();
  res.json(list);
});

// -----------------------------------------------------------------------------
// 9. SALON SETTINGS & CONTACT INFO
// -----------------------------------------------------------------------------

app.get('/api/settings', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT key, value FROM salon_settings').all() as Array<{ key: string; value: string }>;
  const settings: Record<string, string> = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

app.put('/api/settings', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body as Record<string, string>;
    const updateStmt = db.prepare(`
      INSERT INTO salon_settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const updateMany = db.transaction((obj) => {
      for (const [k, v] of Object.entries(obj)) {
        updateStmt.run(k, String(v));
      }
    });

    updateMany(updates);

    logAdminActivity(
      req.user?.name || 'Admin',
      'UPDATE_SETTINGS',
      'settings',
      null,
      `Updated salon settings: ${Object.keys(updates).join(', ')}`,
      req.ip
    );

    res.json({ message: 'Salon settings updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// -----------------------------------------------------------------------------
// 10. ADMIN DASHBOARD STATS & ANALYTICS
// -----------------------------------------------------------------------------

app.get('/api/admin/stats', authMiddleware, requireRole(['admin', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const todayCount = db.prepare('SELECT COUNT(*) as count FROM appointments WHERE appointment_date = ?').get(today) as { count: number };
    const totalBookings = db.prepare('SELECT COUNT(*) as count FROM appointments').get() as { count: number };
    const upcomingCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE appointment_date >= ? AND status = 'confirmed'").get(today) as { count: number };
    const completedCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'completed'").get() as { count: number };
    const cancelledCount = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE status = 'cancelled'").get() as { count: number };

    // Strict rule: "Do not count uncompleted or cancelled bookings as earned revenue."
    const revenueResult = db.prepare("SELECT SUM(price) as total FROM appointments WHERE status = 'completed'").get() as { total: number | null };
    const earnedRevenue = revenueResult.total || 0;

    // Popular services breakdown
    const popularServices = db.prepare(`
      SELECT service_name, COUNT(*) as bookings, SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as revenue
      FROM appointments
      GROUP BY service_name
      ORDER BY bookings DESC
      LIMIT 5
    `).all();

    // Recent 5 bookings
    const recentAppointments = db.prepare(`
      SELECT * FROM appointments
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.json({
      today_appointments: todayCount.count,
      total_bookings: totalBookings.count,
      upcoming_appointments: upcomingCount.count,
      completed_appointments: completedCount.count,
      cancelled_appointments: cancelledCount.count,
      earned_revenue: earnedRevenue,
      popular_services: popularServices,
      recent_appointments: recentAppointments
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

// -----------------------------------------------------------------------------
// 10B. ADMIN-ONLY ADVANCED ANALYTICAL INTELLIGENCE & BUSINESS GRAPHS
// -----------------------------------------------------------------------------

app.get('/api/admin/analytics', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const range = (req.query.range as string) || 'all';
    let dateFilterClause = '';
    const dateParams: any[] = [];

    const now = new Date();
    if (range === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      dateFilterClause = 'WHERE appointment_date >= ?';
      dateParams.push(d.toISOString().split('T')[0]);
    } else if (range === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      dateFilterClause = 'WHERE appointment_date >= ?';
      dateParams.push(d.toISOString().split('T')[0]);
    } else if (range === 'thisMonth') {
      const ym = now.toISOString().slice(0, 7); // e.g. '2026-11'
      dateFilterClause = "WHERE strftime('%Y-%m', appointment_date) = ?";
      dateParams.push(ym);
    } else if (range === '6months') {
      const d = new Date();
      d.setMonth(d.getMonth() - 6);
      dateFilterClause = 'WHERE appointment_date >= ?';
      dateParams.push(d.toISOString().split('T')[0]);
    }

    // 1. Core KPIs
    const totalBookingsRow = db.prepare(`SELECT COUNT(*) as count FROM appointments ${dateFilterClause}`).get(...dateParams) as { count: number };
    const totalBookings = totalBookingsRow.count;

    const completedRow = db.prepare(`SELECT COUNT(*) as count, SUM(price) as revenue FROM appointments ${dateFilterClause ? dateFilterClause + " AND" : "WHERE"} status = 'completed'`).get(...dateParams) as { count: number; revenue: number | null };
    const completedBookings = completedRow.count;
    const totalRevenue = completedRow.revenue || 0;

    const confirmedRow = db.prepare(`SELECT COUNT(*) as count FROM appointments ${dateFilterClause ? dateFilterClause + " AND" : "WHERE"} status = 'confirmed'`).get(...dateParams) as { count: number };
    const confirmedBookings = confirmedRow.count;

    const cancelledRow = db.prepare(`SELECT COUNT(*) as count FROM appointments ${dateFilterClause ? dateFilterClause + " AND" : "WHERE"} status = 'cancelled'`).get(...dateParams) as { count: number };
    const cancelledBookings = cancelledRow.count;

    const pendingRow = db.prepare(`SELECT COUNT(*) as count FROM appointments ${dateFilterClause ? dateFilterClause + " AND" : "WHERE"} status = 'pending'`).get(...dateParams) as { count: number };
    const pendingBookings = pendingRow.count;

    const completionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;
    const averageOrderValue = completedBookings > 0 ? Math.round(totalRevenue / completedBookings) : 0;

    // Customer Retention
    const uniqueCustRow = db.prepare(`SELECT COUNT(DISTINCT customer_phone) as count FROM appointments ${dateFilterClause}`).get(...dateParams) as { count: number };
    const uniqueCustomers = uniqueCustRow.count;

    const repeatCustRow = db.prepare(`
      SELECT COUNT(*) as count FROM (
        SELECT customer_phone, COUNT(*) as bookings
        FROM appointments
        ${dateFilterClause}
        GROUP BY customer_phone
        HAVING bookings > 1
      )
    `).get(...dateParams) as { count: number };
    const repeatCustomers = repeatCustRow.count;
    const repeatRate = uniqueCustomers > 0 ? Math.round((repeatCustomers / uniqueCustomers) * 100) : 0;

    // 2. Monthly Trend (Past 6 Months)
    const monthlyRows = db.prepare(`
      SELECT 
        strftime('%Y-%m', appointment_date) as ym,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as revenue
      FROM appointments
      WHERE appointment_date IS NOT NULL
      GROUP BY ym
      ORDER BY ym ASC
    `).all() as Array<{ ym: string; total_bookings: number; completed_bookings: number; revenue: number | null }>;

    const monthNames: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
    };

    const monthlyTrends = monthlyRows.map((row, idx) => {
      const [year, month] = (row.ym || '2026-01').split('-');
      const label = `${monthNames[month] || month} ${year}`;
      const rev = row.revenue || 0;
      const prevRev = idx > 0 ? (monthlyRows[idx - 1].revenue || 0) : 0;
      const growth = prevRev > 0 ? Math.round(((rev - prevRev) / prevRev) * 100) : 0;

      return {
        key: row.ym,
        month: label,
        revenue: rev,
        bookings: row.total_bookings,
        completed: row.completed_bookings,
        growth
      };
    });

    // 3. Category Breakdown
    const categoryLabels: Record<string, { label: string; color: string }> = {
      bridal: { label: 'Bridal & HD Airbrush Glam', color: '#541224' },
      facial: { label: 'Facials & Ayurvedic Skincare', color: '#B76E79' },
      haircoloring: { label: 'Balayage & Hair Coloring', color: '#8B4513' },
      haircut: { label: 'Haircuts, Layers & Styling', color: '#D4A5AC' },
      festive: { label: 'Festive & Ceremony Specials', color: '#C5A059' },
      hairspa: { label: 'Nourishing Hair & Scalp Spa', color: '#2E8B57' },
      waxing: { label: 'Smooth Waxing & Polishing', color: '#E0A96D' },
      nails: { label: 'Nail Art & Extensions', color: '#9370DB' }
    };

    const categoryRows = db.prepare(`
      SELECT 
        service_category,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as revenue
      FROM appointments
      ${dateFilterClause}
      GROUP BY service_category
      ORDER BY revenue DESC, count DESC
    `).all(...dateParams) as Array<{ service_category: string; count: number; revenue: number | null }>;

    const categoryBreakdown = categoryRows.map((cat) => {
      const info = categoryLabels[cat.service_category] || { label: cat.service_category.toUpperCase(), color: '#708090' };
      const rev = cat.revenue || 0;
      const pct = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;
      return {
        category: cat.service_category,
        label: info.label,
        count: cat.count,
        revenue: rev,
        percentage: pct,
        color: info.color
      };
    });

    // 4. Day of the Week Traffic (0 = Sunday, 1 = Monday, ...)
    const dayRows = db.prepare(`
      SELECT 
        strftime('%w', appointment_date) as dow,
        COUNT(*) as bookings,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as revenue
      FROM appointments
      ${dateFilterClause}
      GROUP BY dow
      ORDER BY dow ASC
    `).all(...dateParams) as Array<{ dow: string; bookings: number; revenue: number | null }>;

    const dayMap: Record<string, { name: string; full: string }> = {
      '0': { name: 'Sun', full: 'Sunday' },
      '1': { name: 'Mon', full: 'Monday' },
      '2': { name: 'Tue', full: 'Tuesday' },
      '3': { name: 'Wed', full: 'Wednesday' },
      '4': { name: 'Thu', full: 'Thursday' },
      '5': { name: 'Fri', full: 'Friday' },
      '6': { name: 'Sat', full: 'Saturday' }
    };

    const dowDataMap: Record<string, { bookings: number; revenue: number }> = {};
    for (const r of dayRows) {
      dowDataMap[r.dow] = { bookings: r.bookings, revenue: r.revenue || 0 };
    }

    // Days ordered Mon -> Sun
    const orderedKeys = ['1', '2', '3', '4', '5', '6', '0'];
    let maxBookings = 0;
    let busiestDayName = 'Saturday';

    const dayOfWeekTrends = orderedKeys.map((key) => {
      const info = dayMap[key];
      const data = dowDataMap[key] || { bookings: 0, revenue: 0 };
      if (data.bookings > maxBookings) {
        maxBookings = data.bookings;
        busiestDayName = info.full;
      }
      return {
        key,
        day: info.name,
        fullDay: info.full,
        bookings: data.bookings,
        revenue: data.revenue
      };
    });

    // 5. Hourly Traffic Breakdown
    const hourRows = db.prepare(`
      SELECT 
        time_slot,
        COUNT(*) as count
      FROM appointments
      ${dateFilterClause}
      GROUP BY time_slot
      ORDER BY count DESC
    `).all(...dateParams) as Array<{ time_slot: string; count: number }>;

    const hourlyTraffic = hourRows.map((h) => ({
      slot: h.time_slot,
      count: h.count,
      percentage: totalBookings > 0 ? Math.round((h.count / totalBookings) * 100) : 0
    }));

    // 6. Top Services Leaderboard
    const topServicesRows = db.prepare(`
      SELECT 
        service_name,
        service_category,
        COUNT(*) as bookings,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as revenue
      FROM appointments
      ${dateFilterClause}
      GROUP BY service_name, service_category
      ORDER BY revenue DESC, bookings DESC
      LIMIT 6
    `).all(...dateParams) as Array<{ service_name: string; service_category: string; bookings: number; revenue: number | null }>;

    const topServices = topServicesRows.map((s) => ({
      name: s.service_name,
      category: s.service_category,
      bookings: s.bookings,
      revenue: s.revenue || 0,
      share: totalRevenue > 0 ? Math.round(((s.revenue || 0) / totalRevenue) * 100) : 0
    }));

    // 7. Top VIP Clients
    const vipRows = db.prepare(`
      SELECT 
        customer_name,
        customer_phone,
        customer_email,
        COUNT(*) as visits,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_spent,
        MAX(appointment_date) as last_visit,
        MAX(service_name) as favorite_service
      FROM appointments
      ${dateFilterClause}
      GROUP BY customer_phone
      ORDER BY total_spent DESC, visits DESC
      LIMIT 6
    `).all(...dateParams) as Array<{
      customer_name: string;
      customer_phone: string;
      customer_email: string | null;
      visits: number;
      total_spent: number | null;
      last_visit: string;
      favorite_service: string;
    }>;

    const topClients = vipRows.map((c) => ({
      name: c.customer_name,
      phone: c.customer_phone,
      email: c.customer_email || '—',
      visits: c.visits,
      totalSpent: c.total_spent || 0,
      lastVisit: c.last_visit,
      favoriteService: c.favorite_service
    }));

    const topCategoryName = categoryBreakdown.length > 0 ? categoryBreakdown[0].label : 'Hair & Facials';

    res.json({
      kpis: {
        totalRevenue,
        totalBookings,
        completedBookings,
        confirmedBookings,
        cancelledBookings,
        pendingBookings,
        completionRate,
        averageOrderValue,
        uniqueCustomers,
        repeatCustomers,
        repeatRate,
        busiestDay: busiestDayName,
        topCategory: topCategoryName
      },
      monthlyTrends,
      categoryBreakdown,
      dayOfWeekTrends,
      hourlyTraffic,
      statusBreakdown: {
        completed: completedBookings,
        confirmed: confirmedBookings,
        pending: pendingBookings,
        cancelled: cancelledBookings
      },
      topServices,
      topClients
    });
  } catch (err: any) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Failed to generate analytical insights.' });
  }
});

// -----------------------------------------------------------------------------
// 11. GALLERY & PHOTO SHOWCASE
// -----------------------------------------------------------------------------

app.get('/api/gallery', (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM gallery';
    const params: any[] = [];
    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY created_at DESC, id DESC';
    const photos = db.prepare(query).all(...params);
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch gallery photos.' });
  }
});

app.post('/api/gallery', authMiddleware, requireRole(['admin', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, url, description } = req.body;
    if (!title || !url) {
      res.status(400).json({ error: 'Photo title and image URL are required.' });
      return;
    }

    const insert = db.prepare(`
      INSERT INTO gallery (title, category, url, description)
      VALUES (?, ?, ?, ?)
    `);
    const result = insert.run(
      title.trim(),
      category || 'hair',
      url.trim(),
      description ? description.trim() : ''
    );

    const newPhoto = db.prepare('SELECT * FROM gallery WHERE id = ?').get(result.lastInsertRowid);

    logAdminActivity(
      req.user?.name || 'Salon Admin',
      'ADD_PHOTO',
      'gallery',
      result.lastInsertRowid,
      `Uploaded/added gallery photo "${title.trim()}" in category ${category || 'hair'}`,
      req.ip
    );

    res.status(201).json({ message: 'Photo added to salon gallery successfully.', photo: newPhoto });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gallery photo.' });
  }
});

app.delete('/api/gallery/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const photo = db.prepare('SELECT * FROM gallery WHERE id = ?').get(req.params.id) as any;
    if (!photo) {
      res.status(404).json({ error: 'Photo not found in gallery.' });
      return;
    }

    db.prepare('DELETE FROM gallery WHERE id = ?').run(req.params.id);

    logAdminActivity(
      req.user?.name || 'Salon Admin',
      'DELETE_PHOTO',
      'gallery',
      req.params.id,
      `Removed photo "${photo.title}" from salon gallery`,
      req.ip
    );

    res.json({ message: 'Photo deleted successfully from gallery.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete photo from gallery.' });
  }
});

// -----------------------------------------------------------------------------
// 11B. MAKEOVER SHORT VIDEOS & REELS (BEFORE & AFTER TRANSFORMATION SHOWCASE)
// -----------------------------------------------------------------------------

app.get('/api/videos', (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query = 'SELECT * FROM makeover_videos';
    const params: any[] = [];
    if (category && category !== 'all') {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY id DESC';
    const videos = db.prepare(query).all(...params);
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch makeover videos.' });
  }
});

app.post('/api/videos/:id/like', (req: Request, res: Response) => {
  try {
    db.prepare('UPDATE makeover_videos SET likes = likes + 1 WHERE id = ?').run(req.params.id);
    const row = db.prepare('SELECT likes FROM makeover_videos WHERE id = ?').get(req.params.id) as any;
    res.json({ likes: row?.likes || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update likes.' });
  }
});

app.post('/api/videos/:id/view', (req: Request, res: Response) => {
  try {
    db.prepare('UPDATE makeover_videos SET views = views + 1 WHERE id = ?').run(req.params.id);
    const row = db.prepare('SELECT views FROM makeover_videos WHERE id = ?').get(req.params.id) as any;
    res.json({ views: row?.views || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update views.' });
  }
});

app.post('/api/admin/videos', authMiddleware, requireRole(['admin', 'staff']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, category, video_url, thumbnail_url, duration, before_image, after_image, service_name, description, music_url, music_title } = req.body;
    if (!title || !thumbnail_url) {
      res.status(400).json({ error: 'Title and thumbnail image are required.' });
      return;
    }

    const insert = db.prepare(`
      INSERT INTO makeover_videos (title, category, video_url, thumbnail_url, duration, views, likes, before_image, after_image, service_name, description, music_url, music_title)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
      title.trim(),
      category || 'makeover',
      (video_url || '').trim(),
      thumbnail_url.trim(),
      duration || '0:30',
      Math.floor(Math.random() * 500) + 120,
      Math.floor(Math.random() * 60) + 15,
      before_image ? before_image.trim() : null,
      after_image ? after_image.trim() : thumbnail_url.trim(),
      service_name ? service_name.trim() : null,
      description ? description.trim() : null,
      music_url ? music_url.trim() : '/audio/raga-durga-salon.mp3',
      music_title ? music_title.trim() : 'Raga Durga - Royal Sitar & Sarod'
    );

    const newVideo = db.prepare('SELECT * FROM makeover_videos WHERE id = ?').get(result.lastInsertRowid);

    logAdminActivity(
      req.user?.name || 'Salon Admin',
      'ADD_VIDEO',
      'video',
      result.lastInsertRowid,
      `Added makeover video reel "${title.trim()}" in category ${category || 'makeover'}`,
      req.ip
    );

    res.status(201).json({ message: 'Makeover video reel published successfully!', video: newVideo });
  } catch (err) {
    res.status(500).json({ error: 'Failed to publish makeover video.' });
  }
});

app.delete('/api/admin/videos/:id', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const video = db.prepare('SELECT * FROM makeover_videos WHERE id = ?').get(req.params.id) as any;
    if (!video) {
      res.status(404).json({ error: 'Makeover video not found.' });
      return;
    }

    db.prepare('DELETE FROM makeover_videos WHERE id = ?').run(req.params.id);

    logAdminActivity(
      req.user?.name || 'Salon Admin',
      'DELETE_VIDEO',
      'video',
      req.params.id,
      `Removed makeover video reel "${video.title}"`,
      req.ip
    );

    res.json({ message: 'Makeover video deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete makeover video.' });
  }
});

// -----------------------------------------------------------------------------
// 12. ADMIN AUDIT & ACTIVITY LOGS
// -----------------------------------------------------------------------------

app.get('/api/admin/logs', authMiddleware, requireRole(['admin']), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { action, search, limit } = req.query;
    let query = 'SELECT * FROM admin_logs';
    const conditions: string[] = [];
    const params: any[] = [];

    if (action && action !== 'all') {
      conditions.push('action = ?');
      params.push(action);
    }

    if (search) {
      conditions.push('(admin_name LIKE ? OR details LIKE ? OR target_type LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const maxLimit = limit ? Math.min(200, parseInt(String(limit))) : 100;
    query += ` ORDER BY created_at DESC, id DESC LIMIT ${maxLimit}`;

    const logs = db.prepare(query).all(...params);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve admin logs.' });
  }
});

// Serve static frontend assets from Vite build (dist)
app.use(express.static(distPath));

// Also serve public static assets (videos, images)
const publicPath = path.resolve(__dirname, '../public');
app.use(express.static(publicPath));

// Catch-all SPA fallback: Send index.html for any client navigation (Express 5 compatible)
app.use((req: Request, res: Response, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌸 Durga Beauty Parlour Backend running on http://0.0.0.0:${PORT}`);
});
