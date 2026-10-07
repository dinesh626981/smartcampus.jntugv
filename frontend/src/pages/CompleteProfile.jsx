import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaCheckCircle } from 'react-icons/fa';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import Select from '../components/ui/Select';
import { DEPARTMENTS } from '../constants';

export const CompleteProfile = () => {
  const { user, completeAcademicProfile } = useAuth();
  const navigate = useNavigate();

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If not a student or profile is already complete, redirect to dashboard
    if (user && (user.role !== 'student' || !user.profile_incomplete)) {
      navigate('/student/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await authService.getDepartments();
        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data);
        } else {
          setDepartments(DEPARTMENTS.map((name, i) => ({ id: i + 1, department_name: name })));
        }
      } catch (err) {
        setDepartments(DEPARTMENTS.map((name, i) => ({ id: i + 1, department_name: name })));
      }
    };
    fetchDepartments();
  }, []);

  const REG_NO_REGEX = /^[A-Za-z0-9\-\/]{5,20}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanReg = registrationNumber.trim().toUpperCase();

    if (!cleanReg) {
      toast.error('Registration number is required.');
      return;
    }

    if (!REG_NO_REGEX.test(cleanReg)) {
      toast.error('Registration number must be 5-20 alphanumeric characters (hyphens and slashes allowed).');
      return;
    }

    if (!departmentId) {
      toast.error('Please select your academic department.');
      return;
    }

    setLoading(true);
    try {
      await completeAcademicProfile({
        registration_number: cleanReg,
        department_id: Number(departmentId),
      });
      toast.success('Academic profile completed successfully! Redirecting...');
      setTimeout(() => {
        navigate('/student/dashboard', { replace: true });
      }, 1000);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to complete profile. Please verify your details.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[var(--md-sys-color-background)] px-4 py-12">

      <div className="max-w-md w-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-8 sm:p-10 shadow-xs">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] items-center justify-center mb-3">
            <FaGraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-normal leading-8 text-[var(--md-sys-color-on-surface)]">
            Complete your profile
          </h2>
          <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1.5 leading-relaxed">
            Institutional policy requires all enrolled students to link their official registration number and academic department.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <TextField
            label="Registration number *"
            type="text"
            name="registrationNumber"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
            autoComplete="off"
            placeholder="e.g. 21B91A0501"
            helperText="5-20 characters official university roll / hall ticket number"
          />

          <Select
            label="Department name *"
            name="departmentId"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            required
            options={[
              { value: '', label: 'Select your department *' },
              ...departments.map((dept) => ({
                value: String(dept.id),
                label: dept.department_name,
              })),
            ]}
            helperText="Enrolled academic engineering or science department"
          />

          <div className="pt-2">
            <Button
              type="submit"
              variant="filled"
              loading={loading}
              className="w-full"
              icon={<FaCheckCircle className="text-xs" />}
            >
              Complete profile & continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
