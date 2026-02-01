import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Building2, Shield, FileText } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface Department {
  id: string;
  name: string;
  description: string;
  headId: string | null;
  createdAt: string;
}

export function Settings() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [deptFormData, setDeptFormData] = useState({
    name: '',
    description: '',
    headId: ''
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

      // Fetch employees
      const empRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData.employees);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/departments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(deptFormData)
        }
      );

      if (response.ok) {
        setDeptDialogOpen(false);
        setDeptFormData({ name: '', description: '', headId: '' });
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to create department:', error);
    }
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your organization settings</p>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900">Departments</h2>
              <p className="text-gray-500">Manage organizational departments</p>
            </div>
            {isAdmin && (
              <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Department</DialogTitle>
                    <DialogDescription>Add a new department to your organization</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateDepartment} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Department Name</Label>
                      <Input
                        value={deptFormData.name}
                        onChange={(e) => setDeptFormData({ ...deptFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={deptFormData.description}
                        onChange={(e) => setDeptFormData({ ...deptFormData, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Department Head (Optional)</Label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={deptFormData.headId}
                        onChange={(e) => setDeptFormData({ ...deptFormData, headId: e.target.value })}
                      >
                        <option value="">Select employee</option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" className="w-full">Create Department</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => {
              const head = employees.find(e => e.id === dept.headId);
              const deptEmployees = employees.filter(e => e.department === dept.name);
              
              return (
                <Card key={dept.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900">{dept.name}</h3>
                        <p className="text-gray-500">{dept.description}</p>
                      </div>
                    </div>
                    
                    {head && (
                      <div className="mb-3">
                        <p className="text-gray-500">Department Head</p>
                        <p className="text-gray-900">{head.name}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-gray-600">{deptEmployees.length} employees</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6 mt-6">
          <div>
            <h2 className="text-gray-900">Roles & Permissions</h2>
            <p className="text-gray-500">Configure user roles and access levels</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Admin',
                description: 'Full system access and control',
                permissions: ['All permissions', 'User management', 'Settings', 'Reports'],
                count: employees.filter(e => e.role === 'admin').length,
                color: 'bg-red-100 text-red-800'
              },
              {
                name: 'Manager',
                description: 'Department and team management',
                permissions: ['Team management', 'Attendance', 'Leave approval', 'Performance reviews'],
                count: employees.filter(e => e.role === 'manager').length,
                color: 'bg-blue-100 text-blue-800'
              },
              {
                name: 'Employee',
                description: 'Standard employee access',
                permissions: ['View profile', 'Mark attendance', 'Apply for leave', 'View reviews'],
                count: employees.filter(e => e.role === 'employee').length,
                color: 'bg-green-100 text-green-800'
              }
            ].map((role) => (
              <Card key={role.name}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-gray-900">{role.name}</h3>
                        <Badge className={role.color}>{role.count}</Badge>
                      </div>
                      <p className="text-gray-500">{role.description}</p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-gray-100">
                    <p className="text-gray-600">Permissions:</p>
                    <ul className="space-y-1">
                      {role.permissions.map((perm, idx) => (
                        <li key={idx} className="text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></span>
                          {perm}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="policies" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-gray-900">Company Policies</h2>
              <p className="text-gray-500">Manage HR policies and documents</p>
            </div>
            {isAdmin && (
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Policy
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {[
              {
                title: 'Leave Policy',
                description: 'Guidelines for annual, sick, and personal leave',
                lastUpdated: '2024-01-15',
                category: 'Leave Management'
              },
              {
                title: 'Code of Conduct',
                description: 'Expected behavior and ethical standards',
                lastUpdated: '2024-01-10',
                category: 'General'
              },
              {
                title: 'Remote Work Policy',
                description: 'Guidelines for remote and hybrid work arrangements',
                lastUpdated: '2024-01-05',
                category: 'Work Arrangements'
              },
              {
                title: 'Performance Review Process',
                description: 'Annual and quarterly review procedures',
                lastUpdated: '2023-12-20',
                category: 'Performance'
              }
            ].map((policy, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-gray-900">{policy.title}</h3>
                          <Badge variant="secondary">{policy.category}</Badge>
                        </div>
                        <p className="text-gray-600">{policy.description}</p>
                        <p className="text-gray-500 mt-2">
                          Last updated: {policy.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div>
            <h2 className="text-gray-900">General Settings</h2>
            <p className="text-gray-500">Configure system-wide settings</p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input defaultValue="ACME Corporation" />
                  </div>
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Input defaultValue="Technology" />
                  </div>
                  <div className="space-y-2">
                    <Label>Company Email</Label>
                    <Input type="email" defaultValue="contact@acme.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Input defaultValue="123 Business St, Suite 100, San Francisco, CA 94105" />
                  </div>
                </div>
                {isAdmin && (
                  <Button>Save Changes</Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Hours Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Standard Work Hours/Day</Label>
                    <Input type="number" defaultValue="8" />
                  </div>
                  <div className="space-y-2">
                    <Label>Work Days/Week</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Start Time</Label>
                    <Input type="time" defaultValue="09:00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Default End Time</Label>
                    <Input type="time" defaultValue="17:00" />
                  </div>
                </div>
                {isAdmin && (
                  <Button>Save Changes</Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leave Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Annual Leave Days</Label>
                    <Input type="number" defaultValue="20" />
                  </div>
                  <div className="space-y-2">
                    <Label>Sick Leave Days</Label>
                    <Input type="number" defaultValue="10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Personal Leave Days</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Carry Forward Days</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                </div>
                {isAdmin && (
                  <Button>Save Changes</Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}