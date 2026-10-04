import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function TestList() {
  const [tests, setTests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      const res = await api.get("/api/tests");
      setTests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const requestTest = async (testId) => {
    try {
      await api.post("/api/test-requests", { testId });
      alert("Request sent ✅");
    } catch {
      alert("Request failed ❌");
    }
  };

  return (
    <div className="container mt-3">
      <h4>Available Tests</h4>

      {tests.length === 0 && <p>No tests available</p>}

      {tests.map(test => (
        <div key={test.id} className="card p-3 mb-3">
          <h5>{test.title}</h5>

          <button className="btn btn-success me-2"
            onClick={() => navigate(`/test/${test.id}`)}>
            Start Test
          </button>

          <button className="btn btn-outline-primary"
            onClick={() => requestTest(test.id)}>
            Request Test
          </button>
        </div>
      ))}
    </div>
  );
}

export default TestList;
