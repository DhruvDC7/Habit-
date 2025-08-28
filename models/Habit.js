import mongoose, { Schema } from 'mongoose';

const HabitSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String, default: 'dot' },
    frequency: {
      type: {
        type: String,
        enum: ['daily', 'custom'],
        default: 'daily',
      },
      days: [{ type: String, enum: ['MON','TUE','WED','THU','FRI','SAT','SUN'] }],
    },
    reminderTime: { type: String, default: null },
    isReminderEnabled: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
