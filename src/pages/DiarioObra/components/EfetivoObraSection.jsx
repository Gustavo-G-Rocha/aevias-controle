import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MAQUINAS = [
  { key: "motoniveladora", label: "Motoniveladora" }, { key: "caminhao_munck", label: "Caminhão Munck" }, { key: "recicladora", label: "Recicladora" }, { key: "onibus", label: "Ônibus" },
  { key: "pa_carregadeira", label: "Pá Carregadeira" }, { key: "caminhao_sinalizacao", label: "Caminhão Sinalização" }, { key: "vibro_acabadora", label: "Vibro Acabadora" }, { key: "trator_grade", label: "Trator de Grade" },
  { key: "retroescavadeira", label: "Retroescavadeira" }, { key: "caminhao_pipa", label: "Caminhão Pipa" }, { key: "rolo_carneiro", label: "Rolo Carneiro" }, { key: "trator_esteira", label: "Trator de Esteira" },
  { key: "escavadeira_hidraulica", label: "Escavadeira Hidráulica" }, { key: "caminhao_basculante", label: "Caminhão Basculante" }, { key: "rolo_liso", label: "Rolo Liso" }, { key: "veiculo_leve", label: "Veículo Leve" },
  { key: "mini_carregadeira", label: "Mini Carregadeira" }, { key: "caminhao_cimento", label: "Caminhão Cimento" }, { key: "rolo_pneu", label: "Rolo Pneu" }, { key: "placa_vibratoria", label: "Placa Vibratória" },
  { key: "extrusora", label: "Extrusora" }, { key: "caminhao_viga", label: "Caminhão Viga" }, { key: "tanque_combustivel", label: "Tanque Combustível" }, { key: "caminhao_prancha", label: "Caminhão Prancha" },
  { key: "caminhao_espargidor", label: "Caminhão Espargidor" }, { key: "comboio", label: "Comboio" },
];

const COLABORADORES = [
  { key: "encarregado", label: "Encarregado" }, { key: "pedreiro", label: "Pedreiro" }, { key: "topografo", label: "Topógrafo" }, { key: "spoter", label: "Spoter" },
  { key: "greidista", label: "Greidista" }, { key: "armador", label: "Armador" }, { key: "aux_topografia", label: "Aux. Topografia" }, { key: "seguranca", label: "Segurança" },
  { key: "operadores", label: "Operadores" }, { key: "carpinteiro", label: "Carpinteiro" }, { key: "laboratorista", label: "Laboratorista" }, { key: "apontador", label: "Apontador" },
  { key: "motorista", label: "Motorista" }, { key: "ajudante", label: "Ajudante" }, { key: "aux_laboratorio", label: "Aux. Laboratório" }, { key: "pintor", label: "Pintor" },
  { key: "eletricista", label: "Eletricista" },
];

export default function EfetivoObraSection({ formData, handleChange, isEditable, isApproved }) {
  const disabled = !isEditable || isApproved;

  return (
    <Card className="bg-green-50 border-green-200 text-slate-900">
      <CardHeader><CardTitle className="text-lg text-slate-900">Efetivo de Obra</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Preencher Efetivo de Obra?</Label>
          <div className="flex items-center space-x-4">
            {[true, false].map(val => (
              <label key={String(val)} className="flex items-center">
                <input type="radio" checked={formData.efetivo_obra_ativo === val} onChange={() => handleChange("efetivo_obra_ativo", val)} disabled={disabled} className="mr-2" />
                {val ? "Sim" : "Não"}
              </label>
            ))}
          </div>
        </div>

        {formData.efetivo_obra_ativo && (
          <div className="space-y-6 p-4 border-2 border-green-300 rounded-lg bg-white">
            <div>
              <Label className="text-base font-semibold mb-3 block">Efetivo de Máquinas Operantes</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MAQUINAS.map(item => (
                  <div key={item.key}>
                    <Label className="text-sm">{item.label}</Label>
                    <Input type="number" min="0" value={formData.efetivo_maquinas?.[item.key] || 0}
                      onChange={(e) => handleChange("efetivo_maquinas", { ...formData.efetivo_maquinas, [item.key]: parseInt(e.target.value) || 0 })}
                      disabled={disabled} className="mt-1" />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-base font-semibold mb-3 block">Efetivo de Colaboradores</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COLABORADORES.map(item => (
                  <div key={item.key}>
                    <Label className="text-sm">{item.label}</Label>
                    <Input type="number" min="0" value={formData.efetivo_colaboradores?.[item.key] || 0}
                      onChange={(e) => handleChange("efetivo_colaboradores", { ...formData.efetivo_colaboradores, [item.key]: parseInt(e.target.value) || 0 })}
                      disabled={disabled} className="mt-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}