import React from 'react';
import PropTypes from 'prop-types';
import { GoogleLogin } from '@react-oauth/google';
import { FaGoogle } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { toast } from 'react-toastify';

/**
 * Card section for managing 1-click Google authentication linkage.
 */
export const GoogleAccountLinkSection = ({
  isLinked,
  onLinkGoogle,
  onUnlinkGoogle,
  loading,
}) => {
  return (
    <Card
      title="Connected services & Google Sign-In"
      subtitle="Manage your connected Google Identity for 1-click authentication"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-800 border border-[var(--md-sys-color-outline-variant)] flex items-center justify-center text-red-500 shadow-2xs shrink-0">
            <FaGoogle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
              Google Identity Services
            </p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
              {isLinked
                ? 'Your account is linked with Google for fast 1-click sign-in.'
                : 'Connect a Google account to allow 1-click sign-in using Google.'}
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {isLinked ? (
            <Button
              variant="outlined"
              size="sm"
              onClick={onUnlinkGoogle}
              loading={loading}
            >
              Unlink Google account
            </Button>
          ) : (
            <GoogleLogin
              onSuccess={onLinkGoogle}
              onError={() => toast.error('Google authorization failed.')}
              shape="circle"
              text="continue_with"
              size="medium"
            />
          )}
        </div>
      </div>
    </Card>
  );
};

GoogleAccountLinkSection.propTypes = {
  isLinked: PropTypes.bool,
  onLinkGoogle: PropTypes.func.isRequired,
  onUnlinkGoogle: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default GoogleAccountLinkSection;
