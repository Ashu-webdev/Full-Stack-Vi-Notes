const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: function() {
      return `Session - ${new Date(this.createdAt).toLocaleString()}`;
    }
  },
  text: {
    type: String,
    required: true
  },
  wordCount: Number,
  charCount: Number,
  keystrokesCount: Number,
  keystrokes: [{
    timestamp: Number,
    keyDownTime: Number,
    keyUpTime: Number,
    dwellTime: Number,
    interKeyTime: Number,
    keyType: String
  }],
  typingMetrics: {
    totalKeystrokes: Number,
    averageInterKeyTime: Number,
    typingPace: Number,
    pauseCount: Number,
    deletionCount: Number,
    spaceCount: Number
  },
  pasteEvents: [{
    id: String,
    timestamp: Number,
    positionInText: Number,
    pastedLength: Number,
    pastedWords: Number,
    isLargePaste: Boolean,
    pastePercentOfTotal: Number
  }],
  pasteStats: {
    totalPasteEvents: Number,
    totalPastedChars: Number,
    totalPastedWords: Number,
    purelyTypedPercentage: Number,
    largestPasteSize: Number,
    averagePasteSize: Number
  },
  sessionDuration: Number,
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'completed'
  }
}, { timestamps: true });

sessionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Session", sessionSchema);