import React from 'react';
import SignatureFooter from '../SignatureFooter';
import { buildSignatureProps } from '@/utils/relatorioUtils';

const LOGO_DEFAULT = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png";

const SERVICO_LABEL = {
  capa: 'Capa',
  reperfilagem: 'Reperfilagem',
  remendo: 'Remendo',
  capa_reperfilagem: 'Capa/Reperfilagem',
};

export default function PaginaMedicaoCargas({ checklist, obra, regional, creatorUser, pageNum, totalPages }) {
  const medicoes = checklist.medicoes_usina || {};
  const logoUrl = regional?.logo_url || LOGO_DEFAULT;
  const servicoLabel = SERVICO_LABEL[medicoes.servico] || medicoes.servico || '-';

  return (
    <div className="p-8 print:p-8 flex flex-col page-container min-h-screen break-before-page">
      <div className="w-full max-w-[190mm] mx-auto flex-grow flex flex-col">
        <header className="border-b-2 border-slate-900 pb-2 mb-3">
          <div className="flex justify-between items-center">
            <picture>
              <source srcSet={logoUrl} />
              <img src={logoUrl} alt="Logo" className="h-14 object-contain" width="auto" height="56" />
            </picture>
            <h1 className="text-xl font-bold text-center text-gray-800 flex-1 mx-4">MEDIÇÃO DE CARGAS DA USINA</h1>
            <div className="border border-gray-400 p-2 rounded-md text-sm">
              <p className="font-semibold">{new Date(checklist.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-x-8 text-sm mb-3 border border-slate-300 p-2">
          <div className="space-y-1">
            <p><span className="font-bold">OBRA:</span> {obra?.name || '-'}</p>
            <p><span className="font-bold">USINA:</span> {checklist.usina || '-'}</p>
            <p><span className="font-bold">TRECHO:</span> {medicoes.sub_trecho || '-'}</p>
            <p><span className="font-bold">SUB-TRECHO:</span> {medicoes.sub_trecho || '-'}</p>
          </div>
          <div className="space-y-1">
            <p><span className="font-bold">FISCAL DE CAMPO:</span> {checklist.inspetor_campo || '-'}</p>
            <p><span className="font-bold">EMPREITEIRA:</span> {obra?.empreiteiras?.[0] || '-'}</p>
            <p><span className="font-bold">SERVIÇO:</span> {servicoLabel}</p>
          </div>
        </div>

        <main className="flex-grow flex flex-col">
          <table className="w-full border-collapse border border-slate-400 text-xs flex-grow" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr className="bg-slate-200">
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '13%' }}>Nº TICKET<br />(NOTA FISCAL)</th>
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '10%' }}>PLACA</th>
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '8%' }}>QTE.<br />(t)</th>
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '9%' }}>VOLUME<br />(m³)</th>
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '10%' }}>TEMP.<br />(°C)</th>
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '20%' }}>RODOVIA DESTINO</th>
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '15%' }}>EQUIPE</th>
                <th className="border border-slate-400 px-1 py-1.5 text-center font-bold" style={{ width: '22%' }}>OBSERVAÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 30 }).map((_, i) => {
                const carga = (medicoes.cargas || [])[i];
                return (
                  <tr key={i} style={{ height: '20px' }} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="border border-slate-300 px-1 text-center overflow-hidden">{carga?.numero_ticket || ''}</td>
                    <td className="border border-slate-300 px-1 text-center overflow-hidden">{carga?.placa || ''}</td>
                    <td className="border border-slate-300 px-1 text-center overflow-hidden">{carga?.quantidade_toneladas ?? ''}</td>
                    <td className="border border-slate-300 px-1 text-center overflow-hidden">{carga?.volume_m3 ?? ''}</td>
                    <td className="border border-slate-300 px-1 text-center overflow-hidden">{carga?.temperatura ?? ''}</td>
                    <td className="border border-slate-300 px-1 text-center overflow-hidden">{carga?.rodovia_destino || ''}</td>
                    <td className="border border-slate-300 px-1 text-center overflow-hidden">{carga?.equipe || ''}</td>
                    <td className="border border-slate-300 px-1 overflow-hidden">{carga?.observacoes || ''}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </main>

        <SignatureFooter {...buildSignatureProps(checklist, creatorUser)} />
        <footer className="mt-2 pt-1 text-center text-sm print:text-xs text-gray-400">
          Página {pageNum} de {totalPages}
        </footer>
      </div>
    </div>
  );
}