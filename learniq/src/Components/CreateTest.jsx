import { useState } from "react";
import api from "../services/api";

function CreateTest() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [totalmarks, setTotalmarks] = useState("");

  const createTest = async () => {
    if (!title || !description || !duration || !totalmarks) {
      alert("Fill all fields ❌");
      return;
    }

    try {
      await api.post("/api/tests", {
        title,
        description,
        duration: Number(duration),
        totalMarks: Number(totalmarks)   // backend field is "totalMarks"
      });
      alert("Test created ✅");
      setTitle(""); setDescription(""); setDuration(""); setTotalmarks("");
    } catch {
      alert("Test creation failed ❌");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Create Test</h3>
      <input type="text" placeholder="Title" className="form-control mb-2"
        value={title} onChange={e => setTitle(e.target.value)} />
      <input type="text" placeholder="Description" className="form-control mb-2"
        value={description} onChange={e => setDescription(e.target.value)} />
      <input type="number" placeholder="Duration (minutes)" className="form-control mb-2"
        value={duration} onChange={e => setDuration(e.target.value)} />
      <input type="number" placeholder="Total Marks" className="form-control mb-2"
        value={totalmarks} onChange={e => setTotalmarks(e.target.value)} />
      <button className="btn btn-success" onClick={createTest}>Create Test</button>
    </div>
  );
}

export default CreateTest;