# Developer Notes - HRMS GPS & Mobile Fixes

## Quick Reference for Developers

### 🔧 GPS Implementation

**Location:** `/components/AttendanceManagement.tsx`

**Key Function:**
```typescript
const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }),
      (error) => reject(new Error('GPS Error')),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
```

**API Endpoints:**
- Check-in: `POST /attendance/gps-checkin`
- Check-out: `POST /attendance/gps-checkout`

**Request Body:**
```json
{
  "date": "2024-12-12",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "location": "37.774900, -122.419400"
}
```

---

### 📱 Mobile Menu Implementation

**Location:** `/components/Sidebar.tsx`

**Key Features:**
```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Mobile menu button (visible on small screens)
<button className="lg:hidden fixed top-4 left-4 z-50">
  {isMobileMenuOpen ? <X /> : <Menu />}
</button>

// Sidebar with responsive classes
<div className={`
  ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  fixed lg:static w-64 transition-transform
`}>
```

**Breakpoint:** `lg` (1024px) - Menu auto-shows above this width

---

### 🎯 Dashboard Navigation

**Location:** `/components/Dashboard.tsx`

**Props:**
```typescript
interface DashboardProps {
  onNavigate?: (page: string) => void;
}
```

**Quick Actions:**
```typescript
const quickActions = [
  { label: 'Add Employee', navigate: 'add-employee' },
  { label: 'Mark Attendance', navigate: 'attendance' },
  { label: 'Review Leaves', navigate: 'leaves' },
  { label: 'Post Job', navigate: 'recruitment' }
];
```

---

### 🗺️ PWA Configuration

**Location:** `/public/manifest.json`

**Key Settings:**
```json
{
  "name": "HRMS - Human Resource Management System",
  "short_name": "HRMS",
  "display": "standalone",
  "theme_color": "#4F46E5",
  "orientation": "portrait-primary"
}
```

**Icons Needed:**
- 192x192 PNG (any/maskable)
- 512x512 PNG (any/maskable)

---

### 🔐 Authentication Flow

**Access Token Storage:**
```typescript
const token = localStorage.getItem('access_token');
```

**API Headers:**
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

**User Context:**
```typescript
const { user } = useAuth();
// user.id, user.name, user.role
```

---

### 🎨 Responsive Breakpoints

**Tailwind Classes Used:**
- `lg:hidden` - Hide on desktop (≥1024px)
- `lg:static` - Static position on desktop
- `lg:col-span-2` - 2 columns on desktop
- `lg:p-8` - Larger padding on desktop
- `grid-cols-1 lg:grid-cols-3` - 1 col mobile, 3 desktop

**Mobile-First Approach:**
```css
/* Mobile (default) */
p-4 space-y-4

/* Desktop (lg+) */
lg:p-8 lg:space-y-6
```

---

### 🚨 Error Handling Pattern

**Standard Pattern:**
```typescript
const [error, setError] = useState<string | null>(null);

try {
  const result = await apiCall();
  // Success
} catch (error) {
  console.error('Operation failed:', error);
  setError(error instanceof Error ? error.message : 'Unknown error');
} finally {
  setLoading(false);
}
```

**Display:**
```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <p className="text-red-800">{error}</p>
  </div>
)}
```

---

### 🔄 State Management

**Loading States:**
```typescript
const [loading, setLoading] = useState(true);
const [checking, setChecking] = useState(false);
```

**Data States:**
```typescript
const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
```

---

### 📡 API Response Handling

**Success Response:**
```typescript
if (response.ok) {
  const data = await response.json();
  setData(data);
}
```

**Error Response:**
```typescript
else {
  const errorData = await response.json();
  setError(errorData.error || 'Operation failed');
}
```

---

### 🧪 Testing GPS Locally

**Development Environment:**
1. Use `localhost` or `127.0.0.1` (GPS works on localhost)
2. Modern browser (Chrome/Firefox/Safari)
3. Allow location when prompted
4. Check browser console for errors

**Production Environment:**
1. **MUST USE HTTPS** - GPS blocked on HTTP
2. Valid SSL certificate required
3. Domain must be publicly accessible
4. Test on actual mobile devices

---

### 🐛 Common Issues & Solutions

**GPS Not Working:**
```
Issue: Geolocation is not defined
Solution: Check browser compatibility, ensure HTTPS
```

**Permission Denied:**
```
Issue: User denied location access
Solution: Show instructions to enable in browser settings
```

**Timeout Error:**
```
Issue: GPS timeout after 10 seconds
Solution: Increase timeout or check GPS signal
```

**API 401 Error:**
```
Issue: Unauthorized
Solution: Check access token in localStorage
```

**Menu Not Responsive:**
```
Issue: Menu doesn't hide on mobile
Solution: Check Tailwind classes, verify breakpoints
```

---

### 🔍 Debugging Commands

**Check GPS Support:**
```javascript
console.log('GPS Supported:', 'geolocation' in navigator);
```

**Check Current Token:**
```javascript
console.log('Token:', localStorage.getItem('access_token'));
```

**Check User Data:**
```javascript
console.log('User:', user);
```

**Monitor API Calls:**
```javascript
console.log('API Response:', await response.json());
```

---

### 📝 Code Standards

**Component Structure:**
```typescript
export function ComponentName() {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Effects
  useEffect(() => {}, []);
  
  // 3. Handlers
  const handleAction = () => {};
  
  // 4. Render helpers
  const formatData = () => {};
  
  // 5. Conditional renders
  if (loading) return <Spinner />;
  
  // 6. Main render
  return <div>...</div>;
}
```

**Naming Conventions:**
- Components: PascalCase (`Dashboard`, `AttendanceManagement`)
- Functions: camelCase (`handleCheckIn`, `getLocation`)
- Constants: UPPER_CASE (`API_ENDPOINT`)
- Files: kebab-case or PascalCase (`attendance-management.tsx`)

---

### 🚀 Performance Tips

**Optimize Re-renders:**
```typescript
// Use React.memo for static components
export const StaticComponent = React.memo(({ data }) => {
  return <div>{data}</div>;
});
```

**Debounce API Calls:**
```typescript
const debounced = useMemo(
  () => debounce(fetchData, 300),
  []
);
```

**Lazy Load Heavy Components:**
```typescript
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
```

---

### 🔒 Security Notes

**Never Store in Code:**
- ❌ API keys
- ❌ Passwords
- ❌ Service role keys

**Use Environment Variables:**
```typescript
const apiKey = process.env.REACT_APP_API_KEY;
```

**Validate User Input:**
```typescript
if (!email || !password) {
  return { error: 'Missing fields' };
}
```

---

### 📦 Key Dependencies

**Required:**
- `react` - UI framework
- `lucide-react` - Icons
- `@supabase/supabase-js` - Backend
- `hono` - Server framework (backend)

**UI Components:**
- Custom components in `/components/ui/`
- Tailwind CSS for styling
- No external UI library needed

---

### 🎯 Next Sprint Ideas

**Features:**
- [ ] Offline mode with IndexedDB
- [ ] Biometric authentication
- [ ] Push notifications
- [ ] Geofencing (auto check-in)
- [ ] Photo capture for verification
- [ ] Export reports as PDF

**Technical Debt:**
- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Implement service worker
- [ ] Add request caching
- [ ] Optimize bundle size
- [ ] Add error boundary

---

### 📚 Useful Resources

**Geolocation API:**
- https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API

**PWA Guide:**
- https://web.dev/progressive-web-apps/

**Tailwind CSS:**
- https://tailwindcss.com/docs

**React Best Practices:**
- https://react.dev/learn

---

### 🎨 Design Tokens

**Colors:**
- Primary: `#4F46E5` (indigo-600)
- Success: `#10B981` (green-500)
- Error: `#EF4444` (red-500)
- Warning: `#F59E0B` (amber-500)

**Spacing:**
- Mobile: `p-4` (1rem)
- Desktop: `lg:p-8` (2rem)

**Border Radius:**
- Default: `rounded-lg` (0.5rem)

---

## Quick Commands

**Start Development:**
```bash
npm install
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Deploy:**
```bash
# Deploy to your hosting platform
# Ensure HTTPS is enabled
```

---

**Last Updated:** December 12, 2024
**Maintained By:** Development Team
**Version:** 2.0 (GPS & Mobile Update)
