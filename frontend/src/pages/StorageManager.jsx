import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaTrashAlt,
  FaDownload,
  FaSync,
  FaCheckCircle,
  FaShieldAlt,
  FaSearch,
} from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import DataTable from '../components/ui/DataTable';
import Spinner from '../components/ui/Spinner';
import { StatusBadge } from '../components/ui/Badge';
import { StorageAllocationCard, CleanupConfirmDialog } from '../components/admin';
import { formatDate, formatDateTime } from '../utils/formatters';

export const StorageManager = () => {
  // Usage state
  const [usage, setUsage] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

  // Cleanup preview & execution state
  const [filterDays, setFilterDays] = useState(30);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [downloadingBackup, setDownloadingBackup] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [executingCleanup, setExecutingCleanup] = useState(false);

  // Cleanup history logs
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchUsage = useCallback(async () => {
    setLoadingUsage(true);
    try {
      const data = await adminService.getStorageUsage();
      setUsage(data);
    } catch (err) {
      console.error('Failed to load storage usage:', err);
      toast.error('Failed to retrieve Cloudinary storage metrics.');
    } finally {
      setLoadingUsage(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const data = await adminService.getCleanupLogs();
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load cleanup logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
    fetchLogs();
  }, [fetchUsage, fetchLogs]);

  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const data = await adminService.previewCleanup(Number(filterDays));
      setPreviewData(data);
      if (data.candidate_count === 0) {
        toast.info(`No resolved complaints older than ${filterDays} days have media to clean up.`);
      } else {
        toast.success(`Found ${data.candidate_count} complaints with ${data.total_images_count} images (${data.estimated_reclaimed_mb} MB).`);
      }
    } catch (err) {
      console.error('Preview error:', err);
      toast.error('Failed to analyze candidate complaints.');
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownloadBackup = async () => {
    setDownloadingBackup(true);
    try {
      await adminService.downloadBackup(Number(filterDays));
      toast.success('ZIP image archive downloaded successfully.');
    } catch (err) {
      console.error('Backup download error:', err);
      toast.error('Failed to generate image backup archive.');
    } finally {
      setDownloadingBackup(false);
    }
  };

  const handleExecuteCleanup = async () => {
    if (confirmInput.trim() !== 'DELETE') {
      toast.error('You must type "DELETE" to confirm.');
      return;
    }

    setExecutingCleanup(true);
    try {
      const res = await adminService.executeCleanup(Number(filterDays), 'DELETE');
      toast.success(res.message || 'Storage cleanup executed successfully.');
      setShowConfirmModal(false);
      setConfirmInput('');
      setPreviewData(null);
      // Refresh metrics and audit log
      fetchUsage();
      fetchLogs();
    } catch (err) {
      console.error('Cleanup execution error:', err);
      toast.error(err.response?.data?.message || 'Failed to execute storage cleanup.');
    } finally {
      setExecutingCleanup(false);
    }
  };

  // Candidate table columns
  const candidateColumns = [
    {
      key: 'id',
      header: 'Ticket #',
      render: (val) => <span className="font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">#{val}</span>,
    },
    {
      key: 'title',
      header: 'Complaint Title',
      render: (val, row) => (
        <div>
          <span className="font-medium text-xs text-[var(--md-sys-color-on-surface)] block max-w-xs truncate">{val}</span>
          <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">{row.category}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'created_at',
      header: 'Reported',
      render: (val) => <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{formatDate(val)}</span>,
    },
    {
      key: 'image_count',
      header: 'Media Assets',
      render: (val, row) => (
        <div className="flex items-center gap-1">
          {row.has_before_image && (
            <span className="text-[10px] font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
              Report Image
            </span>
          )}
          {row.has_proof_image && (
            <span className="text-[10px] font-medium bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
              Work Proof
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'estimated_kb',
      header: 'Estimated Size',
      render: (val) => <span className="font-mono text-xs text-[var(--md-sys-color-on-surface)]">{val} KB</span>,
    },
  ];

  // Audit logs columns
  const logColumns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (val) => <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{formatDateTime(val)}</span>,
    },
    {
      key: 'admin_name',
      header: 'Admin',
      render: (val) => <span className="text-xs font-medium text-[var(--md-sys-color-on-surface)]">{val}</span>,
    },
    {
      key: 'filter_days',
      header: 'Age Threshold',
      render: (val) => <span className="text-xs font-mono text-[var(--md-sys-color-on-surface)]">&gt; {val} days</span>,
    },
    {
      key: 'deleted_count',
      header: 'Assets Purged',
      render: (val) => <span className="text-xs font-semibold text-[var(--md-sys-color-primary)] font-mono">{val}</span>,
    },
    {
      key: 'reclaimed_mb',
      header: 'Space Reclaimed',
      render: (val) => <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{val} MB</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => (
        <span className="text-[11px] font-medium uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">

      {/* Header */}
      <PageHeader
        title="Storage & Media Optimization"
        subtitle="Manage Cloudinary storage quotas, client-side image compression, and automated cleanup of legacy complaint media."
        action={
          <Button
            variant="outlined"
            size="sm"
            onClick={fetchUsage}
            loading={loadingUsage}
            icon={<FaSync className={loadingUsage ? 'animate-spin' : ''} />}
          >
            Refresh Metrics
          </Button>
        }
      />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Storage Meter Card with Stacked Breakdown */}
        <StorageAllocationCard usage={usage} loading={loadingUsage} />

        {/* Cloudinary Integration State */}
        <Card title="Storage Provider" subtitle="Cloud delivery network integration">
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Cloud Name:</span>
              <span className="font-mono font-medium text-[var(--md-sys-color-on-surface)]">
                {usage?.cloud_name || 'Loading...'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Mode:</span>
              <span className={`font-medium ${usage?.is_mock ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {usage?.is_mock ? 'Local Fallback' : 'Active Cloudinary'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[var(--md-sys-color-outline-variant)]">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Delivery Format:</span>
              <span className="font-mono text-[var(--md-sys-color-on-surface)]">f_auto, q_auto</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Target Quality:</span>
              <span className="font-medium text-[var(--md-sys-color-on-surface)]">JPEG 80% (Max 1600px)</span>
            </div>
          </div>
        </Card>

        {/* System Guidelines */}
        <Card title="Compression Pipeline" subtitle="Zero-slop image constraints">
          <div className="space-y-2 text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Client-Side:</strong> Raw uploads up to 15MB are compressed to &lt; 400KB in a WebWorker before network transit.</span>
            </div>
            <div className="flex items-start gap-2">
              <FaCheckCircle className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong>Server-Side:</strong> Pillow normalizes EXIF orientation and bounds dimensions to 1600×1600.</span>
            </div>
            <div className="flex items-start gap-2">
              <FaShieldAlt className="text-indigo-500 mt-0.5 flex-shrink-0" />
              <span><strong>Safety Rules:</strong> Active complaints (Pending/Assigned/In Progress) are strictly protected from cleanup.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Cleanup Action Center */}
      <Card
        title="Automated Storage Cleanup"
        subtitle="Filter closed or resolved complaints older than X days, backup archives to ZIP, and purge image assets from Cloudinary."
      >
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-[var(--md-sys-color-surface-container)] p-4 rounded-card border border-[var(--md-sys-color-outline-variant)]">
            <div className="w-56">
              <Select
                label="Complaint Age Threshold"
                value={filterDays}
                onChange={(e) => {
                  setFilterDays(Number(e.target.value));
                  setPreviewData(null);
                }}
                options={[
                  { value: 15, label: 'Older than 15 days' },
                  { value: 30, label: 'Older than 30 days (Recommended)' },
                  { value: 60, label: 'Older than 60 days' },
                  { value: 90, label: 'Older than 90 days' },
                  { value: 180, label: 'Older than 180 days' },
                ]}
              />
            </div>

            <div className="flex items-center gap-3 pt-2 sm:pt-0">
              <Button
                variant="filled"
                size="md"
                onClick={handlePreview}
                loading={loadingPreview}
                icon={<FaSearch className="text-xs" />}
              >
                Scan Candidates
              </Button>

              <Button
                variant="outlined"
                size="md"
                onClick={handleDownloadBackup}
                loading={downloadingBackup}
                icon={<FaDownload className="text-xs" />}
              >
                Download ZIP Backup
              </Button>

              <Button
                variant="filled"
                size="md"
                onClick={() => setShowConfirmModal(true)}
                disabled={!previewData || previewData.candidate_count === 0}
                className="!bg-rose-600 hover:!bg-rose-700 !text-white"
                icon={<FaTrashAlt className="text-xs" />}
              >
                Purge Images ({previewData ? previewData.total_images_count : 0})
              </Button>
            </div>
          </div>

          {/* Preview Results Display */}
          {previewData && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Summary Stats Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-card bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
                <div>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Eligible Complaints</span>
                  <span className="text-xl font-bold text-[var(--md-sys-color-on-surface)]">{previewData.candidate_count}</span>
                </div>
                <div>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Media Files To Remove</span>
                  <span className="text-xl font-bold text-[var(--md-sys-color-primary)]">{previewData.total_images_count}</span>
                </div>
                <div>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Estimated Space Reclaimed</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{previewData.estimated_reclaimed_mb} MB</span>
                </div>
              </div>

              {/* Candidates Table */}
              {previewData.complaints.length > 0 ? (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] mb-2">
                    Candidate Complaints (Resolved / Closed &gt; {filterDays} Days)
                  </h4>
                  <DataTable
                    columns={candidateColumns}
                    data={previewData.complaints}
                    searchPlaceholder="Search candidate tickets..."
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  No complaints match the specified age criteria.
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Cleanup History Audit Table */}
      <Card
        title="Cleanup Execution History"
        subtitle="Audit logs of previous Cloudinary storage purges and reclaimed bandwidth."
      >
        {loadingLogs ? (
          <div className="py-8 flex justify-center">
            <Spinner />
          </div>
        ) : logs.length > 0 ? (
          <DataTable
            columns={logColumns}
            data={logs}
            searchPlaceholder="Search audit history..."
          />
        ) : (
          <div className="text-center py-8 text-xs text-[var(--md-sys-color-on-surface-variant)]">
            No cleanup operations executed yet.
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <CleanupConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmInput('');
        }}
        confirmInput={confirmInput}
        setConfirmInput={setConfirmInput}
        previewData={previewData}
        filterDays={filterDays}
        onConfirm={handleExecuteCleanup}
        loading={executingCleanup}
      />
    </div>
  );
};

export default StorageManager;
