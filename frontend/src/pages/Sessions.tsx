import { useState, useEffect } from "react";
import { getUserSessions, deleteSession, updateSession } from "../services/api";

interface SessionData {
  _id: string;
  title: string;
  wordCount: number;
  charCount: number;
  keystrokesCount: number;
  typingMetrics: {
    typingPace: number;
    averageInterKeyTime: number;
    pauseCount: number;
    deletionCount: number;
  };
  pasteStats: {
    totalPasteEvents: number;
    purelyTypedPercentage: number;
  };
  sessionDuration: number;
  createdAt: string;
}

export default function Sessions({ user, setPage }: any) {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [user]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await getUserSessions(user._id, 20, 0);
      if (response.success) {
        setSessions(response.sessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      alert("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to delete this session?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await deleteSession(sessionId);
      if (response.success) {
        setSessions(sessions.filter(s => s._id !== sessionId));
        setSelectedSession(null);
        alert("Session deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session");
    } finally {
      setDeleting(false);
    }
  };

  const handleEditTitle = (sessionId: string, currentTitle: string) => {
    setEditingTitle(sessionId);
    setEditingTitleValue(currentTitle);
  };

  const handleSaveTitle = async (sessionId: string) => {
    if (!editingTitleValue.trim()) {
      alert("Title cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const response = await updateSession(sessionId, {
        title: editingTitleValue
      });
      
      if (response.success) {
        setSessions(sessions.map(s => 
          s._id === sessionId ? { ...s, title: editingTitleValue } : s
        ));
        setEditingTitle(null);
        setEditingTitleValue("");
        alert("Session title updated successfully");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      alert("Failed to update session title");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingTitle(null);
    setEditingTitleValue("");
  };

  const formatDuration = (ms: number) => {
    if (!ms) return "0s";
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="sessions-container">
      <div className="sessions-navbar">
        <div className="sessions-nav-left">
          <h1 className="sessions-title">📚 My Writing Sessions</h1>
        </div>
        <button 
          className="btn btn-secondary"
          onClick={() => setPage("editor")}
        >
          ✏️ Back to Editor
        </button>
      </div>

      <div className="sessions-content">
        {loading ? (
          <div className="loading-spinner">
            <p>Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <h2>No sessions yet</h2>
            <p>Start writing to create your first session!</p>
          </div>
        ) : (
          <div className="sessions-grid">
            <div className="sessions-list">
              <h3>Sessions ({sessions.length})</h3>
              <div className="session-items">
                {sessions.map((session) => (
                  <div
                    key={session._id}
                    className={`session-item ${selectedSession === session._id ? "active" : ""}`}
                    onClick={() => setSelectedSession(session._id)}
                  >
                    <div className="session-item-header">
                      <h4>{session.title}</h4>
                      <span className="session-date">
                        {formatDate(session.createdAt)}
                      </span>
                    </div>
                    <div className="session-item-stats">
                      <span className="stat">📝 {session.wordCount} words</span>
                      <span className="stat">⌨️ {session.keystrokesCount} keys</span>
                      <span className="stat">⏱️ {formatDuration(session.sessionDuration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedSession && (
              <div className="session-details">
                {sessions.map((session) => {
                  if (session._id !== selectedSession) return null;
                  const isEditing = editingTitle === session._id;

                  return (
                    <div key={session._id} className="details-card">
                      <div className="details-header">
                        {isEditing ? (
                          <div className="edit-title-container">
                            <input
                              type="text"
                              value={editingTitleValue}
                              onChange={(e) => setEditingTitleValue(e.target.value)}
                              className="edit-title-input"
                              placeholder="Enter session title"
                              autoFocus
                            />
                            <button
                              className="btn-save"
                              onClick={() => handleSaveTitle(session._id)}
                              disabled={saving}
                            >
                              ✓ Save
                            </button>
                            <button
                              className="btn-cancel"
                              onClick={handleCancelEdit}
                              disabled={saving}
                            >
                              ✕ Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <h2>{session.title}</h2>
                            <div className="header-buttons">
                              <button
                                className="btn-edit"
                                onClick={() => handleEditTitle(session._id, session.title)}
                              >
                                ✏️ Rename
                              </button>
                              <button
                                className="btn-delete"
                                onClick={() => handleDeleteSession(session._id)}
                                disabled={deleting}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="details-section">
                        <h3>📊 Content Statistics</h3>
                        <div className="stats-grid">
                          <div className="stat-box">
                            <span className="stat-icon">📝</span>
                            <div>
                              <p className="stat-label">Words</p>
                              <p className="stat-value">{session.wordCount}</p>
                            </div>
                          </div>
                          <div className="stat-box">
                            <span className="stat-icon">🔤</span>
                            <div>
                              <p className="stat-label">Characters</p>
                              <p className="stat-value">{session.charCount}</p>
                            </div>
                          </div>
                          <div className="stat-box">
                            <span className="stat-icon">⌨️</span>
                            <div>
                              <p className="stat-label">Keystrokes</p>
                              <p className="stat-value">{session.keystrokesCount}</p>
                            </div>
                          </div>
                          <div className="stat-box">
                            <span className="stat-icon">⏱️</span>
                            <div>
                              <p className="stat-label">Duration</p>
                              <p className="stat-value">{formatDuration(session.sessionDuration)}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {session.typingMetrics && (
                        <div className="details-section">
                          <h3>⌨️ Typing Behavior</h3>
                          <div className="stats-grid">
                            <div className="stat-box">
                              <span className="stat-icon">🚀</span>
                              <div>
                                <p className="stat-label">Typing Pace</p>
                                <p className="stat-value">{session.typingMetrics.typingPace} KPM</p>
                              </div>
                            </div>
                            <div className="stat-box">
                              <span className="stat-icon">📍</span>
                              <div>
                                <p className="stat-label">Key Interval</p>
                                <p className="stat-value">{session.typingMetrics.averageInterKeyTime}ms</p>
                              </div>
                            </div>
                            <div className="stat-box">
                              <span className="stat-icon">⏸️</span>
                              <div>
                                <p className="stat-label">Pauses</p>
                                <p className="stat-value">{session.typingMetrics.pauseCount}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {session.pasteStats && (
                        <div className="details-section">
                          <h3>📋 Paste Analytics</h3>
                          <div className="stats-grid">
                            <div className="stat-box">
                              <span className="stat-icon">📤</span>
                              <div>
                                <p className="stat-label">Paste Events</p>
                                <p className="stat-value">{session.pasteStats.totalPasteEvents}</p>
                              </div>
                            </div>
                            <div className="stat-box">
                              <span className="stat-icon">✍️</span>
                              <div>
                                <p className="stat-label">Authentic Content</p>
                                <p className="stat-value">{session.pasteStats.purelyTypedPercentage}%</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="details-section">
                        <h3>📅 Metadata</h3>
                        <div className="metadata-box">
                          <p><strong>Created:</strong> {formatDate(session.createdAt)}</p>
                          <p><strong>Session ID:</strong> <code>{session._id}</code></p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
