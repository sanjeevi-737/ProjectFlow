import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    columns: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        color: {
          type: String,
          default: '#6366f1',
        },
        order: {
          type: Number,
          default: 0,
        },
        taskLimit: {
          type: Number,
          default: 0,
        },
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

boardSchema.index({ project: 1 });

boardSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'board',
});

const Board = mongoose.model('Board', boardSchema);
export default Board;
