/**
 * Ícone de conformidade reutilizável para tabelas de relatório.
 *
 * Variantes:
 *   - <ReportCheckmark checked={true|false|null} /> — ✓ verde / ✗ vermelho / - cinza
 *   - <ReportCheckmark checked={value} column="sim|nao|na" /> — modo checkbox tri-state
 */
export default function ReportCheckmark({ checked, column }) {
  // Modo tri-state (sim / nao / na) — usado em Terraplanagem e Reciclagem
  if (column !== undefined) {
    if (!checked || typeof checked !== 'object') return <span className="text-slate-500">-</span>;
    if (column === 'sim' && checked.sim === true)
      return <span className="text-green-600 font-bold text-base">✓</span>;
    if (column === 'nao' && checked.nao === true)
      return <span className="text-red-600 font-bold text-base">✗</span>;
    if (column === 'na' && checked.na === true)
      return <span className="text-slate-500">N/A</span>;
    return null;
  }

  // Modo booleano padrão
  if (checked === null || checked === undefined)
    return <span className="text-slate-500">-</span>;
  return (
    <span className={`font-bold ${checked ? 'text-green-600' : 'text-red-600'}`}>
      {checked ? '✓' : '✗'}
    </span>
  );
}