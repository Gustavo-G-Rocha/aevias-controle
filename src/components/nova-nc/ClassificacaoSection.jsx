import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
            <select
              value={form.local_nc}
              onChange={e => onFormChange({ ...form, local_nc: e.target.value, categoria_nc: "", parametro_nc: "" })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Selecione o local</option>
              {LOCAIS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* CATEGORIA */}
          <div>
            <Label className="text-foreground">Categoria</Label>
            <select
              value={form.categoria_nc}
              onChange={e => onFormChange({ ...form, categoria_nc: e.target.value, parametro_nc: "" })}
              disabled={!form.local_nc}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
            >
              <option value="">Selecione a categoria</option>
              {getCategoriasByLocal(form.local_nc).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* PARÂMETRO */}
          <div>
            <Label className="text-foreground">Parâmetro</Label>
            {getParametrosByLocalCategoria(form.local_nc, form.categoria_nc).length > 0 ? (
              <select
                value={form.parametro_nc}
                onChange={e => onFormChange({ ...form, parametro_nc: e.target.value })}
                disabled={!form.categoria_nc}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground disabled:opacity-50"
              >
                <option value="">Selecione o parâmetro</option>
                {getParametrosByLocalCategoria(form.local_nc, form.categoria_nc).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
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