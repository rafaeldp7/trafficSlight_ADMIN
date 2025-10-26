# Motor Management Scene Update

## Summary
Updated the Motor Management scene (`src/scenes/addMotor/index.jsx`) to align with the new motorcycle catalog backend structure.

## Changes Made

### 1. **Form Submission Data** (lines 134-145)
**Before:**
```javascript
body: JSON.stringify({
  brand: "Generic",
  model,
  year: new Date().getFullYear(),
  engineSize: engineDisplacement ? `${engineDisplacement}cc` : undefined,
  power,
  torque,
  fuelTank: fuelTank ? parseFloat(fuelTank) : undefined,
  fuelConsumption: parseFloat(fuelConsumption),
  color: "Unknown",
  fuelType: "gasoline",
  isActive: true
})
```

**After:**
```javascript
body: JSON.stringify({
  model,
  engineDisplacement: engineDisplacement ? parseFloat(engineDisplacement) : undefined,
  power,
  torque,
  fuelTank: fuelTank ? parseFloat(fuelTank) : undefined,
  fuelConsumption: parseFloat(fuelConsumption)
})
```

### 2. **Edit Handler** (lines 231-241)
**Before:**
```javascript
const handleEdit = (motor) => {
  setFormData({ ...motor });
  setEditingId(motor._id);
};
```

**After:**
```javascript
const handleEdit = (motor) => {
  setFormData({
    model: motor.model || "",
    engineDisplacement: motor.engineDisplacement || "",
    power: motor.power || "",
    torque: motor.torque || "",
    fuelTank: motor.fuelTank || "",
    fuelConsumption: motor.fuelConsumption || "",
  });
  setEditingId(motor.id || motor._id);
};
```

### 3. **Table Displays** (lines 680, 767)
**Before:**
```javascript
<TableCell>{motor.engineSize || 'N/A'}</TableCell>
```

**After:**
```javascript
<TableCell>{motor.engineDisplacement ? `${motor.engineDisplacement} cc` : 'N/A'}</TableCell>
```

### 4. **Table Headers**
**Updated:**
- "Displacement" → "Engine (cc)"
- "Fuel Tank" → "Fuel Tank (L)"
- "Consumption" → "Consumption (km/L)"

## Backend Field Mapping

| Frontend Field | Backend Field | Type | Notes |
|---------------|---------------|------|-------|
| `model` | `model` | String | Motorcycle model name |
| `engineDisplacement` | `engineDisplacement` | Number | Engine displacement in cc |
| `power` | `power` | String | Power output |
| `torque` | `torque` | String | Torque specification |
| `fuelTank` | `fuelTank` | Number | Fuel tank capacity in liters |
| `fuelConsumption` | `fuelConsumption` | Number | Fuel consumption in km/L |

## API Endpoints

- **GET** `/api/admin-motors` - Get all motorcycles (returns catalog data)
- **POST** `/api/admin-motors` - Create new motorcycle
- **PUT** `/api/admin-motors/:id` - Update motorcycle
- **DELETE** `/api/admin-motors/:id` - Soft delete motorcycle (sets `isDeleted: true`)
- **PUT** `/api/admin-motors/restore/:id` - Restore deleted motorcycle

## Data Structure

### Motorcycle Catalog Model
```javascript
{
  _id: ObjectId,
  model: String,              // e.g., "Honda CB150R"
  engineDisplacement: Number,  // e.g., 149.16
  power: String,              // e.g., "11.8 hp"
  torque: String,            // e.g., "13.4 Nm"
  fuelTank: Number,           // e.g., 15.2
  fuelConsumption: Number,    // e.g., 45.5
  isDeleted: Boolean,         // Soft delete flag
  createdAt: Date,
  updatedAt: Date
}
```

## Features

### Create Motorcycle
- Form validates required fields: `model` and `fuelConsumption`
- Sends only relevant fields to backend
- Auto-refreshes list after creation

### Edit Motorcycle
- Maps backend fields to form correctly
- Handles both `id` and `_id` identifiers
- Prevents data corruption by explicit field mapping

### Delete Motorcycle
- Soft delete (sets `isDeleted: true`)
- Shows in "Recently Deleted" section
- Can be restored with restore button

### Display Data
- Shows formatted engine displacement with "cc" unit
- Shows fuel tank with "L" unit
- Shows fuel consumption with "km/L" unit
- Properly handles missing/undefined values

## Testing Checklist

- [x] Form submission uses correct field names
- [x] Edit handler maps backend data correctly
- [x] Table displays show correct data
- [x] Field names match backend model
- [x] No linter errors
- [ ] Test create motorcycle
- [ ] Test edit motorcycle
- [ ] Test delete motorcycle
- [ ] Test restore motorcycle
- [ ] Verify admin logs are created on delete

## Next Steps

1. Test the motor management scene with actual backend
2. Verify admin logs are created when deleting motorcycles
3. Check backend console logs for authentication issues
4. Ensure `req.user` is properly populated by `authenticateAdmin` middleware

## Related Files

- `backend/controllers/motorController.js` - Motorcycle catalog controller
- `backend/models/motorcycleModel.js` - Motorcycle catalog model
- `backend/routes/motors.js` - Motor routes
- `backend/middleware/adminAuth.js` - Admin authentication middleware
- `src/scenes/addMotor/index.jsx` - Motor management scene (updated)

## Debug Logging

The backend controller now includes debug logs for the delete operation:
```javascript
console.log('🔍 DELETE MOTORCYCLE - Checking req.user for logging');
console.log('🔍 DELETE MOTORCYCLE - req.user:', req.user);
console.log('🔍 DELETE MOTORCYCLE - req.user?.id:', req.user?.id);
```

These logs will help identify if authentication is working correctly.

