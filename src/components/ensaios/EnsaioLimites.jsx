import React from 'react';
import { useEnsaioLimitesForm } from '@/hooks/useEnsaioLimitesForm';
import { useEnsaioLimitesData } from '@/hooks/useEnsaioLimitesData';
import { HigroUmidadeSection, PeneiramentoGrossoSection, PeneiramentoFinoSection } from '@/components/ensaio-limites/EnsaioLimitesGranulometria';
import { LimiteLiquidezSection, LimitePlasticidadeSection } from '@/components/ensaio-limites/EnsaioLimitesLimites';
import { ResumoSection } from '@/components/ensaio-limites/EnsaioLimitesResumo';
import { DadosAmostraSection } from '@/components/ensaio-limites/DadosAmostraSection';

export { defaultLimites } from '@/utils/ensaioLimitesConstantes';

const sectionHeader = 'bg-[#00233B]/10 text-[#00233B] text-center font-bold text-xs py-1 border border-[#00233B]/20 mb-2 rounded';

export default function EnsaioLimites({ data, onChange }) {
  const { set, setNested } = useEnsaioLimitesForm(data, onChange);
  const derived = useEnsaioLimitesData(data);



  return (
    <div className="space-y-6 text-sm">
      {/* ══════════════════════════════════
          ANÁLISE GRANULOMÉTRICA
      ══════════════════════════════════ */}
      <div>
        <div className={sectionHeader}>ANÁLISE GRANULOMÉTRICA</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HigroUmidadeSection
            data={data}
            higroTeor1={derived.higroTeor1}
            higroTeor2={derived.higroTeor2}
            higroTeorMedia={derived.higroTeorMedia}
            onSet={set}
          />
          <PeneiramentoGrossoSection
            data={data}
            granGrossaCalc={derived.granGrossaCalc}
            onSetNested={setNested}
          />
        </div>

        <DadosAmostraSection
          data={data}
          amostraTotalSecaAuto={derived.amostraTotalSecaAuto}
          soloSecoRetido10={derived.soloSecoRetido10}
          soloUmPassando10={derived.soloUmPassando10}
          sp10={derived.sp10}
          amostraTotalSecaCalc={derived.amostraTotalSecaCalc}
          onSet={set}
        />

        <PeneiramentoFinoSection
          data={data}
          granFinaCalc={derived.granFinaCalc}
          sp10={derived.sp10}
          amostraTotalSeca={derived.amostraTotalSeca}
          onSet={set}
          onSetNested={setNested}
        />
      </div>

      {/* ══════════════════════════════════
          ENSAIOS FÍSICOS
      ══════════════════════════════════ */}
      <div>
        <div className={sectionHeader}>ENSAIOS FÍSICOS (ABNT NBR 6459/2017 | NBR 7180/2016)</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LimiteLiquidezSection
            data={data}
            llCalc={derived.llCalc}
            llFit={derived.llFit}
            llPoints={derived.llPoints}
            llYAxisDomain={derived.llYAxisDomain}
            llCurve={derived.llCurve}
            onSetNested={setNested}
          />

          <LimitePlasticidadeSection
            data={data}
            lpTeors={derived.lpTeors}
            lpMedia={derived.lpMedia}
            onSetNested={setNested}
          />
        </div>
      </div>

      {/* Resumo */}
      <ResumoSection
        pctPedregulho={derived.pctPedregulho}
        pctAreiaGrossaMedia={derived.pctAreiaGrossaMedia}
        pctAreiaFina={derived.pctAreiaFina}
        pctSilteArgila={derived.pctSilteArgila}
        llFit={derived.llFit}
        lpMedia={derived.lpMedia}
        IP={derived.IP}
        igCalc={derived.igCalc}
        classificacaoHRB={derived.classificacaoHRB}
      />
    </div>
  );
}