import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

const displayDate = (iso) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || "")) return "";
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
};

const parseDate = (text) => {
  const value = text.trim();
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
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export default function ReportDateInput({ id, value, onValueChange, ...props }) {
  const ref = useRef(null);
  const [text, setText] = useState(displayDate(value));
  useEffect(() => setText(displayDate(value)), [value]);

  const commit = (raw) => {
    const parsed = parseDate(raw);
    if (parsed) {
      onValueChange(parsed);
      setText(displayDate(parsed));
    }
    return parsed;
  };

  const commitRef = useRef(commit);
  commitRef.current = commit;

  const handleChange = (event) => {
    const next = event.currentTarget.value;
    setText(next);
    commit(next);
  };

  const handleBlur = (event) => {
    if (!commit(event.currentTarget.value)) {
      setText(displayDate(value));
    }
  };

  // Some automation frameworks set the value and dispatch only a native
  // 'change' event (which React's onChange does NOT surface for text
  // inputs), leaving the parent state empty and the form stuck. This
  // listener commits the parsed value from the actual DOM value.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e) => commitRef.current(e.target.value);
    el.addEventListener("change", handler);
    return () => el.removeEventListener("change", handler);
  }, []);

  return <Input ref={ref} id={id} type="text" inputMode="numeric" placeholder="DD/MM/AAAA" value={text} onInput={handleChange} onChange={handleChange} onBlur={handleBlur} {...props} />;
}