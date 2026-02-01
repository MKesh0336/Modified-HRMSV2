import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, Grid, List, Plus, Mail, Phone } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAuth } from './AuthProvider';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  jobTitle: string | null;
  phoneNumber: string | null;
  status: string;
  profileImage: string | null;
}

export function EmployeeDirectory({ onViewProfile, onAddEmployee }: { onViewProfile: (employee: Employee) => void; onAddEmployee: () => void }) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Employee Directory</h1>
          <p className="text-gray-500">{employees.length} total employees</p>
        </div>
        {isAdmin && (
          <Button onClick={onAddEmployee}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEmployees.map((employee) => (
            <Card 
              key={employee.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onViewProfile(employee)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={employee.profileImage || undefined} />
                    <AvatarFallback className="bg-indigo-100 text-indigo-600">
                      {getInitials(employee.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-1">
                    <h3 className="text-gray-900">{employee.name}</h3>
                    <p className="text-gray-500">
                      {employee.jobTitle || 'Employee'}
                    </p>
                    {employee.department && (
                      <Badge variant="secondary">{employee.department}</Badge>
                    )}
                  </div>

                  <div className="w-full space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center text-gray-600 space-x-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    {employee.phoneNumber && (
                      <div className="flex items-center text-gray-600 space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{employee.phoneNumber}</span>
                      </div>
                    )}
                  </div>

                  <Badge 
                    variant={employee.status === 'active' ? 'default' : 'secondary'}
                    className="w-full justify-center"
                  >
                    {employee.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-gray-600">Employee</th>
                    <th className="px-6 py-3 text-left text-gray-600">Job Title</th>
                    <th className="px-6 py-3 text-left text-gray-600">Department</th>
                    <th className="px-6 py-3 text-left text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left text-gray-600">Phone</th>
                    <th className="px-6 py-3 text-left text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEmployees.map((employee) => (
                    <tr 
                      key={employee.id}
                      onClick={() => onViewProfile(employee)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={employee.profileImage || undefined} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-gray-900">{employee.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {employee.jobTitle || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {employee.department ? (
                          <Badge variant="secondary">{employee.department}</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{employee.email}</td>
                      <td className="px-6 py-4 text-gray-600">
                        {employee.phoneNumber || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}