import React from 'react';
import { agruparLevantamentosPorFaixa, prepararChartData } from '@/utils/relatorioVigaBenkelmanUtils';
import RelatorioVigaBenkelmanHeader from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanHeader';
import RelatorioVigaBenkelmanDadosObra from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanDadosObra';
import RelatorioVigaBenkelmanTabela from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanTabela';
import RelatorioVigaBenkelmanGrafico from '@/components/relatorio-viga-benkelman/RelatorioVigaBenkelmanGrafico';
import SignatureFooter from './SignatureFooter';

/**
 * Relatório de Viga Benkelman para o Relatório Unificado.
 * Recebe o registro (ensaio) como prop — não carrega dados próprios.
 */
export default function RelatorioVigaBenkelman({ ensaio, obra, regional }) {
  if (!ensaio) {
    return <div className="p-8 text-center text-slate-500">Sem dados do ensaio.</div>;
  }

  const faixasArray = agruparLevantamentosPorFaixa(ensaio.levantamentos);

  return (
    <div className="report-content-container w-full max-w-[210mm] mx-auto bg-white p-1 print:p-1">
      {faixasArray.map((faixa, faixaIdx) => {
        const chartData = prepararChartData(faixa.levantamentos, ensaio.def_admissivel);

        return (
          <div key={`faixa-${faixaIdx}`} className={faixaIdx > 0 ? "print:break-before-page" : ""}>
            <RelatorioVigaBenkelmanHeader ensaio={ensaio} regional={regional} faixaNome={faixa.nome} />
            <div className="mb-0">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-1.5 py-0 font-bold text-center mb-0 text-[10px]">
                DADOS DO ENSAIO
              </div>
            </div>
            <RelatorioVigaBenkelmanDadosObra ensaio={ensaio} obra={obra} regional={regional} faixaNome={faixa.nome} />
            <RelatorioVigaBenkelmanTabela faixa={faixa} ensaio={ensaio} />
            <RelatorioVigaBenkelmanGrafico chartData={chartData} />

            {ensaio.observacoes && (
              <div className="mb-0 print:break-inside-avoid">
                <div className="bg-slate-200 px-1.5 py-0 font-bold text-[8px]">OBSERVAÇÕES</div>
                <div className="p-0.5 text-[8px] min-h-[15px] border" style={{ borderColor: 'rgb(148, 163, 184)', borderWidth: '0.05px' }}>
                  <div className="whitespace-pre-wrap">{ensaio.observacoes}</div>
                </div>
              </div>
            )}

            <footer className="mt-2 pt-2">
              <SignatureFooter
                labName={ensaio.laboratorista_name}
                labEmail={ensaio.created_by}
                labCreatedDate={ensaio.created_date}
                labPosition="Laboratorista"
                approverName={ensaio.approver_details?.name}
                approverEmail={ensaio.approved_by}
                approverPosition={ensaio.approver_details?.position}
                approverCREA={ensaio.approver_details?.crea_number}
                approverDate={ensaio.approved_date}
                clientName={ensaio.client_signature?.engineer_name}
                clientEmail={ensaio.client_signature?.signed_by}
                clientPosition={ensaio.client_signature?.position}
                clientCREA={ensaio.client_signature?.crea_number}
                clientDate={ensaio.client_signature?.signed_date}
                sizePrint={true}
              />
            </footer>
          </div>
        );
      })}
    </div>
  );
}