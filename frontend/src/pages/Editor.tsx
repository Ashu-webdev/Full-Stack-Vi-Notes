import { useState } from "react";
import { useKeystroke } from "../hooks/useKeystroke";
import { saveSession } from "../services/api";

interface TypingMetrics {
  totalKeystrokes: number;
  averageInterKeyTime: number;
  typingPace: number;
  pauseCount: number;
  deletionCount: number;
  spaceCount: number;
}

interface PasteEvent {
  id: string;
  timestamp: number;
  positionInText: number;
  pastedLength: number;
  pastedWords: number;
  isLargePaste: boolean;
  pastePercentOfTotal: number;
}

export default function Editor({ user, setUser, setPage }: any) {
  const [text, setText] = useState("");
  const [pasteEvents, setPasteEvents] = useState<PasteEvent[]>([]);
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showMetrics, setShowMetrics] = useState(false);
  const [showPasteAnalytics, setShowPasteAnalytics] = useState(false);
  const [lastPasteIndicator, setLastPasteIndicator] = useState(false);

  const { data, handleKeyDown } = useKeystroke();

  const calculateTypingMetrics = (): TypingMetrics => {
    if (data.length === 0) {
      return {
        totalKeystrokes: 0,
        averageInterKeyTime: 0,
        typingPace: 0,
        pauseCount: 0,
        deletionCount: 0,
        spaceCount: 0
      };
    }

    const interKeyTimes = data.map(k => k.interKeyTime).filter(t => t > 0);
    const pauseThreshold = 300;
    const pauseCount = interKeyTimes.filter(t => t > pauseThreshold).length;
    const deletionCount = data.filter(k => k.keyType === "delete").length;
    const spaceCount = data.filter(k => k.keyType === "space").length;

    const avgInterKey = interKeyTimes.length > 0
      ? Math.round(interKeyTimes.reduce((a, b) => a + b, 0) / interKeyTimes.length)
      : 0;

    const totalTime = data.length > 0 
      ? data[data.length - 1].keyUpTime - data[0].keyDownTime
      : 0;

    const typingPace = totalTime > 0 
      ? Math.round((data.length / (totalTime / 1000)) * 60)
      : 0;

    return {
      totalKeystrokes: data.length,
      averageInterKeyTime: avgInterKey,
      typingPace,
      pauseCount,
      deletionCount,
      spaceCount
    };
  };

  const metrics = calculateTypingMetrics();

  const calculatePasteStats = () => {
    if (pasteEvents.length === 0) {
      return {
        totalPasteEvents: 0,
        totalPastedChars: 0,
        totalPastedWords: 0,
        purelyTypedPercentage: 100,
        largestPasteSize: 0,
        averagePasteSize: 0
      };
    }

    const totalPasteChars = pasteEvents.reduce((sum, p) => sum + p.pastedLength, 0);
    const totalPasteWords = pasteEvents.reduce((sum, p) => sum + p.pastedWords, 0);
    const purelyTypedPercentage = charCount > 0 
      ? Math.round(((charCount - totalPasteChars) / charCount) * 100)
      : 100;
    const largestPaste = Math.max(...pasteEvents.map(p => p.pastedLength), 0);
    const avgPasteSize = pasteEvents.length > 0
      ? Math.round(totalPasteChars / pasteEvents.length)
      : 0;

    return {
      totalPasteEvents: pasteEvents.length,
      totalPasteChars,
      totalPasteWords,
      purelyTypedPercentage,
      largestPasteSize: largestPaste,
      averagePasteSize: avgPasteSize
    };
  };

  const pasteStats = calculatePasteStats();

  const handlePaste = (e: any) => {
    const pastedText = e.clipboardData.getData("text");
    const currentPosition = e.currentTarget.selectionStart;
    const pastedWords = pastedText.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
    const isLargePaste = pastedText.length > 100;

    const newPasteEvent: PasteEvent = {
      id: `paste_${Date.now()}`,
      timestamp: Date.now(),
      positionInText: currentPosition,
      pastedLength: pastedText.length,
      pastedWords,
      isLargePaste,
      pastePercentOfTotal: 0
    };

    setPasteEvents(prev => [...prev, newPasteEvent]);
    setLastPasteIndicator(true);
    setTimeout(() => setLastPasteIndicator(false), 1000);
  };

  const handleTextChange = (e: any) => {
    const value = e.target.value;
    setText(value);
    const newCharCount = value.length;
    const newWordCount = value.trim().split(/\s+/).filter((word: string) => word.length > 0).length;
    setCharCount(newCharCount);
    setWordCount(newWordCount);
    setPasteEvents(prev => prev.map(paste => ({
      ...paste,
      pastePercentOfTotal: newCharCount > 0 
        ? Math.round((paste.pastedLength / newCharCount) * 100)
        : 0
    })));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSession({
        userId: user._id,
        text,
        keystrokes: data,
        pasteEvents,
        pasteStats,
        typingMetrics: metrics
      });
      alert("✓ Session saved successfully!");
    } catch (error) {
      alert("Failed to save session. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPage("home");
  };

  return (
    <div className="editor-container">
      <div className="editor-navbar">
        <div className="editor-nav-left">
          <h1 className="editor-logo">📝 Vi-Notes</h1>
          <span className="user-email">{user?.email}</span>
        </div>
        <div className="editor-nav-buttons">
          <button 
            className="btn-sessions" 
            onClick={() => setPage("sessions")}
          >
            📚 View Sessions
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="editor-content">
        <div className="editor-header">
          <h2>✨ Write Your Content</h2>
          <p>Start typing to verify your authentic writing</p>
        </div>

        <div className="editor-main">
          <textarea
            className={`editor-textarea ${lastPasteIndicator ? 'paste-detected' : ''}`}
            placeholder="Start writing here... Your content will be analyzed for authenticity."
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
          
          <div className="editor-stats">
            <div className="stat-item">
              <span className="stat-label">Words:</span>
              <span className="stat-value">{wordCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Characters:</span>
              <span className="stat-value">{charCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Keystrokes:</span>
              <span className="stat-value">{metrics.totalKeystrokes}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Paste Events:</span>
              <span className="stat-value">{pasteEvents.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Pasted Text:</span>
              <span className="stat-value">{pasteStats.totalPastedChars}</span>
            </div>
          </div>

          <div className="metrics-toggle">
            <button 
              className="btn-toggle-metrics"
              onClick={() => setShowMetrics(!showMetrics)}
            >
              {showMetrics ? "🔒 Hide" : "📊 Show"} Typing Behavior Metrics
            </button>
            {pasteEvents.length > 0 && (
              <button 
                className="btn-toggle-metrics btn-toggle-paste"
                onClick={() => setShowPasteAnalytics(!showPasteAnalytics)}
              >
                {showPasteAnalytics ? "🔒 Hide" : "📋 Show"} Paste Analytics
              </button>
            )}
          </div>

          {showMetrics && (
            <div className="typing-metrics">
              <h3>⌨️ Typing Behavior Analysis</h3>
              <div className="metrics-grid">
                <div className="metric-card">
                  <span className="metric-label">Avg Key Interval</span>
                  <span className="metric-value">{metrics.averageInterKeyTime}ms</span>
                  <p className="metric-description">Average time between key presses</p>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Typing Pace</span>
                  <span className="metric-value">{metrics.typingPace} KPM</span>
                  <p className="metric-description">Keys per minute</p>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Pause Count</span>
                  <span className="metric-value">{metrics.pauseCount}</span>
                  <p className="metric-description">Pauses longer than 300ms</p>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Deletions</span>
                  <span className="metric-value">{metrics.deletionCount}</span>
                  <p className="metric-description">Backspace/Delete key presses</p>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Space Keys</span>
                  <span className="metric-value">{metrics.spaceCount}</span>
                  <p className="metric-description">Space bar presses</p>
                </div>
              </div>
              <div className="metrics-note">
                <p>💡 <strong>Note:</strong> This data captures your typing behavior patterns (timing, rhythm, pauses) to verify authentic writing. No character content is stored.</p>
              </div>
            </div>
          )}

          {showPasteAnalytics && pasteEvents.length > 0 && (
            <div className="paste-analytics">
              <h3>📋 Paste Detection Analysis</h3>
              <div className="paste-stats-grid">
                <div className="paste-stat-card">
                  <span className="paste-stat-label">Total Paste Events</span>
                  <span className="paste-stat-value">{pasteStats.totalPasteEvents}</span>
                  <p className="paste-stat-description">Number of times content was pasted</p>
                </div>
                <div className="paste-stat-card">
                  <span className="paste-stat-label">Total Pasted Characters</span>
                  <span className="paste-stat-value">{pasteStats.totalPastedChars}</span>
                  <p className="paste-stat-description">Characters from paste operations</p>
                </div>
                <div className="paste-stat-card">
                  <span className="paste-stat-label">Total Pasted Words</span>
                  <span className="paste-stat-value">{pasteStats.totalPastedWords}</span>
                  <p className="paste-stat-description">Words from paste operations</p>
                </div>
                <div className="paste-stat-card">
                  <span className="paste-stat-label">Purely Typed Content</span>
                  <span className="paste-stat-value">{pasteStats.purelyTypedPercentage}%</span>
                  <p className="paste-stat-description">Percentage of manually typed text</p>
                </div>
                <div className="paste-stat-card">
                  <span className="paste-stat-label">Largest Paste</span>
                  <span className="paste-stat-value">{pasteStats.largestPasteSize}</span>
                  <p className="paste-stat-description">Characters in biggest paste</p>
                </div>
                <div className="paste-stat-card">
                  <span className="paste-stat-label">Average Paste Size</span>
                  <span className="paste-stat-value">{pasteStats.averagePasteSize}</span>
                  <p className="paste-stat-description">Characters per paste event</p>
                </div>
              </div>

              <div className="paste-events-list">
                <h4>📤 Paste Events Timeline</h4>
                <div className="paste-timeline">
                  {pasteEvents.map((paste, idx) => (
                    <div key={paste.id} className="paste-timeline-item">
                      <div className="paste-timeline-marker">{idx + 1}</div>
                      <div className="paste-timeline-content">
                        <div className="paste-timeline-header">
                          <span className="paste-time">
                            {new Date(paste.timestamp).toLocaleTimeString()}
                          </span>
                          {paste.isLargePaste && <span className="paste-badge">Large</span>}
                        </div>
                        <p className="paste-info">
                          📌 Position: {paste.positionInText} | 
                          📝 {paste.pastedLength} chars ({paste.pastedWords} words) | 
                          📊 {paste.pastePercentOfTotal}% of content
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="paste-insights">
                <p><strong>💡 Insights:</strong></p>
                <ul>
                  {pasteStats.purelyTypedPercentage === 100 && <li>✅ No pasted content detected - 100% manually typed</li>}
                  {pasteStats.purelyTypedPercentage < 100 && pasteStats.purelyTypedPercentage >= 80 && <li>✅ Mostly authentic - {pasteStats.purelyTypedPercentage}% manually typed content</li>}
                  {pasteStats.purelyTypedPercentage < 80 && pasteStats.purelyTypedPercentage >= 50 && <li>⚠️ Mixed content - Roughly {pasteStats.purelyTypedPercentage}% manually typed</li>}
                  {pasteStats.purelyTypedPercentage < 50 && <li>⚠️ Most content appears to be pasted ({pasteStats.purelyTypedPercentage}% typed)</li>}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="editor-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={saving || !text.trim()}
          >
            {saving ? "💾 Saving..." : "💾 Save Session"}
          </button>
        </div>
      </div>
    </div>
  );
}