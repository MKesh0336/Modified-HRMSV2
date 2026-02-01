# 🚀 HRMS - Complete Deployment & User Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Deployment Guide](#deployment-guide)
3. [Initial Setup & Admin Creation](#initial-setup--admin-creation)
4. [Admin Features](#admin-features)
5. [Manager Features](#manager-features)
6. [Employee Features](#employee-features)
7. [Technical Architecture](#technical-architecture)
8. [Troubleshooting](#troubleshooting)

---

## System Overview

### 🎯 What This HRMS Does

A complete **Human Resource Management System** with:

✅ **Authentication & Roles**
- JWT-based authentication
- 3 Roles: Admin, Manager, Employee
- **Admin has FULL control over everything**
- Secure role-based access control (RBAC)

✅ **Employee Management**
- Create, update, delete employees (Admin only)
- Employee lifecycle tracking
- Shift management per employee
- Department assignment

✅ **Attendance & GPS Tracking**
- GPS-based check-in/check-out
- Live location tracking
- Daily/monthly attendance reports
- Late arrival tracking

✅ **Leave Management**
- Leave requests by employees
- Approval by managers/admins
- Leave balance tracking
- Leave history

✅ **Recruitment ATS**
- Post job openings (Admin only)
- **DELETE job postings (Admin only)** ✨
- Manage candidates
- **CONVERT candidate to employee after hiring** ✨
- Interview scheduling
- Candidate pipeline tracking

✅ **Performance Management**
- Set employee goals
- Conduct performance reviews
- Track ratings and progress
- Generate performance reports

✅ **Task Management**
- Managers assign tasks to employees
- Set due dates and priorities
- Track task status
- Task completion reports

✅ **Payroll System**
- Manual overtime entry
- Monthly payroll calculations
- Salary management

✅ **Department Management** ✨ **NEW**
- Create/update/delete departments (Admin only)
- Assign department heads
- View department employees

✅ **Company Policies** ✨ **NEW**
- Create/update/delete policies (Admin only)
- Policy versioning
- All employees can view policies

---

## Deployment Guide

### Step 1: Create Supabase Project

1. **Go to** [https://supabase.com](https://supabase.com)
2. **Sign up** or log in
3. **Click** "New Project"
4. **Fill in:**
   - Project Name: `hrms-production`
   - Database Password: **Strong password** (Save this!)
   - Region: Choose nearest to your location
   - Plan: Free tier is sufficient
5. **Click** "Create new project" (takes 2-3 minutes)

6. **Get Your Credentials:**
   - Go to **Settings → API**
   - Copy:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **Anon/Public Key**: `eyJhbGc...` (starts with eyJ)
     - **Service Role Key**: `eyJhbGc...` (different key, keep SECRET!)
   - Go to **Settings → Database**
   - Copy **Connection String (URI format)**

---

### Step 2: Deploy Backend (Supabase Edge Functions)

#### Install Supabase CLI

```bash
# macOS/Linux
brew install supabase/tap/supabase

# Windows (via npm)
npm install -g supabase

# Verify installation
supabase --version
```

#### Login to Supabase

```bash
supabase login
```
- Browser will open for authentication
- Login with your Supabase account

#### Link Your Project

```bash
# Get project ref from your Supabase project URL
# Example: https://abcdefgh.supabase.co → ref is "abcdefgh"

supabase link --project-ref YOUR_PROJECT_REF
```

#### Deploy Edge Function

```bash
# Navigate to your project directory
cd /path/to/your/hrms-project

# Deploy the server function
supabase functions deploy server

# Wait for deployment (1-2 minutes)
```

#### Verify Backend is Running

```bash
curl https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-937488f4/health
```

**Expected Response:**
```json
{"status":"ok"}
```

---

### Step 3: Deploy Frontend

#### Option A: Vercel (Recommended - 5 Minutes)

1. **Push Code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial HRMS deployment"
   git branch -M main
   git remote add origin https://github.com/MKesh0336/hrms.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
3. **Add Environment Variables:**
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase Anon Key

4. **Click "Deploy"**
   - Deployment takes 2-3 minutes
   - You'll get a URL like: `https://hrms-xxx.vercel.app`

---

#### Option B: Netlify

1. **Push to GitHub** (same as Vercel)

2. **Deploy to Netlify**
   - Go to [https://netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect GitHub and select repository
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variables:**
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. **Click "Deploy"**

---

#### Option C: Self-Hosted (Docker)

```bash
# Build Docker image
docker build -t hrms-app .

# Run container
docker run -d -p 3000:3000 \
  -e VITE_SUPABASE_URL=your_supabase_url \
  -e VITE_SUPABASE_ANON_KEY=your_anon_key \
  --name hrms \
  hrms-app

# Access at http://localhost:3000
```

---

## Initial Setup & Admin Creation

### Method 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project
   - Navigate to **Authentication → Users**

2. **Create Admin User**
   - Click "Add User" → "Create new user"
   - **Email:** `admin@yourcompany.com`
   - **Password:** Strong password
   - **Auto Confirm User:** ✅ **Enable this!**
   - Click "Create user"
   - **Copy the User ID** (UUID format)

3. **Add Admin to Database**
   - Go to **Table Editor → `kv_store_937488f4`**
   - Click "Insert row"
   - **Fill in:**
     ```
     key: employee:<USER_ID>
     value: {
       "id": "<USER_ID>",
       "email": "admin@yourcompany.com",
       "name": "System Administrator",
       "role": "admin",
       "department": "Management",
       "jobTitle": "System Administrator",
       "phoneNumber": "+1234567890",
       "hireDate": "2025-01-01T00:00:00Z",
       "status": "active",
       "lifecycleStatus": "active",
       "shiftType": "morning",
       "shiftStartTime": "09:00",
       "shiftEndTime": "17:00",
       "monthlySalary": 10000,
       "createdAt": "2025-01-01T00:00:00Z"
     }
     ```
   - Replace `<USER_ID>` with the UUID you copied
   - Click "Save"

4. **Login to HRMS**
   - Go to your deployed HRMS URL
   - Login with:
     - Email: `admin@yourcompany.com`
     - Password: (the password you set)

---

### Method 2: Via API Call (Advanced)

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/make-server-937488f4/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -d '{
    "email": "admin@yourcompany.com",
    "password": "YourStrongPassword123!",
    "name": "System Administrator",
    "role": "admin",
    "department": "Management",
    "jobTitle": "Administrator",
    "monthlySalary": 10000
  }'
```

---

## Admin Features

### 🔧 Admin Has FULL Control Over:

1. ✅ **All Employee Data** - View, edit, delete any employee
2. ✅ **All Departments** - Create, update, delete departments
3. ✅ **All Policies** - Create, update, delete company policies
4. ✅ **All Job Postings** - Create, delete job postings
5. ✅ **Convert Candidates** - Convert hired candidates to employees
6. ✅ **All Attendance Records** - View, edit all attendance
7. ✅ **All Leave Requests** - Approve/reject any leave
8. ✅ **All Performance Reviews** - Create, view all reviews
9. ✅ **All Tasks** - View and manage all tasks
10. ✅ **Payroll Management** - Manage all payroll and overtime

---

### 1️⃣ Creating Employees

**Steps:**
1. Login as Admin
2. Click **"Employees"** in sidebar
3. Click **"Add Employee"** button
4. **Fill in Employee Form:**
   - **Personal Info:**
     - Full Name *
     - Email * (will be login email)
     - Phone Number
     - Date of Birth
   - **Job Details:**
     - Department *
     - Job Title *
     - Hire Date *
     - Employment Status: Active/On Leave/Probation/Terminated
     - Role: Admin/Manager/Employee *
   - **Shift Details:**
     - Shift Type: Morning/Evening/Night/Flexible
     - Shift Start Time (e.g., 09:00)
     - Shift End Time (e.g., 17:00)
     - Break Duration (minutes)
     - Working Days: Mon-Fri, Mon-Sat, etc.
   - **Compensation:**
     - Monthly Salary
   - **Manager:**
     - Reports To (select manager)

5. Click **"Create Employee"**
6. System automatically:
   - Creates Supabase Auth account
   - Assigns temporary password
   - Sends welcome email
   - Adds to employee database

---

### 2️⃣ Managing Departments

**Create Department:**
1. Click **"Departments"** in sidebar
2. Click **"Add Department"**
3. Fill in:
   - Department Name (e.g., "Engineering")
   - Description (optional)
   - Department Head (select from employees)
4. Click **"Create Department"**

**Edit Department:**
1. Find department card
2. Click "Edit" icon
3. Update details
4. Click "Update Department"

**Delete Department:**
1. Find department card
2. Click "Delete" icon (trash)
3. Confirm deletion
4. **Note:** Cannot delete if employees are assigned

---

### 3️⃣ Managing Company Policies

**Create Policy:**
1. Click **"Policies"** in sidebar
2. Click **"Add Policy"**
3. Fill in:
   - **Title**: e.g., "Remote Work Policy"
   - **Category**: General, HR, IT, Security, Compliance, Benefits
   - **Content**: Full policy text (Markdown supported)
   - **Effective Date**: When policy takes effect
   - **Status**: Active, Draft, Archived
4. Click **"Create Policy"**

**Edit Policy:**
1. Find policy
2. Click "Edit" button
3. Update content
4. System automatically:
   - Increments version number
   - Tracks update history
5. Click "Update Policy"

**Delete Policy:**
1. Find policy
2. Click "Delete" (trash icon)
3. Confirm deletion

**View Policy:**
- All users (Admin, Manager, Employee) can view policies
- Click "View" on any policy to see full details

---

### 4️⃣ Recruitment Management

**Post a Job:**
1. Click **"Recruitment"** in sidebar
2. Click **"Post Job"**
3. Fill in:
   - Job Title *
   - Department *
   - Location *
   - Job Type: Full-time, Part-time, Contract, Internship
   - Description *
   - Requirements *
   - Salary Range
4. Click **"Post Job"**

**Delete a Job Posting:** ✨ **NEW**
1. Find job card
2. Click "Delete" (trash icon) - **Only visible to Admins**
3. Confirm deletion
4. Job and all associated data removed

**Add Candidate:**
1. Click "Add Candidate"
2. Select job position
3. Fill in candidate details:
   - Name, Email, Phone
   - LinkedIn (optional)
4. Click "Add Candidate"

**Manage Candidate Pipeline:**
1. View candidates organized by stage:
   - Applied → Screening → Interview → Offer → Hired → Rejected
2. Change stage: Select dropdown on candidate card
3. Track progress through pipeline

**Convert Candidate to Employee:** ✨ **NEW**
1. Move candidate to "Offer" or "Hired" stage
2. **"Convert to Employee"** button appears (Admin only)
3. Click **"Convert to Employee"**
4. **Fill in Employee Details:**
   - Department *
   - Job Title *
   - Joining Date *
   - Monthly Salary *
   - Shift Type *
   - Shift Start/End Time *
   - Manager ID *
   - Password * (temporary password for employee)
5. Click **"Convert to Employee"**
6. System automatically:
   - Creates employee account
   - Creates Supabase auth user
   - Updates candidate status to "Hired"
   - Links candidate history to employee record
   - Employee can now login

---

### 5️⃣ Attendance Management & Live Tracking

**View Daily Attendance:**
1. Click **"Attendance"** in sidebar
2. **Today's View** shows:
   - Who's checked in (green)
   - Who's checked out (grey)
   - Who's absent (red)
   - Late arrivals (yellow)
3. **Filter by:**
   - Date picker (select any date)
   - Department dropdown
   - Employee search

**Live Location Tracking:**
1. Go to **"Attendance"** → **"Live Tracking"** tab
2. **Map View:**
   - See all checked-in employees on map
   - Red markers = Currently working
   - Green markers = Checked out
   - Click marker for employee details
3. **List View:**
   - Table of all employees
   - Shows: Status, Last Location Update, GPS Coordinates, Address
   - Click "Track Location" for detailed view

**Track Specific Employee:**
1. Search for employee
2. Click **"Track Location"**
3. View:
   - Real-time GPS location
   - Location history for today
   - Movement trail on map
   - Distance from office

**Monthly Attendance Report:**
1. Go to **"Attendance"** → **"Reports"**
2. Select month/year
3. Select department (optional)
4. Click **"Generate Report"**
5. **Report shows:**
   - Total working days
   - Present/absent days
   - Late arrivals count
   - Early departures
   - Total hours worked
   - Attendance percentage
6. Click **"Download"** (Excel, PDF, CSV)

---

### 6️⃣ Performance Reports

**View Employee Performance:**
1. Click **"Performance"** in sidebar
2. Filter by:
   - Employee
   - Department
   - Review period (Q1, Q2, Q3, Q4, Annual)
   - Date range

**Generate Performance Report:**
1. Select employee or department
2. Click **"Generate Report"**
3. **Report includes:**
   - Overall rating (1-5 stars)
   - Goal achievement percentage
   - Competency scores:
     - Technical skills
     - Communication
     - Teamwork
     - Leadership
     - Problem solving
   - Manager comments
   - Self-assessment vs manager assessment
   - Improvement areas
   - Strengths
   - Performance trends over time
4. Export as PDF

**Create Performance Review:**
1. Click **"Create Review"**
2. Select employee
3. Fill in:
   - Review period
   - Ratings for each competency
   - Strengths
   - Areas for improvement
   - Goals for next period
   - Overall rating
4. Click **"Submit Review"**

---

### 7️⃣ Task Management Reports

**View All Tasks:**
1. Click **"Tasks"** in sidebar
2. **Admin sees all tasks** across company
3. Filter by:
   - Status: To Do, In Progress, Completed, Overdue
   - Priority: Low, Medium, High, Urgent
   - Assigned to (employee)
   - Department
   - Due date range

**Generate Task Reports:**

**Daily Report:**
1. Go to **"Tasks"** → **"Reports"**
2. Select "Daily Report"
3. Choose date
4. **Shows:**
   - Tasks due today
   - Completed tasks
   - Pending tasks
   - Overdue tasks
   - Breakdown by employee

**Monthly Report:**
1. Select "Monthly Report"
2. Choose month
3. **Report includes:**
   - Total tasks created
   - Tasks completed on time
   - Tasks completed late
   - Pending tasks
   - Average completion time
   - Employee productivity
   - Department breakdown
   - Top performers
4. **Export:** Click "Download" (PDF/Excel)

---

### 8️⃣ Leave Management

**Approve/Reject Leaves:**
1. Click **"Leave Management"**
2. **"Pending Requests"** tab shows all pending
3. Click on request to view details
4. Review:
   - Employee name
   - Leave type
   - Dates
   - Reason
   - Leave balance
5. Click **"Approve"** or **"Reject"**
6. Add comments (optional)

**View Leave Reports:**
1. Go to **"Reports"** tab
2. **Monthly Report:**
   - Total leaves taken
   - Leaves by type
   - Leaves by department
   - Frequent leave takers
3. **Employee Leave Balance:**
   - Annual leave remaining
   - Sick leave remaining
   - Leaves taken this year

---

### 9️⃣ Payroll Management

**Add Overtime Entry:**
1. Go to **"Payroll"** (in Settings or separate section)
2. Click **"Add Overtime"**
3. Fill in:
   - Employee *
   - Month *
   - Year *
   - Overtime Hours *
   - Notes
4. Click **"Save"**

**Generate Monthly Payroll:**
1. Go to **"Payroll"** → **"Generate"**
2. Select month/year
3. System calculates:
   - Base salary
   - Overtime pay
   - Total compensation
4. Export for accounting system

---

## Manager Features

### 🎯 What Managers Can Do:

✅ View their team's attendance
✅ Approve/reject team leave requests
✅ Create and assign tasks to team members
✅ Conduct performance reviews for team
✅ View team performance reports
✅ View recruitment candidates (read-only)

**Managers CANNOT:**
❌ Create/delete employees
❌ Manage departments
❌ Manage company policies
❌ Delete job postings
❌ Convert candidates to employees
❌ Access other team's data

---

### Creating and Assigning Tasks

**Step-by-Step:**

1. **Login as Manager**
2. Click **"Tasks"** in sidebar
3. Click **"Create Task"** or **"New Task"**

4. **Fill in Task Form:**
   - **Title** * (e.g., "Complete Q1 Sales Report")
   - **Description** * (Full task details)
     ```
     Example: "Compile all Q1 sales data, create charts,
              and prepare presentation for board meeting"
     ```
   - **Assigned To** * (Select employee from your team)
     - Dropdown shows team members
     - Search by typing name
   
   - **Due Date** * (Select deadline)
     - Date picker opens
     - Can set time as well
   
   - **Priority** *
     - **Low**: Routine tasks
     - **Medium**: Standard tasks
     - **High**: Important tasks
     - **Urgent**: Critical, immediate attention needed
   
   - **Category** (Optional)
     - Development
     - Design
     - Documentation
     - Meeting
     - Research
     - Other
   
   - **Estimated Hours** (Optional)
     - How long you estimate it will take
   
   - **Attachments** (Optional)
     - Upload reference files
     - Click "Upload" or drag & drop
     - Supports: PDF, DOC, XLS, images
   
   - **Tags** (Optional)
     - Add for easy searching
     - Example: #sales, #Q1, #report

5. **Review and Create**
   - Double-check all details
   - Click **"Create Task"**

6. **System Automatically:**
   - Sends email notification to employee
   - Shows in employee's task dashboard
   - Starts tracking task status

**What Employee Sees:**
- Task appears in their "My Tasks"
- Email notification received
- Can view full details
- Can add comments/updates
- Can update progress %
- Can mark as completed

---

**Managing Created Tasks:**

**Edit Task:**
1. Go to "Tasks" → Find your task
2. Click task name or "Edit" icon
3. Modify any field
4. Click **"Update Task"**
5. Employee notified of changes

**Track Progress:**
- Status indicator (color-coded):
  - 🔵 To Do (blue)
  - 🟡 In Progress (yellow)
  - 🟢 Completed (green)
  - 🔴 Overdue (red)
- Progress bar shows completion %
- Comments count
- Days remaining until due date

**Add Comments:**
1. Open task details
2. Scroll to "Comments" section
3. Type comment
4. Click "Post Comment"
5. Employee gets notification

**Change Status:**
1. Open task
2. Click "Status" dropdown
3. Select: To Do / In Progress / Completed / Cancelled
4. Click "Update"

**Delete/Cancel Task:**
1. Open task
2. Click "Delete" or "Cancel Task"
3. Confirm action
4. Employee notified

---

**Bulk Task Management:**

**Assign Same Task to Multiple People:**
1. Create task
2. In "Assigned To", select multiple employees (if enabled)
3. OR duplicate task and change assignee

**Task Templates** (for recurring tasks):
1. Create a task
2. Click **"Save as Template"**
3. Name template
4. Next time: Click **"Use Template"** → Select → Assign

---

**Manager Task Dashboard:**

Navigate to: **Dashboard → "My Team" section**

**View:**
- **Tasks Assigned by You**: Total count
- **Pending Tasks**: Not started
- **In Progress**: Active tasks
- **Completed This Week**: Progress tracking
- **Overdue Tasks**: Need attention (red flag)
- **Team Productivity Graph**: Visual trends

**Filter:**
- This Week / This Month / Custom Range
- By Employee
- By Priority
- By Status

---

**Generate Team Task Report:**
1. Go to **"Tasks"** → **"Reports"**
2. Select **"Team Report"**
3. Choose date range
4. **Report shows:**
   - Team's task completion rate
   - Average time to complete
   - Overdue tasks
   - Employee productivity comparison
   - Tasks by category
5. Export as PDF/Excel

---

## Employee Features

### 🎯 What Employees Can Do:

✅ Check in/out with GPS
✅ View their attendance history
✅ Request leave
✅ View assigned tasks
✅ Update task status and progress
✅ View company policies
✅ View their performance reviews

**Employees CANNOT:**
❌ View other employees' data
❌ Create tasks
❌ Approve leaves
❌ Access admin features

---

### Daily Operations

**1. Check In (with GPS):**
1. Login to HRMS
2. Click **"Attendance"**
3. Click **"Check In"**
4. **Allow GPS/Location** when prompted
5. System captures:
   - Check-in time
   - GPS coordinates
   - Location address
6. Confirmation shown

**2. Check Out:**
1. At end of day
2. Click **"Check Out"**
3. GPS location captured again
4. Total hours calculated

**3. View My Attendance:**
- See your check-in/out history
- View total hours worked
- See late arrivals (if any)

**4. Request Leave:**
1. Click **"Leave Management"**
2. Click **"Request Leave"**
3. Fill in:
   - Leave type (Annual, Sick, Personal)
   - Start date
   - End date
   - Reason
4. Click **"Submit Request"**
5. Manager gets notification
6. Track status: Pending → Approved/Rejected

**5. View My Tasks:**
1. Click **"Tasks"**
2. See **"My Tasks"** section
3. View:
   - To Do tasks
   - In Progress tasks
   - Completed tasks
4. Click on task to view details

**6. Update Task Status:**
1. Open task
2. Change status dropdown
3. Add progress % (slider)
4. Add comment/update
5. Click **"Save"**
6. Manager notified

**7. View Policies:**
1. Click **"Policies"**
2. Browse all company policies
3. Click to read full policy
4. Download if needed

---

## Technical Architecture

### Frontend
- **Framework:** React 18 + TypeScript
- **Styling:** Tailwind CSS v4
- **UI:** Shadcn/ui components
- **Icons:** Lucide React
- **Build:** Vite
- **Hosting:** Vercel/Netlify/Self-hosted

### Backend
- **Runtime:** Deno
- **Framework:** Hono (web server)
- **Database:** Supabase PostgreSQL
- **Storage:** KV Store (`kv_store_937488f4` table)
- **Authentication:** Supabase Auth (JWT)
- **Edge Functions:** Supabase

### Database Schema (KV Store Keys)

```
Key Pattern                          | Description
-------------------------------------|--------------------------------
employee:<user_id>                   | Employee profiles
attendance:<user_id>:<date>          | Daily attendance records
leave:<leave_id>                     | Leave requests
task:<task_id>                       | Task assignments
review:<employee_id>:<timestamp>     | Performance reviews
job:<job_id>                         | Job postings
candidate:<candidate_id>             | Job candidates
policy:<policy_id>                   | Company policies
dept:<dept_id>                       | Departments
holiday:<dept>:<date>                | Department holidays
shift:<shift_id>                     | Shift schedules
payroll:<user_id>:<month>            | Payroll records
gps:<attendance_id>                  | GPS coordinates
interview:<interview_id>             | Interview schedules
lifecycle:<user_id>:<event_id>       | Employee lifecycle events
overtime:<user_id>:<month>           | Overtime entries
```

### API Endpoints

**Base URL:** `https://<project-ref>.supabase.co/functions/v1/make-server-937488f4`

#### Authentication
- `POST /auth/register` - Create employee (admin only)
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

#### Employees
- `GET /employees` - List all employees
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create employee (admin only)
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee (admin only)

#### Attendance
- `POST /attendance/check-in` - Check in with GPS
- `POST /attendance/check-out` - Check out with GPS
- `GET /attendance/:userId` - Get user attendance
- `GET /attendance/today` - Today's attendance (all)
- `GET /attendance/live` - Live location tracking (admin)
- `GET /attendance/report/:month` - Monthly report

#### Tasks
- `GET /tasks` - List tasks
- `POST /tasks` - Create task (manager/admin)
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/comment` - Add comment

#### Leave
- `GET /leaves` - List leaves
- `POST /leaves` - Request leave
- `PUT /leaves/:id/approve` - Approve (manager/admin)
- `PUT /leaves/:id/reject` - Reject (manager/admin)

#### Recruitment
- `GET /jobs` - List jobs
- `POST /jobs` - Create job (admin)
- `DELETE /jobs/:jobId` - Delete job (admin) ✨
- `POST /candidates` - Add candidate
- `GET /candidates` - List candidates
- `PUT /candidates/status/:id` - Update candidate stage
- `POST /candidates/:id/convert` - Convert to employee (admin) ✨

#### Policies ✨ **NEW**
- `GET /policies` - List all policies
- `POST /policies` - Create policy (admin only)
- `PUT /policies/:id` - Update policy (admin only)
- `DELETE /policies/:id` - Delete policy (admin only)

#### Departments ✨ **NEW**
- `GET /departments` - List departments
- `POST /departments` - Create department (admin only)
- `PUT /departments/:id` - Update department (admin only)
- `DELETE /departments/:id` - Delete department (admin only)

#### Performance
- `GET /performance/reviews` - List reviews
- `POST /performance/review` - Create review (manager/admin)
- `PUT /performance/review/:id` - Update review
- `GET /performance/:empId` - Get employee reviews

#### Payroll
- `POST /payroll/overtime` - Add overtime (admin)
- `POST /payroll/generate` - Generate payroll (admin)
- `GET /payroll/:userId/:month` - Get payroll

---

## Troubleshooting

### Common Issues

**1. Cannot Login**
- ✅ Check email/password correct
- ✅ Verify account created by admin
- ✅ Check internet connection
- ✅ Clear browser cache
- **Solution:** Contact admin to reset password

**2. Attendance Check-in Failed**
- ✅ GPS/location permission granted?
- ✅ Using HTTPS (not HTTP)?
- ✅ GPS enabled on device?
- **Solution:** Enable location in browser settings
- **Chrome:** Settings → Privacy → Site Settings → Location
- **Safari:** Preferences → Websites → Location Services

**3. "Admin access required" error**
- ✅ Check your role (should be "admin")
- ✅ Logout and login again
- **Solution:** Contact system admin to verify role

**4. Tasks not showing**
- ✅ Check filters applied
- ✅ Network connection stable?
- **Solution:** Refresh page, clear browser cache

**5. Cannot convert candidate to employee**
- ✅ Must be admin role
- ✅ Candidate must be in "offer" or "hired" stage
- ✅ All required fields filled?
- **Solution:** Verify role and candidate stage

**6. Backend 500 Error**
- ✅ Check Edge Function deployed
- ✅ Environment variables correct?
- **Solution:** Check Supabase Dashboard → Edge Functions → Logs

**7. "Department has employees" when deleting**
- ✅ Cannot delete department with assigned employees
- **Solution:** Reassign employees to different department first

---

### Getting Logs

**Frontend Logs:**
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for errors (red text)

**Backend Logs:**
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Click **"server"** function
4. Click **"Logs"** tab
5. View real-time logs

---

### Performance Issues

**Slow Loading:**
- ✅ Check internet speed
- ✅ Clear browser cache
- ✅ Close unused tabs
- ✅ Upgrade to paid Supabase plan if needed

**Database Slow:**
- ✅ Monitor Supabase dashboard usage
- ✅ Check if Free tier limits reached
- ✅ Consider upgrading plan

---

## Security Best Practices

### For Administrators

1. **Strong Passwords:**
   - Minimum 12 characters
   - Mix: uppercase, lowercase, numbers, symbols
   - Change every 90 days
   - Never reuse passwords

2. **Service Role Key:**
   - ⚠️ **NEVER** share or expose publicly
   - ⚠️ **NEVER** commit to Git
   - Only use in backend code
   - Rotate immediately if compromised

3. **Role Management:**
   - Give minimum necessary permissions
   - Regular audit of user roles
   - Remove access for terminated employees immediately
   - Review admin access quarterly

4. **Data Access:**
   - Monitor suspicious login patterns
   - Enable 2FA if available
   - Regular security audits
   - Document all admin actions

5. **Backups:**
   - Supabase auto-backs up database
   - Export critical data monthly
   - Store exports securely
   - Test restore procedures

### For All Users

1. ✅ Change default password on first login
2. ✅ Never share credentials
3. ✅ Logout when using shared computers
4. ✅ Report suspicious activity
5. ✅ Keep browser updated

---

## Maintenance Schedule

### Daily
- ✅ Monitor attendance tracking
- ✅ Review system performance
- ✅ Check for critical errors

### Weekly
- ✅ Review failed tasks/notifications
- ✅ Monitor storage usage
- ✅ Check user feedback

### Monthly
- ✅ Generate and archive reports
- ✅ Review user access and roles
- ✅ Check for dependency updates
- ✅ Performance audit
- ✅ Export backup data

### Quarterly
- ✅ Security audit
- ✅ User training sessions
- ✅ Feature usage analysis
- ✅ System optimization
- ✅ Review and update policies

---

## Support & Updates

### Getting Updates

**Frontend:**
```bash
# Pull latest code
git pull origin main

# Install dependencies (if changed)
npm install

# Redeploy
git push
# (Vercel/Netlify auto-deploys)
```

**Backend:**
```bash
# Pull latest code
git pull origin main

# Redeploy Edge Functions
supabase functions deploy server
```

---

## Feature Summary Checklist

### ✅ Implemented Features

- [x] JWT Authentication with RBAC
- [x] Admin full control over system
- [x] Employee CRUD (admin only)
- [x] GPS-based attendance tracking
- [x] Live location tracking
- [x] Daily/monthly attendance reports
- [x] Leave management system
- [x] Task management with assignment
- [x] Performance review system
- [x] Recruitment ATS
- [x] **Delete job postings (admin only)**
- [x] **Convert candidate to employee**
- [x] **Department management (admin only)**
- [x] **Company policies management (admin only)**
- [x] Shift management per employee
- [x] Manual payroll/overtime system
- [x] Department-wise holiday management
- [x] Interview scheduling
- [x] Employee lifecycle tracking
- [x] Role-based dashboard
- [x] Mobile-responsive design

---

## Quick Reference Cards

### Admin Quick Actions
| Action | Location | Steps |
|--------|----------|-------|
| Create Employee | Employees → Add Employee | Fill form → Create |
| Create Department | Departments → Add Department | Name + Head → Create |
| Create Policy | Policies → Add Policy | Title + Content → Create |
| Delete Job | Recruitment → Job Card | Click Delete Icon |
| Convert Candidate | Recruitment → Candidate (Offer/Hired) | Convert to Employee Button |
| View Live Location | Attendance → Live Tracking | Map/List View |
| Generate Report | Reports → Select Type | Choose Period → Generate |

### Manager Quick Actions
| Action | Location | Steps |
|--------|----------|-------|
| Assign Task | Tasks → Create Task | Fill form → Assign to Employee |
| Approve Leave | Leave → Pending | Select → Approve/Reject |
| View Team Tasks | Tasks → Team Tab | Filter by Team Member |
| Conduct Review | Performance → Create Review | Select Employee → Fill Form |

### Employee Quick Actions
| Action | Location | Steps |
|--------|----------|-------|
| Check In | Attendance → Check In | Allow GPS → Confirm |
| Check Out | Attendance → Check Out | Confirm |
| Request Leave | Leave → New Request | Fill Dates + Reason → Submit |
| View Tasks | Tasks → My Tasks | Click to View Details |
| Update Task | Tasks → Task Detail | Change Status → Add Comment |
| View Policies | Policies | Browse → Click to Read |

---

## Conclusion

Your HRMS system is now fully deployed with:

✅ **Complete admin control** over all system features
✅ **Recruitment workflow** with candidate-to-employee conversion
✅ **Department management** for organizational structure
✅ **Company policies** management and distribution
✅ **Job posting management** with delete functionality
✅ **GPS-based attendance** with live tracking
✅ **Task management** system for managers
✅ **Performance tracking** and reporting
✅ **Leave management** with approval workflow
✅ **Payroll integration** with overtime tracking

### Getting Help

📧 **Contact System Admin:** admin@yourcompany.com
📚 **Documentation:** This guide
🐛 **Report Issues:** Check browser console and backend logs

---

**Document Version:** 2.0  
**Last Updated:** January 2025  
**System Version:** Production-Ready  

---

**🎉 Your HRMS is ready to use! 🎉**
