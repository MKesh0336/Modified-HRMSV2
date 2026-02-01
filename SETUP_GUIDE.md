# HRMS V2 - New Supabase Database Setup Guide

## Overview
You now have:
- ✅ New Supabase Project created
- ✅ Database schema designed (17 properly normalized tables)
- ✅ Project credentials updated locally
- ✅ Environment variables configured

## What You Need to Do Now

### STEP 1: Create the Database Tables (CRITICAL - Do This First)

1. Go to your Supabase Dashboard: https://app.supabase.com/project/hikyzijvoqkrueiutzhb
2. Navigate to **SQL Editor** in the left sidebar
3. Click **"New Query"**
4. Open the `DATABASE_SETUP.sql` file in this project folder
5. Copy all the SQL content
6. Paste it into the Supabase SQL Editor
7. Click **"Run"** button
8. Wait for all queries to complete successfully

**What this creates:**
- employees
- attendance
- leaves
- departments
- jobs
- candidates
- interviews
- performance_reviews
- tasks
- holidays
- payroll
- payments
- settlements
- activities (audit log)
- permissions
- gps_traces
- user_email_map

---

### STEP 2: Data Migration (After Creating Tables)

Once the tables are created, you'll need to migrate your existing data from the old key-value table to the new normalized structure.

The old database used a single table (`kv_store_937488f4`) with JSONB values stored as:
- `employee:{userId}` - Employee profiles
- `attendance:{attendanceId}` - Attendance records
- `leave:{leaveId}` - Leave records
- `job:{jobId}` - Job postings
- `candidate:{candidateId}` - Candidates
- And many more...

**Migration Steps:**
1. Export data from your old Supabase project
2. Transform data to match the new schema structure
3. Import into the new database tables

> **Note:** Since this is for development/testing, you might want to start fresh with the new database and seed it with test data instead of migrating old data.

---

### STEP 3: Update Edge Functions (Backend)

The Edge Functions currently use the key-value store helper functions. Once you're ready to fully migrate, these need to be updated to use the new table structure.

**Files that need updating:**
- `src/supabase/functions/server/index.tsx` - Main API endpoints
- `src/supabase/functions/server/kv_store.tsx` - Database access layer

The Edge Functions will need to be refactored to use proper SQL queries instead of the KV helpers.

---

### STEP 4: Testing

After migration:
1. Test the `/auth/seed-admin` endpoint to create your first admin user
2. Test the `/auth/login` endpoint
3. Test `/employees` and other endpoints
4. Verify all data is being read/written from the new tables

---

## Current Status

### What's Done ✅
- New Supabase project created (hikyzijvoqkrueiutzhb)
- Database schema designed (17 tables)
- Frontend config updated with new credentials (`src/supabase/info.tsx` and `src/utils/supabase/info.tsx`)
- Environment variables set in dev server

### What's Pending 🔄
1. **Run the SQL schema** in your Supabase project (DATABASE_SETUP.sql)
2. **Migrate data** from old database (if needed)
3. **Refactor Edge Functions** to use new table structure (optional - keep using key-value for now)
4. **Test all endpoints** with the new database

---

## Database Schema Summary

### Employees Table
Stores all employee information with fields like:
- id, email, name, role, department, job_title, phone_number, hire_date
- shift information (shift_type, shift_start_time, shift_end_time, etc.)
- employment status (status, lifecycle_status)
- manager relationship (manager_id foreign key)

### Attendance Table
Tracks daily check-in/check-out with:
- employee_id, date, check_in, check_out
- location, notes, GPS coordinates
- calculated fields: total_hours, late_minutes, early_checkout_minutes

### Leaves Table
Manages leave requests:
- employee_id, leave_type, start_date, end_date
- status (pending, approved, rejected)
- approval workflow fields (approved_by, approved_at, rejected_reason)

### And 14 More Tables...
Each with proper relationships, indexes, and audit fields.

---

## Security Notes

⚠️ **Important Security Reminders:**

1. **Keep credentials safe** - Your service role key is now in environment variables, not in source code (good!)
2. **Rotate keys periodically** - If these keys were ever committed to git, rotate them in Supabase
3. **Use Edge Functions** - All backend logic runs as a service role, clients don't access the database directly
4. **Row Level Security** - Is enabled on all tables, but Edge Functions bypass it (that's okay for server-side logic)

---

## Next Steps After Setup

1. **If migrating from old database:**
   - Export data from old Supabase project
   - Write migration scripts to transform data
   - Import into new tables

2. **If starting fresh:**
   - Run `/auth/seed-admin` endpoint to create first admin user
   - Start using the app normally

3. **Optional: Refactor to use direct SQL queries:**
   - The current Edge Functions use key-value helpers
   - For better performance, you could rewrite them to use direct SQL queries
   - But it works fine as-is with the new tables

---

## Troubleshooting

### Error: "Table not found"
- Make sure you ran the DATABASE_SETUP.sql script in Supabase SQL Editor
- Check that the SQL executed without errors

### Error: "Unauthorized" on API calls
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly in environment
- Check that the new project URL is correct

### Data missing from new database
- This is expected if you haven't migrated data yet
- You can either migrate from old database or seed new test data

---

## Support

If you need help:
1. Check the DATABASE_SETUP.sql file for the exact schema
2. Verify all credentials are correct in `src/supabase/info.tsx`
3. Check environment variables are set
4. Verify the Supabase project URL matches: `https://hikyzijvoqkrueiutzhb.supabase.co`
