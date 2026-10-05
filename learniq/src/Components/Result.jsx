import { useLocation, Link } from "react-router-dom";
import ResultReview from "../components/ResultReview";
import { downloadResultPdf } from "../services/resultPdf";
import "../CSS/Results.css";

function Result() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="result-page">
        <div className="result-empty">
          <div className="empty-icon">📊</div>
          <h3>No Result Found</h3>
          <p>Your test result is not available.</p>

          <Link to="/student" className="result-btn primary-btn">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const passed = String(state.status).toUpperCase() === "PASS";

  const score = Number(state.score) || 0;
  const totalMarks = Number(state.totalMarks) || 0;

  const percentage =
    totalMarks > 0
      ? Math.round((score / totalMarks) * 100)
      : 0;

  return (
    <div className="result-page">

      {/* Header */}
      <div className="result-header">
        <div>
          <span className="result-small-title">TEST PERFORMANCE</span>
          <h1>Test Result</h1>
          <p>Here is your complete test performance summary.</p>
        </div>

        <div className={`result-status ${passed ? "passed" : "failed"}`}>
          <span className="status-icon">
            {passed ? "✓" : "✕"}
          </span>
          <div>
            <small>Status</small>
            <strong>{state.status}</strong>
          </div>
        </div>
      </div>

      {/* Score Section */}
      <div className="score-section">

        <div className="score-card main-score">
          <div className="score-circle">
            <div>
              <strong>{percentage}%</strong>
              <span>Score</span>
            </div>
          </div>

          <div className="score-info">
            <span className="label">TEST SCORE</span>
            <h2>
              {score}
              <span> / {state.totalMarks ?? "-"}</span>
            </h2>

            <p>{state.testTitle || "Online Test"}</p>

            <div className="progress-wrapper">
              <div className="progress-bar-custom">
                <div
                  className={`progress-fill ${passed ? "success" : "danger"}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <span>{percentage}% completed</span>
            </div>
          </div>
        </div>

        {/* Test Info */}
        <div className="score-card test-info-card">
          <div className="info-title">
            <span>📝</span>
            <h4>Test Information</h4>
          </div>

          <div className="info-grid">
            <div className="info-item">
              <span>Test ID</span>
              <strong>#{state.testId || "-"}</strong>
            </div>

            <div className="info-item">
              <span>Total Questions</span>
              <strong>{state.totalQuestions ?? "-"}</strong>
            </div>

            <div className="info-item">
              <span>Answered</span>
              <strong className="green-text">
                {state.answered ?? 0}
              </strong>
            </div>

            <div className="info-item">
              <span>Unanswered</span>
              <strong className="orange-text">
                {state.unanswered ?? 0}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="result-actions">
        <button
          className="result-btn download-btn"
          onClick={() => downloadResultPdf(state)}
        >
          <span>⬇</span>
          Download PDF
        </button>

        <Link
          to="/student/results"
          className="result-btn secondary-btn"
        >
          📊 My Results
        </Link>

        <Link
          to="/student"
          className="result-btn primary-btn"
        >
          🏠 Dashboard
        </Link>
      </div>

      {/* Review */}
      <div className="review-section">

        <div className="review-heading">
          <div>
            <span className="result-small-title">DETAILED ANALYSIS</span>
            <h2>Question-wise Review</h2>
            <p>Review your answers and improve your performance.</p>
          </div>

          <div className="review-badge">
            📚 {state.totalQuestions ?? 0} Questions
          </div>
        </div>

        <div className="review-card">
          <ResultReview details={state.details} />
        </div>

      </div>

    </div>
  );
}

export default Result;