import { useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={() => onCancel?.()} role="presentation">
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="icon-btn modal-x" onClick={() => onCancel?.()} aria-label="Close">
          <IconX size={16} />
        </button>
        <h3 id="modal-title">{title}</h3>
        <p className="muted">{body}</p>
        <div className="row" style={{ justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="btn" onClick={() => onCancel?.()} disabled={busy}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}