import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { FaSun, FaMoon } from 'react-icons/fa';
import Button from './ui/Button';
import collegeLogo from '../../assests/logo.png';

const NAV_LINK =
  'px-4 py-2 rounded-full text-sm font-medium transition-colors';
const NAV_ACTIVE =
  'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]';
const NAV_IDLE =
  'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary)]/8';

const MOBILE_LINK =
  'block px-4 py-2.5 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-primary-container)]';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardLink = !user
    ? '/'
    : user.role === 'admin'
      ? '/admin/dashboard'
      : user.role === 'staff'
        ? '/staff/dashboard'
        : '/student/dashboard';

  const cls = (path) =>
    `${NAV_LINK} ${location.pathname === path ? NAV_ACTIVE : NAV_IDLE}`;

  const dashCls = `${NAV_LINK} ${location.pathname.includes('/dashboard') ? NAV_ACTIVE : NAV_IDLE
    }`;

  const ThemeToggle = ({ size = 7 }) => (
    <div
      className="flex items-center bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] rounded-full p-0.5"
      role="group"
      aria-label="Theme toggle"
    >
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`h-${size} w-${size} rounded-full flex items-center justify-center transition-all ${theme === 'light'
            ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] shadow-xs'
            : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
          }`}
        title="Light theme"
        aria-label="Switch to light theme"
      >
        <FaSun className={size === 7 ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`h-${size} w-${size} rounded-full flex items-center justify-center transition-all ${theme === 'dark'
            ? 'bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-primary)] shadow-xs'
            : 'text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]'
          }`}
        title="Dark theme"
        aria-label="Switch to dark theme"
      >
        <FaMoon className={size === 7 ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      </button>
    </div>
  );

  const AuthLinks = () =>
    isAuthenticated ? (
      <div className="flex items-center gap-2.5">
        <span className="text-xs px-3 py-1 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] border border-[var(--md-sys-color-outline-variant)] font-medium capitalize">
          {user?.name || user?.role}
        </span>
        <Button variant="outlined" size="sm" onClick={handleLogout}>
          Sign out
        </Button>
      </div>
    ) : (
      <>
        <Link to="/login">
          <Button variant="text" size="sm">Sign in</Button>
        </Link>
        <Link to="/register">
          <Button variant="filled" size="sm">Register</Button>
        </Link>
      </>
    );

  return (
    <header className="h-16 bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] sticky top-0 z-40 transition-colors duration-150">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        {/* Brand */}
        <Link
          to={isAuthenticated ? dashboardLink : '/'}
          className="flex items-center space-x-3 group"
        >
          <img
            src={collegeLogo}
            alt="JNTU-GV Logo"
            className="h-10 w-10 object-contain rounded-full bg-white p-0.5 shadow-xs transition-transform group-hover:scale-105 shrink-0"
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

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-1">
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink} className={dashCls}>Dashboard</Link>

              {user?.role === 'student' && (
                <>
                  <Link to="/student/raise-complaint" className={cls('/student/raise-complaint')}>
                    Raise complaint
                  </Link>
                  <Link to="/student/complaints" className={cls('/student/complaints')}>
                    My complaints
                  </Link>
                </>
              )}

              {user?.role === 'staff' && (
                <Link to="/staff/complaints" className={cls('/staff/complaints')}>
                  Assigned tasks
                </Link>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/complaints" className={cls('/admin/complaints')}>
                    Complaints
                  </Link>
                  <Link to="/admin/reports" className={cls('/admin/reports')}>
                    Reports
                  </Link>
                </>
              )}

              <Link to="/about" className={cls('/about')}>About</Link>
              <Link to="/contact" className={cls('/contact')}>Contact</Link>
            </>
          ) : (
            <>
              <Link to="/" className={cls('/')}>Home</Link>
              <Link to="/about" className={cls('/about')}>About</Link>
              <Link to="/contact" className={cls('/contact')}>Contact</Link>
            </>
          )}
        </nav>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center space-x-3">
          <ThemeToggle size={7} />
          <AuthLinks />
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle size={6} />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] rounded-full hover:bg-[var(--md-sys-color-primary)]/8"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--md-sys-color-surface)] border-b border-[var(--md-sys-color-outline-variant)] px-4 pt-3 pb-5 space-y-2 shadow-m3-2">
          {isAuthenticated ? (
            <>
              <Link to={dashboardLink} onClick={closeMobile} className={MOBILE_LINK}>
                Dashboard
              </Link>

              {user?.role === 'student' && (
                <>
                  <Link to="/student/raise-complaint" onClick={closeMobile} className={MOBILE_LINK}>
                    Raise complaint
                  </Link>
                  <Link to="/student/complaints" onClick={closeMobile} className={MOBILE_LINK}>
                    My complaints
                  </Link>
                </>
              )}

              {user?.role === 'staff' && (
                <Link to="/staff/complaints" onClick={closeMobile} className={MOBILE_LINK}>
                  Assigned tasks
                </Link>
              )}

              {user?.role === 'admin' && (
                <>
                  <Link to="/admin/complaints" onClick={closeMobile} className={MOBILE_LINK}>
                    Complaints
                  </Link>
                  <Link to="/admin/reports" onClick={closeMobile} className={MOBILE_LINK}>
                    Reports
                  </Link>
                </>
              )}

              <Link to="/about" onClick={closeMobile} className={MOBILE_LINK}>About</Link>
              <Link to="/contact" onClick={closeMobile} className={MOBILE_LINK}>Contact</Link>

              <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2">
                <div className="px-4 py-1 text-xs text-[var(--md-sys-color-on-surface-variant)] capitalize">
                  Signed in as <strong>{user?.name || user?.role}</strong>
                </div>
                <Button variant="outlined" onClick={handleLogout} className="w-full">
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link to="/" onClick={closeMobile} className={MOBILE_LINK}>Home</Link>
              <Link to="/about" onClick={closeMobile} className={MOBILE_LINK}>About</Link>
              <Link to="/contact" onClick={closeMobile} className={MOBILE_LINK}>Contact</Link>
              <div className="pt-3 border-t border-[var(--md-sys-color-outline-variant)] flex flex-col gap-2">
                <Link to="/login" onClick={closeMobile}>
                  <Button variant="outlined" className="w-full">Sign in</Button>
                </Link>
                <Link to="/register" onClick={closeMobile}>
                  <Button variant="filled" className="w-full">Register</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
