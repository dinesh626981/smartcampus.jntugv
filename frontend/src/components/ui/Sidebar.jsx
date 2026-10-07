import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaChartPie,
  FaPlusCircle,
  FaHistory,
  FaBell,
  FaBuilding,
  FaUsers,
  FaUserTie,
  FaFileAlt,
  FaCog,
  FaClipboardList,
  FaSignOutAlt,
  FaHdd,
  FaChevronRight,
} from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import collegeLogo from '../../../assests/logo.png';
import Avatar from './Avatar';

export const Sidebar = ({ mobileOpen = false, setMobileOpen = () => { } }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    return user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'staff'
        ? '/staff/dashboard'
        : '/student/dashboard';
  };

  const getProfilePath = () => {
    if (!user) return '/';
    return user.role === 'admin'
      ? '/admin/profile'
      : user.role === 'staff'
        ? '/staff/profile'
        : '/student/profile';
  };

  const isActive = (path) => {
    if (path.includes('/dashboard') && location.pathname.endsWith('/dashboard')) {
      return location.pathname === path;
    }
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path + '/'));
  };

  const getLinks = () => {
    if (!user) return [];
    switch (user.role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student/dashboard', icon: FaChartPie },
          { name: 'Raise complaint', path: '/student/raise-complaint', icon: FaPlusCircle },
          { name: 'My complaints', path: '/student/complaints', icon: FaHistory },
          { name: 'Notifications', path: '/student/notifications', icon: FaBell },
        ];
      case 'staff':
        return [
          { name: 'Dashboard', path: '/staff/dashboard', icon: FaChartPie },
          { name: 'Assigned complaints', path: '/staff/complaints', icon: FaClipboardList },
          { name: 'Notifications', path: '/staff/notifications', icon: FaBell },
        ];
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin/dashboard', icon: FaChartPie },
          { name: 'Manage complaints', path: '/admin/complaints', icon: FaClipboardList },
          { name: 'Students & admins', path: '/admin/students', icon: FaUsers },
          { name: 'Department staff', path: '/admin/staff', icon: FaUserTie },
          { name: 'Departments', path: '/admin/departments', icon: FaBuilding },
          { name: 'Reports & export', path: '/admin/reports', icon: FaFileAlt },
          { name: 'Storage & cleanup', path: '/admin/storage', icon: FaHdd },
          { name: 'System settings', path: '/admin/settings', icon: FaCog },
          { name: 'Notifications', path: '/admin/notifications', icon: FaBell },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();
  const profilePath = getProfilePath();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[var(--md-sys-color-surface)] border-r border-[var(--md-sys-color-outline-variant)] w-72 select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
        <Link to={getDashboardPath()} className="flex items-center space-x-3">
          <img
            src={collegeLogo}
            alt="JNTU-GV Logo"
            className="h-10 w-10 object-contain rounded-full bg-white p-0.5 shadow-xs shrink-0"
          />
          <div className="flex flex-col">
            <span className="text-[20px] font-medium leading-6 text-[var(--md-sys-color-on-surface)] tracking-normal">
              SMARTCAMPUS.
            </span>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] -mt-0.5">
              JNTU-GV (CEV)
            </span>
          </div>
        </Link>
        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] p-2 rounded-full hover:bg-[var(--md-sys-color-primary)]/8"
            aria-label="Close sidebar"
          >
            <HiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav list - Material 3 Navigation Drawer */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto" aria-label="Sidebar navigation">
        <div className="px-4 py-1.5 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">
          Navigation
        </div>
        {links.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center space-x-3 px-4 h-12 rounded-full text-sm font-medium tracking-[0.1px] transition-colors
                ${active
                  ? 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-semibold'
                  : 'text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-primary)]/8 hover:text-[var(--md-sys-color-on-surface)]'
                }
              `}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-[var(--md-sys-color-on-primary-container)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Identity Footer — click to open profile */}
      <div className="p-3.5 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] space-y-2.5">
        <Link
          to={profilePath}
          onClick={() => setMobileOpen(false)}
          className="flex items-center space-x-3 rounded-2xl px-2 py-1.5 hover:bg-[var(--md-sys-color-primary)]/8 transition-colors group"
          title="Go to your profile"
        >
          {/* Avatar */}
          <Avatar
            src={user?.profile_photo_url}
            name={user?.name}
            size="sm"
            source={user?.profile_photo_source}
            className="h-9 w-9 text-sm shrink-0"
          />

          {/* User Details */}
          <div className="flex flex-col text-left min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] capitalize shrink-0">
                {user?.role}
              </span>
            </div>
            <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
              {user?.email || user?.role || 'Guest'}
            </span>
          </div>

          {/* Chevron hint */}
          <FaChevronRight className="h-3 w-3 text-[var(--md-sys-color-on-surface-variant)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </Link>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/25 border border-[var(--md-sys-color-outline-variant)] transition-colors cursor-pointer"
        >
          <FaSignOutAlt className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/32 transition-opacity"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
