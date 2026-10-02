import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS: Record<ButtonVariant, { background: string; color: string; border: string }> = {
  primary: { background: '#2563EB', color: '#FFFFFF', border: '#2563EB' },
  secondary: { background: '#F8FAFC', color: '#020817', border: '#E2E8F0' },
  outline: { background: '#FFFFFF', color: '#020817', border: '#E2E8F0' },
  ghost: { background: 'transparent', color: '#020817', border: 'transparent' },
  destructive: { background: '#EF4444', color: '#FFFFFF', border: '#EF4444' },
};

const SIZES: Record<ButtonSize, { height: number; padding: string; fontSize: string }> = {
  sm: { height: 32, padding: '0 12px', fontSize: '12px' },
  md: { height: 40, padding: '0 16px', fontSize: '14px' },
  lg: { height: 48, padding: '0 20px', fontSize: '15px' },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, className, disabled, type = 'button', children, style, ...rest },
  ref,
) {
  const variantStyle = VARIANTS[variant];
  const sizeStyle = SIZES[size];

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        minHeight: sizeStyle.height,
        padding: sizeStyle.padding,
        borderRadius: 10,
        border: `1px solid ${variantStyle.border}`,
        background: variantStyle.background,
        color: variantStyle.color,
        fontSize: sizeStyle.fontSize,
        fontWeight: 600,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.6 : 1,
        boxShadow: variant === 'primary' ? '0 8px 18px rgba(37, 99, 235, 0.18)' : 'none',
        ...style,
      }}
      className={className}
      {...rest}
    >
      {isLoading ? (
        <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});