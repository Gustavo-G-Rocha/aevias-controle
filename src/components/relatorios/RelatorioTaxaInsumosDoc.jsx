import React from 'react';
import SignatureFooter from './SignatureFooter';

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

export default function RelatorioTaxaInsumosDoc({ ensaio, obra, regional }) {
  const ensaios = ensaio.ensaios || [];
  const dimensoes = ensaio.dimensoes_bandeja || {};

  const titulo = ensaio.tipo_insumo === 'cimento'
    ? 'TAXA DE CIMENTO'
    : 'TAXA DE AGREGADO';

  return (
    <div className="taxa-insumos-document bg-slate-200/60 font-sans py-8">
      <style>{`
        @media print {
          body, html { margin: 0; padding: 0; background: white !important; }
          .taxa-insumos-document { padding: 0 !important; background: white !important; }
          .print-page {
            width: 100%;
            max-width: none;
            min-height: 276mm;
            margin: 0;
            padding: 3mm 2mm;
            box-sizing: border-box;
            box-shadow: none !important;
            border-radius: 0 !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
        @media screen {
          .print-page { width: 210mm; min-height: 297mm; padding: 14mm 12mm; box-sizing: border-box; box-shadow: 0 4px 24px rgba(0,0,0,0.12); border-radius: 2px; }
        }
      `}</style>
      <div className="print-page flex flex-col w-full max-w-[210mm] mx-auto bg-white">

        {/* Header */}
        <div className="flex justify-between items-start mb-4 pb-3 border-b-2 border-slate-900">
          <div className="w-16">
            <img
              src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"}
              alt="Logo"
              className="h-12 object-contain"
              width="auto" height="48"
            />
          </div>
          <div className="text-center flex-1">
            <h1 className="text-sm font-bold text-gray-800 leading-tight">{titulo}</h1>
          </div>
          <div className="text-right w-16">
            <div className="border border-gray-400 p-1 rounded inline-block">
              <p className="text-[10px] font-semibold text-gray-800">{formatDate(ensaio.data_ensaio)}</p>
            </div>
          </div>
        </div>

        {/* DADOS DA OBRA */}
        <div className="mb-5">
          <div className="bg-[#BFCF99] text-[#00233B] px-2 py-1.5 font-bold text-[10px] mb-1.5 text-center">DADOS DA OBRA</div>
          <table className="w-full border-collapse text-[10px]">
            <tbody>
              <tr>
                <td className="px-2 py-0.5 w-1/4 font-bold text-gray-700">CLIENTE:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{regional?.cliente || ''}</td>
                <td className="px-2 py-0.5 w-1/4 font-bold text-gray-700">MATERIAL:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{ensaio.material || ''}</td>
              </tr>
              <tr>
                <td className="px-2 py-0.5 font-bold text-gray-700">OBRA:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{obra?.name || ensaio.obra_name || ''}</td>
                <td className="px-2 py-0.5 font-bold text-gray-700">SERVIÇO:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{ensaio.servico || ''}</td>
              </tr>
              <tr>
                <td className="px-2 py-0.5 font-bold text-gray-700">RODOVIA:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{ensaio.rodovia || ''}</td>
                <td className="px-2 py-0.5 font-bold text-gray-700">PLACA CAMINHÃO:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{ensaio.placa_caminhao || ''}</td>
              </tr>
              <tr>
                <td className="px-2 py-0.5 font-bold text-gray-700">TRECHO:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{ensaio.trecho || ''}</td>
                <td className="px-2 py-0.5 font-bold text-gray-700">LABORATORISTA:</td>
                <td className="px-2 py-0.5 border-b border-slate-200">{ensaio.laboratorista_name || ''}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* DADOS DO ENSAIO */}
        <div className="mb-4">
          <div className="bg-[#BFCF99] text-[#00233B] px-2 py-1.5 font-bold text-[10px] mb-1.5 text-center">DADOS DO ENSAIO</div>

          {/* ÁREA DA BANDEJA */}
          <div className="mb-4">
            <div className="bg-[#BFCF99]/30 px-1 py-1 font-bold text-[10px] text-center border border-slate-300">ÁREA DA BANDEJA</div>
            <table className="w-full border-collapse text-[10px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-2 py-1.5 text-left font-semibold">Nº DA BANDEJA</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-left font-semibold italic">CÁLCULOS</th>
                  <th className="border border-slate-300 px-2 py-1.5 text-center font-semibold">UNIDADE</th>
                  {ensaios.map((_, i) => (
                    <th key={i} className="border border-slate-300 px-2 py-1.5 text-center font-semibold">{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5">LADO 1</td>
                  <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">L₁</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center">cm</td>
                  {ensaios.map((_, i) => (
                    <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{dimensoes.lado_1 || ''}</td>
                  ))}
                </tr>
                <tr>
                  <td className="border border-slate-300 px-2 py-1.5">LADO 2</td>
                  <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">L₂</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center">cm</td>
                  {ensaios.map((_, i) => (
                    <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{dimensoes.lado_2 || ''}</td>
                  ))}
                </tr>
                <tr className="bg-slate-50">
                  <td className="border border-slate-300 px-2 py-1.5 font-bold">ÁREA</td>
                  <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">A = L₁ × L₂ / 10000</td>
                  <td className="border border-slate-300 px-2 py-1.5 text-center">m²</td>
                  {ensaios.map((_, i) => (
                    <td key={i} className="border border-slate-300 px-2 py-1.5 text-center font-bold">{dimensoes.area?.toFixed(4) || ''}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* EXECUÇÃO DO ENSAIO */}
          <div className="bg-[#BFCF99]/30 px-1 py-1 font-bold text-[10px] text-center border border-slate-300">EXECUÇÃO DO ENSAIO</div>
          <table className="w-full border-collapse text-[10px]">
            <tbody>
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold w-1/3">HORA DO ENSAIO</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center text-[9px]">–</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">–</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{e.hora || ''}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold">CAMADA</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center text-[9px]">–</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">–</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{e.camada || ''}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold">ESTACA DO ENSAIO</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center text-[9px]">–</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">–</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{e.estaca || ''}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold">Nº DA BANDEJA</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center text-[9px]">–</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">–</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{e.no_bandeja || ''}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold">PESO DA BANDEJA+AMOSTRA</td>
                <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">P₁</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">g</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{e.peso_bandeja_amostra ?? ''}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold">PESO DA BANDEJA</td>
                <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">P₂</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">g</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{e.peso_bandeja ?? ''}</td>
                ))}
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-2 py-1.5 font-bold">PESO DA AMOSTRA</td>
                <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">C = P₁ − P₂</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">g</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center font-bold">{e.peso_amostra?.toFixed(2) ?? ''}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-slate-300 px-2 py-1.5 font-semibold">ÁREA DA BANDEJA</td>
                <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">A</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">m²</td>
                {ensaios.map((_, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center">{dimensoes.area?.toFixed(4) || ''}</td>
                ))}
              </tr>
              <tr className="bg-slate-50">
                <td className="border border-slate-300 px-2 py-1.5 font-bold">TAXA APLICADA</td>
                <td className="border border-slate-300 px-2 py-1.5 italic text-center text-[9px]">Tc = C / (1000 × A)</td>
                <td className="border border-slate-300 px-2 py-1.5 text-center">kg/m²</td>
                {ensaios.map((e, i) => (
                  <td key={i} className="border border-slate-300 px-2 py-1.5 text-center font-bold">{e.taxa_aplicada?.toFixed(2) ?? ''}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* OBSERVAÇÕES */}
        <div className="mt-5">
          <p className="font-bold text-[10px] mb-1">Observações:</p>
          <div className="border border-slate-300 p-2 text-[10px] min-h-[60px]">
            {ensaio.observacoes || ''}
          </div>
        </div>

        {/* Assinaturas — mt-auto empurra para o rodapé da folha A4 */}
        <div className="mt-auto pt-8">
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
          />
        </div>
      </div>
    </div>
  );
}