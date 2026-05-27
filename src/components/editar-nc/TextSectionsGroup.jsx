import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function TextSectionsGroup({ form, updateForm }) {
  return (
    <>
      {/* Descrição */}
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader>
          <CardTitle className="text-[#00233B] text-base bg-[#BFCF99]/30 px-3 py-1 rounded">
            DESCRIÇÃO DA NÃO CONFORMIDADE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.descricao_nc}
            onChange={(e) => updateForm("descricao_nc", e.target.value)}
            rows={6}
            className="bg-white/50 border-white/20 text-[#00233B]"
          />
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
        <CardHeader>
          <CardTitle className="text-[#00233B] text-base bg-[#BFCF99]/30 px-3 py-1 rounded">
            AÇÕES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.acoes}
            onChange={(e) => updateForm("acoes", e.target.value)}
            rows={4}
            className="bg-white/50 border-white/20 text-[#00233B]"
          />
        </CardContent>
      </Card>
    </>
  );
}