import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, trim: true },
    image: { type: String },
    icon: { type: String }, // lucide icon name used by the frontend
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);
