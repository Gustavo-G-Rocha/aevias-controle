import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buildKpiItems } from "@/utils/ncComponentUtils";

export default function NaoConformidadesKpis({ rncsVisiveis, cncsVisiveis }) {
  const kpis = buildKpiItems(rncsVisiveis, cncsVisiveis);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map(kpi => (
        <Card key={kpi.label} className="bg-white/20 backdrop-blur-lg border border-white/20">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-[#00233B]/70 font-medium uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}