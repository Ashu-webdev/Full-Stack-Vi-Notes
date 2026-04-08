const Session = require("../models/session.model");

exports.saveSession = async (req, res) => {
  try {
    const { 
      userId, 
      text, 
      keystrokes, 
      pasteEvents, 
      typingMetrics, 
      pasteStats,
      wordCount,
      charCount
    } = req.body;
    if (!userId || !userId.trim()) {
      return res.status(400).json({
        success: false,
        message: "userId is required"
      });
    }

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "Text content is required"
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot save empty sessions"
      });
    }
    let sessionDuration = 0;
    if (keystrokes && keystrokes.length > 1) {
      sessionDuration = keystrokes[keystrokes.length - 1].keyUpTime - keystrokes[0].keyDownTime;
    }

    const session = await Session.create({
      userId,
      text,
      wordCount: wordCount || 0,
      charCount: charCount || text.length,
      keystrokesCount: keystrokes ? keystrokes.length : 0,
      keystrokes: keystrokes || [],
      typingMetrics: typingMetrics || {},
      pasteEvents: pasteEvents || [],
      pasteStats: pasteStats || {},
      sessionDuration
    });

    res.json({
      success: true,
      message: "Session saved successfully",
      session
    });
  } catch (error) {
    console.error("Error saving session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save session",
      error: error.message
    });
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select({
        title: 1,
        text: 1,
        wordCount: 1,
        charCount: 1,
        keystrokesCount: 1,
        typingMetrics: 1,
        pasteStats: 1,
        sessionDuration: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1
      });

    const total = await Session.countDocuments({ userId });

    res.json({
      success: true,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sessions
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
      error: error.message
    });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch session",
      error: error.message
    });
  }
};

exports.searchSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { query, limit = 20, skip = 0 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required"
      });
    }
    const sessions = await Session.find({
      userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { text: { $regex: query, $options: 'i' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select({
        title: 1,
        text: 1,
        wordCount: 1,
        charCount: 1,
        keystrokesCount: 1,
        typingMetrics: 1,
        pasteStats: 1,
        sessionDuration: 1,
        status: 1,
        createdAt: 1,
        updatedAt: 1
      });

    const total = await Session.countDocuments({
      userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { text: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      success: true,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sessions
    });
  } catch (error) {
    console.error("Error searching sessions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search sessions",
      error: error.message
    });
  }
};

exports.getSessionStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const stats = await Session.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalWords: { $sum: "$wordCount" },
          totalCharacters: { $sum: "$charCount" },
          totalKeystrokes: { $sum: "$keystrokesCount" },
          totalSessionDuration: { $sum: "$sessionDuration" },
          avgWordsPerSession: { $avg: "$wordCount" },
          avgSessionDuration: { $avg: "$sessionDuration" },
          maxWordCount: { $max: "$wordCount" },
          minWordCount: { $min: "$wordCount" }
        }
      }
    ]);

    res.json({
      success: true,
      stats: stats.length > 0 ? stats[0] : {
        totalSessions: 0,
        totalWords: 0,
        totalCharacters: 0,
        totalKeystrokes: 0,
        totalSessionDuration: 0,
        avgWordsPerSession: 0,
        avgSessionDuration: 0,
        maxWordCount: 0,
        minWordCount: 0
      }
    });
  } catch (error) {
    console.error("Error getting session stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get session stats",
      error: error.message
    });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      title,
      text,
      keystrokes,
      pasteEvents,
      typingMetrics,
      pasteStats,
      wordCount,
      charCount,
      status
    } = req.body;
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }
    if (title) session.title = title;
    if (text !== undefined) session.text = text;
    if (keystrokes) {
      session.keystrokes = keystrokes;
      session.keystrokesCount = keystrokes.length;
      if (keystrokes.length > 1) {
        session.sessionDuration = keystrokes[keystrokes.length - 1].keyUpTime - keystrokes[0].keyDownTime;
      }
    }
    if (pasteEvents) session.pasteEvents = pasteEvents;
    if (typingMetrics) session.typingMetrics = typingMetrics;
    if (pasteStats) session.pasteStats = pasteStats;
    if (wordCount !== undefined) session.wordCount = wordCount;
    if (charCount !== undefined) session.charCount = charCount;
    if (status) session.status = status;

    const updatedSession = await session.save();

    res.json({
      success: true,
      message: "Session updated successfully",
      session: updatedSession
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update session",
      error: error.message
    });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findByIdAndDelete(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found"
      });
    }

    res.json({
      success: true,
      message: "Session deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete session",
      error: error.message
    });
  }
};