import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGraduationCap } from 'react-icons/fa';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import DemoAccountsBar from '../components/auth/DemoAccountsBar';

export const Login = () => {
  const { login, googleLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [activeDemoRole, setActiveDemoRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unregisteredError, setUnregisteredError] = useState(null);

  const from = location.state?.from?.pathname || '';

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'student' && user.profile_incomplete) {
        navigate('/complete-profile', { replace: true });
        return;
      }
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === 'true') {
      toast.warning('Your session has expired. Please sign in again.');
    }
  }, [location]);

  const handleFillDemo = (account, mode = 'email') => {
    const chosenVal = mode === 'mobile' ? account.mobile : account.email;
    setIdentifier(chosenVal);
    setPassword(account.password);
    setActiveDemoRole(account.role);
    toast.info(`Filled credentials for ${account.label}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!identifier.trim() || !password) {
      toast.error('Please enter your institutional identifier and password.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    setUnregisteredError(null);
    try {
      const loggedUser = await login(identifier.trim(), password);
      toast.success(`Welcome back, ${loggedUser.name}`);
    } catch (error) {
      const msg = error.response?.data?.message || 'Authentication failed. Please verify credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google authentication did not provide valid credentials.');
      return;
    }
    setGoogleLoading(true);
    setUnregisteredError(null);
    try {
      const loggedUser = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome back, ${loggedUser.name}!`);
    } catch (error) {
      const errData = error.response?.data;
      if (error.response?.status === 404 && (errData?.code === 'ACCOUNT_NOT_REGISTERED' || errData?.email)) {
        const email = errData.email || '';
        const msg = errData.message || 'No account found for this Google email. Please register first with your registration number and department.';
        setUnregisteredError({ email, message: msg });
        toast.error(msg, { autoClose: 6000 });
      } else {
        const msg = errData?.message || 'Google sign-in failed. Please try again.';
        toast.error(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-[var(--md-sys-color-background)] px-4 py-12">

      <div className="max-w-md w-full bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-8 sm:p-10 shadow-xs">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] items-center justify-center mb-4">
            <FaGraduationCap className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-normal leading-8 text-[var(--md-sys-color-on-surface)]">
            Sign in
          </h2>
          <p className="text-base text-[var(--md-sys-color-on-surface-variant)] mt-1">
            to continue to JNTU-GV SmartCampus
          </p>
        </div>

        {unregisteredError && (
          <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <p className="font-medium leading-relaxed">
              {unregisteredError.message}
            </p>
            <div className="flex justify-end pt-1">
              <Button
                variant="tonal"
                size="sm"
                onClick={() => navigate('/register', { state: { email: unregisteredError.email } })}
              >
                Go to Register
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <TextField
            label="Email, phone, or roll number"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
            helperText="Sign in with your email, 10-digit phone, or student roll number"
          />

          <div className="space-y-1">
            <TextField
              label="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <Link
              to="/register"
              className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline"
            >
              Create account
            </Link>

            <Button
              type="submit"
              variant="filled"
              loading={loading}
              className="min-w-[100px]"
            >
              Sign In
            </Button>
          </div>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--md-sys-color-outline-variant)]"></div>
          <span className="text-xs uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium">or</span>
          <div className="h-px flex-1 bg-[var(--md-sys-color-outline-variant)]"></div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {googleLoading ? (
            <div className="flex items-center justify-center gap-2 py-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--md-sys-color-primary)] border-t-transparent"></div>
              <span>Verifying Google account...</span>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google sign-in was cancelled or encountered an issue.')}
                theme="outline"
                size="large"
                shape="pill"
                text="signin_with"
                width="340"
              />
            </div>
          )}
        </div>

        <DemoAccountsBar onSelectAccount={handleFillDemo} activeRole={activeDemoRole} />
      </div>
    </div>
  );
};

export default Login;
