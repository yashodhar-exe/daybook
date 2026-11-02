import React from 'react';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Download,
  MapPin,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { getImageUrl, getDownloadUrl } from '../services/api';
import { getMoodEmoji, getMoodLabel } from '../utils/moodEmoji';
import { AppleEmoji } from '../components/AppleEmoji';

export const EntryView = ({
  entry,
  onBack,
  onEdit,
  onDelete,
}) => {
  if (!entry) return null;

  const images = entry.attachments?.filter((a) => a.type === 'image') || [];
  const files = entry.attachments?.filter((a) => a.type === 'file') || [];
  const locations = entry.attachments?.filter((a) => a.type === 'location') || [];
  const links = entry.attachments?.filter((a) => a.type === 'link') || [];

  const wordCount = (entry.body || '').trim().split(/\s+/).filter(Boolean).length;

  const createdDate = new Date(entry.createdAt || entry.updatedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const createdTime = new Date(entry.createdAt || entry.updatedAt).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const isUpdated = entry.updatedAt && entry.createdAt &&
    new Date(entry.updatedAt).getTime() - new Date(entry.createdAt).getTime() > 60000;

  const updatedDisplay = isUpdated
    ? new Date(entry.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="content-container">
      
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className="btn btn-ghost"
          style={{ padding: '0.4rem 0.65rem' }}
          onClick={onBack}
          type="button"
        >
          <ArrowLeft size={16} />
          <span>Back to entries</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => onEdit(entry._id)}
            type="button"
          >
            <Edit size={15} />
            <span>Edit entry</span>
          </button>

          <button
            className="btn btn-danger-ghost"
            style={{ padding: '0.5rem 0.75rem' }}
            title="Delete entry"
            onClick={() => onDelete(entry)}
            type="button"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      
      <article className="editor-card" style={{ gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-muted)', fontSize: '0.84rem' }}>
            <Calendar size={15} />
            <time>{createdDate} · {createdTime}</time>
          </div>

          {entry.mood && (
            <span
              className="mood-badge"
              aria-label={`Mood: ${getMoodLabel(entry.mood)}`}
            >
              <AppleEmoji emoji={entry.mood} size={26} />
            </span>
          )}
        </div>

        
        <h1 style={{ fontSize: '2.1rem', fontWeight: 600, letterSpacing: '-0.025em', lineHeight: 1.25, color: 'var(--color-on-surface)' }}>
          {entry.title}
        </h1>

        
        {images.length > 0 && (
          <div className="reading-image-gallery">
            {images.map((img, idx) => {
              const fullUrl = getImageUrl(img.filename || img.url);
              return (
                <div key={idx} className="reading-image-item" onClick={() => window.open(fullUrl, '_blank')}>
                  <img src={fullUrl} alt={img.name || 'Journal picture'} />
                </div>
              );
            })}
          </div>
        )}

        
        <div
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '1.08rem',
            lineHeight: 1.8,
            color: 'var(--color-on-surface)',
          }}
        >
          {entry.body}
        </div>

        
        {(locations.length > 0 || links.length > 0 || files.length > 0) && (
          <div className="reading-attachments">
            <div style={{ height: '1px', background: 'var(--color-surface-container)', margin: '0.5rem 0' }} />

            
            {locations.map((loc, idx) => {
              const mapQuery = loc.latitude && loc.longitude
                ? `${loc.latitude},${loc.longitude}`
                : encodeURIComponent(loc.address);
              const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

              return (
                <a
                  key={`loc-${idx}`}
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-card-link"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <MapPin size={18} color="#0284c7" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{loc.address || 'Location'}</div>
                      {loc.latitude && loc.longitude && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>
                          {loc.latitude}, {loc.longitude}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })}

            
            {links.map((link, idx) => (
              <a
                key={`link-${idx}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-card-link"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <ExternalLink size={18} color="#e8470b" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{link.name || link.url}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>{link.url}</div>
                  </div>
                </div>
              </a>
            ))}

            
            {files.map((file, idx) => {
              const downloadUrl = getDownloadUrl(entry._id, file.filename);
              return (
                <div key={`file-${idx}`} className="attachment-card-link" style={{ cursor: 'default' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <FileText size={18} color="#171717" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{file.name}</div>
                      {file.size ? (
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>
                          {(file.size / 1024).toFixed(0)} KB
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <a
                    href={downloadUrl}
                    download={file.name}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <Download size={14} />
                    <span>Download</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}

        
        <footer className="editor-footer" style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={13} />
            <span>
              {updatedDisplay ? `Last edited ${updatedDisplay} · ` : ''}
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
        </footer>
      </article>
    </div>
  );
};
