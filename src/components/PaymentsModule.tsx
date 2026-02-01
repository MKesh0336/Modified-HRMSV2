import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { DollarSign, Plus, Search, Filter } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { useAuth } from './AuthProvider';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Payment {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: 'full_salary' | 'half_salary' | 'advance' | 'custom' | 'final_settlement';
  amount: number;
  description: string;
  month: string;
  paidBy: string;
  paidAt: string;
  deducted: boolean;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  monthlySalary: number;
}

export function PaymentsModule() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPayment, setShowAddPayment] = useState(false);
  
  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [paymentType, setPaymentType] = useState<string>('full_salary');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));

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
      
      // Fetch payments
      const paymentsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/payments`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (paymentsRes.ok) {
        const data = await paymentsRes.json();
        setPayments(data.payments || []);
      }

      // Fetch employees
      const employeesRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/employees`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data.employees || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const employee = employees.find(emp => emp.id === selectedEmployee);
      
      let finalAmount = parseFloat(amount);
      
      // Auto-calculate amount based on type
      if (paymentType === 'full_salary' && employee) {
        finalAmount = employee.monthlySalary;
      } else if (paymentType === 'half_salary' && employee) {
        finalAmount = employee.monthlySalary / 2;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-937488f4/payments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            employeeId: selectedEmployee,
            type: paymentType,
            amount: finalAmount,
            description,
            month
          })
        }
      );

      if (response.ok) {
        toast.success('Payment recorded successfully');
        setShowAddPayment(false);
        resetForm();
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to record payment');
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setPaymentType('full_salary');
    setAmount('');
    setDescription('');
    setMonth(new Date().toISOString().substring(0, 7));
  };

  const getPaymentTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'full_salary': 'Full Salary',
      'half_salary': 'Half Salary',
      'advance': 'Advance',
      'custom': 'Custom',
      'final_settlement': 'Final Settlement'
    };
    return labels[type] || type;
  };

  const getPaymentTypeBadge = (type: string) => {
    const colors: { [key: string]: string } = {
      'full_salary': 'bg-green-100 text-green-800',
      'half_salary': 'bg-yellow-100 text-yellow-800',
      'advance': 'bg-blue-100 text-blue-800',
      'custom': 'bg-purple-100 text-purple-800',
      'final_settlement': 'bg-red-100 text-red-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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

  const selectedEmp = employees.find(emp => emp.id === selectedEmployee);
  const displayAmount = paymentType === 'full_salary' && selectedEmp
    ? selectedEmp.monthlySalary
    : paymentType === 'half_salary' && selectedEmp
    ? selectedEmp.monthlySalary / 2
    : amount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Payments Module</h1>
          <p className="text-gray-500">Manage employee payments, advances, and settlements</p>
        </div>
        
        <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Make Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <Label>Employee *</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} - {emp.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Payment Type *</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_salary">Full Salary</SelectItem>
                    <SelectItem value="half_salary">Half Salary</SelectItem>
                    <SelectItem value="advance">Advance</SelectItem>
                    <SelectItem value="custom">Custom Payment</SelectItem>
                    <SelectItem value="final_settlement">Final Settlement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Amount</Label>
                {paymentType === 'full_salary' || paymentType === 'half_salary' ? (
                  <Input
                    type="number"
                    value={displayAmount}
                    disabled
                    className="bg-gray-100"
                  />
                ) : (
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                )}
              </div>

              <div>
                <Label>Month</Label>
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Payment description or notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddPayment(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-3 text-gray-600">Date</th>
                  <th className="text-left p-3 text-gray-600">Employee</th>
                  <th className="text-left p-3 text-gray-600">Department</th>
                  <th className="text-left p-3 text-gray-600">Type</th>
                  <th className="text-left p-3 text-gray-600">Amount</th>
                  <th className="text-left p-3 text-gray-600">Month</th>
                  <th className="text-left p-3 text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-gray-500">
                      No payments recorded
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(payment.paidAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">{payment.employeeName}</td>
                      <td className="p-3">{payment.department}</td>
                      <td className="p-3">
                        <Badge className={getPaymentTypeBadge(payment.type)}>
                          {getPaymentTypeLabel(payment.type)}
                        </Badge>
                      </td>
                      <td className="p-3">${payment.amount.toLocaleString()}</td>
                      <td className="p-3">{payment.month}</td>
                      <td className="p-3 text-gray-600">{payment.description || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}