import { useLocation, Link } from "react-router-dom";
import ResultReview from "../components/ResultReview";
import { downloadResultPdf } from "../services/resultPdf";

function Result() {
  const { state } = useLocation();

  if (!state) return <h4 className="container mt-4">No result found</h4>;

  const passed = String(state.status).toUpperCase() === "PASS";

  return (
    <div className="container mt-4 mb-5">
      <h3>Test Result</h3>
      <div className="card p-3 mb-3">
        <p><b>Test:</b> {state.testTitle || "-"} <span className="text-muted">(ID {state.testId})</span></p>
        <p><b>Score:</b> {state.score} / {state.totalMarks ?? "-"}</p>
        <p>
          <b>Status:</b>{" "}
          <span className={`badge ${passed ? "bg-success" : "bg-danger"}`}>{state.status}</span>
        </p>
        <hr />
        <p><b>Total questions:</b> {state.totalQuestions}</p>
        <p><b>Answered:</b> {state.answered}</p>
        <p><b>Unanswered:</b> {state.unanswered}</p>

        <div className="d-flex gap-2">
          <button className="btn btn-danger" onClick={() => downloadResultPdf(state)}>
            ⬇ Download PDF
          </button>
          <Link to="/student/results" className="btn btn-outline-primary">My Results</Link>
          <Link to="/student" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>

      <h5>Question-wise Review</h5>
      <ResultReview details={state.details} />
    </div>
  );
}

export default Result;
