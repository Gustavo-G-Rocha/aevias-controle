import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function TextSectionsGroup({ form, updateForm }) {
  return (
    <>
      {/* Descrição */}
      <Card className="bg-card/20 backdrop-blur-lg border border-white/20">
        <CardHeader>
          <CardTitle className="text-foreground text-base bg-secondary/20/30 px-3 py-1 rounded">
            DESCRIÇÃO DA NÃO CONFORMIDADE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.descricao_nc}
            onChange={(e) => updateForm("descricao_nc", e.target.value)}
            rows={6}
            className="bg-card/50 border-white/20 text-foreground"
          />
        </CardContent>
      </Card>

      {/* Ações */}
      <Card className="bg-card/20 backdrop-blur-lg border border-white/20">
        <CardHeader>
          <CardTitle className="text-foreground text-base bg-secondary/20/30 px-3 py-1 rounded">
            AÇÕES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.acoes}
            onChange={(e) => updateForm("acoes", e.target.value)}
            rows={4}
            className="bg-card/50 border-white/20 text-foreground"
          />
        </CardContent>
      </Card>
    </>
  );
}