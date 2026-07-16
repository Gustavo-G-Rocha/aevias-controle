import React, { useEffect, useState } from "react";
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
  const [text, setText] = useState(displayDate(value));
  useEffect(() => setText(displayDate(value)), [value]);

  const handleChange = (event) => {
    const next = event.target.value;
    setText(next);
    const parsed = parseDate(next);
    if (parsed) onValueChange(parsed);
  };

  return <Input id={id} type="text" inputMode="numeric" placeholder="DD/MM/AAAA" value={text} onChange={handleChange} onBlur={() => setText(displayDate(value))} {...props} />;
}