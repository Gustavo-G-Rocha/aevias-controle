import React from "react";
import { AlertTriangle } from "lucide-react";

export default function EmptyChart({ text, height = 280 }) {
  return (
    <div className="flex flex-col items-center justify-center text-[#00233B]/50" style={{ height }}>
      <AlertTriangle className="w-10 h-10 mb-2 opacity-30" />
      <p className="text-sm text-center px-4">{text}</p>
    </div>
  );
}