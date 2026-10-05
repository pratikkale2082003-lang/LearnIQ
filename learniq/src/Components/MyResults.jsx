import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import { downloadResultPdf } from "../services/resultPdf";
import "../CSS/MyResults.css";

function MyResults() {
  const [results, setResults] = useState([]);
  const [titles, setTitles] = useState({}); // testid -> title
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  const studentId = localStorage.getItem("studentId");
  const studentEmail = localStorage.getItem("email") || "-";

  useEffect(() => {
    Promise.all([
      api.get(`/api/results/student/${studentId}`),
      api.get("/api/tests"),
    ])
      .then(([resRes, testsRes]) => {
        const map = {};
        testsRes.data.forEach((t) => (map[t.testid] = t.title));
        setTitles(map);
        setResults(resRes.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [studentId]);

  // Profile (name, roll no, image) - failure should not break the page
  useEffect(() => {
    if (!studentId) return;
    api
      .get(`/api/auth/profile/${studentId}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.log("Profile load error:", err));
  }, [studentId]);

  // Permanently deletes the result (also disappears for the admin)
  const deleteResult = async (rt) => {
    const ok = window.confirm(
      `Delete this result permanently?\n\nTest: ${rt.testTitle}\nScore: ${rt.score} / ${rt.totalMarks}\n\n` +
        "This cannot be undone and the admin will no longer see it either."
    );
    if (!ok) return;

    setDeletingId(rt.id);
    try {
      await api.delete(`/api/results/${rt.id}/student/${studentId}`);
      setResults((prev) => prev.filter((x) => x.id !== rt.id));
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    } finally {
      setDeletingId(null);
    }
  };

  const withTitle = (r) => ({
    ...r,
    testTitle: titles[r.testId] || `Test ${r.testId}`,
  });

  // Profile display values
  const fullName =
    (profile
      ? `${profile.firstname ?? ""} ${profile.lastname ?? ""}`.trim()
      : "") ||
    (studentEmail !== "-" ? studentEmail.split("@")[0] : "Student");

  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("") || "S";

  return (
    <div className="my-results-page">
      <StudentNavbar />

      <div className="container mt-4">
        {/* ============ PROFILE CARD ============ */}
        <div className="student-profile-card">
          <div className="profile-left">
            <div className="profile-image-wrapper">
              {profile?.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={fullName}
                  className="student-profile-image"
                />
              ) : (
                <div className="student-profile-image profile-initials">
                  {initials}
                </div>
              )}
            </div>

            <div className="student-basic-info">
              <h2>{fullName}</h2>
              <p className="student-role">🎓 Student</p>
            </div>
          </div>

          <div className="student-details">
            <div className="detail-item">
              <div className="detail-icon">✉️</div>
              <div>
                <small>Email</small>
                <strong>{studentEmail}</strong>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">🆔</div>
              <div>
                <small>Roll No</small>
                <strong>{profile?.rollNo || "-"}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ============ RESULTS CARD ============ */}
        <div className="results-card">
          <div className="results-header">
            <div>
              <h3>📈 My Results</h3>
              <p>All your test attempts and scores</p>
            </div>
            <div className="result-count">
              {results.length} <span>Tests</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-box">
              <div className="spinner-border text-primary" role="status"></div>
              <p>Loading your results...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="empty-results">
              <div className="empty-icon">📭</div>
              <h4>No results yet</h4>
              <p>Tumhi ajun konti test dili nahi.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table results-table align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Test</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => {
                    const rt = withTitle(r);
                    const passed = String(r.status).toUpperCase() === "PASS";
                    return (
                      <tr key={r.id}>
                        <td>
                          <span className="serial-number">{i + 1}</span>
                        </td>
                        <td className="test-name">
                          <strong>{rt.testTitle}</strong>
                          <small>ID {r.testId}</small>
                        </td>
                        <td>
                          <span className="score">{r.score}</span>
                          <span className="total-score"> / {r.totalMarks}</span>
                        </td>
                        <td>
                          <span
                            className={`status-badge ${passed ? "pass" : "fail"}`}
                          >
                            {passed ? "✓ PASS" : "✕ FAIL"}
                          </span>
                        </td>
                        <td className="date-text">
                          {r.submittedAt
                            ? new Date(r.submittedAt).toLocaleString()
                            : "-"}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() =>
                                navigate("/student/result", { state: rt })
                              }
                            >
                              👁 View
                            </button>
                            <button
                              className="pdf-btn"
                              onClick={() => downloadResultPdf(rt)}
                            >
                              ⬇ PDF
                            </button>
                            <button
                              className="delete-btn"
                              disabled={deletingId === r.id}
                              onClick={() => deleteResult(rt)}
                            >
                              {deletingId === r.id ? "Deleting..." : "🗑 Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="dashboard-button">
            <button onClick={() => navigate("/student")}>
              ← Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyResults;