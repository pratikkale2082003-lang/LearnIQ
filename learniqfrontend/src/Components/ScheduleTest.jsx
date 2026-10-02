import { useEffect, useState } from "react";
import api from "../services/api";

function ScheduleTest() {
  const [tests, setTests] = useState([]);
  const [testId, setTestId] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [loading, setLoading] = useState(false);

  // local today's date (YYYY-MM-DD) - junya date select karu det nahi
  const today = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    api.get("/api/tests")
      .then(res => setTests(res.data))
      .catch(err => console.error(err));
  }, []);

  const scheduleTest = async () => {
    if (!testId || !scheduleDate || !scheduleTime) {
      alert("Fill all fields ❌");
      return;
    }

    // Past date / past time validation
    if (scheduleDate < today) {
      alert("Past date select karu naka ❌");
      return;
    }
    if (scheduleDate === today) {
      const now = new Date().toTimeString().slice(0, 5);
      if (scheduleTime < now) {
        alert("Past time select karu naka ❌");
        return;
      }
    }

    setLoading(true);
    try {
      await api.post("/api/tests/schedule", {
        testId: Number(testId),
        scheduleDate,
        scheduleTime
      });
      alert("Test Scheduled ✅");
      setTestId(""); setScheduleDate(""); setScheduleTime("");
    } catch {
      alert("Schedule failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Schedule Test</h3>

      <select
        className="form-control mb-2"
        value={testId}
        onChange={e => setTestId(e.target.value)}
      >
        <option value="">-- Select Test --</option>
        {tests.map(t => (
          <option key={t.testid} value={t.testid}>{t.title}</option>
        ))}
      </select>

      <input
        type="date"
        className="form-control mb-2"
        min={today}
        value={scheduleDate}
        onChange={e => setScheduleDate(e.target.value)}
      />
      <input
        type="time"
        className="form-control mb-2"
        value={scheduleTime}
        onChange={e => setScheduleTime(e.target.value)}
      />

      <button className="btn btn-primary" onClick={scheduleTest} disabled={loading}>
        {loading ? "Scheduling..." : "Schedule Test"}
      </button>
    </div>
  );
}

export default ScheduleTest;