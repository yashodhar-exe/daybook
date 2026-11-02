import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Plus, Loader2, SmilePlus } from 'lucide-react';
import { EntryCard } from '../components/EntryCard';
import { EmptyState } from '../components/EmptyState';
import { EmojiPickerModal } from '../components/EmojiPickerModal';
import { AppleEmoji } from '../components/AppleEmoji';
import {
  PRIMARY_MOODS,
  getMoodEmoji,
  getMoodLabel,
  matchesMoodFilter,
} from '../utils/moodEmoji';

export const DiaryHome = ({
  entries = [],
  totalCount = 0,
  isLoading = false,
  error = null,
  searchQuery = '',
  selectedMood = 'All',
  onSearchChange,
  onMoodChange,
  onSelectEntry,
  onEditEntry,
  onDeleteEntry,
  onNewEntry,
  searchRef,
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setLocalQuery(val);

    clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(val);
    }, 300);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    clearTimeout(debounceTimerRef.current);
    onSearchChange('');
  };

  const handleResetAllFilters = () => {
    setLocalQuery('');
    clearTimeout(debounceTimerRef.current);
    onSearchChange('');
    onMoodChange('All');
  };

  const todayString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const isFiltered = Boolean((searchQuery && searchQuery.trim()) || (selectedMood && selectedMood !== 'All'));

  return (
    <div className="content-container">
      
      <header style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.15 }}>
            {isFiltered ? 'Search results' : 'Your diary'}
          </h1>
          <p style={{ fontSize: '0.92rem', color: 'var(--color-muted)', marginTop: '0.35rem' }}>
            {todayString}
          </p>
        </div>

        <button
          className="btn btn-accent"
          onClick={onNewEntry}
          type="button"
        >
          <Plus size={18} />
          <span>Write an entry</span>
        </button>
      </header>

      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.75rem' }}>
        <div className="search-bar-container">
          <span className="search-icon-left">
            <Search size={19} />
          </span>
          <input
            ref={searchRef}
            className="search-input"
            type="text"
            placeholder="Search your entries by title, text or date"
            value={localQuery}
            onChange={handleInputChange}
          />
          {localQuery && (
            <button
              className="clear-search-btn"
              title="Clear search"
              onClick={handleClearSearch}
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        
        <div
          className="no-scrollbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            overflowX: 'auto',
            padding: '0.45rem 0.25rem',
            margin: '-0.45rem -0.25rem',
          }}
        >
          
          <button
            className={`mood-chip all-pill ${selectedMood === 'All' ? 'active' : ''}`}
            onClick={() => onMoodChange('All')}
            type="button"
          >
            <span>All</span>
          </button>

          
          {PRIMARY_MOODS.map((item) => {
            const isSelected = matchesMoodFilter(selectedMood, item.emoji);
            return (
              <button
                key={item.emoji}
                className={`mood-chip ${isSelected ? 'active' : ''}`}
                onClick={() => onMoodChange(isSelected ? 'All' : item.emoji)}
                aria-label={`Filter by ${item.label}`}
                type="button"
              >
                <AppleEmoji emoji={item.emoji} size={22} />
              </button>
            );
          })}

          
          {selectedMood !== 'All' &&
            !PRIMARY_MOODS.some((p) => matchesMoodFilter(selectedMood, p.emoji)) && (
              <button
                className="mood-chip active"
                onClick={() => onMoodChange('All')}
                type="button"
              >
                <AppleEmoji emoji={selectedMood} size={22} />
              </button>
            )}

          
          <button
            className="mood-chip-btn-more"
            onClick={() => setIsEmojiPickerOpen(true)}
            title="Browse all iPhone emojis"
            type="button"
          >
            <SmilePlus size={15} />
            <span>More</span>
          </button>
        </div>
      </div>

      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', padding: '0 0.25rem' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {isFiltered ? 'Matching Entries' : 'Recent Entries'}
        </span>
        <span style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>
          Showing {entries.length} of {totalCount}
        </span>
      </div>

      
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3.5rem', color: 'var(--color-muted)', gap: '0.5rem' }}>
          <Loader2 size={22} className="animate-spin" />
          <span style={{ fontSize: '0.92rem' }}>Loading entries...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="alert-banner error">
          <span>{error}</span>
          <button className="btn btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }} onClick={handleResetAllFilters}>
            Retry
          </button>
        </div>
      )}

      
      {!isLoading && entries.length > 0 && (
        <div className="entries-feed">
          {entries.map((entry) => (
            <EntryCard
              key={entry._id}
              entry={entry}
              onSelect={onSelectEntry}
              onEdit={onEditEntry}
              onDelete={onDeleteEntry}
            />
          ))}
        </div>
      )}

      {!isLoading && entries.length === 0 && !error && (
        <EmptyState
          type={isFiltered ? 'search' : 'initial'}
          query={searchQuery}
          onAction={isFiltered ? handleResetAllFilters : onNewEntry}
        />
      )}

      
      <EmojiPickerModal
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        selectedEmoji={getMoodEmoji(selectedMood)}
        onSelectEmoji={(emoji) => {
          onMoodChange(emoji);
        }}
      />
    </div>
  );
};
