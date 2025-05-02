const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
    trim: true,
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true,
  },
  dateApplied: {
    type: Date,
    default: Date.now,
    // TO DO: remove default date and make it required
  },
  status: {
    type: String,
    enum: ['Applied', 'Interview Scheduled', 'Interview Completed', 'Offer Pending', 'Rejected'],
    default: 'Applied',
  },
  link: {
    type: String,
    required: false,
    trim: true,
    default: "https://www.google.com/"
    // TO DO: remove default url
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
});

module.exports = mongoose.model('Application', ApplicationSchema);
