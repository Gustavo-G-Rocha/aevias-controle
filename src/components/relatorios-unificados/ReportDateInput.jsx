import React from "react";
import { Input } from "@/components/ui/input";

// Native date input: value is always ISO (yyyy-mm-dd), onChange fires
// reliably for both manual interaction and automation frameworks, and no
// text parsing is needed. The browser renders the value in the user's
// locale (DD/MM/AAAA in pt-BR).
export default function ReportDateInput({ id, value, onValueChange, ...props }) {
  return (
    <Input
      id={id}
      type="date"
      value={value || ""}
      onChange={(e) => onValueChange(e.target.value)}
      {...props}
    />
  );
}