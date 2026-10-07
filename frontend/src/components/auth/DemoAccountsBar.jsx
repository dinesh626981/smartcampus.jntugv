import React from 'react';
import { FaGraduationCap, FaUserShield, FaUserTie } from 'react-icons/fa';
import Chip from '../ui/Chip';

export const DEMO_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin',
    email: 'admin@college.com',
    mobile: '9876543210',
    password: 'admin123',
    icon: FaUserShield,
  },
  {
    role: 'student',
    label: 'Student',
    email: 'student@college.com',
    mobile: '9876543211',
    password: 'student123',
    icon: FaGraduationCap,
  },
  {
    role: 'staff',
    label: 'Staff',
    email: 'staff@college.com',
    mobile: '9876543212',
    password: 'staff123',
    icon: FaUserTie,
  },
];

/**
 * 1-Click quick fill buttons for demo testing.
 */
export const DemoAccountsBar = ({ onSelectAccount, activeRole = null }) => {
  return (
    <div className="mt-8 pt-6 border-t border-[var(--md-sys-color-outline-variant)]">
      <div className="text-center mb-3">
        <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] uppercase tracking-wider">
          Quick Demo Autofill
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {DEMO_ACCOUNTS.map((acc) => {
          const Icon = acc.icon;
          const isSelected = activeRole === acc.role;
          return (
            <Chip
              key={acc.role}
              onClick={() => onSelectAccount(acc, 'email')}
              variant={isSelected ? 'primary' : 'default'}
              icon={<Icon className="text-xs" />}
              className="cursor-pointer"
            >
              {acc.label}
            </Chip>
          );
        })}
      </div>
    </div>
  );
};

export default DemoAccountsBar;
