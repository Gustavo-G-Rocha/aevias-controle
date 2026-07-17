import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function EnsaioProctorHeader({ recordId }) {
  return (
    <div className="flex items-start justify-between">
      <div className="hidden lg:block">
        <h1 className="text-3xl font-bold text-foreground">Ensaio Proctor</h1>
        <p className="text-muted-foreground mt-1">ABNT NBR 7182:2016 - Compactação de Solos</p>
      </div>
      {recordId && (
        <Button
          variant="outline"
          onClick={() => window.open(`/RelatorioProctor?id=${recordId}`, '_blank')}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" /> Ver Relatório
        </Button>
      )}
    </div>
  );
}