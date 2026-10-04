import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import { getScheduleStatus, formatSchedule } from "../services/schedule";

function StudentDashboard() {
  const [tests, setTests] = useState([]);
  const [approvedTests, setApprovedTests] = useState([]);
  const [requestedIds, setRequestedIds] = useState([]);
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();

  const studentId = localStorage.getItem("studentId");
  const validStudent =
    studentId && studentId !== "undefined" && studentId !== "null";

  const fetchTests = async () => {
    try {
      const allTests = await api.get("/api/tests");
      setTests(allTests.data);

      const approved = await api.get(`/api/tests/student/${studentId}/approved`);
      setApprovedTests(approved.data);

      const requested = await api.get(`/api/tests/student/${studentId}/requests`);
      setRequestedIds(requested.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!validStudent) {
      localStorage.clear();
      navigate("/login");
      return;
    }
    fetchTests();
  }, [studentId]);

  // Dar 1 second la refresh, mhanje exact time la button apoap chalu hoto
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const requestTest = async (testId) => {
    setLoadingRequest(true);
    try {
      await api.post("/api/tests/student/request", {
        testId: Number(testId),
        studentId: Number(studentId),
      });
      alert("Request sent to admin ✅");
      fetchTests();
    } catch (err) {
      console.error(err);
      alert("Request failed ❌");
    } finally {
      setLoadingRequest(false);
    }
  };

  const isApproved = (testId) =>
    approvedTests.some((t) => t.testid === testId);

  if (!validStudent) return null;

  return (
    <>
      <StudentNavbar />

      <div className="container mt-4">
        {/* MY RESULTS BUTTON (NEW) */}
        <div className="d-flex justify-content-end mb-3">
          <button
            className="btn btn-outline-primary"
            onClick={() => navigate("/student/results")}
          >
            📈 My Results
          </button>
        </div>

        {/* AVAILABLE TESTS */}
        <div className="card shadow p-3 mb-4">
          <h4 className="mb-3">📘 Available Tests</h4>

          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Schedule</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test) => {
                const requested = requestedIds.includes(test.testid);
                const approved = isApproved(test.testid);
                return (
                  <tr key={test.testid}>
                    <td>{test.testid}</td>
                    <td>{test.title}</td>
                    <td>{formatSchedule(test)}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={approved || requested || loadingRequest}
                        onClick={() => requestTest(test.testid)}
                      >
                        {approved
                          ? "Approved"
                          : requested
                          ? "Requested"
                          : "Request to Start"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* APPROVED TESTS */}
        <div className="card shadow p-3">
          <h4 className="mb-3">✅ Approved Tests</h4>

          <table className="table table-bordered table-hover align-middle">
            <thead className="table-success">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Schedule</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedTests.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No approved tests yet
                  </td>
                </tr>
              ) : (
                approvedTests.map((test) => {
                  const { status, label } = getScheduleStatus(test, now);
                  const isOpen = status === "open";
                  return (
                    <tr key={test.testid}>
                      <td>{test.testid}</td>
                      <td>{test.title}</td>
                      <td>{formatSchedule(test)}</td>
                      <td>
                        <button
                          className={`btn btn-sm ${
                            isOpen ? "btn-success" : "btn-secondary"
                          }`}
                          disabled={!isOpen}
                          onClick={() => navigate(`/student/test/${test.testid}`)}
                        >
                          {label}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default StudentDashboard;