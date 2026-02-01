import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Users, Calendar, FileText, Briefcase, TrendingUp, Clock,
  AlertCircle, Cake, TrendingDown, Award
} from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner@2.0.3';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  todayPresent: number;
  openJobs: number;
}

interface Activity {
  id: string;
  action: string;
  actorName: string;
  targetName?: string;
  department?: string;
  timestamp: string;
  details?: any;
}

interface Birthday {
  id: string;
  name: string;
  dateOfBirth: string;
  department: string;
  isToday: boolean;
}

interface AttendanceAnalytics {
  earlyBirds: any[];
  lateComers: any[];
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function DashboardEnhanced({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    todayPresent: 0,
    openJobs: 0
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [analytics, setAnalytics] = useState<AttendanceAnalytics>({ earlyBirds: [], lateComers: [] });
  const [myWishes, setMyWishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishMessage, setWishMessage] = useState('');
  const [selectedBirthdayEmployee, setSelectedBirthdayEmployee] = useState<Birthday | null>(null);

  const isAdmin = user?.employee?.role === 'admin';
  const isManager = user?.employee?.role === 'manager';
  const isEmployee = user?.employee?.role === 'employee';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      // Fetch stats
      const statsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/dashboard/stats`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      // Fetch activities (only for Admin and Managers)
      if (isAdmin || isManager) {
        const activitiesRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/activities`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (activitiesRes.ok) {
          const data = await activitiesRes.json();
          setActivities(data.activities || []);
        }
      }

      // Fetch birthdays
      const birthdaysRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/birthdays`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (birthdaysRes.ok) {
        const data = await birthdaysRes.json();
        setBirthdays(data.birthdays || []);
      }

      // Fetch attendance analytics (only for Admin and Managers)
      if (isAdmin || isManager) {
        const analyticsRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/dashboard/attendance-analytics`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics({ earlyBirds: data.earlyBirds || [], lateComers: data.lateComers || [] });
        }
      }

      // Fetch wishes received (for employees)
      if (user?.employee?.id) {
        const wishesRes = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/birthdays/wishes/${user.employee.id}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (wishesRes.ok) {
          const data = await wishesRes.json();
          setMyWishes(data.wishes || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendBirthdayWish = async () => {
    if (!selectedBirthdayEmployee || !wishMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/birthdays/wish`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            employeeId: selectedBirthdayEmployee.id,
            message: wishMessage
          })
        }
      );

      if (response.ok) {
        toast.success('Birthday wish sent!');
        setWishMessage('');
        setSelectedBirthdayEmployee(null);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send wish');
      }
    } catch (error) {
      console.error('Send wish error:', error);
      toast.error('Failed to send wish');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      'employee_created': 'Employee created',
      'employee_updated': 'Employee updated',
      'employee_resigned': 'Employee resigned',
      'employee_terminated': 'Employee terminated',
      'attendance_checkin': 'Checked in',
      'attendance_checkout': 'Checked out',
      'leave_applied': 'Leave applied',
      'leave_approved': 'Leave approved',
      'leave_rejected': 'Leave rejected',
      'performance_review_submitted': 'Performance review submitted',
      'birthday_wish': 'Birthday wish sent',
      'payment_made': 'Payment made',
      'candidate_hired': 'Candidate hired',
      'final_settlement_generated': 'Final settlement generated'
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-[#d4af37]',
      show: true
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: TrendingUp,
      color: 'bg-emerald-600',
      show: true
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: FileText,
      color: 'bg-yellow-600',
      show: isAdmin
    },
    {
      title: 'Present Today',
      value: stats.todayPresent,
      icon: Calendar,
      color: 'bg-blue-600',
      show: true
    },
    {
      title: 'Open Positions',
      value: stats.openJobs,
      icon: Briefcase,
      color: 'bg-purple-600',
      show: isAdmin || isManager
    },
    {
      title: 'Early Birds',
      value: analytics.earlyBirds.length,
      icon: TrendingUp,
      color: 'bg-emerald-600',
      show: isAdmin || isManager
    },
    {
      title: 'Late Comers',
      value: analytics.lateComers.length,
      icon: TrendingDown,
      color: 'bg-red-600',
      show: isAdmin || isManager
    },
    {
      title: 'Birthdays This Month',
      value: birthdays.length,
      icon: Cake,
      color: 'bg-pink-600',
      show: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-4">
        <div>
          <h1 className="text-[#d4af37]">Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.employee?.name}! Here's what's happening today.</p>
        </div>
        <div className="text-right">
          <p className="text-[#d4af37] font-medium">Al Faiz Multinational Group</p>
          <p className="text-sm text-gray-400">HRMS System</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.filter(stat => stat.show).map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-[#1a1a1a] border-[#d4af37]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-300 text-sm">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-black" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-[#d4af37] text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Birthday Wishes Received - For Employees */}
      {isEmployee && myWishes.length > 0 && (
        <Card className="bg-[#1a1a1a] border-[#d4af37]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#d4af37]">
              <Cake className="w-5 h-5 text-pink-500" />
              Birthday Wishes You Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myWishes.slice(0, 5).map((wish, index) => (
                <div key={index} className="p-3 bg-pink-900/20 rounded-lg border border-pink-500/30">
                  <p className="text-gray-300"><strong className="text-[#d4af37]">{wish.fromName}:</strong> {wish.message}</p>
                  <p className="text-gray-500 text-sm mt-1">{formatTimeAgo(wish.timestamp)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Log - Admin and Managers only */}
        {(isAdmin || isManager) && (
          <Card className="bg-[#1a1a1a] border-[#d4af37]/20">
            <CardHeader>
              <CardTitle className="text-[#d4af37]">Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activities.length === 0 ? (
                  <p className="text-gray-500">No recent activities</p>
                ) : (
                  activities.slice(0, 10).map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 pb-3 border-b border-[#d4af37]/10 last:border-0">
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-gray-300">
                          <strong className="text-[#d4af37]">{activity.actorName}</strong> - {getActionLabel(activity.action)}
                          {activity.targetName && <span className="text-gray-400"> ({activity.targetName})</span>}
                        </p>
                        {activity.department && (
                          <Badge variant="outline" className="mt-1 border-[#d4af37]/30 text-[#d4af37]">{activity.department}</Badge>
                        )}
                        <p className="text-gray-500 text-sm mt-1">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Birthdays */}
        <Card className="bg-[#1a1a1a] border-[#d4af37]/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#d4af37]">
              <Cake className="w-5 h-5 text-pink-500" />
              Birthdays This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {birthdays.length === 0 ? (
                <p className="text-gray-500">No birthdays this month</p>
              ) : (
                birthdays.map((birthday, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${birthday.isToday ? 'bg-pink-900/30 border-pink-500/50' : 'bg-[#0a0a0a] border-[#d4af37]/10'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[#d4af37] font-medium">{birthday.name}</p>
                        <p className="text-gray-400 text-sm">{birthday.department}</p>
                        {birthday.isToday && <Badge className="mt-1 bg-pink-600 text-white">Today!</Badge>}
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-[#d4af37]/30 text-[#d4af37] hover:bg-[#d4af37] hover:text-black"
                            onClick={() => setSelectedBirthdayEmployee(birthday)}
                          >
                            Send Wish
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#1a1a1a] border-[#d4af37]/30">
                          <DialogHeader>
                            <DialogTitle className="text-[#d4af37]">Send Birthday Wish to {birthday.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Textarea
                              placeholder="Write your birthday message..."
                              value={wishMessage}
                              onChange={(e) => setWishMessage(e.target.value)}
                              rows={4}
                              className="bg-[#0a0a0a] border-[#d4af37]/20 text-gray-300"
                            />
                            <Button onClick={sendBirthdayWish} className="w-full bg-[#d4af37] text-black hover:bg-[#b8941f]">
                              <Cake className="w-4 h-4 mr-2" />
                              Send Wish
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Early Birds - Admin and Managers only */}
        {(isAdmin || isManager) && analytics.earlyBirds.length > 0 && (
          <Card className="bg-[#1a1a1a] border-[#d4af37]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
                Early Birds Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.earlyBirds.slice(0, 5).map((emp, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-emerald-900/20 rounded border border-emerald-500/30">
                    <div>
                      <p className="text-[#d4af37] font-medium">{emp.employeeName}</p>
                      <p className="text-gray-400 text-sm">{emp.employeeDepartment}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-500 font-medium">{emp.actualTime}</p>
                      <p className="text-gray-500 text-sm">Expected: {emp.expectedTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Late Comers - Admin and Managers only */}
        {(isAdmin || isManager) && analytics.lateComers.length > 0 && (
          <Card className="bg-[#1a1a1a] border-[#d4af37]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <AlertCircle className="w-5 h-5" />
                Late Comers Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analytics.lateComers.slice(0, 5).map((emp, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-900/20 rounded border border-red-500/30">
                    <div>
                      <p className="text-[#d4af37] font-medium">{emp.employeeName}</p>
                      <p className="text-gray-400 text-sm">{emp.employeeDepartment}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-medium">{emp.actualTime}</p>
                      <p className="text-gray-500 text-sm">Expected: {emp.expectedTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-[#1a1a1a] border-[#d4af37]/20">
          <CardHeader>
            <CardTitle className="text-[#d4af37]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {isAdmin && (
                <button
                  onClick={() => onNavigate?.('add-employee')}
                  className="flex flex-col items-center justify-center p-4 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-colors"
                >
                  <Users className="w-6 h-6 text-[#d4af37] mb-2" />
                  <span className="text-gray-300 text-sm">Add Employee</span>
                </button>
              )}
              <button
                onClick={() => onNavigate?.('attendance')}
                className="flex flex-col items-center justify-center p-4 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-colors"
              >
                <Calendar className="w-6 h-6 text-[#d4af37] mb-2" />
                <span className="text-gray-300 text-sm">Mark Attendance</span>
              </button>
              <button
                onClick={() => onNavigate?.('leaves')}
                className="flex flex-col items-center justify-center p-4 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-colors"
              >
                <FileText className="w-6 h-6 text-[#d4af37] mb-2" />
                <span className="text-gray-300 text-sm">{isAdmin ? 'Review Leaves' : 'Apply for Leave'}</span>
              </button>
              {(isAdmin || isManager) && (
                <button
                  onClick={() => onNavigate?.('recruitment')}
                  className="flex flex-col items-center justify-center p-4 border border-[#d4af37]/30 rounded-lg hover:bg-[#d4af37]/10 hover:border-[#d4af37] transition-colors"
                >
                  <Briefcase className="w-6 h-6 text-[#d4af37] mb-2" />
                  <span className="text-gray-300 text-sm">Recruitment</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}