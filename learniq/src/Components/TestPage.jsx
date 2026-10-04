import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { getScheduleStatus } from "../services/schedule";
import javaTest from "../JsonQuestions/javaTest.json";
import sqlTest from "../JsonQuestions/sqlTest.json";
import pythonTest from "../JsonQuestions/pythonTest.json";
import javascriptTest from "../JsonQuestions/javascriptTest.json"; // Add this line for JavaScript test

// Test ID -> question bank (navin test add kelyavar ithe ek line add kara)
const QUESTION_BANKS = {
  14: javaTest,
  15: sqlTest,
  16: pythonTest,
  17: javascriptTest,
 
};

const QUESTIONS_PER_TEST = 20; // bank madhun kiti questions dyaychi (kami asatil tar jitke aahet titke)

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const answersRef = useRef({});
  const submittedRef = useRef(false);
  const questionsRef = useRef([]);
  const totalMarksRef = useRef(null);

  const studentId = localStorage.getItem("studentId");
  const timerKey = `testEnd_${studentId}_${testId}`;
  const paperKey = `paper_${studentId}_${testId}`;

  // 1) Questions load (src/JsonQuestion/javatest.json) + random paper
  useEffect(() => {
    const saved = localStorage.getItem(paperKey);
    if (saved) {
      const prepared = JSON.parse(saved);
      setQuestions(prepared);
      questionsRef.current = prepared;
      return;
    }

    const data = QUESTION_BANKS[testId];
    if (!data) {
      console.log("Ya test sathi question bank nahi:", testId);
      return;
    }

    const prepared = shuffle(data)
      .slice(0, QUESTIONS_PER_TEST)
      .map((q) => ({ ...q, options: shuffle(q.options) }));
    localStorage.setItem(paperKey, JSON.stringify(prepared));
    setQuestions(prepared);
    questionsRef.current = prepared;
  }, [testId]);

  // 2) Test duration + schedule check + total marks
  useEffect(() => {
    api
      .get("/api/tests")
      .then((res) => {
        const test = res.data.find((t) => String(t.testid) === String(testId));
        if (!test) return;

        totalMarksRef.current = test.totalmarks;

        const { status, label } = getScheduleStatus(test);
        if (status !== "open") {
          alert(`Test is not open: ${label} ❌`);
          navigate("/student");
          return;
        }

        const durationMin = Number(test.duration);
        if (!durationMin) return;

        const saved = localStorage.getItem(timerKey);
        let end = saved ? Number(saved) : null;
        if (!end) {
          end = Date.now() + durationMin * 60 * 1000;
          localStorage.setItem(timerKey, String(end));
        }
        setEndTime(end);
      })
      .catch((err) => console.log("Error fetching test:", err));
  }, [testId]);

  // 3) Countdown
  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        submitTest(true);
      }
    };

    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [endTime]);

  const handleOptionChange = (questionId, optionId) => {
    answersRef.current = { ...answersRef.current, [questionId]: optionId };
  };

  // 4) Submit + score (frontend)
  const submitTest = (auto = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;

    if (auto) alert("Time is up ⏰ Test auto-submitted");

    const qs = questionsRef.current;
    const totalQuestions = qs.length;
    const answered = Object.keys(answersRef.current).length;

    const correct = qs.reduce(
      (sum, q) =>
        sum + (answersRef.current[q.questionId] === q.correctOptionId ? 1 : 0),
      0
    );

    // marks per question = totalMarks / totalQuestions
    const totalMarks = Number(totalMarksRef.current) || totalQuestions;
    const score = totalQuestions
      ? Math.round((correct * totalMarks) / totalQuestions)
      : 0;
    const status = score >= totalMarks / 2 ? "PASS" : "FAIL";

    localStorage.removeItem(timerKey);
    localStorage.removeItem(paperKey);

    // Question-wise review (student + PDF + admin sathi)
    const details = qs.map((q, i) => {
      const sel = (q.options || []).find((o) => o.optionId === answersRef.current[q.questionId]);
      const cor = (q.options || []).find((o) => o.optionId === q.correctOptionId);
      return {
        no: i + 1,
        question: q.questionText,
        selected: sel ? sel.optionText : null,
        correct: cor ? cor.optionText : null,
        isCorrect: !!sel && sel.optionId === q.correctOptionId,
      };
    });

    const resultState = {
      studentEmail: localStorage.getItem("email"),
      submittedAt: new Date().toISOString(),
      details: JSON.stringify(details),
      testId,
      score,
      totalMarks,
      status,
      totalQuestions,
      answered,
      unanswered: totalQuestions - answered,
    };

    // Result backend la save kara (admin la disnyasathi)
    api
      .post("/api/results", {
        studentId: Number(studentId),
        studentEmail: localStorage.getItem("email"),
        testId: Number(testId),
        score,
        totalMarks,
        status,
        totalQuestions,
        answered,
        unanswered: totalQuestions - answered,
        details: JSON.stringify(details),
      })
      .catch((err) => console.log("Result save error:", err))
      .finally(() => navigate("/student/result", { state: resultState }));
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center sticky-top bg-white py-2 mb-3 border-bottom">
        <h3 className="mb-0">Student Test ID: {testId}</h3>
        {timeLeft !== null && (
          <span className={`badge fs-5 ${timeLeft <= 60 ? "bg-danger" : "bg-primary"}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </div>

      {questions.length === 0 && <p>Loading questions...</p>}

      {questions.map((q, index) => (
        <div key={q.questionId} className="card p-3 mb-3">
          <h5>{index + 1}. {q.questionText}</h5>

          {(q.options || []).map((opt) => (
            <div key={opt.optionId} className="form-check">
              <input
                type="radio"
                name={`q_${q.questionId}`}
                id={`opt_${opt.optionId}`}
                className="form-check-input"
                onChange={() => handleOptionChange(q.questionId, opt.optionId)}
              />
              <label className="form-check-label" htmlFor={`opt_${opt.optionId}`}>
                {opt.optionText}
              </label>
            </div>
          ))}
        </div>
      ))}

      {questions.length > 0 && (
        <button className="btn btn-primary" onClick={() => submitTest(false)}>
          Submit Test
        </button>
      )}
    </div>
  );
}

export default TestPage;
