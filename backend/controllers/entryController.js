import mongoose from 'mongoose';
import path from 'path';
import { Entry } from '../models/Entry.js';
import { deleteUploadedFile } from '../middleware/upload.js';

const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const tryParseDateRange = (query) => {
  const trimmed = query.trim();

  const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const start = new Date(Date.UTC(year, month, day, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    if (!isNaN(start.getTime())) {
      return { start, end };
    }
  }

  const ymMatch = trimmed.match(/^(\d{4})-(\d{1,2})$/);
  if (ymMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
    if (!isNaN(start.getTime())) {
      return { start, end };
    }
  }

  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime()) && trimmed.length >= 6 && /\d/.test(trimmed)) {
    const start = new Date(parsed);
    start.setHours(0, 0, 0, 0);
    const end = new Date(parsed);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  return null;
};

export const getEntries = async (req, res) => {
  try {
    const { q, mood } = req.query;
    const filter = {};

    if (mood && mood.toLowerCase() !== 'all') {
      const trimmedMood = mood.trim();
      const moodAliases = {
        Happy: ['Happy', '😊', '😀', '😃', '😄', '😁'],
        Calm: ['Calm', '😌'],
        Okay: ['Okay', '🙂', '😐'],
        Sad: ['Sad', '😢', '😭'],
        Stressed: ['Stressed', '😫', '😰', '🤯'],
        Excited: ['Excited', '🤩', '🥳'],
        '😊': ['Happy', '😊', '😀', '😃', '😄', '😁'],
        '😌': ['Calm', '😌'],
        '🙂': ['Okay', '🙂', '😐'],
        '😢': ['Sad', '😢', '😭'],
        '😫': ['Stressed', '😫', '😰', '🤯'],
        '🤩': ['Excited', '🤩', '🥳'],
      };

      if (moodAliases[trimmedMood]) {
        filter.mood = {
          $in: moodAliases[trimmedMood].map(
            (val) => new RegExp(`^${escapeRegex(val)}$`, 'i')
          ),
        };
      } else {
        filter.mood = new RegExp(`^${escapeRegex(trimmedMood)}$`, 'i');
      }
    }

    if (q && q.trim().length > 0) {
      const escapedQuery = escapeRegex(q.trim());
      const textRegex = new RegExp(escapedQuery, 'i');
      const orConditions = [
        { title: textRegex },
        { body: textRegex },
      ];

      const dateRange = tryParseDateRange(q);
      if (dateRange) {
        orConditions.push(
          { createdAt: { $gte: dateRange.start, $lte: dateRange.end } },
          { updatedAt: { $gte: dateRange.start, $lte: dateRange.end } }
        );
      }

      filter.$or = orConditions;
    }

    const entries = await Entry.find(filter).sort({ updatedAt: -1 }).lean();
    const totalCount = await Entry.countDocuments({});

    return res.status(200).json({
      success: true,
      entries,
      totalCount,
      filteredCount: entries.length,
    });
  } catch (error) {
    console.error('[Entries Error] getEntries failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve entries.',
    });
  }
};

export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry ID format.',
      });
    }

    const entry = await Entry.findById(id).lean();
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    return res.status(200).json({
      success: true,
      entry,
    });
  } catch (error) {
    console.error('[Entries Error] getEntryById failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve entry.',
    });
  }
};

const parseAttachmentsFromBody = (rawAttachments) => {
  if (!rawAttachments) return [];
  if (typeof rawAttachments === 'string') {
    try {
      const parsed = JSON.parse(rawAttachments);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(rawAttachments) ? rawAttachments : [];
};

export const createEntry = async (req, res) => {
  try {
    const { title, body, mood } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Body is required.',
      });
    }

    const existingAttachments = parseAttachmentsFromBody(req.body.attachments);

    const fileAttachments = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const isImage = file.mimetype.startsWith('image/');
        const ext = path.extname(file.originalname).toLowerCase();
        const cleanBase = path.basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 40);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeFilename = `${uniqueSuffix}-${cleanBase}${ext}`;
        const base64Data = file.buffer ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : '';

        fileAttachments.push({
          type: isImage ? 'image' : 'file',
          name: file.originalname,
          filename: safeFilename,
          url: isImage ? base64Data : `/api/uploads/${safeFilename}`,
          data: base64Data,
          mimeType: file.mimetype,
          size: file.size,
          path: safeFilename,
        });
      }
    }

    const combinedAttachments = [...existingAttachments, ...fileAttachments];

    const newEntry = new Entry({
      title: title.trim(),
      body,
      mood: mood ? mood.trim() : null,
      attachments: combinedAttachments,
    });

    await newEntry.save();

    return res.status(201).json({
      success: true,
      entry: newEntry,
      message: 'Entry created successfully.',
    });
  } catch (error) {
    console.error('[Entries Error] createEntry failed:', error.message);
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((f) => deleteUploadedFile(f.filename));
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to save entry.',
    });
  }
};

export const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry ID format.',
      });
    }

    const { title, body, mood } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required.',
      });
    }

    if (!body || !body.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Body is required.',
      });
    }

    const entry = await Entry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    const retainedAttachments = parseAttachmentsFromBody(req.body.attachments);

    const retainedFilenames = new Set(
      retainedAttachments
        .map((a) => a.filename)
        .filter(Boolean)
    );

    entry.attachments.forEach((att) => {
      if ((att.type === 'image' || att.type === 'file') && att.filename) {
        if (!retainedFilenames.has(att.filename)) {
          deleteUploadedFile(att.filename);
        }
      }
    });

    const newFileAttachments = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const isImage = file.mimetype.startsWith('image/');
        const ext = path.extname(file.originalname).toLowerCase();
        const cleanBase = path.basename(file.originalname, ext)
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 40);
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const safeFilename = `${uniqueSuffix}-${cleanBase}${ext}`;
        const base64Data = file.buffer ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : '';

        newFileAttachments.push({
          type: isImage ? 'image' : 'file',
          name: file.originalname,
          filename: safeFilename,
          url: isImage ? base64Data : `/api/uploads/${safeFilename}`,
          data: base64Data,
          mimeType: file.mimetype,
          size: file.size,
          path: safeFilename,
        });
      }
    }

    entry.title = title.trim();
    entry.body = body;
    entry.mood = mood ? mood.trim() : null;
    entry.attachments = [...retainedAttachments, ...newFileAttachments];

    await entry.save();

    return res.status(200).json({
      success: true,
      entry,
      message: 'Entry updated successfully.',
    });
  } catch (error) {
    console.error('[Entries Error] updateEntry failed:', error.message);
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((f) => deleteUploadedFile(f.filename));
    }
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update entry.',
    });
  }
};

export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry ID format.',
      });
    }

    const entry = await Entry.findById(id);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    entry.attachments.forEach((att) => {
      if ((att.type === 'image' || att.type === 'file') && att.filename) {
        deleteUploadedFile(att.filename);
      }
    });

    await Entry.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Entry and all associated files deleted successfully.',
    });
  } catch (error) {
    console.error('[Entries Error] deleteEntry failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete entry.',
    });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const { id, filename } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid entry ID.',
      });
    }

    const entry = await Entry.findById(id).lean();
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found.',
      });
    }

    const safeFilename = path.basename(filename);
    const attachment = entry.attachments.find(
      (a) => a.filename === safeFilename
    );

    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Attachment not associated with this entry.',
      });
    }

    const rawData = attachment.data || (attachment.url?.startsWith('data:') ? attachment.url : null);
    if (rawData) {
      const matches = rawData.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${attachment.name || safeFilename}"`);
        return res.send(buffer);
      }
    }

    return res.status(404).json({
      success: false,
      message: 'File not found.',
    });
  } catch (error) {
    console.error('[Download Error] downloadAttachment failed:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to download file.',
    });
  }
};

export const serveUploadedFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const safeFilename = path.basename(filename);

    const entry = await Entry.findOne({ 'attachments.filename': safeFilename }).lean();
    if (entry) {
      const attachment = entry.attachments.find((a) => a.filename === safeFilename);
      if (attachment) {
        const rawData = attachment.data || (attachment.url?.startsWith('data:') ? attachment.url : null);
        if (rawData) {
          const matches = rawData.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            const contentType = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            return res.send(buffer);
          }
        }
      }
    }

    return res.status(404).json({
      success: false,
      message: 'File not found.',
    });
  } catch (error) {
    console.error('[Serve File Error]:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error serving file.',
    });
  }
};
