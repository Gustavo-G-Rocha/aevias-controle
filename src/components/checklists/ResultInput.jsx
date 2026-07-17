import React, { useEffect, useRef } from "react";

// Uncontrolled input — stores value locally, never resets from parent
export default function ResultInput({ value, onCommit, disabled, placeholder, style }) {
  const inputRef = useRef(null);

  // Sync value when it changes externally (e.g. loading saved data)
  useEffect(() => {
    if (inputRef.current) {
      const current = inputRef.current.value;
      const incoming = value != null ? String(value) : '';
      if (current !== incoming) {
        inputRef.current.value = incoming;
      }
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      defaultValue={value != null ? String(value) : ''}
      onChange={(e) => {
        // Allow only numbers, comma, dot, and minus
        const raw = e.target.value;
        const filtered = raw.replace(/[^0-9.,\-]/g, '');
        if (raw !== filtered) e.target.value = filtered;
        onCommit(filtered);
      }}
      disabled={disabled}
      className="h-8 text-sm flex w-full rounded-md border border-input bg-background px-3 py-1 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      style={style}
      placeholder={placeholder}
    />
  );
}