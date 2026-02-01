# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is this HRMS application?
**A:** This is a comprehensive Human Resource Management System that includes employee management, attendance tracking with GPS, leave management, recruitment, performance reviews, and analytics. It's a web-based application that works on desktop and mobile devices.

### Q: Do I need to download anything?
**A:** No app store download required! It's a Progressive Web App (PWA) that you can access via your browser. You can optionally "Add to Home Screen" for a native app-like experience.

### Q: Does it work on mobile phones?
**A:** Yes! It works on:
- ✅ iPhone/iPad (iOS 12+)
- ✅ Android phones and tablets (Android 8+)
- ✅ Desktop browsers (Chrome, Firefox, Safari, Edge)

---

## GPS & Location Tracking

### Q: Why does the app need my location?
**A:** Location is only used to verify your presence during check-in and check-out. This ensures accurate attendance tracking and prevents time fraud.

### Q: Is my location tracked all day?
**A:** No! GPS is only captured at two specific times:
1. When you click "Check In" (start of work)
2. When you click "Check Out" (end of work)

Outside of these moments, the app does not track your location.

### Q: What if I don't want to share my location?
**A:** Location permission is required for check-in/check-out features. Without it, attendance tracking won't work. However, you can still access other features like viewing your profile, leave requests, etc.

### Q: How accurate is the GPS?
**A:** The app uses high-accuracy GPS which is typically accurate within 5-10 meters (16-33 feet). This is accurate enough to verify you're at the office.

### Q: Why is GPS taking so long?
**A:** GPS can take 5-10 seconds, especially:
- Indoors or in buildings with thick walls
- In areas with poor satellite visibility
- On first use
- If device GPS is turned off

**Tip:** Go near a window or outside for faster GPS acquisition.

### Q: What if GPS fails?
**A:** If GPS fails:
1. Check that location services are enabled on your device
2. Allow location permission in your browser
3. Try refreshing the page
4. Move to an area with better signal
5. Contact your HR admin if the problem persists

### Q: Can I check in from home?
**A:** That depends on your company policy. The GPS coordinates are captured and your HR admin can see if you checked in from outside the office. Some companies allow remote work check-ins, others don't.

---

## Mobile Usage

### Q: How do I install it on my iPhone?
**A:** On iPhone (using Safari):
1. Open the HRMS URL in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"
5. The app icon will appear on your home screen

### Q: How do I install it on Android?
**A:** On Android (using Chrome):
1. Open the HRMS URL in Chrome
2. Tap the menu button (three dots)
3. Tap "Add to Home Screen" or "Install App"
4. Tap "Add" or "Install"
5. The app will appear in your app drawer

### Q: Does it work offline?
**A:** Basic viewing works offline, but check-in/check-out requires internet connection to communicate with the server. You cannot check in or out while offline.

### Q: Why can't I see the menu on mobile?
**A:** On mobile, the menu is hidden by default. Look for the hamburger menu button (☰) in the top-left corner. Tap it to open the navigation menu.

### Q: The app looks zoomed in on my phone
**A:** Try:
1. Refreshing the page
2. Clearing browser cache
3. Using pinch-to-zoom to adjust
4. Checking if you have browser zoom enabled

---

## Attendance & Check-In

### Q: How do I check in?
**A:**
1. Open the app and go to "Attendance"
2. Click the "Check In" button
3. Allow location permission when prompted
4. Wait for GPS to be captured (5-10 seconds)
5. You'll see a confirmation when successful

### Q: I forgot to check in this morning!
**A:** Contact your manager or HR admin. They may be able to manually add your attendance or adjust the record.

### Q: Can I check in multiple times a day?
**A:** No, you can only check in once per day. If you check in again, it will update your existing record for that day.

### Q: What happens if I check out early?
**A:** The system calculates "early checkout minutes" which your manager can see. Company policy determines if this affects your attendance or pay.

### Q: I checked in but forgot to check out!
**A:** Your attendance will show as "In Progress" until you check out. Contact HR if you forgot to check out and need the record corrected.

---

## Permissions & Privacy

### Q: What permissions does the app need?
**A:** The app requires:
- **Location:** For attendance check-in/check-out verification
- **Internet:** To communicate with the server
- **Notifications (optional):** For alerts about leave approvals, etc.

### Q: Is my data private?
**A:** Yes! Your data is:
- Encrypted in transit (HTTPS)
- Stored securely on protected servers
- Only accessible to authorized HR personnel
- Not shared with third parties
- Subject to company data protection policies

### Q: Can my manager see my location history?
**A:** Your manager and HR admin can see:
- Your check-in location and time
- Your check-out location and time
- GPS coordinates from the Reports section

They CANNOT see:
- Your location outside work hours
- Your location throughout the day
- Your movements between check-in/check-out

### Q: How long is my location data stored?
**A:** Location data is typically stored as long as your attendance records are retained, according to company policy. You can request data deletion in accordance with privacy laws (GDPR, CCPA, etc.).

---

## Leave Management

### Q: How do I apply for leave?
**A:**
1. Go to "Leave Management"
2. Click "Apply for Leave"
3. Select leave type, dates, and reason
4. Click "Submit"
5. Wait for manager/HR approval

### Q: How long does leave approval take?
**A:** This depends on your organization's workflow. Typically, managers are notified immediately and can approve within 24-48 hours.

### Q: Can I cancel a leave request?
**A:** If the leave is still "Pending," you may be able to cancel it. Once approved, contact your manager to request cancellation.

### Q: What leave types are available?
**A:** Common leave types include:
- Annual/Vacation Leave
- Sick Leave
- Personal Leave
- Maternity/Paternity Leave
- Unpaid Leave
- Half-day Leave

Your organization may have additional types.

---

## Technical Issues

### Q: The app won't load
**A:** Try:
1. Refresh the page (Ctrl+R or Cmd+R)
2. Clear browser cache
3. Check your internet connection
4. Try a different browser
5. Restart your device

### Q: I'm getting "Unauthorized" error
**A:** This means your session expired. Try:
1. Log out
2. Close the browser/app
3. Log back in with your credentials

### Q: Buttons aren't working
**A:** Try:
1. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Update your browser to the latest version
4. Try a different browser
5. Check browser console for errors (F12)

### Q: I forgot my password
**A:** Currently, contact your HR admin to reset your password. They can create a new temporary password for you.

### Q: The app is slow
**A:** This could be due to:
- Slow internet connection
- Server issues
- Many users online simultaneously
- Old browser version
- Device performance

Try refreshing, checking your internet, or using a different device.

---

## Features

### Q: Can I see other employees' attendance?
**A:** Only if you're a manager or HR admin. Regular employees can only see their own attendance records.

### Q: Can I export my attendance data?
**A:** Yes! Go to Reports section and you can export data as CSV or PDF (depending on configuration).

### Q: How do I update my profile?
**A:** Go to Settings → Profile to update your personal information. Some fields may be locked and require HR admin access to modify.

### Q: Can I see my payroll information?
**A:** If the payroll module is enabled and you have permission, you can view your payslips in the Reports section.

### Q: How do I upload documents?
**A:** Go to Settings → Documents to upload ID proofs, certificates, etc. (if enabled by your organization).

---

## Admin & Manager Questions

### Q: How do I add a new employee?
**A:** (Admin only)
1. Go to "Employees"
2. Click "Add Employee"
3. Fill in all required information
4. Set shift times and department
5. Click "Create Employee"

### Q: How do I approve leaves?
**A:** (Manager/Admin)
1. Go to "Leave Management"
2. You'll see pending requests
3. Review each request
4. Click "Approve" or "Reject"
5. Add comments if needed

### Q: Can I see real-time employee locations?
**A:** (Admin only) Yes, go to Reports → GPS Tracking → Live Tracking to see currently checked-in employees' locations on a map.

### Q: How do I generate reports?
**A:** Go to Reports section and select:
- Attendance Report (daily, weekly, monthly)
- Leave Summary
- Payroll Report
- GPS Tracking
- Performance Analytics

### Q: Can I bulk import employees?
**A:** Currently, employees must be added individually. Bulk import may be available in future updates.

---

## Compliance & Legal

### Q: Is this GDPR compliant?
**A:** Yes, the system is designed with GDPR principles:
- Explicit consent for location tracking
- Right to access your data
- Right to deletion
- Data minimization (only collect what's needed)
- Secure data storage

### Q: Can I request my data?
**A:** Yes! Under GDPR/CCPA, you can request:
- Export of all your data
- Deletion of your data (right to be forgotten)
- Correction of inaccurate data

Contact your HR admin or privacy officer.

### Q: What happens to my data if I leave the company?
**A:** According to company policy and local laws:
- Active account may be deactivated
- Data may be archived for legal retention period
- You can request data deletion after retention period
- Contact HR for specific policies

---

## Troubleshooting GPS Issues

### Q: Error: "Geolocation is not supported by your browser"
**A:** 
- Update your browser to the latest version
- Try Chrome, Firefox, or Safari (modern versions)
- Check if you're using a very old device

### Q: Error: "User denied location access"
**A:**
**On Desktop:**
1. Click the location icon in address bar
2. Change to "Allow"
3. Refresh the page

**On iPhone:**
1. Settings → Privacy → Location Services
2. Find Safari/Chrome
3. Set to "While Using the App"

**On Android:**
1. Settings → Apps → Browser
2. Permissions → Location
3. Enable "Allow"

### Q: Error: "GPS timeout"
**A:**
- Move to an area with better GPS signal
- Go near a window or outside
- Turn on WiFi (even if not connected) for assisted GPS
- Restart your device's GPS (airplane mode on/off)
- Try increasing timeout if you're the admin

### Q: GPS is inaccurate (showing wrong location)
**A:**
- Ensure "High Accuracy" mode is enabled on device
- Go outside for better satellite visibility
- Wait for GPS to fully lock on
- WiFi can help improve accuracy
- Check if there are tall buildings interfering

---

## Best Practices

### Q: What's the best browser to use?
**A:**
- **Desktop:** Chrome, Firefox, Edge, or Safari (latest versions)
- **iPhone:** Safari (best for PWA features)
- **Android:** Chrome (best for PWA features)

### Q: Should I keep the app open all day?
**A:** No need! Just open it when you need to check in, check out, or access HR features. You can close it in between.

### Q: Do I need to enable notifications?
**A:** It's recommended but not required. Notifications help you stay informed about:
- Leave request approvals
- New tasks assigned
- Important announcements
- Reminders to check out

### Q: How often should I check the app?
**A:**
- Daily: For check-in and check-out
- As needed: For leave requests, profile updates
- Weekly: To review your attendance
- Monthly: To review your hours and payslips

---

## Getting Help

### Q: Who do I contact for help?
**A:**
- **Technical issues:** Your IT department
- **HR questions:** Your HR administrator
- **Feature requests:** Your HR admin or manager
- **Password resets:** HR administrator
- **Privacy concerns:** Your company's privacy officer

### Q: Is there a user manual?
**A:** Yes! Check these documents:
- `MOBILE_GUIDE.md` - Mobile usage guide
- `QUICK_MOBILE_SETUP.md` - Quick setup instructions
- `GPS_TRACKING_GUIDE.md` - GPS feature details
- `DOCUMENTATION.md` - Complete system documentation

### Q: How do I report a bug?
**A:** Contact your HR admin or IT department with:
- Description of the problem
- Steps to reproduce
- Screenshots if possible
- Browser/device information
- Error messages (from browser console)

### Q: Can I suggest new features?
**A:** Yes! Contact your HR admin with feature suggestions. They can request enhancements from the development team.

---

## Tips & Tricks

### 💡 Tip: Faster Check-In
Enable location services before opening the app so GPS is ready to go!

### 💡 Tip: Battery Saving
GPS only runs during check-in/check-out, so battery impact is minimal. No need to worry!

### 💡 Tip: Offline Access
Add the app to your home screen for quick access even when offline (limited features).

### 💡 Tip: Check Your Attendance
Review your attendance weekly to catch any missed check-ins/check-outs early.

### 💡 Tip: Plan Ahead
Apply for leaves in advance to give managers time to approve.

### 💡 Tip: Keep Profile Updated
Keep your emergency contact and personal info current in Settings.

---

## Quick Links

- 📱 Mobile Setup Guide: `QUICK_MOBILE_SETUP.md`
- 🗺️ GPS Guide: `GPS_TRACKING_GUIDE.md`
- 📖 Full Documentation: `DOCUMENTATION.md`
- 🔧 Developer Guide: `DEVELOPER_NOTES.md`
- ⚡ Recent Fixes: `RECENT_FIXES.md`

---

**Last Updated:** December 12, 2024
**Version:** 2.0
**Need more help?** Contact your HR administrator
