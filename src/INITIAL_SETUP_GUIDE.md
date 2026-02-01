# Initial Setup Guide - Creating Your First Admin Account

## 🚀 Quick Start (2 Minutes)

Your HRMS application is deployed but has **no users yet**. Follow these steps to create your first administrator account:

---

## Step 1: Access Setup Page

**Option A: Click the link on login page**
1. Go to your HRMS URL
2. You'll see the login page
3. Click **"Create Admin Account"** link at the bottom

**Option B: Direct URL**
1. Navigate to: `https://your-domain.com/setup`
2. The setup page will load

---

## Step 2: Fill in Admin Details

On the setup page, enter:

1. **Full Name** - Your name (e.g., "John Doe")
2. **Email Address** - Your admin email (e.g., "admin@company.com")
3. **Password** - Choose a strong password (min 6 characters)
4. **Confirm Password** - Re-enter the same password

**Example:**
```
Full Name: Sarah Johnson
Email: sarah@company.com
Password: Admin@123456
Confirm Password: Admin@123456
```

---

## Step 3: Create Admin Account

1. Click **"Create Admin Account"** button
2. Wait for confirmation (usually 1-2 seconds)
3. You'll see a success message: "Setup Complete!"
4. You'll be automatically redirected to login

---

## Step 4: Login with Admin Account

1. Enter the email and password you just created
2. Click **"Sign In"**
3. You're now logged in as Administrator! 🎉

---

## What Happens Next?

After logging in as admin, you can:

### ✅ Add More Employees
1. Go to **Employees** → **Add Employee**
2. Fill in employee details
3. Set their role (Admin, Manager, or Employee)
4. Create their account

### ✅ Configure System
1. Go to **Settings**
2. Set up departments
3. Configure leave policies
4. Customize preferences

### ✅ Start Using Features
- Dashboard overview
- Attendance tracking with GPS
- Leave management
- Recruitment ATS
- Reports & Analytics

---

## Important Notes

### 🔒 Security First

**Your first admin account has full access:**
- Create/edit/delete all employees
- Approve all requests
- Access all reports
- Modify all settings

**Best Practices:**
1. Use a strong password
2. Keep credentials secure
3. Don't share admin access
4. Create regular employee accounts for daily use
5. Only use admin when needed

### 🚫 One-Time Setup

The `/setup` page can **only be used once**:
- ✅ Works when NO admin exists
- ❌ Blocked after first admin created
- If blocked, you'll see: "Admin already exists"

### 📧 Email Format

Use your company email format:
- ✅ `admin@company.com`
- ✅ `hr@company.com`
- ✅ `john.doe@company.com`
- ❌ Avoid personal emails for admin

### 🔑 Password Requirements

- Minimum 6 characters
- Should include letters and numbers
- Recommended: 10+ characters with special characters
- Example: `Admin@2024Secure!`

---

## Troubleshooting

### Issue: "Admin already exists" error

**Cause:** An admin account was already created

**Solution:**
1. If you created it: Login with those credentials
2. If someone else created it: Contact them for access
3. If forgotten: You'll need database access to reset

### Issue: Setup page won't load

**Solution:**
1. Check your URL is correct (`/setup`)
2. Clear browser cache
3. Try different browser
4. Check if app is properly deployed

### Issue: "Failed to create admin" error

**Solution:**
1. Check backend is running
2. Verify Supabase configuration
3. Check browser console for errors (F12)
4. Ensure all environment variables are set

### Issue: Can't login after creating admin

**Solution:**
1. Double-check email and password
2. Email is case-sensitive
3. Try password reset (contact admin)
4. Check browser console for errors

---

## API Endpoint Details (For Developers)

### Seed Admin Endpoint

**Endpoint:** `POST /auth/seed-admin`

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "SecurePassword123",
  "name": "Admin Name"
}
```

**Success Response (200):**
```json
{
  "message": "Initial admin created successfully! You can now login.",
  "user": {
    "id": "uuid-here",
    "email": "admin@company.com",
    "name": "Admin Name",
    "role": "admin"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Admin already exists. Use regular registration."
}
```

### What Gets Created

**1. Supabase Auth User:**
- Email/password authentication
- User metadata with name and role
- Email auto-confirmed (no verification needed)

**2. Employee Profile (KV Store):**
```javascript
Key: `employee:{userId}`
Value: {
  id: userId,
  email: "admin@company.com",
  name: "Admin Name",
  role: "admin",
  department: "Administration",
  jobTitle: "System Administrator",
  status: "active",
  lifecycleStatus: "active",
  shiftType: "morning",
  shiftStartTime: "09:00",
  shiftEndTime: "17:00",
  // ... other fields
}
```

**3. Email Index:**
```javascript
Key: `user:email:{email}`
Value: userId
```

---

## After Setup Checklist

Once your admin account is created:

- [ ] Login successfully
- [ ] Explore the dashboard
- [ ] Add your first department
- [ ] Create employee accounts for your team
- [ ] Test attendance check-in (with GPS)
- [ ] Configure leave policies
- [ ] Set up company policies
- [ ] Review settings
- [ ] Test all major features
- [ ] Invite team members to use the system

---

## Quick Video Tutorial (Steps)

**1. Navigate to Setup (0:10)**
- Open HRMS URL
- Click "Create Admin Account"

**2. Fill Form (0:30)**
- Enter name, email, password
- Confirm password

**3. Create & Login (0:20)**
- Click "Create Admin Account"
- Wait for redirect
- Login with credentials

**Total Time: ~1 minute**

---

## Need Help?

### For Users:
- See [FAQ.md](FAQ.md) for common questions
- Contact your IT department

### For Developers:
- Check [DEVELOPER_NOTES.md](DEVELOPER_NOTES.md)
- Review backend logs
- Verify Supabase configuration

### For Deployment:
- See [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md)
- Ensure all environment variables set
- Check HTTPS is enabled

---

## Example Setup Flow

```
1. User visits: https://hrms.company.com
   └─> Sees login page
   └─> No accounts exist yet

2. User clicks: "Create Admin Account"
   └─> Goes to: /setup

3. User fills form:
   Name: Sarah Johnson
   Email: sarah@company.com
   Password: Admin@2024!
   
4. User clicks: "Create Admin Account"
   └─> API call to /auth/seed-admin
   └─> Creates Supabase user
   └─> Creates employee profile
   └─> Success! ✅

5. Auto-redirect to login
   └─> User logs in
   └─> Admin dashboard loads
   └─> System ready to use! 🎉
```

---

## Security Considerations

### ✅ Do:
- Use strong, unique password
- Enable 2FA later (if available)
- Create separate employee accounts
- Log out when done
- Use HTTPS only

### ❌ Don't:
- Share admin credentials
- Use weak passwords
- Stay logged in on shared computers
- Access from public WiFi without VPN
- Give everyone admin access

---

## Summary

**Creating your first admin account is easy:**

1. Visit `/setup` page (or click link on login)
2. Enter your name, email, and password
3. Click "Create Admin Account"
4. Login with your new credentials
5. Start using HRMS! 🚀

**Time Required:** ~2 minutes  
**Difficulty:** Easy  
**One-time process:** Yes

Once setup is complete, you'll have full admin access to manage your entire HR system.

---

**Ready to get started?** Visit your HRMS URL and click "Create Admin Account"!

---

**Last Updated:** December 13, 2024  
**Version:** 2.0  
**Status:** Production Ready
