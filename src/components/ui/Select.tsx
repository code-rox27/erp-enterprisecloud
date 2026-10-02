import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: readonly SelectOption[];
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { options, label, error, hint, placeholder, id, className, required, style, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? autoId;
  const messageId = `${selectId}-msg`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
      {label && (
        <label htmlFor={selectId} style={{ fontSize: 13, fontWeight: 600, color: '#020817' }}>
          {label}
          {required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
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
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ))}
      </select>
      {(error || hint) && (
        <p id={messageId} style={{ margin: 0, fontSize: 12, color: error ? '#EF4444' : '#64748B' }}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});