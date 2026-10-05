import { Fragment, useEffect, useState } from "react";
import api from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import ResultReview from "../components/ResultReview";
import { downloadResultPdf } from "../services/resultPdf";

function AdminResults() {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [titles, setTitles] = useState({}); // testid -> title
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/api/results"), api.get("/api/tests")])
      .then(([resRes, testsRes]) => {
        const map = {};
        testsRes.data.forEach((t) => (map[t.testid] = t.title));
        setTitles(map);
        setResults(resRes.data);
      })
      .catch((err) => console.error(err));
  }, []);

  const titleOf = (r) => titles[r.testId] || `Test ${r.testId}`;

  // Removes the result from the admin list only.
  // The student can still see it in "My Results".
  const deleteResult = async (r) => {
    const ok = window.confirm(
      `Delete this result?\n\nStudent: ${r.studentEmail || r.studentId}\nTest: ${titleOf(r)}\n\n` +
        "It will be removed from the admin list only. The student will still see it in My Results."
    );
    if (!ok) return;

    setDeletingId(r.id);
    try {
      await api.delete(`/api/results/${r.id}/admin`);
      setResults((prev) => prev.filter((x) => x.id !== r.id));
      if (openId === r.id) setOpenId(null);
    } catch (err) {
      console.error(err);
      alert("Delete failed ❌");
    } finally {
      setDeletingId(null);
    }
  };

  const q = search.toLowerCase();
  const filtered = results.filter(
    (r) =>
      (r.studentEmail || "").toLowerCase().includes(q) ||
      titleOf(r).toLowerCase().includes(q) ||
      String(r.testId) === search.trim()
  );

  return (
    <>
      <AdminNavbar />
      <div className="container mt-4">
        <div className="card shadow p-3">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">📈 All Student Results</h4>
            <input
              className="form-control w-auto"
              placeholder="Search email / test name / ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <p className="text-muted">No results found</p>
          ) : (
            <table className="table table-bordered table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Test</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <Fragment key={r.id}>
                    <tr>
                      <td>{i + 1}</td>
                      <td>{r.studentEmail || `ID ${r.studentId}`}</td>
                      <td>
                        {titleOf(r)} <small className="text-muted">(ID {r.testId})</small>
                      </td>
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
                            onClick={() => setOpenId(openId === r.id ? null : r.id)}
                          >
                            {openId === r.id ? "Hide" : "Details"}
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => downloadResultPdf({ ...r, testTitle: titleOf(r) })}
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={deletingId === r.id}
                          onClick={() => deleteResult(r)}
                        >
                          {deletingId === r.id ? "Deleting..." : "🗑 Delete"}
                        </button>
                      </td>
                    </tr>
                    {openId === r.id && (
                      <tr>
                        <td colSpan="8" className="bg-light">
                          <ResultReview details={r.details} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminResults;