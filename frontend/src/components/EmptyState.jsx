import React from 'react';
import { BookOpen, SearchX, Plus, RefreshCw } from 'lucide-react';

export const EmptyState = ({ type = 'initial', onAction, query = '' }) => {
  if (type === 'search') {
    return (
      <div className="empty-state-card">
        <div className="empty-icon-bubble" style={{ background: 'var(--color-surface-container)', color: 'var(--color-muted)' }}>
          <SearchX size={26} />
        </div>
        <h3 className="empty-state-title">No entries match your search</h3>
        <button
          className="btn btn-secondary"
          style={{ marginTop: '0.75rem' }}
          onClick={onAction}
          type="button"
        >
          <RefreshCw size={15} />
          <span>Reset search & filters</span>
        </button>
      </div>
    );
  }

  return (
    <div className="empty-state-card">
      <div className="empty-icon-bubble">
        <BookOpen size={26} />
      </div>
      <h3 className="empty-state-title">Your story starts here</h3>
      <p className="empty-state-desc">
        Make a little space for your thoughts. Unwind, document quiet moments, or reflect on your day.
      </p>
      <button
        className="btn btn-accent"
        style={{ marginTop: '0.75rem', padding: '0.65rem 1.4rem' }}
        onClick={onAction}
        type="button"
      >
        <Plus size={18} />
        <span>Write your first entry</span>
      </button>
    </div>
  );
};
