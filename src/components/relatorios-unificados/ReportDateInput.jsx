import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

const displayDate = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

const parseDate = (text) => {
  const value = (text || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!match) return null;
  let first = Number(match[1]);
  let second = Number(match[2]);
  const year = Number(match[3]);
  if (year < 2000 || year > 2100) return null;
  const monthFirst = first <= 12 && second > 12;
  const day = monthFirst ? second : first;
  const month = monthFirst ? first : second;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// Uncontrolled text input: the DOM holds the typed value (so automation
// fills never get overwritten by stale React state), and we read the live
// DOM value on every change/blur to parse + commit the ISO date to the
// parent. A native 'change' listener catches frameworks that dispatch
// only a native change event (React's onChange ignores those for text).
export default function ReportDateInput({ id, value, onValueChange, ...props }) {
  const ref = useRef(null);

  const commit = () => {
    const raw = ref.current?.value || "";
    const parsed = parseDate(raw);
    if (parsed) onValueChange(parsed);
  };
  const commitRef = useRef(commit);
  commitRef.current = commit;

  // Sync DOM value when the parent value changes externally (e.g. clearFilters).
  useEffect(() => {
    if (ref.current) ref.current.value = displayDate(value);
  }, [value]);

  // Native 'change' safety net for automation that dispatches only change.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => commitRef.current();
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, []);

  return (
    <Input
      ref={ref}
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="DD/MM/AAAA"
      defaultValue={displayDate(value)}
      onChange={commit}
      onBlur={commit}
      {...props}
    />
  );
}