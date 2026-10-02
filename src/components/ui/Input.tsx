import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, required, style, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-msg`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 600, color: '#020817' }}>
          {label}
          {required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        style={{
          width: '100%',
          height: 40,
          borderRadius: 10,
          border: `1px solid ${error ? '#EF4444' : '#E2E8F0'}`,
          background: '#FFFFFF',
          padding: '0 12px',
          fontSize: 14,
          color: '#020817',
          boxSizing: 'border-box',
          outline: 'none',
          ...style,
        }}
        className={className}
        {...rest}
      />
      {(error || hint) && (
        <p id={messageId} style={{ margin: 0, fontSize: 12, color: error ? '#EF4444' : '#64748B' }}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});