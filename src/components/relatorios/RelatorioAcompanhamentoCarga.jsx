import React from 'react';

const SectionTitle = ({ children }) => (
  <h2 className="text-sm print:text-xs font-bold text-center bg-slate-100 p-0.5 my-0.5 uppercase tracking-wider">{children}</h2>
);

const ReportPrintHeader = ({ acompanhamento, obra, regional }) => (
  <>
    <div className="print:hidden">
      <header className="grid grid-cols-3 items-center border-b-2 border-slate-900 pb-1 mb-2">
        <div className="flex justify-start">
          <picture><source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} /><img src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} alt="Logo Regional" className="h-10 object-contain" width="auto" height="40" /></picture>
        </div>
        <div className="text-center">
          <h1 className="text-sm font-bold text-gray-800 whitespace-nowrap">Acompanhamento de Aplicação de CAUQ</h1>
        </div>
        <div className="flex justify-end">
          <div className="border border-gray-400 p-1 rounded-md text-xs">
            <p className="font-semibold text-gray-800">
              {new Date(acompanhamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </p>
          </div>
        </div>
      </header>
    </div>

    <div className="hidden print:block mb-4">
      <div className="grid grid-cols-3 items-start border-b-2 border-slate-900 pb-2">
        <div className="flex justify-start">
          <picture><source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} /><img src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} alt="Logo Regional" className="h-12 object-contain" width="auto" height="48" /></picture>
        </div>
        <div className="text-center">
          <h1 className="text-base font-bold text-gray-800">Acompanhamento de Aplicação de CAUQ</h1>
        </div>
        <div className="flex justify-end">
          <div className="border border-gray-400 px-2 py-1 rounded text-sm">
            <p className="font-semibold text-gray-800">
              {new Date(acompanhamento.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  </>
);

import SignatureFooter from './SignatureFooter';

export default function RelatorioAcompanhamentoCarga({ acompanhamento, obra, regional, projeto, faixaGranulometrica }) {
  if (!acompanhamento) {
    return <div className="p-8">Dados do acompanhamento não encontrados.</div>;
  }

  const formatDateBrasilia = (dateString) => {
    if (!dateString) return 'N/A';
    let normalizedDate = dateString;
    if (!dateString.endsWith('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
      normalizedDate = dateString + 'Z';
    }
    return new Date(normalizedDate).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'medium' });
  };

  const servicoLabel = acompanhamento.servico === 'remendos' ? 'Remendos' : 'Capa/Reperfilagem';

  return (
    <div className="bg-white font-sans">
      <div className="p-6 print:p-0 flex flex-col min-h-screen print:min-h-0">
        <div className="w-full flex flex-col">
          <ReportPrintHeader acompanhamento={acompanhamento} obra={obra} regional={regional} />
          
          <main className="text-xs mt-1 print:mt-3">
            <SectionTitle>Dados da Obra</SectionTitle>
            <div className="grid grid-cols-5 gap-x-4 gap-y-1 print:gap-y-1.5 mt-1" style={{ fontSize: '10px' }}>
              <div>
                <p className="font-bold">CLIENTE:</p>
                <p>{regional?.cliente || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">RODOVIA:</p>
                <p>{acompanhamento.rodovia || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">SUB-TRECHO:</p>
                <p>{acompanhamento.sub_trecho || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">N° DO PROJETO:</p>
                <p>{projeto?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">SERVIÇO:</p>
                <p>{servicoLabel}</p>
              </div>

              <div>
                <p className="font-bold">OBRA:</p>
                <p>{obra?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">TRECHO:</p>
                <p>{acompanhamento.trecho || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">USINA FORNECEDORA:</p>
                <p>{acompanhamento.usina_fornecedora || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">FAIXA ESPECIFICADA:</p>
                <p>{faixaGranulometrica?.nome || 'N/A'}</p>
              </div>
              <div>
                <p className="font-bold">LABORATORISTA:</p>
                <p>{acompanhamento.laboratorista_name || 'N/A'}</p>
              </div>
            </div>
          </main>

          <div className="mt-3">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300" style={{ fontSize: '8px', tableLayout: 'fixed' }}>
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 px-0.5 py-1 text-center font-bold" colSpan="3">DADOS DA USINA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-center font-bold" colSpan="7">DADOS DA PISTA</th>
                  </tr>
                  <tr>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '6%' }}>N° CARGA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '9%' }}>PLACA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '7%' }}>PESO (t)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '8%' }}>HORA APLIC.</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '9%' }}>TEMP. ESPALH. (°C)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '9%' }}>TEMP. COMPACT. (°C)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '7%' }}>PISTA</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '8%' }}>ESPESSURA (cm)</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '12%' }}>ESTACA IN/FIN</th>
                    <th className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight" style={{ width: '25%' }}>OBSERVAÇÕES</th>
                  </tr>
                </thead>
                <tbody>
                  {(acompanhamento.cargas?.length ? acompanhamento.cargas : []).map((carga, index) => (
                    <tr key={index} className="even:bg-slate-50" style={{ fontSize: '8px' }}>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{index + 1}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga?.placa || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga?.peso_toneladas || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga?.hora_aplicacao || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga?.temp_espalhamento || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga?.temp_compactacao || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga?.pista || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{carga?.espessura_cm || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-center">{[carga?.estaca_inicial, carga?.estaca_final].filter(Boolean).join(' / ') || ''}</td>
                      <td className="border border-slate-300 px-0.5 py-1 text-[7px] leading-tight">{carga?.observacoes || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-2 break-inside-avoid">
              <SectionTitle>Observação Geral</SectionTitle>
              <div className="border border-slate-300 rounded p-2 min-h-[50px] text-[10px] leading-tight mt-1">
                {acompanhamento.observacoes_gerais || '—'}
              </div>
            </div>
          </div>

          <div className="mt-auto pt-2 print:pt-3 break-inside-avoid">
            <SignatureFooter
              labName={acompanhamento.laboratorista_name}
              labEmail={acompanhamento.created_by}
              labCreatedDate={acompanhamento.created_date}
              labPosition="Laboratorista"
              approverName={acompanhamento.approver_details?.name}
              approverEmail={acompanhamento.approved_by}
              approverPosition={acompanhamento.approver_details?.position}
              approverCREA={acompanhamento.approver_details?.crea_number}
              approverDate={acompanhamento.approved_date}
              clientName={acompanhamento.client_signature?.engineer_name}
              clientEmail={acompanhamento.client_signature?.signed_by}
              clientPosition={acompanhamento.client_signature?.position}
              clientCREA={acompanhamento.client_signature?.crea_number}
              clientDate={acompanhamento.client_signature?.signed_date}
            />
          </div>
        </div>
      </div>
    </div>
  );
}