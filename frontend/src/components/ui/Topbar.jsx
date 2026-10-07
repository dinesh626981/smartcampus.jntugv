import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  FaBell,
  FaBars,
  FaSun,
  FaMoon,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';
import Avatar from './Avatar';

export const Topbar = ({ pageTitle = 'Dashboard Overview', onOpenMobileMenu = () => {} }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [menuOpen]);

  const getProfilePath = () => {
    if (!user) return '/';
    return user.role === 'admin'
      ? '/admin/profile'
      : user.role === 'staff'
        ? '/staff/profile'
        : '/student/profile';
  };

  const getAccountSettingsPath = () => {
    if (!user) return '/';
    return user.role === 'admin'
      ? '/admin/profile?tab=security'
      : user.role === 'staff'
        ? '/staff/profile?tab=security'
        : '/student/profile?tab=security';
  };

  const getNotificationLink = () => {
    if (!user) return '/login';
    return user.role === 'admin'
      ? '/admin/notifications'
      : user.role === 'staff'
        ? '/staff/notifications'
        : '/student/notifications';
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 transition-colors duration-150">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] rounded-full hover:bg-[var(--md-sys-color-primary)]/8 transition-colors"
          aria-label="Open mobile navigation"
        >
          <FaBars className="h-5 w-5" />
        </button>

        <h2 className="text-xl sm:text-[22px] font-medium leading-7 text-[var(--md-sys-color-on-surface)]">
          {pageTitle}
        </h2>
      </div>

      {/* Right: Theme Toggle, Notifications, Avatar Menu */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Sun & Moon Theme Toggle */}
        <div
          className="flex items-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-full p-0.5"
          role="group"
          aria-label="Theme toggle"
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
              theme === 'light'
                ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
            title="Switch to light theme"
            aria-label="Switch to light theme"
          >
            <FaSun className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
              theme === 'dark'
                ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] shadow-xs'
                : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
            }`}
            title="Switch to dark theme"
            aria-label="Switch to dark theme"
          >
            <FaMoon className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Notification Bell */}
        <Link
          to={getNotificationLink()}
          className="relative p-2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] rounded-full hover:bg-[var(--md-sys-color-primary)]/8 transition-colors"
          title="Notifications"
          aria-label="View notifications"
        >
          <FaBell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--md-sys-color-error)] ring-2 ring-[var(--md-sys-color-surface)]"></span>
        </Link>

        {/* Avatar → Account Dropdown */}
        {user && (
          <div className="relative ml-1" ref={menuRef}>
            <button
              type="button"
              id="account-menu-button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center hover:opacity-90 transition-opacity rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="Open account menu"
              title={`Account: ${user.name}`}
            >
              <Avatar
                src={user.profile_photo_url}
                name={user.name}
                size="sm"
                source={user.profile_photo_source}
                className="ring-2 ring-[var(--md-sys-color-outline-variant)]"
              />
            </button>

            {/* Dropdown Panel */}
            {menuOpen && (
              <div
                role="menu"
                aria-labelledby="account-menu-button"
                className="absolute right-0 mt-2 w-64 rounded-2xl shadow-lg bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] overflow-hidden z-50 animate-fade-in"
              >
                {/* User identity header */}
                <div className="px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)]">
                  <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate mt-0.5">
                    {user.email}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1.5 space-y-0.5 px-1.5">
                  <Link
                    to={getProfilePath()}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)]/8 transition-colors"
                  >
                    <FaUser className="h-4 w-4 text-[var(--md-sys-color-on-surface-variant)]" />
                    <span>My profile</span>
                  </Link>
                  <Link
                    to={getAccountSettingsPath()}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)]/8 transition-colors"
                  >
                    <FaCog className="h-4 w-4 text-[var(--md-sys-color-on-surface-variant)]" />
                    <span>Account settings</span>
                  </Link>
                  <Link
                    to={getNotificationLink()}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)]/8 transition-colors"
                  >
                    <FaBell className="h-4 w-4 text-[var(--md-sys-color-on-surface-variant)]" />
                    <span>Notifications</span>
                  </Link>
                </div>

                {/* Divider + Sign out */}
                <div className="border-t border-[var(--md-sys-color-outline-variant)] py-1.5 px-1.5">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]/25 transition-colors cursor-pointer"
                  >
                    <FaSignOutAlt className="h-4 w-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Topbar;
