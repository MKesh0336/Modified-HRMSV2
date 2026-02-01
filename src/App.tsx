import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LoginPage } from './components/LoginPage';
import { Setup } from './components/Setup';
import { Sidebar } from './components/Sidebar';
import { DashboardEnhanced } from './components/DashboardEnhanced';
import { EmployeeDirectory } from './components/EmployeeDirectory';
import { EmployeeProfile } from './components/EmployeeProfile';
import { AddEmployee } from './components/AddEmployee';
import { AttendanceManagement } from './components/AttendanceManagement';
import { LeaveManagement } from './components/LeaveManagement';
import { RecruitmentATS } from './components/RecruitmentATS';
import { PerformanceReview } from './components/PerformanceReview';
import { Settings } from './components/Settings';
import { PoliciesManagement } from './components/PoliciesManagement';
import { DepartmentManagement } from './components/DepartmentManagement';
import { Reports } from './components/Reports';
import { PaymentsModule } from './components/PaymentsModule';
import { RolesPermissions } from './components/RolesPermissions';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#d4af37] mx-auto mb-4"></div>
          <p className="text-[#d4af37]">Loading Al Faiz Multinational Group HRMS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onSwitchToRegister={() => {}} />;
  }

  const handleViewProfile = (employee: any) => {
    setSelectedEmployee(employee);
    setCurrentPage('employee-profile');
  };

  const handleBackToDirectory = () => {
    setSelectedEmployee(null);
    setCurrentPage('employees');
  };

  const handleUpdateEmployee = () => {
    // Refresh employee data
    setSelectedEmployee(null);
    setCurrentPage('employees');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardEnhanced onNavigate={setCurrentPage} />;
      case 'employees':
        return <EmployeeDirectory onViewProfile={handleViewProfile} onAddEmployee={() => setCurrentPage('add-employee')} />;
      case 'add-employee':
        return <AddEmployee onBack={() => setCurrentPage('employees')} onSuccess={() => setCurrentPage('employees')} />;
      case 'employee-profile':
        return selectedEmployee ? (
          <EmployeeProfile
            employee={selectedEmployee}
            onBack={handleBackToDirectory}
            onUpdate={handleUpdateEmployee}
          />
        ) : (
          <EmployeeDirectory onViewProfile={handleViewProfile} onAddEmployee={() => setCurrentPage('add-employee')} />
        );
      case 'attendance':
        return <AttendanceManagement />;
      case 'leaves':
        return <LeaveManagement />;
      case 'recruitment':
        return <RecruitmentATS />;
      case 'performance':
        return <PerformanceReview />;
      case 'departments':
        return <DepartmentManagement />;
      case 'policies':
        return <PoliciesManagement />;
      case 'settings':
        return <Settings />;
      case 'reports':
        return <Reports />;
      case 'payments':
        return <PaymentsModule />;
      case 'permissions':
        return <RolesPermissions />;
      default:
        return <DashboardEnhanced onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex h-screen bg-black">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <div className="flex-1 overflow-auto">
        <div className="p-4 lg:p-8">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Simple routing based on URL path
  const [route, setRoute] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handleRouteChange = () => {
      setRoute(window.location.pathname);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);

  // Show setup page if route is /setup
  if (route === '/setup') {
    return <Setup />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}