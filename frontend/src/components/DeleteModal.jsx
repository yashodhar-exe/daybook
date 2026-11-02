import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

export const DeleteModal = ({
  isOpen,
  entryTitle = 'this entry',
  onConfirm,
  onCancel,
  isDeleting = false,
}) => {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      cancelBtnRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isDeleting) {
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-icon-container danger">
            <Trash2 size={22} />
          </div>
          <div>
            <h2 id="delete-dialog-title" style={{ fontSize: '1.15rem', fontWeight: 600 }}>
              Delete entry?
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-muted)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              This action cannot be undone. <strong style={{ color: 'var(--color-on-surface)' }}>"{entryTitle}"</strong> will be permanently removed from your personal diary.
            </p>
          </div>
        </div>

        <div className="modal-actions">
          <button
            ref={cancelBtnRef}
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isDeleting}
            type="button"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
            type="button"
          >
            {isDeleting ? 'Deleting...' : 'Delete Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};
