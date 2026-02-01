import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { ArrowLeft } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { Alert, AlertDescription } from './ui/alert';

interface AddEmployeeProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function AddEmployee({ onBack, onSuccess }: AddEmployeeProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [departments, setDepartments] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    jobTitle: '',
    phoneNumber: '',
    dateOfBirth: '',
    joiningDate: new Date().toISOString().split('T')[0],
    managerId: '',
    address: '',
    emergencyContact: '',
    // Shift fields
    shiftType: 'morning',
    shiftStartTime: '09:00',
    shiftEndTime: '17:00',
    breakDuration: '60',
    weeklyWorkingDays: 'mon-fri',
    shiftFlexibility: 'fixed',
    // Salary
    monthlySalary: ''
  });

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch departments
      const deptRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/departments`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartments(deptData.departments);
      }

      // Fetch employees to get potential managers
      const empRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (empRes.ok) {
        const empData = await empRes.json();
        setManagers(empData.employees.filter((e: any) => 
          e.role === 'manager' || e.role === 'admin'
        ));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/auth/register`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            monthlySalary: parseFloat(formData.monthlySalary) || 0,
            breakDuration: parseInt(formData.breakDuration) || 60
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create employee');
      }

      setSuccess('Employee created successfully!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-gray-900">Add New Employee</h1>
        <div className="w-20"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningDate">Joining Date *</Label>
                <Input
                  id="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  placeholder="Name and phone number"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => setFormData({ ...formData, department: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobTitle">Job Title</Label>
                <Input
                  id="jobTitle"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="managerId">Manager</Label>
                <Select
                  value={formData.managerId}
                  onValueChange={(value) => setFormData({ ...formData, managerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlySalary">Monthly Salary *</Label>
                <Input
                  id="monthlySalary"
                  type="number"
                  value={formData.monthlySalary}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shift & Working Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Shift & Working Hours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shiftType">Shift Type *</Label>
                <Select
                  value={formData.shiftType}
                  onValueChange={(value) => setFormData({ ...formData, shiftType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning Shift</SelectItem>
                    <SelectItem value="evening">Evening Shift</SelectItem>
                    <SelectItem value="night">Night Shift</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weeklyWorkingDays">Weekly Working Days *</Label>
                <Select
                  value={formData.weeklyWorkingDays}
                  onValueChange={(value) => setFormData({ ...formData, weeklyWorkingDays: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mon-fri">Monday - Friday</SelectItem>
                    <SelectItem value="mon-sat">Monday - Saturday</SelectItem>
                    <SelectItem value="mon-sun">Monday - Sunday</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftStartTime">Shift Start Time *</Label>
                <Input
                  id="shiftStartTime"
                  type="time"
                  value={formData.shiftStartTime}
                  onChange={(e) => setFormData({ ...formData, shiftStartTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftEndTime">Shift End Time *</Label>
                <Input
                  id="shiftEndTime"
                  type="time"
                  value={formData.shiftEndTime}
                  onChange={(e) => setFormData({ ...formData, shiftEndTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakDuration">Break Duration (minutes) *</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  value={formData.breakDuration}
                  onChange={(e) => setFormData({ ...formData, breakDuration: e.target.value })}
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftFlexibility">Shift Flexibility *</Label>
                <Select
                  value={formData.shiftFlexibility}
                  onValueChange={(value) => setFormData({ ...formData, shiftFlexibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating Employee...' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </div>
  );
}