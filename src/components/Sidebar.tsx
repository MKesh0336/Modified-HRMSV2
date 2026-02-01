import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  Settings,
  LogOut,
  Building2,
  FileCheck,
  BarChart3,
  Menu,
  X,
  DollarSign,
  Shield
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import logo from 'figma:asset/fc4b410fb12d2e806b8e1ba3c15a6e1805882282.png';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const isAdmin = user?.employee?.role === 'admin';
  const isManager = user?.employee?.role === 'manager';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
    { id: 'leaves', label: 'Leave Management', icon: FileText },
    { id: 'recruitment', label: 'Recruitment', icon: Briefcase },
    { id: 'performance', label: 'Performance', icon: TrendingUp },
    { id: 'payments', label: 'Payments', icon: DollarSign, adminOnly: true },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'departments', label: 'Departments', icon: Building2, adminOnly: true },
    { id: 'policies', label: 'Policies', icon: FileCheck },
    { id: 'permissions', label: 'Roles & Permissions', icon: Shield, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#d4af37] text-black rounded-lg shadow-lg"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-75 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-[#0a0a0a] border-r border-[#d4af37]/20 h-screen flex flex-col
        transition-transform duration-300 ease-in-out
      `}>
        <div className="p-6 border-b border-[#d4af37]/20">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="Al Faiz Multinational Group" className="w-12 h-12 object-contain" />
            <div>
              <h1 className="text-[#d4af37] font-bold">Al Faiz MNG</h1>
              <p className="text-xs text-gray-400">HRMS System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            // Filter items based on role
            if (item.adminOnly && !isAdmin) return null;

            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#d4af37] text-black'
                    : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-[#d4af37]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#d4af37]/20">
          <div className="px-4 py-3 bg-[#1a1a1a] rounded-lg mb-2 border border-[#d4af37]/10">
            <p className="text-[#d4af37] font-medium text-sm">{user?.employee?.name || user?.name}</p>
            <p className="text-gray-400 text-xs capitalize">{user?.employee?.role || 'employee'}</p>
            {user?.employee?.department && (
              <p className="text-gray-500 text-xs mt-1">{user.employee.department}</p>
            )}
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}