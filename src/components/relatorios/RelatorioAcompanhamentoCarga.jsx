import React from 'react';
import { useRelatorioAcompanhamentoCargaCtx } from './acompanhamento-carga/RelatorioAcompanhamentoCargaContext';
import ReportPrintHeader from './acompanhamento-carga/ReportPrintHeader';
import SignatureFooter from './SignatureFooter';

const SectionTitle = ({ children }) => (
  <h2 className="text-sm print:text-xs font-bold text-center bg-slate-100 p-0.5 my-0.5 uppercase tracking-wider">{children}</h2>
);

export default function RelatorioAcompanhamentoCarga() {
  const { data } = useRelatorioAcompanhamentoCargaCtx();

  if (!data) {
    return <div className="p-8">Dados do acompanhamento não encontrados.</div>;
  }

  return (
    <div className="bg-white font-sans">
      <div className="p-6 print:p-0 flex flex-col min-h-screen print:min-h-0">
        <div className="w-full flex flex-col">
          <ReportPrintHeader />
          
          <main className="text-xs mt-1 print:mt-3">
            <SectionTitle>Dados da Obra</SectionTitle>
            <div className="grid grid-cols-5 gap-x-4 gap-y-1 print:gap-y-1.5 mt-1" style={{ fontSize: '10px' }}>
              <div>
                <p className="font-bold">CLIENTE:</p>
                <p>{data.cliente}</p>
              </div>
              <div>
                <p className="font-bold">RODOVIA:</p>
                <p>{data.rodovia}</p>
              </div>
              <div>
                <p className="font-bold">SUB-TRECHO:</p>
                <p>{data.sub_trecho}</p>
              </div>
              <div>
                <p className="font-bold">N° DO PROJETO:</p>
                <p>{data.projeto_nome}</p>
              </div>
              <div>
                <p className="font-bold">SERVIÇO:</p>
                <p>{data.servico_label}</p>
              </div>

              <div>
                <p className="font-bold">OBRA:</p>
                <p>{data.obra_nome}</p>
              </div>
              <div>
                <p className="font-bold">TRECHO:</p>
                <p>{data.trecho}</p>
              </div>
              <div>
                <p className="font-bold">USINA FORNECEDORA:</p>
                <p>{data.usina_fornecedora}</p>
              </div>
              <div>
                <p className="font-bold">FAIXA ESPECIFICADA:</p>
                <p>{data.faixa_especificada}</p>
              </div>
              <div>
                <p className="font-bold">LABORATORISTA:</p>
                <p>{data.laboratorista}</p>
              </div>
            </div>
          </main>

          <div className="mt-3">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '7px', tableLayout: 'fixed' }}>
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 px-0.5 py-1 text-center font-bold" colSpan="5">DADOS DA USINA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-center font-bold" colSpan="10">DADOS DA PISTA</th>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '5.5%' }}>N° CARGA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>N° TICKET/NF</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>PLACA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>HORA SAÍDA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '5.5%' }}>PESO (t)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>HORA CHEGADA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '7%' }}>TEMP. CHEGADA (°C)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6.5%' }}>HORA APLIC.</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '7%' }}>TEMP. ESPALH. (°C)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '7%' }}>TEMP. COMPACT. (°C)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '5.5%' }}>PISTA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>ESPESSURA (cm)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>ESTACA IN.</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>ESTACA FIN.</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '23%' }}>OBSERVAÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {data.cargas.map((carga, index) => (
                    <tr key={index} className="even:bg-slate-50" style={{ fontSize: '7px' }}>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.numero}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.numero_ticket_nf}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.placa}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.hora_saida}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.peso_toneladas}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.hora_chegada}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.temp_chegada}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.hora_aplicacao}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.temp_espalhamento}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.temp_compactacao}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.pista}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.espessura_cm}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.estaca_inicial}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga.estaca_final}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-[6px] leading-tight">{carga.observacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2 break-inside-avoid">
              <SectionTitle>Observação Geral</SectionTitle>
              <div className="border border-slate-300 rounded p-2 min-h-[50px] text-[10px] leading-tight mt-1">
                {data.observacoes_gerais}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-2 print:pt-3 break-inside-avoid">
            <SignatureFooter {...data.signatureProps} />
          </div>
        </div>
      </div>
    </div>
  );
}