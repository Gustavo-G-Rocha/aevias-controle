import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SIM_NAO_NA = ["sim", "nao", "na"];

const SimNaoNaSelect = ({ value, onChange, disabled }) => (
  <Select value={value || "sim"} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="sim">Sim</SelectItem>
      <SelectItem value="nao">Não</SelectItem>
      <SelectItem value="na">N/A</SelectItem>
    </SelectContent>
  </Select>
);

const LUZES_GRUPOS = [
  { title: "Luzes Traseiras — Direita", groupKey: "luzes_traseiras", side: "direita", items: [{ k: "da_placa", l: "Da placa" }, { k: "luz", l: "Luz" }, { k: "luz_re", l: "Luz de ré" }, { k: "luz_freio", l: "Luz de freio" }, { k: "seta", l: "Seta" }] },
  { title: "Luzes Traseiras — Esquerda", groupKey: "luzes_traseiras", side: "esquerda", items: [{ k: "luz", l: "Luz" }, { k: "luz_re", l: "Luz de ré" }, { k: "luz_freio", l: "Luz de freio" }, { k: "seta", l: "Seta" }] },
  { title: "Luzes Dianteiras — Direita", groupKey: "luzes_dianteiras", side: "direita", items: [{ k: "farol_alto", l: "Farol alto" }, { k: "farol_baixo", l: "Farol baixo" }, { k: "seta", l: "Seta" }, { k: "neblina", l: "Neblina" }] },
  { title: "Luzes Dianteiras — Esquerda", groupKey: "luzes_dianteiras", side: "esquerda", items: [{ k: "farol_alto", l: "Farol alto" }, { k: "farol_baixo", l: "Farol baixo" }, { k: "seta", l: "Seta" }, { k: "neblina", l: "Neblina" }] },
];

const SEGURANCA_ITEMS = [
  { k: "alarme", l: "Alarme" }, { k: "buzina", l: "Buzina" }, { k: "chave_roda", l: "Chave de Roda" }, { k: "cintos", l: "Cintos" },
  { k: "documentos", l: "Documentos" }, { k: "extintor", l: "Extintor" }, { k: "limpadores", l: "Limpadores" }, { k: "macaco", l: "Macaco" },
  { k: "painel", l: "Painel" }, { k: "retrovisor_interno", l: "Retrovisor Interno" }, { k: "retrovisor_direito", l: "Retrovisor Direito" },
  { k: "retrovisor_esquerdo", l: "Retrovisor Esquerdo" }, { k: "travas", l: "Travas" }, { k: "triangulo", l: "Triângulo" },
];

const MOTOR_ITEMS = [
  { k: "acelerador", l: "Acelerador" }, { k: "agua_limpador", l: "Água do limpador" }, { k: "agua_radiador", l: "Água do radiador" },
  { k: "embreagem", l: "Embreagem" }, { k: "freio", l: "Freio" }, { k: "freio_mao", l: "Freio de mão" },
  { k: "oleo_freio", l: "Óleo do freio" }, { k: "oleo_moto", l: "Óleo do moto" }, { k: "tanque_partida", l: "Tanque de partida" },
];

export default function ChecklistVeiculoSection({ formData, handleChange, isEditable, isApproved }) {
  const disabled = !isEditable || isApproved;
  const veiculo = formData.checklist_veiculo || {};

  const setVeiculoField = (patch) => handleChange("checklist_veiculo", { ...veiculo, ...patch });
  const setNestedField = (groupKey, side, key, value) => {
    handleChange("checklist_veiculo", {
      ...veiculo,
      [groupKey]: { ...veiculo[groupKey], [side]: { ...veiculo[groupKey]?.[side], [key]: value } },
    });
  };

  return (
    <Card className="bg-slate-50">
      <CardHeader><CardTitle className="text-lg">Checklist de Veículo</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Preencher Checklist de Veículo?</Label>
          <Select value={formData.checklist_veiculo_ativo === true ? "sim" : "nao"} onValueChange={(v) => handleChange("checklist_veiculo_ativo", v === "sim")} disabled={disabled}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.checklist_veiculo_ativo && (
          <div className="space-y-4 mt-4 p-4 border-2 border-blue-200 rounded-lg bg-white">
            {/* Dados básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "nome_condutor", label: "Nome do Condutor *" },
                { key: "veiculo", label: "Veículo (Modelo) *", placeholder: "Ex: Toyota Corolla" },
                { key: "placa", label: "Placa *", placeholder: "Ex: ABC-1234" },
                { key: "empresa", label: "Empresa *" },
                { key: "hodometro", label: "Hodômetro *", placeholder: "Ex: 45.230 km" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <Input value={veiculo[key] || ""} onChange={(e) => setVeiculoField({ [key]: e.target.value })}
                    disabled={disabled} placeholder={placeholder} required={formData.checklist_veiculo_ativo} />
                </div>
              ))}
              <div>
                <Label>Tipo de Veículo *</Label>
                <Select value={veiculo.tipo_veiculo || "passeio"} onValueChange={(v) => setVeiculoField({ tipo_veiculo: v })} disabled={disabled}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passeio">Veículo de Passeio</SelectItem>
                    <SelectItem value="picape">Picape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Áreas Afetadas do Veículo</Label>
              <Textarea value={veiculo.areas_afetadas || ""} onChange={(e) => setVeiculoField({ areas_afetadas: e.target.value })}
                disabled={disabled} rows={2} placeholder="Descreva áreas com danos..." />
            </div>

            {/* Condições Gerais */}
            <div>
              <Label className="font-semibold">Condições Gerais</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                {[
                  { key: "limpeza_externa", label: "Limpeza Externa" },
                  { key: "limpeza_interna", label: "Limpeza Interna" },
                  { key: "pneus", label: "Pneus" },
                  { key: "estepe", label: "Estepe" },
                  ...(veiculo.tipo_veiculo === "picape" ? [{ key: "cacamba", label: "Caçamba" }] : []),
                ].map(item => (
                  <div key={item.key}>
                    <Label className="text-xs">{item.label}</Label>
                    <Select value={veiculo.condicoes_gerais?.[item.key] || "bom"}
                      onValueChange={(v) => setVeiculoField({ condicoes_gerais: { ...veiculo.condicoes_gerais, [item.key]: v } })}
                      disabled={disabled}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bom">Bom</SelectItem>
                        <SelectItem value="medio">Médio</SelectItem>
                        <SelectItem value="ruim">Ruim</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>

            {/* Luzes */}
            {LUZES_GRUPOS.map(({ title, groupKey, side, items }) => (
              <div key={title} className="border rounded p-3 bg-blue-50">
                <Label className="font-semibold text-sm mb-2 block">{title}</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {items.map(({ k, l }) => (
                    <div key={k}>
                      <Label className="text-xs">{l}</Label>
                      <SimNaoNaSelect
                        value={veiculo[groupKey]?.[side]?.[k]}
                        onChange={(v) => setNestedField(groupKey, side, k, v)}
                        disabled={disabled}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Segurança */}
            <div>
              <Label className="font-semibold text-base">Segurança</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {SEGURANCA_ITEMS.map(({ k, l }) => (
                  <div key={k}>
                    <Label className="text-xs">{l}</Label>
                    <SimNaoNaSelect
                      value={veiculo.seguranca?.[k]}
                      onChange={(v) => setVeiculoField({ seguranca: { ...veiculo.seguranca, [k]: v } })}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Motor */}
            <div>
              <Label className="font-semibold text-base">Motor</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {MOTOR_ITEMS.map(({ k, l }) => (
                  <div key={k}>
                    <Label className="text-xs">{l}</Label>
                    <SimNaoNaSelect
                      value={veiculo.motor?.[k]}
                      onChange={(v) => setVeiculoField({ motor: { ...veiculo.motor, [k]: v } })}
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Observações do Veículo</Label>
              <Textarea value={veiculo.observacoes || ""} onChange={(e) => setVeiculoField({ observacoes: e.target.value })}
                disabled={disabled} rows={3} placeholder="Observações adicionais..." />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}