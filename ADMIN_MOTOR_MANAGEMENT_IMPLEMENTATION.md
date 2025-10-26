# Admin Motor Management Implementation

## 📋 **Overview**
This document outlines the implementation of the admin motor management controller that provides all data needed for the Motor Management scenes in the frontend (Add Motor, User Motor Management).

---

## 🎯 **Purpose**
The `/api/admin-motors` endpoint provides administrators with the ability to:
- View all registered motorcycles
- Filter and search motorcycles by brand, model, year
- Manage user motorcycle assignments
- Track motorcycle analytics (fuel efficiency, trips, distance)
- Update motor details
- Delete motors
- View motor statistics

---

## 📁 **Files Involved**

### **1. `backend/controllers/motorController.js`**
- Contains all motor management logic
- Handles CRUD operations for motors
- Provides statistics and analytics

### **2. `backend/models/Motor.js`**
- Motor schema definition
- Stores motorcycle information
- User-motor relationships

### **3. `backend/models/userMotorModel.js`**
- User-motor association model
- Stores user preferences and analytics
- Links users to their motorcycles

---

## 🔧 **Implementation Details**

### **Updated `getMotors` Function:**

The controller already exists but should be updated to handle user motor data properly. Here's the enhanced version:

```javascript
// Get all motors (admin only)
const getMotors = async (req, res) => {
  try {
    const { page = 1, limit = 1000, search, brand, model, year } = req.query;

    // Build filter
    const filter = {};
    if (search) {
      filter.$or = [
        { brand: new RegExp(search, 'i') },
        { model: new RegExp(search, 'i') },
        { licensePlate: new RegExp(search, 'i') },
        { nickname: new RegExp(search, 'i') }
      ];
    }
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (year) filter.year = parseInt(year);

    // Fetch motors with populated user data
    const motors = await Motor.find(filter)
      .populate('userId', 'firstName lastName email city barangay')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Motor.countDocuments(filter);

    // Transform motors data for frontend compatibility
    const transformedMotors = motors.map(motor => ({
      _id: motor._id,
      id: motor.id || motor._id,
      userId: motor.userId,
      user: motor.userId ? {
        _id: motor.userId._id,
        firstName: motor.userId.firstName,
        lastName: motor.userId.lastName,
        email: motor.userId.email,
        city: motor.userId.city,
        barangay: motor.userId.barangay
      } : null,
      nickname: motor.nickname,
      brand: motor.brand,
      model: motor.model,
      year: motor.year,
      color: motor.color,
      licensePlate: motor.licensePlate,
      fuelTank: motor.fuelTank,
      fuelConsumption: motor.fuelConsumption || motor.fuelEfficiency,
      currentFuelLevel: motor.currentFuelLevel,
      odometer: motor.odometer,
      analytics: motor.analytics || {
        totalDistance: 0,
        totalTrips: 0,
        tripsCompleted: 0,
        totalFuelUsed: 0,
        avgFuelEfficiency: 0
      },
      isActive: motor.isActive,
      notes: motor.notes,
      createdAt: motor.createdAt,
      updatedAt: motor.updatedAt
    }));

    res.json({
      success: true,
      data: {
        motors: transformedMotors,
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
```

---

## 🔌 **API Endpoint Reference**

### **Base URL:** `/api/admin-motors`

### **Endpoints:**

#### **Get All Motors:**
```
GET /api/admin-motors
```

#### **Get Single Motor:**
```
GET /api/admin-motors/:id
```

#### **Create Motor:**
```
POST /api/admin-motors
```

#### **Update Motor:**
```
PUT /api/admin-motors/:id
```

#### **Delete Motor:**
```
DELETE /api/admin-motors/:id
```

#### **Get Motor Statistics:**
```
GET /api/admin-motors/stats
```

#### **Get Motors by Brand:**
```
GET /api/admin-motors/brand/:brand
```

#### **Get User Motors:**
```
GET /api/admin-motors/user/:userId
```

### **Authentication Required:**
- Admin JWT Token in Authorization header

### **Headers:**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${adminToken}`
}
```

### **Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | Number | 1 | Page number for pagination |
| `limit` | Number | 1000 | Number of motors per page |
| `search` | String | - | Search in brand, model, plate number, nickname |
| `brand` | String | - | Filter by brand |
| `model` | String | - | Filter by model |
| `year` | Number | - | Filter by year |

---

## 📊 **Response Format**

### **Success Response:**
```json
{
  "success": true,
  "data": {
    "motors": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "id": "M001",
        "userId": "507f1f77bcf86cd799439012",
        "user": {
          "_id": "507f1f77bcf86cd799439012",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "city": "Manila",
          "barangay": "Makati"
        },
        "nickname": "My Ride",
        "brand": "Honda",
        "model": "Wave 100",
        "year": 2020,
        "color": "Red",
        "licensePlate": "ABC-1234",
        "fuelTank": 4.2,
        "fuelConsumption": 50,
        "currentFuelLevel": 75,
        "odometer": 15000,
        "analytics": {
          "totalDistance": 15000,
          "totalTrips": 450,
          "tripsCompleted": 450,
          "totalFuelUsed": 300,
          "avgFuelEfficiency": 50
        },
        "isActive": true,
        "notes": "Regular maintenance done",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 1,
      "total": 250
    }
  }
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Failed to get motors",
  "error": "Detailed error message"
}
```

---

## 🎨 **Frontend Integration**

### **How the Frontend Uses This Data:**

The motor management scenes expect:
1. **Motor List**: Array of motor objects
2. **Motor Fields**:
   - `id` or `_id` for unique identifier
   - `nickname` for display name
   - `brand` and `model` for motorcycle details
   - `year`, `color`, `licensePlate` for identification
   - `fuelTank`, `fuelConsumption` for fuel tracking
   - `currentFuelLevel` for fuel status
   - `odometer` for mileage tracking
   - `userId` and `user` for owner information
   - `analytics` for statistics
   - `isActive` for status display
   - `createdAt` for registration date

### **Frontend Code Example:**
```javascript
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
    
    // Handle structured response from backend
    if (data.success && data.data && data.data.motors) {
      setMotors(data.data.motors);
    } else if (data.success && data.data && Array.isArray(data.data)) {
      setMotors(data.data);
    } else if (Array.isArray(data)) {
      setMotors(data);
    } else {
      console.error('Unexpected response format:', data);
      setMotors([]);
    }
  } catch (err) {
    console.error("Failed to fetch motors:", err);
    setMotors([]);
  }
};
```

---

## 🔍 **Use Cases**

### **1. Get All Motors:**
```bash
GET /api/admin-motors
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### **2. Search Motors:**
```bash
GET /api/admin-motors?search=honda
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### **3. Filter by Brand:**
```bash
GET /api/admin-motors?brand=Honda
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### **4. Filter by Model:**
```bash
GET /api/admin-motors?model=Wave
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### **5. Get User Motors:**
```bash
GET /api/admin-motors/user/507f1f77bcf86cd799439012
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### **6. Get Motor Statistics:**
```bash
GET /api/admin-motors/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### **7. Combined Filters:**
```bash
GET /api/admin-motors?brand=Honda&year=2020&search=wave
Authorization: Bearer YOUR_ADMIN_TOKEN
```

---

## 📈 **Statistics & Analytics**

### **Get Motor Statistics:**
```bash
GET /api/admin-motors/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overall": {
      "totalMotors": 1250,
      "activeMotors": 1100,
      "inactiveMotors": 150,
      "newMotorsThisMonth": 45
    },
    "distribution": {
      "byBrand": [
        { "_id": "Honda", "count": 450 },
        { "_id": "Yamaha", "count": 380 },
        { "_id": "Suzuki", "count": 320 }
      ],
      "byYear": [
        { "_id": 2024, "count": 120 },
        { "_id": 2023, "count": 200 },
        { "_id": 2022, "count": 180 }
      ],
      "byFuelType": [
        { "_id": "Gasoline", "count": 1150 },
        { "_id": "Diesel", "count": 100 }
      ]
    }
  }
}
```

---

## 🏗️ **Motor Data Model**

### **Motor Schema:**
```javascript
{
  userId: ObjectId,           // User who owns this motor
  nickname: String,           // Custom name (e.g., "My Ride")
  brand: String,              // Brand (Honda, Yamaha, etc.)
  model: String,              // Model name
  year: Number,               // Manufacturing year
  color: String,              // Color
  licensePlate: String,       // License plate number
  fuelTank: Number,           // Tank capacity in liters
  fuelConsumption: Number,    // Fuel efficiency (km/L)
  fuelEfficiency: Number,      // Alternative fuel efficiency field
  currentFuelLevel: Number,   // Current fuel percentage (0-100)
  odometer: Number,           // Total distance traveled
  
  analytics: {
    totalDistance: Number,    // Total distance in km
    totalTrips: Number,       // Total number of trips
    tripsCompleted: Number,    // Completed trips
    totalFuelUsed: Number,    // Total fuel used in liters
    avgFuelEfficiency: Number // Average fuel efficiency
  },
  
  isActive: Boolean,          // Active status
  notes: String,             // Additional notes
  createdAt: Date,           // Registration date
  updatedAt: Date            // Last update date
}
```

### **User Motor Schema (Relationship):**
```javascript
{
  userId: ObjectId,          // Reference to User
  motorcycleId: ObjectId,      // Reference to Motor/Motorcycle
  nickname: String,             // User's nickname for this motor
  
  plateNumber: String,          // Plate number
  registrationDate: Date,        // Registration date
  dateAcquired: Date,           // Acquisition date
  odometerAtAcquisition: Number,// Odometer at acquisition
  currentOdometer: Number,      // Current odometer reading
  age: Number,                  // Motor age in years
  
  kmphRecords: [                // Speed records
    { date: Date, speed: Number }
  ],
  
  changeOilHistory: [Date],     // Oil change history
  tuneUpHistory: [Date],       // Tune-up history
  
  fuelEfficiencyRecords: [     // Fuel efficiency tracking
    { date: Date, efficiency: Number }
  ],
  currentFuelEfficiency: Number, // Current fuel efficiency
  
  currentFuelLevel: Number,     // Current fuel level in liters
  
  fuelConsumptionStats: {      // Fuel consumption statistics
    average: Number,
    max: Number,
    min: Number
  },
  
  analytics: {
    tripsCompleted: Number,
    totalDistance: Number,
    totalFuelUsed: Number,
    maintenanceAlerts: [String]
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 **Security Features**

### **1. Data Exclusion:**
- No sensitive data to exclude (motors don't have passwords)
- Only admin-authenticated requests allowed

### **2. Admin Authentication:**
- All requests require admin JWT token
- Token validated via `authenticateAdmin` middleware
- Unauthorized requests return 401 error

### **3. Data Validation:**
- Input validation for all fields
- Duplicate plate number checking
- Year validation (1900 to current year + 1)
- Fuel level validation (0-100)
- Odometer validation (non-negative)

---

## 🚀 **CRUD Operations**

### **1. Create Motor:**

**Request:**
```javascript
POST /api/admin-motors
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "userId": "507f1f77bcf86cd799439012",
  "brand": "Honda",
  "model": "Wave 100",
  "year": 2020,
  "color": "Red",
  "licensePlate": "ABC-1234",
  "fuelTank": 4.2,
  "fuelConsumption": 50,
  "nickname": "My Ride"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Motor created successfully",
  "data": {
    "motor": {
      "_id": "507f1f77bcf86cd799439013",
      "brand": "Honda",
      "model": "Wave 100",
      "year": 2020,
      "licensePlate": "ABC-1234",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### **2. Update Motor:**

**Request:**
```javascript
PUT /api/admin-motors/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "color": "Blue",
  "currentFuelLevel": 80,
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Motor updated successfully",
  "data": {
    "motor": {
      "_id": "507f1f77bcf86cd799439013",
      "color": "Blue",
      "currentFuelLevel": 80,
      "isActive": true,
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  }
}
```

### **3. Delete Motor:**

**Request:**
```bash
DELETE /api/admin-motors/507f1f77bcf86cd799439013
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Motor deleted successfully"
}
```

---

## 🔒 **Admin Action Logging**

All motor management actions are logged with:
- Admin ID and name
- Action type (CREATE, UPDATE, DELETE)
- Motor details (brand, model, plate number)
- Changes made (before/after for updates)
- Timestamp and IP address

---

## 📝 **Filtering & Search**

### **Supported Filters:**
- **Brand**: Filter by motorcycle brand
- **Model**: Filter by model name
- **Year**: Filter by manufacturing year
- **Search**: Search across brand, model, plate number, nickname

### **Sorting:**
- By creation date (newest first)
- Can be extended for other fields

---

## 🚀 **Deployment Instructions**

### **For Your Real Backend:**

1. **Update `getMotors` function** in `backend/controllers/motorController.js`
2. **Ensure routes are mounted** in your main server file:
   ```javascript
   app.use("/api/admin-motors", motorRoutes);
   ```
3. **Routes file** should already have:
   ```javascript
   router.get('/', authenticateAdmin, motorController.getMotors);
   router.get('/stats', authenticateAdmin, motorController.getMotorStats);
   router.get('/brand/:brand', authenticateAdmin, motorController.getMotorsByBrand);
   router.get('/user/:userId', authenticateAdmin, motorController.getUserMotors);
   router.get('/:id', authenticateAdmin, motorController.getMotor);
   router.post('/', authenticateAdmin, motorController.createMotor);
   router.put('/:id', authenticateAdmin, motorController.updateMotor);
   router.delete('/:id', authenticateAdmin, motorController.deleteMotor);
   ```

---

## ✅ **Testing**

### **Test the Endpoint:**

```bash
# Test basic endpoint
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-motors" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"

# Test with filters
curl -X GET "https://ts-backend-1-jyit.onrender.com/api/admin-motors?brand=Honda&limit=50" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

### **Expected Results:**
- ✅ Returns all motors with transformed data
- ✅ Includes user information
- ✅ Supports pagination
- ✅ Supports filtering and search
- ✅ Returns proper success/error responses
- ✅ Includes analytics data

---

## 🎯 **Key Features**

✅ **Security**: Admin authentication required  
✅ **Performance**: Efficient querying with indexing  
✅ **Flexibility**: Multiple filter options  
✅ **Frontend Ready**: Data format matches frontend expectations  
✅ **Error Handling**: Graceful error handling with proper status codes  
✅ **Pagination**: Built-in pagination support  
✅ **Search**: Case-insensitive search across multiple fields  
✅ **Logging**: All admin actions are logged  
✅ **Analytics**: Built-in motor analytics tracking  
✅ **Relationships**: Proper user-motor relationships  

---

## 📝 **Summary**

This implementation provides a **complete admin motor management solution** that:
- Retrieves all motor data for motor management scenes
- Supports filtering, searching, and pagination
- Includes user information for motor assignments
- Provides analytics-ready data
- Maintains security through proper authentication
- Logs all admin actions for audit trails
- Supports CRUD operations
- Tracks fuel efficiency and odometer data

**The endpoint is production-ready and can be immediately deployed to your real backend!** 🚀✨


