import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Shield, User } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface UserPermissions {
  userId: string;
  permissions: string[];
}

const AVAILABLE_PERMISSIONS = [
  { id: 'view_reports', label: 'View Reports', description: 'Access to reports module' },
  { id: 'approve_leaves', label: 'Approve Leaves', description: 'Ability to approve/reject leave requests' },
  { id: 'view_gps', label: 'View GPS Data', description: 'Access to employee GPS tracking data' },
  { id: 'edit_employees', label: 'Edit Employees', description: 'Ability to edit employee details' },
  { id: 'make_payments', label: 'Make Payments', description: 'Access to payments module' },
  { id: 'manage_recruitment', label: 'Manage Recruitment', description: 'Access to recruitment and hiring' },
  { id: 'create_policies', label: 'Create Policies', description: 'Create and manage company policies' },
  { id: 'view_all_attendance', label: 'View All Attendance', description: 'View attendance across all departments' },
  { id: 'export_data', label: 'Export Data', description: 'Export reports and data' },
  { id: 'manage_departments', label: 'Manage Departments', description: 'Create and manage departments' },
];

export function RolesPermissions() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [permissions, setPermissions] = useState<Map<string, string[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const isAdmin = user?.employee?.role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied: Admin only');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch employees
      const employeesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (employeesRes.ok) {
        const data = await employeesRes.json();
        const emps = data.employees || [];
        setEmployees(emps);

        // Fetch permissions for each employee
        const permissionsMap = new Map();
        for (const emp of emps) {
          const permRes = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/permissions/${emp.id}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          if (permRes.ok) {
            const permData = await permRes.json();
            permissionsMap.set(emp.id, permData.permissions?.permissions || []);
          }
        }
        setPermissions(permissionsMap);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openPermissionsDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setSelectedPermissions(permissions.get(employee.id) || []);
  };

  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const savePermissions = async () => {
    if (!selectedEmployee) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/permissions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: selectedEmployee.id,
            permissions: selectedPermissions
          })
        }
      );

      if (response.ok) {
        toast.success('Permissions updated successfully');
        setSelectedEmployee(null);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update permissions');
      }
    } catch (error) {
      console.error('Update permissions error:', error);
      toast.error('Failed to update permissions');
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <p className="text-gray-500">Access denied: Admin only</p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    const colors: { [key: string]: string } = {
      'admin': 'bg-red-100 text-red-800',
      'manager': 'bg-blue-100 text-blue-800',
      'employee': 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-500">Manage custom permissions for users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {employees.map(employee => {
              const userPerms = permissions.get(employee.id) || [];
              return (
                <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-gray-900">{employee.name}</p>
                      <p className="text-gray-500">{employee.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getRoleBadge(employee.role)}>
                          {employee.role.charAt(0).toUpperCase() + employee.role.slice(1)}
                        </Badge>
                        <Badge variant="outline">{employee.department}</Badge>
                        {userPerms.length > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {userPerms.length} custom permission{userPerms.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline"
                        onClick={() => openPermissionsDialog(employee)}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        Manage Permissions
                      </Button>
                    </DialogTrigger>
                    {selectedEmployee?.id === employee.id && (
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Manage Permissions for {selectedEmployee.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-blue-900">
                              Default role: <strong>{selectedEmployee.role}</strong>
                            </p>
                            <p className="text-blue-700 mt-1">
                              Custom permissions will override default role behavior
                            </p>
                          </div>

                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {AVAILABLE_PERMISSIONS.map(perm => (
                              <div key={perm.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded hover:bg-gray-50">
                                <Checkbox
                                  checked={selectedPermissions.includes(perm.id)}
                                  onCheckedChange={() => togglePermission(perm.id)}
                                />
                                <div className="flex-1">
                                  <p className="text-gray-900">{perm.label}</p>
                                  <p className="text-gray-500">{perm.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <Button onClick={savePermissions} className="flex-1">
                              Save Permissions
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedEmployee(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    )}
                  </Dialog>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-900 mb-2">Admin</h3>
              <p className="text-gray-600">Full access to all modules and features</p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">Manager</h3>
              <p className="text-gray-600">Can manage employees in their department, view reports for their department, review performance</p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">Employee</h3>
              <p className="text-gray-600">Can mark attendance, apply for leave, view own records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}