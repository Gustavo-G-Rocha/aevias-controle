import React, { useEffect, useState } from 'react';
import SignatureFooter from './SignatureFooter';
import PrintStyles from './PrintStyles';
import { buildSignatureProps } from '@/utils/relatorioUtils';
import { ReportCheckmark, ReportSectionTitle, ReportNaoConformidadesTable } from './shared';
import TabelaControleLigante from './checklist/TabelaControleLigante';
import PaginaMedicaoCargas from './checklist/PaginaMedicaoCargas';
import PageContainer from './checklist/PageContainer';
import ReportHeaderWithProject from './checklist/ReportHeaderWithProject';
import ReportHeader from './checklist/ReportHeader';
import RodadaProducaoCard from './checklist/RodadaProducaoCard';
import PhotoGalleryPage from './checklist/PhotoGalleryPage';
import {
  chunkArray,
  calculateTotalPages,
  calculatePhotoPageNumber,
  calculateAcoesPageNumber,
  formatResultado,
} from '@/utils/relatorioChecklistUtils';

// ─── Tabela de Controle de Agregados ─────────────────────────────────────────
const TabelaControleAgregados = ({ controle_agregados }) => {
  const Checkmark = ({ checked }) => <ReportCheckmark checked={checked} />;
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
  const Checkmark = ({ checked }) => <ReportCheckmark checked={checked} />;
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



const ReportFooter = ({ checklist, creatorUser }) => (
  <SignatureFooter {...buildSignatureProps(checklist, creatorUser)} />
);

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function RelatorioChecklist({ checklist, obra, regional, project, user, creatorUser }) {
  const [compressedPhotos, setCompressedPhotos] = useState([]);
  const [isCompressing, setIsCompressing] = useState(true);

  useEffect(() => {
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

  const photoChunks = chunkArray(compressedPhotos, 6);
  const temAcoesCorretivas = checklist.acoes_corretivas_realizado === true && !!checklist.acoes_corretivas_descricao;
  const temNC = Array.isArray(checklist.nao_conformidades) && checklist.nao_conformidades.length > 0;
  const temControleLigante = checklist.controle_ligante_ativo === true;
  const temMedicaoUsina = (checklist.medicoes_usina?.cargas?.length || 0) > 0;
  
  const totalPages = calculateTotalPages({
    temControleLigante,
    temAcoesCorretivas,
    temNC,
    temMedicaoUsina,
    photoChunksLength: photoChunks.length,
  });
  
  const pageConfig = { temControleLigante, temAcoesCorretivas, temNC, temMedicaoUsina };

  return (
    <div className="bg-white font-sans">
      <PrintStyles />

      {/* Página 1: Agregados & Produção */}
      <PageContainer
        pageNumber={1}
        totalPages={totalPages}
        headerContent={
          <ReportHeaderWithProject 
            regional={regional} 
            checklist={checklist} 
            obra={obra} 
            project={project} 
          />
        }
        footerContent={null}
      >
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
            <RodadaProducaoCard key={index} rodada={rodada} index={index} />
          ))}
        </div>
      </PageContainer>

      {/* Página 2: Controle de CAUQ */}
      <PageContainer
        pageNumber={2}
        totalPages={totalPages}
        headerContent={
          <ReportHeader 
            regional={regional} 
            title="Controle Tecnológico de Usinagem" 
            checklist={checklist} 
          />
        }
        footerContent={<ReportFooter checklist={checklist} creatorUser={creatorUser} />}
      >
        <TabelaControleCAUQ controle_cauq={checklist.controle_cauq} project={project} />
        <div className="mt-2"><strong className="font-medium">Observações Gerais:</strong> {checklist.observacoes?.substring(0, 500) || 'N/A'}</div>
      </PageContainer>

      {/* Página 3: Controle de Ligante (condicional) */}
      {temControleLigante && (
        <PageContainer
          pageNumber={3}
          totalPages={totalPages}
          headerContent={
            <ReportHeader 
              regional={regional} 
              title="Controle Tecnológico de Usinagem" 
              checklist={checklist} 
            />
          }
          footerContent={<ReportFooter checklist={checklist} creatorUser={creatorUser} />}
          className="mt-6"
        >
          <TabelaControleLigante controle_ligante={checklist.controle_ligante} />
        </PageContainer>
      )}

      {/* Página: Ações Corretivas / Não Conformidades (condicional) */}
      {(temAcoesCorretivas || temNC) && (
        <PageContainer
          pageNumber={calculateAcoesPageNumber({ temControleLigante })}
          totalPages={totalPages}
          headerContent={
            <ReportHeader 
              regional={regional} 
              title="Controle Tecnológico de Usinagem" 
              checklist={checklist} 
            />
          }
          footerContent={<ReportFooter checklist={checklist} creatorUser={creatorUser} />}
          className="mt-6"
        >
          {temAcoesCorretivas && (
            <>
              <ReportSectionTitle>Ações Corretivas Realizadas</ReportSectionTitle>
              <div className="border-2 border-slate-300 rounded-lg p-6 bg-white min-h-48 mb-6">
                <p className="text-base leading-relaxed whitespace-pre-wrap text-justify">{checklist.acoes_corretivas_descricao}</p>
              </div>
            </>
          )}
          {temNC && (
            <div>
              <ReportSectionTitle>Não Conformidades</ReportSectionTitle>
              <ReportNaoConformidadesTable naoConformidades={checklist.nao_conformidades} />
            </div>
          )}
        </PageContainer>
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
        <PhotoGalleryPage
          key={pageIndex}
          photoChunk={chunk}
          pageIndex={pageIndex}
          regional={regional}
          checklist={checklist}
          obra={obra}
          pageNumber={calculatePhotoPageNumber(pageIndex, pageConfig)}
          totalPages={totalPages}
        />
      ))}
    </div>
  );
}