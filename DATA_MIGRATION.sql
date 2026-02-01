-- DATA MIGRATION SCRIPT
-- Migrate from old key-value store (kv_store_937488f4) to new normalized tables
-- Run this AFTER you've created the new schema using DATABASE_SETUP.sql

-- NOTE: This assumes both databases are accessible
-- If migrating between different Supabase projects, you'll need to export/import data manually

-- =====================
-- STEP 1: MIGRATE EMPLOYEES
-- =====================
-- This inserts employee records from the old KV store into the new employees table
-- Replace with your actual migration method based on how you export the old data

-- If using JSON import, structure should match the employees table columns:
-- INSERT INTO employees (id, email, name, role, department, job_title, phone_number, date_of_birth, hire_date, status, lifecycle_status, profile_image, address, emergency_contact, manager_id, shift_type, shift_start_time, shift_end_time, break_duration, weekly_working_days, shift_flexibility, monthly_salary, attendance_enabled, leave_enabled, created_at, updated_at)
-- VALUES (/* employee data */);

-- Example: If you have exported old employee data as JSON, you would use:
-- COPY employees FROM '/path/to/employees.json' WITH (FORMAT json);

-- =====================
-- STEP 2: MIGRATE ATTENDANCE
-- =====================
-- Migrate from old attendance:{userId}:{date} records

-- =====================
-- STEP 3: MIGRATE LEAVES
-- =====================
-- Migrate from old leave:{leaveId} records

-- =====================
-- STEP 4: MIGRATE DEPARTMENTS
-- =====================
-- Migrate from old dept:{deptId} records

-- =====================
-- STEP 5: MIGRATE JOBS & CANDIDATES
-- =====================
-- Migrate from old job:{jobId} and candidate:{candidateId} records

-- =====================
-- STEP 6: MIGRATE INTERVIEWS
-- =====================
-- Migrate from old interview:{interviewId} records

-- =====================
-- STEP 7: MIGRATE PERFORMANCE REVIEWS
-- =====================
-- Migrate from old review:{employeeId}:{reviewId} records

-- =====================
-- STEP 8: MIGRATE TASKS
-- =====================
-- Migrate from old task:{taskId} records

-- =====================
-- STEP 9: MIGRATE HOLIDAYS
-- =====================
-- Migrate from old holiday:{holidayId} records

-- =====================
-- STEP 10: MIGRATE PAYROLL & PAYMENTS
-- =====================
-- Migrate from old payroll:{employeeId}:{id} and payment:{employeeId}:{id} records

-- =====================
-- STEP 11: MIGRATE SETTLEMENTS
-- =====================
-- Migrate from old settlement:{employeeId}:{id} records

-- =====================
-- STEP 12: MIGRATE ACTIVITIES
-- =====================
-- Migrate from old activity:{timestamp}:{random} records

-- =====================
-- STEP 13: MIGRATE PERMISSIONS
-- =====================
-- Migrate from old permissions:{userId} records

-- =====================
-- ALTERNATIVE: MANUAL DATA EXPORT/IMPORT
-- =====================
-- If you need to manually migrate:

-- 1. In your OLD Supabase project:
--    - Go to SQL Editor
--    - Run: SELECT key, value FROM kv_store_937488f4;
--    - Export the results as JSON or CSV

-- 2. Transform the exported data to match the new schema structure
--    This is a manual process since the old structure was JSONB blobs

-- 3. In your NEW Supabase project:
--    - Use the Supabase UI to import data
--    - Or use COPY/INSERT statements with the transformed data

-- =====================
-- SAMPLE: IF MANUALLY COPYING EMPLOYEE DATA
-- =====================
-- If you've exported employees and saved as a JSON array, you could use:
-- 
-- INSERT INTO employees (
--   id, email, name, role, department, job_title, phone_number, 
--   date_of_birth, hire_date, status, lifecycle_status, profile_image,
--   address, emergency_contact, manager_id, shift_type, shift_start_time,
--   shift_end_time, break_duration, weekly_working_days, shift_flexibility,
--   monthly_salary, attendance_enabled, leave_enabled, created_at, updated_at
-- ) 
-- SELECT 
--   (data->>'id')::uuid,
--   data->>'email',
--   data->>'name',
--   data->>'role',
--   data->>'department',
--   data->>'jobTitle',
--   data->>'phoneNumber',
--   (data->>'dateOfBirth')::date,
--   (data->>'hireDate')::timestamp,
--   data->>'status',
--   data->>'lifecycleStatus',
--   data->>'profileImage',
--   data->>'address',
--   data->>'emergencyContact',
--   (data->>'managerId')::uuid,
--   data->>'shiftType',
--   (data->>'shiftStartTime')::time,
--   (data->>'shiftEndTime')::time,
--   (data->>'breakDuration')::integer,
--   data->>'weeklyWorkingDays',
--   data->>'shiftFlexibility',
--   (data->>'monthlySalary')::decimal,
--   COALESCE((data->>'attendanceEnabled')::boolean, true),
--   COALESCE((data->>'leaveEnabled')::boolean, true),
--   (data->>'createdAt')::timestamp,
--   (data->>'updatedAt')::timestamp
-- FROM (
--   SELECT jsonb_array_elements(/* your imported JSON array */) as data
-- ) AS imported_data;

-- =====================
-- RECOMMENDED APPROACH FOR THIS PROJECT
-- =====================
-- Since this is a dev database:
-- 1. Create all the new tables (DATABASE_SETUP.sql) ✅ DONE
-- 2. Seed with fresh test data using the API endpoints
-- 3. Keep the old database for reference if needed

-- To seed new data:
-- POST /auth/seed-admin - Create first admin user
-- POST /auth/register - Create more employees
-- POST /attendance/checkin - Add attendance records
-- ... and so on for other data types

-- This is cleaner than trying to migrate old JSONB data!
