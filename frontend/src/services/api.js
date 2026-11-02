const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchEntries = async ({ q = '', mood = '' } = {}) => {
  const params = new URLSearchParams();
  if (q && q.trim()) params.append('q', q.trim());
  if (mood && mood.toLowerCase() !== 'all') params.append('mood', mood.trim());

  const url = `${API_BASE_URL}/entries${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch entries.');
  }
  return data;
};

export const fetchEntryById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/entries/${id}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch entry.');
  }
  return data.entry;
};

export const createEntry = async (payload) => {
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  const body = isFormData ? payload : JSON.stringify(payload);

  const response = await fetch(`${API_BASE_URL}/entries`, {
    method: 'POST',
    headers,
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to save entry.');
  }
  return data.entry;
};

export const updateEntry = async (id, payload) => {
  const isFormData = payload instanceof FormData;
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
  const body = isFormData ? payload : JSON.stringify(payload);

  const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
    method: 'PUT',
    headers,
    body,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update entry.');
  }
  return data.entry;
};

export const deleteEntry = async (id) => {
  const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete entry.');
  }
  return data;
};

export const getDownloadUrl = (entryId, filename) => {
  return `${API_BASE_URL}/entries/${entryId}/attachments/${encodeURIComponent(filename)}`;
};

export const getImageUrl = (filename) => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) return filename;
  return `${API_BASE_URL}/uploads/${encodeURIComponent(filename)}`;
};
