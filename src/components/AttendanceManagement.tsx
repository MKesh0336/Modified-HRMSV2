import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Clock, CheckCircle, XCircle, LogIn, LogOut } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut: string | null;
  totalHours: number | null;
  status: string;
  location: string;
}

export function AttendanceManagement() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [checking, setChecking] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');

  useEffect(() => {
    fetchAttendance();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAttendance = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/attendance/${user?.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAttendanceRecords(data.attendance);
        
        // Find today's record
        const today = new Date().toISOString().split('T')[0];
        const todayAtt = data.attendance.find((a: AttendanceRecord) => a.date === today);
        setTodayRecord(todayAtt || null);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('GPS Error:', error);
          reject(new Error('Unable to get your location. Please enable GPS/location services.'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };

  const handleCheckIn = async () => {
    setChecking(true);
    setGpsError(null);
    setGpsStatus('requesting');
    try {
      // Get GPS location
      const location = await getLocation();
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/attendance/gps-checkin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            latitude: location.latitude,
            longitude: location.longitude,
            location: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
          })
        }
      );

      if (response.ok) {
        await fetchAttendance();
        setGpsStatus('success');
        toast.success('Check-in successful');
      } else {
        const errorData = await response.json();
        setGpsError(errorData.error || 'Check-in failed');
        setGpsStatus('error');
        toast.error(errorData.error || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      setGpsError(error instanceof Error ? error.message : 'Failed to get location. Please enable GPS.');
      setGpsStatus('error');
      toast.error(error instanceof Error ? error.message : 'Failed to get location. Please enable GPS.');
    } finally {
      setChecking(false);
    }
  };

  const handleCheckOut = async () => {
    setChecking(true);
    setGpsError(null);
    setGpsStatus('requesting');
    try {
      // Get GPS location
      const location = await getLocation();
      
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/attendance/gps-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            latitude: location.latitude,
            longitude: location.longitude
          })
        }
      );

      if (response.ok) {
        await fetchAttendance();
        setGpsStatus('success');
        toast.success('Check-out successful');
      } else {
        const errorData = await response.json();
        setGpsError(errorData.error || 'Check-out failed');
        setGpsStatus('error');
        toast.error(errorData.error || 'Check-out failed');
      }
    } catch (error) {
      console.error('Check-out failed:', error);
      setGpsError(error instanceof Error ? error.message : 'Failed to get location. Please enable GPS.');
      setGpsStatus('error');
      toast.error(error instanceof Error ? error.message : 'Failed to get location. Please enable GPS.');
    } finally {
      setChecking(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDatesWithAttendance = () => {
    return attendanceRecords.map(record => new Date(record.date));
  };

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
        <h1 className="text-gray-900">Attendance Management</h1>
        <p className="text-gray-500">Track your work hours and attendance</p>
      </div>

      {gpsError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{gpsError}</p>
          <p className="text-red-600 text-sm mt-1">
            Please enable location services in your browser settings
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Check In/Out</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Clock className="w-16 h-16 text-indigo-600" />
                </div>
                <p className="text-center text-gray-600 mb-2">Current Time</p>
                <p className="text-center text-gray-900 mb-4">
                  {new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>

              {todayRecord ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <LogIn className="w-5 h-5 text-green-600" />
                      <span className="text-green-900">Checked In</span>
                    </div>
                    <p className="text-green-700">
                      {formatTime(todayRecord.checkIn)}
                    </p>
                  </div>

                  {todayRecord.checkOut ? (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <LogOut className="w-5 h-5 text-blue-600" />
                        <span className="text-blue-900">Checked Out</span>
                      </div>
                      <p className="text-blue-700">
                        {formatTime(todayRecord.checkOut)}
                      </p>
                      <p className="text-blue-600 mt-2">
                        Total: {todayRecord.totalHours} hours
                      </p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleCheckOut} 
                      disabled={checking}
                      className="w-full"
                      variant="outline"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {checking ? 'Processing...' : 'Check Out'}
                    </Button>
                  )}
                </div>
              ) : (
                <Button 
                  onClick={handleCheckIn} 
                  disabled={checking}
                  className="w-full"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {checking ? 'Processing...' : 'Check In'}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Present Days</span>
                <span className="text-gray-900">{attendanceRecords.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Hours</span>
                <span className="text-gray-900">
                  {attendanceRecords
                    .reduce((sum, record) => sum + (record.totalHours || 0), 0)
                    .toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg. Hours/Day</span>
                <span className="text-gray-900">
                  {attendanceRecords.length > 0
                    ? (attendanceRecords
                        .reduce((sum, record) => sum + (record.totalHours || 0), 0) /
                        attendanceRecords.length
                      ).toFixed(1)
                    : '0'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        record.checkOut ? 'bg-green-100' : 'bg-yellow-100'
                      }`}>
                        {record.checkOut ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-900">{record.date}</p>
                        <p className="text-gray-500">
                          {formatTime(record.checkIn)}
                          {record.checkOut && ` - ${formatTime(record.checkOut)}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={record.checkOut ? 'default' : 'secondary'}>
                        {record.checkOut ? 'Complete' : 'In Progress'}
                      </Badge>
                      {record.totalHours && (
                        <p className="text-gray-600 mt-1">
                          {record.totalHours}h
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}