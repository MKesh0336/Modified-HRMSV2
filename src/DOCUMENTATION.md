# HRMS (Human Resource Management System) - Complete Documentation

## 🎯 Overview

A full-stack Human Resource Management System built with React, Tailwind CSS, and Supabase backend. This production-ready application provides comprehensive HR functionality including employee management, attendance tracking, leave management, recruitment (ATS), performance reviews, and organizational settings.

---

## 📋 Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Getting Started](#getting-started)
7. [User Roles](#user-roles)
8. [Module Documentation](#module-documentation)
9. [Security](#security)
10. [Deployment](#deployment)

---

## ✨ Features

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Manager, Employee)
- ✅ Secure login/register system
- ✅ Auto-session management

### Employee Management
- ✅ Employee directory with grid/list views
- ✅ Detailed employee profiles
- ✅ Edit employee information
- ✅ Department assignment
- ✅ Search and filter employees

### Attendance Management
- ✅ Check-in/check-out system
- ✅ Attendance calendar view
- ✅ Work hours tracking
- ✅ Attendance history
- ✅ Real-time attendance stats

### Leave Management
- ✅ Apply for leaves
- ✅ Multiple leave types (Annual, Sick, Personal, etc.)
- ✅ Leave approval workflow
- ✅ Leave balance tracking
- ✅ Manager approval/rejection

### Recruitment (ATS)
- ✅ Job posting management
- ✅ Candidate pipeline
- ✅ Stage-based recruitment workflow
- ✅ Candidate information management
- ✅ Application tracking

### Performance Reviews
- ✅ Create performance reviews
- ✅ Multi-category ratings
- ✅ Strengths and improvement areas
- ✅ Goal setting
- ✅ Review history

### Settings & Configuration
- ✅ Department management
- ✅ Role & permission configuration
- ✅ Company policy management
- ✅ General system settings
- ✅ Work hours configuration

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Shadcn/UI** - Component library
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend platform
- **Deno** - Runtime for edge functions
- **Hono** - Web framework
- **Supabase Auth** - Authentication
- **KV Store** - Database storage

### Additional Libraries
- **React Hook Form** - Form management
- **Date-fns** - Date manipulation
- **Sonner** - Toast notifications

---

## 🏗 Architecture

### Three-Tier Architecture

```
┌─────────────────┐
│    Frontend     │
│  (React + UI)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Server Layer   │
│ (Hono + Deno)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Database     │
│   (KV Store)    │
└─────────────────┘
```

### File Structure

```
/
├── App.tsx                          # Main application entry
├── components/
│   ├── AuthProvider.tsx             # Authentication context
│   ├── LoginPage.tsx                # Login UI
│   ├── RegisterPage.tsx             # Registration UI
│   ├── Sidebar.tsx                  # Navigation sidebar
│   ├── Dashboard.tsx                # Dashboard view
│   ├── EmployeeDirectory.tsx        # Employee list
│   ├── EmployeeProfile.tsx          # Employee details
│   ├── AttendanceManagement.tsx     # Attendance module
│   ├── LeaveManagement.tsx          # Leave module
│   ├── RecruitmentATS.tsx           # Recruitment module
│   ├── PerformanceReview.tsx        # Performance module
│   ├── Settings.tsx                 # Settings module
│   └── ui/                          # Shadcn components
├── supabase/functions/server/
│   ├── index.tsx                    # Server routes
│   └── kv_store.tsx                 # Database utilities
├── utils/supabase/
│   └── info.tsx                     # Supabase configuration
└── styles/
    └── globals.css                  # Global styles
```

---

## 💾 Database Schema

### Collections (Key-Value Store)

#### 1. Users / Employees
**Key Pattern:** `employee:{userId}`

```typescript
{
  id: string;              // User ID (from auth)
  email: string;           // Email address
  name: string;            // Full name
  role: string;            // admin | manager | employee
  department: string;      // Department name
  jobTitle: string;        // Job title
  phoneNumber: string;     // Contact number
  dateOfBirth: string;     // DOB
  hireDate: string;        // Hire date
  status: string;          // active | inactive
  profileImage: string;    // Image URL
  address: string;         // Address
  emergencyContact: string;// Emergency contact
  createdAt: string;       // Creation timestamp
}
```

#### 2. Attendance
**Key Pattern:** `attendance:{employeeId}:{date}`

```typescript
{
  id: string;              // Unique ID
  employeeId: string;      // Employee reference
  date: string;            // Attendance date
  checkIn: string;         // Check-in time
  checkOut: string;        // Check-out time
  location: string;        // Location
  notes: string;           // Notes
  status: string;          // present | absent | late
  totalHours: number;      // Worked hours
}
```

#### 3. Leaves
**Key Pattern:** `leave:{employeeId}:{timestamp}`

```typescript
{
  id: string;              // Unique ID
  employeeId: string;      // Employee reference
  leaveType: string;       // annual | sick | personal | unpaid
  startDate: string;       // Start date
  endDate: string;         // End date
  reason: string;          // Leave reason
  halfDay: boolean;        // Half day flag
  status: string;          // pending | approved | rejected
  appliedAt: string;       // Application timestamp
  approvedBy: string;      // Approver ID
  approvedAt: string;      // Approval timestamp
  rejectedReason: string;  // Rejection reason
}
```

#### 4. Jobs
**Key Pattern:** `job:{timestamp}`

```typescript
{
  id: string;              // Unique ID
  title: string;           // Job title
  department: string;      // Department
  location: string;        // Location
  type: string;            // full-time | part-time | contract
  description: string;     // Job description
  requirements: string;    // Requirements
  salary: string;          // Salary range
  status: string;          // open | closed
  postedBy: string;        // Posted by user ID
  postedAt: string;        // Posted timestamp
  closedAt: string;        // Closed timestamp
}
```

#### 5. Candidates
**Key Pattern:** `candidate:{timestamp}`

```typescript
{
  id: string;              // Unique ID
  jobId: string;           // Job reference
  name: string;            // Candidate name
  email: string;           // Email
  phone: string;           // Phone number
  resume: string;          // Resume URL
  linkedIn: string;        // LinkedIn profile
  stage: string;           // applied | screening | interview | offer | hired
  appliedAt: string;       // Application timestamp
  notes: Array;            // Interview notes
  interviews: Array;       // Interview schedule
}
```

#### 6. Performance Reviews
**Key Pattern:** `review:{employeeId}:{timestamp}`

```typescript
{
  id: string;              // Unique ID
  employeeId: string;      // Employee reference
  reviewerId: string;      // Reviewer ID
  period: string;          // Review period
  ratings: {
    quality: number;       // 1-5
    productivity: number;  // 1-5
    communication: number; // 1-5
    teamwork: number;      // 1-5
    leadership: number;    // 1-5
  };
  strengths: string;       // Key strengths
  improvements: string;    // Areas for improvement
  goals: string;           // Goals for next period
  overallRating: number;   // Average rating
  createdAt: string;       // Creation timestamp
}
```

#### 7. Departments
**Key Pattern:** `dept:{timestamp}`

```typescript
{
  id: string;              // Unique ID
  name: string;            // Department name
  description: string;     // Description
  headId: string;          // Department head user ID
  createdAt: string;       // Creation timestamp
}
```

---

## 🔌 API Endpoints

### Authentication

#### POST `/auth/register`
Register a new user
```json
{
  "email": "user@company.com",
  "password": "password123",
  "name": "John Doe",
  "role": "employee"
}
```

#### POST `/auth/login`
Login user
```json
{
  "email": "user@company.com",
  "password": "password123"
}
```

#### GET `/auth/me`
Get current user
- Headers: `Authorization: Bearer {token}`

---

### Employees

#### GET `/employees`
Get all employees
- Headers: `Authorization: Bearer {token}`

#### GET `/employees/:id`
Get single employee
- Headers: `Authorization: Bearer {token}`

#### PUT `/employees/:id`
Update employee
- Headers: `Authorization: Bearer {token}`
```json
{
  "name": "John Doe",
  "jobTitle": "Senior Developer",
  "department": "Engineering",
  "phoneNumber": "+1234567890"
}
```

#### DELETE `/employees/:id`
Delete employee (Admin only)
- Headers: `Authorization: Bearer {token}`

---

### Attendance

#### POST `/attendance/checkin`
Check in
- Headers: `Authorization: Bearer {token}`
```json
{
  "date": "2024-01-15",
  "location": "Office"
}
```

#### POST `/attendance/checkout`
Check out
- Headers: `Authorization: Bearer {token}`
```json
{
  "date": "2024-01-15"
}
```

#### GET `/attendance/:empId`
Get employee attendance
- Headers: `Authorization: Bearer {token}`

#### GET `/attendance`
Get all attendance records
- Headers: `Authorization: Bearer {token}`

---

### Leave Management

#### POST `/leave/apply`
Apply for leave
- Headers: `Authorization: Bearer {token}`
```json
{
  "leaveType": "annual",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "reason": "Vacation",
  "halfDay": false
}
```

#### GET `/leave/list`
Get all leaves
- Headers: `Authorization: Bearer {token}`

#### PUT `/leave/approve/:id`
Approve leave (Manager/Admin only)
- Headers: `Authorization: Bearer {token}`

#### PUT `/leave/reject/:id`
Reject leave (Manager/Admin only)
- Headers: `Authorization: Bearer {token}`
```json
{
  "reason": "Insufficient leave balance"
}
```

---

### Recruitment (ATS)

#### POST `/jobs`
Create job posting (Manager/Admin only)
- Headers: `Authorization: Bearer {token}`
```json
{
  "title": "Senior Developer",
  "department": "Engineering",
  "location": "San Francisco",
  "type": "full-time",
  "description": "...",
  "requirements": "...",
  "salary": "$120k - $150k"
}
```

#### GET `/jobs`
Get all jobs

#### POST `/candidates`
Add candidate
- Headers: `Authorization: Bearer {token}`
```json
{
  "jobId": "job:123456",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "linkedIn": "linkedin.com/in/janesmith"
}
```

#### GET `/candidates`
Get all candidates
- Headers: `Authorization: Bearer {token}`

#### PUT `/candidates/status/:id`
Update candidate stage
- Headers: `Authorization: Bearer {token}`
```json
{
  "stage": "interview",
  "notes": "Scheduled for technical interview"
}
```

---

### Performance Reviews

#### POST `/performance/review`
Create review (Manager/Admin only)
- Headers: `Authorization: Bearer {token}`
```json
{
  "employeeId": "user-id",
  "period": "Q4 2024",
  "ratings": {
    "quality": 5,
    "productivity": 4,
    "communication": 5,
    "teamwork": 5,
    "leadership": 4
  },
  "strengths": "...",
  "improvements": "...",
  "goals": "...",
  "overallRating": 4.6
}
```

#### GET `/performance/:empId`
Get employee reviews
- Headers: `Authorization: Bearer {token}`

---

### Departments

#### POST `/departments`
Create department (Admin only)
- Headers: `Authorization: Bearer {token}`
```json
{
  "name": "Engineering",
  "description": "Software development team",
  "headId": "user-id"
}
```

#### GET `/departments`
Get all departments
- Headers: `Authorization: Bearer {token}`

---

### Dashboard

#### GET `/dashboard/stats`
Get dashboard statistics
- Headers: `Authorization: Bearer {token}`

---

## 🚀 Getting Started

### Prerequisites
- The application is already deployed and running in Figma Make
- Supabase backend is pre-configured

### First Time Setup

1. **Create an Admin Account**
   - Navigate to the application
   - Click "Register"
   - Fill in your details
   - Select role: "Admin"
   - Complete registration

2. **Login**
   - Use your credentials to login
   - You'll be redirected to the dashboard

3. **Configure Organization**
   - Go to Settings
   - Add departments
   - Configure work hours
   - Set up leave policies

4. **Add Employees**
   - Navigate to Employees
   - Click "Add Employee"
   - Fill in employee details
   - Assign department and role

---

## 👥 User Roles

### Admin
**Full system access**
- ✅ All employee operations
- ✅ Department management
- ✅ Settings configuration
- ✅ Approve/reject leaves
- ✅ Create job postings
- ✅ Conduct performance reviews
- ✅ View all reports

### Manager
**Team management access**
- ✅ View all employees
- ✅ Approve/reject team leaves
- ✅ Create job postings
- ✅ Conduct performance reviews
- ✅ View team reports
- ❌ System settings
- ❌ Delete employees

### Employee
**Standard user access**
- ✅ View own profile
- ✅ Edit personal information
- ✅ Mark attendance (check-in/out)
- ✅ Apply for leaves
- ✅ View own reviews
- ❌ Approve leaves
- ❌ Create jobs
- ❌ Conduct reviews

---

## 📖 Module Documentation

### Dashboard
The dashboard provides an overview of key HR metrics:
- Total and active employees
- Pending leave requests
- Today's attendance
- Open job positions
- Recent activity feed
- Quick action buttons

### Employee Management
Comprehensive employee data management:
- **Grid View**: Card-based layout with profile images
- **List View**: Table format with sortable columns
- **Profile**: Detailed employee information with edit capability
- **Search**: Filter by name, email, or department

### Attendance Management
Track employee work hours:
- **Check-In/Out**: Real-time attendance marking
- **Calendar**: Visual attendance history
- **Statistics**: Monthly work hours and averages
- **Reports**: Export attendance data

### Leave Management
Handle leave requests and approvals:
- **Apply**: Submit leave requests with reason
- **Approve/Reject**: Manager workflow
- **Balance**: Track available leave days
- **Types**: Annual, sick, personal, maternity, paternity

### Recruitment (ATS)
Applicant tracking system:
- **Job Postings**: Create and manage job openings
- **Pipeline**: Visual candidate stages
- **Stages**: Applied → Screening → Interview → Offer → Hired
- **Candidate Cards**: Contact info and status

### Performance Reviews
Employee performance management:
- **Create Review**: Multi-category ratings (1-5 stars)
- **Categories**: Quality, productivity, communication, teamwork, leadership
- **Feedback**: Strengths, improvements, goals
- **History**: View past reviews

### Settings
Organization configuration:
- **Departments**: Create and manage departments
- **Roles**: Define permissions per role
- **Policies**: Company policies and documents
- **General**: Work hours, leave settings, company info

---

## 🔒 Security

### Authentication
- JWT-based token authentication
- Secure password hashing
- Auto-session management
- Token stored in localStorage

### Authorization
- Role-based access control (RBAC)
- Route-level permission checks
- API endpoint protection
- Middleware validation

### Data Protection
- HTTPS encryption in transit
- Supabase Row Level Security
- Input validation
- XSS protection

### Best Practices
- Never expose Supabase service role key to frontend
- Use Bearer tokens for API requests
- Implement proper error handling
- Log security events

---

## 🌐 Deployment

### Current Deployment
The application is already deployed on Figma Make with:
- ✅ Production Supabase backend
- ✅ Edge functions deployed
- ✅ Database configured
- ✅ Authentication enabled

### Environment Variables
The following are pre-configured:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server only)

---

## 📝 Usage Examples

### Example 1: Register First Admin
1. Open the application
2. Click "Don't have an account? Register"
3. Fill in:
   - Name: "Admin User"
   - Email: "admin@company.com"
   - Password: "securepassword123"
   - Role: "Admin"
4. Click "Create Account"

### Example 2: Add Employee
1. Login as Admin
2. Navigate to "Employees"
3. Click "Add Employee"
4. Fill employee details
5. Save

### Example 3: Mark Attendance
1. Login as Employee
2. Navigate to "Attendance"
3. Click "Check In"
4. At end of day, click "Check Out"

### Example 4: Apply for Leave
1. Navigate to "Leave Management"
2. Click "Apply for Leave"
3. Select leave type and dates
4. Enter reason
5. Submit

### Example 5: Approve Leave (Manager)
1. Login as Manager/Admin
2. Navigate to "Leave Management"
3. See pending requests
4. Click approve/reject buttons

---

## 🐛 Troubleshooting

### Login Issues
- **Problem**: Cannot login
- **Solution**: Verify email and password, check if account exists

### Permission Denied
- **Problem**: Cannot access certain features
- **Solution**: Check your user role, some features require Admin/Manager access

### Attendance Not Saving
- **Problem**: Check-in fails
- **Solution**: Ensure you're logged in and have active session

### Leave Application Failed
- **Problem**: Cannot submit leave
- **Solution**: Check date range is valid and form is complete

---

## 🎨 Design System

### Colors
- **Primary**: Indigo (#4F46E5)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Gray Scale**: 50-900

### Typography
- **Headings**: Medium weight (500)
- **Body**: Normal weight (400)
- **Base Size**: 16px
- **Scale**: sm, base, lg, xl, 2xl

### Spacing
- **Scale**: 0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32
- **Container Padding**: 2rem (32px)
- **Card Padding**: 1.5rem (24px)

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost
- **Cards**: Elevation shadow
- **Inputs**: Outlined with focus states
- **Badges**: Status indicators

---

## 📊 Future Enhancements

Potential features for future versions:
- 📧 Email notifications
- 📱 Mobile app
- 📈 Advanced analytics and reporting
- 💬 Internal messaging
- 📅 Meeting scheduler
- 💰 Payroll integration
- 🎓 Training management
- 📄 Document management with file storage
- 🔔 Real-time notifications
- 🌍 Multi-language support

---

## 💡 Tips & Best Practices

1. **Regular Backups**: Export data regularly
2. **User Training**: Train staff on system usage
3. **Data Validation**: Always validate input data
4. **Security**: Change default passwords immediately
5. **Monitoring**: Monitor system usage and performance
6. **Updates**: Keep user profiles updated
7. **Reviews**: Conduct regular performance reviews
8. **Policies**: Keep company policies current

---

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Contact your system administrator

---

## 📄 License

This HRMS system is built for internal use. All rights reserved.

---

**Last Updated**: November 2024
**Version**: 1.0.0
**Built with**: React, Tailwind CSS, Supabase
