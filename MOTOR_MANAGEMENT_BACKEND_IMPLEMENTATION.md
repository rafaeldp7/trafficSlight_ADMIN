# Motor Management Backend Implementation & Fixes

## Overview
This document outlines the issues found with the motor management system and provides comprehensive fixes for both frontend-backend compatibility and logging implementation.

## Issues Identified

### 1. **API Endpoint Mismatch**
- **Frontend calls:** `/api/motorcycles`
- **Backend routes:** `/api/motors`
- **Issue:** Complete mismatch causing 404 errors

### 2. **Response Format Mismatch**
- **Frontend expects:** Simple array `[{...}, {...}]`
- **Backend returns:** Structured response `{ success: true, data: { motors: [...] } }`
- **Issue:** Frontend can't parse the data correctly

### 3. **Missing Authentication**
- **Frontend:** No authentication headers
- **Backend:** All routes require `authenticateAdmin`
- **Issue:** 401 Unauthorized errors

### 4. **Missing Restore Functionality**
- **Frontend:** Calls `/restore/:id` endpoint
- **Backend:** No restore endpoint exists
- **Issue:** Restore functionality fails

### 5. **Missing Logging**
- **Current:** No admin action logging
- **Required:** Comprehensive logging for all operations

## Files to Fix

### 1. Backend Route Fix (`backend/routes/motors.js`)

**Current Issues:**
```javascript
// Missing restore endpoint
// All routes require admin auth but frontend doesn't send auth headers
```

**Fixed Version:**
```javascript
const express = require('express');
const router = express.Router();
const motorController = require('../controllers/motorController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// Public routes (for basic operations)
router.get('/', motorController.getMotors);
router.get('/stats', motorController.getMotorStats);
router.get('/brand/:brand', motorController.getMotorsByBrand);
router.get('/user/:userId', motorController.getUserMotors);
router.get('/:id', motorController.getMotor);

// Admin routes (require authentication)
router.post('/', authenticateAdmin, motorController.createMotor);
router.put('/:id', authenticateAdmin, motorController.updateMotor);
router.delete('/:id', authenticateAdmin, motorController.deleteMotor);
router.put('/restore/:id', authenticateAdmin, motorController.restoreMotor);

module.exports = router;
```

### 2. Backend Controller Fix (`backend/controllers/motorController.js`)

**Current Issues:**
- Response format doesn't match frontend expectations
- Missing restore functionality
- No logging implementation

**Fixed Version:**

```javascript
const Motor = require('../../../models/Motor');
const UserMotor = require('../../../models/userMotorModel');
const { logAdminAction } = require('./adminLogsController');

// Get all motors (public route - returns simple array for frontend compatibility)
const getMotors = async (req, res) => {
  try {
    const motors = await Motor.find({ isDeleted: { $ne: true } })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Return simple array for frontend compatibility
    res.json(motors);
  } catch (error) {
    console.error('Get motors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motors',
      error: error.message
    });
  }
};

// Get single motor
const getMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id).populate('owner', 'firstName lastName email');

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

// Create motor (admin only)
const createMotor = async (req, res) => {
  try {
    const { brand, model, year, plateNumber, color, engineSize, fuelType, ownerId } = req.body;

    // Check if plate number already exists
    if (plateNumber) {
      const existingMotor = await Motor.findOne({ plateNumber });
      if (existingMotor) {
        return res.status(400).json({
          success: false,
          message: 'Motor with this plate number already exists'
        });
      }
    }

    const motor = new Motor({
      brand,
      model,
      year,
      plateNumber,
      color,
      engineSize,
      fuelType,
      owner: ownerId,
      isActive: true,
      isDeleted: false
    });

    await motor.save();

    // If owner is specified, create user-motor relationship
    if (ownerId) {
      const userMotor = new UserMotor({
        userId: ownerId,
        motorId: motor._id,
        isPrimary: true
      });
      await userMotor.save();
    }

    // Log the motor creation action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'CREATE',
        'MOTOR',
        {
          description: `Created new motor: ${motor.brand} ${motor.model} (${motor.plateNumber})`,
          motorId: motor._id,
          motorBrand: motor.brand,
          motorModel: motor.model,
          motorPlateNumber: motor.plateNumber,
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

// Update motor (admin only)
const updateMotor = async (req, res) => {
  try {
    const { brand, model, year, plateNumber, color, engineSize, fuelType, isActive } = req.body;

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
      year: motor.year,
      plateNumber: motor.plateNumber,
      color: motor.color,
      engineSize: motor.engineSize,
      fuelType: motor.fuelType,
      isActive: motor.isActive
    };

    // Update fields
    if (brand) motor.brand = brand;
    if (model) motor.model = model;
    if (year) motor.year = year;
    if (plateNumber) motor.plateNumber = plateNumber;
    if (color) motor.color = color;
    if (engineSize) motor.engineSize = engineSize;
    if (fuelType) motor.fuelType = fuelType;
    if (isActive !== undefined) motor.isActive = isActive;

    await motor.save();

    // Log the motor update action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'MOTOR',
        {
          description: `Updated motor: ${motor.brand} ${motor.model} (${motor.plateNumber})`,
          motorId: motor._id,
          motorBrand: motor.brand,
          motorModel: motor.model,
          motorPlateNumber: motor.plateNumber,
          changes: {
            before: originalData,
            after: {
              brand: motor.brand,
              model: motor.model,
              year: motor.year,
              plateNumber: motor.plateNumber,
              color: motor.color,
              engineSize: motor.engineSize,
              fuelType: motor.fuelType,
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

// Delete motor (admin only) - Soft delete
const deleteMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id);
    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    // Store motor data for logging before deletion
    const deletedMotorData = {
      id: motor._id,
      brand: motor.brand,
      model: motor.model,
      plateNumber: motor.plateNumber,
      owner: motor.owner
    };

    // Soft delete - mark as deleted instead of removing
    motor.isDeleted = true;
    motor.deletedAt = new Date();
    motor.deletedBy = req.user?.id;
    await motor.save();

    // Log the motor deletion action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'DELETE',
        'MOTOR',
        {
          description: `Deleted motor: ${deletedMotorData.brand} ${deletedMotorData.model} (${deletedMotorData.plateNumber})`,
          motorId: deletedMotorData.id,
          motorBrand: deletedMotorData.brand,
          motorModel: deletedMotorData.model,
          motorPlateNumber: deletedMotorData.plateNumber,
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

// Restore motor (admin only)
const restoreMotor = async (req, res) => {
  try {
    const motor = await Motor.findById(req.params.id);
    if (!motor) {
      return res.status(404).json({
        success: false,
        message: 'Motor not found'
      });
    }

    // Store motor data for logging
    const restoredMotorData = {
      id: motor._id,
      brand: motor.brand,
      model: motor.model,
      plateNumber: motor.plateNumber
    };

    // Restore motor
    motor.isDeleted = false;
    motor.restoredAt = new Date();
    motor.restoredBy = req.user?.id;
    await motor.save();

    // Log the motor restoration action
    if (req.user?.id) {
      await logAdminAction(
        req.user.id,
        'UPDATE',
        'MOTOR',
        {
          description: `Restored motor: ${restoredMotorData.brand} ${restoredMotorData.model} (${restoredMotorData.plateNumber})`,
          motorId: restoredMotorData.id,
          motorBrand: restoredMotorData.brand,
          motorModel: restoredMotorData.model,
          motorPlateNumber: restoredMotorData.plateNumber,
          action: 'restore'
        },
        req
      );
    }

    res.json({
      success: true,
      message: 'Motor restored successfully',
      data: { motor }
    });
  } catch (error) {
    console.error('Restore motor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore motor',
      error: error.message
    });
  }
};

// Get motor statistics
const getMotorStats = async (req, res) => {
  try {
    const totalMotors = await Motor.countDocuments({ isDeleted: { $ne: true } });
    const activeMotors = await Motor.countDocuments({ isActive: true, isDeleted: { $ne: true } });
    const deletedMotors = await Motor.countDocuments({ isDeleted: true });
    const newMotorsThisMonth = await Motor.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      },
      isDeleted: { $ne: true }
    });

    // Get motors by brand
    const motorsByBrand = await Motor.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Get motors by year
    const motorsByYear = await Motor.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$year',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);

    // Get motors by fuel type
    const motorsByFuelType = await Motor.aggregate([
      { $match: { isDeleted: { $ne: true } } },
      {
        $group: {
          _id: '$fuelType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overall: {
          totalMotors,
          activeMotors,
          inactiveMotors: totalMotors - activeMotors,
          deletedMotors,
          newMotorsThisMonth
        },
        distribution: {
          byBrand: motorsByBrand,
          byYear: motorsByYear,
          byFuelType: motorsByFuelType
        }
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

// Get motors by brand
const getMotorsByBrand = async (req, res) => {
  try {
    const { brand } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const motors = await Motor.find({ 
      brand: new RegExp(brand, 'i'),
      isDeleted: { $ne: true }
    })
      .populate('owner', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Motor.countDocuments({ 
      brand: new RegExp(brand, 'i'),
      isDeleted: { $ne: true }
    });

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
    console.error('Get motors by brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get motors by brand',
      error: error.message
    });
  }
};

// Get user motors
const getUserMotors = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const userMotors = await UserMotor.find({ userId })
      .populate('motorId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await UserMotor.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        userMotors,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get user motors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user motors',
      error: error.message
    });
  }
};

module.exports = {
  getMotors,
  getMotor,
  createMotor,
  updateMotor,
  deleteMotor,
  restoreMotor,
  getMotorStats,
  getMotorsByBrand,
  getUserMotors
};
```

### 3. Frontend Fix (`src/scenes/addMotor/index.jsx`)

**Current Issues:**
- Wrong API endpoint (`/api/motorcycles` instead of `/api/motors`)
- No authentication headers
- Expects simple array but backend returns structured response

**Fixed Version:**

```javascript
// Update the API_URL
const API_URL = "https://ts-backend-1-jyit.onrender.com/api/motors";

// Update fetchMotors to handle structured response
const fetchMotors = async () => {
  try {
    const token = localStorage.getItem('adminToken');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(API_URL, { headers });
    const data = await res.json();
    
    // Handle both simple array and structured response
    if (Array.isArray(data)) {
      setMotors(data);
    } else if (data.success && data.data && data.data.motors) {
      setMotors(data.data.motors);
    } else {
      setMotors([]);
    }
  } catch (err) {
    console.error("Failed to fetch motorcycles:", err);
    setMotors([]);
  }
};

// Update handleSubmit to include authentication
const handleSubmit = async (e) => {
  e.preventDefault();
  const {
    model,
    engineDisplacement,
    power,
    torque,
    fuelTank,
    fuelConsumption,
  } = formData;

  if (!model || !fuelConsumption || parseFloat(fuelConsumption) <= 0) {
    setMessage("❌ Model and a valid positive Fuel Consumption are required.");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const token = localStorage.getItem('adminToken');
    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `${API_URL}/${editingId}` : API_URL;

    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify({
        model,
        brand: "Generic", // Add required brand field
        engineDisplacement: engineDisplacement ? parseFloat(engineDisplacement) : undefined,
        power,
        torque,
        fuelTank: fuelTank ? parseFloat(fuelTank) : undefined,
        fuelConsumption: parseFloat(fuelConsumption),
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setMessage(editingId ? "✅ Motorcycle updated!" : "✅ Motorcycle added!");
      setFormData({
        model: "",
        engineDisplacement: "",
        power: "",
        torque: "",
        fuelTank: "",
        fuelConsumption: "",
      });
      setEditingId(null);
      fetchMotors();
    } else {
      setMessage(data?.message || data?.msg || "❌ Failed to save motorcycle.");
    }
  } catch (error) {
    console.error("Submit error:", error);
    setMessage("❌ Server error.");
  }

  setLoading(false);
};

// Update handleDelete to include authentication
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this motor?")) return;
  try {
    const token = localStorage.getItem('adminToken');
    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/${id}`, { 
      method: "DELETE",
      headers
    });
    
    if (res.ok) {
      setMessage("✅ Motorcycle deleted.");
      fetchMotors();
    } else {
      const data = await res.json();
      setMessage(data?.message || "❌ Failed to delete.");
    }
  } catch (err) {
    console.error("Delete error:", err);
    setMessage("❌ Failed to delete.");
  }
};

// Update handleRestore to include authentication
const handleRestore = async (id) => {
  try {
    const token = localStorage.getItem('adminToken');
    const headers = {
      "Content-Type": "application/json"
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}/restore/${id}`, { 
      method: "PUT",
      headers
    });
    
    if (res.ok) {
      setMessage("✅ Motorcycle restored.");
      fetchMotors();
    } else {
      const data = await res.json();
      setMessage(data?.message || "❌ Failed to restore.");
    }
  } catch (err) {
    console.error("Restore error:", err);
    setMessage("❌ Failed to restore.");
  }
};
```

## Implementation Steps

### Step 1: Update Backend Routes
1. Replace `backend/routes/motors.js` with the fixed version
2. Ensure the route is mounted as `/api/motors` in your main app

### Step 2: Update Backend Controller
1. Replace `backend/controllers/motorController.js` with the fixed version
2. Ensure `adminLogsController.js` exists with `logAdminAction` function

### Step 3: Update Frontend
1. Update `src/scenes/addMotor/index.jsx` with the fixed version
2. Change API_URL from `/api/motorcycles` to `/api/motors`
3. Add authentication headers to all requests

### Step 4: Update Motor Model (if needed)
Ensure your Motor model includes these fields:
```javascript
{
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  restoredAt: { type: Date },
  restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}
```

## Testing Checklist

### ✅ Backend Testing
- [ ] GET `/api/motors` returns simple array
- [ ] POST `/api/motors` creates motor with logging
- [ ] PUT `/api/motors/:id` updates motor with logging
- [ ] DELETE `/api/motors/:id` soft deletes motor with logging
- [ ] PUT `/api/motors/restore/:id` restores motor with logging

### ✅ Frontend Testing
- [ ] Page loads and displays motors
- [ ] Add new motor works
- [ ] Edit motor works
- [ ] Delete motor works (soft delete)
- [ ] Restore motor works
- [ ] Search functionality works
- [ ] Pagination works

### ✅ Logging Testing
- [ ] All admin actions are logged
- [ ] Log entries appear in Admin Logs page
- [ ] Before/after changes are captured
- [ ] IP addresses are tracked

## Route Mounting Verification

Ensure your main app file includes:
```javascript
const motorRoutes = require('./routes/motors');
app.use('/api/motors', motorRoutes);
```

## Security Considerations

- Public routes (GET) don't require authentication for basic viewing
- Admin routes (POST, PUT, DELETE) require authentication
- All admin actions are logged for audit trails
- Soft delete preserves data integrity

## Performance Optimizations

- Soft delete instead of hard delete
- Proper indexing on `isDeleted` field
- Pagination for large datasets
- Efficient aggregation queries for statistics

---

**Note:** This implementation provides complete compatibility between frontend and backend while adding comprehensive logging and proper error handling.
