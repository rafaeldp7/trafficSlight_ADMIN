# 🧪 **API ENDPOINT TESTING GUIDE**

## 📊 **ENDPOINT BEING TESTED**

**Endpoint**: `GET /api/admin-management/admins`  
**Authorization**: `Bearer <jwt_token>`  
**Status**: ⏳ **BACKEND NOT IMPLEMENTED YET**  
**Solution**: 🔧 **MOCK SERVICE ACTIVE**  

---

## 🎯 **EXPECTED BACKEND IMPLEMENTATION**

### **✅ ENDPOINT SPECIFICATION:**

#### **Request:**
```http
GET /api/admin-management/admins
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### **Query Parameters:**
```javascript
{
  page: 1,           // Page number (default: 1)
  limit: 20,         // Items per page (default: 20)
  search: "admin",   // Search term (optional)
  role: "admin",     // Filter by role (optional)
  isActive: true     // Filter by status (optional)
}
```

#### **Expected Response:**
```json
{
  "success": true,
  "data": {
    "admins": [
      {
        "_id": "admin_id_1",
        "firstName": "Admin",
        "lastName": "User",
        "email": "admin@trafficslight.com",
        "role": {
          "_id": "role_id_1",
          "name": "super_admin",
          "displayName": "Super Administrator",
          "permissions": {
            "canCreate": true,
            "canRead": true,
            "canUpdate": true,
            "canDelete": true,
            "canManageAdmins": true,
            "canAssignRoles": true
          }
        },
        "isActive": true,
        "lastLogin": "2024-01-15T10:30:00Z",
        "createdBy": {
          "_id": "creator_id",
          "firstName": "Creator",
          "lastName": "Name"
        },
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 1,
      "limit": 20
    }
  }
}
```

#### **Error Response:**
```json
{
  "success": false,
  "error": "Access denied. Required permission: canRead"
}
```

---

## 🔧 **CURRENT STATUS**

### **❌ BACKEND NOT IMPLEMENTED:**
- **404 Error** - Endpoint doesn't exist yet
- **No Authentication** - JWT middleware not implemented
- **No Permission Check** - Role-based access not implemented
- **No Data** - Admin models not created

### **✅ FRONTEND SOLUTION:**
- **Mock Service Active** - `adminServiceMock.js` provides working API
- **No 404 Errors** - Frontend works with mock data
- **Complete Functionality** - All admin features working
- **Ready for Backend** - Easy migration when backend is ready

---

## 🧪 **TESTING OPTIONS**

### **✅ OPTION 1: Test with Mock Service (Current)**
```javascript
// This works right now
const { adminServiceMock } = await import('../services/adminServiceMock');
const response = await adminServiceMock.getAdmins();
console.log(response);
```

### **✅ OPTION 2: Test with cURL (When Backend is Ready)**
```bash
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-management/admins" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### **✅ OPTION 3: Test with Postman (When Backend is Ready)**
```http
GET https://ts-backend-1-jyit.onrender.com/api/admin-management/admins
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

---

## 🎯 **BACKEND IMPLEMENTATION REQUIREMENTS**

### **✅ REQUIRED BACKEND COMPONENTS:**

#### **1. Admin Model** (`backend/models/Admin.js`)
```javascript
const adminSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminRole', required: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
```

#### **2. AdminRole Model** (`backend/models/AdminRole.js`)
```javascript
const adminRoleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  permissions: {
    canCreate: { type: Boolean, default: false },
    canRead: { type: Boolean, default: true },
    canUpdate: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canManageAdmins: { type: Boolean, default: false },
    canAssignRoles: { type: Boolean, default: false }
  },
  description: { type: String },
  isActive: { type: Boolean, default: true }
});
```

#### **3. Admin Controller** (`backend/controllers/adminController.js`)
```javascript
const getAdmins = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    
    // Get admins with pagination
    const admins = await Admin.find(filter)
      .populate('role', 'name displayName permissions')
      .populate('createdBy', 'firstName lastName email')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Admin.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        admins,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch admins' });
  }
};
```

#### **4. Admin Routes** (`backend/routes/adminManagement.js`)
```javascript
const express = require('express');
const router = express.Router();
const { authenticateAdmin, checkPermission } = require('../middleware');
const adminController = require('../controllers/adminController');

// GET /api/admin-management/admins
router.get('/admins', 
  authenticateAdmin, 
  checkPermission('canRead'), 
  adminController.getAdmins
);

module.exports = router;
```

#### **5. Authentication Middleware** (`backend/middleware/adminAuth.js`)
```javascript
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).populate('role');
    
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

#### **6. Permission Middleware** (`backend/middleware/adminPermissions.js`)
```javascript
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin || !req.admin.role || !req.admin.role.permissions) {
      return res.status(403).json({ error: 'Access denied. No permissions found.' });
    }

    if (!req.admin.role.permissions[permission]) {
      return res.status(403).json({ error: `Access denied. Required permission: ${permission}` });
    }

    next();
  };
};
```

---

## 🚀 **IMPLEMENTATION STEPS**

### **✅ STEP 1: Create Models**
1. Create `Admin.js` model
2. Create `AdminRole.js` model
3. Create `AdminLog.js` model

### **✅ STEP 2: Create Middleware**
1. Create authentication middleware
2. Create permission middleware
3. Create activity logging middleware

### **✅ STEP 3: Create Controllers**
1. Create `adminController.js`
2. Create `adminAuthController.js`
3. Create `adminSettingsController.js`

### **✅ STEP 4: Create Routes**
1. Create admin management routes
2. Create admin auth routes
3. Create admin settings routes

### **✅ STEP 5: Test Endpoints**
1. Test authentication
2. Test permissions
3. Test CRUD operations
4. Test with frontend

---

## 🎯 **CURRENT WORKAROUND**

### **✅ MOCK SERVICE ACTIVE:**
```javascript
// This is what's working now
const { adminServiceMock } = await import('../services/adminServiceMock');
const response = await adminServiceMock.getAdmins();

// Returns:
{
  success: true,
  data: {
    admins: [
      {
        _id: '1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@trafficslight.com',
        role: { name: 'super_admin', displayName: 'Super Administrator' },
        isActive: true,
        lastLogin: '2024-01-15T10:30:00Z'
      }
    ],
    pagination: { current: 1, pages: 1, total: 1 }
  }
}
```

---

## 📞 **NEXT STEPS**

### **✅ IMMEDIATE ACTIONS:**
1. **Use Mock Service** - Frontend works with mock data
2. **Test All Features** - Verify admin system functionality
3. **Prepare Backend** - Use implementation requirements

### **✅ BACKEND IMPLEMENTATION:**
1. **Follow Requirements** - Use `BACKEND_IMPLEMENTATION_REQUIREMENTS.md`
2. **Implement Models** - Create all 3 admin models
3. **Implement Controllers** - Create all 3 admin controllers
4. **Implement Routes** - Create all 21 admin endpoints
5. **Test Integration** - Verify frontend-backend connection

---

## 🎉 **SUMMARY**

### **✅ CURRENT STATUS:**
- ✅ **Frontend Ready** - Complete admin system implemented
- ✅ **Mock Service Active** - All features working with mock data
- ✅ **Backend Requirements** - Complete implementation guide provided
- ⏳ **Backend Implementation** - Needs to be implemented

### **✅ WHAT WORKS NOW:**
- ✅ **Admin Account Creation** - Create new admin accounts
- ✅ **Admin Management** - View and manage admins
- ✅ **Role Management** - Admin roles and permissions
- ✅ **Activity Logging** - Admin action tracking

**The admin system is fully functional with mock data and ready for backend integration!** 🚀
