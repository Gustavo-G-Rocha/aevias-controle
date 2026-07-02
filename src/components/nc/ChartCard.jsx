import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Card container padronizado para os gráficos de pizza da página de NCs.
 * Props: title, icon (componente Lucide), subtitle (opcional), children.
 */
export default function ChartCard({ title, icon: Icon, subtitle, children }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground text-base flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#BFCF99]" />
          {title}
          {subtitle && <span className="text-xs font-normal text-muted-foreground ml-1">({subtitle})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}