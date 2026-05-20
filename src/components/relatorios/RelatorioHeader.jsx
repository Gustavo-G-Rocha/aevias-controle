/**
 * Cabeçalho reutilizável para relatórios impressos.
 * Exibe logo regional (à esquerda), título (centro) e data (direita).
 */
const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function RelatorioHeader({ regional, title, subtitle, date }) {
  const logoUrl = regional?.logo_url || DEFAULT_LOGO;

  return (
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-3 mb-4 print:pb-2 print:mb-3">
      <div className="flex justify-start">
        <picture>
          <source srcSet={logoUrl} />
          <img src={logoUrl} alt="Logo Regional" className="h-16 print:h-12 object-contain" width="auto" height="64" />
        </picture>
      </div>

      <div className="text-center">
        <h1 className="text-sm font-bold text-gray-800 leading-tight print:text-xs print:leading-tight uppercase">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-600 mt-0.5 print:text-[9px]">{subtitle}</p>
        )}
      </div>

      <div className="flex justify-end items-start">
        {date && (
          <div className="text-right">
            <p className="text-xs font-bold text-gray-700 print:text-[10px]">DATA:</p>
            <p className="text-sm font-semibold text-gray-900 print:text-xs">{date}</p>
          </div>
        )}
      </div>
    </header>
  );
}