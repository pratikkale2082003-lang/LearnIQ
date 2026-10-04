import { useEffect, useState } from "react";
import api from "../services/api";

function TestRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/api/tests/admin/requests");
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveTest = async (requestId) => {
    setLoading(true);
    try {
      await api.post("/api/tests/admin/approve", { requestId });
      alert("Request approved ✅");
      fetchRequests();
    } catch (err) {
      alert("Approval failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Student Test Requests</h3>

      {requests.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        <table className="table table-bordered mt-2">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Test ID</th>
              <th>Title</th>
              <th>Student ID</th>
              <th>Student Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.requestId}>
                <td>{r.requestId}</td>
                <td>{r.testid}</td>
                <td>{r.title}</td>
                <td>{r.studentId}</td>
                <td>{r.studentEmail || "-"}</td>
                <td>
                  <button
                    className="btn btn-success"
                    disabled={loading}
                    onClick={() => approveTest(r.requestId)}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TestRequests;