# Backend Role-Based Architecture Guide

## 🏗️ **Backend Architecture Requirements**

### **1. Authentication & Authorization System**

#### **Admin Authentication Endpoints:**
```javascript
// Authentication routes
POST /api/admin/auth/login          // Admin login
POST /api/admin/auth/logout         // Admin logout
POST /api/admin/auth/refresh        // Refresh token
GET  /api/admin/auth/verify        // Verify token
GET  /api/admin/auth/me            // Get current admin info
```

#### **JWT Token Structure:**
```javascript
{
  "adminId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "email": "admin@trafficslight.com",
  "role": {
    "name": "super_admin",
    "displayName": "Super Administrator",
    "permissions": {
      "canCreate": true,
      "canRead": true,
      "canUpdate": true,
      "canDelete": true
    }
  },
  "iat": 1699123456,
  "exp": 1699209856
}
```

### **2. Role-Based Access Control (RBAC)**

#### **Role Management System:**
```javascript
// Role endpoints
GET    /api/admin/roles                    // Get all roles
POST   /api/admin/roles                    // Create new role
PUT    /api/admin/roles/:id               // Update role
DELETE /api/admin/roles/:id                // Delete role
GET    /api/admin/roles/:id/permissions   // Get role permissions
```

#### **Permission Middleware:**
```javascript
// Middleware to check permissions
const checkPermission = (permission) => {
  return (req, res, next) => {
    const admin = req.admin; // From JWT token
    if (!admin || !admin.role || !admin.role.permissions[permission]) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        current: admin?.role?.name 
      });
    }
    next();
  };
};

// Usage in routes
router.post('/reports', checkPermission('canCreate'), createReport);
router.put('/reports/:id', checkPermission('canUpdate'), updateReport);
router.delete('/reports/:id', checkPermission('canDelete'), deleteReport);
```

### **3. Database Schema Requirements**

#### **Admin Model:**
```javascript
const AdminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### **AdminRole Model:**
```javascript
const AdminRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  description: { type: String },
  permissions: {
    canCreate: { type: Boolean, default: false },
    canRead: { type: Boolean, default: true },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});
```

#### **AdminLog Model (for audit trail):**
```javascript
const AdminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  action: { type: String, required: true }, // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'
  resource: { type: String, required: true }, // 'REPORT', 'ADMIN', 'USER', etc.
  resourceId: { type: String },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now },
  before: { type: Object }, // Previous state
  after: { type: Object }    // New state
});
```

### **4. API Endpoints with Role-Based Access**

#### **Reports API with Permissions:**
```javascript
// Reports endpoints with role-based access
router.get('/reports', 
  authenticateAdmin, 
  checkPermission('canRead'), 
  getReports
);

router.post('/reports', 
  authenticateAdmin, 
  checkPermission('canCreate'), 
  createReport
);

router.put('/reports/:id', 
  authenticateAdmin, 
  checkPermission('canUpdate'), 
  updateReport
);

router.delete('/reports/:id', 
  authenticateAdmin, 
  checkPermission('canDelete'), 
  deleteReport
);
```

#### **Admin Management API:**
```javascript
// Admin management endpoints
router.get('/admin-management/admins', 
  authenticateAdmin, 
  checkPermission('canRead'), 
  getAdmins
);

router.post('/admin-management/admins', 
  authenticateAdmin, 
  checkPermission('canCreate'), 
  createAdmin
);

router.put('/admin-management/admins/:id', 
  authenticateAdmin, 
  checkPermission('canUpdate'), 
  updateAdmin
);

router.delete('/admin-management/admins/:id', 
  authenticateAdmin, 
  checkPermission('canDelete'), 
  deleteAdmin
);
```

### **5. Middleware Stack**

#### **Authentication Middleware:**
```javascript
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.adminId).populate('roleId');
    
    if (!admin || !admin.isActive) {
      return res.status(401).json({ error: 'Invalid token or inactive admin.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
};
```

#### **Permission Middleware:**
```javascript
const checkPermission = (permission) => {
  return (req, res, next) => {
    const admin = req.admin;
    
    if (!admin || !admin.roleId || !admin.roleId.permissions[permission]) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        required: permission,
        currentRole: admin?.roleId?.name,
        message: 'You do not have permission to perform this action.'
      });
    }
    
    next();
  };
};
```

### **6. Response Format Standardization**

#### **Standardized API Responses:**
```javascript
// Success response format
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation completed successfully",
  "timestamp": "2023-11-05T10:30:00Z"
}

// Error response format
{
  "success": false,
  "error": "Insufficient permissions",
  "code": "PERMISSION_DENIED",
  "details": {
    "required": "canCreate",
    "current": "viewer"
  },
  "timestamp": "2023-11-05T10:30:00Z"
}
```

### **7. Database Seeding for Initial Setup**

#### **Default Roles Creation:**
```javascript
const seedDefaultRoles = async () => {
  const roles = [
    {
      name: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: true
      }
    },
    {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Standard admin access with most permissions',
      permissions: {
        canCreate: true,
        canRead: true,
        canUpdate: true,
        canDelete: false
      }
    },
    {
      name: 'viewer',
      displayName: 'Viewer',
      description: 'Read-only access to system data',
      permissions: {
        canCreate: false,
        canRead: true,
        canUpdate: false,
        canDelete: false
      }
    }
  ];

  for (const role of roles) {
    await AdminRole.findOneAndUpdate(
      { name: role.name },
      role,
      { upsert: true, new: true }
    );
  }
};
```

### **8. Security Considerations**

#### **Password Security:**
```javascript
const bcrypt = require('bcryptjs');

// Hash passwords before saving
admin.password = await bcrypt.hash(password, 12);

// Verify passwords
const isValid = await bcrypt.compare(password, admin.password);
```

#### **Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later.'
});

app.use('/api/admin/auth/login', loginLimiter);
```

### **9. API Documentation Structure**

#### **Endpoint Documentation:**
```javascript
/**
 * @route   GET /api/admin-management/admins
 * @desc    Get all admin users
 * @access  Private (Admin with canRead permission)
 * @headers Authorization: Bearer <token>
 * @query   page, limit, search, role
 * @returns { success: boolean, data: Admin[], total: number }
 */
```

## 🚀 **Implementation Priority**

### **Phase 1: Core Authentication**
1. Admin model and authentication
2. JWT token system
3. Basic role system
4. Login/logout endpoints

### **Phase 2: Role-Based Access**
1. Permission middleware
2. Role management endpoints
3. Protected route implementation
4. Admin management APIs

### **Phase 3: Advanced Features**
1. Audit logging system
2. Advanced permission checks
3. Role hierarchy
4. Security enhancements

## 📋 **Required Dependencies**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "express-rate-limit": "^6.10.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-validator": "^7.0.1"
  }
}
```

## 🔧 **Environment Variables**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/trafficslight

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=5

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📊 **Database Indexes**

```javascript
// Admin collection indexes
db.admins.createIndex({ "email": 1 }, { unique: true });
db.admins.createIndex({ "roleId": 1 });
db.admins.createIndex({ "isActive": 1 });

// AdminLog collection indexes
db.adminlogs.createIndex({ "adminId": 1 });
db.adminlogs.createIndex({ "timestamp": -1 });
db.adminlogs.createIndex({ "action": 1 });
db.adminlogs.createIndex({ "resource": 1 });
```

## 🛡️ **Security Best Practices**

1. **Password Hashing**: Use bcrypt with salt rounds ≥ 12
2. **JWT Security**: Use strong secrets and reasonable expiration times
3. **Rate Limiting**: Implement on authentication endpoints
4. **Input Validation**: Validate all inputs using express-validator
5. **CORS Configuration**: Restrict to trusted origins
6. **Helmet**: Use security headers
7. **Audit Logging**: Log all admin actions for security monitoring
8. **Role Hierarchy**: Implement proper role inheritance
9. **Session Management**: Implement token blacklisting for logout
10. **Error Handling**: Don't expose sensitive information in errors

This backend architecture will perfectly support your role-based frontend system, ensuring that viewers can only view data while admins have full access to create, update, and delete operations! 🎯

