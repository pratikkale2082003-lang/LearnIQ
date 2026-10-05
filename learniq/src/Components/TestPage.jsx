import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import api from "../services/api";
import { getScheduleStatus } from "../services/schedule";
import javaTest from "../JsonQuestions/javaTest.json";
import sqlTest from "../JsonQuestions/sqlTest.json";
import pythonTest from "../JsonQuestions/pythonTest.json";
import javascriptTest from "../JsonQuestions/javascriptTest.json";
import javaCoreAdvancedTest from "../JsonQuestions/javaCoreAdvancedTest.json";
import "../CSS/TestPage.css";

// ===== Test ID -> question bank =====
// Keep YOUR own ids here (the id is shown in the ID column on the student dashboard).
const QUESTION_BANKS = {
  14: javaTest,
  15: sqlTest,
  16: pythonTest,
  17: javascriptTest,
  18: javaCoreAdvancedTest,
};

// Used only when a test has no total marks (marks = 0).
// Otherwise: number of questions = total marks (1 mark per question).
const DEFAULT_QUESTIONS = 20;

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
  const [testTitle, setTestTitle] = useState("");

  // UI state
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> optionId
  const [visited, setVisited] = useState({ 0: true }); // index -> true
  const [marked, setMarked] = useState({}); // questionId -> true
  const [profile, setProfile] = useState(null); // registration details + profile image

  const answersRef = useRef({});
  const submittedRef = useRef(false);
  const questionsRef = useRef([]);
  const totalMarksRef = useRef(null);
  const testTitleRef = useRef("");
  const cardRef = useRef(null);
  const firstRender = useRef(true);

  const studentId = localStorage.getItem("studentId");
  const studentEmail = localStorage.getItem("email") || "-";
  const timerKey = `testEnd_${studentId}_${testId}`;
  const paperKey = `paper_${studentId}_${testId}`;

  // 0) Load the student's profile (name + image uploaded at registration)
  useEffect(() => {
    if (!studentId) return;
    api
      .get(`/api/auth/profile/${studentId}`)
      .then((res) => setProfile(res.data))
      .catch((err) => console.log("Profile load error:", err));
  }, [studentId]);

  // 1) Restore the saved paper (so a refresh does not change the questions)
  useEffect(() => {
    const saved = localStorage.getItem(paperKey);
    if (saved) {
      const prepared = JSON.parse(saved);
      setQuestions(prepared);
      questionsRef.current = prepared;
    }
  }, [testId]);

  // 2) Test duration + schedule check + total marks
  useEffect(() => {
    api
      .get("/api/tests")
      .then((res) => {
        const test = res.data.find((t) => String(t.testid) === String(testId));
        if (!test) return;

        totalMarksRef.current = test.totalMarks ?? test.totalmarks;
        testTitleRef.current = test.title;
        setTestTitle(test.title);

        const { status, label } = getScheduleStatus(test);
        if (status !== "open") {
          alert(`Test is not open: ${label} ❌`);
          navigate("/student");
          return;
        }

        // Build the paper once: number of questions = total marks (1 mark per question)
        if (!localStorage.getItem(paperKey)) {
          const bank = QUESTION_BANKS[testId];
          if (!bank) {
            console.log("No question bank for this test id:", testId);
          } else {
            const marks = Number(test.totalMarks ?? test.totalmarks);
            const count = Math.min(marks > 0 ? marks : DEFAULT_QUESTIONS, bank.length);
            const prepared = shuffle(bank)
              .slice(0, count)
              .map((q) => ({ ...q, options: shuffle(q.options) }));
            localStorage.setItem(paperKey, JSON.stringify(prepared));
            setQuestions(prepared);
            questionsRef.current = prepared;
          }
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

  // Mark the question as visited + scroll to it on mobile
  useEffect(() => {
    setVisited((v) => ({ ...v, [current]: true }));
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (window.innerWidth < 900 && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [current]);

  // ----- answer actions -----
  const handleOptionChange = (questionId, optionId) => {
    answersRef.current = { ...answersRef.current, [questionId]: optionId };
    setAnswers(answersRef.current);
  };

  const toggleMark = (questionId) =>
    setMarked((m) => {
      const next = { ...m };
      if (next[questionId]) delete next[questionId];
      else next[questionId] = true;
      return next;
    });

  const goTo = (i) => {
    if (i < 0 || i >= questions.length) return;
    setCurrent(i);
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
      testTitle: testTitleRef.current,
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

  // Submit button: ask for confirmation first
  const confirmSubmit = () => {
    const unanswered = questions.length - Object.keys(answersRef.current).length;
    const msg =
      unanswered > 0
        ? `You have ${unanswered} unanswered question(s). Submit anyway?`
        : "Submit the test?";
    if (window.confirm(msg)) submitTest(false);
  };

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  // status of one question: review | done | seen | new
  const statusOf = (q, i) => {
    if (marked[q.questionId]) return "review";
    if (answers[q.questionId]) return "done";
    if (visited[i]) return "seen";
    return "new";
  };

  const counts = { new: 0, seen: 0, done: 0, review: 0 };
  questions.forEach((q, i) => {
    counts[statusOf(q, i)]++;
  });

  const q = questions[current];

  const studentName =
    (profile ? `${profile.firstname ?? ""} ${profile.lastname ?? ""}`.trim() : "") ||
    (studentEmail !== "-" ? studentEmail.split("@")[0] : "Student");
  const initials =
    studentName.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "S";
  const attempted = counts.done + counts.review;
  const progress = questions.length ? (attempted / questions.length) * 100 : 0;

  return (
    <div className="tp-page">
      {/* ===== Top bar: test title + timer (always visible) ===== */}
      <div className="tp-topbar">
        <div className="tp-topbar-title">{testTitle || `Test ${testId}`}</div>
        {timeLeft !== null && (
          <span className={`tp-timer ${timeLeft <= 60 ? "low" : ""}`}>
            ⏱ {formatTime(timeLeft)}
          </span>
        )}
      </div>
      <div className="tp-progress">
        <div className="tp-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {!q ? (
        <p className="tp-loading">Loading questions...</p>
      ) : (
        <div className="tp-shell">
          {/* ================= LEFT: question ================= */}
          <section className="tp-left" ref={cardRef}>
            <div className="tp-q-head">
              <h5 className="tp-q-no">Question {current + 1}</h5>
              <span className="tp-q-of">of {questions.length}</span>
            </div>
            <p className="tp-q-text">{q.questionText}</p>

            <div className="tp-opts">
              {(q.options || []).map((opt, idx) => (
                <label
                  key={opt.optionId}
                  htmlFor={`opt_${opt.optionId}`}
                  className={`tp-opt ${answers[q.questionId] === opt.optionId ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`q_${q.questionId}`}
                    id={`opt_${opt.optionId}`}
                    checked={answers[q.questionId] === opt.optionId}
                    onChange={() => handleOptionChange(q.questionId, opt.optionId)}
                  />
                  <span className="tp-opt-letter">{String.fromCharCode(97 + idx)}</span>
                  <span className="tp-opt-text">{opt.optionText}</span>
                </label>
              ))}
            </div>

            <div className="tp-actions">
              <button
                className={`tp-btn review ${marked[q.questionId] ? "on" : ""}`}
                onClick={() => toggleMark(q.questionId)}
              >
                {marked[q.questionId] ? "Unmark review" : "Mark review"}
              </button>
              <button
                className="tp-btn save"
                onClick={() => goTo(current + 1)}
                disabled={current === questions.length - 1}
              >
                Save and next
              </button>
              <button
                className="tp-btn"
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
              >
                Previous
              </button>
            </div>
          </section>

          {/* ================= RIGHT: student, photo, counts, numbers ================= */}
          <aside className="tp-right">
            <div className="tp-who">
              <div className="tp-who-text">
                <span className="tp-who-label">Student</span>
                <span className="tp-who-name" title={studentName}>{studentName}</span>
                <span className="tp-who-email" title={studentEmail}>✉ {studentEmail}</span>
                {profile?.rollNo && <span className="tp-who-roll">Roll No: {profile.rollNo}</span>}
              </div>
              <div className="tp-avatar">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt={studentName} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </div>

            <div className="tp-stats">
              <p className="tp-stats-total">Total questions: {questions.length}</p>
              <div className="tp-stats-grid">
                <span>Not visited</span><b>{counts.new}</b>
                <span>Not answered</span><b>{counts.seen}</b>
                <span>Answered</span><b>{counts.done}</b>
                <span>Mark review</span><b>{counts.review}</b>
              </div>
            </div>

            <div className="tp-nums">
              {questions.map((qq, i) => (
                <button
                  key={qq.questionId}
                  className={`tp-num ${statusOf(qq, i)} ${i === current ? "current" : ""}`}
                  onClick={() => goTo(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="tp-legend">
              <span><i className="done" />Answered</span>
              <span><i className="seen" />Not answered</span>
              <span><i className="review" />Mark review</span>
              <span><i className="new" />Not visited</span>
            </div>

            <div className="tp-bottom">
              <button
                className="tp-btn"
                onClick={() => goTo(current - 1)}
                disabled={current === 0}
              >
                Previous
              </button>
              <button className="tp-btn submit" onClick={confirmSubmit}>
                Submit
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}

export default TestPage;