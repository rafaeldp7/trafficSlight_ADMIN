# Simple Backend Role API Implementation

## Quick Setup for Role-Based Access Control

### 1. Add to your existing backend (Node.js/Express)

#### Add these routes to your main server file:

```javascript
// Add these routes to your existing Express app

// GET /api/admin-auth/me - Get current admin with role
app.get('/api/admin-auth/me', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).populate('role');
    
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: {
            name: admin.role.name,
            displayName: admin.role.displayName,
            permissions: admin.role.permissions
          },
          isActive: admin.isActive,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ success: false, error: 'Failed to get admin profile' });
  }
});

// GET /api/admin-auth/verify-token - Verify token and return admin data
app.get('/api/admin-auth/verify-token', authenticateAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).populate('role');
    
    res.json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: {
            name: admin.role.name,
            displayName: admin.role.displayName,
            permissions: admin.role.permissions
          },
          isActive: admin.isActive,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({ success: false, error: 'Token verification failed' });
  }
});
```

### 2. Update your Admin model (if not already done):

```javascript
// Admin model should have:
const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole', required: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });
```

### 3. Update your AdminRole model:

```javascript
// AdminRole model
const adminRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // 'super_admin', 'admin', 'viewer'
  displayName: { type: String, required: true }, // 'Super Administrator', 'Administrator', 'Viewer'
  permissions: {
    canCreate: { type: Boolean, default: false },
    canRead: { type: Boolean, default: true },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    canAssignRoles: { type: Boolean, default: false },
    canManageUsers: { type: Boolean, default: false },
    canManageReports: { type: Boolean, default: false },
    canManageTrips: { type: Boolean, default: false },
    canManageGasStations: { type: Boolean, default: false },
    canViewAnalytics: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false }
  }
}, { timestamps: true });
```

### 4. Create default roles (run this once):

```javascript
// Seed default roles
const createDefaultRoles = async () => {
  try {
    // Super Admin Role
    await AdminRole.findOneAndUpdate(
      { name: 'super_admin' },
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        permissions: {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          canManageAdmins: true,
          canAssignRoles: true,
          canManageUsers: true,
          canManageReports: true,
          canManageTrips: true,
          canManageGasStations: true,
          canViewAnalytics: true,
          canExportData: true,
          canManageSettings: true
        }
      },
      { upsert: true }
    );

    // Admin Role
    await AdminRole.findOneAndUpdate(
      { name: 'admin' },
      {
        name: 'admin',
        displayName: 'Administrator',
        permissions: {
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true,
          canManageAdmins: false,
          canAssignRoles: false,
          canManageUsers: true,
          canManageReports: true,
          canManageTrips: true,
          canManageGasStations: true,
          canViewAnalytics: true,
          canExportData: true,
          canManageSettings: false
        }
      },
      { upsert: true }
    );

    // Viewer Role
    await AdminRole.findOneAndUpdate(
      { name: 'viewer' },
      {
        name: 'viewer',
        displayName: 'Viewer',
        permissions: {
          canCreate: false,
          canRead: true,
          canUpdate: false,
          canDelete: false,
          canManageAdmins: false,
          canAssignRoles: false,
          canManageUsers: false,
          canManageReports: false,
          canManageTrips: false,
          canManageGasStations: false,
          canViewAnalytics: true,
          canExportData: false,
          canManageSettings: false
        }
      },
      { upsert: true }
    );

    console.log('✅ Default roles created successfully');
  } catch (error) {
    console.error('❌ Error creating default roles:', error);
  }
};

// Run this once
createDefaultRoles();
```

### 5. Update your existing login endpoint:

```javascript
// Update your existing login endpoint to return role data
app.post('/api/admin-auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin with role
    const admin = await Admin.findOne({ email }).populate('role');
    
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check password (implement your password checking logic)
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        admin: {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          email: admin.email,
          role: {
            name: admin.role.name,
            displayName: admin.role.displayName,
            permissions: admin.role.permissions
          },
          isActive: admin.isActive,
          lastLogin: admin.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});
```

### 6. Test the API:

```bash
# Test login
curl -X POST http://localhost:5000/api/admin-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin@email.com","password":"your-password"}'

# Test get current admin
curl -X GET http://localhost:5000/api/admin-auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Frontend Integration:

Your frontend is already set up to use these endpoints. The `AdminAuthContext` will:

1. Call `/api/admin-auth/login` when logging in
2. Call `/api/admin-auth/verify-token` to check if user is authenticated
3. Call `/api/admin-auth/me` to get current admin data with role
4. Use the role data to determine permissions throughout the app

### 8. Permission Logic:

The frontend will automatically:
- Show/hide buttons based on `canCreate`, `canUpdate`, `canDelete` permissions
- Display the user's name and role in the navbar
- Show appropriate warnings for restricted access
- Allow only permitted actions based on the admin's role

This implementation fetches the actual admin role from your backend database and uses it to control what the user can do in the frontend, exactly as you requested!

