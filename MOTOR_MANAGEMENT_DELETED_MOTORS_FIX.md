# Motor Management - Recently Deleted Motors Fix

## Problem
The "Recently Deleted" motors section in Motor Management wasn't showing deleted motorcycles because the frontend was fetching all motorcycles, but the backend was filtering out deleted ones by default.

## Root Cause

**Backend Controller** (`backend/controllers/motorController.js`):
```javascript
const getMotors = async (req, res) => {
  const { includeDeleted = false } = req.query;  // ← Default is false
  
  const filter = {};
  if (!includeDeleted) {  // ← Only returns deleted if explicitly requested
    filter.isDeleted = { $ne: true };
  }
  
  // Fetch motorcycles with filter
  const motorcycles = await Motorcycle.find(filter)...
}
```

**Frontend** (`src/scenes/addMotor/index.jsx`):
```javascript
const fetchMotors = async () => {
  const res = await fetch(API_URL, { headers });  // ← Not requesting deleted
  // ...
};
```

The frontend was calling the API without the `includeDeleted=true` parameter, so deleted motorcycles were not included in the response.

## Solution

Updated the frontend to explicitly request deleted motors:

```diff
- const res = await fetch(API_URL, { headers });
+ const res = await fetch(`${API_URL}?includeDeleted=true&limit=1000`, { headers });
```

## Changes Made

### File: `src/scenes/addMotor/index.jsx` (line 65)

**Before:**
```javascript
const res = await fetch(API_URL, { headers });
```

**After:**
```javascript
// Fetch ALL motors including deleted ones
const res = await fetch(`${API_URL}?includeDeleted=true&limit=1000`, { headers });
```

## How It Works Now

### Frontend Flow

1. **Fetch All Motors** (including deleted):
   ```javascript
   fetch(`${API_URL}?includeDeleted=true&limit=1000`)
   ```

2. **Filter Active Motors**:
   ```javascript
   const activeMotors = motors.filter(m => !m.isDeleted && ...);
   ```

3. **Filter Deleted Motors**:
   ```javascript
   const deletedMotors = motors.filter(m => m.isDeleted && ...);
   ```

4. **Display in Separate Tables**:
   - Active motors show in "Active Motorcycles" table
   - Deleted motors show in "Recently Deleted" table

### Backend API

**Endpoint:** `GET /api/admin-motors?includeDeleted=true`

**Query Parameters:**
- `includeDeleted` (boolean): Set to `true` to include deleted motorcycles
- `limit` (number): Maximum number of results (default: 1000)
- `page` (number): Page number for pagination
- `search` (string): Search by model name

**Response:**
```javascript
{
  success: true,
  data: {
    motors: [
      { _id: "...", model: "...", isDeleted: false, ... },  // Active
      { _id: "...", model: "...", isDeleted: true, ... },    // Deleted
      ...
    ],
    pagination: { current: 1, pages: 1, total: 50 }
  }
}
```

## "Recently Deleted" Section Features

Located at the bottom of the Motor Management page:

### Display
- Shows all motorcycles where `isDeleted: true`
- Displays same columns as active motors:
  - Model
  - Engine (cc)
  - Power
  - Torque
  - Fuel Tank (L)
  - Consumption (km/L)

### Actions
- **Restore Button**: Restores the motorcycle by setting `isDeleted: false`

### Pagination
- Default: 5 rows per page
- Options: 5, 10, 25 rows per page
- Separate pagination from active motors

## Restore Functionality

### Frontend (`src/scenes/addMotor/index.jsx`)

**Function:**
```javascript
const handleRestore = async (id) => {
  const res = await fetch(`${API_URL}/restore/${id}`, { 
    method: "PUT",
    headers
  });
  
  if (res.ok) {
    setMessage("✅ Motorcycle restored.");
    fetchMotors();  // Refresh to update both tables
  }
};
```

**Backend** (`backend/controllers/motorController.js`):

**Route:** `PUT /api/admin-motors/restore/:id`

**Controller:**
```javascript
const restoreMotor = async (req, res) => {
  const motorcycle = await Motorcycle.findById(req.params.id);
  
  // Restore motorcycle
  motorcycle.isDeleted = false;
  await motorcycle.save();
  
  // Log admin action
  await logAdminAction(req.user.id, 'UPDATE', 'MOTORCYCLE', {...});
  
  sendSuccessResponse(res, { motor: motorcycle }, 'Motorcycle restored successfully');
};
```

## Benefits

✅ **View Deleted Motors**: Admins can now see all deleted motorcycles  
✅ **Restore Functionality**: Can restore accidentally deleted motorcycles  
✅ **Audit Trail**: Track what's been deleted and when  
✅ **No Data Loss**: Deleted data is recoverable  
✅ **Soft Delete**: Motors are marked as deleted, not permanently removed

## Testing

After this fix:
1. Delete a motorcycle (mark as `isDeleted: true`)
2. Check "Recently Deleted" section shows the deleted motorcycle
3. Click Restore button
4. Motorcycle should move back to "Active Motorcycles" table

## Summary

The issue was that the frontend wasn't requesting deleted motorcycles from the backend. By adding `?includeDeleted=true` to the API call, deleted motorcycles are now included in the response and properly displayed in the "Recently Deleted" section.

**Files Updated:**
- `src/scenes/addMotor/index.jsx` - Updated fetchMotors to request deleted motors

**No Backend Changes Needed** - Backend already supported `includeDeleted` parameter

