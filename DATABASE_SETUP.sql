-- HRMS V2 Database Schema
-- This SQL script sets up all tables for the new Supabase database
-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/YOUR_PROJECT/sql)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- EMPLOYEES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee', -- admin, manager, employee
  department VARCHAR(255),
  job_title VARCHAR(255),
  phone_number VARCHAR(20),
  date_of_birth DATE,
  hire_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'active', -- active, inactive
  lifecycle_status VARCHAR(50) DEFAULT 'active', -- active, resigned, terminated
  profile_image TEXT,
  address TEXT,
  emergency_contact TEXT,
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  shift_type VARCHAR(50) DEFAULT 'morning', -- morning, afternoon, night, custom
  shift_start_time TIME DEFAULT '09:00',
  shift_end_time TIME DEFAULT '17:00',
  break_duration INTEGER DEFAULT 60, -- in minutes
  weekly_working_days VARCHAR(50) DEFAULT 'mon-fri', -- mon-fri, mon-sat, all
  shift_flexibility VARCHAR(50) DEFAULT 'fixed', -- fixed, flexible
  custom_shift JSONB, -- For custom shifts per day
  monthly_salary DECIMAL(12, 2) DEFAULT 0,
  attendance_enabled BOOLEAN DEFAULT TRUE,
  leave_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_manager_id ON employees(manager_id);

-- =====================
-- ATTENDANCE TABLE
-- =====================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  check_in TIMESTAMP,
  check_out TIMESTAMP,
  check_in_lat DECIMAL(10, 8),
  check_in_lng DECIMAL(11, 8),
  check_out_lat DECIMAL(10, 8),
  check_out_lng DECIMAL(11, 8),
  location VARCHAR(255),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'present', -- present, absent, half-day, work-from-home
  total_hours DECIMAL(5, 2),
  late_minutes INTEGER DEFAULT 0,
  early_checkout_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, attendance_date)
);

CREATE INDEX idx_attendance_employee_id ON attendance(employee_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- =====================
-- LEAVES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(255),
  department VARCHAR(255),
  leave_type VARCHAR(50) NOT NULL, -- annual, sick, personal, maternity, etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  half_day BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  approved_at TIMESTAMP,
  rejected_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaves_employee_id ON leaves(employee_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_dates ON leaves(start_date, end_date);

-- =====================
-- DEPARTMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  head_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_head_id ON departments(head_id);

-- =====================
-- JOBS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  job_type VARCHAR(50), -- full-time, part-time, contract, etc.
  description TEXT,
  requirements TEXT,
  salary_range VARCHAR(100),
  status VARCHAR(50) DEFAULT 'open', -- open, closed, filled
  posted_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_department ON jobs(department);

-- =====================
-- CANDIDATES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  resume_url TEXT,
  linkedin_url TEXT,
  stage VARCHAR(50) DEFAULT 'applied', -- applied, screening, interview, offer, hired, rejected
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL, -- if hired
  credentials JSONB, -- if hired
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_candidates_job_id ON candidates(job_id);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_stage ON candidates(stage);

-- =====================
-- INTERVIEWS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  interviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  interview_date TIMESTAMP,
  interview_type VARCHAR(50), -- phone, in-person, video
  feedback TEXT,
  rating DECIMAL(3, 1),
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  notes JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX idx_interviews_status ON interviews(status);

-- =====================
-- PERFORMANCE REVIEWS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  rating DECIMAL(3, 1) NOT NULL,
  strengths TEXT,
  improvements TEXT,
  goals TEXT,
  overall_rating DECIMAL(3, 1),
  locked BOOLEAN DEFAULT FALSE,
  review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_performance_reviews_employee_id ON performance_reviews(employee_id);
CREATE INDEX idx_performance_reviews_date ON performance_reviews(review_date);

-- =====================
-- TASKS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES employees(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, in-progress, completed, cancelled
  priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
  due_date TIMESTAMP,
  completion_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- =====================
-- HOLIDAYS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  holiday_type VARCHAR(50), -- national, regional, company
  applies_to VARCHAR(50), -- all, specific_department
  department_ids UUID[] DEFAULT '{}'::UUID[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES employees(id) ON DELETE SET NULL
);

CREATE INDEX idx_holidays_date ON holidays(holiday_date);

-- =====================
-- PAYROLL TABLE
-- =====================
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payroll_month DATE NOT NULL,
  basic_salary DECIMAL(12, 2),
  allowances DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  overtime_amount DECIMAL(12, 2) DEFAULT 0,
  net_pay DECIMAL(12, 2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processed, paid
  processed_at TIMESTAMP,
  paid_at TIMESTAMP,
  processed_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, payroll_month)
);

CREATE INDEX idx_payroll_employee_id ON payroll(employee_id);
CREATE INDEX idx_payroll_status ON payroll(status);
CREATE INDEX idx_payroll_month ON payroll(payroll_month);

-- =====================
-- PAYMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_type VARCHAR(50), -- salary, advance, bonus, reimbursement
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processed, completed
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_employee_id ON payments(employee_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================
-- SETTLEMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS settlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name VARCHAR(255),
  department VARCHAR(255),
  basic_salary DECIMAL(12, 2),
  pending_dues DECIMAL(12, 2),
  advances DECIMAL(12, 2),
  deductions DECIMAL(12, 2),
  net_settlement DECIMAL(12, 2),
  resignation_date TIMESTAMP,
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, paid
  generated_by UUID REFERENCES employees(id) ON DELETE SET NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlements_employee_id ON settlements(employee_id);
CREATE INDEX idx_settlements_status ON settlements(status);

-- =====================
-- ACTIVITIES TABLE (Audit Log)
-- =====================
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action VARCHAR(255) NOT NULL,
  actor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  actor_name VARCHAR(255),
  actor_role VARCHAR(50),
  target_id UUID,
  target_name VARCHAR(255),
  department VARCHAR(255),
  details JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_action ON activities(action);
CREATE INDEX idx_activities_actor_id ON activities(actor_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
CREATE INDEX idx_activities_target_id ON activities(target_id);

-- =====================
-- PERMISSIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE UNIQUE,
  permissions TEXT[] DEFAULT '{}'::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_user_id ON permissions(user_id);

-- =====================
-- GPS TRACES TABLE (Optional - for GPS tracking)
-- =====================
CREATE TABLE IF NOT EXISTS gps_traces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(5, 2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_gps_traces_employee_id ON gps_traces(employee_id);
CREATE INDEX idx_gps_traces_timestamp ON gps_traces(timestamp);

-- =====================
-- USER EMAIL MAP TABLE
-- =====================
CREATE TABLE IF NOT EXISTS user_email_map (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_email_map_email ON user_email_map(email);
CREATE INDEX idx_user_email_map_user_id ON user_email_map(user_id);

-- =====================
-- POLICIES (Row Level Security)
-- =====================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_traces ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_email_map ENABLE ROW LEVEL SECURITY;

-- Create basic policies (Edge Functions will use service role, which bypasses RLS)
-- Allow authenticated users to read employees
CREATE POLICY "Users can read employees"
ON employees FOR SELECT
USING (true);

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read own attendance"
ON attendance FOR SELECT
USING (auth.uid()::text = employee_id::text);

-- Similar policies can be added for other tables as needed
