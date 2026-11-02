import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Loader2, SmilePlus } from 'lucide-react';
import { AttachmentManager } from '../components/AttachmentManager';
import { EmojiPickerModal } from '../components/EmojiPickerModal';
import { AppleEmoji } from '../components/AppleEmoji';
import {
  PRIMARY_MOODS,
  getMoodEmoji,
  getMoodLabel,
} from '../utils/moodEmoji';

export const EntryEditor = ({
  initialEntry = null,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const isEditing = Boolean(initialEntry && initialEntry._id);

  const [title, setTitle] = useState(initialEntry?.title || '');
  const [body, setBody] = useState(initialEntry?.body || '');
  const [mood, setMood] = useState(getMoodEmoji(initialEntry?.mood) || '😊');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState(initialEntry?.attachments || []);
  const [newFiles, setNewFiles] = useState([]);

  const [hasChanges, setHasChanges] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const titleInputRef = useRef(null);
  const bodyTextareaRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      titleInputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    const origTitle = initialEntry?.title || '';
    const origBody = initialEntry?.body || '';
    const origMood = getMoodEmoji(initialEntry?.mood) || '😊';
    const origAttachmentsCount = initialEntry?.attachments?.length || 0;

    const changed =
      title !== origTitle ||
      body !== origBody ||
      mood !== origMood ||
      attachments.length !== origAttachmentsCount ||
      newFiles.length > 0;

    setHasChanges(changed);
  }, [title, body, mood, attachments, newFiles, initialEntry]);

  const handleBodyChange = (e) => {
    setBody(e.target.value);
    if (bodyTextareaRef.current) {
      bodyTextareaRef.current.style.height = 'auto';
      bodyTextareaRef.current.style.height = `${Math.max(400, bodyTextareaRef.current.scrollHeight)}px`;
    }
  };

  const handleSafeExit = () => {
    if (hasChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them and leave?'
      );
      if (!confirmLeave) return;
    }
    onCancel();
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide a title for your diary entry.');
      titleInputRef.current?.focus();
      return;
    }

    if (!body.trim()) {
      setErrorMessage('Please write some content in the diary body.');
      bodyTextareaRef.current?.focus();
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('body', body);
      if (mood) formData.append('mood', mood);

      formData.append('attachments', JSON.stringify(attachments));

      for (const file of newFiles) {
        formData.append('files', file);
      }

      await onSave(formData);
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    }
  };

  const handleAddFiles = (files) => {
    setNewFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveExistingAttachment = (attToRemove) => {
    setAttachments((prev) => prev.filter((a) => a !== attToRemove));
  };

  const handleRemoveNewFile = (fileToRemove) => {
    setNewFiles((prev) => prev.filter((f) => f !== fileToRemove));
  };

  const handleAddLocation = (locAttachment) => {
    setAttachments((prev) => [...prev, locAttachment]);
  };

  const handleAddLink = (linkAttachment) => {
    setAttachments((prev) => [...prev, linkAttachment]);
  };

  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

  const dateDisplay = isEditing && initialEntry?.updatedAt
    ? `${new Date(initialEntry.updatedAt).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })} · Edited`
    : new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="content-container">
      
      <div className="editor-ribbon">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-ghost"
            style={{ padding: '0.4rem 0.65rem' }}
            onClick={handleSafeExit}
            type="button"
          >
            <ArrowLeft size={16} />
            <span>Back to entries</span>
          </button>

          <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>/</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--color-muted)', fontWeight: 500 }}>
            {dateDisplay}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            className="btn btn-secondary"
            onClick={handleSafeExit}
            disabled={isSaving}
            type="button"
          >
            Cancel
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSaving}
            type="button"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>{isEditing ? 'Save changes' : 'Save entry'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="alert-banner error" style={{ marginBottom: '1.25rem' }}>
          <span>{errorMessage}</span>
          <button
            className="btn-icon"
            style={{ width: '22px', height: '22px' }}
            onClick={() => setErrorMessage('')}
            type="button"
          >
            ✕
          </button>
        </div>
      )}

      
      <article className="editor-card">
        
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label
              style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--color-muted)',
              }}
            >
              How are you feeling today?
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
            {PRIMARY_MOODS.map((m) => {
              const isSelected = mood === m.emoji;
              return (
                <button
                  key={m.emoji}
                  type="button"
                  className={`mood-chip ${isSelected ? 'active' : ''}`}
                  onClick={() => setMood(m.emoji)}
                  aria-label={m.label}
                >
                  <AppleEmoji emoji={m.emoji} size={24} />
                </button>
              );
            })}

            
            {mood && !PRIMARY_MOODS.some((p) => p.emoji === mood) && (
              <button
                type="button"
                className="mood-chip active"
                aria-label={getMoodLabel(mood)}
              >
                <AppleEmoji emoji={mood} size={24} />
              </button>
            )}

            <button
              type="button"
              className="mood-chip-btn-more"
              onClick={() => setIsPickerOpen(true)}
              title="Browse all iPhone emojis"
            >
              <SmilePlus size={15} />
              <span>More Emojis</span>
            </button>
          </div>
        </section>

        
        <div>
          <label htmlFor="editor-title" className="sr-only" style={{ display: 'none' }}>
            Entry title
          </label>
          <input
            id="editor-title"
            ref={titleInputRef}
            className="editor-title-input"
            type="text"
            placeholder="Give your entry a title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="editor-divider" />

        
        <div>
          <label htmlFor="editor-body" className="sr-only" style={{ display: 'none' }}>
            Entry body
          </label>
          <textarea
            id="editor-body"
            ref={bodyTextareaRef}
            className="editor-body-textarea"
            placeholder="What's on your mind today? Write freely without distractions..."
            value={body}
            onChange={handleBodyChange}
            spellCheck="true"
          />
        </div>

        
        <AttachmentManager
          attachments={attachments}
          newFiles={newFiles}
          onAddFiles={handleAddFiles}
          onRemoveExistingAttachment={handleRemoveExistingAttachment}
          onRemoveNewFile={handleRemoveNewFile}
          onAddLocation={handleAddLocation}
          onAddLink={handleAddLink}
        />

        
        <footer className="editor-footer">
          <div />
          <div>
            <span>
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>
          </div>
        </footer>
      </article>

      
      <EmojiPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        selectedEmoji={mood}
        onSelectEmoji={(emoji) => setMood(emoji)}
      />
    </div>
  );
};
