/**
 * TOTP Input Component
 * Story 1.4: Authentication - Multi-Factor Auth
 *
 * Specialized input for 6-digit TOTP codes with auto-focus and formatting.
 */

'use client';

import { forwardRef, useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TotpInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onComplete?: (code: string) => void;
  autoFocus?: boolean;
}

export const TotpInput = forwardRef<HTMLInputElement, TotpInputProps>(
  ({ className, onComplete, autoFocus = true, value, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
    const [focused, setFocused] = useState(false);

    // Auto-focus on mount
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus, inputRef]);

    // Handle input change - only digits, max 6
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const digitsOnly = rawValue.replace(/\D/g, '').slice(0, 6);

      // Call original onChange if provided
      if (onChange) {
        onChange({
          ...e,
          target: {
            ...e.target,
            value: digitsOnly,
          },
        });
      }

      // Trigger onComplete when 6 digits entered
      if (digitsOnly.length === 6 && onComplete) {
        onComplete(digitsOnly);
      }
    };

    // Handle paste event
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const digitsOnly = pastedData.replace(/\D/g, '').slice(0, 6);

      if (onChange && inputRef.current) {
        // Create a synthetic event that mimics a change event
        const syntheticEvent = {
          target: {
            ...inputRef.current,
            value: digitsOnly,
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }

      if (digitsOnly.length === 6 && onComplete) {
        onComplete(digitsOnly);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          className={cn(
            'text-center text-2xl tracking-[0.5em] font-mono',
            focused && 'ring-2 ring-primary',
            className
          )}
          value={value}
          onChange={handleChange}
          onPaste={handlePaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </div>
    );
  }
);

TotpInput.displayName = 'TotpInput';

export default TotpInput;
