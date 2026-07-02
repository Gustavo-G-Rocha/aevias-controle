import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyIdButton({ id }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copiar ID"
      className="inline-flex items-center gap-1 text-[10px] font-mono bg-black/10 hover:bg-secondary/20/40 px-1.5 py-0.5 rounded transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
      <span className="truncate max-w-[80px]">{id}</span>
    </button>
  );
}