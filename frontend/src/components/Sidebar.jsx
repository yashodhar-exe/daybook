import React from 'react';

export const Sidebar = ({ onNavigate }) => {
  return (
    <aside className="app-sidebar" aria-label="Brand">
      <div
        className="sidebar-brand"
        onClick={() => onNavigate && onNavigate('home')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onNavigate && onNavigate('home')}
      >
        <img
          src="/daybook-logo.svg"
          alt="Daybook Logo"
          style={{ width: '32px', height: '32px' }}
        />
        <span className="brand-title">Daybook</span>
      </div>
    </aside>
  );
};
