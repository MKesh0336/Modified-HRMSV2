import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { Calendar, Check, X, Plus } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner@2.0.3';

interface Leave {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  appliedAt: string;
  halfDay: boolean;
}

export function LeaveManagement() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    reason: '',
    halfDay: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaves();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaves = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/leave/list`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaves(data.leaves.sort((a: Leave, b: Leave) => 
          new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
        ));
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/leave/apply`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        setDialogOpen(false);
        setFormData({
          leaveType: 'annual',
          startDate: '',
          endDate: '',
          reason: '',
          halfDay: false
        });
        await fetchLeaves();
        toast.success('Leave request submitted successfully!');
      }
    } catch (error) {
      console.error('Failed to apply for leave:', error);
      toast.error('Failed to apply for leave. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/leave/approve/${leaveId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        await fetchLeaves();
        toast.success('Leave request approved successfully!');
      }
    } catch (error) {
      console.error('Failed to approve leave:', error);
      toast.error('Failed to approve leave. Please try again.');
    }
  };

  const handleReject = async (leaveId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/leave/reject/${leaveId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reason: 'Not approved' })
        }
      );

      if (response.ok) {
        await fetchLeaves();
        toast.success('Leave request rejected successfully!');
      }
    } catch (error) {
      console.error('Failed to reject leave:', error);
      toast.error('Failed to reject leave. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      annual: 'Annual Leave',
      sick: 'Sick Leave',
      personal: 'Personal Leave',
      unpaid: 'Unpaid Leave',
      maternity: 'Maternity Leave',
      paternity: 'Paternity Leave'
    };
    return types[type] || type;
  };

  const calculateDays = (start: string, end: string, halfDay: boolean) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return halfDay ? days / 2 : days;
  };

  const isManager = user?.role === 'admin' || user?.role === 'manager';

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
          <h1 className="text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Manage leave requests and balances</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Apply for Leave
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply for Leave</DialogTitle>
              <DialogDescription>
                Submit a new leave request for approval
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select 
                  value={formData.leaveType} 
                  onValueChange={(value) => setFormData({ ...formData, leaveType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="annual">Annual Leave</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="halfDay"
                  checked={formData.halfDay}
                  onChange={(e) => setFormData({ ...formData, halfDay: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="halfDay" className="cursor-pointer">Half Day</Label>
              </div>

              <div className="space-y-2">
                <Label>Reason</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave..."
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Leave Request'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Annual Leave</p>
                <p className="text-gray-900">12 days</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Sick Leave</p>
                <p className="text-gray-900">8 days</p>
              </div>
              <Calendar className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Used This Year</p>
                <p className="text-gray-900">
                  {leaves.filter(l => l.status === 'approved').length} days
                </p>
              </div>
              <Check className="w-8 h-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Pending</p>
                <p className="text-gray-900">
                  {leaves.filter(l => l.status === 'pending').length}
                </p>
              </div>
              <Plus className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-600">Type</th>
                  <th className="px-6 py-3 text-left text-gray-600">Duration</th>
                  <th className="px-6 py-3 text-left text-gray-600">Days</th>
                  <th className="px-6 py-3 text-left text-gray-600">Reason</th>
                  <th className="px-6 py-3 text-left text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-gray-600">Applied</th>
                  {isManager && <th className="px-6 py-3 text-left text-gray-600">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Badge variant="outline">{getLeaveTypeLabel(leave.leaveType)}</Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {leave.startDate} - {leave.endDate}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {calculateDays(leave.startDate, leave.endDate, leave.halfDay)}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                      {leave.reason}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(leave.appliedAt).toLocaleDateString()}
                    </td>
                    {isManager && (
                      <td className="px-6 py-4">
                        {leave.status === 'pending' && (
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(leave.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(leave.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}