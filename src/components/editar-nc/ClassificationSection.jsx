import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LOCAIS } from "@/components/nc/ncData";

export default function ClassificationSection({
  form,
  updateForm,
  resetCategoryAndParameter,
  resetParameter,
  categorias,
  parametros,
}) {
  return (
    <Card className="bg-card/20 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <CardTitle className="text-foreground text-base bg-secondary/20/30 px-3 py-1 rounded">
          CLASSIFICAÇÃO DA NÃO CONFORMIDADE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-foreground">Local</Label>
            <select
              value={form.local_nc}
              onChange={(e) => {
                updateForm("local_nc", e.target.value);
                resetCategoryAndParameter();
              }}
              className="flex h-10 w-full rounded-md border border-white/20 bg-card/50 px-3 py-2 text-sm text-foreground"
            >
              <option value="">Selecione o local</option>
              {LOCAIS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-foreground">Categoria</Label>
            <select
              value={form.categoria_nc}
              onChange={(e) => {
                updateForm("categoria_nc", e.target.value);
                resetParameter();
              }}
              disabled={!form.local_nc}
              className="flex h-10 w-full rounded-md border border-white/20 bg-card/50 px-3 py-2 text-sm text-foreground disabled:opacity-50"
            >
              <option value="">Selecione a categoria</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-foreground">Parâmetro</Label>
            {parametros.length > 0 ? (
              <select
                value={form.parametro_nc}
                onChange={(e) => updateForm("parametro_nc", e.target.value)}
                disabled={!form.categoria_nc}
                className="flex h-10 w-full rounded-md border border-white/20 bg-card/50 px-3 py-2 text-sm text-foreground disabled:opacity-50"
              >
                <option value="">Selecione o parâmetro</option>
                {parametros.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                value={form.parametro_nc}
                onChange={(e) => updateForm("parametro_nc", e.target.value)}
                disabled={!form.categoria_nc}
                placeholder="Descreva o parâmetro..."
                className="bg-card/50 border-white/20 text-foreground disabled:opacity-50"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}