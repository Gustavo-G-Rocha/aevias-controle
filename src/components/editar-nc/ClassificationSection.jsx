import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
            <Select
              value={form.local_nc || ""}
              onValueChange={(value) => {
                updateForm("local_nc", value);
                resetCategoryAndParameter();
              }}
            >
              <SelectTrigger className="border-white/20 bg-card/50 text-foreground">
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent title="Selecione o local">
                {LOCAIS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Categoria</Label>
            <Select
              value={form.categoria_nc || ""}
              onValueChange={(value) => {
                updateForm("categoria_nc", value);
                resetParameter();
              }}
              disabled={!form.local_nc}
            >
              <SelectTrigger className="border-white/20 bg-card/50 text-foreground">
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent title="Selecione a categoria">
                {categorias.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-foreground">Parâmetro</Label>
            {parametros.length > 0 ? (
              <Select
                value={form.parametro_nc || ""}
                onValueChange={(value) => updateForm("parametro_nc", value)}
                disabled={!form.categoria_nc}
              >
                <SelectTrigger className="border-white/20 bg-card/50 text-foreground">
                  <SelectValue placeholder="Selecione o parâmetro" />
                </SelectTrigger>
                <SelectContent title="Selecione o parâmetro">
                  {parametros.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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