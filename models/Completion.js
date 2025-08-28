import mongoose, { Schema } from 'mongoose';

const CompletionSchema = new Schema(
  {
    habitId: { type: Schema.Types.ObjectId, ref: 'Habit', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: String, required: true, index: true }, // YYYY-MM-DD in UTC
    timestamp: { type: Date, default: () => new Date() },
    notes: { type: String },
  },
  { timestamps: true }
);

CompletionSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

export default mongoose.models.Completion || mongoose.model('Completion', CompletionSchema);
