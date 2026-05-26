/**
 * Cabeçalho padrão de página de relatório impresso (3 colunas: logo | título | data).
 * Substitui o bloco <header grid-cols-3> repetido em cada relatório.
 *
 * Props:
 *   regional   — objeto regional (para logo_url)
 *   title      — texto central (título do relatório)
 *   subtitle   — texto secundário opcional abaixo do título
 *   date       — string de data já formatada para exibição
 *   logoHeight — classe tailwind de altura (default "h-12")
 *   compact    — se true, usa border mais fina e padding menor
 */
const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function ReportLogoHeader({ regional, title, subtitle, date, logoHeight = "h-12", compact = false }) {
  const logoUrl = regional?.logo_url || DEFAULT_LOGO;
  const borderClass = compact ? "border-b border-slate-600 pb-0.5 mb-1" : "border-b-2 border-slate-900 pb-1";

  return (
    <header className={`grid grid-cols-3 items-center ${borderClass}`}>
      <div className="flex justify-start">
        <picture>
          <source srcSet={logoUrl} />
          <img src={logoUrl} alt="Logo Regional" className={`${logoHeight} object-contain`} width="auto" height="auto" />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800 leading-tight whitespace-nowrap">{title}</h1>
        {subtitle && <p className="text-xs text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex justify-end">
        {date && (
          <div className="border border-gray-400 p-1 rounded-md text-xs">
            <p className="font-semibold text-gray-800">{date}</p>
          </div>
        )}
      </div>
    </header>
  );
}