import { useState, useEffect } from 'react';

/**
 * Debounce a value by the specified delay in milliseconds.
 * Useful for typeahead search and filter inputs.
 */
export const useDebounce = (value, delayMs = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
};

export default useDebounce;
