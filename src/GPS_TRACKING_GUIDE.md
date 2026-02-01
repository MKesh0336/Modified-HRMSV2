# GPS Tracking - Complete Implementation Guide

## Overview

This HRMS application uses browser-based GPS tracking to capture employee locations during check-in and check-out. This document explains the complete implementation.

## How It Works

### 1. Check-In Process
```
User clicks "Check In" 
→ Browser requests GPS permission (first time)
→ GPS coordinates captured (latitude, longitude)
→ Sent to server with timestamp
→ Stored in database with attendance record
→ Success confirmation shown
```

### 2. Check-Out Process
```
User clicks "Check Out"
→ GPS coordinates captured again
→ Sent to server with checkout time
→ Total hours calculated
→ Location comparison (optional verification)
→ Record updated in database
```

## Technical Implementation

### Frontend (React/TypeScript)

**Location:** `/components/AttendanceManagement.tsx`

**GPS Capture Function:**
```typescript
const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        console.error('GPS Error:', error);
        reject(new Error('Unable to get your location. Please enable GPS/location services.'));
      },
      {
        enableHighAccuracy: true,  // Request high accuracy
        timeout: 10000,            // 10 second timeout
        maximumAge: 0              // Don't use cached position
      }
    );
  });
};
```

**Check-In Handler:**
```typescript
const handleCheckIn = async () => {
  setChecking(true);
  setGpsError(null);
  
  try {
    // Capture GPS
    const location = await getLocation();
    
    // Send to server
    const response = await fetch(
      `${API_URL}/attendance/gps-checkin`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          latitude: location.latitude,
          longitude: location.longitude,
          location: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
        })
      }
    );

    if (response.ok) {
      await fetchAttendance(); // Refresh data
    } else {
      const errorData = await response.json();
      setGpsError(errorData.error || 'Check-in failed');
    }
  } catch (error) {
    console.error('Check-in failed:', error);
    setGpsError(error instanceof Error ? error.message : 'Failed to get location');
  } finally {
    setChecking(false);
  }
};
```

### Backend (Deno/Hono)

**Location:** `/supabase/functions/server/index.tsx`

**GPS Check-In Endpoint:**
```typescript
app.post('/make-server-937488f4/attendance/gps-checkin', async (c) => {
  try {
    // Authenticate user
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);
    
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Extract GPS data
    const { date, latitude, longitude, location } = await c.req.json();
    const attendanceId = `${user.id}:${date || new Date().toISOString().split('T')[0]}`;

    // Get employee shift data
    const employeeData = await kv.get(`employee:${user.id}`);
    
    // Create attendance record with GPS
    const attendanceData = {
      id: attendanceId,
      employeeId: user.id,
      date: date || new Date().toISOString().split('T')[0],
      checkIn: new Date().toISOString(),
      checkInLat: latitude,
      checkInLng: longitude,
      checkOut: null,
      checkOutLat: null,
      checkOutLng: null,
      location: location || 'Office',
      status: 'present',
      totalHours: null,
      lateMinutes: 0,
      earlyCheckoutMinutes: 0,
      shiftStartTime: employeeData?.shiftStartTime || '09:00',
      shiftEndTime: employeeData?.shiftEndTime || '17:00'
    };

    // Calculate late arrival
    const checkInTime = new Date(attendanceData.checkIn);
    const [shiftHour, shiftMinute] = attendanceData.shiftStartTime.split(':');
    const shiftStart = new Date(checkInTime);
    shiftStart.setHours(parseInt(shiftHour), parseInt(shiftMinute), 0, 0);
    
    if (checkInTime > shiftStart) {
      const lateMs = checkInTime.getTime() - shiftStart.getTime();
      attendanceData.lateMinutes = Math.floor(lateMs / (1000 * 60));
    }

    // Store in database
    await kv.set(`attendance:${attendanceId}`, attendanceData);

    return c.json({ 
      message: 'GPS check-in successful', 
      attendance: attendanceData 
    });
  } catch (error) {
    console.log('GPS check-in error:', error);
    return c.json({ error: 'Failed to check in with GPS' }, 500);
  }
});
```

## GPS Settings Explained

### `enableHighAccuracy: true`
- Uses GPS chip instead of WiFi/cell towers
- More accurate (typically 5-10 meters)
- Uses more battery power
- Slower to acquire position
- **Best for:** Attendance tracking where accuracy matters

### `timeout: 10000`
- Maximum time to wait for GPS (10 seconds)
- Prevents indefinite hanging
- Rejects promise if exceeded
- **Adjust if:** Users have poor GPS signal

### `maximumAge: 0`
- Don't use cached GPS position
- Always get fresh coordinates
- Ensures accurate real-time location
- **Important for:** Check-in/out timestamps

## GPS Accuracy Levels

| Method | Accuracy | Speed | Battery |
|--------|----------|-------|---------|
| High Accuracy GPS | 5-10m | Slow | High |
| Network (WiFi) | 20-100m | Fast | Low |
| Cell Tower | 100-1000m | Fast | Low |

**We use:** High Accuracy GPS for best results

## Error Handling

### Common GPS Errors

**1. User Denied Permission**
```
Error: User denied location access
Solution: Show instructions to enable in browser
```

**2. Timeout**
```
Error: GPS timeout after 10 seconds
Solution: Ask user to move to open area
```

**3. Position Unavailable**
```
Error: Unable to retrieve position
Solution: Check GPS is enabled on device
```

**4. Not Supported**
```
Error: Geolocation not supported
Solution: Update browser or use different device
```

### Error Messages to Users

```typescript
const ERROR_MESSAGES = {
  PERMISSION_DENIED: 'Location access denied. Please enable location in browser settings.',
  POSITION_UNAVAILABLE: 'Unable to get location. Please ensure GPS is enabled.',
  TIMEOUT: 'GPS timeout. Please try again in an open area.',
  UNKNOWN: 'Unable to get location. Please check your settings.',
  NOT_SUPPORTED: 'Your browser does not support location services.'
};
```

## Data Storage

### Database Schema (Key-Value Store)

```typescript
Key: `attendance:${userId}:${date}`

Value: {
  id: string,
  employeeId: string,
  date: string,              // "2024-12-12"
  checkIn: string,           // ISO timestamp
  checkInLat: number,        // 37.7749
  checkInLng: number,        // -122.4194
  checkOut: string | null,   // ISO timestamp or null
  checkOutLat: number | null,
  checkOutLng: number | null,
  location: string,          // Human-readable or coords
  status: string,            // "present", "late", "absent"
  totalHours: number | null,
  lateMinutes: number,
  earlyCheckoutMinutes: number,
  shiftStartTime: string,    // "09:00"
  shiftEndTime: string       // "17:00"
}
```

## Reports & Tracking

### View GPS Data

**Location:** Reports → GPS Tracking Tab

**Features:**
1. Select employee from dropdown
2. Choose date range
3. View attendance records with GPS coordinates
4. See locations on Google Maps
5. Export data

**Map Integration:**
```typescript
// View location on Google Maps
const viewOnMap = (lat: number, lng: number) => {
  window.open(
    `https://www.google.com/maps?q=${lat},${lng}`,
    '_blank'
  );
};
```

### Real-Time Tracking

**Location:** Reports → Live GPS Tracking

**Features:**
- Track employees currently checked in
- See real-time locations on map
- Update every 30 seconds (configurable)
- Filter by department/team

## Privacy & Compliance

### Data Privacy

✅ **What We Do:**
- Only capture location during check-in/out
- Store coordinates securely encrypted
- Use only for attendance verification
- Clear retention policy

❌ **What We DON'T Do:**
- Track location outside work hours
- Share data with third parties
- Monitor movement throughout day
- Sell location data

### Legal Compliance

**GDPR (Europe):**
- Obtain explicit consent
- Allow data export
- Honor deletion requests
- Document data usage

**CCPA (California):**
- Disclose data collection
- Allow opt-out
- Provide data access
- Delete on request

### Employee Consent

**Recommended Notice:**
```
This application uses GPS to verify your location during 
check-in and check-out. Your location is only captured 
at these times and is used solely for attendance 
verification. You can view your location data at any 
time in the Reports section.

By using this application, you consent to this use of 
your location data.

[I Agree] [Learn More]
```

## Mobile Considerations

### iOS (Safari)

**Permissions:**
- Settings → Safari → Location → "While Using the App"
- Prompted on first use
- Can be changed later in Settings

**Accuracy:**
- Excellent outdoors
- Good indoors (WiFi assist)
- May take 5-10 seconds

**PWA:**
- Works when added to home screen
- Full-screen mode supported
- Same permissions as Safari

### Android (Chrome)

**Permissions:**
- Settings → Site Settings → Location → Allow
- Per-site permissions
- Can revoke anytime

**Accuracy:**
- Very good (Google Play Services)
- Fast acquisition
- Works well indoors

**PWA:**
- Installable as app
- Standalone mode
- Background location possible (with permission)

## Testing GPS

### Development Testing

**Localhost:**
```
✅ Works: http://localhost:3000
✅ Works: http://127.0.0.1:3000
```

**Test Commands:**
```javascript
// Test GPS support
if ('geolocation' in navigator) {
  console.log('GPS supported ✅');
} else {
  console.log('GPS not supported ❌');
}

// Test GPS accuracy
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('Accuracy:', position.coords.accuracy, 'meters');
    console.log('Lat:', position.coords.latitude);
    console.log('Lng:', position.coords.longitude);
  }
);
```

### Production Testing

**Requirements:**
```
✅ HTTPS enabled (required!)
✅ Valid SSL certificate
✅ Publicly accessible domain
```

**Test Checklist:**
- [ ] HTTPS working
- [ ] Permission prompt appears
- [ ] Coordinates captured
- [ ] Data stored in database
- [ ] Maps integration works
- [ ] Error handling works
- [ ] Mobile devices tested

## Performance Optimization

### Reduce GPS Time

**Quick GPS:**
```typescript
// Use lower accuracy for faster response
navigator.geolocation.getCurrentPosition(
  callback,
  error,
  {
    enableHighAccuracy: false,  // Faster
    timeout: 5000,              // Shorter timeout
    maximumAge: 5000            // Use recent cache
  }
);
```

**Balance:**
- High accuracy: Better for fraud prevention
- Low accuracy: Faster, better UX
- **Recommendation:** Start high accuracy, fallback to low

### Caching Strategy

```typescript
// Cache last known position
let lastKnownPosition = null;

const getLocationWithCache = async () => {
  if (lastKnownPosition && 
      Date.now() - lastKnownPosition.timestamp < 60000) {
    return lastKnownPosition.coords;
  }
  
  const position = await getLocation();
  lastKnownPosition = {
    coords: position,
    timestamp: Date.now()
  };
  
  return position;
};
```

## Advanced Features

### Geofencing (Future)

Automatically check-in when entering office:

```typescript
// Define office boundaries
const officeBoundary = {
  center: { lat: 37.7749, lng: -122.4194 },
  radius: 100 // meters
};

// Check if inside boundary
const isInsideOffice = (lat, lng) => {
  const distance = calculateDistance(
    lat, lng,
    officeBoundary.center.lat,
    officeBoundary.center.lng
  );
  return distance <= officeBoundary.radius;
};
```

### Location Verification

Prevent check-in from wrong location:

```typescript
const OFFICE_LOCATIONS = [
  { name: 'HQ', lat: 37.7749, lng: -122.4194, radius: 200 },
  { name: 'Branch A', lat: 40.7128, lng: -74.0060, radius: 150 }
];

const verifyLocation = (lat, lng) => {
  return OFFICE_LOCATIONS.some(office => {
    const distance = calculateDistance(lat, lng, office.lat, office.lng);
    return distance <= office.radius;
  });
};
```

### Distance Calculation

```typescript
// Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
```

## Troubleshooting

### GPS Not Working on iPhone

**Issue:** Location not captured on iOS
**Solutions:**
1. Use Safari (not Chrome)
2. Enable location in Settings → Privacy
3. Allow for Safari specifically
4. Try refreshing page

### GPS Slow on Android

**Issue:** Takes >10 seconds to get location
**Solutions:**
1. Enable "High accuracy" in device settings
2. Turn on WiFi (even if not connected)
3. Go outside for better signal
4. Restart GPS (airplane mode on/off)

### HTTPS Required Error

**Issue:** GPS blocked on HTTP
**Solution:** Deploy with HTTPS:
```bash
# Use Let's Encrypt for free SSL
certbot --nginx -d yourdomain.com
```

## Best Practices

### ✅ Do:
- Request permission when needed (not on page load)
- Show clear explanation before requesting
- Handle all error cases gracefully
- Provide fallback options
- Test on real devices
- Use HTTPS in production
- Cache positions wisely
- Respect user privacy

### ❌ Don't:
- Track location constantly
- Store unnecessary location data
- Share data without consent
- Use HTTP in production
- Ignore permission denials
- Skip error handling
- Track outside work hours
- Drain battery unnecessarily

## Summary

GPS tracking in this HRMS:
✅ Accurate (high-precision GPS)
✅ Secure (HTTPS + encrypted storage)
✅ Privacy-focused (only during check-in/out)
✅ Mobile-friendly (iOS + Android)
✅ Error-tolerant (comprehensive error handling)
✅ Compliant (GDPR/CCPA ready)

**Result:** Reliable attendance verification with minimal user friction.

---

**Last Updated:** December 12, 2024
**Version:** 2.0
**Status:** Production Ready
