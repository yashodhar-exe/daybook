import multer from 'multer';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
]);

const ALLOWED_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg',
  '.pdf', '.txt', '.md', '.csv', '.json', '.doc', '.docx', '.xls', '.xlsx', '.zip'
]);

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = (file.originalname ? file.originalname.slice(file.originalname.lastIndexOf('.')) : '').toLowerCase();
  if (ALLOWED_EXTENSIONS.has(ext) || ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${ext || file.mimetype} is not supported. Supported: images, PDF, TXT, DOCX, CSV, MD.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export const deleteUploadedFile = () => {};
