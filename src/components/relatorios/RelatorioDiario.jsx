import React from 'react';
import SignatureFooter from './SignatureFooter';
import PrintStyles from './PrintStyles';
import { buildSignatureProps, formatDate as formatDateUtil } from '@/utils/relatorioUtils';
import { ReportNaoConformidadesTable } from './shared';
import DiarioEfetivoPage from '@/components/relatorio-diario/DiarioEfetivoPage';
import DiarioChecklistVeiculoPage from '@/components/relatorio-diario/DiarioChecklistVeiculoPage';
import DiarioFotoPage from '@/components/relatorio-diario/DiarioFotoPage';
import { compressImages, chunkArray } from '@/utils/reportImageCompression';

const DEFAULT_LOGO = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

const CONDICOES_CLIMATICAS = {
  ensolarado: "☀️ Ensolarado",
  ceu_limpo: "🌙 Céu limpo",
  nublado: "☁️ Nublado",
  chuvoso: "🌧️ Chuvoso",
  garoa: "🌦️ Garoa",
  vento_forte: "💨 Vento Forte",
  neblina: "🌫️ Neblina",
};

function TextBlock({ label, value }) {
  return (
    <div className="col-span-1 md:col-span-2">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="p-2 border rounded-md bg-gray-50 text-sm text-gray-800 whitespace-pre-wrap min-h-[60px]">
        {value || 'Não informado.'}
      </div>
    </div>
  );
}

export default function RelatorioDiario({ diario, obra, user, regional, creatorUser }) {
  const [compressedPhotos, setCompressedPhotos] = React.useState([]);
  const [isCompressing, setIsCompressing] = React.useState(true);

  React.useEffect(() => {
    compressImages(diario?.fotos || []).then(photos => {
      setCompressedPhotos(photos);
      setIsCompressing(false);
    });
  }, [diario?.fotos]);

  if (!diario) {
    return (
      <div className="bg-white p-8 font-sans">
        <div className="text-center text-red-600">
          <h2 className="text-xl font-bold mb-4">Erro</h2>
          <p>Dados do diário não foram fornecidos.</p>
        </div>
      </div>
    );
  }

  if (isCompressing) {
    return <div className="p-8 text-center">Otimizando imagens para impressão...</div>;
  }

  const tipoLocal = diario.tipo_local || "campo";
  const isObraClienteType = obra?.tipo_obra === 'levantamentos' || obra?.tipo_obra === 'sondagem';
  const clienteDisplay = isObraClienteType
    ? (diario.empreiteira || 'N/A')
    : (diario.cliente || regional?.cliente || 'N/A');

  const photoChunks = compressedPhotos.length > 0 ? chunkArray(compressedPhotos, 6) : [];

  return (
    <div className="bg-white font-sans">
      <PrintStyles />

      {/* Página 1 — Dados do Diário */}
      <div className="p-8 print:p-8 pb-[5px] min-h-[29.7cm] print:min-h-[29.7cm] flex flex-col">
        <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-4">
          <div className="flex justify-start">
            <picture>
              <source srcSet={regional?.logo_url || DEFAULT_LOGO} />
              <img src={regional?.logo_url || DEFAULT_LOGO} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" />
            </picture>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">Diário de Obra</h1>
            <p className="text-md text-slate-700">{obra?.name || diario.obra_name}</p>
          </div>
          <div className="flex justify-end">
            <div className="border border-gray-400 p-2 rounded-md">
              <p className="text-sm font-semibold text-gray-800">
                {new Date(diario.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          <section className="mt-6">
            <h2 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Informações Gerais</h2>
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Cliente</p>
                <p className="text-gray-800">{clienteDisplay}</p>
              </div>

              {tipoLocal === "campo" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Trecho</p>
                  <p className="text-gray-800">{diario.trecho || 'N/A'}</p>
                </div>
              )}
              {tipoLocal === "usina" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Condições Climáticas</p>
                  <p className="text-gray-800">{CONDICOES_CLIMATICAS[diario.condicoes_climaticas] || 'N/A'}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Empreiteira</p>
                <p className="text-gray-800">{diario.empreiteira || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Obra</p>
                <p className="text-gray-800">{obra?.name || diario.obra_name || 'N/A'}</p>
              </div>

              {tipoLocal === "campo" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Condições Climáticas</p>
                  <p className="text-gray-800">{CONDICOES_CLIMATICAS[diario.condicoes_climaticas] || 'N/A'}</p>
                </div>
              )}
              {tipoLocal === "usina" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Temperatura</p>
                  <p className="text-gray-800">{diario.temperatura ? `${diario.temperatura}°C` : 'N/A'}</p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">Laboratorista</p>
                <p className="text-gray-800">{diario.laboratorista_name || user?.laboratorista_name || user?.full_name || diario.created_by?.split('@')[0] || 'Não Identificado'}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase">{tipoLocal === "usina" ? "Usina" : "Rodovia"}</p>
                <p className="text-gray-800">{tipoLocal === "usina" ? (diario.usina_selecionada || 'N/A') : (diario.rodovia || 'N/A')}</p>
              </div>

              {tipoLocal === "campo" && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Temperatura</p>
                  <p className="text-gray-800">{diario.temperatura ? `${diario.temperatura}°C` : 'N/A'}</p>
                </div>
              )}
              {tipoLocal === "usina" && diario.jornada?.horario_inicio && diario.jornada?.horario_fim && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Jornada</p>
                  <p className="text-gray-800">{diario.jornada.horario_inicio} - {diario.jornada.horario_fim}</p>
                </div>
              )}

              {tipoLocal === "campo" && diario.jornada?.horario_inicio && diario.jornada?.horario_fim && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Jornada</p>
                  <p className="text-gray-800">{diario.jornada.horario_inicio} - {diario.jornada.horario_fim}</p>
                </div>
              )}
            </div>
          </section>

          <section className="mt-6">
            <h2 className="text-lg font-bold text-gray-700 border-b pb-2 mb-3">Atividades e Observações</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextBlock label="Atividades Realizadas" value={diario.atividades_realizadas} />
              {diario.observacoes && <TextBlock label="Observações" value={diario.observacoes} />}
              {diario.acoes_corretivas_realizado === true && diario.acoes_corretivas_descricao && (
                <TextBlock label="Ações Corretivas" value={diario.acoes_corretivas_descricao} />
              )}
            </div>
          </section>

          {diario.nao_conformidades?.length > 0 && (
            <section className="mt-4">
              <h2 className="text-lg font-bold text-gray-700 border-b pb-2 mb-2">Não Conformidades</h2>
              <ReportNaoConformidadesTable naoConformidades={diario.nao_conformidades} />
            </section>
          )}

        </main>

        <footer className="mt-auto pt-4 flex-shrink-0">
          <SignatureFooter {...buildSignatureProps(diario, creatorUser)} />
        </footer>
      </div>

      {/* Páginas de Registro Fotográfico — após assinaturas */}
      {photoChunks.map((chunk, pageIndex) => (
        <DiarioFotoPage
          key={`foto-page-${pageIndex}`}
          chunk={chunk}
          pageIndex={pageIndex}
          diario={diario}
          obra={obra}
          regional={regional}
        />
      ))}

      {/* Página do Efetivo de Obra */}
      {diario.efetivo_obra_ativo && (
        <DiarioEfetivoPage diario={diario} obra={obra} regional={regional} clienteDisplay={clienteDisplay} />
      )}

      {/* Página do Checklist de Veículo */}
      {diario.checklist_veiculo_ativo === true && (
        <DiarioChecklistVeiculoPage diario={diario} obra={obra} regional={regional} formatDate={formatDateUtil} />
      )}

    </div>
  );
}