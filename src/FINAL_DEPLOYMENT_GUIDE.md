# Al Faiz Multinational Group HRMS System - Complete Deployment Guide

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Supabase Configuration](#supabase-configuration)
5. [Backend Deployment (Deno/Hono)](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Testing & Verification](#testing--verification)
9. [Production Checklist](#production-checklist)
10. [Troubleshooting](#troubleshooting)

---

## System Overview

**Al Faiz Multinational Group HRMS System** is a comprehensive Human Resource Management System with:

- **Frontend**: React + Tailwind CSS (Black & Gold Theme)
- **Backend**: Supabase + Deno + Hono
- **Authentication**: JWT-based with role-based access control (Admin, Manager, Employee)
- **Database**: Supabase KV Store
- **Features**:
  - Employee Management with lifecycle status tracking
  - GPS-based Attendance with auto-capture
  - Leave Management with approval workflows
  - Recruitment ATS with auto-employee creation
  - Performance Reviews with restrictions
  - Payments Module with salary, advances, and final settlements
  - Real-time Activity Logging
  - Birthday Wishes System
  - Early Birds & Late Comers Analytics
  - Comprehensive Reports & Analytics
  - Custom Roles & Permissions System

---

## Prerequisites

### Required Tools
- Node.js (v18 or higher)
- npm or yarn package manager
- Git
- A Supabase account (free tier works for testing)
- A code editor (VS Code recommended)

### Required Accounts
1. **Supabase Account**: Sign up at https://supabase.com
2. **Vercel/Netlify Account** (for frontend deployment, optional)
3. **Domain Name** (optional, for custom domain)

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd hrms-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment Configuration

Create a file `/utils/supabase/info.tsx`:
```typescript
export const projectId = 'YOUR_SUPABASE_PROJECT_ID';
```

**How to find your Project ID:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings > General
4. Copy the Reference ID (this is your projectId)

---

## Supabase Configuration

### 1. Create a New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - **Name**: Al Faiz HRMS
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait for the project to be created (2-3 minutes)

### 2. Enable Required Features

#### Enable Edge Functions
1. In Supabase Dashboard, go to **Edge Functions**
2. Edge Functions are enabled by default in new projects

#### Enable KV Store
1. Go to **Database** > **Extensions**
2. Search for "kv" or enable the built-in KV functionality
3. KV Store is used for all data persistence in this system

### 3. Get Your Supabase Credentials

You'll need these values:
1. **Project URL**: Found in Project Settings > API > Project URL
   - Format: `https://YOUR_PROJECT_ID.supabase.co`
2. **Anon/Public Key**: Found in Project Settings > API > anon public
3. **Service Role Key**: Found in Project Settings > API > service_role (keep this secret!)

### 4. Deploy Backend Functions

#### Install Supabase CLI
```bash
npm install -g supabase
```

#### Login to Supabase
```bash
supabase login
```

#### Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_ID
```

#### Deploy the Edge Function
```bash
supabase functions deploy make-server-937488f4
```

#### Set Environment Variables for Edge Function
```bash
supabase secrets set SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

---

## Backend Deployment

### 1. Verify Backend Structure

Ensure your backend files are in:
```
/supabase/functions/server/
  ├── index.tsx         (Main server file)
  ├── helpers.tsx       (Helper functions)
  └── kv_store.tsx      (KV store wrapper)
```

### 2. Backend Features Implemented

The backend handles:
- ✅ User Authentication (Seed Admin, Register, Login)
- ✅ Employee Management (CRUD operations)
- ✅ Attendance Management (Check-in/out with GPS)
- ✅ Leave Management (Apply, Approve, Reject)
- ✅ Recruitment (Candidate management, auto-employee creation)
- ✅ Performance Reviews (Submit, view, lock after submission)
- ✅ Payments (Salary, advances, final settlements)
- ✅ Activity Logging (All major actions logged)
- ✅ Birthday System (Fetch birthdays, send wishes)
- ✅ Analytics (Early birds, late comers, dashboard stats)
- ✅ Reports (Payroll, Attendance, GPS Tracking, Final Settlement)
- ✅ Roles & Permissions (Custom permission management)
- ✅ Department Management
- ✅ Final Settlement (Auto-generation on resignation/termination)

### 3. Test Backend Endpoints

After deployment, test key endpoints:

```bash
# Health Check
curl https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-937488f4/health

# Create Initial Admin (First-time setup only)
curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-937488f4/auth/seed-admin \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@alfaizmng.com","password":"Admin@123","name":"System Administrator"}'
```

---

## Frontend Deployment

### Option 1: Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel --prod
```

4. **Configure Environment**:
   - In Vercel Dashboard, go to your project settings
   - Add environment variables if needed
   - Vercel will automatically build and deploy

### Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login to Netlify**:
```bash
netlify login
```

3. **Deploy**:
```bash
netlify deploy --prod
```

### Option 3: Self-Hosted (Node.js Server)

1. **Build the Application**:
```bash
npm run build
```

2. **Serve with a Static Server**:
```bash
npm install -g serve
serve -s build -l 3000
```

3. **Setup PM2 for Production** (keeps the app running):
```bash
npm install -g pm2
pm2 start "serve -s build -l 3000" --name hrms-frontend
pm2 save
pm2 startup
```

---

## Post-Deployment Configuration

### 1. Create Initial Admin Account

1. Navigate to `https://your-domain.com/setup`
2. Fill in the admin details:
   - **Name**: System Administrator
   - **Email**: admin@alfaizmng.com
   - **Password**: Choose a strong password
3. Click "Create Admin Account"
4. You should see: "Initial admin created successfully!"

### 2. Login as Admin

1. Go to `https://your-domain.com`
2. Login with admin credentials
3. You should see the dashboard with all admin features

### 3. Configure Departments

1. Go to **Departments** in the sidebar
2. Add your company departments:
   - Administration
   - Human Resources
   - Finance
   - Sales
   - Operations
   - IT
   - Marketing
   - (Add more as needed)

### 4. Add Managers and Employees

**As Admin:**
1. Go to **Employees** > **Add Employee**
2. Fill in employee details including:
   - Name, Email, Role (Manager or Employee)
   - Department
   - Job Title
   - Shift Details (Custom shifts if needed)
   - Monthly Salary
3. System will auto-generate login credentials
4. Share credentials with the new employee

### 5. Configure Shift Settings

**For employees needing custom shifts:**
1. Go to employee profile
2. Edit shift details:
   - **Shift Type**: Morning, Evening, Night, Custom
   - **Start Time & End Time**
   - **Break Duration**
   - **Working Days**: Mon-Fri, Mon-Sat, or Custom
   - **Flexibility**: Fixed or Flexible

### 6. Setup Policies (Optional)

1. Go to **Policies**
2. Add company policies:
   - Leave Policy
   - Attendance Policy
   - Code of Conduct
   - Remote Work Policy

---

## Testing & Verification

### 1. Authentication Testing

- ✅ Admin can login
- ✅ Manager can login (create a manager account first)
- ✅ Employee can login (create an employee account first)
- ✅ Logout works correctly
- ✅ Unauthorized access is blocked

### 2. Role-Based Access Testing

**Admin Should See:**
- All employees from all departments
- All menu items (Departments, Payments, Roles & Permissions)
- All activity logs
- All reports and analytics

**Manager Should See:**
- Only employees from their own department
- Limited menu items (no Departments, Payments, or Roles & Permissions)
- Only their department's activity logs
- Department-filtered reports

**Employee Should See:**
- Only their own profile
- Limited features (attendance, leaves, their own performance)
- No activity logs
- Birthday wishes received

### 3. Feature Testing

**Attendance:**
- ✅ Check-in captures current date/time automatically
- ✅ GPS location is captured and stored
- ✅ Manual date selection is blocked
- ✅ Early birds and late comers appear on dashboard (Admin/Manager)

**Leave Management:**
- ✅ Employees can apply for future or same-day (emergency) leaves
- ✅ Backdated leaves are blocked
- ✅ Only Admin can approve/reject leaves
- ✅ Leave status appears in activity log

**Birthday Wishes:**
- ✅ Current month birthdays show on dashboard
- ✅ Today's birthdays are highlighted
- ✅ Employees can wish same-department colleagues
- ✅ Managers and Admin can wish anyone
- ✅ Wishes appear on recipient's dashboard
- ✅ Wishes are logged in activity

**Recruitment:**
- ✅ Admin/Manager can add candidates
- ✅ When candidate is marked "Hired", employee profile is auto-created
- ✅ Login credentials are generated
- ✅ Hired event is logged in activity

**Performance Reviews:**
- ✅ Managers can review only their department employees
- ✅ Admin reviews Managers
- ✅ Only one review per employee per month
- ✅ Reviews lock after submission (Admin can unlock)
- ✅ Low ratings appear on Admin dashboard

**Employee Status Changes:**
- ✅ Only Admin or department Manager can mark Resigned/Terminated
- ✅ Final Settlement is auto-generated immediately
- ✅ Attendance and leave are disabled for resigned/terminated employees
- ✅ Status change is logged in activity

**Payments:**
- ✅ Admin can make salary payments
- ✅ Advance salary is deducted from current month payroll
- ✅ Employee dues are shown before payment
- ✅ Payment history is maintained
- ✅ Final settlement status updates when paid

**Reports:**
- ✅ Payroll reports show accurate data
- ✅ Attendance reports with GPS tracking
- ✅ Final settlement reports
- ✅ All reports respect department visibility

### 4. Performance Testing

- ✅ Dashboard loads within 2 seconds
- ✅ All API calls complete within 5 seconds
- ✅ GPS location capture is instant
- ✅ No console errors in browser

---

## Production Checklist

### Security
- [ ] All API keys are stored securely (not in code)
- [ ] Service Role Key is never exposed to frontend
- [ ] HTTPS is enabled on frontend
- [ ] CORS is properly configured in backend
- [ ] SQL injection prevention is in place (using parameterized queries)
- [ ] XSS protection is enabled
- [ ] Rate limiting is configured on API endpoints

### Data Integrity
- [ ] Backup strategy is in place for KV store data
- [ ] Data validation is implemented on both frontend and backend
- [ ] Error handling is comprehensive
- [ ] Activity logs are working for all major actions

### User Experience
- [ ] Loading states are shown for all async operations
- [ ] Error messages are user-friendly
- [ ] Toast notifications work for all actions
- [ ] Mobile responsiveness is tested
- [ ] Black and gold theme is applied consistently

### Documentation
- [ ] Admin credentials are documented securely
- [ ] API endpoints are documented
- [ ] User guide is available (USER_GUIDE.md)
- [ ] Deployment process is documented (this file)

### Monitoring
- [ ] Error logging is set up
- [ ] Performance monitoring is in place
- [ ] User activity tracking is working
- [ ] System health checks are scheduled

---

## Troubleshooting

### Issue: "Failed to connect to Supabase"
**Solution:**
1. Check if projectId in `/utils/supabase/info.tsx` is correct
2. Verify Supabase project is active
3. Check network connectivity
4. Verify CORS settings in Supabase Edge Functions

### Issue: "Admin creation failed"
**Solution:**
1. Make sure no admin exists already (check with Supabase dashboard)
2. Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
3. Check Edge Function logs in Supabase dashboard

### Issue: "GPS location not captured"
**Solution:**
1. Ensure browser has location permissions enabled
2. Test on HTTPS (geolocation doesn't work on HTTP except localhost)
3. Check if user denied location permission

### Issue: "Activity logs not showing"
**Solution:**
1. Verify `helpers.logActivity()` is called in backend
2. Check if KV store is working (test with simple get/set)
3. Ensure proper role-based filtering is applied

### Issue: "Birthday wishes not appearing"
**Solution:**
1. Check if employees have dateOfBirth set in their profiles
2. Verify birthday calculation logic in backend
3. Check if wishes are being saved to KV store

### Issue: "Reports showing incorrect data"
**Solution:**
1. Verify attendance records have proper timestamps
2. Check if shift times are configured correctly
3. Ensure leaves are marked as approved (not pending)
4. Verify payment records are linked correctly

### Issue: "Final Settlement not generating"
**Solution:**
1. Check if employee status is actually changed to 'resigned' or 'terminated'
2. Verify final settlement endpoint is being called
3. Check backend logs for errors
4. Ensure all required data (salary, advances, leaves) exists

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Tailwind)               │
│                   Black & Gold Theme Applied                 │
│  - Dashboard with Activity Feed, Early Birds, Late Comers   │
│  - Employee Management with Status Lifecycle                │
│  - GPS-based Attendance with Auto-capture                   │
│  - Leave Management with Restrictions                       │
│  - Birthday Wishes System                                   │
│  - Recruitment with Auto-employee Creation                  │
│  - Performance Reviews with Locks                           │
│  - Payments Module with Final Settlements                   │
│  - Comprehensive Reports & Analytics                        │
│  - Custom Roles & Permissions                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTPS/REST API
                   │
┌──────────────────▼──────────────────────────────────────────┐
│           Backend (Supabase Edge Functions)                  │
│                  Deno + Hono Framework                       │
│  - JWT Authentication with Role-based Access Control        │
│  - Activity Logging for All Major Actions                   │
│  - Department-based Visibility Enforcement                  │
│  - Custom Shift Management & Validation                     │
│  - Automatic Final Settlement Generation                    │
│  - Birthday System with Wish Storage                        │
│  - Analytics Calculation (Early Birds, Late Comers)         │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ Data Operations
                   │
┌──────────────────▼──────────────────────────────────────────┐
│              Supabase KV Store (Database)                    │
│  - Employees Data with Custom Shifts                        │
│  - Attendance Records with GPS Coordinates                  │
│  - Leave Applications with Approval Status                  │
│  - Performance Reviews with Lock Status                     │
│  - Payment Records with Settlement Status                   │
│  - Activity Logs with Timestamps                            │
│  - Birthday Wishes with Sender/Receiver Info                │
│  - Recruitment Candidates with Hire Status                  │
│  - Custom Roles & Permissions                               │
│  - Final Settlement Records                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features Implemented

### 1. Activity Logging System
- **Admin**: Sees all activities from all departments
- **Manager**: Sees only their department's activities
- **Employee**: Cannot see activity logs
- **Logged Actions**: Employee created/updated/resigned/terminated, attendance check-in/out, leave applied/approved/rejected, performance reviews, payments, birthday wishes, candidate hired, final settlement generated

### 2. Early Birds & Late Comers
- **Visible to**: Admin and Managers only
- **Logic**: Compares actual check-in time with assigned shift start time (including custom shifts)
- **Department Filtering**: Managers see only their department

### 3. Birthday Wishes System
- **Current Date**: Displayed on dashboard
- **Birthdays This Month**: Shows all employees with birthdays in current month
- **Today's Birthdays**: Highlighted with special badge
- **Wishing Permissions**:
  - Employees can wish only same-department colleagues
  - Managers and Admin can wish anyone
- **Wish Storage**: All wishes stored in database with sender, receiver, message, timestamp
- **Wish Display**: Received wishes appear on recipient's dashboard
- **Activity Logging**: Birthday wishes are logged

### 4. Custom Shift Management
- **Shift Types**: Morning, Evening, Night, Custom
- **Day-wise Configuration**: Can set different times for different days
- **Integration**: Used in attendance validation, late arrival calculation, payroll, reports

### 5. Employee Lifecycle Status
- **Statuses**: Active, Resigned, Terminated
- **Permissions**: Only Admin or department Manager can change status
- **Auto Final Settlement**: Immediately generated when status changes to Resigned/Terminated
- **Restrictions**: Attendance and leave disabled for resigned/terminated employees

### 6. GPS-based Attendance
- **Auto-capture**: System automatically captures current date, time, and GPS location
- **No Manual Date**: Date selection is blocked to prevent backdating
- **Live Location**: Admin can view live GPS tracking
- **Department Filtering**: Managers see only their department's locations

### 7. Leave Management Enhancements
- **Backdating Blocked**: Cannot apply for past dates
- **Same-day Emergency**: Allowed for current date
- **Future Leaves**: Allowed for advance planning
- **Approval**: Only Admin can approve/reject
- **Types**: Clearly separated Approved Paid Leaves and Unpaid Leaves
- **Integration**: Leave data affects payroll and reports

### 8. Recruitment to Employee
- **Candidate Hired**: When marked as "Hired", automatically creates employee profile
- **Auto Credentials**: Login credentials generated using same logic as manual employee creation
- **Activity Log**: Hiring event is logged

### 9. Performance Review Restrictions
- **Manager Access**: Can review only their department's employees
- **Admin Access**: Reviews Managers
- **One per Month**: Only one review per employee per month allowed
- **Lock System**: Reviews lock after submission, only Admin can edit
- **Low Rating Alert**: Low-rated reviews highlighted on Admin dashboard
- **Visibility**: Reviews visible only to concerned employee and Admin

### 10. Comprehensive Reports
- **Payroll Reports**: Working days, late arrivals, approved paid leaves, unpaid leaves, absences, advances, payments, final calculation
- **Attendance Reports**: Date-wise, employee-wise with GPS data
- **GPS Tracking Reports**: Real-time location tracking with Google Maps
- **Final Settlement Reports**: All dues, advances, paid amounts, status (Paid/Unpaid)
- **Auto-update**: When final settlement is paid via Payments module, report status updates to "Paid"

### 11. Payments Module
- **Salary Payments**: Full salary, half salary, custom amount
- **Advance Salary**: Custom amount with automatic deduction from current month payroll
- **Real-time Dues**: Shows employee's current dues before payment
- **Payment History**: Complete history maintained
- **Report Generation**: Automatic payroll and payment report generation

### 12. Custom Roles & Permissions
- **Feature-level Control**: Admin can enable/disable specific features for Managers/Employees
- **Overrides Default**: Custom permissions override default role permissions
- **Granular Access**: Controls reports, payments, approvals, GPS, employee editing
- **Department Visibility**: Always maintains strict department-based visibility

---

## Theme Specifications

### Black & Gold Theme Colors
- **Primary Gold**: `#d4af37`
- **Dark Gold**: `#b8941f`
- **Black Background**: `#0a0a0a`
- **Card Background**: `#1a1a1a`
- **Secondary Background**: `#2a2a2a`
- **Text Light**: `#f5f5f5`
- **Text Muted**: `#a0a0a0`

### Company Branding
- **System Name**: Al Faiz Multinational Group HRMS System
- **Logo**: Company logo displayed in sidebar and login page
- **Theme**: Professional black and gold throughout

---

## Support & Maintenance

### Regular Maintenance Tasks
1. **Weekly**: Check activity logs for unusual patterns
2. **Monthly**: Review and clean old activity logs (optional)
3. **Quarterly**: Audit user permissions and roles
4. **Yearly**: Review and update policies

### Backup Recommendations
1. **Daily**: Automated backup of KV store data
2. **Weekly**: Full system backup including configurations
3. **Monthly**: Off-site backup storage

### Update Process
1. Test updates in staging environment first
2. Notify users of scheduled downtime
3. Create backup before update
4. Deploy updates during low-traffic hours
5. Monitor system for 24 hours post-update

---

## Contact & Support

For technical support or questions regarding this deployment:
- Check the USER_GUIDE.md for user-facing documentation
- Review backend logs in Supabase Dashboard > Edge Functions > Logs
- Check browser console for frontend errors
- Review activity logs in the application for audit trails

---

**System Status**: ✅ Production Ready
**Last Updated**: 2026-02-01
**Version**: 1.0.0 (Final Release)

---

## Final Notes

This HRMS system is now fully functional, database-driven, and production-ready with:
- ✅ Black & Gold theme applied throughout
- ✅ Company logo integrated
- ✅ Real database-backed activity logging
- ✅ Early Birds & Late Comers widgets
- ✅ Birthday wishes system with database storage
- ✅ Custom shift management integrated everywhere
- ✅ Employee lifecycle with final settlements
- ✅ GPS-based attendance with restrictions
- ✅ Enhanced leave management
- ✅ Auto-employee creation from recruitment
- ✅ Performance review restrictions
- ✅ Comprehensive reports module
- ✅ Full payments module
- ✅ Custom roles & permissions system
- ✅ Strict department-based visibility
- ✅ Complete deployment documentation

The system is ready to deploy and use immediately!
