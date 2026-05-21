/**
 * DetailPrimitives.jsx
 * Primitivos reutilizáveis para exibição de detalhes de projeto.
 */

export function DetailSection({ title, children }) {
  return (
    <div>
      {title && <h3 className="text-lg font-semibold text-[#00233B] mb-4">{title}</h3>}
      {children}
    </div>
  );
}

export function DetailItem({ label, value, unit }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex justify-between items-center py-1 border-b border-[#00233B]/10 last:border-0">
      <span className="text-sm text-[#00233B]/70 font-medium">{label}</span>
      <span className="text-sm text-[#00233B] font-semibold">
        {value}{unit ? ` ${unit}` : ''}
      </span>
    </div>
  );
}

export function DetailRange({ label, min, max, otimo, unit }) {
  if ((min === null || min === undefined) && (max === null || max === undefined)) return null;
  const fmt = v => (v !== null && v !== undefined) ? `${v}${unit || ''}` : '—';
  return (
    <div className="flex justify-between items-center py-1 border-b border-[#00233B]/10 last:border-0">
      <span className="text-sm text-[#00233B]/70 font-medium">{label}</span>
      <span className="text-sm text-[#00233B] font-semibold">
        {fmt(min)} – {fmt(max)}
        {otimo !== null && otimo !== undefined ? ` (ótimo: ${otimo}${unit || ''})` : ''}
      </span>
    </div>
  );
}