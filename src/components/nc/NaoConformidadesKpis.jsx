import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { buildKpiItems } from "@/utils/ncComponentUtils";

export default function NaoConformidadesKpis({ rncsVisiveis, cncsVisiveis }) {
  const kpis = buildKpiItems(rncsVisiveis, cncsVisiveis);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map(kpi => (
        <Card key={kpi.label}>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
            <p className={`text-3xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}