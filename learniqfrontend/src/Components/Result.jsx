import { useLocation, Link } from "react-router-dom";

function Result() {
  const { state } = useLocation();

  if (!state) return <h4 className="container mt-4">No result found</h4>;

  const passed = String(state.status).toUpperCase() === "PASS";

  return (
    <div className="container mt-4">
      <h3>Test Result</h3>
      <div className="card p-3">
        <p><b>Test ID:</b> {state.testId}</p>
        <p><b>Score:</b> {state.score}</p>
        <p><b>Total Marks:</b> {state.totalMarks ?? "-"}</p>
        <p>
          <b>Status:</b>{" "}
          <span className={`badge ${passed ? "bg-success" : "bg-danger"}`}>
            {state.status}
          </span>
        </p>
        <hr />
        <p><b>Total number of questions:</b> {state.totalQuestions}</p>
        <p><b>Number of answered questions:</b> {state.answered}</p>
        <p><b>Number of unanswered questions:</b> {state.unanswered}</p>

        <Link to="/student" className="btn btn-primary mt-2">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Result;