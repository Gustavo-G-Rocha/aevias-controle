import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useReportMode } from "@/hooks/useReportMode";
import { fitParabola } from "@/components/ensaios/ProctorChart";
import RelatorioLimites from "@/components/relatorios/RelatorioLimites";
import SignatureFooter from "@/components/relatorios/SignatureFooter";

import { useRelatorioProctorData }    from "@/hooks/useRelatorioProctorData";
import { useRelatorioProctorActions } from "@/hooks/useRelatorioProctorActions";
import {
  calcISC, calcExpansao, evalParabola, buildInfoFields,
} from "@/utils/relatorioProctorUtils";

import RelatorioProctorToolbar    from "@/components/relatorio-proctor/RelatorioProctorToolbar";
import RelatorioProctorInfo       from "@/components/relatorio-proctor/RelatorioProctorInfo";
import RelatorioProctorCompactacao from "@/components/relatorio-proctor/RelatorioProctorCompactacao";
import RelatorioProctorISC        from "@/components/relatorio-proctor/RelatorioProctorISC";
import RelatorioProctorExpansao   from "@/components/relatorio-proctor/RelatorioProctorExpansao";
import RelatorioProctorGraficos   from "@/components/relatorio-proctor/RelatorioProctorGraficos";

export default function RelatorioProctor() {
  const { ensaio, obra, regional, loading, error } = useRelatorioProctorData();
  const { handlePrint } = useRelatorioProctorActions();

  useReportMode();

  const isHigro = ensaio?.correcao_densidade === 'higroscopica';

  // ── chart points ──
  const chartPoints = useMemo(() => {
    if (!ensaio) return [];
    return (ensaio.densidades || []).map((d, i) => ({
      x: isHigro ? d.umidade_calculada : (ensaio.umidades?.[i]?.teor_umidade_media || 0),
      y: d.dens_ap_seca,
    })).filter(p => p.x > 0 && p.y > 0);
  }, [ensaio, isHigro]);

  const parabola = useMemo(() => fitParabola(chartPoints), [chartPoints]);

  // ── ISC / expansão points ──
  const iscPoints = useMemo(() => {
    if (!ensaio) return [];
    const umidPorCil = isHigro
      ? (ensaio.densidades || []).map(d => d.umidade_calculada)
      : (ensaio.umidades  || []).map(u => u.teor_umidade_media);
    return (ensaio.cbr_cilindros || []).map((c, i) => {
      const { isc } = calcISC(c, ensaio.cbr_fator_anel);
      const x = umidPorCil[i];
      return (x > 0 && isc != null) ? { x, y: isc } : null;
    }).filter(Boolean);
  }, [ensaio, isHigro]);

  const expPoints = useMemo(() => {
    if (!ensaio) return [];
    const umidPorCil = isHigro
      ? (ensaio.densidades || []).map(d => d.umidade_calculada)
      : (ensaio.umidades  || []).map(u => u.teor_umidade_media);
    return (ensaio.expansao_cilindros || []).map((e, i) => {
      const { expansao_pct } = calcExpansao(e);
      const x = umidPorCil[i];
      return (x > 0 && expansao_pct != null) ? { x, y: expansao_pct } : null;
    }).filter(Boolean);
  }, [ensaio, isHigro]);

  const iscParabola = useMemo(() => fitParabola(iscPoints), [iscPoints]);
  const expParabola = useMemo(() => fitParabola(expPoints), [expPoints]);

  const wOtima      = parabola?.w_otima;
  const iscAtWotima = useMemo(() => evalParabola(iscParabola, wOtima), [iscParabola, wOtima]);
  const expAtWotima = useMemo(() => evalParabola(expParabola, wOtima), [expParabola, wOtima]);

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-slate-500" /></div>;
  if (error || !ensaio) return <div className="flex justify-center items-center h-screen text-red-600">{error || "Erro"}</div>;

  const infoFields = buildInfoFields(ensaio, obra);

  return (
    <div className="relatorio-page bg-white min-h-screen">
      <RelatorioProctorToolbar ensaio={ensaio} isHigro={isHigro} onPrint={handlePrint} />

      <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-2 print:p-1 flex flex-col">
        {/* Header */}
        <header className="grid items-center py-1" style={{ gridTemplateColumns: '60px 1fr 60px' }}>
          <div>
            <picture>
              <source srcSet={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} />
              <img src={regional?.logo_url || "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"} alt="Logo" className="h-8 object-contain" width="auto" height="32" />
            </picture>
          </div>
          <h1 className="text-xs font-bold text-gray-800 text-center">CARACTERIZAÇÃO MECÂNICA</h1>
        </header>

        <main className="text-xs space-y-2">
          <RelatorioProctorInfo
            infoFields={infoFields}
            ensaio={ensaio}
            parabola={parabola}
            iscAtWotima={iscAtWotima}
            expAtWotima={expAtWotima}
          />

          <RelatorioProctorCompactacao ensaio={ensaio} isHigro={isHigro} />

          {ensaio.realizar_cbr_expansao && <RelatorioProctorISC     ensaio={ensaio} />}
          {ensaio.realizar_cbr_expansao && <RelatorioProctorExpansao ensaio={ensaio} />}

          <RelatorioProctorGraficos
            chartPoints={chartPoints}
            parabola={parabola}
            iscPoints={iscPoints}
            expPoints={expPoints}
            iscParabola={iscParabola}
            expParabola={expParabola}
            iscAtWotima={iscAtWotima}
            expAtWotima={expAtWotima}
          />

          {ensaio.observacoes && (
            <section>
              <div className="bg-slate-200 px-2 py-0.5 font-bold" style={{ fontSize: '10px' }}>OBSERVAÇÕES</div>
              <div className="border border-slate-300 p-1 whitespace-pre-wrap" style={{ fontSize: '9px' }}>{ensaio.observacoes}</div>
            </section>
          )}
        </main>

        <footer className="mt-4 pt-2">
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
        </footer>
      </div>

      {/* Página 2 — Ensaios físicos */}
      {ensaio.realizar_limites && ensaio.limites && (
        <div className="w-full max-w-[210mm] mx-auto bg-white shadow-xl print:shadow-none p-2 print:p-1">
          <RelatorioLimites limites={ensaio.limites} ensaio={ensaio} obra={obra} regional={regional} />
        </div>
      )}

      <style jsx>{`
        @media print {
          @page { size: A4 portrait; margin: 8mm 10mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; margin: 0; padding: 0; }
          .relatorio-page > div:first-child { display: none !important; }
        }
        table tr { line-height: 1.078; }
        table td, table th { padding-top: 0.176rem; padding-bottom: 0.176rem; }
      `}</style>
    </div>
  );
}