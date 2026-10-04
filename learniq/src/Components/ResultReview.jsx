import { parseDetails, summarize } from "../services/resultPdf";

function ResultReview({ details }) {
  const list = parseDetails(details);
  if (list.length === 0)
    return <p className="text-muted">Detailed answers available nahit (junya result sathi).</p>;

  const sm = summarize(list);

  return (
    <>
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <span className="badge bg-success">Correct: {sm.correct}</span>
        <span className="badge bg-danger">Wrong: {sm.wrong}</span>
        <span className="badge bg-secondary">Unanswered: {sm.unanswered}</span>
      </div>

      {list.map((d) => {
        const attempted = !!d.selected;
        const border = !attempted ? "border-secondary" : d.isCorrect ? "border-success" : "border-danger";
        return (
          <div key={d.no} className={`card p-3 mb-2 border-2 ${border}`}>
            <b>{d.no}. {d.question}</b>
            <div className={attempted ? (d.isCorrect ? "text-success" : "text-danger") : "text-muted"}>
              Your answer: {d.selected || "Not attempted"}{" "}
              {attempted && (d.isCorrect ? "✅" : "❌")}
            </div>
            {!d.isCorrect && (
              <div className="text-success">Correct answer: {d.correct}</div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default ResultReview;
