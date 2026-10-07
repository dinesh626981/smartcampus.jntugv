import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaKey, FaArrowLeft } from 'react-icons/fa';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email.trim());
      setSuccess(true);
      toast.success('Temporary password generated and dispatched.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Password reset request failed. Please verify credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[var(--md-sys-color-background)] px-4 py-12">

      {/* Centered Google Style Recovery Card */}
      <div className="max-w-md w-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-8 sm:p-10 shadow-xs">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] items-center justify-center mb-4">
            <FaGraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-normal leading-8 text-[var(--md-sys-color-on-surface)]">
            Account recovery
          </h2>
          <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mt-1">
            Recover your JNTU-GV SmartCampus account
          </p>
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]">
              <FaKey className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">
                Reset instructions issued
              </h3>
              <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-2 leading-relaxed">
                If the provided identifier matches an active account, temporary credentials have been generated. Check backend server console in development.
              </p>
            </div>
            <Link to="/login" className="block pt-2">
              <Button variant="filled" className="w-full">
                Return to sign in
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextField
              label="Email or registered phone"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              helperText="Enter the email address or phone associated with your account"
            />

            <div className="pt-2 flex items-center justify-between gap-3">
              <Link to="/login">
                <Button variant="text">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                variant="filled"
                loading={loading}
                className="min-w-[100px]"
              >
                Next
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
