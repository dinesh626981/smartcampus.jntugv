import React from 'react';

export const Spinner = ({ size = 'md', className = '', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-3',
  };

  const spinnerElement = (
    <div
      className={`inline-block animate-spin rounded-full border-primary-600 border-t-transparent ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F7F8FA]">
        {spinnerElement}
      </div>
    );
  }

  return spinnerElement;
};

export default Spinner;
