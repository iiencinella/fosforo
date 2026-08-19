import { type ReactNode, useEffect, useId, useRef } from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={`overlay-modal${className ? ` ${className}` : ""}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) {
          onClose();
        }
      }}
    >
      <div className="overlay-modal-surface">
        <header className="overlay-modal-header">
          <div className="overlay-modal-heading">
            <h2 className="card-title" id={titleId}>
              {title}
            </h2>
            {description ? <p className="app-desc">{description}</p> : null}
          </div>
          <button
            type="button"
            className="button secondary overlay-modal-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <CloseIcon />
          </button>
        </header>
        <div className="overlay-modal-body">{children}</div>
        {footer ? (
          <footer className="overlay-modal-footer">{footer}</footer>
        ) : null}
      </div>
    </dialog>
  );
}
