import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ALL_IPHONE_EMOJIS } from '../utils/moodEmoji';
import { AppleEmoji } from './AppleEmoji';

export const EmojiPickerModal = ({
  isOpen,
  onClose,
  onSelectEmoji,
  selectedEmoji = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmojis = useMemo(() => {
    if (!searchTerm.trim()) {
      return ALL_IPHONE_EMOJIS;
    }

    const query = searchTerm.trim().toLowerCase();
    return ALL_IPHONE_EMOJIS.filter((item) => {
      return (
        item.name.toLowerCase().includes(query) ||
        item.emoji.includes(query) ||
        (item.subgroup && item.subgroup.toLowerCase().includes(query))
      );
    });
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Emoji Selector"
    >
      <div
        className="modal-card emoji-picker-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          padding: '1.25rem',
        }}
      >
        <div className="search-bar-container" style={{ margin: 0 }}>
          <span className="search-icon-left">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="search-input"
            style={{ height: '40px', fontSize: '0.88rem' }}
            placeholder="Search emotions (e.g. smile, love, laugh, tear, fire"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
              type="button"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div
          className="emoji-grid-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.5rem 0.25rem',
            maxHeight: '360px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {filteredEmojis.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))',
                gap: '0.4rem',
              }}
            >
              {filteredEmojis.map((item) => {
                const isSelected = selectedEmoji === item.emoji;
                return (
                  <button
                    key={item.emoji}
                    type="button"
                    className={`emoji-cell-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      onSelectEmoji(item.emoji);
                      onClose();
                    }}
                  >
                    <AppleEmoji emoji={item.emoji} size={28} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-muted)' }}>
              <p style={{ fontSize: '0.92rem' }}>No matching emoji found for "{searchTerm}"</p>
              <button
                className="btn btn-secondary"
                style={{ marginTop: '0.75rem', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                onClick={() => setSearchTerm('')}
                type="button"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--color-border)',
            flexShrink: 0,
          }}
        >
          <button
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
