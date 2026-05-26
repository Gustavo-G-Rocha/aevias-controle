import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function AcompanhamentoUsinagemHeader({ editingId, rejectionReason }) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={createPageUrl("MeusEnsaios")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#00233B]">
              {editingId ? 'Editar' : 'Novo'} Acompanhamento de Usinagem
            </h1>
            <p className="text-[#00233B]/70">
              {editingId ? 'Edite os dados do acompanhamento' : 'Preencha os dados do acompanhamento'}
            </p>
          </div>
        </div>
      </div>

      {rejectionReason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-red-800 mb-1">Motivo da Reprovação:</p>
            <p className="text-sm text-red-700">{rejectionReason}</p>
          </CardContent>
        </Card>
      )}
    </>
  );
}