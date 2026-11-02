import React, { useState, useEffect, useRef } from 'react';
import { MoreHorizontal, Edit, Trash2, Image, Paperclip, MapPin, Link } from 'lucide-react';
import { getMoodEmoji, getMoodLabel } from '../utils/moodEmoji';
import { AppleEmoji } from './AppleEmoji';

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today - entryDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

export const EntryCard = ({ entry, onSelect, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [menuOpen]);

  const imagesCount = entry.attachments?.filter((a) => a.type === 'image').length || 0;
  const filesCount = entry.attachments?.filter((a) => a.type === 'file').length || 0;
  const locationCount = entry.attachments?.filter((a) => a.type === 'location').length || 0;
  const linksCount = entry.attachments?.filter((a) => a.type === 'link').length || 0;

  const wordCount = (entry.body || '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <article
      className="entry-card"
      onClick={() => onSelect(entry._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(entry._id)}
    >
      <div className="entry-card-header">
        <span className="entry-date">{formatDisplayDate(entry.createdAt || entry.updatedAt)}</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {entry.mood && (
            <span
              className="mood-badge"
              aria-label={`Mood: ${getMoodLabel(entry.mood)}`}
            >
              <AppleEmoji emoji={entry.mood} size={20} />
            </span>
          )}

          <div
            className="card-menu-container"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-icon"
              title="Options"
              aria-label="Entry options"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
            >
              <MoreHorizontal size={18} />
            </button>

            {menuOpen && (
              <div className="dropdown-menu">
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(entry._id);
                  }}
                  type="button"
                >
                  <Edit size={14} />
                  <span>Edit</span>
                </button>
                <button
                  className="dropdown-item danger"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(entry);
                  }}
                  type="button"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <h2 className="entry-title">{entry.title}</h2>
      <p className="entry-preview">{entry.body}</p>

      <div className="entry-card-footer">
        <div className="attachment-indicators">
          {imagesCount > 0 && (
            <span className="attachment-badge">
              <Image size={13} color="#ff5a1f" />
              <span>{imagesCount}</span>
            </span>
          )}
          {filesCount > 0 && (
            <span className="attachment-badge">
              <Paperclip size={13} color="#171717" />
              <span>{filesCount}</span>
            </span>
          )}
          {locationCount > 0 && (
            <span className="attachment-badge">
              <MapPin size={13} color="#0284c7" />
            </span>
          )}
          {linksCount > 0 && (
            <span className="attachment-badge">
              <Link size={13} color="#e8470b" />
            </span>
          )}
        </div>

        <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>
          {wordCount} {wordCount === 1 ? 'word' : 'words'}
        </span>
      </div>
    </article>
  );
};
