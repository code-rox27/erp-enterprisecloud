import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: DialogSize;
  closeOnOverlayClick?: boolean;
}

const SIZES: Record<DialogSize, { width: string; maxWidth: string }> = {
  sm: { width: '100%', maxWidth: '420px' },
  md: { width: '100%', maxWidth: '560px' },
  lg: { width: '100%', maxWidth: '760px' },
  xl: { width: '100%', maxWidth: '980px' },
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
}: DialogProps) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const previousFocus = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  const modalSize = SIZES[size];

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, background: 'rgba(2, 8, 23, 0.52)' }}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        style={{
          position: 'relative',
          width: modalSize.width,
          maxWidth: modalSize.maxWidth,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '18px',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, borderBottom: '1px solid #E2E8F0', padding: '20px 24px 16px' }}>
          <div>
            <h2 id={titleId} style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#020817' }}>{title}</h2>
            {description && <p id={descId} style={{ margin: '6px 0 0', fontSize: '0.88rem', color: '#64748B' }}>{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{ border: '1px solid #E2E8F0', background: '#FFFFFF', color: '#64748B', borderRadius: 8, width: 32, height: 32, cursor: 'pointer' }}
          >
            ✕
          </button>
        </header>

        <div style={{ overflowY: 'auto', padding: '20px 24px' }}>{children}</div>

        {footer && (
          <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #E2E8F0', padding: '16px 24px 20px' }}>
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}