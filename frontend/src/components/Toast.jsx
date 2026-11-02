import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (isClosing) {
      const closeTimer = setTimeout(() => {
        if (onClose) onClose();
      }, 260);
      return () => clearTimeout(closeTimer);
    }
  }, [isClosing, onClose]);

  const handleClose = () => {
    setIsClosing(true);
  };

  const getIcon = () => {
    if (type === 'error') {
      return <AlertCircle size={15} color="#ef4444" strokeWidth={2.2} />;
    }
    if (type === 'info') {
      return <Info size={15} color="#3b82f6" strokeWidth={2.2} />;
    }
    return <CheckCircle2 size={15} color="#22c55e" strokeWidth={2.2} />;
  };

  return (
    <div
      className={`toast-pill ${isClosing ? 'toast-pill-exit' : 'toast-pill-enter'}`}
      role="alert"
    >
      <span className="toast-pill-icon">{getIcon()}</span>
      <span className="toast-pill-text">{message}</span>
      <button
        type="button"
        className="toast-pill-close"
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
};
