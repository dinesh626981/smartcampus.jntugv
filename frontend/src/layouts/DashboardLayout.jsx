import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/ui/Sidebar';
import Topbar from '../components/ui/Topbar';
import Chatbot from '../components/Chatbot';
import Spinner from '../components/ui/Spinner';

export const DashboardLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (loading) {
    return <Spinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard overview';
    if (path.includes('/raise-complaint')) return 'Report a campus issue';
    if (path.includes('/complaints/')) return 'Issue tracking details';
    if (path.includes('/complaints')) return 'Manage & track issues';
    if (path.includes('/students')) return 'Students & administrators';
    if (path.includes('/staff')) return 'Department staff roster';
    if (path.includes('/departments')) return 'Campus departments';
    if (path.includes('/reports')) return 'Reports & audits';
    if (path.includes('/storage')) return 'Storage & media optimization';
    if (path.includes('/settings')) return 'System settings';
    if (path.includes('/profile')) return 'Account profile';
    if (path.includes('/notifications')) return 'Notifications center';
    return 'Campus management';
  };

  return (
    <div className="min-h-screen bg-[var(--md-sys-color-background)] flex transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <Topbar
          pageTitle={getHeaderTitle()}
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />

          {/* Assistant Chatbot */}
          <Chatbot />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
