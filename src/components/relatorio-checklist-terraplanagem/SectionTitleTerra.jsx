import React from 'react';

export default function SectionTitleTerra({ children }) {
  return (
    <h2 className="text-sm print:text-xs font-bold text-center bg-slate-100 p-0.5 my-0.5 uppercase tracking-wider">
      {children}
    </h2>
  );
}