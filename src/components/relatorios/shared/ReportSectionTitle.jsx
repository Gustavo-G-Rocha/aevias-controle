/**
 * Título de seção padrão para relatórios impressos.
 * Usado em todos os relatórios de checklist.
 */
export default function ReportSectionTitle({ children, size = 'md' }) {
  const sizeClass = size === 'sm'
    ? 'text-[10px]'
    : 'text-sm print:text-xs';
  return (
    <h2 className={`${sizeClass} font-bold text-center bg-slate-100 p-0.5 my-0.5 uppercase tracking-wider`}>
      {children}
    </h2>
  );
}