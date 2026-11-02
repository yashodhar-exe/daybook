# Daybook — Minimal Personal Diary SPA

A responsive, distraction-free personal diary single-page application (SPA) crafted from the **Google Stitch Daybook** design system. Built with **React**, **Vite**, **Node.js**, **Express**, and **local MongoDB**.

---

## Features

- **Warm Minimalist Editorial Design**: Grounded in paper tones (`#faf9f7`), deep charcoal (`#171717`), crisp white surfaces (`#ffffff`), and warm orange punctuation (`#ff5a1f` / `#e8470b`) with Inter typography.
- **Five Stitch-Referenced Screen Workflows**:
  1. **Diary Home / All Entries**: Chronological diary feed sorted by latest update, with real-time entry count, reflection prompt, and responsive layout.
  2. **New Entry / Writing Editor**: Clean, distraction-free writing interface with title, auto-expanding body textarea, live word counter, mood tone picker, and unsaved changes protection.
  3. **Read / View Entry**: Book-style reading canvas preserving whitespace and line breaks, formatted timestamps, and visual attachment sections.
  4. **Edit Existing Entry**: Reuses the writing editor, pre-populated with existing document content, updating `updatedAt` without duplicating records.
  5. **Search Results & Filtered Discovery**: Debounced full-text search across titles, body text, and dates (`YYYY-MM-DD` or human-readable formats), combinable with mood filters (`Happy`, `Calm`, `Okay`, `Sad`, `Stressed`, `Excited`).
- **Complete Attachment System**:
  - **Images**: Multiple image uploads with instant preview, local filesystem storage, thumbnail gallery, and safe controlled serving.
  - **Documents/Files**: PDF, TXT, DOCX, MD, CSV, etc. (up to 10 MB limit) with functional download route.
  - **Locations**: Place name or address, optional coordinates, manual entry plus browser geolocation ("Use my current location"), with "Open in Maps" external links.
  - **Web Links**: HTTP/HTTPS URL and optional title label, opening safely in new tabs (`target="_blank" rel="noopener noreferrer"`).
- **Clean Architecture & Data Hygiene**:
  - Only functional UI—no fake weather, music players, fake avatars, or mock revisions.
  - Disk cleanup: Deleting an entry or removing an attachment automatically unlinks its files from disk.
  - ReDoS and injection protection on search queries.
  - Strict path traversal prevention on file downloads.

---

## Project Structure

```
daybook/
├── frontend/
│   ├── public/
│   │   └── daybook-logo.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── AttachmentManager.jsx
│   │   │   ├── DeleteModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── EntryCard.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── DiaryHome.jsx
│   │   │   ├── EntryEditor.jsx
│   │   │   └── EntryView.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── entryController.js
│   ├── middleware/
│   │   └── upload.js
│   ├── models/
│   │   └── Entry.js
│   ├── routes/
│   │   └── entryRoutes.js
│   ├── uploads/
│   │   └── .gitkeep
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
└── README.md
```

---

## Prerequisites

- **Node.js**: v18.0.0 or later (v20+ or v24+ recommended)
- **npm**: v9.0.0 or later
- **MongoDB Community Server**: Locally installed and running on `mongodb://127.0.0.1:27017`

---

## Installation & Setup

### 1. Clone or Open Workspace
Open the root project directory in your terminal:
```bash
cd "y:\Projects\Day Book"
```

### 2. Configure Environment Files

#### Backend (`backend/.env`):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/daybook
PORT=5000
CLIENT_URL=http://localhost:5173
```

#### Frontend (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Install Dependencies

#### Backend:
```bash
cd backend
npm install
```

#### Frontend:
```bash
cd ../frontend
npm install
```

---

## Running the Application

### 1. Ensure Local MongoDB is Running
On Windows:
```powershell
# Check MongoDB service status
Get-Service -Name "*mongo*"

# If stopped, start the service:
net start MongoDB
```

Or run standalone:
```bash
mongod --dbpath "C:\data\db"
```

### 2. Start the Backend Server (Port 5000)
```bash
cd backend
npm run dev
# or: npm start
```
You should see:
```
[Database] MongoDB connected successfully to database: "daybook" at 127.0.0.1:27017
[Daybook Server] Running successfully on http://localhost:5000
[Daybook Server] Accepting requests from: http://localhost:5173
```

### 3. Start the Frontend Application (Port 5173)
In another terminal:
```bash
cd frontend
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## Uploaded Attachments Storage

- Uploaded files and images are stored locally under:
  ```
  backend/uploads/
  ```
- Uploaded files are served through safe Express endpoints with path traversal prevention:
  - Image thumbnails: `GET /api/uploads/:filename`
  - Controlled file downloads: `GET /api/entries/:id/attachments/:filename`
- When an entry is deleted, all its associated files on disk are automatically deleted.
- When an attachment is removed during an entry update, the old file is removed from disk.

---

## Troubleshooting MongoDB Connection Errors

If the backend fails to start with:
```
[Database Error] Failed to connect to local MongoDB
```
Follow these steps:

1. **Verify MongoDB Service Status**:
   ```powershell
   Get-Service -Name "*mongo*"
   ```
   If it shows `Stopped`, start it via administrator prompt:
   ```cmd
   net start MongoDB
   ```
2. **Verify Port 27017**:
   Check if port 27017 is listening:
   ```powershell
   Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
   ```
3. **Verify Database Configuration**:
   Ensure `backend/.env` has:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/daybook
   ```
4. **Inspect MongoDB Logs**:
   Default log path on Windows:
   `C:\Program Files\MongoDB\Server\<version>\log\mongod.log`

---

## REST API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint |
| `GET` | `/api/entries` | List entries with optional `?q=` search and `?mood=` filter |
| `GET` | `/api/entries/:id` | Get single entry with full details and attachments |
| `POST` | `/api/entries` | Create new entry (supports JSON or multipart `files`) |
| `PUT` | `/api/entries/:id` | Update existing entry and manage attachments |
| `DELETE` | `/api/entries/:id` | Delete entry and purge attached disk files |
| `GET` | `/api/entries/:id/attachments/:filename` | Controlled download of document attachments |
| `GET` | `/api/uploads/:filename` | Safe serving of image thumbnails/previews |

---

## Build for Production

To build the optimized frontend bundle:
```bash
cd frontend
npm run build
```
Build output is saved to `frontend/dist/`.
