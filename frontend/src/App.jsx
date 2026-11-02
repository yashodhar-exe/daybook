import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DiaryHome } from './pages/DiaryHome';
import { EntryEditor } from './pages/EntryEditor';
import { EntryView } from './pages/EntryView';
import { DeleteModal } from './components/DeleteModal';
import {
  fetchEntries,
  fetchEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
} from './services/api';

export function App() {
  const [view, setView] = useState('home');
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMood, setSelectedMood] = useState('All');

  const [entries, setEntries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [listError, setListError] = useState(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const [alert, setAlert] = useState(null);

  const searchInputRef = useRef(null);

  const showAlert = (text, type = 'success') => {
    setAlert({ text, type });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  };

  const loadEntries = useCallback(async () => {
    setIsLoadingList(true);
    setListError(null);
    try {
      const data = await fetchEntries({
        q: searchQuery,
        mood: selectedMood,
      });
      setEntries(data.entries || []);
      setTotalCount(data.totalCount || 0);
    } catch (err) {
      setListError(err.message || 'Failed to load entries from server.');
    } finally {
      setIsLoadingList(false);
    }
  }, [searchQuery, selectedMood]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const loadSelectedEntry = useCallback(async (id) => {
    if (!id) return;
    setIsLoadingDetail(true);
    try {
      const entry = await fetchEntryById(id);
      setSelectedEntry(entry);
    } catch (err) {
      showAlert(err.message || 'Could not load entry details.', 'error');
      setView('home');
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  const handleNavigateHome = () => {
    setView('home');
    setSelectedEntryId(null);
    setSelectedEntry(null);
  };

  const handleStartNewEntry = () => {
    setSelectedEntryId(null);
    setSelectedEntry(null);
    setView('new');
  };

  const handleSelectEntry = async (id) => {
    setSelectedEntryId(id);
    setView('read');
    await loadSelectedEntry(id);
  };

  const handleEditEntry = async (id) => {
    setSelectedEntryId(id);
    setView('edit');
    if (!selectedEntry || selectedEntry._id !== id) {
      await loadSelectedEntry(id);
    }
  };

  const handleSaveEntry = async (formData) => {
    setIsSaving(true);
    try {
      let saved;
      if (view === 'edit' && selectedEntryId) {
        saved = await updateEntry(selectedEntryId, formData);
        showAlert('Changes saved successfully.', 'success');
      } else {
        saved = await createEntry(formData);
        showAlert('New entry saved to your diary.', 'success');
      }

      await loadEntries();

      setSelectedEntry(saved);
      setSelectedEntryId(saved._id);
      setView('read');
    } catch (err) {
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const handlePromptDelete = (entry) => {
    setEntryToDelete(entry);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteEntry(entryToDelete._id);
      showAlert('Entry deleted successfully.', 'success');
      setDeleteModalOpen(false);
      setEntryToDelete(null);

      await loadEntries();

      handleNavigateHome();
    } catch (err) {
      showAlert(err.message || 'Failed to delete entry.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFocusSearch = () => {
    handleNavigateHome();
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="app-layout">
      
      <Header onNavigate={setView} />

      
      <Sidebar onNavigate={handleNavigateHome} />

      
      <main className="app-main">
        
        {alert && (
          <div className="content-container" style={{ marginBottom: '1rem' }}>
            <div className={`alert-banner ${alert.type}`}>
              <span>{alert.text}</span>
              <button
                className="btn-icon"
                style={{ width: '20px', height: '20px' }}
                onClick={() => setAlert(null)}
                type="button"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        
        {view === 'home' && (
          <DiaryHome
            entries={entries}
            totalCount={totalCount}
            isLoading={isLoadingList}
            error={listError}
            searchQuery={searchQuery}
            selectedMood={selectedMood}
            onSearchChange={setSearchQuery}
            onMoodChange={setSelectedMood}
            onSelectEntry={handleSelectEntry}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handlePromptDelete}
            onNewEntry={handleStartNewEntry}
            searchRef={searchInputRef}
          />
        )}

        
        {view === 'new' && (
          <EntryEditor
            initialEntry={null}
            onSave={handleSaveEntry}
            onCancel={handleNavigateHome}
            isSaving={isSaving}
          />
        )}

        
        {view === 'read' && (
          <>
            {isLoadingDetail ? (
              <div className="content-container" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
                Loading entry...
              </div>
            ) : (
              <EntryView
                entry={selectedEntry}
                onBack={handleNavigateHome}
                onEdit={handleEditEntry}
                onDelete={handlePromptDelete}
              />
            )}
          </>
        )}

        
        {view === 'edit' && (
          <>
            {isLoadingDetail ? (
              <div className="content-container" style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
                Loading entry for editing...
              </div>
            ) : (
              <EntryEditor
                initialEntry={selectedEntry}
                onSave={handleSaveEntry}
                onCancel={() => {
                  if (selectedEntryId) {
                    setView('read');
                  } else {
                    handleNavigateHome();
                  }
                }}
                isSaving={isSaving}
              />
            )}
          </>
        )}
      </main>

      
      <DeleteModal
        isOpen={deleteModalOpen}
        entryTitle={entryToDelete?.title || 'this entry'}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setEntryToDelete(null);
        }}
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default App;
