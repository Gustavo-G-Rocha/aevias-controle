import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Card container padronizado para os gráficos de pizza da página de NCs.
 * Props: title, icon (componente Lucide), subtitle (opcional), children.
 */
export default function ChartCard({ title, icon: Icon, subtitle, children }) {
  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-[#00233B] text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#BFCF99]" />
          {title}
          {subtitle && <span className="text-xs font-normal text-[#00233B]/50 ml-1">({subtitle})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}