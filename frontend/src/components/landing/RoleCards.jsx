import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserGraduate, FaUserTie, FaShieldAlt } from 'react-icons/fa';
import Button from '../ui/Button';

export const RoleCards = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-left">
        <span className="text-sm font-medium text-[var(--md-sys-color-primary)] block mb-1">
          Role-specific access
        </span>
        <h2 className="text-[28px] sm:text-[32px] leading-[36px] sm:leading-[40px] font-normal text-[var(--md-sys-color-on-surface)]">
          Dedicated portals for all stakeholders
        </h2>
        <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mt-1.5 max-w-xl">
          Role-tailored interfaces ensure fast task completion, clear status visibility, and institutional governance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center">
              <FaUserGraduate className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-normal text-[var(--md-sys-color-on-surface)]">Student Portal</h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed">
                Report classroom, laboratory, hostel, and infrastructure faults. Follow status timelines and receive instant resolution alerts.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <Link to="/login?role=student">
              <Button variant="text" size="sm" className="w-full justify-start px-0 text-[var(--md-sys-color-primary)]">
                Student Sign In →
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <FaUserTie className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-normal text-[var(--md-sys-color-on-surface)]">Staff & Technician</h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed">
                Review assigned task queues, manage department repairs, record actions taken, and upload proof of remediation.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <Link to="/login?role=staff">
              <Button variant="text" size="sm" className="w-full justify-start px-0 text-[var(--md-sys-color-primary)]">
                Technician Sign In →
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-10 w-10 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center">
              <FaShieldAlt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-normal text-[var(--md-sys-color-on-surface)]">Administration</h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 leading-relaxed">
                Monitor system metrics, manage department workloads, assign complaints, and audit historical resolution rates.
              </p>
            </div>
          </div>
          <div className="pt-6">
            <Link to="/login?role=admin">
              <Button variant="text" size="sm" className="w-full justify-start px-0 text-[var(--md-sys-color-primary)]">
                Admin Sign In →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleCards;
