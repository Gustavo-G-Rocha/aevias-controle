import React, { useState, useEffect } from "react";
import SignatureFooter from './SignatureFooter';
import { ReportNaoConformidadesTable, ReportCheckmark as Checkmark } from './shared';
import ConcretagemPageHeader from '@/components/relatorio-checklist-concretagem/ConcretagemPageHeader';
import ConcretagemDadosObra from '@/components/relatorio-checklist-concretagem/ConcretagemDadosObra';
import ConcretagemClimaTable from '@/components/relatorio-checklist-concretagem/ConcretagemClimaTable';
import ConcretagemFotoPage from '@/components/relatorio-checklist-concretagem/ConcretagemFotoPage';
import {
  chunkArray,
  buildFooterProps,
  getTipoRupturaTexto,
} from '@/utils/relatorioChecklistConcretagemUtils';
import { compressImages } from '@/utils/reportImageCompression';

// ── CargaContent ──────────────────────────────────────────────────────────────
const CargaContent = ({ carga }) => (
  <>
    <div className="mb-1">
      <h3 className="font-bold text-xs mb-0.5 bg-slate-50 p-0.5">Identificação da Carga</h3>
      <div className="grid grid-cols-2 gap-1 text-xs">
        <p><strong>Nota Fiscal Nº:</strong> {carga.nota_fiscal || 'N/A'}</p>
        <p><strong>Placa da Betoneira:</strong> {carga.placa_betoneira || 'N/A'}</p>
        <p><strong>Horário Início:</strong> {carga.horario_inicio || 'N/A'}</p>
        <p><strong>Horário Término:</strong> {carga.horario_termino || 'N/A'}</p>
      </div>
    </div>
    <h3 className="font-bold text-xs mb-0.5 bg-slate-50 p-0.5">Ensaios de Qualidade</h3>
    <table className="w-full border-collapse border border-slate-300 text-xs mb-1" style={{tableLayout:'fixed'}}>
      <colgroup>
        <col style={{width:'28%'}} /><col style={{width:'16%'}} />
        <col style={{width:'18%'}} /><col style={{width:'24%'}} /><col style={{width:'14%'}} />
      </colgroup>
      <thead className="bg-slate-100">
        <tr>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-left">Ensaio</th>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-center">Realizado</th>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-center">Resultado (cm)</th>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-center">Padrão do Projeto</th>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-center">Conform.</th>
        </tr>
      </thead>
      <tbody>
        {[
          { label: 'Slump Test', key: 'slump_test' },
          { label: 'Espessura da Camada', key: 'espessura_camada' },
        ].map(({ label, key }) => {
          const ensaio = carga[key];
          return (
            <tr key={key}>
              <td className="border border-slate-300 px-1 py-0.5 font-medium bg-slate-50">{label}</td>
              <td className="border border-slate-300 px-1 py-0.5 text-center"><Checkmark checked={ensaio?.realizado} /></td>
              <td className="border border-slate-300 px-1 py-0.5 text-center">{ensaio?.realizado && ensaio?.resultado !== null ? ensaio.resultado : '-'}</td>
              <td className="border border-slate-300 px-1 py-0.5 text-center text-xs">{ensaio?.limite || 'N/A'}</td>
              <td className="border border-slate-300 px-1 py-0.5 text-center">
                {ensaio?.realizado
                  ? ensaio.conforme === true ? <span className="text-green-600 font-bold text-lg">✓</span>
                  : ensaio.conforme === false ? <span className="text-red-600 font-bold text-lg">✗</span>
                  : <span className="text-slate-500">-</span>
                  : <span className="text-slate-500">-</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
    <p className="text-xs mb-1"><strong>Equipamento de Lançamento:</strong> {carga.equipamento_lancamento === 'convencional' ? 'Convencional' : carga.equipamento_lancamento === 'bombeado' ? 'Bombeado' : 'N/A'}</p>
    <h3 className="font-bold text-xs mb-0.5 bg-slate-50 p-0.5">Acompanhamento Lançamento Concreto</h3>
    <table className="w-full border-collapse border border-slate-300 text-xs mb-1">
      <thead className="bg-slate-100">
        <tr>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-left">Serviço</th>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-16">Sim</th>
          <th className="border border-slate-300 px-1 py-0.5 font-medium text-center w-16">Não</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border border-slate-300 px-1 py-0.5 font-medium bg-slate-50">A superfície foi tratada e limpa?</td>
          <td className="border border-slate-300 px-1 py-0.5 text-center">{carga.superficie_tratada_limpa === true && <span className="text-green-600 font-bold text-lg">✓</span>}</td>
          <td className="border border-slate-300 px-1 py-0.5 text-center">{carga.superficie_tratada_limpa === false && <span className="text-red-600 font-bold text-lg">✗</span>}</td>
        </tr>
        <tr>
          <td className="border border-slate-300 px-1 py-0.5 font-medium bg-slate-50">Foi realizado adensamento do concreto?</td>
          <td className="border border-slate-300 px-1 py-0.5 text-center">{carga.adensamento_realizado === true && <span className="text-green-600 font-bold text-lg">✓</span>}</td>
          <td className="border border-slate-300 px-1 py-0.5 text-center">{carga.adensamento_realizado === false && <span className="text-red-600 font-bold text-lg">✗</span>}</td>
        </tr>
      </tbody>
    </table>
    {carga.observacoes_lancamento && <div className="text-xs mb-1"><strong>Observações:</strong> {carga.observacoes_lancamento}</div>}
    <div className="mb-0">
      <h3 className="font-bold text-xs mb-0.5 bg-slate-50 p-0.5">Moldes para Fiscalização</h3>
      {carga.moldado_fiscalizacao ? (
        carga.corpos_prova?.length > 0 ? (
          <>
            <table className="w-full border-collapse border border-slate-300 text-xs mt-0.5">
              <thead className="bg-slate-100">
                <tr>
                  <th className="border border-slate-300 px-1 py-0.5 font-medium text-center">Dias para Ruptura</th>
                  <th className="border border-slate-300 px-1 py-0.5 font-medium text-center">Quantidade de CPs</th>
                  <th className="border border-slate-300 px-1 py-0.5 font-medium text-center">Tipo de Ruptura</th>
                </tr>
              </thead>
              <tbody>
                {[3, 7, 28].map((dias) => {
                  const cpsDestaDia = carga.corpos_prova.filter(cp => cp.dias_ruptura === dias);
                  if (cpsDestaDia.length === 0) return null;
                  return (
                    <tr key={dias}>
                      <td className="border border-slate-300 px-1 py-0.5 text-center font-medium bg-slate-50">{dias} dias</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-center">{cpsDestaDia.length}</td>
                      <td className="border border-slate-300 px-1 py-0.5 text-center">{getTipoRupturaTexto(cpsDestaDia[0].tipo_ruptura)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="text-xs mt-0.5 text-slate-600 mb-0"><strong>Total de CPs moldados:</strong> {carga.corpos_prova.length}</p>
          </>
        ) : (
          <div className="text-xs"><p><strong>Moldado:</strong> ✓ Sim</p><p className="text-slate-500 italic">Detalhes dos corpos de prova não registrados</p></div>
        )
      ) : (
        <div className="text-xs"><p><strong>Moldado para Fiscalização:</strong> ✗ Não</p></div>
      )}
    </div>
  </>
);

// ── Main component ─────────────────────────────────────────────────────────────
export default function RelatorioChecklistConcretagem({ checklist, creatorUser, obra, regional, project }) {
  const [compressedPhotos, setCompressedPhotos] = useState([]);
  const [isCompressing, setIsCompressing] = useState(true);

  useEffect(() => {
    compressImages(checklist?.fotos || [], { maxWidth: 800, maxHeight: 600, quality: 0.75 })
      .then(photos => setCompressedPhotos(photos))
      .finally(() => setIsCompressing(false));
  }, [checklist?.fotos]);

  if (isCompressing) {
    return <div className="p-8 text-center">Otimizando imagens para impressão...</div>;
  }

  const photoChunks = chunkArray(compressedPhotos, 6);
  const cargas = checklist.cargas_concreto || [];
  const temMultiplasCargas = cargas.length > 1;
  const temAcoesCorretivas = checklist.acoes_corretivas_realizado === true && checklist.acoes_corretivas_descricao;
  const footerProps = buildFooterProps(checklist, creatorUser);

  const DadosClimaObs = () => (
    <>
      <ConcretagemDadosObra checklist={checklist} obra={obra} regional={regional} />
      <ConcretagemClimaTable periodos={checklist.periodos_clima} />
      {checklist.observacoes_gerais && (
        <div className="mb-2">
          <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold text-[9px] mb-1 text-center">OBSERVAÇÕES GERAIS</div>
          <div className="text-[9px] p-1 bg-slate-50 border border-slate-300 rounded">{checklist.observacoes_gerais}</div>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-white font-sans">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 1.25mm 1.75mm; }
          html { -webkit-print-color-adjust: exact; }
          html, body { margin: 0 !important; padding: 0 !important; background: white !important; color-adjust: exact; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          aside, nav, [data-sidebar], [role="navigation"] { display: none !important; }
          .print-page { width: 100% !important; min-height: 100vh; box-sizing: border-box !important; page-break-after: always; }
          img { max-width: 80% !important; height: auto !important; display: block !important; }
          table { max-width: 100% !important; table-layout: fixed !important; }
          td, th { word-break: break-word !important; overflow-wrap: break-word !important; }
        }
      `}</style>

      {/* CASO 1: UMA ÚNICA CARGA */}
      {!temMultiplasCargas && cargas.length === 1 && (
        <div className="print-page w-full max-w-[210mm] mx-auto bg-white min-h-[297mm] p-4">
          <ConcretagemPageHeader regional={regional} data={checklist.data} titulo={"CONTROLE TECNOLÓGICO\nDE CONCRETO"} />
          <DadosClimaObs />
          <div className="mb-2">
            <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold text-[9px] mb-1 text-center">CARGA DE CONCRETO 1</div>
            <div className="text-[9px]"><CargaContent carga={cargas[0]} /></div>
          </div>
          <div className="mt-4 w-full"><SignatureFooter {...footerProps} /></div>
        </div>
      )}

      {/* CASO 2: MÚLTIPLAS CARGAS */}
      {temMultiplasCargas && cargas.map((carga, idx) => (
        <div key={idx} className="print-page w-full max-w-[210mm] mx-auto bg-white min-h-[297mm] p-4">
          <ConcretagemPageHeader regional={regional} data={checklist.data} titulo={"CONTROLE TECNOLÓGICO\nDE CONCRETO"} />
          {idx === 0 && <DadosClimaObs />}
          <div className="mb-2">
            <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold text-[9px] mb-1 text-center">CARGA DE CONCRETO {carga.numero_carga}</div>
            <div className="text-[9px]"><CargaContent carga={carga} /></div>
          </div>
          {idx === cargas.length - 1 && !temAcoesCorretivas && (
            <div className="mt-4 w-full"><SignatureFooter {...footerProps} /></div>
          )}
        </div>
      ))}

      {/* PÁGINA DE AÇÕES CORRETIVAS / NÃO CONFORMIDADES */}
      {(temAcoesCorretivas || checklist.nao_conformidades?.length > 0) && (
        <div className="print-page w-full max-w-[210mm] mx-auto bg-white min-h-[297mm] p-4">
          <ConcretagemPageHeader regional={regional} data={checklist.data} titulo={"CONTROLE TECNOLÓGICO\nDE CONCRETO"} />
          <div className="mb-2">
            <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold text-[9px] mb-1 text-center">DADOS DA OBRA</div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-[9px]">
              <div><p className="font-bold text-gray-700">CLIENTE:</p><p className="text-gray-900">{regional?.cliente || obra?.name || 'N/A'}</p></div>
              <div><p className="font-bold text-gray-700">CONCRETEIRA:</p><p className="text-gray-900">{checklist.concreteira || 'N/A'}</p></div>
              <div><p className="font-bold text-gray-700">EMPREITEIRA:</p><p className="text-gray-900">{checklist.empreiteira || 'N/A'}</p></div>
            </div>
          </div>
          {temAcoesCorretivas && (
            <div className="mb-2">
              <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold text-[9px] mb-1 text-center">AÇÕES CORRETIVAS</div>
              <div className="border border-slate-300 p-2 text-[9px] bg-slate-50 min-h-[60px]">{checklist.acoes_corretivas_descricao}</div>
            </div>
          )}
          {checklist.nao_conformidades?.length > 0 && (
            <div className="mb-2">
              <div className="bg-[#f1f5f9] text-gray-800 px-2 py-1 font-bold text-[9px] mb-1 text-center">NÃO CONFORMIDADES</div>
              <ReportNaoConformidadesTable naoConformidades={checklist.nao_conformidades} />
            </div>
          )}
          <div className="mt-4 w-full"><SignatureFooter {...footerProps} /></div>
        </div>
      )}

      {/* PÁGINAS DE FOTOS */}
      {photoChunks.map((chunk, pageIndex) => (
        <ConcretagemFotoPage key={pageIndex} chunk={chunk} pageIndex={pageIndex} regional={regional} data={checklist.data} />
      ))}
    </div>
  );
}