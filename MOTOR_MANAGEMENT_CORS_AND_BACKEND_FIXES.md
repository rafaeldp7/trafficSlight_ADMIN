# Motor Management CORS and Backend Fixes

## 🚨 **Current Issues**

### **Console Errors:**
1. **CORS Policy Error:** `No 'Access-Control-Allow-Origin' header is present`
2. **Bad Gateway Error (502):** `GET https://ts-backend-1-jyit.onrender.com/api/admin-motors net::ERR_FAILED 502`
3. **Failed to Fetch:** `TypeError: Failed to fetch`

---

## 🔧 **Backend Fixes Required**

### **1. CORS Configuration**

**File:** `backend/server.js` or `backend/app.js`

**Add CORS middleware:**
```javascript
const cors = require('cors');

// Enable CORS for all routes
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://your-frontend-domain.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// Handle preflight requests
app.options('*', cors());
```

### **2. Motor Routes Configuration**

**File:** `backend/routes/motors.js` or `backend/routes/adminMotors.js`

**Ensure routes are properly mounted:**
```javascript
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/adminAuth');
const motorController = require('../controllers/motorController');

// Admin motor routes
router.get('/', authenticateAdmin, motorController.getMotors);
router.get('/stats', authenticateAdmin, motorController.getMotorStats);
router.get('/:id', authenticateAdmin, motorController.getMotor);
router.post('/', authenticateAdmin, motorController.createMotor);
router.put('/:id', authenticateAdmin, motorController.updateMotor);
router.delete('/:id', authenticateAdmin, motorController.deleteMotor);

module.exports = router;
```

**File:** `backend/server.js` or `backend/app.js`

**Mount the routes:**
```javascript
const motorRoutes = require('./routes/motors'); // or adminMotors
app.use('/api/admin-motors', motorRoutes);
```

### **3. Motor Controller Implementation**

**File:** `backend/controllers/motorController.js`

**Complete implementation:**
```javascript
const Motor = require('../models/Motor');
const User = require('../models/User');
const { logAdminAction } = require('./adminLogsController');

// Get all motors with filtering and pagination
const getMotors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, brand, model, year, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { nickname: new RegExp(search, 'i') },
        { licensePlate: new RegExp(search, 'i') }
      ];
    }
    
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (year) filter.year = parseInt(year);
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const motors = await Motor.find(filter)
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Motor.countDocuments(filter);

    res.json({
      success: true,
      data: {
        motors,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get motors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motors',
      error: error.message
    });
  }
};

// Get motor statistics
const getMotorStats = async (req, res) => {
  try {
    const totalMotors = await Motor.countDocuments();
    const activeMotors = await Motor.countDocuments({ isActive: true });
    const deletedMotors = await Motor.countDocuments({ isActive: false });

    res.json({
      success: true,
      data: {
        totalMotors,
        activeMotors,
        deletedMotors
      }
    });
  } catch (error) {
    console.error('Get motor stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motor statistics',
      error: error.message
    });
  }
};

// Get single motor
const getMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id)
      .populate('owner', 'firstName lastName email phone');

    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    res.json({
      success: true,
      data: { motor }
    });
  } catch (error) {
    console.error('Get motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motor',
      error: error.message
    });
  }
};

// Create new motor
const createMotor = async (req, res) => {
  try {
    const motorData = {
      ...req.body,
      owner: req.user.id
    };

    const motor = new Motor(motorData);
    await motor.save();

    // Populate owner information
    await motor.populate('owner', 'firstName lastName email');

    // Log the motor creation action (only for admins)
    if (req.user?.isAdmin && req.user?.id) {
      await logAdminAction(
        req.user.id,
        'CREATE',
        'MOTOR',
        {
          description: `Created motor: "${motor.brand} ${motor.model}" (ID: ${motor._id})`,
          motorId: motor._id,
          motorBrand: motor.brand,
          motorModel: motor.model,
          motorNickname: motor.nickname,
          motorOwner: motor.owner
        },
        req
      );
    }

    res.status(201).json({
      success: true,
      message: 'Motor created successfully',
      data: { motor }
    });
  } catch (error) {
    console.error('Create motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create motor',
      error: error.message
    });
  }
};

// Update motor
const updateMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id);

    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    // Store original data for logging
    const originalData = {
      brand: motor.brand,
      model: motor.model,
      nickname: motor.nickname,
      year: motor.year,
      licensePlate: motor.licensePlate,
      fuelTank: motor.fuelTank,
      fuelConsumption: motor.fuelConsumption,
      isActive: motor.isActive
    };

    // Check if user can update (only owner or admin)
    if (motor.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this motor'
      });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        motor[key] = req.body[key];
      }
    });

    await motor.save();

    // Log the motor update action (only for admins)
    if (req.user?.isAdmin && req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'MOTOR',
        {
          description: `Updated motor: "${motor.brand} ${motor.model}" (ID: ${motor._id})`,
          motorId: motor._id,
          motorBrand: motor.brand,
          motorModel: motor.model,
          changes: {
            before: originalData,
            after: {
              brand: motor.brand,
              model: motor.model,
              nickname: motor.nickname,
              year: motor.year,
              licensePlate: motor.licensePlate,
              fuelTank: motor.fuelTank,
              fuelConsumption: motor.fuelConsumption,
              isActive: motor.isActive
            }
          }
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Motor updated successfully',
      data: { motor }
    });
  } catch (error) {
    console.error('Update motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update motor',
      error: error.message
    });
  }
};

// Delete motor (soft delete)
const deleteMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id);

    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    // Check if user can delete (only owner or admin)
    if (motor.owner.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this motor'
      });
    }

    // Store motor data for logging before deletion
    const deletedMotorData = {
      id: motor._id,
      brand: motor.brand,
      model: motor.model,
      nickname: motor.nickname,
      owner: motor.owner
    };

    // Soft delete - set isActive to false
    motor.isActive = false;
    motor.deletedAt = new Date();
    await motor.save();

    // Log the motor deletion action (only for admins)
    if (req.user?.isAdmin && req.user?.id) {
      await logAdminAction(
        req.user.id,
        'DELETE',
        'MOTOR',
        {
          description: `Deleted motor: "${deletedMotorData.brand} ${deletedMotorData.model}" (ID: ${deletedMotorData.id})`,
          motorId: deletedMotorData.id,
          motorBrand: deletedMotorData.brand,
          motorModel: deletedMotorData.model,
          motorNickname: deletedMotorData.nickname,
          motorOwner: deletedMotorData.owner
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Motor deleted successfully'
    });
  } catch (error) {
    console.error('Delete motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete motor',
      error: error.message
    });
  }
};

module.exports = {
  getMotors,
  getMotorStats,
  getMotor,
  createMotor,
  updateMotor,
  deleteMotor
};
```

### **4. Motor Model**

**File:** `backend/models/Motor.js`

**Ensure model exists:**
```javascript
const mongoose = require('mongoose');

const motorSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  nickname: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  licensePlate: {
    type: String,
    trim: true,
    uppercase: true
  },
  fuelTank: {
    type: Number,
    min: 0
  },
  fuelConsumption: {
    type: Number,
    min: 0
  },
  currentFuelLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  odometer: {
    type: Number,
    min: 0,
    default: 0
  },
  analytics: {
    totalTrips: { type: Number, default: 0 },
    totalDistance: { type: Number, default: 0 },
    totalFuelUsed: { type: Number, default: 0 },
    averageFuelEfficiency: { type: Number, default: 0 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
motorSchema.index({ owner: 1 });
motorSchema.index({ brand: 1 });
motorSchema.index({ model: 1 });
motorSchema.index({ isActive: 1 });

module.exports = mongoose.model('Motor', motorSchema);
```

---

## 🚀 **Frontend Fixes**

### **1. Error Handling Enhancement**

**File:** `src/scenes/addMotor/index.jsx`

**Update the fetchMotors function:**
```javascript
const fetchMotors = async () => {
  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      console.error("No admin token found");
      setMotors([]);
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    console.log('Fetching motors from:', API_URL);
    console.log('Headers:', headers);

    const res = await fetch(API_URL, { headers });
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();
    console.log('Response data:', data);
    
    // Handle structured response from backend
    if (data.success && data.data && data.data.motors) {
      console.log('Using structured response, motors:', data.data.motors);
      setMotors(data.data.motors);
    } else if (data.success && data.data && Array.isArray(data.data)) {
      console.log('Using structured response with direct data array:', data.data);
      setMotors(data.data);
    } else if (Array.isArray(data)) {
      console.log('Using array response, motors:', data);
      setMotors(data);
    } else {
      console.error('Unexpected response format:', data);
      setMotors([]);
    }
  } catch (err) {
    console.error("Failed to fetch motorcycles:", err);
    
    // Show user-friendly error message
    if (err.message.includes('CORS')) {
      console.error("CORS error: Backend server needs CORS configuration");
    } else if (err.message.includes('502')) {
      console.error("502 Bad Gateway: Backend server is down or overloaded");
    } else if (err.message.includes('Failed to fetch')) {
      console.error("Network error: Check backend server status");
    }
    
    setMotors([]);
  }
};
```

### **2. Add Loading States**

**Add loading state:**
```javascript
const [loading, setLoading] = useState(false);

const fetchMotors = async () => {
  setLoading(true);
  try {
    // ... existing fetch logic
  } catch (err) {
    // ... error handling
  } finally {
    setLoading(false);
  }
};
```

---

## 🔍 **Debugging Steps**

### **1. Check Backend Server Status**
```bash
# Test if backend is responding
curl -X GET https://ts-backend-1-jyit.onrender.com/api/admin-motors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **2. Check CORS Headers**
```bash
# Test CORS preflight
curl -X OPTIONS https://ts-backend-1-jyit.onrender.com/api/admin-motors \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

### **3. Frontend Network Tab**
- Open browser DevTools → Network tab
- Try to fetch motors
- Check if request is being made
- Look at response headers

---

## ✅ **Quick Fix Checklist**

### **Backend:**
- [ ] Add CORS middleware to server
- [ ] Ensure `/api/admin-motors` route is mounted
- [ ] Implement `motorController.getMotors`
- [ ] Check server is running on Render.com
- [ ] Verify admin authentication middleware

### **Frontend:**
- [ ] Add better error handling
- [ ] Add loading states
- [ ] Check admin token is valid
- [ ] Verify API URL is correct

---

## 🎯 **Expected Results After Fix**

✅ **No CORS errors**  
✅ **Successful API calls**  
✅ **Motor data loads**  
✅ **Statistics show correct counts**  
✅ **Add/Edit/Delete functions work**  
✅ **Admin logs track motor actions**  

---

**The main issue is your backend server is returning 502 Bad Gateway, which means it's either down or having internal errors. Fix the backend first, then add CORS configuration!** 🚀
