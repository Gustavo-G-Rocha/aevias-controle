import React, { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { fitParabola } from "@/components/ensaios/ProctorChart";

import { useEnsaioProctorData } from "@/hooks/useEnsaioProctorData";
import { useEnsaioProctorForm } from "@/hooks/useEnsaioProctorForm";
import { useEnsaioProctorActions } from "@/hooks/useEnsaioProctorActions";

import EnsaioProctorHeader from "@/components/ensaio-proctor/EnsaioProctorHeader";
import EnsaioProctorDadosGerais from "@/components/ensaio-proctor/EnsaioProctorDadosGerais";
import EnsaioProctorResultados from "@/components/ensaio-proctor/EnsaioProctorResultados";
import EnsaioProctorActions from "@/components/ensaio-proctor/EnsaioProctorActions";

export default function EnsaioProctorPage() {
  const { form, setForm, obras, projetos, setProjetos, loading, recordId } = useEnsaioProctorData();

  const { handleObraChange, handleEnergiaChange, updateUmidade, updateDensidade, updatePesoAmUmidaAll } =
    useEnsaioProctorForm(setForm, setProjetos);

  const { saving, handleSave } = useEnsaioProctorActions(form, recordId);

  const isHigro = form.correcao_densidade === "higroscopica";

  const chartPoints = useMemo(() => {
    return form.densidades
      .map((d, originalIdx) => ({
        x: isHigro ? d.umidade_calculada : (form.umidades[originalIdx]?.teor_umidade_media || 0),
        y: d.dens_ap_seca,
      }))
      .filter(p => p.x > 0 && p.y > 0);
  }, [form.densidades, form.umidades, isHigro]);

  const parabola = useMemo(() => fitParabola(chartPoints), [chartPoints]);
  const densMaxAuto = parabola ? parabola.gamma_max.toFixed(4) : "";
  const umidOtimaAuto = parabola ? parabola.w_otima.toFixed(2) : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#BFCF99]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 min-h-screen bg-transparent">
      <EnsaioProctorHeader recordId={recordId} />

      <EnsaioProctorDadosGerais
        form={form}
        setForm={setForm}
        obras={obras}
        projetos={projetos}
        handleObraChange={handleObraChange}
        handleEnergiaChange={handleEnergiaChange}
      />

      <EnsaioProctorResultados
        form={form}
        setForm={setForm}
        chartPoints={chartPoints}
        parabola={parabola}
        densMaxAuto={densMaxAuto}
        umidOtimaAuto={umidOtimaAuto}
        updateUmidade={updateUmidade}
        updateDensidade={updateDensidade}
        updatePesoAmUmidaAll={updatePesoAmUmidaAll}
      />

      <EnsaioProctorActions saving={saving} handleSave={handleSave} />
    </div>
  );
}