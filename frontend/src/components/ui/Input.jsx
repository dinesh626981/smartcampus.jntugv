import { forwardRef } from 'react';
import TextField from './TextField';

/**
 * Material 3 Input component (forwards to TextField with floating label)
 */
const Input = forwardRef(({ hint, helperText, ...props }, ref) => {
  return (
    <TextField
      ref={ref}
      helperText={helperText || hint}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
