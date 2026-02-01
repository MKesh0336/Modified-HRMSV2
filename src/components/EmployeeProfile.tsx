import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ArrowLeft, Edit, Save, X, Mail, Phone, MapPin, Calendar, Briefcase } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  jobTitle: string | null;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  hireDate: string | null;
  status: string;
  profileImage: string | null;
  address: string | null;
  emergencyContact: string | null;
}

interface EmployeeProfileProps {
  employee: Employee;
  onBack: () => void;
  onUpdate: () => void;
}

export function EmployeeProfile({ employee, onBack, onUpdate }: EmployeeProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(employee);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees/${employee.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        toast.success('Employee updated successfully');
        setIsEditing(false);
        onUpdate();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update employee');
      }
    } catch (error) {
      console.error('Failed to update employee:', error);
      toast.error('Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(employee);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const InfoItem = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-start space-x-3">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
      <div>
        <p className="text-gray-500">{label}</p>
        <p className="text-gray-900">{value || '-'}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Directory</span>
        </button>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src={employee.profileImage || undefined} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-600 text-3xl">
                    {getInitials(employee.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h2 className="text-gray-900">{employee.name}</h2>
                  <p className="text-gray-500">{employee.jobTitle || 'Employee'}</p>
                  {employee.department && (
                    <Badge variant="secondary" className="mt-2">
                      {employee.department}
                    </Badge>
                  )}
                </div>

                <Badge 
                  variant={employee.status === 'active' ? 'default' : 'secondary'}
                  className="w-full justify-center"
                >
                  {employee.status}
                </Badge>

                <div className="w-full pt-4 space-y-3 border-t border-gray-200">
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
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem icon={Mail} label="Email Address" value={employee.email} />
                  <InfoItem icon={Phone} label="Phone Number" value={employee.phoneNumber} />
                  <InfoItem icon={Calendar} label="Date of Birth" value={employee.dateOfBirth} />
                  <InfoItem icon={MapPin} label="Address" value={employee.address} />
                  <InfoItem icon={Phone} label="Emergency Contact" value={employee.emergencyContact} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      value={formData.phoneNumber || ''}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth || ''}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Address</Label>
                    <Input
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Emergency Contact</Label>
                    <Input
                      value={formData.emergencyContact || ''}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoItem icon={Briefcase} label="Job Title" value={employee.jobTitle} />
                  <InfoItem icon={Briefcase} label="Department" value={employee.department} />
                  <InfoItem icon={Calendar} label="Hire Date" value={employee.hireDate} />
                  <InfoItem icon={Briefcase} label="Employment Status" value={employee.status} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input
                      value={formData.jobTitle || ''}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input
                      value={formData.department || ''}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Hire Date</Label>
                    <Input
                      type="date"
                      value={formData.hireDate || ''}
                      onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}