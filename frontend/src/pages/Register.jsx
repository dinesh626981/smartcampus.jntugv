import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaKey } from 'react-icons/fa';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import Select from '../components/ui/Select';
import Tabs from '../components/ui/Tabs';
import PhoneInput from '../components/ui/PhoneInput';
import { DEPARTMENTS } from '../constants';

const REG_NO_REGEX = /^[A-Za-z0-9\-\/]{5,20}$/;
const EMAIL_REGEX = /^[\w\.-]+@[\w\.-]+\.\w+$/;

export const Register = ({ defaultRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const initialRole = searchParams.get('role') === 'admin' || defaultRole === 'admin' ? 'admin' : 'student';

  const [role, setRole] = useState(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: location.state?.email || '',
    phone: '',
    registrationNumber: '',
    department: '',
    departmentId: '',
    password: '',
    confirmPassword: '',
    adminCode: '',
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
      toast.info(`Pre-filled email from Google: ${location.state.email}`);
    }
  }, [location.state]);

  useEffect(() => {
    const roleParam = new URLSearchParams(location.search).get('role');
    if (roleParam === 'admin' || defaultRole === 'admin') {
      setRole('admin');
    }
  }, [location.search, defaultRole]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await authService.getDepartments();
        if (Array.isArray(data) && data.length > 0) {
          setDepartments(data);
        } else {
          setDepartments(DEPARTMENTS.map((name, i) => ({ id: i + 1, department_name: name })));
        }
      } catch {
        setDepartments(DEPARTMENTS.map((name, i) => ({ id: i + 1, department_name: name })));
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'departmentId') {
      const selected = departments.find((d) => String(d.id) === String(value));
      setFormData((prev) => ({
        ...prev,
        departmentId: value,
        department: selected ? selected.department_name : '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, password, confirmPassword, adminCode, departmentId, department } = formData;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (role === 'student') {
      const cleanReg = formData.registrationNumber.trim().toUpperCase();
      if (!cleanReg) {
        toast.error('Registration number is required for students.');
        return;
      }
      if (!REG_NO_REGEX.test(cleanReg)) {
        toast.error('Registration number must be 5-20 alphanumeric characters (hyphens and slashes allowed).');
        return;
      }
      if (!departmentId && !department) {
        toast.error('Please select your academic department.');
        return;
      }
    }

    if (role === 'admin' && !adminCode.trim()) {
      toast.error('Administrator security key is required.');
      return;
    }

    if (!EMAIL_REGEX.test(email)) {
      toast.error('Please supply a valid institutional email address.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must contain at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim(),
        role,
        admin_key: adminCode.trim(),
        registration_number: formData.registrationNumber.trim().toUpperCase(),
        department_id: departmentId ? Number(departmentId) : undefined,
        department: department || undefined,
      });

      toast.success(
        role === 'admin'
          ? 'Administrator account created successfully. Redirecting to sign in...'
          : 'Registration successful. Redirecting to sign in...'
      );
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed. Please verify your details.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleTabs = [
    { id: 'student', label: 'Student account' },
    { id: 'admin', label: 'Administrator account' },
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[var(--md-sys-color-background)] px-4 py-12">

      <div className="max-w-md w-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-8 sm:p-10 shadow-xs">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] items-center justify-center mb-3">
            <FaGraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-normal leading-8 text-[var(--md-sys-color-on-surface)]">
            Create your account
          </h2>
          <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mt-1">
            to access JNTU-GV SmartCampus services
          </p>
        </div>

        <div className="mb-6">
          <Tabs
            tabs={roleTabs}
            activeTab={role}
            onChange={(newRole) => setRole(newRole)}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            label="Full legal name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <TextField
            label="Institutional email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          {role === 'student' && (
            <>
              <TextField
                label="Registration number *"
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                required
                autoComplete="off"
                placeholder="e.g. 21B91A0501"
                helperText="Official university roll / hall ticket number"
              />

              <Select
                label="Department name *"
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: 'Select Department *' },
                  ...departments.map((dept) => ({
                    value: String(dept.id),
                    label: dept.department_name,
                  })),
                ]}
                helperText="Select your enrolled academic discipline"
              />
            </>
          )}

          <PhoneInput
            label="Mobile phone (optional)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          <TextField
            label="Password (min 6 characters)"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          <TextField
            label="Confirm password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          {role === 'admin' && (
            <div className="pt-1">
              <TextField
                label="Administrator security key"
                type="password"
                name="adminCode"
                value={formData.adminCode}
                onChange={handleChange}
                required
                helperText="Master key configured in backend (Default: admin123)"
                leftIcon={<FaKey className="text-xs" />}
              />
            </div>
          )}

          <div className="pt-4 flex items-center justify-between gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline"
            >
              Sign in instead
            </Link>

            <Button
              type="submit"
              variant="filled"
              loading={loading}
              className="min-w-[110px]"
            >
              Register
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
