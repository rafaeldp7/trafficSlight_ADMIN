# Gas Stations Data Format Update

## 📋 **Backend Response Format**

The backend returns gas station data in the following structure:

```json
{
  "gasStations": [
    {
      "_id": "68377f780efa147ff1d8fd78",
      "name": "Caltex",
      "brand": "Caltex",
      "location": {
        "type": "Point",
        "coordinates": [120.9433988, 14.667983]
      },
      "fuelPrices": {
        "gasoline": 45,
        "diesel": 0,
        "premium": 55
      },
      "address": "",
      "city": "",
      "state": "",
      "postalCode": "",
      "servicesOffered": [],
      "operatingHours": {...},
      "isVerified": false,
      "isActive": true,
      "createdAt": "2025-05-28T21:26:16.683Z",
      "updatedAt": "2025-09-29T06:33:22.797Z"
    }
  ]
}
```

---

## ✅ **Key Changes Made**

### **1. Updated `fetchStations` Function**

**File:** `src/scenes/gasStations/index.jsx`

**Issue:** The original function assumed `res.data` was an array, but the backend returns an object with a `gasStations` property.

**Fix Applied:**
```javascript
const fetchStations = () => {
  axios.get(API_URL).then((res) => {
    // Handle different response structures
    let stationsData = [];
    
    // If response has gasStations property
    if (res.data.gasStations && Array.isArray(res.data.gasStations)) {
      stationsData = res.data.gasStations;
    } 
    // If response has data.gasStations (nested)
    else if (res.data.data && res.data.data.gasStations && Array.isArray(res.data.data.gasStations)) {
      stationsData = res.data.data.gasStations;
    }
    // If response.data is an array
    else if (res.data && Array.isArray(res.data)) {
      stationsData = res.data;
    }
    // If response has data property with array
    else if (res.data.data && Array.isArray(res.data.data)) {
      stationsData = res.data.data;
    }
    
    setStations(stationsData);
    setFiltered(stationsData);
  }).catch((error) => {
    console.error('Error fetching gas stations:', error);
    setStations([]);
    setFiltered([]);
  });
};
```

**Benefits:**
- ✅ Handles `gasStations` array directly
- ✅ Handles nested `data.gasStations`
- ✅ Handles legacy format with direct array
- ✅ Handles `data.data` structure
- ✅ Includes error handling

---

## 📊 **Data Structure Details**

### **Location Coordinates**
```javascript
location: {
  type: "Point",
  coordinates: [longitude, latitude] // Array format: [lng, lat]
}
```

**Accessing Coordinates:**
```javascript
// Latitude (Y coordinate)
const lat = station.location.coordinates[1]; // 14.667983

// Longitude (X coordinate)  
const lng = station.location.coordinates[0]; // 120.9433988
```

### **Fuel Prices**
```javascript
fuelPrices: {
  gasoline: 45,  // PHP
  diesel: 0,     // PHP
  premium: 55    // PHP
}
```

### **Additional Fields**
```javascript
{
  name: "Caltex",              // Station name
  brand: "Caltex",            // Brand name
  address: "",                 // Street address
  city: "",                    // City
  state: "",                   // State/Province
  postalCode: "",              // Postal code
  country: "Philippines",      // Country
  servicesOffered: [],         // Array of services
  isVerified: false,           // Verification status
  isActive: true,              // Active status
  createdAt: "...",            // Creation date
  updatedAt: "..."             // Last update date
}
```

---

## 🗺️ **Coordinate System**

### **GeoJSON Point Format**
The backend uses GeoJSON Point format where:
- **`coordinates`** is an array `[longitude, latitude]`
- **Longitude** comes first (X coordinate) ← `coordinates[0]`
- **Latitude** comes second (Y coordinate) ← `coordinates[1]`

### **Usage in Component**
```javascript
// Marker position
<Marker
  position={{
    lat: station.location.coordinates[1],  // Latitude from index 1
    lng: station.location.coordinates[0],  // Longitude from index 0
  }}
/>

// Zoom to location
zoomToLocation(
  station.location.coordinates[1],  // lat
  station.location.coordinates[0]    // lng
);

// Form edit
location: {
  lat: station.location.coordinates[1],
  lng: station.location.coordinates[0],
}
```

---

## 🎯 **Component Compatibility**

### **Already Compatible Features**

✅ **Map Markers** - Already using `coordinates[1]` for lat and `coordinates[0]` for lng  
✅ **Info Box** - Already using correct coordinate format  
✅ **Edit Form** - Already extracting coordinates correctly  
✅ **Zoom to Location** - Already using correct coordinate order  
✅ **Submit Payload** - Already sending coordinates in correct format `[lng, lat]`  

### **No Changes Needed For:**

- `handleEdit` - Already extracts `coordinates[1]` and `coordinates[0]`
- `handleSubmit` - Already sends `[lng, lat]` to backend
- Map rendering - Already uses correct format
- InfoBox display - Already uses correct format

---

## 🔄 **Response Handling Priority**

The updated `fetchStations` function checks in this order:

1. **`res.data.gasStations`** - Direct property (current format)
2. **`res.data.data.gasStations`** - Nested under data
3. **`res.data`** - Direct array (legacy format)
4. **`res.data.data`** - Nested array (alternative format)

This ensures compatibility with:
- ✅ New backend format: `{ gasStations: [...] }`
- ✅ API wrapper format: `{ data: { gasStations: [...] } }`
- ✅ Legacy format: `[...]`
- ✅ Alternative format: `{ data: [...] }`

---

## 📝 **Testing**

### **Test Different Response Formats**

```javascript
// Format 1: Direct gasStations property
const response1 = {
  gasStations: [...]
};

// Format 2: Nested data.gasStations  
const response2 = {
  data: {
    gasStations: [...]
  }
};

// Format 3: Direct array
const response3 = [...];

// Format 4: Nested data array
const response4 = {
  data: [...]
};
```

All formats are now supported! ✅

---

## ✅ **Summary**

**Changes Made:**
1. ✅ Updated `fetchStations` to handle `gasStations` property
2. ✅ Added fallback handling for multiple response structures
3. ✅ Added error handling with empty array fallback
4. ✅ No changes needed to coordinate handling (already correct)
5. ✅ No changes needed to form submission (already correct)

**Existing Code Already Correct:**
- ✅ Coordinate access (`coordinates[1]` for lat, `coordinates[0]` for lng)
- ✅ Map marker positioning
- ✅ Form edit coordinate extraction
- ✅ Form submit coordinate format `[lng, lat]`
- ✅ Zoom to location function

**Result:** The gas stations page now correctly handles the backend response format! 🎉

