import React from "react";

export default function SectionTitle({ children, className = "" }) {
  return (
    <tr>
      <td
        colSpan={2}
        className={`bg-[#00233B] text-white font-semibold text-sm py-2 px-3 ${className}`}
      >
        {children}
      </td>
    </tr>
  );
}