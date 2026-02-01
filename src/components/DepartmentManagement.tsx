import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Plus, Building2, Edit, Trash2, Users } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner@2.0.3';

interface Department {
  id: string;
  name: string;
  description: string;
  headId: string | null;
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  jobTitle: string;
}

export function DepartmentManagement() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headId: ''
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch departments
      const deptResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/departments`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (deptResponse.ok) {
        const deptData = await deptResponse.json();
        setDepartments(deptData.departments);
      }

      // Fetch employees for department head selection
      const empResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (empResponse.ok) {
        const empData = await empResponse.json();
        setEmployees(empData.employees);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) {
      toast.error('Only admins can manage departments');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const url = editingDept
        ? `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/departments/${editingDept.id}`
        : `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/departments`;
      
      const response = await fetch(url, {
        method: editingDept ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          headId: formData.headId || null
        })
      });

      if (response.ok) {
        toast.success(`Department ${editingDept ? 'updated' : 'created'} successfully`);
        setDialogOpen(false);
        setEditingDept(null);
        setFormData({
          name: '',
          description: '',
          headId: ''
        });
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save department');
      }
    } catch (error) {
      console.error('Failed to save department:', error);
      toast.error('Failed to save department');
    }
  };

  const handleEdit = (dept: Department) => {
    if (!isAdmin) {
      toast.error('Only admins can edit departments');
      return;
    }
    
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      description: dept.description,
      headId: dept.headId || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (deptId: string) => {
    if (!isAdmin) {
      toast.error('Only admins can delete departments');
      return;
    }

    if (!confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/departments/${deptId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        toast.success('Department deleted successfully');
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete department');
      }
    } catch (error) {
      console.error('Failed to delete department:', error);
      toast.error('Failed to delete department');
    }
  };

  const getDepartmentEmployeeCount = (deptName: string) => {
    return employees.filter(emp => emp.department === deptName).length;
  };

  const getDepartmentHead = (headId: string | null) => {
    if (!headId) return 'No head assigned';
    const head = employees.find(emp => emp.id === headId);
    return head ? head.name : 'Unknown';
  };

  if (loading) {
    return <div className="p-6">Loading departments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl">Department Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage company departments and organizational structure
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingDept(null);
              setFormData({
                name: '',
                description: '',
                headId: ''
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDept ? 'Edit Department' : 'Create New Department'}</DialogTitle>
                <DialogDescription>
                  {editingDept ? 'Update department details' : 'Add a new department to your organization'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Engineering, HR, Sales"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the department"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="headId">Department Head</Label>
                  <Select value={formData.headId || 'none'} onValueChange={(value) => setFormData({ ...formData, headId: value === 'none' ? '' : value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department head (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No head assigned</SelectItem>
                      {employees
                        .filter(emp => emp.role !== 'employee')
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.jobTitle}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingDept ? 'Update Department' : 'Create Department'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Building2 className="size-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No departments found</p>
              {isAdmin && (
                <p className="text-sm text-muted-foreground mt-2">
                  Click "Add Department" to create your first department
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-5 text-primary" />
                    <CardTitle>{dept.name}</CardTitle>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                        <Trash2 className="size-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {dept.description && (
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <span>{getDepartmentEmployeeCount(dept.name)} employees</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">Department Head</p>
                    <p>{getDepartmentHead(dept.headId)}</p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    Created: {new Date(dept.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}