import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";

export default function DadosObraSection({ formData, handleChange, obras, regionais, isEditable, isApproved }) {
  const obraSelecionada = obras.find(o => o.id === formData.obra_id);
  const regionalSelecionada = obraSelecionada ? regionais.find(r => r.id === obraSelecionada.regional_id) : null;

  useEffect(() => {
    if (regionalSelecionada && regionalSelecionada.cliente !== formData.cliente) {
      handleChange("cliente", regionalSelecionada.cliente || "");
    }
    handleChange("rodovia", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [obraSelecionada?.id]);

  const disabled = !isEditable || isApproved;

  return (
    <div className="space-y-4">
      {/* Obra + Regional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Obra *</Label>
          <Select value={formData.obra_id || ""} onValueChange={(v) => handleChange("obra_id", v)} required disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Selecione a obra" /></SelectTrigger>
            <SelectContent>
              {obras.map(o => {
                const reg = regionais.find(r => r.id === o.regional_id);
                return <SelectItem key={o.id} value={o.id}>{o.name} - {o.code}{reg && ` (${reg.nome})`}</SelectItem>;
              })}
            </SelectContent>
          </Select>
        </div>
        {regionalSelecionada && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
            <div className="space-y-1 text-sm">
              <p className="text-primary"><strong>📍 Regional:</strong> {regionalSelecionada.nome} - {regionalSelecionada.codigo}</p>
              {regionalSelecionada.cliente && <p className="text-primary"><strong>👤 Cliente:</strong> {regionalSelecionada.cliente}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Data + Jornada */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Data *</Label>
          <Input type="date" name="data" value={formData.data} onChange={(e) => handleChange(e.target.name, e.target.value)} required disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label>Horário Início *</Label>
          <Input type="time" value={formData.jornada?.horario_inicio || ""} onChange={(e) => handleChange("jornada", { ...formData.jornada, horario_inicio: e.target.value })} required disabled={disabled} />
        </div>
        <div className="space-y-2">
          <Label>Horário Fim *</Label>
          <Input type="time" value={formData.jornada?.horario_fim || ""} onChange={(e) => handleChange("jornada", { ...formData.jornada, horario_fim: e.target.value })} required disabled={disabled} />
        </div>
      </div>

      {/* Tipo Local */}
      <div className="space-y-2">
        <Label>Local do Registro *</Label>
        <Select value={formData.tipo_local} onValueChange={(v) => handleChange("tipo_local", v)} disabled={disabled}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="campo">Campo</SelectItem>
            <SelectItem value="usina">Usina</SelectItem>
            <SelectItem value="escritorio">Escritório</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Campos condicionais ao tipo_local */}
      {formData.tipo_local !== "escritorio" && (
        <>
          {obraSelecionada?.tipo_obra === "supervisao" && (
            <div className="space-y-2">
              <Label>Empreiteira *</Label>
              <Select value={formData.empreiteira || ""} onValueChange={(v) => handleChange("empreiteira", v)} required disabled={disabled}>
                <SelectTrigger><SelectValue placeholder="Selecione a empreiteira" /></SelectTrigger>
                <SelectContent>
                  {obraSelecionada?.empreiteiras?.length > 0
                    ? obraSelecionada.empreiteiras.map(em => <SelectItem key={em} value={em}>{em}</SelectItem>)
                    : <SelectItem value="__none__" disabled>Nenhuma empreiteira cadastrada</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.tipo_local === "campo" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rodovia *</Label>
                {obraSelecionada?.rodovias?.length > 0 ? (
                  <>
                    <div className="border rounded-md p-2 space-y-1 max-h-40 overflow-y-auto bg-background">
                      {obraSelecionada.rodovias.map(rodovia => {
                        const selected = (formData.rodovia || "").split(" - ").map(r => r.trim()).filter(Boolean);
                        const isChecked = selected.includes(rodovia);
                        const maxReached = selected.length >= 2 && !isChecked;
                        return (
                          <label key={rodovia} className={`flex items-center gap-2 px-2 py-1 rounded ${disabled || maxReached ? "opacity-50 pointer-events-none" : "cursor-pointer hover:bg-muted"}`}>
                            <input type="checkbox" checked={isChecked} disabled={maxReached} onChange={() => {
                              const newSel = isChecked ? selected.filter(r => r !== rodovia) : [...selected, rodovia];
                              handleChange("rodovia", newSel.join(" - "));
                            }} className="rounded" />
                            <span className="text-sm">{rodovia}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">Máximo 2 rodovias</p>
                  </>
                ) : (
                  // Fallback: quando a obra não possui rodovias cadastradas (comum offline
                  // ou em obras de certificação), permite digitar livremente para não
                  // bloquear a finalização do diário.
                  <Input
                    name="rodovia"
                    value={formData.rodovia || ""}
                    onChange={(e) => handleChange("rodovia", e.target.value)}
                    placeholder="Digite a rodovia (ex: BR-153)"
                    required
                    disabled={disabled}
                  />
                )}
                {formData.rodovia && obraSelecionada?.rodovias?.length > 0 && <p className="text-xs text-muted-foreground">Selecionadas: {formData.rodovia}</p>}
              </div>
              <div className="space-y-2">
                <Label>Trecho *</Label>
                <Input name="trecho" value={formData.trecho} onChange={(e) => handleChange(e.target.name, e.target.value)} placeholder="Ex: km 10 ao km 15" required disabled={disabled} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Usina *</Label>
              <Select value={formData.usina_selecionada || ""} onValueChange={(v) => handleChange("usina_selecionada", v)} required disabled={disabled}>
                <SelectTrigger><SelectValue placeholder="Selecione a usina" /></SelectTrigger>
                <SelectContent>
                  {obraSelecionada?.usinas?.length > 0
                    ? obraSelecionada.usinas.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)
                    : <SelectItem value={null} disabled>Nenhuma usina cadastrada</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Condições Climáticas *</Label>
              <Select value={formData.condicoes_climaticas} onValueChange={(v) => handleChange("condicoes_climaticas", v)} disabled={disabled}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["ensolarado", "nublado", "chuvoso", "garoa", "vento_forte", "neblina"].map(v => (
                    <SelectItem key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1).replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temperatura (°C)</Label>
              <Input name="temperatura" type="number" value={formData.temperatura} onChange={(e) => handleChange(e.target.name, e.target.value)} placeholder="Ex: 25" disabled={disabled} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}