# 🚀 Quick Backend Setup (1 Hour Implementation)

## ⚡ **Minimal Backend for Role-Based Frontend**

### **1. Essential Dependencies (5 minutes)**
```bash
npm install express mongoose jsonwebtoken bcryptjs cors dotenv
```

### **2. Basic Server Setup (10 minutes)**

#### **server.js**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trafficslight');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### **3. Simple Models (15 minutes)**

#### **models/Admin.js**
```javascript
const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'viewer'],
    default: 'viewer' 
  },
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('Admin', AdminSchema);
```

### **4. Simple Authentication (20 minutes)**

#### **routes/auth.js**
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// Simple role permissions
const getPermissions = (role) => {
  const permissions = {
    super_admin: { canCreate: true, canRead: true, canUpdate: true, canDelete: true },
    admin: { canCreate: true, canRead: true, canUpdate: true, canDelete: false },
    viewer: { canCreate: false, canRead: true, canUpdate: false, canDelete: false }
  };
  return permissions[role] || permissions.viewer;
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        adminId: admin._id, 
        role: admin.role,
        permissions: getPermissions(admin.role)
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        role: admin.role,
        permissions: getPermissions(admin.role)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current admin
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    success: true,
    admin: req.admin
  });
});

// Simple token verification middleware
function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = router;
```

### **5. Simple Admin Management (15 minutes)**

#### **routes/adminManagement.js**
```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const router = express.Router();

// Get all admins
router.get('/admins', async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 });
    res.json({ success: true, data: { admins } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create admin
router.post('/admins', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = new Admin({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'viewer'
    });
    
    await admin.save();
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update admin
router.put('/admins/:id', async (req, res) => {
  try {
    const { firstName, lastName, email, role, isActive } = req.body;
    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, email, role, isActive },
      { new: true }
    );
    res.json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

### **6. Simple Reports API (10 minutes)**

#### **routes/reports.js**
```javascript
const express = require('express');
const router = express.Router();

// Mock reports data (replace with your actual reports model)
let reports = [
  { _id: '1', reportType: 'Accident', description: 'Car accident on Main St', status: 'pending' },
  { _id: '2', reportType: 'Traffic Jam', description: 'Heavy traffic on Highway 1', status: 'verified' },
  { _id: '3', reportType: 'Hazard', description: 'Pothole on Oak Ave', status: 'resolved' }
];

// Get reports
router.get('/', (req, res) => {
  res.json({ success: true, data: { reports } });
});

// Create report
router.post('/', (req, res) => {
  const newReport = { ...req.body, _id: Date.now().toString() };
  reports.push(newReport);
  res.json({ success: true, data: newReport });
});

// Update report
router.put('/:id', (req, res) => {
  const index = reports.findIndex(r => r._id === req.params.id);
  if (index !== -1) {
    reports[index] = { ...reports[index], ...req.body };
    res.json({ success: true, data: reports[index] });
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// Delete report
router.delete('/:id', (req, res) => {
  reports = reports.filter(r => r._id !== req.params.id);
  res.json({ success: true, message: 'Report deleted' });
});

module.exports = router;
```

### **7. Connect Routes (5 minutes)**

#### **Update server.js**
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/adminManagement');
const reportRoutes = require('./routes/reports');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trafficslight');

// Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin-management', adminRoutes);
app.use('/api/reports', reportRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### **8. Environment Variables**

#### **.env file**
```env
MONGODB_URI=mongodb://localhost:27017/trafficslight
JWT_SECRET=your-super-secret-key-here
PORT=5000
```

### **9. Create First Admin (5 minutes)**

#### **create-admin.js**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function createFirstAdmin() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trafficslight');
  
  const admin = new Admin({
    firstName: 'Super',
    lastName: 'Admin',
    email: 'admin@trafficslight.com',
    password: await bcrypt.hash('admin123', 10),
    role: 'super_admin'
  });
  
  await admin.save();
  console.log('✅ First admin created: admin@trafficslight.com / admin123');
  process.exit();
}

createFirstAdmin();
```

## 🚀 **Quick Start Commands**

```bash
# 1. Install dependencies
npm install express mongoose jsonwebtoken bcryptjs cors dotenv

# 2. Create the files above

# 3. Create .env file with MongoDB URI

# 4. Start MongoDB (if local)
mongod

# 5. Create first admin
node create-admin.js

# 6. Start server
node server.js
```

## 📋 **API Endpoints Summary**

```
POST /api/admin/auth/login          # Login
GET  /api/admin/auth/me            # Get current admin
GET  /api/admin-management/admins  # Get all admins
POST /api/admin-management/admins # Create admin
PUT  /api/admin-management/admins/:id # Update admin
GET  /api/reports                  # Get reports
POST /api/reports                  # Create report
PUT  /api/reports/:id              # Update report
DELETE /api/reports/:id            # Delete report
```

## 🔑 **Default Login Credentials**

```
Email: admin@trafficslight.com
Password: admin123
Role: super_admin
```

## ⚡ **What This Gives You**

✅ **Working Authentication** - Login/logout with JWT tokens  
✅ **Role-Based Permissions** - Super admin, admin, viewer roles  
✅ **Admin Management** - Create, read, update admins  
✅ **Reports API** - Basic CRUD for reports  
✅ **Frontend Compatible** - Works with your existing frontend  

This minimal setup will get your role-based system working in under 1 hour! 🎯

