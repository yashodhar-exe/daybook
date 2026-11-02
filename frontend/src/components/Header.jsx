import React from 'react';
import { Plus } from 'lucide-react';

export const Header = ({ onNavigate }) => {
  return (
    <header className="mobile-header">
      <div
        className="sidebar-brand"
        onClick={() => onNavigate('home')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
      >
        <img
          src="/daybook-logo.svg"
          alt="Daybook Logo"
          style={{ width: '28px', height: '28px' }}
        />
        <span className="brand-title" style={{ fontSize: '1.2rem' }}>
          Daybook
        </span>
      </div>

      <button
        className="btn btn-primary"
        style={{ padding: '0.4rem 0.9rem', fontSize: '0.82rem' }}
        onClick={() => onNavigate('new')}
        type="button"
      >
        <Plus size={16} />
        <span>New</span>
      </button>
    </header>
  );
};
