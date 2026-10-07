import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPlusCircle } from 'react-icons/fa';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { ComplaintTable, ComplaintFilterBar } from '../components/common';
import { useComplaints, useDebounce } from '../hooks';

export const ComplaintHistory = () => {
  const navigate = useNavigate();
  const { complaints, loading, error, refetch } = useComplaints();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        !debouncedSearch ||
        c.title?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        c.location?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        String(c.id).includes(debouncedSearch);

      const matchesStatus = !statusFilter || c.status === statusFilter;
      const matchesCategory = !categoryFilter || c.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [complaints, debouncedSearch, statusFilter, categoryFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCategoryFilter('');
  };

  const handleRowClick = (row) => {
    navigate(`/student/complaints/${row.id}`);
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="My Filed Complaints"
        subtitle="Review real-time technician status, historical progress timelines, and submitted grievances."
        action={
          <Link to="/student/raise-complaint">
            <Button variant="filled" size="md" icon={<FaPlusCircle className="text-xs" />}>
              Raise a complaint
            </Button>
          </Link>
        }
      />

      <Card>
        <div className="p-4 sm:p-6 space-y-6">
          <ComplaintFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            onReset={handleResetFilters}
            showPriority={false}
          />

          <ComplaintTable
            complaints={filteredComplaints}
            loading={loading}
            onRowClick={handleRowClick}
            showStaff={true}
            emptyTitle="No complaints found"
            emptyDescription="You haven't filed any complaints matching these filters."
          />
        </div>
      </Card>
    </div>
  );
};

export default ComplaintHistory;
