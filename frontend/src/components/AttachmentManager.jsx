import React, { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Paperclip,
  MapPin,
  Link as LinkIcon,
  X,
  ExternalLink,
  FileText,
  Navigation,
} from 'lucide-react';
import { getImageUrl } from '../services/api';

export const AttachmentManager = ({
  attachments = [],
  newFiles = [],
  onAddFiles,
  onRemoveExistingAttachment,
  onRemoveNewFile,
  onAddLocation,
  onAddLink,
}) => {
  const [activeDialog, setActiveDialog] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState('');
  const [locationLng, setLocationLng] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkError, setLinkError] = useState('');

  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const valid = [];
    for (const file of selected) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" exceeds the 10 MB limit.`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length > 0) {
      onAddFiles(valid);
    }
    e.target.value = '';
  };

  const handleDocChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const valid = [];
    for (const file of selected) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" exceeds the 10 MB limit.`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length > 0) {
      onAddFiles(valid);
    }
    e.target.value = '';
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        setLocationLat(lat);
        setLocationLng(lng);
        if (!locationName) {
          setLocationName(`Coordinates (${lat}, ${lng})`);
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationError(`Location request failed (${err.message}). You can type the address manually.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSaveLocation = (e) => {
    e.preventDefault();
    if (!locationName.trim() && !locationLat) {
      setLocationError('Please enter a place name, address, or coordinates.');
      return;
    }

    onAddLocation({
      type: 'location',
      address: locationName.trim(),
      latitude: locationLat ? parseFloat(locationLat) : null,
      longitude: locationLng ? parseFloat(locationLng) : null,
    });

    setLocationName('');
    setLocationLat('');
    setLocationLng('');
    setLocationError('');
    setActiveDialog(null);
  };

  const handleSaveLink = (e) => {
    e.preventDefault();
    let url = linkUrl.trim();
    if (!url) {
      setLinkError('URL is required.');
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    try {
      new URL(url);
    } catch {
      setLinkError('Please enter a valid website address.');
      return;
    }

    onAddLink({
      type: 'link',
      url,
      name: linkTitle.trim() || url,
    });

    setLinkUrl('');
    setLinkTitle('');
    setLinkError('');
    setActiveDialog(null);
  };

  const existingImages = attachments.filter((a) => a.type === 'image');
  const existingOthers = attachments.filter((a) => a.type !== 'image');

  const newImages = newFiles.filter((f) => f.type.startsWith('image/'));
  const newOthers = newFiles.filter((f) => !f.type.startsWith('image/'));

  return (
    <div className="attachments-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-on-surface)' }}>
          Attachments
        </span>
        <span style={{ fontSize: '0.74rem', color: 'var(--color-muted)' }}>
          Max 10 MB per file
        </span>
      </div>


      <div className="attachments-toolbar">

        <input
          ref={imageInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx,.md,.csv,.xls,.xlsx,.zip"
          multiple
          style={{ display: 'none' }}
          onChange={handleDocChange}
        />

        <button
          className="btn-attach"
          onClick={() => imageInputRef.current?.click()}
          type="button"
        >
          <ImageIcon size={15} color="#ff5a1f" />
          <span>Add Image</span>
        </button>

        <button
          className="btn-attach"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <Paperclip size={15} color="#171717" />
          <span>Attach File</span>
        </button>

        <button
          className="btn-attach"
          onClick={() => {
            setLocationError('');
            setActiveDialog('location');
          }}
          type="button"
        >
          <MapPin size={15} color="#0284c7" />
          <span>Add Location</span>
        </button>

        <button
          className="btn-attach"
          onClick={() => {
            setLinkError('');
            setActiveDialog('link');
          }}
          type="button"
        >
          <LinkIcon size={15} color="#e8470b" />
          <span>Add Link</span>
        </button>
      </div>


      {(existingImages.length > 0 || newImages.length > 0) && (
        <div className="attachment-gallery">

          {existingImages.map((img, index) => (
            <div key={`existing-img-${index}`} className="gallery-thumb-item">
              <img
                src={getImageUrl(img)}
                alt={img.name || 'Attachment'}
              />
              <button
                className="thumb-remove-btn"
                title="Remove image"
                onClick={() => onRemoveExistingAttachment(img)}
                type="button"
              >
                <X size={13} />
              </button>
            </div>
          ))}


          {newImages.map((file, index) => {
            const previewUrl = URL.createObjectURL(file);
            return (
              <div key={`new-img-${index}`} className="gallery-thumb-item">
                <img src={previewUrl} alt={file.name} />
                <button
                  className="thumb-remove-btn"
                  title="Remove image"
                  onClick={() => onRemoveNewFile(file)}
                  type="button"
                >
                  <X size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}


      {(existingOthers.length > 0 || newOthers.length > 0) && (
        <div className="attachment-items-list">

          {existingOthers.map((att, index) => (
            <div key={`existing-att-${index}`} className="attachment-row-item">
              <div className="attachment-row-left">
                {att.type === 'location' && <MapPin size={16} color="#0284c7" />}
                {att.type === 'link' && <LinkIcon size={16} color="#e8470b" />}
                {att.type === 'file' && <FileText size={16} color="#171717" />}
                <span style={{ fontWeight: 500 }}>
                  {att.type === 'location' ? att.address || 'Saved Location' : att.name || att.url}
                </span>
                {att.size ? (
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.74rem' }}>
                    ({(att.size / 1024).toFixed(0)} KB)
                  </span>
                ) : null}
              </div>
              <button
                className="btn-icon"
                style={{ width: '24px', height: '24px' }}
                title="Remove attachment"
                onClick={() => onRemoveExistingAttachment(att)}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          ))}


          {newOthers.map((file, index) => (
            <div key={`new-doc-${index}`} className="attachment-row-item">
              <div className="attachment-row-left">
                <FileText size={16} color="#171717" />
                <span style={{ fontWeight: 500 }}>{file.name}</span>
                <span style={{ color: 'var(--color-muted)', fontSize: '0.74rem' }}>
                  ({(file.size / 1024).toFixed(0)} KB)
                </span>
              </div>
              <button
                className="btn-icon"
                style={{ width: '24px', height: '24px' }}
                title="Remove file"
                onClick={() => onRemoveNewFile(file)}
                type="button"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}


      {activeDialog === 'location' && (
        <div className="modal-backdrop" onClick={() => setActiveDialog(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-container neutral">
                <MapPin size={22} color="#0284c7" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add Location</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                  Attach a place name or address to this diary entry.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveLocation} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="loc-name">Place Name or Address</label>
                <input
                  id="loc-name"
                  className="form-input"
                  placeholder="e.g. Central Park, New York or Library Lawn"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="loc-lat">Latitude (Optional)</label>
                  <input
                    id="loc-lat"
                    className="form-input"
                    placeholder="e.g. 40.785091"
                    value={locationLat}
                    onChange={(e) => setLocationLat(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="loc-lng">Longitude (Optional)</label>
                  <input
                    id="loc-lng"
                    className="form-input"
                    placeholder="e.g. -73.968285"
                    value={locationLng}
                    onChange={(e) => setLocationLng(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', alignSelf: 'flex-start' }}
                onClick={handleUseMyLocation}
                disabled={isLocating}
              >
                <Navigation size={14} />
                <span>{isLocating ? 'Detecting position...' : 'Use my current location'}</span>
              </button>

              {locationError && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>{locationError}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActiveDialog(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Attach Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {activeDialog === 'link' && (
        <div className="modal-backdrop" onClick={() => setActiveDialog(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon-container neutral">
                <LinkIcon size={22} color="#e8470b" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add Web Link</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-muted)' }}>
                  Attach a website URL or article reference.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveLink} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="link-url">URL</label>
                <input
                  id="link-url"
                  className="form-input"
                  placeholder="https://example.com/article"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="link-title">Label / Title (Optional)</label>
                <input
                  id="link-title"
                  className="form-input"
                  placeholder="e.g. Recommended reading list"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                />
              </div>

              {linkError && (
                <p style={{ color: 'var(--color-error)', fontSize: '0.8rem' }}>{linkError}</p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setActiveDialog(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Attach Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
