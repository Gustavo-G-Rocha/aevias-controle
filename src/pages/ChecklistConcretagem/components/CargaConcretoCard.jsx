import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";

export default function CargaConcretoCard({
  carga, index, canRemove, selectedProject,
  onRemove, onCargaChange, onCPConfigChange, onMoldadoChange,
  getQuantidadeCPs, getTipoRupturaCPs,
}) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">Carga {carga.numero_carga}</CardTitle>
          {canRemove && (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove}
              className="text-red-500 hover:text-red-700 p-0 h-auto">
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nota Fiscal Nº</Label>
            <Input value={carga.nota_fiscal} onChange={(e) => onCargaChange(index, "nota_fiscal", e.target.value)} />
          </div>
          <div>
            <Label>Placa da Betoneira</Label>
            <Input value={carga.placa_betoneira} onChange={(e) => onCargaChange(index, "placa_betoneira", e.target.value)} />
          </div>
        </div>

        {/* Ensaios de Qualidade */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold">Ensaios de Qualidade</h4>
            <p className="text-xs text-slate-600 italic">Determinar a conformidade dos parâmetros</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-2 text-left font-medium">Ensaio</th>
                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-24">Realizado</th>
                  <th className="border border-slate-300 px-2 py-2 text-center font-medium">Resultado (cm)</th>
                  <th className="border border-slate-300 px-2 py-2 text-center font-medium">Padrão do Projeto</th>
                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-24">Conformidade</th>
                </tr>
              </thead>
              <tbody>
                {/* Slump Test */}
                <tr>
                  <td className="border border-slate-300 px-2 py-2 font-medium bg-slate-50">Slump Test</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <input type="checkbox" checked={carga.slump_test.realizado}
                      onChange={(e) => onCargaChange(index, "slump_test.realizado", e.target.checked)} className="w-4 h-4" />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <Input type="number" step="0.1" value={carga.slump_test.resultado || ""}
                      onChange={(e) => onCargaChange(index, "slump_test.resultado", e.target.value)}
                      disabled={!carga.slump_test.realizado || !selectedProject} className="h-8 text-sm" placeholder="Resultado" />
                  </td>
                  <td className={`border border-slate-300 px-2 py-1 text-center text-xs ${selectedProject ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-500"}`}>
                    {carga.slump_test.limite || "N/A"}
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    {carga.slump_test.realizado
                      ? carga.slump_test.conforme === true ? <span className="text-green-600 font-bold text-xl">✓</span>
                        : carga.slump_test.conforme === false ? <span className="text-red-600 font-bold text-xl">✗</span>
                        : <span className="text-slate-500">-</span>
                      : <span className="text-slate-500">-</span>}
                  </td>
                </tr>
                {/* Espessura da Camada */}
                <tr>
                  <td className="border border-slate-300 px-2 py-2 font-medium bg-slate-50">Espessura da Camada</td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <input type="checkbox" checked={carga.espessura_camada.realizado}
                      onChange={(e) => onCargaChange(index, "espessura_camada.realizado", e.target.checked)} className="w-4 h-4" />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <Input type="number" step="0.1" value={carga.espessura_camada.resultado || ""}
                      onChange={(e) => onCargaChange(index, "espessura_camada.resultado", e.target.value)}
                      disabled={!carga.espessura_camada.realizado} className="h-8 text-sm" placeholder="Resultado" />
                  </td>
                  <td className="border border-slate-300 px-1 py-1">
                    <Input value={carga.espessura_camada.limite}
                      onChange={(e) => onCargaChange(index, "espessura_camada.limite", e.target.value)}
                      disabled={!carga.espessura_camada.realizado} className="h-8 text-sm" placeholder="Limite manual" />
                  </td>
                  <td className="border border-slate-300 px-2 py-1 text-center">
                    <div className="flex gap-2 justify-center">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={carga.espessura_camada.conforme === true}
                          onChange={(e) => onCargaChange(index, "espessura_camada.conforme", e.target.checked ? true : null)}
                          disabled={!carga.espessura_camada.realizado} className="w-4 h-4 accent-green-500" />
                        <span className="text-xs text-green-600">✓</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={carga.espessura_camada.conforme === false}
                          onChange={(e) => onCargaChange(index, "espessura_camada.conforme", e.target.checked ? false : null)}
                          disabled={!carga.espessura_camada.realizado} className="w-4 h-4 accent-red-500" />
                        <span className="text-xs text-red-600">✗</span>
                      </label>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Label>Equipamento de Lançamento</Label>
            <Select value={carga.equipamento_lancamento || ""} onValueChange={(v) => onCargaChange(index, "equipamento_lancamento", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="convencional">Convencional</SelectItem>
                <SelectItem value="bombeado">Bombeado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Acompanhamento Lançamento */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Acompanhamento Lançamento Concreto</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 px-2 py-2 text-left font-medium">Serviço</th>
                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-20">Sim</th>
                  <th className="border border-slate-300 px-2 py-2 text-center font-medium w-20">Não</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "A superfície foi tratada e limpa?", field: "superficie_tratada_limpa" },
                  { label: "Foi realizado adensamento do concreto?", field: "adensamento_realizado" },
                ].map(({ label, field }) => (
                  <tr key={field}>
                    <td className="border border-slate-300 px-2 py-2 font-medium bg-slate-50">{label}</td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      <input type="checkbox" checked={carga[field] === true}
                        onChange={(e) => onCargaChange(index, field, e.target.checked ? true : null)}
                        className="w-4 h-4 accent-green-500" />
                    </td>
                    <td className="border border-slate-300 px-2 py-1 text-center">
                      <input type="checkbox" checked={carga[field] === false}
                        onChange={(e) => onCargaChange(index, field, e.target.checked ? false : null)}
                        className="w-4 h-4 accent-red-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={carga.observacoes_lancamento} onChange={(e) => onCargaChange(index, "observacoes_lancamento", e.target.value)} rows={2} />
          </div>
        </div>

        {/* Moldes para Fiscalização */}
        <div className="border-t pt-4 space-y-3">
          <h4 className="font-semibold">Moldes para Fiscalização</h4>
          <div className="flex items-center gap-2">
            <input type="checkbox" id={`moldado_${index}`} checked={carga.moldado_fiscalizacao}
              onChange={(e) => onMoldadoChange(index, e.target.checked)} className="w-4 h-4" />
            <Label htmlFor={`moldado_${index}`} className="text-sm cursor-pointer">Moldado para Fiscalização</Label>
          </div>
          {carga.moldado_fiscalizacao && (
            <div className="space-y-3">
              <Label className="font-semibold">Configuração dos Corpos de Prova</Label>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-300 text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="border border-slate-300 p-2 text-center font-medium">Dias para Ruptura</th>
                      <th className="border border-slate-300 p-2 text-center font-medium">Quantidade de CPs</th>
                      <th className="border border-slate-300 p-2 text-center font-medium">Tipo de Ruptura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[3, 7, 28, 63].map((dias) => (
                      <tr key={dias}>
                        <td className="border border-slate-300 p-2 text-center font-medium bg-slate-50">{dias} dias</td>
                        <td className="border border-slate-300 p-2">
                          <Input type="number" min="0" max="10" value={getQuantidadeCPs(index, dias)}
                            onChange={(e) => onCPConfigChange(index, dias, "quantidade", e.target.value)}
                            className="h-9 text-center" placeholder="0" />
                        </td>
                        <td className="border border-slate-300 p-2">
                          <Select value={getTipoRupturaCPs(index, dias)}
                            onValueChange={(v) => onCPConfigChange(index, dias, "tipo_ruptura", v)}
                            disabled={getQuantidadeCPs(index, dias) === 0}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="compressao_axial">Compressão Axial</SelectItem>
                              <SelectItem value="comp_diametral">Compressão Diametral</SelectItem>
                              <SelectItem value="tracao_flexao">Tração na Flexão</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {carga.corpos_prova?.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    <strong>Total de CPs moldados:</strong> {carga.corpos_prova.length}
                    {[3, 7, 28, 63].map(d => carga.corpos_prova.filter(cp => cp.dias_ruptura === d).length > 0
                      ? ` | ${d} dias: ${carga.corpos_prova.filter(cp => cp.dias_ruptura === d).length}` : "").join("")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}