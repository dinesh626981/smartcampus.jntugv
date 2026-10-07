import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import api from '../services/api';
import { toast } from 'react-toastify';
import {
  FaFileCsv,
  FaStar,
  FaBuilding,
  FaDownload,
} from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

export const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await adminService.getReports();
      setData(res);
    } catch {
      toast.error('Failed to load system reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownloadCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/reports', {
        params: { format: 'csv' },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'institutional_complaints_audit.csv');
      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Audit CSV report downloaded successfully.');
    } catch {
      toast.error('Failed to generate CSV export.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Institutional Operations & Audit Reports"
          subtitle="Loading statistical telemetry..."
        />
        <div className="p-16 flex justify-center">
          <Spinner text="Compiling analytical summaries..." />
        </div>
      </div>
    );
  }

  const deptRatings = data?.department_ratings || {};
  const statusSummary = data?.status_summary || data?.status_distribution || {};
  const avgRating = Number(data?.average_rating ?? data?.average_feedback_rating ?? 0).toFixed(1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institutional operations & audit reports"
        subtitle="Analytical aggregates of issue volume, departmental service performance, and quality feedback audits."
        action={
          <Button
            onClick={handleDownloadCSV}
            loading={exporting}
            variant="outlined"
            icon={<FaDownload className="text-xs" />}
          >
            Export audit CSV
          </Button>
        }
      />

      {/* TICKET STATUS DISTRIBUTION METRICS */}
      <div>
        <div className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-3">
          Lifecycle volume breakdown
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {Object.entries(statusSummary).map(([status, count]) => (
            <div
              key={status}
              className="p-4 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-card space-y-1 transition-all"
            >
              <div className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] capitalize">
                {status.toLowerCase()}
              </div>
              <div className="text-3xl font-normal text-[var(--md-sys-color-on-surface)]">
                {count}
              </div>
              <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">Total logged</div>
            </div>
          ))}
        </div>
      </div>

      {/* RATING SCORE & FEEDBACK SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Overall Rating Score Card */}
        <Card title="Student quality assessment" subtitle="Weighted average score across resolved tickets">
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <span className="text-5xl font-normal text-[var(--md-sys-color-on-surface)]">
              {avgRating}
              <span className="text-xl font-normal text-[var(--md-sys-color-on-surface-variant)] font-sans"> / 5.0</span>
            </span>

            <div className="flex gap-1 text-[#F29900] text-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  className={star <= Math.round(Number(avgRating)) ? 'text-[#F29900]' : 'text-[var(--md-sys-color-outline-variant)]'}
                />
              ))}
            </div>

            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] text-center max-w-xs leading-relaxed">
              Based on verified student feedback submitted upon resolution confirmation.
            </p>
          </div>
        </Card>

        {/* Department Feedback Ratings */}
        <Card
          title="Satisfaction by operational division"
          subtitle="Direct performance ratings per servicing department"
        >
          {Object.keys(deptRatings).length === 0 ? (
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic text-center py-8">
              No rating submissions recorded for departments yet.
            </p>
          ) : (
            <div className="divide-y divide-[var(--md-sys-color-outline-variant)]">
              {Object.entries(deptRatings).map(([dept, val]) => (
                <div key={dept} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FaBuilding className="text-[var(--md-sys-color-primary)] text-xs" />
                    <span className="font-medium text-[var(--md-sys-color-on-surface)]">{dept}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-0.5 text-[#F29900]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`text-xs ${
                            star <= Math.round(val) ? 'text-[#F29900]' : 'text-[var(--md-sys-color-outline-variant)]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-mono font-medium text-[var(--md-sys-color-on-surface)] w-14 text-right">
                      {Number(val).toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* EXPORT SUMMARY CARD */}
      <Card noPadding className="p-5 bg-[var(--md-sys-color-surface-container)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Official data archival & CSV generation</div>
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
            Download raw database logs formatted for compliance audits, board presentations, and spreadsheets.
          </div>
        </div>
        <Button
          onClick={handleDownloadCSV}
          disabled={exporting}
          variant="filled"
          icon={<FaFileCsv className="text-sm" />}
        >
          {exporting ? 'Exporting...' : 'Download spreadsheet'}
        </Button>
      </Card>
    </div>
  );
};

export default Reports;
