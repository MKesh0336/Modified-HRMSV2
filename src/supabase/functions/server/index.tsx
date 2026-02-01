import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';
import * as helpers from './helpers.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// =====================
// AUTHENTICATION ROUTES
// =====================

// SEED INITIAL ADMIN - FIRST-TIME SETUP ONLY
app.post('/make-server-937488f4/auth/seed-admin', async (c) => {
  try {
    // Check if any admin already exists
    const allEmployees = await kv.getByPrefix('employee:');
    const adminExists = allEmployees.some((emp: any) => emp.role === 'admin');
    
    if (adminExists) {
      return c.json({ error: 'Admin already exists. Use regular registration.' }, 400);
    }

    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create first admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      email_confirm: true
    });

    if (authError) {
      console.log('Error creating initial admin:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create admin employee profile
    const employeeData = {
      id: authData.user.id,
      email,
      name,
      role: 'admin',
      department: 'Administration',
      jobTitle: 'System Administrator',
      phoneNumber: null,
      dateOfBirth: null,
      hireDate: new Date().toISOString(),
      status: 'active',
      lifecycleStatus: 'active',
      profileImage: null,
      address: null,
      emergencyContact: null,
      managerId: null,
      shiftType: 'morning',
      shiftStartTime: '09:00',
      shiftEndTime: '17:00',
      breakDuration: 60,
      weeklyWorkingDays: 'mon-fri',
      shiftFlexibility: 'flexible',
      monthlySalary: 0,
      createdAt: new Date().toISOString()
    };

    await kv.set(`employee:${authData.user.id}`, employeeData);
    await kv.set(`user:email:${email}`, authData.user.id);

    return c.json({ 
      message: 'Initial admin created successfully! You can now login.',
      user: {
        id: authData.user.id,
        email,
        name,
        role: 'admin'
      }
    });
  } catch (error) {
    console.log('Seed admin error:', error);
    return c.json({ error: 'Failed to create initial admin' }, 500);
  }
});

// Register new user - ADMIN ONLY
app.post('/make-server-937488f4/auth/register', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    // Check if requester is admin
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user: requester } } = await supabase.auth.getUser(accessToken);
      if (requester) {
        const requesterData = await kv.get(`employee:${requester.id}`);
        if (requesterData?.role !== 'admin') {
          return c.json({ error: 'Only admins can create employee accounts' }, 403);
        }
      }
    }

    const { 
      email, 
      password, 
      name, 
      role = 'employee',
      department = null,
      jobTitle = null,
      phoneNumber = null,
      dateOfBirth = null,
      joiningDate = null,
      managerId = null,
      profileImage = null,
      address = null,
      emergencyContact = null,
      // New shift fields
      shiftType = 'morning',
      shiftStartTime = '09:00',
      shiftEndTime = '17:00',
      breakDuration = 60,
      weeklyWorkingDays = 'mon-fri',
      shiftFlexibility = 'fixed',
      // Salary field
      monthlySalary = 0
    } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role },
      email_confirm: true
    });

    if (authError) {
      console.log('Auth creation error during registration:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create employee profile in KV store with extended fields
    const employeeData = {
      id: authData.user.id,
      email,
      name,
      role,
      department,
      jobTitle,
      phoneNumber,
      dateOfBirth,
      hireDate: joiningDate || new Date().toISOString(),
      status: 'active',
      lifecycleStatus: 'active',
      profileImage,
      address,
      emergencyContact,
      managerId,
      // Shift information
      shiftType,
      shiftStartTime,
      shiftEndTime,
      breakDuration,
      weeklyWorkingDays,
      shiftFlexibility,
      // Salary
      monthlySalary,
      createdAt: new Date().toISOString()
    };

    await kv.set(`employee:${authData.user.id}`, employeeData);
    await kv.set(`user:email:${email}`, authData.user.id);

    // Log activity
    const requesterData = await kv.get(`employee:${requester.id}`);
    await helpers.logActivity({
      action: 'employee_created',
      actorId: requester.id,
      actorName: requesterData?.name || 'Admin',
      actorRole: requesterData?.role || 'admin',
      targetId: authData.user.id,
      targetName: name,
      department: department || 'Not assigned',
      details: { email, role, jobTitle }
    });

    return c.json({ 
      message: 'Employee created successfully',
      user: {
        id: authData.user.id,
        email,
        name,
        role
      }
    });
  } catch (error) {
    console.log('Registration error:', error);
    return c.json({ error: 'Internal server error during registration' }, 500);
  }
});

// Login
app.post('/make-server-937488f4/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.log('Login error:', error);
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Get employee data
    const employeeData = await kv.get(`employee:${data.user.id}`);

    return c.json({
      access_token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata.name,
        role: data.user.user_metadata.role || employeeData?.role || 'employee',
        employee: employeeData
      }
    });
  } catch (error) {
    console.log('Login process error:', error);
    return c.json({ error: 'Internal server error during login' }, 500);
  }
});

// Get current user
app.get('/make-server-937488f4/auth/me', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeData = await kv.get(`employee:${user.id}`);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata.name,
        role: user.user_metadata.role || employeeData?.role || 'employee',
        employee: employeeData
      }
    });
  } catch (error) {
    console.log('Get current user error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// =====================
// EMPLOYEE ROUTES
// =====================

// Get all employees
app.get('/make-server-937488f4/employees', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employees = await kv.getByPrefix('employee:');
    return c.json({ employees });
  } catch (error) {
    console.log('Get employees error:', error);
    return c.json({ error: 'Failed to fetch employees' }, 500);
  }
});

// Get single employee
app.get('/make-server-937488f4/employees/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeId = c.req.param('id');
    const employee = await kv.get(`employee:${employeeId}`);

    if (!employee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    return c.json({ employee });
  } catch (error) {
    console.log('Get employee error:', error);
    return c.json({ error: 'Failed to fetch employee' }, 500);
  }
});

// Update employee
app.put('/make-server-937488f4/employees/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const employeeId = c.req.param('id');
    const updates = await c.req.json();

    const currentData = await kv.get(`employee:${employeeId}`);
    if (!currentData) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    // Check if lifecycleStatus is being changed to resigned/terminated
    if (updates.lifecycleStatus && ['resigned', 'terminated'].includes(updates.lifecycleStatus)) {
      // Only Manager of same department or Admin can change to resigned/terminated
      if (currentEmployee?.role === 'manager' && currentData.department !== currentEmployee.department) {
        return c.json({ error: 'You can only update employees in your department' }, 403);
      }

      if (currentEmployee?.role !== 'admin' && currentEmployee?.role !== 'manager') {
        return c.json({ error: 'Forbidden' }, 403);
      }

      // Auto-disable attendance and leave
      updates.attendanceEnabled = false;
      updates.leaveEnabled = false;
      
      // Generate final settlement automatically
      const settlement = await helpers.calculateFinalSettlement(employeeId);
      const settlementId = `settlement:${employeeId}:${Date.now()}`;
      const settlementData = {
        id: settlementId,
        employeeId,
        employeeName: currentData.name,
        department: currentData.department,
        resignationDate: new Date().toISOString(),
        ...settlement,
        status: 'pending',
        generatedBy: user.id,
        generatedAt: new Date().toISOString(),
        paidAt: null
      };
      await kv.set(settlementId, settlementData);

      // Log activity
      await helpers.logActivity({
        action: updates.lifecycleStatus === 'resigned' ? 'employee_resigned' : 'employee_terminated',
        actorId: user.id,
        actorName: currentEmployee.name,
        actorRole: currentEmployee.role,
        targetId: employeeId,
        targetName: currentData.name,
        department: currentData.department,
        details: { settlementGenerated: true }
      });
    }

    const updatedData = {
      ...currentData,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`employee:${employeeId}`, updatedData);

    // Log general employee update
    await helpers.logActivity({
      action: 'employee_updated',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: employeeId,
      targetName: currentData.name,
      department: currentData.department,
      details: { updates: Object.keys(updates) }
    });

    return c.json({ message: 'Employee updated', employee: updatedData });
  } catch (error) {
    console.log('Update employee error:', error);
    return c.json({ error: 'Failed to update employee' }, 500);
  }
});

// Delete employee
app.delete('/make-server-937488f4/employees/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const employeeId = c.req.param('id');
    await kv.del(`employee:${employeeId}`);

    return c.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.log('Delete employee error:', error);
    return c.json({ error: 'Failed to delete employee' }, 500);
  }
});

// =====================
// ATTENDANCE ROUTES
// =====================

// Check-in
app.post('/make-server-937488f4/attendance/checkin', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { date, location, notes } = await c.req.json();
    const attendanceId = `${user.id}:${date || new Date().toISOString().split('T')[0]}`;

    const attendanceData = {
      id: attendanceId,
      employeeId: user.id,
      date: date || new Date().toISOString().split('T')[0],
      checkIn: new Date().toISOString(),
      checkOut: null,
      location: location || 'Office',
      notes: notes || '',
      status: 'present',
      totalHours: null
    };

    await kv.set(`attendance:${attendanceId}`, attendanceData);

    return c.json({ message: 'Checked in successfully', attendance: attendanceData });
  } catch (error) {
    console.log('Check-in error:', error);
    return c.json({ error: 'Failed to check in' }, 500);
  }
});

// Check-out
app.post('/make-server-937488f4/attendance/checkout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { date } = await c.req.json();
    const attendanceId = `${user.id}:${date || new Date().toISOString().split('T')[0]}`;

    const attendanceData = await kv.get(`attendance:${attendanceId}`);
    if (!attendanceData) {
      return c.json({ error: 'No check-in record found' }, 404);
    }

    const checkInTime = new Date(attendanceData.checkIn);
    const checkOutTime = new Date();
    const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    const updatedData = {
      ...attendanceData,
      checkOut: checkOutTime.toISOString(),
      totalHours: Math.round(hours * 100) / 100
    };

    await kv.set(`attendance:${attendanceId}`, updatedData);

    return c.json({ message: 'Checked out successfully', attendance: updatedData });
  } catch (error) {
    console.log('Check-out error:', error);
    return c.json({ error: 'Failed to check out' }, 500);
  }
});

// Get attendance by employee
app.get('/make-server-937488f4/attendance/:empId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const empId = c.req.param('empId');
    const allAttendance = await kv.getByPrefix('attendance:');
    
    const employeeAttendance = allAttendance.filter(
      (record: any) => record.employeeId === empId
    );

    return c.json({ attendance: employeeAttendance });
  } catch (error) {
    console.log('Get attendance error:', error);
    return c.json({ error: 'Failed to fetch attendance' }, 500);
  }
});

// Get all attendance
app.get('/make-server-937488f4/attendance', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allAttendance = await kv.getByPrefix('attendance:');
    return c.json({ attendance: allAttendance });
  } catch (error) {
    console.log('Get all attendance error:', error);
    return c.json({ error: 'Failed to fetch attendance' }, 500);
  }
});

// =====================
// LEAVE ROUTES
// =====================

// Apply for leave
app.post('/make-server-937488f4/leave/apply', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeData = await kv.get(`employee:${user.id}`);
    
    // Check if leave is enabled for this employee
    if (employeeData?.leaveEnabled === false) {
      return c.json({ error: 'Leave is disabled for your account' }, 403);
    }

    const { leaveType, startDate, endDate, reason, halfDay } = await c.req.json();
    
    // Validate that leave is not backdated (only same-day or future)
    if (!helpers.isValidLeaveDate(startDate)) {
      return c.json({ error: 'Cannot apply for backdated leave. Only same-day or future leaves are allowed.' }, 400);
    }

    const leaveId = `leave:${user.id}:${Date.now()}`;

    const leaveData = {
      id: leaveId,
      employeeId: user.id,
      employeeName: employeeData.name,
      department: employeeData.department,
      leaveType,
      startDate,
      endDate,
      reason,
      halfDay: halfDay || false,
      status: 'pending',
      appliedAt: new Date().toISOString(),
      approvedBy: null,
      approvedAt: null,
      rejectedReason: null
    };

    await kv.set(leaveId, leaveData);

    // Log activity
    await helpers.logActivity({
      action: 'leave_applied',
      actorId: user.id,
      actorName: employeeData.name,
      actorRole: employeeData.role,
      department: employeeData.department,
      details: { leaveType, startDate, endDate, reason }
    });

    return c.json({ message: 'Leave application submitted', leave: leaveData });
  } catch (error) {
    console.log('Leave application error:', error);
    return c.json({ error: 'Failed to apply for leave' }, 500);
  }
});

// Get all leaves
app.get('/make-server-937488f4/leave/list', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allLeaves = await kv.getByPrefix('leave:');
    const currentEmployee = await kv.get(`employee:${user.id}`);

    // If admin/manager, return all leaves. Otherwise, only user's leaves
    if (currentEmployee?.role === 'admin' || currentEmployee?.role === 'manager') {
      return c.json({ leaves: allLeaves });
    } else {
      const userLeaves = allLeaves.filter((leave: any) => leave.employeeId === user.id);
      return c.json({ leaves: userLeaves });
    }
  } catch (error) {
    console.log('Get leaves error:', error);
    return c.json({ error: 'Failed to fetch leaves' }, 500);
  }
});

// Approve leave (ADMIN ONLY)
app.put('/make-server-937488f4/leave/approve/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    
    // ONLY ADMIN can approve leaves
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Only Admin can approve leaves' }, 403);
    }

    const leaveId = c.req.param('id');
    const leaveData = await kv.get(leaveId);

    if (!leaveData) {
      return c.json({ error: 'Leave request not found' }, 404);
    }

    const updatedLeave = {
      ...leaveData,
      status: 'approved',
      approvedBy: user.id,
      approvedByName: currentEmployee.name,
      approvedAt: new Date().toISOString()
    };

    await kv.set(leaveId, updatedLeave);

    // Log activity immediately
    await helpers.logActivity({
      action: 'leave_approved',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: leaveData.employeeId,
      targetName: leaveData.employeeName,
      department: leaveData.department,
      details: { leaveType: leaveData.leaveType, startDate: leaveData.startDate, endDate: leaveData.endDate }
    });

    return c.json({ message: 'Leave approved', leave: updatedLeave });
  } catch (error) {
    console.log('Approve leave error:', error);
    return c.json({ error: 'Failed to approve leave' }, 500);
  }
});

// Reject leave (ADMIN ONLY)
app.put('/make-server-937488f4/leave/reject/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    
    // ONLY ADMIN can reject leaves
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Only Admin can reject leaves' }, 403);
    }

    const { reason } = await c.req.json();
    const leaveId = c.req.param('id');
    const leaveData = await kv.get(leaveId);

    if (!leaveData) {
      return c.json({ error: 'Leave request not found' }, 404);
    }

    const updatedLeave = {
      ...leaveData,
      status: 'rejected',
      approvedBy: user.id,
      approvedByName: currentEmployee.name,
      approvedAt: new Date().toISOString(),
      rejectedReason: reason || 'No reason provided'
    };

    await kv.set(leaveId, updatedLeave);

    // Log activity immediately
    await helpers.logActivity({
      action: 'leave_rejected',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: leaveData.employeeId,
      targetName: leaveData.employeeName,
      department: leaveData.department,
      details: { leaveType: leaveData.leaveType, reason: reason || 'No reason provided' }
    });

    return c.json({ message: 'Leave rejected', leave: updatedLeave });
  } catch (error) {
    console.log('Reject leave error:', error);
    return c.json({ error: 'Failed to reject leave' }, 500);
  }
});

// =====================
// RECRUITMENT (ATS) ROUTES
// =====================

// Create job posting
app.post('/make-server-937488f4/jobs', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin' && currentEmployee?.role !== 'manager') {
      return c.json({ error: 'Forbidden: Manager or Admin access required' }, 403);
    }

    const { title, department, location, type, description, requirements, salary } = await c.req.json();
    const jobId = `job:${Date.now()}`;

    const jobData = {
      id: jobId,
      title,
      department,
      location,
      type,
      description,
      requirements,
      salary,
      status: 'open',
      postedBy: user.id,
      postedAt: new Date().toISOString(),
      closedAt: null
    };

    await kv.set(jobId, jobData);

    return c.json({ message: 'Job posted successfully', job: jobData });
  } catch (error) {
    console.log('Create job error:', error);
    return c.json({ error: 'Failed to create job' }, 500);
  }
});

// Get all jobs
app.get('/make-server-937488f4/jobs', async (c) => {
  try {
    const jobs = await kv.getByPrefix('job:');
    return c.json({ jobs });
  } catch (error) {
    console.log('Get jobs error:', error);
    return c.json({ error: 'Failed to fetch jobs' }, 500);
  }
});

// Create candidate
app.post('/make-server-937488f4/candidates', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { jobId, name, email, phone, resume, linkedIn, stage } = await c.req.json();
    const candidateId = `candidate:${Date.now()}`;

    const candidateData = {
      id: candidateId,
      jobId,
      name,
      email,
      phone,
      resume,
      linkedIn,
      stage: stage || 'applied',
      appliedAt: new Date().toISOString(),
      notes: [],
      interviews: []
    };

    await kv.set(candidateId, candidateData);

    return c.json({ message: 'Candidate added successfully', candidate: candidateData });
  } catch (error) {
    console.log('Create candidate error:', error);
    return c.json({ error: 'Failed to add candidate' }, 500);
  }
});

// Get all candidates
app.get('/make-server-937488f4/candidates', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const candidates = await kv.getByPrefix('candidate:');
    return c.json({ candidates });
  } catch (error) {
    console.log('Get candidates error:', error);
    return c.json({ error: 'Failed to fetch candidates' }, 500);
  }
});

// Update candidate status
app.put('/make-server-937488f4/candidates/status/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const candidateId = c.req.param('id');
    const { stage, notes, employeeData } = await c.req.json();

    const candidateData = await kv.get(candidateId);
    if (!candidateData) {
      return c.json({ error: 'Candidate not found' }, 404);
    }

    const updatedCandidate = {
      ...candidateData,
      stage,
      notes: notes ? [...(candidateData.notes || []), { text: notes, addedAt: new Date().toISOString(), addedBy: user.id }] : candidateData.notes,
      updatedAt: new Date().toISOString()
    };

    await kv.set(candidateId, updatedCandidate);

    // If candidate is hired, automatically create employee record
    if (stage === 'hired') {
      const password = helpers.generateRandomPassword();
      const jobData = await kv.get(candidateData.jobId);
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: candidateData.email,
        password,
        user_metadata: { 
          name: candidateData.name, 
          role: employeeData?.role || 'employee' 
        },
        email_confirm: true
      });

      if (!authError && authData) {
        // Create employee profile
        const newEmployeeData = {
          id: authData.user.id,
          email: candidateData.email,
          name: candidateData.name,
          role: employeeData?.role || 'employee',
          department: employeeData?.department || jobData?.department || 'General',
          jobTitle: employeeData?.jobTitle || jobData?.title || 'Employee',
          phoneNumber: candidateData.phone || null,
          dateOfBirth: employeeData?.dateOfBirth || null,
          hireDate: new Date().toISOString(),
          status: 'active',
          lifecycleStatus: 'active',
          profileImage: null,
          address: employeeData?.address || null,
          emergencyContact: employeeData?.emergencyContact || null,
          managerId: employeeData?.managerId || null,
          shiftType: employeeData?.shiftType || 'morning',
          shiftStartTime: employeeData?.shiftStartTime || '09:00',
          shiftEndTime: employeeData?.shiftEndTime || '17:00',
          breakDuration: employeeData?.breakDuration || 60,
          weeklyWorkingDays: employeeData?.weeklyWorkingDays || 'mon-fri',
          shiftFlexibility: employeeData?.shiftFlexibility || 'fixed',
          monthlySalary: employeeData?.monthlySalary || 0,
          attendanceEnabled: true,
          leaveEnabled: true,
          createdAt: new Date().toISOString(),
          createdFromCandidateId: candidateId
        };

        await kv.set(`employee:${authData.user.id}`, newEmployeeData);
        await kv.set(`user:email:${candidateData.email}`, authData.user.id);

        // Update candidate with employee reference
        updatedCandidate.employeeId = authData.user.id;
        updatedCandidate.credentials = { email: candidateData.email, password };
        await kv.set(candidateId, updatedCandidate);

        const currentEmployee = await kv.get(`employee:${user.id}`);
        
        // Log activity
        await helpers.logActivity({
          action: 'candidate_hired',
          actorId: user.id,
          actorName: currentEmployee?.name || 'System',
          actorRole: currentEmployee?.role || 'admin',
          targetId: authData.user.id,
          targetName: candidateData.name,
          department: newEmployeeData.department,
          details: { candidateId, jobId: candidateData.jobId, credentials: { email: candidateData.email, password } }
        });
      }
    }

    return c.json({ message: 'Candidate updated', candidate: updatedCandidate });
  } catch (error) {
    console.log('Update candidate error:', error);
    return c.json({ error: 'Failed to update candidate' }, 500);
  }
});

// =====================
// PERFORMANCE ROUTES
// =====================

// Create performance review
app.post('/make-server-937488f4/performance/review', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin' && currentEmployee?.role !== 'manager') {
      return c.json({ error: 'Forbidden: Manager or Admin access required' }, 403);
    }

    const { employeeId, period, ratings, strengths, improvements, goals, overallRating } = await c.req.json();
    
    const targetEmployee = await kv.get(`employee:${employeeId}`);
    if (!targetEmployee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    // Managers can only review employees in their own department
    if (currentEmployee.role === 'manager') {
      if (targetEmployee.department !== currentEmployee.department) {
        return c.json({ error: 'Managers can only review employees in their own department' }, 403);
      }
      
      // Managers cannot review other managers or admins
      if (targetEmployee.role === 'manager' || targetEmployee.role === 'admin') {
        return c.json({ error: 'Managers cannot review other managers or admins' }, 403);
      }
    }

    // Admin can review managers only
    if (currentEmployee.role === 'admin' && targetEmployee.role === 'employee') {
      // Admin typically reviews managers, but can review anyone
      // No restriction here
    }

    // Check if review already exists for this month
    const currentMonth = new Date().toISOString().substring(0, 7);
    const existingReviews = await kv.getByPrefix(`review:${employeeId}:`);
    const monthlyReview = existingReviews.find((r: any) => 
      r.period?.startsWith(currentMonth) || r.createdAt?.startsWith(currentMonth)
    );

    if (monthlyReview) {
      return c.json({ error: 'A review for this employee already exists for the current month' }, 400);
    }

    const reviewId = `review:${employeeId}:${Date.now()}`;

    const reviewData = {
      id: reviewId,
      employeeId,
      employeeName: targetEmployee.name,
      employeeDepartment: targetEmployee.department,
      reviewerId: user.id,
      reviewerName: currentEmployee.name,
      period,
      ratings,
      strengths,
      improvements,
      goals,
      overallRating,
      locked: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(reviewId, reviewData);

    // Log activity
    await helpers.logActivity({
      action: 'performance_review_submitted',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: employeeId,
      targetName: targetEmployee.name,
      department: targetEmployee.department,
      details: { period, overallRating }
    });

    return c.json({ message: 'Performance review created', review: reviewData });
  } catch (error) {
    console.log('Create performance review error:', error);
    return c.json({ error: 'Failed to create review' }, 500);
  }
});

// Get performance reviews by employee
app.get('/make-server-937488f4/performance/:empId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const empId = c.req.param('empId');
    const allReviews = await kv.getByPrefix('review:');
    
    let employeeReviews = allReviews.filter(
      (review: any) => review.employeeId === empId
    );

    // Employees can only see their own reviews
    // Admin can see all reviews
    // Managers can see reviews they created or reviews of their department employees
    if (currentEmployee?.role === 'employee' && empId !== user.id) {
      return c.json({ reviews: [] });
    }

    return c.json({ reviews: employeeReviews });
  } catch (error) {
    console.log('Get performance reviews error:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// Update performance review (Admin can unlock and edit locked reviews)
app.put('/make-server-937488f4/performance/review/:reviewId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const reviewId = c.req.param('reviewId');
    const updates = await c.req.json();

    const reviewData = await kv.get(reviewId);
    if (!reviewData) {
      return c.json({ error: 'Review not found' }, 404);
    }

    // Check if review is locked
    if (reviewData.locked && currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Review is locked. Only Admin can edit locked reviews.' }, 403);
    }

    const updatedReview = {
      ...reviewData,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    };

    await kv.set(reviewId, updatedReview);

    // Log activity
    await helpers.logActivity({
      action: 'performance_review_updated',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: reviewData.employeeId,
      targetName: reviewData.employeeName,
      department: reviewData.employeeDepartment,
      details: { reviewId, changes: Object.keys(updates) }
    });

    return c.json({ message: 'Review updated', review: updatedReview });
  } catch (error) {
    console.log('Update review error:', error);
    return c.json({ error: 'Failed to update review' }, 500);
  }
});

// Lock performance review (automatically locks after submission)
app.put('/make-server-937488f4/performance/review/:reviewId/lock', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reviewId = c.req.param('reviewId');
    const reviewData = await kv.get(reviewId);
    
    if (!reviewData) {
      return c.json({ error: 'Review not found' }, 404);
    }

    const updatedReview = {
      ...reviewData,
      locked: true,
      lockedAt: new Date().toISOString(),
      lockedBy: user.id
    };

    await kv.set(reviewId, updatedReview);

    return c.json({ message: 'Review locked', review: updatedReview });
  } catch (error) {
    console.log('Lock review error:', error);
    return c.json({ error: 'Failed to lock review' }, 500);
  }
});

// =====================
// DEPARTMENT ROUTES
// =====================

// Create department
app.post('/make-server-937488f4/departments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { name, description, headId } = await c.req.json();
    const deptId = `dept:${Date.now()}`;

    const deptData = {
      id: deptId,
      name,
      description,
      headId,
      createdAt: new Date().toISOString()
    };

    await kv.set(deptId, deptData);

    return c.json({ message: 'Department created', department: deptData });
  } catch (error) {
    console.log('Create department error:', error);
    return c.json({ error: 'Failed to create department' }, 500);
  }
});

// Get all departments
app.get('/make-server-937488f4/departments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const departments = await kv.getByPrefix('dept:');
    return c.json({ departments });
  } catch (error) {
    console.log('Get departments error:', error);
    return c.json({ error: 'Failed to fetch departments' }, 500);
  }
});

// =====================
// DASHBOARD STATS
// =====================

app.get('/make-server-937488f4/dashboard/stats', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employees = await kv.getByPrefix('employee:');
    const leaves = await kv.getByPrefix('leave:');
    const attendance = await kv.getByPrefix('attendance:');
    const jobs = await kv.getByPrefix('job:');

    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter((a: any) => a.date === today);

    const stats = {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e: any) => e.status === 'active').length,
      pendingLeaves: leaves.filter((l: any) => l.status === 'pending').length,
      todayPresent: todayAttendance.filter((a: any) => a.status === 'present').length,
      openJobs: jobs.filter((j: any) => j.status === 'open').length
    };

    return c.json({ stats });
  } catch (error) {
    console.log('Get dashboard stats error:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// =====================
// HOLIDAY MANAGEMENT ROUTES
// =====================

// Create holiday
app.post('/make-server-937488f4/holidays', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { name, date, type, applyTo, departments } = await c.req.json();
    const holidayId = `holiday:${Date.now()}`;

    const holidayData = {
      id: holidayId,
      name,
      date,
      type, // paid, unpaid, optional
      applyTo, // all, specific
      departments: departments || [],
      createdBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(holidayId, holidayData);

    return c.json({ message: 'Holiday created', holiday: holidayData });
  } catch (error) {
    console.log('Create holiday error:', error);
    return c.json({ error: 'Failed to create holiday' }, 500);
  }
});

// Get all holidays
app.get('/make-server-937488f4/holidays', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const holidays = await kv.getByPrefix('holiday:');
    return c.json({ holidays });
  } catch (error) {
    console.log('Get holidays error:', error);
    return c.json({ error: 'Failed to fetch holidays' }, 500);
  }
});

// Delete holiday
app.delete('/make-server-937488f4/holidays/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const holidayId = c.req.param('id');
    await kv.del(holidayId);

    return c.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.log('Delete holiday error:', error);
    return c.json({ error: 'Failed to delete holiday' }, 500);
  }
});

// =====================
// GPS TRACKING ROUTES
// =====================

// Save location trace
app.post('/make-server-937488f4/attendance/location-trace', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { latitude, longitude, timestamp } = await c.req.json();
    const traceId = `trace:${user.id}:${Date.now()}`;

    const traceData = {
      id: traceId,
      employeeId: user.id,
      latitude,
      longitude,
      timestamp: timestamp || new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    };

    await kv.set(traceId, traceData);

    return c.json({ message: 'Location saved', trace: traceData });
  } catch (error) {
    console.log('Save location error:', error);
    return c.json({ error: 'Failed to save location' }, 500);
  }
});

// Get location traces for employee
app.get('/make-server-937488f4/attendance/location-trace/:empId/:date', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const empId = c.req.param('empId');
    const date = c.req.param('date');
    const allTraces = await kv.getByPrefix('trace:');
    
    const traces = allTraces.filter(
      (t: any) => t.employeeId === empId && t.date === date
    );

    return c.json({ traces });
  } catch (error) {
    console.log('Get traces error:', error);
    return c.json({ error: 'Failed to fetch traces' }, 500);
  }
});

// GPS Check-in
app.post('/make-server-937488f4/attendance/gps-checkin', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeData = await kv.get(`employee:${user.id}`);
    
    // Check if attendance is enabled for this employee
    if (employeeData?.attendanceEnabled === false) {
      return c.json({ error: 'Attendance is disabled for your account' }, 403);
    }

    // Auto-capture current date and time - employees cannot select date
    const currentDate = new Date().toISOString().split('T')[0];
    const { latitude, longitude, location } = await c.req.json();
    const attendanceId = `${user.id}:${currentDate}`;

    // Get shift times (including custom shift support)
    const shiftTimes = helpers.getShiftTimesForDay(employeeData, new Date());
    
    const attendanceData = {
      id: attendanceId,
      employeeId: user.id,
      date: currentDate,
      checkIn: new Date().toISOString(),
      checkInLat: latitude,
      checkInLng: longitude,
      checkOut: null,
      checkOutLat: null,
      checkOutLng: null,
      location: location || 'Office',
      status: 'present',
      totalHours: null,
      lateMinutes: 0,
      earlyCheckoutMinutes: 0,
      shiftStartTime: shiftTimes?.start || '09:00',
      shiftEndTime: shiftTimes?.end || '17:00'
    };

    // Calculate if late
    const checkInTime = new Date(attendanceData.checkIn);
    const [shiftHour, shiftMinute] = attendanceData.shiftStartTime.split(':');
    const shiftStart = new Date(checkInTime);
    shiftStart.setHours(parseInt(shiftHour), parseInt(shiftMinute), 0, 0);
    
    if (checkInTime > shiftStart) {
      const lateMs = checkInTime.getTime() - shiftStart.getTime();
      attendanceData.lateMinutes = Math.floor(lateMs / (1000 * 60));
    }

    await kv.set(`attendance:${attendanceId}`, attendanceData);

    // Log activity
    await helpers.logActivity({
      action: 'attendance_checkin',
      actorId: user.id,
      actorName: employeeData.name,
      actorRole: employeeData.role,
      department: employeeData.department,
      details: { 
        date: currentDate, 
        time: new Date().toISOString().substring(11, 19),
        late: attendanceData.lateMinutes > 0,
        lateMinutes: attendanceData.lateMinutes
      }
    });

    return c.json({ message: 'GPS check-in successful', attendance: attendanceData });
  } catch (error) {
    console.log('GPS check-in error:', error);
    return c.json({ error: 'Failed to check in with GPS' }, 500);
  }
});

// GPS Check-out
app.post('/make-server-937488f4/attendance/gps-checkout', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeData = await kv.get(`employee:${user.id}`);
    
    // Check if attendance is enabled
    if (employeeData?.attendanceEnabled === false) {
      return c.json({ error: 'Attendance is disabled for your account' }, 403);
    }

    // Auto-capture current date
    const currentDate = new Date().toISOString().split('T')[0];
    const { latitude, longitude } = await c.req.json();
    const attendanceId = `${user.id}:${currentDate}`;

    const attendanceData = await kv.get(`attendance:${attendanceId}`);
    if (!attendanceData) {
      return c.json({ error: 'No check-in record found' }, 404);
    }

    const checkInTime = new Date(attendanceData.checkIn);
    const checkOutTime = new Date();
    const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

    // Calculate if early checkout
    const [endHour, endMinute] = attendanceData.shiftEndTime.split(':');
    const shiftEnd = new Date(checkOutTime);
    shiftEnd.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
    
    let earlyCheckoutMinutes = 0;
    if (checkOutTime < shiftEnd) {
      const earlyMs = shiftEnd.getTime() - checkOutTime.getTime();
      earlyCheckoutMinutes = Math.floor(earlyMs / (1000 * 60));
    }

    const updatedData = {
      ...attendanceData,
      checkOut: checkOutTime.toISOString(),
      checkOutLat: latitude,
      checkOutLng: longitude,
      totalHours: Math.round(hours * 100) / 100,
      earlyCheckoutMinutes
    };

    await kv.set(`attendance:${attendanceId}`, updatedData);

    // Log activity
    await helpers.logActivity({
      action: 'attendance_checkout',
      actorId: user.id,
      actorName: employeeData.name,
      actorRole: employeeData.role,
      department: employeeData.department,
      details: { 
        date: currentDate, 
        time: new Date().toISOString().substring(11, 19),
        totalHours: updatedData.totalHours,
        earlyCheckout: earlyCheckoutMinutes > 0,
        earlyCheckoutMinutes
      }
    });

    return c.json({ message: 'GPS check-out successful', attendance: updatedData });
  } catch (error) {
    console.log('GPS check-out error:', error);
    return c.json({ error: 'Failed to check out with GPS' }, 500);
  }
});

// =====================
// TASK MANAGEMENT ROUTES
// =====================

// Create task
app.post('/make-server-937488f4/tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin' && currentEmployee?.role !== 'manager') {
      return c.json({ error: 'Forbidden: Manager or Admin access required' }, 403);
    }

    const { 
      assignedTo, 
      title, 
      description, 
      startDate, 
      dueDate, 
      priority,
      attachments 
    } = await c.req.json();
    
    const taskId = `task:${Date.now()}`;

    const taskData = {
      id: taskId,
      assignedTo,
      assignedBy: user.id,
      title,
      description,
      startDate,
      dueDate,
      priority, // low, medium, high
      status: 'pending',
      attachments: attachments || [],
      submittedWork: null,
      submittedAt: null,
      reviewStatus: null,
      reviewComment: null,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date().toISOString()
    };

    await kv.set(taskId, taskData);

    return c.json({ message: 'Task created', task: taskData });
  } catch (error) {
    console.log('Create task error:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// Get tasks (filtered by role)
app.get('/make-server-937488f4/tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allTasks = await kv.getByPrefix('task:');
    const currentEmployee = await kv.get(`employee:${user.id}`);

    // Managers/Admins see all tasks, employees see only their tasks
    if (currentEmployee?.role === 'admin' || currentEmployee?.role === 'manager') {
      return c.json({ tasks: allTasks });
    } else {
      const userTasks = allTasks.filter((task: any) => task.assignedTo === user.id);
      return c.json({ tasks: userTasks });
    }
  } catch (error) {
    console.log('Get tasks error:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// Submit task work
app.put('/make-server-937488f4/tasks/:id/submit', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const taskId = c.req.param('id');
    const { notes, files } = await c.req.json();

    const taskData = await kv.get(taskId);
    if (!taskData) {
      return c.json({ error: 'Task not found' }, 404);
    }

    if (taskData.assignedTo !== user.id) {
      return c.json({ error: 'Forbidden: You are not assigned to this task' }, 403);
    }

    const updatedTask = {
      ...taskData,
      status: 'submitted',
      submittedWork: { notes, files: files || [] },
      submittedAt: new Date().toISOString()
    };

    await kv.set(taskId, updatedTask);

    return c.json({ message: 'Task submitted', task: updatedTask });
  } catch (error) {
    console.log('Submit task error:', error);
    return c.json({ error: 'Failed to submit task' }, 500);
  }
});

// Review task
app.put('/make-server-937488f4/tasks/:id/review', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin' && currentEmployee?.role !== 'manager') {
      return c.json({ error: 'Forbidden: Manager or Admin access required' }, 403);
    }

    const taskId = c.req.param('id');
    const { reviewStatus, comment } = await c.req.json(); // approved, rejected

    const taskData = await kv.get(taskId);
    if (!taskData) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const updatedTask = {
      ...taskData,
      status: reviewStatus === 'approved' ? 'completed' : 'rejected',
      reviewStatus,
      reviewComment: comment,
      reviewedBy: user.id,
      reviewedAt: new Date().toISOString()
    };

    await kv.set(taskId, updatedTask);

    return c.json({ message: 'Task reviewed', task: updatedTask });
  } catch (error) {
    console.log('Review task error:', error);
    return c.json({ error: 'Failed to review task' }, 500);
  }
});

// =====================
// INTERVIEW SCHEDULING ROUTES
// =====================

// Schedule interview
app.post('/make-server-937488f4/interviews', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin' && currentEmployee?.role !== 'manager') {
      return c.json({ error: 'Forbidden: Manager or Admin access required' }, 403);
    }

    const {
      candidateId,
      date,
      time,
      duration,
      mode, // online, onsite, phone
      interviewers,
      notes
    } = await c.req.json();

    const interviewId = `interview:${Date.now()}`;

    const interviewData = {
      id: interviewId,
      candidateId,
      date,
      time,
      duration,
      mode,
      interviewers: interviewers || [],
      notes: notes || '',
      evaluation: null,
      score: null,
      feedback: null,
      status: 'scheduled',
      scheduledBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(interviewId, interviewData);

    // Update candidate with interview reference
    const candidateData = await kv.get(candidateId);
    if (candidateData) {
      const updatedCandidate = {
        ...candidateData,
        interviews: [...(candidateData.interviews || []), interviewId]
      };
      await kv.set(candidateId, updatedCandidate);
    }

    return c.json({ message: 'Interview scheduled', interview: interviewData });
  } catch (error) {
    console.log('Schedule interview error:', error);
    return c.json({ error: 'Failed to schedule interview' }, 500);
  }
});

// Get interviews
app.get('/make-server-937488f4/interviews', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const interviews = await kv.getByPrefix('interview:');
    return c.json({ interviews });
  } catch (error) {
    console.log('Get interviews error:', error);
    return c.json({ error: 'Failed to fetch interviews' }, 500);
  }
});

// Update interview evaluation
app.put('/make-server-937488f4/interviews/:id/evaluate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const interviewId = c.req.param('id');
    const { evaluation, score, feedback, status } = await c.req.json();

    const interviewData = await kv.get(interviewId);
    if (!interviewData) {
      return c.json({ error: 'Interview not found' }, 404);
    }

    const updatedInterview = {
      ...interviewData,
      evaluation,
      score,
      feedback,
      status: status || 'completed',
      evaluatedBy: user.id,
      evaluatedAt: new Date().toISOString()
    };

    await kv.set(interviewId, updatedInterview);

    return c.json({ message: 'Interview evaluated', interview: updatedInterview });
  } catch (error) {
    console.log('Evaluate interview error:', error);
    return c.json({ error: 'Failed to evaluate interview' }, 500);
  }
});

// =====================
// HIRE CANDIDATE (Convert to Employee)
// =====================

app.post('/make-server-937488f4/candidates/:id/hire', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const candidateId = c.req.param('id');
    const {
      joiningDate,
      department,
      jobTitle,
      managerId,
      monthlySalary,
      shiftType,
      shiftStartTime,
      shiftEndTime,
      breakDuration,
      weeklyWorkingDays,
      password
    } = await c.req.json();

    const candidateData = await kv.get(candidateId);
    if (!candidateData) {
      return c.json({ error: 'Candidate not found' }, 404);
    }

    // Create auth user for new employee
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: candidateData.email,
      password: password || `temp${Date.now()}`,
      user_metadata: { name: candidateData.name, role: 'employee' },
      email_confirm: true
    });

    if (authError) {
      console.log('Auth creation error during hiring:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create employee profile
    const employeeData = {
      id: authData.user.id,
      email: candidateData.email,
      name: candidateData.name,
      role: 'employee',
      department,
      jobTitle,
      phoneNumber: candidateData.phone,
      hireDate: joiningDate,
      status: 'active',
      lifecycleStatus: 'active',
      managerId,
      monthlySalary,
      shiftType: shiftType || 'morning',
      shiftStartTime: shiftStartTime || '09:00',
      shiftEndTime: shiftEndTime || '17:00',
      breakDuration: breakDuration || 60,
      weeklyWorkingDays: weeklyWorkingDays || 'mon-fri',
      shiftFlexibility: 'fixed',
      fromCandidate: candidateId,
      createdAt: new Date().toISOString()
    };

    await kv.set(`employee:${authData.user.id}`, employeeData);
    await kv.set(`user:email:${candidateData.email}`, authData.user.id);

    // Update candidate status
    const updatedCandidate = {
      ...candidateData,
      stage: 'hired',
      hiredAt: new Date().toISOString(),
      employeeId: authData.user.id
    };
    await kv.set(candidateId, updatedCandidate);

    return c.json({ 
      message: 'Candidate hired successfully',
      employee: employeeData
    });
  } catch (error) {
    console.log('Hire candidate error:', error);
    return c.json({ error: 'Failed to hire candidate' }, 500);
  }
});

// =====================
// PAYROLL ROUTES
// =====================

// Create/Update manual overtime
app.post('/make-server-937488f4/payroll/overtime', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { employeeId, month, year, overtimeHours, notes } = await c.req.json();
    const overtimeId = `overtime:${employeeId}:${year}-${month}`;

    const overtimeData = {
      id: overtimeId,
      employeeId,
      month,
      year,
      overtimeHours,
      notes: notes || '',
      enteredBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(overtimeId, overtimeData);

    return c.json({ message: 'Overtime recorded', overtime: overtimeData });
  } catch (error) {
    console.log('Record overtime error:', error);
    return c.json({ error: 'Failed to record overtime' }, 500);
  }
});

// Generate payroll
app.post('/make-server-937488f4/payroll/generate', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { employeeId, month, year } = await c.req.json();
    const payrollId = `payroll:${employeeId}:${year}-${month}`;

    const employeeData = await kv.get(`employee:${employeeId}`);
    if (!employeeData) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    // Get overtime for the month
    const overtimeData = await kv.get(`overtime:${employeeId}:${year}-${month}`);
    const overtimeHours = overtimeData?.overtimeHours || 0;

    // Get attendance for the month
    const allAttendance = await kv.getByPrefix('attendance:');
    const monthAttendance = allAttendance.filter((a: any) => {
      const aDate = new Date(a.date);
      return a.employeeId === employeeId && 
             aDate.getMonth() + 1 === parseInt(month) && 
             aDate.getFullYear() === parseInt(year);
    });

    // Calculate deductions
    let lateDeduction = 0;
    let earlyCheckoutDeduction = 0;
    monthAttendance.forEach((a: any) => {
      lateDeduction += (a.lateMinutes || 0);
      earlyCheckoutDeduction += (a.earlyCheckoutMinutes || 0);
    });

    const baseSalary = employeeData.monthlySalary || 0;
    const hourlyRate = baseSalary / 160; // Assuming 160 working hours per month
    const overtimePay = overtimeHours * hourlyRate * 1.5; // 1.5x for overtime
    const lateDeductionAmount = (lateDeduction / 60) * hourlyRate;
    const earlyDeductionAmount = (earlyCheckoutDeduction / 60) * hourlyRate;

    const payrollData = {
      id: payrollId,
      employeeId,
      month,
      year,
      baseSalary,
      overtimeHours,
      overtimePay,
      lateMinutes: lateDeduction,
      lateDeduction: lateDeductionAmount,
      earlyCheckoutMinutes: earlyCheckoutDeduction,
      earlyCheckoutDeduction: earlyDeductionAmount,
      totalSalary: baseSalary + overtimePay - lateDeductionAmount - earlyDeductionAmount,
      status: 'draft',
      generatedBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(payrollId, payrollData);

    return c.json({ message: 'Payroll generated', payroll: payrollData });
  } catch (error) {
    console.log('Generate payroll error:', error);
    return c.json({ error: 'Failed to generate payroll' }, 500);
  }
});

// Get payrolls
app.get('/make-server-937488f4/payroll', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allPayrolls = await kv.getByPrefix('payroll:');
    const currentEmployee = await kv.get(`employee:${user.id}`);

    if (currentEmployee?.role === 'admin') {
      return c.json({ payrolls: allPayrolls });
    } else {
      const userPayrolls = allPayrolls.filter((p: any) => p.employeeId === user.id);
      return c.json({ payrolls: userPayrolls });
    }
  } catch (error) {
    console.log('Get payrolls error:', error);
    return c.json({ error: 'Failed to fetch payrolls' }, 500);
  }
});

// Update payroll status
app.put('/make-server-937488f4/payroll/:id/status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const payrollId = c.req.param('id');
    const { status } = await c.req.json(); // draft, approved, paid

    const payrollData = await kv.get(payrollId);
    if (!payrollData) {
      return c.json({ error: 'Payroll not found' }, 404);
    }

    const updatedPayroll = {
      ...payrollData,
      status,
      updatedBy: user.id,
      updatedAt: new Date().toISOString()
    };

    await kv.set(payrollId, updatedPayroll);

    return c.json({ message: 'Payroll status updated', payroll: updatedPayroll });
  } catch (error) {
    console.log('Update payroll error:', error);
    return c.json({ error: 'Failed to update payroll' }, 500);
  }
});

// =====================
// EMPLOYEE LIFECYCLE MANAGEMENT
// =====================

// Update employee lifecycle status
app.put('/make-server-937488f4/employees/:id/lifecycle', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const employeeId = c.req.param('id');
    const { lifecycleStatus, reason } = await c.req.json(); 
    // active, suspended, resigned, terminated, rehired

    const employeeData = await kv.get(`employee:${employeeId}`);
    if (!employeeData) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    const updatedEmployee = {
      ...employeeData,
      lifecycleStatus,
      lifecycleReason: reason,
      lifecycleChangedAt: new Date().toISOString(),
      lifecycleChangedBy: user.id
    };

    await kv.set(`employee:${employeeId}`, updatedEmployee);

    return c.json({ message: 'Lifecycle status updated', employee: updatedEmployee });
  } catch (error) {
    console.log('Update lifecycle error:', error);
    return c.json({ error: 'Failed to update lifecycle status' }, 500);
  }
});

// Upload document
app.post('/make-server-937488f4/documents', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { 
      employeeId, 
      candidateId,
      documentType, 
      documentName, 
      documentUrl,
      notes 
    } = await c.req.json();

    const docId = `document:${Date.now()}`;

    const documentData = {
      id: docId,
      employeeId: employeeId || null,
      candidateId: candidateId || null,
      documentType,
      documentName,
      documentUrl,
      notes: notes || '',
      uploadedBy: user.id,
      createdAt: new Date().toISOString()
    };

    await kv.set(docId, documentData);

    return c.json({ message: 'Document uploaded', document: documentData });
  } catch (error) {
    console.log('Upload document error:', error);
    return c.json({ error: 'Failed to upload document' }, 500);
  }
});

// Get documents
app.get('/make-server-937488f4/documents/:entityId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const entityId = c.req.param('entityId');
    const allDocs = await kv.getByPrefix('document:');
    
    const docs = allDocs.filter(
      (doc: any) => doc.employeeId === entityId || doc.candidateId === entityId
    );

    return c.json({ documents: docs });
  } catch (error) {
    console.log('Get documents error:', error);
    return c.json({ error: 'Failed to fetch documents' }, 500);
  }
});

// Delete job - ADMIN ONLY
app.delete('/make-server-937488f4/jobs/:jobId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const jobId = c.req.param('jobId');
    const job = await kv.get(jobId);
    
    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    await kv.del(jobId);

    return c.json({ message: 'Job deleted successfully' });
  } catch (error) {
    console.log('Delete job error:', error);
    return c.json({ error: 'Failed to delete job' }, 500);
  }
});

// Convert candidate to employee - ADMIN ONLY
app.post('/make-server-937488f4/candidates/:candidateId/convert', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const candidateId = c.req.param('candidateId');
    const candidate = await kv.get(candidateId);
    
    if (!candidate) {
      return c.json({ error: 'Candidate not found' }, 404);
    }

    const {
      department,
      jobTitle,
      joiningDate,
      monthlySalary,
      shiftType = 'morning',
      shiftStartTime = '09:00',
      shiftEndTime = '17:00',
      managerId = null,
      password
    } = await c.req.json();

    if (!department || !jobTitle || !password) {
      return c.json({ error: 'Missing required fields: department, jobTitle, password' }, 400);
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: candidate.email,
      password,
      user_metadata: { name: candidate.name, role: 'employee' },
      email_confirm: true
    });

    if (authError) {
      console.log('Auth creation error during candidate conversion:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Create employee profile
    const employeeData = {
      id: authData.user.id,
      email: candidate.email,
      name: candidate.name,
      role: 'employee',
      department,
      jobTitle,
      phoneNumber: candidate.phone || null,
      dateOfBirth: null,
      hireDate: joiningDate || new Date().toISOString(),
      status: 'active',
      lifecycleStatus: 'active',
      profileImage: null,
      address: null,
      emergencyContact: null,
      managerId,
      shiftType,
      shiftStartTime,
      shiftEndTime,
      breakDuration: 60,
      weeklyWorkingDays: 'mon-fri',
      shiftFlexibility: 'fixed',
      monthlySalary: monthlySalary || 0,
      createdAt: new Date().toISOString(),
      convertedFrom: candidateId,
      candidateData: {
        jobId: candidate.jobId,
        appliedAt: candidate.appliedAt,
        linkedIn: candidate.linkedIn
      }
    };

    await kv.set(`employee:${authData.user.id}`, employeeData);

    // Update candidate status to 'hired'
    const updatedCandidate = {
      ...candidate,
      stage: 'hired',
      convertedToEmployeeId: authData.user.id,
      convertedAt: new Date().toISOString(),
      convertedBy: user.id
    };
    await kv.set(candidateId, updatedCandidate);

    return c.json({ 
      message: 'Candidate converted to employee successfully', 
      employee: employeeData 
    });
  } catch (error) {
    console.log('Convert candidate error:', error);
    return c.json({ error: 'Failed to convert candidate' }, 500);
  }
});

// =====================
// COMPANY POLICIES ROUTES - ADMIN ONLY
// =====================

// Create policy
app.post('/make-server-937488f4/policies', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { title, category, content, effectiveDate, status } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: 'Missing required fields: title, content' }, 400);
    }

    const policyId = `policy:${Date.now()}`;

    const policyData = {
      id: policyId,
      title,
      category: category || 'general',
      content,
      effectiveDate: effectiveDate || new Date().toISOString(),
      status: status || 'active',
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1
    };

    await kv.set(policyId, policyData);

    return c.json({ message: 'Policy created successfully', policy: policyData });
  } catch (error) {
    console.log('Create policy error:', error);
    return c.json({ error: 'Failed to create policy' }, 500);
  }
});

// Get all policies
app.get('/make-server-937488f4/policies', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const policies = await kv.getByPrefix('policy:');
    
    // Sort by creation date, newest first
    const sortedPolicies = policies.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ policies: sortedPolicies });
  } catch (error) {
    console.log('Get policies error:', error);
    return c.json({ error: 'Failed to fetch policies' }, 500);
  }
});

// Update policy - ADMIN ONLY
app.put('/make-server-937488f4/policies/:policyId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const policyId = c.req.param('policyId');
    const policy = await kv.get(policyId);
    
    if (!policy) {
      return c.json({ error: 'Policy not found' }, 404);
    }

    const { title, category, content, effectiveDate, status } = await c.req.json();

    const updatedPolicy = {
      ...policy,
      title: title || policy.title,
      category: category || policy.category,
      content: content || policy.content,
      effectiveDate: effectiveDate || policy.effectiveDate,
      status: status || policy.status,
      updatedBy: user.id,
      updatedAt: new Date().toISOString(),
      version: (policy.version || 1) + 1
    };

    await kv.set(policyId, updatedPolicy);

    return c.json({ message: 'Policy updated successfully', policy: updatedPolicy });
  } catch (error) {
    console.log('Update policy error:', error);
    return c.json({ error: 'Failed to update policy' }, 500);
  }
});

// Delete policy - ADMIN ONLY
app.delete('/make-server-937488f4/policies/:policyId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const policyId = c.req.param('policyId');
    const policy = await kv.get(policyId);
    
    if (!policy) {
      return c.json({ error: 'Policy not found' }, 404);
    }

    await kv.del(policyId);

    return c.json({ message: 'Policy deleted successfully' });
  } catch (error) {
    console.log('Delete policy error:', error);
    return c.json({ error: 'Failed to delete policy' }, 500);
  }
});

// Update department - ADMIN ONLY
app.put('/make-server-937488f4/departments/:deptId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const deptId = c.req.param('deptId');
    const dept = await kv.get(deptId);
    
    if (!dept) {
      return c.json({ error: 'Department not found' }, 404);
    }

    const { name, description, headId } = await c.req.json();

    const updatedDept = {
      ...dept,
      name: name || dept.name,
      description: description || dept.description,
      headId: headId !== undefined ? headId : dept.headId,
      updatedAt: new Date().toISOString()
    };

    await kv.set(deptId, updatedDept);

    return c.json({ message: 'Department updated successfully', department: updatedDept });
  } catch (error) {
    console.log('Update department error:', error);
    return c.json({ error: 'Failed to update department' }, 500);
  }
});

// Delete department - ADMIN ONLY
app.delete('/make-server-937488f4/departments/:deptId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const deptId = c.req.param('deptId');
    const dept = await kv.get(deptId);
    
    if (!dept) {
      return c.json({ error: 'Department not found' }, 404);
    }

    // Check if any employees are assigned to this department
    const employees = await kv.getByPrefix('employee:');
    const deptEmployees = employees.filter((emp: any) => emp.department === dept.name);
    
    if (deptEmployees.length > 0) {
      return c.json({ 
        error: `Cannot delete department. ${deptEmployees.length} employee(s) are assigned to this department.` 
      }, 400);
    }

    await kv.del(deptId);

    return c.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.log('Delete department error:', error);
    return c.json({ error: 'Failed to delete department' }, 500);
  }
});

// =====================
// ACTIVITY LOG ROUTES
// =====================

// Get activity logs (filtered by role and department)
app.get('/make-server-937488f4/activities', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    
    // Employees cannot see activity logs
    if (currentEmployee?.role === 'employee') {
      return c.json({ activities: [] });
    }

    let activities;
    
    // Admin can see all activities
    if (currentEmployee?.role === 'admin') {
      activities = await helpers.getAllActivities();
    } 
    // Managers can only see activities in their department
    else if (currentEmployee?.role === 'manager') {
      activities = await helpers.getActivitiesForDepartment(currentEmployee.department);
    } else {
      activities = [];
    }

    return c.json({ activities });
  } catch (error) {
    console.log('Get activities error:', error);
    return c.json({ error: 'Failed to fetch activities' }, 500);
  }
});

// =====================
// BIRTHDAY & WISHES ROUTES
// =====================

// Get birthdays (filtered by role and department)
app.get('/make-server-937488f4/birthdays', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const allEmployees = await kv.getByPrefix('employee:');
    
    let birthdayEmployees = allEmployees.filter((emp: any) => {
      const isBirthday = helpers.isBirthdayThisMonth(emp.dateOfBirth);
      
      // Employees can only see birthdays in their department
      if (currentEmployee?.role === 'employee') {
        return isBirthday && emp.department === currentEmployee.department;
      }
      
      // Managers and Admins can see all birthdays
      return isBirthday;
    });

    // Sort by date
    birthdayEmployees = birthdayEmployees.map((emp: any) => ({
      ...emp,
      isToday: helpers.isBirthdayToday(emp.dateOfBirth)
    }));

    return c.json({ birthdays: birthdayEmployees });
  } catch (error) {
    console.log('Get birthdays error:', error);
    return c.json({ error: 'Failed to fetch birthdays' }, 500);
  }
});

// Send birthday wish
app.post('/make-server-937488f4/birthdays/wish', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const { employeeId, message } = await c.req.json();
    
    const targetEmployee = await kv.get(`employee:${employeeId}`);
    
    if (!targetEmployee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    // Employees can only wish employees in same department
    if (currentEmployee?.role === 'employee' && targetEmployee.department !== currentEmployee.department) {
      return c.json({ error: 'You can only wish employees in your department' }, 403);
    }

    const wishId = `wish:${employeeId}:${Date.now()}`;
    const wishData = {
      id: wishId,
      fromId: user.id,
      fromName: currentEmployee.name,
      toId: employeeId,
      toName: targetEmployee.name,
      message,
      timestamp: new Date().toISOString()
    };

    await kv.set(wishId, wishData);

    // Log activity
    await helpers.logActivity({
      action: 'birthday_wish',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: employeeId,
      targetName: targetEmployee.name,
      department: targetEmployee.department,
      details: { message }
    });

    return c.json({ message: 'Birthday wish sent', wish: wishData });
  } catch (error) {
    console.log('Send birthday wish error:', error);
    return c.json({ error: 'Failed to send wish' }, 500);
  }
});

// Get birthday wishes for an employee
app.get('/make-server-937488f4/birthdays/wishes/:employeeId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const employeeId = c.req.param('employeeId');
    const allWishes = await kv.getByPrefix(`wish:${employeeId}:`);

    return c.json({ wishes: allWishes });
  } catch (error) {
    console.log('Get wishes error:', error);
    return c.json({ error: 'Failed to fetch wishes' }, 500);
  }
});

// =====================
// DASHBOARD ANALYTICS ROUTES
// =====================

// Get early birds and late comers
app.get('/make-server-937488f4/dashboard/attendance-analytics', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    
    // Only Admin and Managers can access this
    if (currentEmployee?.role === 'employee') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const today = new Date().toISOString().split('T')[0];
    const allAttendance = await kv.getByPrefix('attendance:');
    const todayAttendance = allAttendance.filter((att: any) => att.date === today && att.checkIn);

    const employees = await kv.getByPrefix('employee:');
    const employeeMap = new Map(employees.map((emp: any) => [emp.id, emp]));

    const earlyBirds = [];
    const lateComers = [];

    for (const attendance of todayAttendance) {
      const employee = employeeMap.get(attendance.employeeId);
      if (!employee) continue;

      // Managers can only see their department
      if (currentEmployee?.role === 'manager' && employee.department !== currentEmployee.department) {
        continue;
      }

      const checkInTime = new Date(attendance.checkIn).toISOString();
      const shiftTimes = helpers.getShiftTimesForDay(employee, new Date());
      
      if (shiftTimes) {
        const isLate = helpers.isLateArrival(checkInTime, shiftTimes.start);
        
        if (isLate) {
          lateComers.push({
            ...attendance,
            employeeName: employee.name,
            employeeDepartment: employee.department,
            expectedTime: shiftTimes.start,
            actualTime: checkInTime.substring(11, 19)
          });
        } else {
          // Early if checked in more than 15 mins before shift
          const checkIn = new Date(`2000-01-01T${checkInTime.substring(11, 19)}`);
          const expectedStart = new Date(`2000-01-01T${shiftTimes.start}`);
          const diffMinutes = (expectedStart.getTime() - checkIn.getTime()) / (1000 * 60);
          
          if (diffMinutes > 15) {
            earlyBirds.push({
              ...attendance,
              employeeName: employee.name,
              employeeDepartment: employee.department,
              expectedTime: shiftTimes.start,
              actualTime: checkInTime.substring(11, 19)
            });
          }
        }
      }
    }

    return c.json({ earlyBirds, lateComers });
  } catch (error) {
    console.log('Get attendance analytics error:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

// =====================
// FINAL SETTLEMENT ROUTES
// =====================

// Generate final settlement (on resignation/termination)
app.post('/make-server-937488f4/employees/:id/final-settlement', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const employeeId = c.req.param('id');
    const targetEmployee = await kv.get(`employee:${employeeId}`);

    if (!targetEmployee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    // Only Manager of same department or Admin can generate final settlement
    if (currentEmployee?.role === 'manager' && targetEmployee.department !== currentEmployee.department) {
      return c.json({ error: 'You can only process settlement for your department' }, 403);
    }

    if (currentEmployee?.role !== 'admin' && currentEmployee?.role !== 'manager') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Calculate final settlement
    const settlement = await helpers.calculateFinalSettlement(employeeId);
    
    const settlementId = `settlement:${employeeId}:${Date.now()}`;
    const settlementData = {
      id: settlementId,
      employeeId,
      employeeName: targetEmployee.name,
      department: targetEmployee.department,
      resignationDate: new Date().toISOString(),
      ...settlement,
      status: 'pending',
      generatedBy: user.id,
      generatedAt: new Date().toISOString(),
      paidAt: null
    };

    await kv.set(settlementId, settlementData);

    // Log activity
    await helpers.logActivity({
      action: 'final_settlement_generated',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: employeeId,
      targetName: targetEmployee.name,
      department: targetEmployee.department,
      details: { settlementAmount: settlement.netSettlement }
    });

    return c.json({ message: 'Final settlement generated', settlement: settlementData });
  } catch (error) {
    console.log('Generate final settlement error:', error);
    return c.json({ error: 'Failed to generate final settlement' }, 500);
  }
});

// Get final settlements
app.get('/make-server-937488f4/settlements', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const allSettlements = await kv.getByPrefix('settlement:');

    let settlements = allSettlements;

    // Filter by department for managers
    if (currentEmployee?.role === 'manager') {
      settlements = allSettlements.filter((s: any) => s.department === currentEmployee.department);
    }

    return c.json({ settlements });
  } catch (error) {
    console.log('Get settlements error:', error);
    return c.json({ error: 'Failed to fetch settlements' }, 500);
  }
});

// =====================
// PAYMENTS MODULE ROUTES
// =====================

// Create payment (Admin and authorized managers only)
app.post('/make-server-937488f4/payments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    
    // Check permission
    const hasPaymentPermission = await helpers.hasPermission(user.id, 'make_payments');
    
    if (currentEmployee?.role !== 'admin' && !hasPaymentPermission) {
      return c.json({ error: 'Forbidden: Payment permission required' }, 403);
    }

    const { employeeId, type, amount, description, month } = await c.req.json();
    
    const targetEmployee = await kv.get(`employee:${employeeId}`);
    if (!targetEmployee) {
      return c.json({ error: 'Employee not found' }, 404);
    }

    const paymentId = `payment:${employeeId}:${Date.now()}`;
    const paymentData = {
      id: paymentId,
      employeeId,
      employeeName: targetEmployee.name,
      department: targetEmployee.department,
      type, // full_salary, half_salary, advance, custom, final_settlement
      amount,
      description,
      month: month || new Date().toISOString().substring(0, 7),
      paidBy: user.id,
      paidAt: new Date().toISOString(),
      deducted: false
    };

    await kv.set(paymentId, paymentData);

    // Update settlement status if this is a final settlement payment
    if (type === 'final_settlement') {
      const settlements = await kv.getByPrefix(`settlement:${employeeId}:`);
      const pendingSettlement = settlements.find((s: any) => s.status === 'pending');
      
      if (pendingSettlement) {
        await kv.set(pendingSettlement.id, {
          ...pendingSettlement,
          status: 'paid',
          paidAt: new Date().toISOString()
        });
      }
    }

    // Log activity
    await helpers.logActivity({
      action: 'payment_made',
      actorId: user.id,
      actorName: currentEmployee.name,
      actorRole: currentEmployee.role,
      targetId: employeeId,
      targetName: targetEmployee.name,
      department: targetEmployee.department,
      details: { type, amount, description }
    });

    return c.json({ message: 'Payment recorded', payment: paymentData });
  } catch (error) {
    console.log('Create payment error:', error);
    return c.json({ error: 'Failed to create payment' }, 500);
  }
});

// Get payments
app.get('/make-server-937488f4/payments', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    const employeeId = c.req.query('employeeId');

    let payments;
    
    if (employeeId) {
      payments = await kv.getByPrefix(`payment:${employeeId}:`);
    } else {
      payments = await kv.getByPrefix('payment:');
      
      // Filter by department for managers
      if (currentEmployee?.role === 'manager') {
        payments = payments.filter((p: any) => p.department === currentEmployee.department);
      }
    }

    return c.json({ payments });
  } catch (error) {
    console.log('Get payments error:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

// =====================
// ROLES & PERMISSIONS ROUTES
// =====================

// Set user permissions (Admin only)
app.post('/make-server-937488f4/permissions', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const currentEmployee = await kv.get(`employee:${user.id}`);
    if (currentEmployee?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Admin access required' }, 403);
    }

    const { userId, permissions } = await c.req.json();
    
    const permissionsId = `permissions:${userId}`;
    const permissionsData = {
      userId,
      permissions: permissions || [],
      updatedBy: user.id,
      updatedAt: new Date().toISOString()
    };

    await kv.set(permissionsId, permissionsData);

    return c.json({ message: 'Permissions updated', permissions: permissionsData });
  } catch (error) {
    console.log('Set permissions error:', error);
    return c.json({ error: 'Failed to set permissions' }, 500);
  }
});

// Get user permissions
app.get('/make-server-937488f4/permissions/:userId', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];\
    const { data: { user } } = await supabase.auth.getUser(accessToken);

    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const userId = c.req.param('userId');
    const permissions = await kv.get(`permissions:${userId}`);

    return c.json({ permissions: permissions || { permissions: [] } });
  } catch (error) {
    console.log('Get permissions error:', error);
    return c.json({ error: 'Failed to fetch permissions' }, 500);
  }
});

Deno.serve(app.fetch);