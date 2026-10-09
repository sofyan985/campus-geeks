const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/// All dates are shown and parsed in campus time, regardless of the server's zone.
export const CAMPUS_TIMEZONE = process.env.NEXT_PUBLIC_CAMPUS_TIMEZONE ?? "Asia/Karachi";

const offsetFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: CAMPUS_TIMEZONE,
  timeZoneName: "longOffset",
});

function offsetMs(date: Date) {
  const name = offsetFormatter.formatToParts(date).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{2}):?(\d{2})?/.exec(name);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0)) * 60_000;
}

/// A Date whose UTC getters return campus wall-clock values.
function shifted(date: Date) {
  return new Date(date.getTime() + offsetMs(date));
}

function unshift(wall: Date) {
  const guess = new Date(wall.getTime() - offsetMs(wall));
  return new Date(wall.getTime() - offsetMs(guess));
}

export function campusDayIndex(date: Date) {
  return shifted(date).getUTCDay();
}

export function fromCampusLocal(date: string, time = "00:00") {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  if ([y, m, d, h, mi].some((n) => !Number.isFinite(n))) return null;
  return unshift(new Date(Date.UTC(y, m - 1, d, h, mi)));
}

export function formatTime(date: Date) {
  const wall = shifted(date);
  const hours = wall.getUTCHours();
  const minutes = wall.getUTCMinutes();
  const suffix = hours >= 12 ? "PM" : "AM";
  const display = hours % 12 === 0 ? 12 : hours % 12;
  return `${display}:${minutes.toString().padStart(2, "0")} ${suffix}`;
}

export function formatDay(date: Date) {
  return DAY[campusDayIndex(date)];
}

export function formatShortDate(date: Date) {
  const wall = shifted(date);
  return `${wall.getUTCDate()} ${MONTH[wall.getUTCMonth()].slice(0, 3)}`;
}

export function formatLongDate(date: Date) {
  const wall = shifted(date);
  return `${DAY[wall.getUTCDay()]}, ${wall.getUTCDate()} ${MONTH[wall.getUTCMonth()]}`;
}

export function formatDateTime(date: Date) {
  return `${formatDay(date)} · ${formatTime(date)}`;
}

export function formatCost(cost: number) {
  return cost > 0 ? `Rs. ${cost.toLocaleString("en-PK")}` : "Free";
}

export function startOfDay(date: Date) {
  const wall = shifted(date);
  wall.setUTCHours(0, 0, 0, 0);
  return unshift(wall);
}

export function addDays(date: Date, days: number) {
  const wall = shifted(date);
  wall.setUTCDate(wall.getUTCDate() + days);
  return unshift(wall);
}

export function relativeLabel(date: Date, now = new Date()) {
  const today = startOfDay(now);
  const target = startOfDay(date);
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return "Tonight";
  if (diff === 1) return "Tomorrow";
  if (diff > 1 && diff < 7) return formatDay(date);
  return formatShortDate(date);
}

export function toInputValue(date: Date) {
  const wall = shifted(date);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}`;
}
