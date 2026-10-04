import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import { downloadResultPdf } from "../services/resultPdf";

function MyResults() {
  const [results, setResults] = useState([]);
  const [titles, setTitles] = useState({}); // testid -> title
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const studentId = localStorage.getItem("studentId"); // fakt swatacha id

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

  // result sobat test cha naav jodto
  const withTitle = (r) => ({ ...r, testTitle: titles[r.testId] || `Test ${r.testId}` });

  return (
    <>
      <StudentNavbar />
      <div className="container mt-4">
        <div className="card shadow p-3">
          <h4 className="mb-3">📈 My Results</h4>

          {loading ? (
            <p>Loading...</p>
          ) : results.length === 0 ? (
            <p className="text-muted">Tumhi ajun konti test dili nahi.</p>
          ) : (
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
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
                  return (
                    <tr key={r.id}>
                      <td>{i + 1}</td>
                      <td>{rt.testTitle} <small className="text-muted">(ID {r.testId})</small></td>
                      <td>{r.score} / {r.totalMarks}</td>
                      <td>
                        <span className={`badge ${r.status === "PASS" ? "bg-success" : "bg-danger"}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : "-"}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => navigate("/student/result", { state: rt })}
                          >
                            View
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => downloadResultPdf(rt)}>
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="mt-3">
            <button className="btn btn-secondary" onClick={() => navigate("/student")}>
              ← Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MyResults;