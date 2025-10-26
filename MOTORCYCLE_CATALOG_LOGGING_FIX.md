# Motorcycle Catalog Delete Logging Fix

## 🚨 **Issue**

When deleting a motorcycle from the motor management (catalog), no admin log is created.

---

## 🔍 **Analysis**

Looking at your motorcycle catalog controller code, the issue is likely one of these:

### **Possible Issues:**

1. **`req.user` is not set** - Route might not have authentication middleware
2. **`req.user.id` is undefined** - The condition `if (req.user?.id)` might be failing
3. **Missing route authentication** - The route might not be using `authenticateAdmin` middleware
4. **Middleware order issue** - Authentication middleware might not be applied before the controller

### **Current Code (Lines 107-117):**

```javascript
// Log the motorcycle deletion action
if (req.user?.id) {
  await logAdminAction(
    req.user.id,
    'DELETE',
    'MOTORCYCLE',
    {
      description: `Deleted motorcycle: ${deletedMotorData.model}`,
      motorcycleId: deletedMotorData.id,
      motorcycleModel: deletedMotorData.model
    },
    req
  );
}
```

The logging code is there, but the condition `if (req.user?.id)` might be failing silently.

---

## ✅ **Fixes to Apply**

### **1. Check Your Routes File**

Ensure your motorcycle routes are properly configured:

```javascript
// backend/routes/motorcycle.js (or wherever you mount motorcycle catalog)
const express = require('express');
const router = express.Router();
const motorcycleController = require('../controllers/motorcycleController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// DELETE route MUST have authenticateAdmin middleware
router.delete('/:id', authenticateAdmin, motorcycleController.deleteMotor);
```

### **2. Add Debug Logging**

Update your `deleteMotor` function in the motorcycle catalog controller:

```javascript
const deleteMotor = async (req, res) => {
  try {
    const motorcycle = await Motorcycle.findById(req.params.id);
    if (!motorcycle) {
      return sendErrorResponse(res, 404, 'Motorcycle not found');
    }

    // Store motorcycle data for logging before deletion
    const deletedMotorData = {
      id: motorcycle._id,
      model: motorcycle.model
    };

    // Soft delete
    motorcycle.isDeleted = true;
    await motorcycle.save();

    // DEBUG: Log to see what we have
    console.log('🔍 DELETE MOTORCYCLE - req.user:', req.user);
    console.log('🔍 DELETE MOTORCYCLE - req.user?.id:', req.user?.id);
    
    // Log the motorcycle deletion action
    if (req.user && req.user.id) {
      console.log('✅ Logging admin action for motorcycle deletion');
      try {
        await logAdminAction(
          req.user.id,
          'DELETE',
          'MOTORCYCLE',  // Note: Using 'MOTORCYCLE' not 'MOTOR'
          {
            description: `Deleted motorcycle: ${deletedMotorData.model}`,
            motorcycleId: deletedMotorData.id,
            motorcycleModel: deletedMotorData.model
          },
          req
        );
        console.log('✅ Admin action logged successfully');
      } catch (logError) {
        console.error('❌ Failed to log admin action:', logError);
      }
    } else {
      console.warn('⚠️ Skipping log - req.user or req.user.id is missing', {
        hasReqUser: !!req.user,
        hasReqUserId: !!req.user?.id
      });
    }

    sendSuccessResponse(res, null, 'Motorcycle deleted successfully');
  } catch (error) {
    console.error('Delete motorcycle error:', error);
    sendErrorResponse(res, 500, 'Failed to delete motorcycle', error);
  }
};
```

### **3. Verify Middleware Chain**

Check your server.js or main app file:

```javascript
// Make sure the route is mounted with authentication
app.use('/api/admin-motors-catalog', authenticateAdmin, motorcycleRoutes);
```

OR if using nested routes:

```javascript
// Route file should handle authentication
router.delete('/:id', authenticateAdmin, motorcycleController.deleteMotor);
```

---

## 🧪 **Testing Steps**

After applying the fixes:

1. **Delete a motorcycle** from motor management
2. **Check console logs** for:
   - `🔍 DELETE MOTORCYCLE - req.user:`
   - `✅ Logging admin action for motorcycle deletion`
   - `✅ Admin action logged successfully`

3. **Check Admin Logs page** to verify the log appears

### **Expected Log Entry:**

```
Action: DELETE
Resource: MOTORCYCLE
Description: "Deleted motorcycle: Yamaha Mio"
Details: {
  motorcycleId: "...",
  motorcycleModel: "Yamaha Mio"
}
```

---

## 📋 **Debugging Checklist**

If logs still don't appear, check:

- [ ] Route has `authenticateAdmin` middleware
- [ ] `req.user` is set by middleware
- [ ] `req.user.id` contains admin ID
- [ ] `logAdminAction` function exists and is imported
- [ ] No errors in backend console when deleting
- [ ] Admin log model is set up correctly

---

## ✅ **Summary**

**Problem:** Motorcycle deletion doesn't log to admin logs  
**Likely Cause:** `req.user` not set or `req.user.id` undefined  
**Solution:** Add authentication middleware and debug logging  
**Test:** Delete a motorcycle and check logs appear in Admin Logs page  

---

**Apply these changes to your motorcycle catalog controller and test!** 🚀

