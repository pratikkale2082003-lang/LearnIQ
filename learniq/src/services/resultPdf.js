import jsPDF from "jspdf";

// details string asel tar parse kara
export const parseDetails = (d) => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  try { return JSON.parse(d); } catch { return []; }
};

export const summarize = (details) => {
  const attempted = details.filter((d) => d.selected);
  const correct = attempted.filter((d) => d.isCorrect).length;
  return {
    correct,
    wrong: attempted.length - correct,
    unanswered: details.length - attempted.length,
  };
};

export function downloadResultPdf(r) {
  const details = parseDetails(r.details);
  const sm = summarize(details);

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 14, maxW = 210 - 2 * M;
  let y = M;

  const write = (text, { size = 10, bold = false, color = [0, 0, 0], indent = 0, gap = 1.5 } = {}) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lh = size * 0.3528 * 1.4;
    doc.splitTextToSize(String(text), maxW - indent).forEach((line) => {
      if (y + lh > 285) { doc.addPage(); y = M; }
      doc.text(line, M + indent, y + lh * 0.8);
      y += lh;
    });
    y += gap;
  };

  write("LearniQ - Test Result", { size: 18, bold: true, color: [78, 115, 223], gap: 3 });
  write(`Student: ${r.studentEmail || localStorage.getItem("email") || "-"}`);
  write(`Test: ${r.testTitle || "-"} (ID ${r.testId})`);
  write(`Score: ${r.score} / ${r.totalMarks ?? "-"}    Status: ${r.status}`, { bold: true });
  write(`Total: ${r.totalQuestions}   Correct: ${sm.correct}   Wrong: ${sm.wrong}   Unanswered: ${sm.unanswered}`, { gap: 4 });

  if (details.length === 0) {
    write("Detailed answers are not available for this result.");
  } else {
    write("Question-wise Review", { size: 13, bold: true, gap: 3 });
    details.forEach((d) => {
      const attempted = !!d.selected;
      const tag = !attempted ? "NOT ATTEMPTED" : d.isCorrect ? "CORRECT" : "WRONG";
      const col = !attempted ? [120, 120, 120] : d.isCorrect ? [25, 135, 84] : [220, 53, 69];
      write(`Q${d.no}. ${d.question}`, { bold: true, gap: 0.5 });
      write(`Your answer: ${d.selected || "-"}   [${tag}]`, { color: col, indent: 4, gap: 0.5 });
      if (!d.isCorrect) write(`Correct answer: ${d.correct}`, { color: [25, 135, 84], indent: 4 });
      y += 2.5;
    });
  }

  doc.save(`result_test${r.testId}.pdf`);
}
