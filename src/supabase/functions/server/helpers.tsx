// Helper functions for HRMS backend
import * as kv from './kv_store.tsx';

// Activity Log Helper
export async function logActivity(params: {
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetId?: string;
  targetName?: string;
  department?: string;
  details?: any;
  metadata?: any;
}) {
  const activityId = `activity:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
  
  const activityData = {
    id: activityId,
    action: params.action,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetId: params.targetId || null,
    targetName: params.targetName || null,
    department: params.department || null,
    details: params.details || {},
    metadata: params.metadata || {},
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  await kv.set(activityId, activityData);
  return activityData;
}

// Check if user has permission for specific action
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  // Get user permissions
  const userPermissions = await kv.get(`permissions:${userId}`);
  
  if (userPermissions && Array.isArray(userPermissions.permissions)) {
    return userPermissions.permissions.includes(permission);
  }
  
  // If no custom permissions, return false (will fall back to role-based)
  return false;
}

// Get custom shifts for an employee
export function parseCustomShift(customShiftData: any) {
  // customShiftData format: { monday: { start: "09:00", end: "17:00" }, ... }
  return customShiftData || null;
}

// Check if employee should work on a given day
export function isWorkingDay(shiftData: any, date: Date): boolean {
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  
  if (shiftData.shiftType === 'custom' && shiftData.customShift) {
    return !!shiftData.customShift[dayName];
  }
  
  // For standard shifts, check weeklyWorkingDays
  const workingDays = shiftData.weeklyWorkingDays || 'mon-fri';
  
  if (workingDays === 'mon-fri') {
    return date.getDay() >= 1 && date.getDay() <= 5;
  } else if (workingDays === 'mon-sat') {
    return date.getDay() >= 1 && date.getDay() <= 6;
  } else if (workingDays === 'all') {
    return true;
  }
  
  return false;
}

// Get expected shift times for a specific day
export function getShiftTimesForDay(shiftData: any, date: Date): { start: string; end: string } | null {
  const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
  
  if (shiftData.shiftType === 'custom' && shiftData.customShift && shiftData.customShift[dayName]) {
    return {
      start: shiftData.customShift[dayName].start,
      end: shiftData.customShift[dayName].end
    };
  }
  
  // For standard shifts
  return {
    start: shiftData.shiftStartTime || '09:00',
    end: shiftData.shiftEndTime || '17:00'
  };
}

// Calculate if attendance is late
export function isLateArrival(checkInTime: string, expectedStartTime: string, gracePeriod: number = 15): boolean {
  const checkIn = new Date(`2000-01-01T${checkInTime.substring(11, 19)}`);
  const expectedStart = new Date(`2000-01-01T${expectedStartTime}`);
  
  const diffMinutes = (checkIn.getTime() - expectedStart.getTime()) / (1000 * 60);
  
  return diffMinutes > gracePeriod;
}

// Calculate if attendance is early departure
export function isEarlyDeparture(checkOutTime: string, expectedEndTime: string, gracePeriod: number = 15): boolean {
  const checkOut = new Date(`2000-01-01T${checkOutTime.substring(11, 19)}`);
  const expectedEnd = new Date(`2000-01-01T${expectedEndTime}`);
  
  const diffMinutes = (expectedEnd.getTime() - checkOut.getTime()) / (1000 * 60);
  
  return diffMinutes > gracePeriod;
}

// Filter activities by department (for managers)
export async function getActivitiesForDepartment(department: string): Promise<any[]> {
  const allActivities = await kv.getByPrefix('activity:');
  return allActivities.filter((activity: any) => activity.department === department);
}

// Filter activities for admin (all activities)
export async function getAllActivities(): Promise<any[]> {
  const allActivities = await kv.getByPrefix('activity:');
  return allActivities.sort((a: any, b: any) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// Check if today is employee's birthday
export function isBirthdayToday(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  
  const today = new Date();
  const dob = new Date(dateOfBirth);
  
  return today.getMonth() === dob.getMonth() && today.getDate() === dob.getDate();
}

// Check if employee birthday is this month
export function isBirthdayThisMonth(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  
  const today = new Date();
  const dob = new Date(dateOfBirth);
  
  return today.getMonth() === dob.getMonth();
}

// Generate random password for new employees
export function generateRandomPassword(length: number = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Check if leave dates are valid (no backdating)
export function isValidLeaveDate(startDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const leaveStart = new Date(startDate);
  leaveStart.setHours(0, 0, 0, 0);
  
  return leaveStart >= today;
}

// Calculate final settlement amount
export async function calculateFinalSettlement(employeeId: string): Promise<{
  basicSalary: number;
  pendingDues: number;
  advances: number;
  deductions: number;
  netSettlement: number;
}> {
  const employee = await kv.get(`employee:${employeeId}`);
  const payments = await kv.getByPrefix(`payment:${employeeId}:`);
  
  const basicSalary = employee?.monthlySalary || 0;
  
  // Calculate pending dues (unpaid salary, overtime, etc.)
  const payrolls = await kv.getByPrefix(`payroll:${employeeId}:`);
  const unpaidPayrolls = payrolls.filter((p: any) => p.status !== 'paid');
  const pendingDues = unpaidPayrolls.reduce((sum: number, p: any) => sum + (p.netPay || 0), 0);
  
  // Calculate advances given
  const advances = payments
    .filter((p: any) => p.type === 'advance' && !p.deducted)
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
  
  // Other deductions
  const deductions = 0; // Can be expanded based on requirements
  
  const netSettlement = pendingDues - advances - deductions;
  
  return {
    basicSalary,
    pendingDues,
    advances,
    deductions,
    netSettlement
  };
}
