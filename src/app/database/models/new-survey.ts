import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  id: String,
  type: {
    type: String,
    enum: ['multiple-choice', 'text-input', 'rating-scale'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  options: [String],
  required: Boolean,
  min: Number,
  max: Number,
});

const SurveySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [QuestionSchema],

  active: {
    type: Boolean,
    default: true // Set default value to true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Survey || mongoose.model('Survey', SurveySchema);