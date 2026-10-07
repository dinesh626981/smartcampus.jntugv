import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaDatabase, FaShieldAlt, FaBell, FaSave } from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export const Settings = () => {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Institutional parameters updated successfully.');
    }, 400);
  };

  return (
    <div className="max-w-4xl space-y-6">

      <PageHeader
        title="Institutional system parameters"
        subtitle="Configure authentication security boundaries, evidence storage retention, and automatic notification dispatch."
      />

      <div className="space-y-6">
        {/* Security & Access */}
        <Card
          title="Security & access policies"
          subtitle="Authentication thresholds, session duration, and rate limiting"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card">
              <div className="p-2.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] rounded-full text-xs mt-0.5">
                <FaShieldAlt className="text-sm" />
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Account lockout protection</div>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                    Temporarily suspend credentials after 5 consecutive failed authentication attempts.
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] h-4 w-4"
                  />
                  <span className="text-xs text-[var(--md-sys-color-on-surface)] font-medium">
                    Enforce 5-attempt brute-force protection
                  </span>
                </label>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card">
              <div className="p-2.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] rounded-full text-xs mt-0.5">
                <FaShieldAlt className="text-sm" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Session inactivity timeout</div>
                <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                  Maximum JWT lifetime before requiring credentials re-entry.
                </div>
                <div className="text-xs font-mono text-[var(--md-sys-color-primary)] font-medium mt-1">
                  Standard TTL: 24 hours (active)
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Database & File Retention */}
        <Card
          title="Storage & evidence cache"
          subtitle="File uploads, photographic proof storage, and database maintenance"
        >
          <div className="flex items-start gap-3 p-4 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card">
            <div className="p-2.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] rounded-full text-xs mt-0.5">
              <FaDatabase className="text-sm" />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">File system evidence directory</div>
                <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                  Inspect and purge stale temporary uploads or orphaned ticket resolution photographs.
                </div>
              </div>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outlined"
                  size="sm"
                  onClick={() => toast.info('Evidence cache synchronized. 0 orphaned files found.')}
                >
                  Purge upload cache
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Dispatch & Communications */}
        <Card
          title="Dispatch & telemetry dispatches"
          subtitle="Electronic notifications delivered to students and technicians"
        >
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card">
              <div className="p-2.5 bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-primary)] rounded-full text-xs mt-0.5">
                <FaBell className="text-sm" />
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Automated status notifications</div>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                    Send real-time alerts when ticket lifecycle moves through stages.
                  </div>
                </div>
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] h-4 w-4"
                    />
                    <span className="text-xs text-[var(--md-sys-color-on-surface)]">Dispatch alerts upon technician allocation</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-[var(--md-sys-color-outline)] text-[var(--md-sys-color-primary)] focus:ring-[var(--md-sys-color-primary)] h-4 w-4"
                    />
                    <span className="text-xs text-[var(--md-sys-color-on-surface)]">Dispatch alerts upon resolution completion</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            variant="filled"
            loading={saving}
            icon={<FaSave className="text-xs" />}
          >
            Save configurations
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
