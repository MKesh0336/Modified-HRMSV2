# 🚀 Quick Start - Get Your HRMS Running in 2 Minutes

## Problem: Can't Login?

**You're seeing the login page but can't sign in because there are no users in the database yet.**

## Solution: Create Your First Admin Account

Follow these 3 simple steps:

---

## Step 1️⃣: Open Setup Page

**Two ways to get there:**

### Option A: From Login Page
1. You'll see the login page when you first open the app
2. Look at the bottom
3. Click the link that says **"Create Admin Account"**

### Option B: Direct URL
1. Add `/setup` to your app URL
2. Example: `https://your-hrms-url.com/setup`

---

## Step 2️⃣: Fill in Your Details

You'll see a form asking for:

```
┌─────────────────────────────────────┐
│   🛡️  Initial Setup                 │
│                                     │
│  Full Name:                         │
│  ┌───────────────────────────────┐ │
│  │ John Doe                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  Email Address:                     │
│  ┌───────────────────────────────┐ │
│  │ john@company.com              │ │
│  └───────────────────────────────┘ │
│                                     │
│  Password:                          │
│  ┌───────────────────────────────┐ │
│  │ ••••••••                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  Confirm Password:                  │
│  ┌───────────────────────────────┐ │
│  │ ••••••••                      │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Create Admin Account]             │
└─────────────────────────────────────┘
```

**Fill in:**
- Your full name
- Your work email
- A secure password (min 6 characters)
- Confirm the password

---

## Step 3️⃣: Create & Login

1. Click **"Create Admin Account"** button
2. Wait a few seconds
3. You'll see: ✅ **"Setup Complete!"**
4. Automatically redirected to login
5. Login with the email & password you just created
6. **You're in!** 🎉

---

## That's It! 

You now have:
- ✅ Full admin access
- ✅ Ability to add employees
- ✅ Access to all features
- ✅ Complete system control

---

## What to Do Next?

### 1. Add Your Team
- Go to **Employees** → **Add Employee**
- Fill in their details
- Set their role (Manager or Employee)
- They can now login!

### 2. Test GPS Attendance
- Go to **Attendance**
- Click **"Check In"**
- Allow location permission
- GPS coordinates captured automatically!

### 3. Explore Features
- 📊 **Dashboard** - Overview and quick actions
- 👥 **Employees** - Manage your team
- ⏰ **Attendance** - GPS tracking
- 🏖️ **Leave** - Requests and approvals
- 💼 **Recruitment** - Job postings
- 📈 **Reports** - Analytics and insights

---

## Quick Reference

| What | Where | Action |
|------|-------|--------|
| **Create First Admin** | `/setup` page | Fill form, create account |
| **Login** | Main page `/` | Use email & password |
| **Add Employees** | Employees → Add Employee | Create accounts for team |
| **Check Attendance** | Attendance page | Check in/out with GPS |
| **View Reports** | Reports page | See analytics |

---

## Common Questions

### Q: Can I create multiple admins?
**A:** Yes! After initial setup, login as admin and add more employees with "admin" role.

### Q: What if I forget my admin password?
**A:** Contact your IT department or database administrator to reset it.

### Q: Can regular employees use the setup page?
**A:** No, the setup page only works when NO admin exists. After first admin is created, it's blocked.

### Q: Do I need special software?
**A:** No! Just a modern web browser (Chrome, Firefox, Safari, or Edge).

### Q: Does it work on mobile?
**A:** Yes! Works great on iPhone and Android. See [MOBILE_GUIDE.md](MOBILE_GUIDE.md)

---

## Need More Help?

- 📖 **Full Setup Guide:** [INITIAL_SETUP_GUIDE.md](INITIAL_SETUP_GUIDE.md)
- ❓ **FAQ:** [FAQ.md](FAQ.md)
- 📱 **Mobile Setup:** [MOBILE_GUIDE.md](MOBILE_GUIDE.md)
- 🛠️ **Deployment:** [PRODUCTION_DEPLOYMENT_CHECKLIST.md](PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

## Visual Flow

```
┌─────────────────────┐
│   Login Page        │
│  (No users yet)     │
└──────────┬──────────┘
           │
           │ Click "Create Admin Account"
           ↓
┌─────────────────────┐
│   Setup Page        │
│  Fill in details    │
└──────────┬──────────┘
           │
           │ Click "Create Admin Account"
           ↓
┌─────────────────────┐
│  ✅ Success!         │
│  Redirecting...     │
└──────────┬──────────┘
           │
           │ Auto-redirect
           ↓
┌─────────────────────┐
│   Login Page        │
│  Login with creds   │
└──────────┬──────────┘
           │
           │ Sign In
           ↓
┌─────────────────────┐
│  🎉 Dashboard        │
│  You're ready!      │
└─────────────────────┘
```

---

## Troubleshooting

### 🔴 Problem: "Admin already exists" error
**Solution:** An admin was already created. Use the login page instead.

### 🔴 Problem: Can't find setup link
**Solution:** It's at the bottom of the login page, or go to `/setup` directly.

### 🔴 Problem: Form won't submit
**Solution:** Check all fields are filled and passwords match.

### 🔴 Problem: Page not loading
**Solution:** Clear browser cache, try different browser, or check app deployment.

---

## Summary

**1 → Open** `/setup` page  
**2 → Fill** name, email, password  
**3 → Create** admin account  
**4 → Login** and start using!  

⏱️ **Time: 2 minutes**  
✅ **Result: Full admin access**

---

**Ready?** Let's create your admin account now! 🚀

**[Open Setup Page →](/setup)**

---

**Last Updated:** December 13, 2024  
**Status:** Ready to Use
