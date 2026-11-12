import React, { useEffect, useRef } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  /** accessible name; defaults to a string title */
  ariaLabel?: string;
  wide?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessible modal: role=dialog, Esc to close, backdrop click to close, focus moves in and is
 * restored on close, Tab is kept inside the dialog, and page scroll is locked while open.
 */
export const Dialog: React.FC<DialogProps> = ({ open, onClose, title, ariaLabel, wide, footer, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  // keep the latest onClose without re-running the open/close effect on every render
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="rg-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCloseRef.current();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === 'string' ? title : undefined)}
        tabIndex={-1}
        className={`rg-dialog ${wide ? 'rg-dialog--wide' : ''}`.trim()}
      >
        <div className="rg-dialog__head">
          <h2>{title}</h2>
          <button type="button" className="rg-btn rg-btn--ghost rg-btn--sm" onClick={() => onCloseRef.current()} aria-label="Tutup">
            ✕
          </button>
        </div>
        <div className="rg-dialog__body">{children}</div>
        {footer ? <div className="rg-dialog__foot">{footer}</div> : null}
      </div>
    </div>
  );
};
