# Complete HRMS User Guide

## System Overview

This is a comprehensive Human Resource Management System (HRMS) with role-based access control. The system supports three roles:
- **Admin**: Full system access
- **Manager**: Department-level access
- **Employee**: Personal data access

## Getting Started

### First-Time Setup

1. Navigate to `/setup` in your browser
2. Create the initial admin account with:
   - Email
   - Password
   - Full Name
3. After creation, login with your admin credentials

### Logging In

1. Navigate to the home page
2. Enter your email and password
3. Click "Sign In"

---

## Module Guide

### 1. Dashboard

**Purpose**: Overview of system metrics and recent activities

**What You See**:
- Total Employees, Active Employees, Pending Leaves, Today's Attendance, Open Jobs
- Recent Activity Log (Admin/Manager only)
- Upcoming Birthdays
- Early Birds & Late Comers (Admin/Manager only)
- Birthday Wishes (if it's your birthday)

**Actions**:
- Send birthday wishes to colleagues
- View quick stats
- Navigate to different modules

---

### 2. Employee Directory

**Purpose**: View and manage all employees

**For Admins**:
- Click "Add Employee" to create new employees
- Click on any employee to view/edit their profile
- Search and filter employees

**For Managers**:
- View employees in your department
- Click on employees to view profiles

**For Employees**:
- View all colleagues (limited information)
- Cannot add or edit

**How to Add an Employee (Admin Only)**:
1. Click "Add Employee" button
2. Fill in all required fields:
   - Email (must be unique)
   - Full Name
   - Password (will be used for first login)
   - Role (Admin/Manager/Employee)
   - Department
   - Job Title
   - Monthly Salary
   - Shift Details
3. Click "Create Employee"
4. Success! The employee can now login

---

### 3. Attendance Management

**Purpose**: Track daily check-ins and check-outs with GPS

**How to Check In**:
1. Click "Check In" button
2. Allow browser location access when prompted
3. Your location will be captured
4. You'll see your check-in time

**How to Check Out**:
1. After checking in, the button changes to "Check Out"
2. Click "Check Out"
3. Your location is captured again
4. Total hours are calculated

**Viewing History**:
- See recent attendance records
- View total hours worked
- Check calendar for attendance dates

**Important Notes**:
- GPS/Location services must be enabled
- One check-in per day
- Late arrivals and early departures are tracked
- Admins/Managers can view all attendance data in Reports

---

### 4. Leave Management

**How to Apply for Leave**:
1. Click "Apply for Leave" button
2. Select leave type (Annual, Sick, Personal, etc.)
3. Choose start and end dates
4. Check "Half Day" if applicable
5. Enter reason for leave
6. Click "Submit Leave Request"
7. Wait for manager/admin approval

**For Managers/Admins** - Approving Leaves:
1. See all pending leave requests in the table
2. Click ✓ (checkmark) to approve
3. Click ✗ (X mark) to reject

**Leave Balance**:
- View your remaining annual leave (12 days)
- View sick leave balance (8 days)
- Track used and pending leaves

**Important Rules**:
- Cannot backdate leaves
- Requires manager/admin approval
- Status updates in real-time

---

### 5. Recruitment (ATS)

**Purpose**: Manage job postings, candidates, and hiring

**Creating a Job Posting (Admin Only)**:
1. Click "Create Job" button
2. Fill in:
   - Job Title
   - Department
   - Description
   - Requirements
   - Location
   - Employment Type
3. Click "Create Job Posting"

**Adding Candidates**:
1. Click "Add Candidate"
2. Select the job position
3. Enter candidate details:
   - Name
   - Email
   - Phone
   - Resume/CV link
4. Set initial stage (Screening, Interview, etc.)
5. Click "Add Candidate"

**Managing Candidates**:
- Drag and drop candidates between stages
- Schedule interviews
- Add notes and evaluations
- Track interview feedback

**Hiring a Candidate** (Admin Only):
1. Select a candidate
2. Click "Hire" or "Convert to Employee"
3. Fill in employment details:
   - Department
   - Job Title
   - Salary
   - Start Date
4. Employee account is automatically created!

---

### 6. Performance Reviews

**Creating a Review (Admin/Manager)**:
1. Click "New Review"
2. Select employee
3. Choose review period (Quarter/Year)
4. Rate performance areas (1-5):
   - Quality of Work
   - Productivity
   - Communication
   - Teamwork
   - Leadership
5. Add comments and goals
6. Submit review

**Important Notes**:
- Reviews are locked after submission
- Only admins can unlock/edit locked reviews
- Employees can view their own reviews
- One review per period per employee

---

### 7. Departments

**Managing Departments (Admin Only)**:
1. Click "Add Department"
2. Enter:
   - Department Name
   - Description
   - Department Head (select from employees)
3. Click "Save"

**Editing/Deleting**:
- Click pencil icon to edit
- Click trash icon to delete (if no employees assigned)

---

### 8. Policies

**Creating Policies (Admin Only)**:
1. Click "Create Policy"
2. Enter:
   - Policy Title
   - Category (HR, IT, Finance, etc.)
   - Description
   - Effective Date
3. Click "Save"

**All Users**:
- Can view all policies
- Can search and filter policies
- Cannot edit (Admin only)

---

### 9. Reports & Analytics

**Purpose**: Generate comprehensive reports

**Available Reports**:

#### Payroll Reports
- Filter by employee, month, and year
- View salary breakdowns
- See overtime calculations
- Track deductions
- Export to CSV

#### Attendance Reports
- View check-in/check-out times
- Calculate total hours
- Identify late arrivals
- Track early departures
- Filter by date range
- Export data

#### GPS Tracking
- Select employee and date
- View real-time location traces
- See movement throughout the day
- Google Maps integration
- Track field employees

#### Final Settlements
- View resigned/terminated employees
- See settlement calculations
- Track payment status
- View pending dues and advances

**How to Generate Reports**:
1. Select report type (tab at top)
2. Choose filters (employee, date range, etc.)
3. Click "Export CSV" to download data

**Important**: Reports respect role-based permissions:
- Admins: See all data
- Managers: See department data only
- Employees: See own data only

---

### 10. Payments Module

**Purpose**: Record salary payments and advances (Admin Only)

**Recording a Payment**:
1. Click "Add Payment"
2. Select employee
3. Choose payment type:
   - Full Salary
   - Half Salary
   - Advance
   - Custom
   - Final Settlement
4. Enter amount
5. Add description
6. Select month
7. Click "Record Payment"

**Payment Types Explained**:
- **Full Salary**: Complete monthly salary
- **Half Salary**: Partial payment (50%)
- **Advance**: Money given in advance (deducted later)
- **Custom**: Any other payment
- **Final Settlement**: Payment when employee leaves

**Viewing Payments**:
- See all recorded payments
- Filter by employee, type, month
- View payment history
- Track total payments per employee

**Integration with Final Settlements**:
- When you record a "Final Settlement" payment
- The corresponding settlement in Reports automatically updates to "Paid"
- This ensures accurate tracking

---

### 11. Roles & Permissions

**Purpose**: Customize access control (Admin Only)

**Setting Permissions**:
1. Select an employee
2. Check permissions to grant:
   - `create_employees`: Can add new employees
   - `manage_departments`: Can create/edit departments
   - `approve_leaves`: Can approve leave requests
   - `view_payroll`: Can access payroll data
   - `make_payments`: Can record payments
   - `manage_recruitment`: Can post jobs and hire
3. Click "Save Permissions"

**How Permissions Work**:
- Admins have all permissions by default
- Managers can be given specific permissions
- Employees typically have no extra permissions
- Permissions override default role restrictions

---

### 12. Settings

**Company Holiday Management**:

**Adding a Holiday (Admin Only)**:
1. Go to Settings
2. Click "Add Holiday"
3. Enter:
   - Holiday Name
   - Date
   - Department (or "All" for company-wide)
4. Click "Save"

**Department-Specific Holidays**:
- Holidays can be assigned to specific departments
- Employees only see holidays relevant to them
- Useful for regional offices or special department events

---

## Common Workflows

### Workflow 1: Hiring a New Employee

1. **Post Job** (Recruitment module)
2. **Add Candidates** (as they apply)
3. **Schedule Interviews** (track in ATS)
4. **Hire Candidate** (converts to employee automatically)
5. **New Employee Logs In** (using auto-generated credentials)

### Workflow 2: Employee Resignation/Termination

1. **Go to Employee Directory**
2. **Click on Employee Profile**
3. **Change Lifecycle Status** to "Resigned" or "Terminated"
4. **Generate Final Settlement** (button appears)
5. **Review Settlement Calculation**
6. **Go to Payments Module**
7. **Record Final Settlement Payment**
8. **Check Reports** → Final Settlement tab (status = Paid)

### Workflow 3: Monthly Payroll Process

1. **Go to Payments Module**
2. **For each employee**:
   - Click "Add Payment"
   - Select employee
   - Choose "Full Salary"
   - Enter amount (based on their monthly salary)
   - Select current month
   - Add description
   - Record payment
3. **Generate Report** (Reports → Payroll Reports)
4. **Export for Records**

### Workflow 4: Leave Approval Process

**Employee Side**:
1. Apply for leave (Leave Management)
2. Wait for approval

**Manager/Admin Side**:
1. Check Leave Management tab
2. Review pending requests
3. Approve or reject
4. Employee is notified (via toast notification)

---

## Troubleshooting

### "No final settlements found"

**This is normal!** Final settlements only appear when:
1. An employee's status is changed to "Resigned" or "Terminated"
2. Admin/Manager generates the final settlement
3. The settlement is then visible in Reports

**To create a settlement**:
1. Go to Employee Directory
2. Click an employee
3. Edit their profile
4. Change status or lifecycle status
5. Generate final settlement

### GPS/Location Issues

**If check-in fails**:
1. Ensure location services are enabled in browser
2. Grant location permission when prompted
3. Check if GPS is enabled on device
4. Try refreshing the page
5. Use HTTPS (required for geolocation)

### "Access Denied" Errors

**Check your role**:
- Only Admins can: Add employees, manage departments, create policies
- Managers can: View department data, approve leaves
- Employees can: View own data, apply for leaves

**Solution**: Ask admin to grant you specific permissions in Roles & Permissions module

### Data Not Showing

**Try these steps**:
1. Refresh the page
2. Check your role and department
3. Ensure filters are not hiding data
4. Verify you have permission to view that data
5. Check browser console for errors

---

## Best Practices

### For Admins

1. **Create departments first** before adding many employees
2. **Set up company holidays** at the start of the year
3. **Define clear policies** and keep them updated
4. **Regularly review permissions** for managers
5. **Process payroll consistently** each month
6. **Generate reports** for record-keeping

### For Managers

1. **Review leave requests promptly**
2. **Monitor department attendance**
3. **Conduct regular performance reviews**
4. **Track team birthdays** and celebrations
5. **Report issues** to admin quickly

### For Employees

1. **Check in/out daily** with GPS enabled
2. **Apply for leaves in advance**
3. **Keep profile updated**
4. **Review company policies** regularly
5. **Check dashboard** for important updates

---

## Data Visibility Rules

### Admins See:
- All employees
- All departments
- All attendance records
- All leave requests
- All payroll data
- All reports
- All activities

### Managers See:
- Employees in their department only
- Department attendance
- Department leave requests
- Department reports
- Department activities
- Limited payroll access

### Employees See:
- Own profile and data
- Own attendance records
- Own leave requests
- Own payroll (if permission granted)
- Company policies
- Colleague birthdays
- Department colleagues (basic info)

---

## Important Notes

1. **Security**: All data is stored securely and role-based access is strictly enforced
2. **GPS Tracking**: Required for attendance, tracks location for audit purposes
3. **Passwords**: Use strong passwords, change default password on first login
4. **Data Export**: Reports can be exported to CSV for external use
5. **Real-time Updates**: Most actions update immediately with toast notifications
6. **Department Isolation**: Managers only see their department data
7. **Audit Trail**: All actions are logged in activity log
8. **Settlement Automation**: Hiring converts candidates, settlement payments update status

---

## Support & Contact

For technical issues:
1. Check this user guide first
2. Review troubleshooting section
3. Check browser console for errors
4. Contact your system administrator

For feature requests or bugs:
- Contact the development team
- Provide detailed description
- Include screenshots if possible
- Note your role and department

---

## Quick Reference: Module Access

| Module | Admin | Manager | Employee |
|--------|-------|---------|----------|
| Dashboard | ✓ Full | ✓ Department | ✓ Limited |
| Employees | ✓ All | ✓ Department | ✓ View Only |
| Attendance | ✓ All | ✓ Department | ✓ Own |
| Leaves | ✓ Approve | ✓ Approve Dept | ✓ Apply |
| Recruitment | ✓ Full | ✓ Limited | ✗ |
| Performance | ✓ All | ✓ Department | ✓ Own |
| Departments | ✓ Manage | ✓ View | ✓ View |
| Policies | ✓ Manage | ✓ View | ✓ View |
| Reports | ✓ All | ✓ Department | ✓ Own |
| Payments | ✓ Full | ✗ | ✗ |
| Permissions | ✓ Full | ✗ | ✗ |
| Settings | ✓ Full | ✓ View | ✓ View |

---

## Version Information

System Version: 2.0
Last Updated: January 2026
Built with: React, Tailwind CSS, Supabase, Deno/Hono

---

**End of User Guide**
