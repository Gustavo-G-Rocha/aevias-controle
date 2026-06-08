import React from "react";

export default function SubSectionTitle({ children }) {
  return (
    <tr>
      <td
        colSpan={2}
        className="bg-slate-200 text-slate-800 font-semibold text-xs py-1.5 px-3 uppercase tracking-wide"
      >
        {children}
      </td>
    </tr>
  );
}