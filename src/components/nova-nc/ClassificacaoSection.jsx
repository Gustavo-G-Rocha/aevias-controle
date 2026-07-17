import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCAIS, getCategoriasByLocal, getParametrosByLocalCategoria } from "@/components/nc/ncData";

export function ClassificacaoSection({ form, onFormChange }) {
  return (
    <Card className="bg-transparent">
      <CardHeader>
        <CardTitle className="text-primary text-base bg-secondary/20/30 px-3 py-1 rounded">
          CLASSIFICAÇÃO DA NÃO CONFORMIDADE
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LOCAL */}
          <div>
            <Label className="text-foreground">Local</Label>
            <Select
              value={form.local_nc || ""}
              onValueChange={value => onFormChange({ ...form, local_nc: value, categoria_nc: "", parametro_nc: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o local" />
              </SelectTrigger>
              <SelectContent title="Selecione o local">
                {LOCAIS.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CATEGORIA */}
          <div>
            <Label className="text-foreground">Categoria</Label>
            <Select
              value={form.categoria_nc || ""}
              onValueChange={value => onFormChange({ ...form, categoria_nc: value, parametro_nc: "" })}
              disabled={!form.local_nc}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent title="Selecione a categoria">
                {getCategoriasByLocal(form.local_nc).map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PARÂMETRO */}
          <div>
            <Label className="text-foreground">Parâmetro</Label>
            {getParametrosByLocalCategoria(form.local_nc, form.categoria_nc).length > 0 ? (
              <Select
                value={form.parametro_nc || ""}
                onValueChange={value => onFormChange({ ...form, parametro_nc: value })}
                disabled={!form.categoria_nc}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o parâmetro" />
                </SelectTrigger>
                <SelectContent title="Selecione o parâmetro">
                  {getParametrosByLocalCategoria(form.local_nc, form.categoria_nc).map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={form.parametro_nc}
                onChange={e => onFormChange({ ...form, parametro_nc: e.target.value })}
                disabled={!form.categoria_nc}
                placeholder={form.categoria_nc === "Usina - Diversos" ? "Descreva o parâmetro..." : "Sem parâmetros específicos"}
                className="disabled:opacity-50"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}