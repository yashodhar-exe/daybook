import express from 'express';
import {
  getEntries,
  getEntryById,
  createEntry,
  updateEntry,
  deleteEntry,
  downloadAttachment,
  serveUploadedFile,
} from '../controllers/entryController.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.array('files', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    next();
  });
};

router.get('/entries', getEntries);
router.get('/entries/:id', getEntryById);
router.post('/entries', handleUpload, createEntry);
router.put('/entries/:id', handleUpload, updateEntry);
router.delete('/entries/:id', deleteEntry);

router.get('/entries/:id/attachments/:filename', downloadAttachment);

router.get('/uploads/:filename', serveUploadedFile);

export default router;
