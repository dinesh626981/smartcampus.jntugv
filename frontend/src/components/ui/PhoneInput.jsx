import { useState, useEffect, useId, forwardRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';

export const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳', maxLength: 10, placeholder: '98765 43210' },
  { code: '+1', country: 'United States', flag: '🇺🇸', maxLength: 10, placeholder: '202 555 0123' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', maxLength: 10, placeholder: '7911 123456' },
  { code: '+971', country: 'United Arab Emirates', flag: '🇦🇪', maxLength: 9, placeholder: '50 123 4567' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', maxLength: 8, placeholder: '8123 4567' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', maxLength: 9, placeholder: '412 345 678' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', maxLength: 11, placeholder: '151 23456789' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', maxLength: 10, placeholder: '416 555 0123' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', maxLength: 10, placeholder: '12 345 6789' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', maxLength: 9, placeholder: '50 123 4567' },
];

/**
 * Material 3 Outlined Phone Input with Separated Country Code Dropdown (Fixed default: +91 India)
 */
const PhoneInput = forwardRef(({
  label = 'Mobile phone (optional)',
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  disabled = false,
  required = false,
  name = 'phone',
  id: customId,
  className = '',
}, ref) => {
  const generatedId = useId();
  const inputId = customId || name || generatedId;

  // Split incoming value into country code and raw digits
  const parsePhoneValue = (val) => {
    if (!val) return { code: '+91', digits: '' };
    const str = String(val).trim();
    // Check if starts with a known country code
    for (const c of COUNTRY_CODES) {
      if (str.startsWith(c.code)) {
        return { code: c.code, digits: str.slice(c.code.length).replace(/\D/g, '') };
      }
    }
    // If starts with + but unknown, or purely digits
    if (str.startsWith('+')) {
      const match = str.match(/^(\+\d{1,4})(.*)$/);
      if (match) {
        return { code: match[1], digits: match[2].replace(/\D/g, '') };
      }
    }
    return { code: '+91', digits: str.replace(/\D/g, '') };
  };

  const initial = parsePhoneValue(value);
  const [selectedCode, setSelectedCode] = useState(initial.code || '+91');
  const [digits, setDigits] = useState(initial.digits || '');
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal digits when external value changes
  useEffect(() => {
    const parsed = parsePhoneValue(value);
    setSelectedCode(parsed.code || '+91');
    setDigits(parsed.digits || '');
  }, [value]);

  const activeCountry = COUNTRY_CODES.find((c) => c.code === selectedCode) || COUNTRY_CODES[0];

  const emitChange = (newCode, newDigits) => {
    const combined = newDigits ? `${newCode}${newDigits}` : '';
    if (onChange) {
      onChange({
        target: {
          name,
          value: combined,
          countryCode: newCode,
          digits: newDigits,
        },
      });
    }
  };

  const handleCountryChange = (e) => {
    const nextCode = e.target.value;
    setSelectedCode(nextCode);
    emitChange(nextCode, digits);
  };

  const handleDigitsChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    // If user pastes with leading 0 or +91
    if (selectedCode === '+91' && raw.length === 12 && raw.startsWith('91')) {
      raw = raw.slice(2);
    } else if (raw.length === 11 && raw.startsWith('0')) {
      raw = raw.slice(1);
    }

    const maxLen = activeCountry.maxLength || 10;
    const trimmed = raw.slice(0, maxLen);
    setDigits(trimmed);
    emitChange(selectedCode, trimmed);
  };

  const isFloated = isFocused || Boolean(digits) || Boolean(activeCountry.placeholder);

  return (
    <div className={`w-full flex flex-col ${className}`}>
      <div className="flex gap-2 items-start w-full">
        {/* Country Code Selector (Fixed default +91 India) */}
        <div className="relative w-28 shrink-0">
          <select
            value={selectedCode}
            onChange={handleCountryChange}
            disabled={disabled}
            aria-label="Country Code"
            className={`
              w-full h-14 bg-transparent text-[var(--md-sys-color-on-surface)]
              text-sm font-medium rounded-input
              pl-3 pr-8 appearance-none
              border transition-all duration-150 outline-none
              ${disabled ? 'opacity-38 cursor-not-allowed bg-neutral-100/50' : 'cursor-pointer'}
              border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)]
              focus:border-2 focus:border-[var(--md-sys-color-primary)]
            `}
          >
            {COUNTRY_CODES.map((item) => (
              <option
                key={`${item.code}-${item.country}`}
                value={item.code}
                className="bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] py-1"
              >
                {item.flag} {item.code}
              </option>
            ))}
          </select>

          {/* Floating Label for Country Code */}
          <span className="absolute pointer-events-none select-none bg-[var(--md-sys-color-surface)] px-1 left-2.5 -top-2 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] z-10">
            Code
          </span>

          {/* Dropdown Chevron */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
            <FaChevronDown className="h-3 w-3" />
          </div>
        </div>

        {/* Mobile Number Input */}
        <div className="relative flex-1">
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="tel"
            inputMode="numeric"
            value={digits}
            onChange={handleDigitsChange}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              if (onBlur) onBlur(e);
            }}
            disabled={disabled}
            required={required}
            maxLength={activeCountry.maxLength || 10}
            placeholder={isFocused ? activeCountry.placeholder : ''}
            className={`
              w-full h-14 bg-transparent text-[var(--md-sys-color-on-surface)]
              text-base font-normal rounded-input
              px-4
              border transition-all duration-150 outline-none
              ${error
                ? 'border-2 border-[var(--md-sys-color-error)]'
                : isFocused
                  ? 'border-2 border-[var(--md-sys-color-primary)] ring-0'
                  : 'border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)]'
              }
              ${disabled ? 'opacity-38 cursor-not-allowed bg-neutral-100/50' : ''}
            `}
          />

          {/* Floating Label */}
          {label && (
            <label
              htmlFor={inputId}
              className={`
                absolute pointer-events-none transition-all duration-150 select-none
                bg-[var(--md-sys-color-surface)] px-1 left-3
                ${isFloated
                  ? '-top-2 text-xs font-medium z-10'
                  : 'top-1/2 -translate-y-1/2 text-base font-normal'
                }
                ${error
                  ? 'text-[var(--md-sys-color-error)]'
                  : isFocused
                    ? 'text-[var(--md-sys-color-primary)] font-medium'
                    : 'text-[var(--md-sys-color-on-surface-variant)]'
                }
                ${disabled ? 'opacity-38' : ''}
              `}
            >
              {label}
              {required && <span className="text-[var(--md-sys-color-error)] ml-0.5">*</span>}
            </label>
          )}
        </div>
      </div>

      {/* Helper Text / Error / Counter */}
      <div className="flex justify-between items-center px-4 pt-1 text-xs">
        <span className={error ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}>
          {error || helperText || (selectedCode === '+91' ? '10-digit mobile number' : `Valid for ${activeCountry.country}`)}
        </span>
        {digits && (
          <span className="text-[var(--md-sys-color-on-surface-variant)] text-xs font-mono ml-auto">
            {digits.length}/{activeCountry.maxLength || 10}
          </span>
        )}
      </div>
    </div>
  );
});

PhoneInput.displayName = 'PhoneInput';

export default PhoneInput;
