import React from 'react';
import SignatureFooter from './SignatureFooter';
import PrintStyles from './PrintStyles';
import { buildSignatureProps, formatDateBrasilia } from '@/utils/relatorioUtils';
import { ReportCheckmark, ReportSectionTitle, ReportNaoConformidadesTable } from './shared';
import TabelaControleLigante from './checklist/TabelaControleLigante';
import PaginaMedicaoCargas from './checklist/PaginaMedicaoCargas';

const LOGO_DEFAULT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

const Checkmark = ({ checked }) => <ReportCheckmark checked={checked} />;

// ─── Tabela de Controle de Agregados ─────────────────────────────────────────
const TabelaControleAgregados = ({ controle_agregados }) => {
  const data = controle_agregados || [];
  return (
    <table className="w-full print:text-base border-collapse border border-slate-300 text-sm">
      <thead className="bg-slate-100">
        <tr className="text-base print:text-base">
          <th className="border border-slate-300 p-2 print:p-1 font-medium text-left">Agregado</th>
          <th className="border border-slate-300 p-2 print:p-1 font-medium text-center">Estoque Coberto?</th>
          <th className="border border-slate-300 p-2 print:p-1 font-medium text-center">Material Homogeneizado?</th>
          <th className="border border-slate-300 p-2 print:p-1 font-medium text-center">Granulometria Individual?</th>
        </tr>
      </thead>
      <tbody className="text-base print:text-base">
        {data.length > 0 ? data.map((ag, index) => (
          <tr key={index}>
            <td className="border border-slate-300 p-2 print:p-1 font-medium bg-slate-50">{ag.nome}</td>
            <td className="border border-slate-300 p-2 print:p-1 text-center"><Checkmark checked={ag.estoque_coberto} /></td>
            <td className="border border-slate-300 p-2 print:p-1 text-center"><Checkmark checked={ag.material_homogeneizado} /></td>
            <td className="border border-slate-300 p-2 print:p-1 text-center"><Checkmark checked={ag.granulometria_individual} /></td>
          </tr>
        )) : (
          <tr>
            <td colSpan="4" className="text-center p-4 print:p-1 italic text-slate-500">Nenhum agregado registrado.</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

// ─── Tabela de Controle de CAUQ ───────────────────────────────────────────────
const TabelaControleCAUQ = ({ controle_cauq, project }) => {
  const data = controle_cauq || {};
  const ensaios = [
    { label: 'Ext. Ligante (Rotarex)', key: 'extracao_ligante_rotarex', padrao: project?.teor_ligante ? `${project.teor_ligante.min} a ${project.teor_ligante.max} %` : 'N/A' },
    { label: 'Ext. Ligante (Soxhlet)', key: 'extracao_ligante_soxhlet', padrao: project?.teor_ligante ? `${project.teor_ligante.min} a ${project.teor_ligante.max} %` : 'N/A' },
    { label: 'Granulometria', key: 'granulometria', padrao: 'Faixa de trabalho' },
    { label: 'Densidade RICE', key: 'densidade_rice', padrao: project?.densidade_maxima_medida ? `${project.densidade_maxima_medida} g/cm³` : 'N/A', noConformity: true },
    { label: 'Densidade Aparente', key: 'densidade_aparente', padrao: project?.massa_especifica_aparente ? `${project.massa_especifica_aparente} g/cm³` : 'N/A', noConformity: true },
    { label: 'Volume de Vazios', key: 'volume_vazios', padrao: project?.volume_vazios ? `${project.volume_vazios.min} a ${project.volume_vazios.max} %` : 'N/A' },
    { label: 'RBV', key: 'rbv', padrao: project?.rbv ? `${project.rbv.min} a ${project.rbv.max} %` : 'N/A' },
    { label: 'RTCD 25°C', key: 'rtcd_25c', padrao: project?.rtcd ? `> ${project.rtcd.min} MPa` : 'N/A' },
    { label: 'Estabilidade', key: 'estabilidade', padrao: project?.estabilidade ? `> ${project.estabilidade.min} N` : 'N/A' },
    { label: 'Fluência', key: 'fluencia', padrao: project?.fluencia ? `${project.fluencia.min} a ${project.fluencia.max} mm` : 'Indicativo' },
  ];

  const formatResultado = (ensaioData) => {
    if (!ensaioData) return '-';
    if (Array.isArray(ensaioData.resultados) && ensaioData.resultados.length > 0) {
      const validos = ensaioData.resultados.filter(r => r !== null && r !== undefined);
      if (validos.length === 0) return '-';
      return validos.length === 1 ? validos[0] : validos.join(' / ');
    }
    if (ensaioData.resultado !== null && ensaioData.resultado !== undefined) return ensaioData.resultado;
    return '-';
  };

  const formatConformidade = (conforme) => {
    if (conforme === null || conforme === undefined) return <span className="text-slate-500 text-xl">-</span>;
    if (conforme === true) return <span className="text-green-600 font-bold text-2xl">✓</span>;
    return <span className="text-red-600 font-bold text-2xl">✗</span>;
  };

  return (
    <div className="w-full">
      <ReportSectionTitle>Controle de CAUQ</ReportSectionTitle>
      <table className="w-full print:text-base border-collapse border border-slate-400">
        <thead>
          <tr className="bg-slate-100 text-base print:text-base">
            <th className="border border-slate-300 p-2 print:p-1 font-medium">Ensaio</th>
            <th className="border border-slate-300 p-2 print:p-1 font-medium">Realizado</th>
            <th className="border border-slate-300 p-2 print:p-1 font-medium">Qtde</th>
            <th className="border border-slate-300 p-2 print:p-1 font-medium">Resultado</th>
            <th className="border border-slate-300 p-2 print:p-1 font-medium">Padrão do Projeto</th>
            <th className="border border-slate-300 p-2 print:p-1 font-medium">Conformidade</th>
          </tr>
        </thead>
        <tbody className="text-base print:text-base">
          {ensaios.map(ensaio => {
            const ensaioData = data[ensaio.key];
            return (
              <tr key={ensaio.key}>
                <td className="border border-slate-300 p-2 print:p-1 font-medium bg-slate-50">{ensaio.label}</td>
                <td className="border border-slate-300 p-2 print:p-1 text-center"><Checkmark checked={ensaioData?.realizado} /></td>
                <td className="border border-slate-300 p-2 print:p-1 text-center">{ensaioData?.quantidade ?? '-'}</td>
                <td className="border border-slate-300 p-2 print:p-1 text-center">{formatResultado(ensaioData)}</td>
                <td className="border border-slate-300 p-2 print:p-1 text-center">{ensaio.padrao}</td>
                <td className="border border-slate-300 p-2 print:p-1 text-center">
                  {ensaio.noConformity ? <span className="text-slate-500 text-xl">-</span> : formatConformidade(ensaioData?.conforme)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ─── Cabeçalho de Impressão ───────────────────────────────────────────────────
const ReportPrintHeader = ({ checklist, obra, regional, project }) => (
  <div>
    <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-2">
      <div className="flex justify-start">
        <picture>
          <source srcSet={regional?.logo_url || LOGO_DEFAULT} />
          <img src={regional?.logo_url || LOGO_DEFAULT} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" />
        </picture>
      </div>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-800">Controle Tecnológico de Usinagem</h1>
      </div>
      <div className="flex justify-end">
        <div className="border border-gray-400 p-2 rounded-md text-base print:text-sm">
          <p className="font-semibold text-gray-800">
            {new Date(checklist.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
          </p>
        </div>
      </div>
    </header>
    <main className="text-base print:text-base mt-2">
      <ReportSectionTitle>Dados da Obra e Projeto</ReportSectionTitle>
      <div className="grid grid-cols-4 gap-x-4 gap-y-2">
        <div><p className="font-bold">CLIENTE:</p><p>{regional?.cliente || 'N/A'}</p></div>
        <div><p className="font-bold">PROJETO:</p><p>{project?.name || checklist.projeto_utilizado || 'N/A'}</p></div>
        <div><p className="font-bold">PEDREIRA:</p><p>{checklist.pedreira || 'N/A'}</p></div>
        <div><p className="font-bold">INSPETOR:</p><p>{checklist.inspetor_campo || 'N/A'}</p></div>
        <div><p className="font-bold">OBRA:</p><p>{obra?.name || 'N/A'}</p></div>
        <div><p className="font-bold">FAIXA ESPECIFICADA:</p><p>{checklist.faixa_especificada || 'N/A'}</p></div>
        <div><p className="font-bold">ENSAIO REALIZADO POR:</p><p>{checklist.ensaio_realizado_por || 'N/A'}</p></div>
        <div>
          <p className="font-bold">JORNADA:</p>
          <p>{checklist.jornada?.horario_inicio && checklist.jornada?.horario_fim
            ? `${checklist.jornada.horario_inicio} - ${checklist.jornada.horario_fim}`
            : 'N/A'}
          </p>
        </div>
        <div><p className="font-bold">USINA:</p><p>{checklist.usina}</p></div>
        <div><p className="font-bold">LIGANTE:</p><p>{checklist.ligante || 'N/A'}</p></div>
      </div>
    </main>
  </div>
);

const ReportFooter = ({ checklist, creatorUser }) => (
  <SignatureFooter {...buildSignatureProps(checklist, creatorUser)} />
);

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function RelatorioChecklist({ checklist, obra, regional, project, user, creatorUser }) {
  const [compressedPhotos, setCompressedPhotos] = React.useState([]);
  const [isCompressing, setIsCompressing] = React.useState(true);

  React.useEffect(() => {
    const compressImages = async () => {
      if (!checklist?.fotos || checklist.fotos.length === 0) {
        setIsCompressing(false);
        return;
      }
      const compressed = await Promise.all(
        checklist.fotos.filter(photo => photo && photo.trim() !== '').map(async (photoUrl) => {
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = photoUrl;
            });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = width * ratio;
              height = height * ratio;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            return canvas.toDataURL('image/jpeg', 0.5);
          } catch {
            return photoUrl;
          }
        })
      );
      setCompressedPhotos(compressed);
      setIsCompressing(false);
    };
    compressImages();
  }, [checklist?.fotos]);

  if (!checklist) return <div className="p-8">Dados do checklist não encontrados.</div>;
  if (isCompressing) return <div className="p-8 text-center">Otimizando imagens para impressão...</div>;

  const chunkArray = (array, size) => {
    const chunks = [];
    if (!array) return chunks;
    for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
    return chunks;
  };

  const photoChunks = chunkArray(compressedPhotos, 6);
  const temAcoesCorretivas = checklist.acoes_corretivas_realizado === true && checklist.acoes_corretivas_descricao;
  const temControleLigante = checklist.controle_ligante_ativo === true;
  const temMedicaoUsina = (checklist.medicoes_usina?.cargas?.length || 0) > 0;
  const totalPages = 1 + 1 + (temControleLigante ? 1 : 0) + (temAcoesCorretivas ? 1 : 0) + (temMedicaoUsina ? 1 : 0) + photoChunks.length;

  return (
    <div className="bg-white font-sans">
      <PrintStyles />

      {/* Página 1: Agregados & Produção */}
      <div className="p-8 print:p-8 flex flex-col page-container min-h-screen">
        <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
          <ReportPrintHeader checklist={checklist} obra={obra} regional={regional} project={project} />
          <main className="flex-grow">
            <ReportSectionTitle>Controle de Agregados</ReportSectionTitle>
            <TabelaControleAgregados controle_agregados={checklist.controle_agregados} />

            <div className="mt-4 space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <strong className="font-medium">Equivalente de Areia Realizado?</strong>
                  <span className="ml-2 font-medium">
                    {checklist.equivalente_areia_status === 'realizado'
                      ? <span className="text-green-600">Sim</span>
                      : checklist.equivalente_areia_status === 'nao_realizado'
                        ? <span className="text-red-600">Não</span>
                        : <span className="text-slate-500">N/A</span>}
                  </span>
                  {checklist.equivalente_areia_status === 'realizado' && checklist.equivalente_areia_quantidade > 0 && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm font-medium text-slate-700">Quantidade: {checklist.equivalente_areia_quantidade} ensaio(s)</p>
                      <div className="grid grid-cols-3 gap-2">
                        {checklist.equivalente_areia_resultados?.map((resultado, index) => (
                          <div key={index} className="bg-slate-50 border border-slate-200 rounded p-2">
                            <p className="text-xs text-slate-600">Resultado {index + 1}:</p>
                            <p className="text-base font-semibold text-slate-800">{resultado !== null ? `${resultado}%` : '-'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {checklist.observacoes_agregados && (
                  <div className="flex-1">
                    <strong className="font-medium">Observações:</strong>
                    <p className="text-sm mt-1">{checklist.observacoes_agregados.substring(0, 500)}</p>
                  </div>
                )}
              </div>
            </div>

            <ReportSectionTitle>Acompanhamento da Produção</ReportSectionTitle>
            <div className="grid grid-cols-2 gap-4">
              {(checklist.rodadas_producao || []).map((rodada, index) => (
                <div key={index} className="border border-slate-200 p-2 rounded-md space-y-1 text-sm">
                  <h3 className="font-bold text-center">Rodada {rodada.numero_rodada}</h3>
                  <p><strong className="font-medium">Horário:</strong> {rodada.horario_inicio} às {rodada.horario_termino}</p>
                  <p><strong className="font-medium">Temp. Ambiente:</strong> {rodada.temperatura_ambiente}°C</p>
                  <p><strong className="font-medium">Clima:</strong> {rodada.condicoes_climaticas}</p>
                  <p><strong className="font-medium">Qtde. Produzida:</strong> {rodada.quantidade_produzida} t</p>
                  <p><strong className="font-medium">Controle de Cargas (Qtde):</strong> {rodada.controle_cargas_qtde}</p>
                  <p><strong className="font-medium">Caminhões Enlonados:</strong> <Checkmark checked={rodada.caminhoes_enlonados} /></p>
                  <p><strong className="font-medium">Temp. Massa:</strong> T1: {rodada.temperatura_massa_t1}°C / T2: {rodada.temperatura_massa_t2}°C</p>
                </div>
              ))}
            </div>
          </main>
          <footer className="mt-auto pt-2 text-center text-sm print:text-xs text-gray-400">
            Página 1 de {totalPages}
          </footer>
        </div>
      </div>

      {/* Página 2: Controle de CAUQ */}
      <div className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
        <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
          <ReportPrintHeader checklist={checklist} obra={obra} regional={regional} project={project} />
          <main className="flex-grow">
            <TabelaControleCAUQ controle_cauq={checklist.controle_cauq} project={project} />
            <div className="mt-2"><strong className="font-medium">Observações Gerais:</strong> {checklist.observacoes?.substring(0, 500) || 'N/A'}</div>
          </main>
          <ReportFooter checklist={checklist} creatorUser={creatorUser} />
          <footer className="mt-auto pt-2 text-center text-sm print:text-xs text-gray-400">
            Página 2 de {totalPages}
          </footer>
        </div>
      </div>

      {/* Página 3: Controle de Ligante (condicional) */}
      {temControleLigante && (
        <div className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
          <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
            <ReportPrintHeader checklist={checklist} obra={obra} regional={regional} project={project} />
            <main className="flex-grow mt-6">
              <TabelaControleLigante controle_ligante={checklist.controle_ligante} />
            </main>
            <ReportFooter checklist={checklist} creatorUser={creatorUser} />
            <footer className="pt-1 text-center text-sm print:text-xs text-gray-400">
              Página 3 de {totalPages}
            </footer>
          </div>
        </div>
      )}

      {/* Página: Ações Corretivas (condicional) */}
      {temAcoesCorretivas && (
        <div className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
          <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
            <ReportPrintHeader checklist={checklist} obra={obra} regional={regional} project={project} />
            <main className="flex-grow mt-6">
              <ReportSectionTitle>Ações Corretivas Realizadas</ReportSectionTitle>
              <div className="border-2 border-slate-300 rounded-lg p-6 bg-white min-h-48 mb-6">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-justify">{checklist.acoes_corretivas_descricao}</p>
              </div>
              {checklist.nao_conformidades && checklist.nao_conformidades.length > 0 && (
                <div>
                  <ReportSectionTitle>Não Conformidades</ReportSectionTitle>
                  <ReportNaoConformidadesTable naoConformidades={checklist.nao_conformidades} />
                </div>
              )}
            </main>
            <ReportFooter checklist={checklist} creatorUser={creatorUser} />
            <footer className="mt-auto pt-2 text-center text-sm print:text-xs text-gray-400">
              Página {temControleLigante ? 4 : 3} de {totalPages}
            </footer>
          </div>
        </div>
      )}

      {/* Página: Medição de Cargas da Usina (condicional) */}
      {temMedicaoUsina && (
        <PaginaMedicaoCargas
          checklist={checklist}
          obra={obra}
          regional={regional}
          creatorUser={creatorUser}
          pageNum={2 + (temControleLigante ? 1 : 0) + (temAcoesCorretivas ? 1 : 0) + 1}
          totalPages={totalPages}
        />
      )}

      {/* Páginas: Relatório Fotográfico */}
      {photoChunks.map((chunk, pageIndex) => (
        <div key={pageIndex} className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
          <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
            <header className="grid grid-cols-3 items-center border-b-2 border-gray-800 pb-2">
              <div className="flex justify-start">
                <picture>
                  <source srcSet={regional?.logo_url || LOGO_DEFAULT} />
                  <img src={regional?.logo_url || LOGO_DEFAULT} alt="Logo Regional" className="h-16 object-contain" width="auto" height="64" />
                </picture>
              </div>
              <div className="text-center">
                <h1 className="text-2xl print:text-xl font-bold text-gray-800">Relatório Fotográfico  Checklist</h1>
                <p className="text-base print:text-sm text-gray-600">Obra: {obra?.name || 'N/A'}</p>
              </div>
              <div className="flex justify-end text-sm print:text-xs">
                <div className="border border-gray-400 p-2 rounded-md">
                  <p>{new Date(checklist.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                </div>
              </div>
            </header>
            <main className="grid grid-cols-2 gap-4 mt-4">
              {chunk.map((fotoUrl, fotoIndex) => (
                <div key={`foto-${fotoIndex}`} className="border p-2 rounded-lg break-inside-avoid flex flex-col">
                  <div className="bg-gray-100 flex items-center justify-center rounded overflow-hidden">
                    <picture>
                      <source srcSet={fotoUrl} />
                      <img src={fotoUrl} alt={`Foto ${pageIndex * 6 + fotoIndex + 1}`} className="w-full h-auto object-contain" style={{ maxHeight: '280px' }} width="auto" height="auto" />
                    </picture>
                  </div>
                  <p className="text-center text-base print:text-sm mt-2 font-medium">
                    Foto {(pageIndex * 6) + fotoIndex + 1}
                  </p>
                </div>
              ))}
            </main>
            <footer className="mt-auto pt-2 text-center text-sm print:text-xs text-gray-500">
              Página {pageIndex + 3 + (temControleLigante ? 1 : 0) + (temAcoesCorretivas ? 1 : 0) + (temMedicaoUsina ? 1 : 0)} de {totalPages}
            </footer>
          </div>
        </div>
      ))}
    </div>
  );
}