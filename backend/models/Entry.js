import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['image', 'file', 'location', 'link'],
    },
    name: {
      type: String,
      default: '',
    },
    filename: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    mimeType: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
    path: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
  },
  { _id: true }
);

const entrySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Entry title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Entry body is required'],
    },
    mood: {
      type: String,
      trim: true,
      maxlength: [60, 'Mood indicator cannot exceed 60 characters'],
      default: null,
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'entries',
  }
);

entrySchema.index({ updatedAt: -1 });
entrySchema.index({ createdAt: -1 });

export const Entry = mongoose.model('Entry', entrySchema);
