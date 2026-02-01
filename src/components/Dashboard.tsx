import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Calendar, FileText, Briefcase, TrendingUp, Clock } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  pendingLeaves: number;
  todayPresent: number;
  openJobs: number;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    todayPresent: 0,
    openJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/dashboard/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: stats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      trend: '+12% from last month'
    },
    {
      title: 'Active Employees',
      value: stats.activeEmployees,
      icon: TrendingUp,
      color: 'bg-green-500',
      trend: 'Currently active'
    },
    {
      title: 'Pending Leaves',
      value: stats.pendingLeaves,
      icon: FileText,
      color: 'bg-yellow-500',
      trend: 'Awaiting approval'
    },
    {
      title: 'Present Today',
      value: stats.todayPresent,
      icon: Calendar,
      color: 'bg-indigo-500',
      trend: 'Checked in'
    },
    {
      title: 'Open Positions',
      value: stats.openJobs,
      icon: Briefcase,
      color: 'bg-purple-500',
      trend: 'Active job postings'
    },
    {
      title: 'Avg. Work Hours',
      value: '8.2',
      icon: Clock,
      color: 'bg-pink-500',
      trend: 'This week'
    }
  ];

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
        <h1 className="text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-gray-600">{stat.title}</CardTitle>
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-gray-900">{stat.value}</div>
                <p className="text-gray-500 mt-1">{stat.trend}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'John Doe checked in', time: '5 minutes ago', type: 'attendance' },
                { action: 'Sarah Smith applied for leave', time: '1 hour ago', type: 'leave' },
                { action: 'New candidate added to pipeline', time: '2 hours ago', type: 'recruitment' },
                { action: 'Performance review completed', time: '3 hours ago', type: 'performance' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.action}</p>
                    <p className="text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate?.('add-employee')}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <Users className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-gray-700">Add Employee</span>
              </button>
              <button
                onClick={() => onNavigate?.('attendance')}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <Calendar className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-gray-700">Mark Attendance</span>
              </button>
              <button
                onClick={() => onNavigate?.('leaves')}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <FileText className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-gray-700">Review Leaves</span>
              </button>
              <button
                onClick={() => onNavigate?.('recruitment')}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
              >
                <Briefcase className="w-6 h-6 text-indigo-600 mb-2" />
                <span className="text-gray-700">Post Job</span>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}