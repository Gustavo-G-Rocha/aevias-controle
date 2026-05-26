/**
 * Página fotográfica padrão para relatórios impressos.
 * Renderiza um grid 2-colunas de fotos com legenda numerada.
 *
 * Props:
 *   photos      — array de URLs (chunk de 6 fotos para esta página)
 *   pageOffset  — índice da página (para cálculo do número da foto)
 *   photosPerPage — fotos por página (default 6)
 *   regional    — objeto regional (para logo)
 *   title       — título do cabeçalho fotográfico
 *   subtitle    — subtítulo (ex: nome da obra)
 *   date        — data já formatada
 */
const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

export default function ReportPhotoPage({ photos, pageOffset, photosPerPage = 6, regional, title, subtitle, date }) {
  const logoUrl = regional?.logo_url || DEFAULT_LOGO;
  return (
    <div className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
      <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
        <header className="grid grid-cols-3 items-center border-b-2 border-gray-800 pb-2 mb-4">
          <div className="flex justify-start">
            <picture>
              <source srcSet={logoUrl} />
              <img src={logoUrl} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" />
            </picture>
          </div>
          <div className="text-center">
            <h1 className="text-xl print:text-base font-bold text-gray-800">{title}</h1>
            {subtitle && <p className="text-sm print:text-xs text-gray-600">{subtitle}</p>}
          </div>
          <div className="flex justify-end text-sm print:text-xs">
            {date && (
              <div className="border border-gray-400 p-2 rounded-md">
                <p>{date}</p>
              </div>
            )}
          </div>
        </header>
        <main className="flex-grow grid grid-cols-2 gap-4 mt-2" style={{ gridAutoRows: 'minmax(0, 1fr)' }}>
          {photos.map((fotoUrl, fotoIndex) => (
            <div key={fotoIndex} className="border p-2 rounded-lg break-inside-avoid flex flex-col" style={{ height: 'calc((100vh - 300px) / 3)' }}>
              <div className="bg-gray-100 flex-grow flex items-center justify-center rounded overflow-hidden">
                <picture>
                  <source srcSet={fotoUrl} />
                  <img src={fotoUrl} alt={`Foto ${pageOffset * photosPerPage + fotoIndex + 1}`} className="max-h-full max-w-full object-contain" width="auto" height="auto" />
                </picture>
              </div>
              <p className="text-center text-sm print:text-xs mt-2 font-medium">
                Foto {pageOffset * photosPerPage + fotoIndex + 1}
              </p>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}