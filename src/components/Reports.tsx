import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Download, 
  Filter,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  baseSalary: number;
  overtimeHours: number;
  overtimeAmount: number;
  lateDeduction: number;
  earlyCheckoutDeduction: number;
  netSalary: number;
  status: string;
  generatedAt: string;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  checkInLat?: number;
  checkInLng?: number;
  checkOutLat?: number;
  checkOutLng?: number;
  totalHours: number | null;
  status: string;
  location: string;
}

interface LocationTrace {
  id: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  date: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

export function Reports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString());
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [locationTraces, setLocationTraces] = useState<LocationTrace[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<any>(null);
  const [settlements, setSettlements] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch current employee data
      const empResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees/${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (empResponse.ok) {
        const empData = await empResponse.json();
        setCurrentEmployee(empData.employee);
      }

      // Fetch all employees (for admin)
      const employeesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json();
        setEmployees(employeesData.employees || []);
      }

      // Fetch payrolls
      const payrollResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/payroll`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (payrollResponse.ok) {
        const payrollData = await payrollResponse.json();
        setPayrolls(payrollData.payrolls || []);
      }

      // Fetch attendance records
      const attendanceResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/attendance`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        setAttendanceRecords(attendanceData.attendance || []);
      }

      // Fetch settlements
      const settlementsResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/settlements`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (settlementsResponse.ok) {
        const settlementsData = await settlementsResponse.json();
        setSettlements(settlementsData.settlements || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationTraces = async (empId: string, date: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/attendance/location-trace/${empId}/${date}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLocationTraces(data.traces || []);
      }
    } catch (error) {
      console.error('Failed to fetch location traces:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmployeeName = (empId: string) => {
    const emp = employees.find(e => e.id === empId);
    return emp ? emp.name : 'Unknown Employee';
  };

  const getFilteredPayrolls = () => {
    let filtered = payrolls;

    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(p => p.employeeId === selectedEmployee);
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter(p => p.month === parseInt(selectedMonth));
    }

    if (selectedYear !== 'all') {
      filtered = filtered.filter(p => p.year === parseInt(selectedYear));
    }

    return filtered;
  };

  const getFilteredAttendance = () => {
    let filtered = attendanceRecords;

    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(a => a.employeeId === selectedEmployee);
    }

    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      filtered = filtered.filter(a => {
        const date = new Date(a.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    }

    return filtered;
  };

  const getMonthlyStats = () => {
    const filtered = getFilteredAttendance();
    const totalDays = filtered.length;
    const totalHours = filtered.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const avgHours = totalDays > 0 ? totalHours / totalDays : 0;
    const presentDays = filtered.filter(a => a.status === 'present').length;
    const absentDays = filtered.filter(a => a.status === 'absent').length;

    return {
      totalDays,
      totalHours,
      avgHours,
      presentDays,
      absentDays
    };
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const isAdmin = currentEmployee?.role === 'admin';
  const monthlyStats = getMonthlyStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500">View payroll, attendance, and location tracking reports</p>
      </div>

      {/* Filters */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Month</Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {new Date(2000, i, 1).toLocaleString('en-US', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedEmployee('all');
                    setSelectedMonth(new Date().getMonth().toString());
                    setSelectedYear(new Date().getFullYear().toString());
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="payroll" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payroll">
            <DollarSign className="w-4 h-4 mr-2" />
            Payroll Reports
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <Calendar className="w-4 h-4 mr-2" />
            Attendance Reports
          </TabsTrigger>
          <TabsTrigger value="location">
            <MapPin className="w-4 h-4 mr-2" />
            GPS Tracking
          </TabsTrigger>
          <TabsTrigger value="settlement">
            <FileText className="w-4 h-4 mr-2" />
            Final Settlement
          </TabsTrigger>
        </TabsList>

        {/* Payroll Reports Tab */}
        <TabsContent value="payroll" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Payrolls</p>
                    <p className="text-gray-900 mt-1">{getFilteredPayrolls().length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Paid</p>
                    <p className="text-gray-900 mt-1">
                      {formatCurrency(
                        getFilteredPayrolls()
                          .filter(p => p.status === 'paid')
                          .reduce((sum, p) => sum + p.netSalary, 0)
                      )}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Pending</p>
                    <p className="text-gray-900 mt-1">
                      {formatCurrency(
                        getFilteredPayrolls()
                          .filter(p => p.status === 'approved')
                          .reduce((sum, p) => sum + p.netSalary, 0)
                      )}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Avg. Salary</p>
                    <p className="text-gray-900 mt-1">
                      {formatCurrency(
                        getFilteredPayrolls().length > 0
                          ? getFilteredPayrolls().reduce((sum, p) => sum + p.netSalary, 0) / getFilteredPayrolls().length
                          : 0
                      )}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payroll Records</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(getFilteredPayrolls(), 'payroll_report')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Employee</th>
                      <th className="text-left py-3 px-4">Period</th>
                      <th className="text-right py-3 px-4">Base Salary</th>
                      <th className="text-right py-3 px-4">Overtime</th>
                      <th className="text-right py-3 px-4">Deductions</th>
                      <th className="text-right py-3 px-4">Net Salary</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredPayrolls().map(payroll => (
                      <tr key={payroll.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">{getEmployeeName(payroll.employeeId)}</p>
                            <p className="text-gray-500">{payroll.employeeId.substring(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {new Date(payroll.year, payroll.month - 1).toLocaleString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td className="text-right py-3 px-4">{formatCurrency(payroll.baseSalary)}</td>
                        <td className="text-right py-3 px-4 text-green-600">
                          +{formatCurrency(payroll.overtimeAmount)}
                          <span className="text-gray-500 ml-1">({payroll.overtimeHours}h)</span>
                        </td>
                        <td className="text-right py-3 px-4 text-red-600">
                          -{formatCurrency(payroll.lateDeduction + payroll.earlyCheckoutDeduction)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatCurrency(payroll.netSalary)}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={
                              payroll.status === 'paid' 
                                ? 'default' 
                                : payroll.status === 'approved' 
                                ? 'secondary' 
                                : 'outline'
                            }
                          >
                            {payroll.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredPayrolls().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No payroll records found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Reports Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Days</p>
                    <p className="text-gray-900 mt-1">{monthlyStats.totalDays}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-indigo-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Present</p>
                    <p className="text-gray-900 mt-1">{monthlyStats.presentDays}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Absent</p>
                    <p className="text-gray-900 mt-1">{monthlyStats.absentDays}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Total Hours</p>
                    <p className="text-gray-900 mt-1">{monthlyStats.totalHours.toFixed(1)}h</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Avg. Hours/Day</p>
                    <p className="text-gray-900 mt-1">{monthlyStats.avgHours.toFixed(1)}h</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Attendance Records</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(getFilteredAttendance(), 'attendance_report')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      {isAdmin && <th className="text-left py-3 px-4">Employee</th>}
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Check In</th>
                      <th className="text-left py-3 px-4">Check Out</th>
                      <th className="text-right py-3 px-4">Total Hours</th>
                      <th className="text-left py-3 px-4">Location</th>
                      <th className="text-center py-3 px-4">GPS</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAttendance().map(record => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        {isAdmin && (
                          <td className="py-3 px-4">
                            <p className="text-gray-900">{getEmployeeName(record.employeeId)}</p>
                          </td>
                        )}
                        <td className="py-3 px-4">{formatDate(record.date)}</td>
                        <td className="py-3 px-4">{formatTime(record.checkIn)}</td>
                        <td className="py-3 px-4">
                          {record.checkOut ? formatTime(record.checkOut) : '-'}
                        </td>
                        <td className="text-right py-3 px-4">
                          {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '-'}
                        </td>
                        <td className="py-3 px-4">{record.location}</td>
                        <td className="text-center py-3 px-4">
                          {record.checkInLat && record.checkInLng ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDate(record.date);
                                fetchLocationTraces(record.employeeId, record.date);
                                // Switch to location tab
                                const locationTab = document.querySelector('[value="location"]') as HTMLElement;
                                if (locationTab) locationTab.click();
                              }}
                            >
                              <MapPin className="w-4 h-4 text-indigo-600" />
                            </Button>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={record.status === 'present' ? 'default' : 'destructive'}
                          >
                            {record.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredAttendance().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GPS Tracking Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GPS Location Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isAdmin && (
                  <div className="space-y-2">
                    <Label>Employee</Label>
                    <Select 
                      value={selectedEmployee} 
                      onValueChange={(empId) => {
                        setSelectedEmployee(empId);
                        if (empId !== 'all') {
                          fetchLocationTraces(empId, selectedDate);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map(emp => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Date</Label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      if (selectedEmployee !== 'all') {
                        fetchLocationTraces(selectedEmployee, e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  <Button
                    className="w-full"
                    onClick={() => {
                      if (selectedEmployee !== 'all') {
                        fetchLocationTraces(selectedEmployee, selectedDate);
                      }
                    }}
                    disabled={selectedEmployee === 'all'}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Load Tracking Data
                  </Button>
                </div>
              </div>

              {selectedEmployee === 'all' && (
                <div className="text-center py-8 text-gray-500">
                  Please select an employee to view GPS tracking data
                </div>
              )}

              {/* Check-in/Check-out Locations */}
              {selectedEmployee !== 'all' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getFilteredAttendance()
                    .filter(a => a.employeeId === selectedEmployee && a.date === selectedDate)
                    .map(attendance => (
                      <React.Fragment key={attendance.id}>
                        {attendance.checkInLat && attendance.checkInLng && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                                Check-In Location
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Time:</span>
                                <span className="text-gray-900">{formatTime(attendance.checkIn)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Latitude:</span>
                                <span className="text-gray-900">{attendance.checkInLat.toFixed(6)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Longitude:</span>
                                <span className="text-gray-900">{attendance.checkInLng.toFixed(6)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="text-gray-900">{attendance.location}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => {
                                  window.open(
                                    `https://www.google.com/maps?q=${attendance.checkInLat},${attendance.checkInLng}`,
                                    '_blank'
                                  );
                                }}
                              >
                                View on Google Maps
                              </Button>
                            </CardContent>
                          </Card>
                        )}

                        {attendance.checkOutLat && attendance.checkOutLng && attendance.checkOut && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-red-600" />
                                Check-Out Location
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Time:</span>
                                <span className="text-gray-900">{formatTime(attendance.checkOut)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Latitude:</span>
                                <span className="text-gray-900">{attendance.checkOutLat.toFixed(6)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Longitude:</span>
                                <span className="text-gray-900">{attendance.checkOutLng.toFixed(6)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="text-gray-900">{attendance.location}</span>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => {
                                  window.open(
                                    `https://www.google.com/maps?q=${attendance.checkOutLat},${attendance.checkOutLng}`,
                                    '_blank'
                                  );
                                }}
                              >
                                View on Google Maps
                              </Button>
                            </CardContent>
                          </Card>
                        )}
                      </React.Fragment>
                    ))}
                </div>
              )}

              {/* Location Traces */}
              {locationTraces.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Location Trace History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Timestamp</th>
                            <th className="text-right py-3 px-4">Latitude</th>
                            <th className="text-right py-3 px-4">Longitude</th>
                            <th className="text-center py-3 px-4">Map</th>
                          </tr>
                        </thead>
                        <tbody>
                          {locationTraces.map(trace => (
                            <tr key={trace.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">
                                {new Date(trace.timestamp).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit'
                                })}
                              </td>
                              <td className="text-right py-3 px-4">{trace.latitude.toFixed(6)}</td>
                              <td className="text-right py-3 px-4">{trace.longitude.toFixed(6)}</td>
                              <td className="text-center py-3 px-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    window.open(
                                      `https://www.google.com/maps?q=${trace.latitude},${trace.longitude}`,
                                      '_blank'
                                    );
                                  }}
                                >
                                  <MapPin className="w-4 h-4 text-indigo-600" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Final Settlement Tab */}
        <TabsContent value="settlement" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Final Settlements</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToCSV(settlements, 'final_settlements')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Employee</th>
                      <th className="text-left py-3 px-4">Department</th>
                      <th className="text-left py-3 px-4">Resignation Date</th>
                      <th className="text-right py-3 px-4">Basic Salary</th>
                      <th className="text-right py-3 px-4">Pending Dues</th>
                      <th className="text-right py-3 px-4">Advances</th>
                      <th className="text-right py-3 px-4">Net Settlement</th>
                      <th className="text-center py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {settlements.map(settlement => (
                      <tr key={settlement.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">{settlement.employeeName}</p>
                            <p className="text-gray-500">{settlement.employeeId.substring(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{settlement.department}</td>
                        <td className="py-3 px-4">{formatDate(settlement.resignationDate)}</td>
                        <td className="text-right py-3 px-4">{formatCurrency(settlement.basicSalary || 0)}</td>
                        <td className="text-right py-3 px-4 text-green-600">
                          +{formatCurrency(settlement.pendingDues || 0)}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600">
                          -{formatCurrency(settlement.advances || 0)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={settlement.netSettlement >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(settlement.netSettlement || 0)}
                          </span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={
                              settlement.status === 'paid' 
                                ? 'default' 
                                : settlement.status === 'pending' 
                                ? 'secondary' 
                                : 'outline'
                            }
                          >
                            {settlement.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {settlements.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No final settlements found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}