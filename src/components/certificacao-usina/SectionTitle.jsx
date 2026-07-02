import React from "react";

export default function SectionTitle({ children, className = "" }) {
  return (
    <tr>
      <td
        colSpan={2}
        className={`bg-muted text-foreground font-semibold text-sm py-2 px-3 ${className}`}
      >
        {children}
      </td>
    </tr>
  );
}