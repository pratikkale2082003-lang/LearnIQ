// Test schedule status: "open" | "upcoming" | "expired" | "unscheduled"
const pad = (n) => String(n).padStart(2, "0");

export function formatCountdown(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Backend LocalDateTime pathavto: "2026-10-01T21:05:00" (kinva array [2026,10,1,21,5])
// Tyatun date ani time donhi kadhto
export function getScheduleParts(test) {
  const raw = test?.scheduleDate ?? null;
  if (!raw) return { date: null, time: null };

  // Array format: [y, m, d, h, min, sec]
  if (Array.isArray(raw)) {
    const [y, mo, d, h = 0, mi = 0, s = 0] = raw;
    return {
      date: `${y}-${pad(mo)}-${pad(d)}`,
      time: `${pad(h)}:${pad(mi)}:${pad(s)}`,
    };
  }

  // String format: "2026-10-01T21:05:00" kinva "2026-10-01 21:05:00"
  const [datePart, timePart] = String(raw).split(/[T ]/);
  let time = timePart ? timePart.slice(0, 8) : null;

  // Time scheduleDate madhe nasel tar vegla scheduleTime field (jar asel) vapra
  if (!time && test?.scheduleTime) time = String(test.scheduleTime).slice(0, 8);
  if (time && time.length === 5) time += ":00";

  return { date: datePart || null, time };
}

// Table madhe dakhvayla: "2026-10-01 21:05"
export function formatSchedule(test) {
  const { date, time } = getScheduleParts(test);
  if (!date) return "-";
  return time ? `${date} ${time.slice(0, 5)}` : date;
}

export function getScheduleStatus(test, nowMs = Date.now()) {
  const { date, time } = getScheduleParts(test);

  if (!date) {
    return { status: "unscheduled", label: "Not Scheduled" };
  }

  // Time nasel tar test open karu naka
  if (!time) {
    return { status: "unscheduled", label: "Time not set" };
  }

  const startsAt = new Date(`${date}T${time}`).getTime(); // local time
  if (Number.isNaN(startsAt)) {
    return { status: "unscheduled", label: "Invalid Schedule" };
  }

  const endOfDay = new Date(`${date}T23:59:59`).getTime();

  if (nowMs > endOfDay) {
    return { status: "expired", label: "Expired" };
  }

  if (nowMs < startsAt) {
    const diff = startsAt - nowMs;
    const label =
      diff < 24 * 60 * 60 * 1000
        ? `Starts in ${formatCountdown(diff)}`
        : `Starts on ${date} ${time.slice(0, 5)}`;
    return { status: "upcoming", label, startsAt };
  }

  return { status: "open", label: "Start Test", startsAt };
}