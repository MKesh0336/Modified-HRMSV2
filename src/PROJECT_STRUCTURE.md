# 📁 HRMS Project Structure

## Complete File Organization

```
/
├── 📄 App.tsx                              # Main application entry point
├── 📄 DOCUMENTATION.md                     # Complete system documentation
├── 📄 QUICK_START.md                       # Quick start guide
├── 📄 PROJECT_STRUCTURE.md                 # This file
│
├── 📁 components/                          # React components
│   ├── 🔐 AuthProvider.tsx                # Authentication context & logic
│   ├── 🔑 LoginPage.tsx                   # Login screen
│   ├── ✍️ RegisterPage.tsx                # Registration screen
│   ├── 🧭 Sidebar.tsx                     # Navigation sidebar
│   │
│   ├── 📊 Dashboard.tsx                   # Dashboard with stats & analytics
│   ├── 👥 EmployeeDirectory.tsx           # Employee list (grid/list view)
│   ├── 👤 EmployeeProfile.tsx             # Employee detail & edit page
│   ├── ⏰ AttendanceManagement.tsx        # Check-in/out & attendance tracking
│   ├── 📝 LeaveManagement.tsx             # Leave application & approval
│   ├── 💼 RecruitmentATS.tsx              # Job posting & candidate pipeline
│   ├── ⭐ PerformanceReview.tsx           # Performance review system
│   ├── ⚙️ Settings.tsx                    # System settings & configuration
│   │
│   └── 📁 ui/                              # Shadcn UI components
│       ├── accordion.tsx
│       ├── alert-dialog.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── calendar.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── textarea.tsx
│       └── ... (40+ components)
│
├── 📁 supabase/functions/server/           # Backend server
│   ├── 🚀 index.tsx                       # Main server with all API routes
│   └── 💾 kv_store.tsx                    # Database utility functions
│
├── 📁 utils/supabase/                      # Supabase utilities
│   └── 📄 info.tsx                        # Supabase project configuration
│
└── 📁 styles/                              # Global styles
    └── 🎨 globals.css                     # Tailwind & custom CSS

```

---

## 🏗️ Architecture Overview

### Frontend Architecture

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                       │
│          (Main Application Router)              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│              AuthProvider                       │
│         (Authentication Context)                │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌─────────────┐   ┌──────────────────┐
│ LoginPage   │   │  Authenticated   │
│ RegisterPage│   │     Layout       │
└─────────────┘   └────────┬─────────┘
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
          ┌──────────┐      ┌─────────────┐
          │ Sidebar  │      │  Page View  │
          └──────────┘      └──────┬──────┘
                                   │
              ┌────────────────────┼────────────────┐
              │         │          │         │      │
              ▼         ▼          ▼         ▼      ▼
        ┌──────────┬─────────┬────────┬─────────┬────────┐
        │Dashboard │Employees│Attend. │ Leaves  │  ...   │
        └──────────┴─────────┴────────┴─────────┴────────┘
```

### Backend Architecture

```
┌─────────────────────────────────────────────────┐
│              Frontend (React)                   │
│         HTTP Requests with JWT                  │
└────────────────┬────────────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────────────┐
│         Supabase Edge Functions                 │
│              (Hono Server)                      │
│                                                 │
│  Routes:                                        │
│  - /auth/*         (Authentication)             │
│  - /employees/*    (Employee CRUD)              │
│  - /attendance/*   (Attendance tracking)        │
│  - /leave/*        (Leave management)           │
│  - /jobs/*         (Job postings)               │
│  - /candidates/*   (ATS pipeline)               │
│  - /performance/*  (Reviews)                    │
│  - /departments/*  (Organization)               │
│  - /dashboard/*    (Analytics)                  │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│          Supabase Services                      │
│                                                 │
│  ┌─────────────┐  ┌─────────────┐             │
│  │   Auth      │  │  KV Store   │             │
│  │  (JWT)      │  │ (Database)  │             │
│  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Examples

### Example 1: User Login Flow

```
1. User enters credentials on LoginPage
        │
        ▼
2. AuthProvider.login() called
        │
        ▼
3. POST /auth/login to server
        │
        ▼
4. Server validates with Supabase Auth
        │
        ▼
5. Server fetches employee data from KV store
        │
        ▼
6. Server returns JWT + user data
        │
        ▼
7. AuthProvider stores token in localStorage
        │
        ▼
8. App redirects to Dashboard
```

### Example 2: Mark Attendance Flow

```
1. User clicks "Check In" on AttendanceManagement
        │
        ▼
2. POST /attendance/checkin with date & location
        │
        ▼
3. Server authenticates JWT token
        │
        ▼
4. Server creates attendance record
        │
        ▼
5. Server stores in KV: attendance:{userId}:{date}
        │
        ▼
6. Server returns attendance data
        │
        ▼
7. UI updates with check-in time
```

### Example 3: Approve Leave Flow

```
1. Manager clicks approve on LeaveManagement
        │
        ▼
2. PUT /leave/approve/:id
        │
        ▼
3. Server checks user role (manager/admin)
        │
        ▼
4. Server updates leave status to "approved"
        │
        ▼
5. Server adds approver info & timestamp
        │
        ▼
6. Server returns updated leave
        │
        ▼
7. UI refreshes leave list
```

---

## 🔌 API Route Structure

### Server Routes (`/supabase/functions/server/index.tsx`)

```typescript
Authentication Routes:
├── POST   /make-server-937488f4/auth/register
├── POST   /make-server-937488f4/auth/login
└── GET    /make-server-937488f4/auth/me

Employee Routes:
├── GET    /make-server-937488f4/employees
├── GET    /make-server-937488f4/employees/:id
├── PUT    /make-server-937488f4/employees/:id
└── DELETE /make-server-937488f4/employees/:id

Attendance Routes:
├── POST   /make-server-937488f4/attendance/checkin
├── POST   /make-server-937488f4/attendance/checkout
├── GET    /make-server-937488f4/attendance/:empId
└── GET    /make-server-937488f4/attendance

Leave Routes:
├── POST   /make-server-937488f4/leave/apply
├── GET    /make-server-937488f4/leave/list
├── PUT    /make-server-937488f4/leave/approve/:id
└── PUT    /make-server-937488f4/leave/reject/:id

Recruitment Routes:
├── POST   /make-server-937488f4/jobs
├── GET    /make-server-937488f4/jobs
├── POST   /make-server-937488f4/candidates
├── GET    /make-server-937488f4/candidates
└── PUT    /make-server-937488f4/candidates/status/:id

Performance Routes:
├── POST   /make-server-937488f4/performance/review
└── GET    /make-server-937488f4/performance/:empId

Department Routes:
├── POST   /make-server-937488f4/departments
└── GET    /make-server-937488f4/departments

Dashboard Routes:
└── GET    /make-server-937488f4/dashboard/stats
```

---

## 💾 Database Schema (KV Store)

### Key Patterns

```
Users/Employees:
employee:{userId}

Attendance Records:
attendance:{userId}:{date}

Leave Requests:
leave:{userId}:{timestamp}

Job Postings:
job:{timestamp}

Candidates:
candidate:{timestamp}

Performance Reviews:
review:{userId}:{timestamp}

Departments:
dept:{timestamp}

Email Lookup:
user:email:{email} → userId
```

---

## 🎨 Component Hierarchy

```
App
└── AuthProvider
    ├── LoginPage
    ├── RegisterPage
    └── Authenticated Layout
        ├── Sidebar
        │   ├── Logo
        │   ├── Navigation Menu
        │   └── User Profile
        │
        └── Main Content Area
            ├── Dashboard
            │   ├── Stats Cards
            │   ├── Activity Feed
            │   └── Quick Actions
            │
            ├── EmployeeDirectory
            │   ├── Search Bar
            │   ├── View Toggle (Grid/List)
            │   ├── Employee Cards/Rows
            │   └── Employee Profile Modal
            │
            ├── AttendanceManagement
            │   ├── Check In/Out Panel
            │   ├── Calendar View
            │   └── Recent Attendance List
            │
            ├── LeaveManagement
            │   ├── Leave Balance Cards
            │   ├── Apply Leave Dialog
            │   └── Leave Requests Table
            │
            ├── RecruitmentATS
            │   ├── Job Stats Cards
            │   ├── Post Job Dialog
            │   ├── Job Listings
            │   └── Candidate Pipeline
            │
            ├── PerformanceReview
            │   ├── Review Stats
            │   ├── Create Review Dialog
            │   ├── Performance Breakdown
            │   └── Review History
            │
            └── Settings
                ├── Tabs Navigation
                ├── Departments Tab
                ├── Roles Tab
                ├── Policies Tab
                └── General Tab
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────┐
│  1. User visits app                     │
│     - No token found                    │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. Shows LoginPage                     │
│     - User enters credentials           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. POST /auth/login                    │
│     - Server validates                  │
│     - Returns JWT + user data           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  4. Store token in localStorage         │
│     - AuthProvider updates state        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  5. Subsequent requests include:        │
│     Authorization: Bearer {token}       │
└─────────────────────────────────────────┘
```

---

## 🛡️ Role-Based Access Control

### Permission Matrix

```
Feature                 │ Admin │ Manager │ Employee
────────────────────────┼───────┼─────────┼─────────
View Dashboard          │   ✓   │    ✓    │    ✓
View Employees          │   ✓   │    ✓    │    ✓
Edit Own Profile        │   ✓   │    ✓    │    ✓
Edit Others' Profiles   │   ✓   │    ✗    │    ✗
Delete Employees        │   ✓   │    ✗    │    ✗
Mark Attendance         │   ✓   │    ✓    │    ✓
Apply for Leave         │   ✓   │    ✓    │    ✓
Approve/Reject Leaves   │   ✓   │    ✓    │    ✗
Post Jobs               │   ✓   │    ✓    │    ✗
Add Candidates          │   ✓   │    ✓    │    ✗
Create Reviews          │   ✓   │    ✓    │    ✗
View Own Reviews        │   ✓   │    ✓    │    ✓
Manage Departments      │   ✓   │    ✗    │    ✗
System Settings         │   ✓   │    ✗    │    ✗
```

### Implementation

```typescript
// In server routes
const isAdmin = currentEmployee?.role === 'admin';
const isManager = currentEmployee?.role === 'manager';

if (!isAdmin && !isManager) {
  return c.json({ error: 'Forbidden' }, 403);
}
```

---

## 📦 Dependencies

### Core Dependencies
- `react` - UI framework
- `react-dom` - React DOM renderer

### UI & Styling
- `tailwindcss` - Utility-first CSS
- `@radix-ui/*` - Headless UI components
- `lucide-react` - Icon library
- `class-variance-authority` - CSS variant handling
- `clsx` - Conditional className utility

### Backend
- `hono` - Web framework for Deno
- `@supabase/supabase-js` - Supabase client

### Forms & Validation
- `react-hook-form` - Form management
- `zod` - Schema validation

### Utilities
- `date-fns` - Date manipulation
- `sonner` - Toast notifications

---

## 🚀 Deployment Configuration

### Environment Variables (Pre-configured)

```env
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]
```

### Edge Function Configuration

```
Runtime: Deno
Entry: /supabase/functions/server/index.tsx
Path: /functions/v1/make-server-937488f4/*
```

---

## 📝 Code Organization Patterns

### Component Pattern
```typescript
// Standard component structure
import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

export function MyComponent() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

### API Call Pattern
```typescript
const token = localStorage.getItem('access_token');
const response = await fetch(
  `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/endpoint`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }
);
```

### Server Route Pattern
```typescript
app.post('/make-server-937488f4/endpoint', async (c) => {
  try {
    // Authenticate
    const token = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    
    // Process request
    const body = await c.req.json();
    
    // Database operation
    await kv.set(key, value);
    
    // Return response
    return c.json({ success: true, data });
  } catch (error) {
    console.log('Error:', error);
    return c.json({ error: 'Failed' }, 500);
  }
});
```

---

## 🎯 Key Features Summary

### ✅ Implemented Features

1. **Authentication System**
   - JWT-based login/logout
   - User registration
   - Session management
   - Role-based access

2. **Employee Management**
   - CRUD operations
   - Profile management
   - Grid/List views
   - Search functionality

3. **Attendance Tracking**
   - Check-in/out system
   - Work hours calculation
   - Calendar view
   - Monthly statistics

4. **Leave Management**
   - Leave application
   - Approval workflow
   - Leave balance tracking
   - Multiple leave types

5. **Recruitment ATS**
   - Job posting
   - Candidate management
   - Pipeline stages
   - Application tracking

6. **Performance Reviews**
   - Multi-category ratings
   - Review history
   - Goal setting
   - Performance analytics

7. **Settings**
   - Department management
   - Role configuration
   - Company policies
   - System settings

---

## 📖 Related Documentation

- **DOCUMENTATION.md** - Complete system documentation
- **QUICK_START.md** - Quick start guide for new users
- **PROJECT_STRUCTURE.md** - This file

---

**Last Updated**: November 2024
**Version**: 1.0.0
