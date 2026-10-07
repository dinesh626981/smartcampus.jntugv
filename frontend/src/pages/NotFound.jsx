import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import Button from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="max-w-md space-y-4">
        <h1 className="text-7xl font-normal text-[var(--md-sys-color-primary)] tracking-tight">
          404
        </h1>
        <h2 className="text-2xl font-medium text-[var(--md-sys-color-on-surface)]">
          Page not found
        </h2>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] leading-relaxed max-w-sm mx-auto">
          The requested institutional resource could not be found or has been relocated to another address.
        </p>
        <div className="pt-4 flex justify-center">
          <Link to="/">
            <Button variant="filled" size="md" icon={<FaHome className="text-sm" />}>
              Return to campus home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
