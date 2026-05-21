import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Loader2 } from "lucide-react";
import { TIPOS_ENSAIO } from "../constants/camposPorTipo";

export default function FiltrosCard({
  obras, regionais,
  obraId, tipoEnsaioSelecionado, dataInicio, dataFim, laboratoristaFiltro, laboratoristas,
  loadingData, temDados,
  onObraChange, onTipoChange,
  onDataInicioChange, onDataFimChange, onLaboratoristaChange,
  onGerarResumo, onExportarCSV,
}) {
  return (
    <Card className="bg-white/20 backdrop-blur-lg border border-white/20">
      <CardHeader>
        <CardTitle className="text-[#00233B] flex items-center gap-2">
          <Filter className="w-5 h-5 text-[#BFCF99]" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Obra */}
        <div>
          <Label htmlFor="obra" className="text-[#00233B]">Obra *</Label>
          <select
            id="obra"
            value={obraId}
            onChange={(e) => onObraChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 text-sm text-[#00233B]"
          >
            <option value="">Selecione uma obra</option>
            {obras.map(obra => {
              const regional = regionais.find(r => r.id === obra.regional_id);
              return (
                <option key={obra.id} value={obra.id}>
                  {obra.name} - {obra.code} {regional && `(${regional.nome})`}
                </option>
              );
            })}
          </select>
        </div>

        {/* Tipo de Ensaio */}
        <div>
          <Label htmlFor="tipoEnsaio" className="text-[#00233B]">Tipo de Ensaio *</Label>
          <select
            id="tipoEnsaio"
            value={tipoEnsaioSelecionado}
            onChange={(e) => onTipoChange(e.target.value)}
            className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 text-sm text-[#00233B]"
          >
            <option value="">Selecione um tipo de ensaio</option>
            {TIPOS_ENSAIO.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio" className="text-[#00233B]">Data Início</Label>
            <Input
              id="dataInicio" type="date" value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
              className="bg-white/50 border-white/20 text-[#00233B]"
            />
          </div>
          <div>
            <Label htmlFor="dataFim" className="text-[#00233B]">Data Fim</Label>
            <Input
              id="dataFim" type="date" value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
              className="bg-white/50 border-white/20 text-[#00233B]"
            />
          </div>
        </div>

        {/* Laboratorista */}
        {laboratoristas.length > 0 && (
          <div>
            <Label htmlFor="laboratorista" className="text-[#00233B]">Laboratorista</Label>
            <select
              id="laboratorista"
              value={laboratoristaFiltro}
              onChange={(e) => onLaboratoristaChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-white/20 bg-white/50 px-3 py-2 text-sm text-[#00233B]"
            >
              <option value="">Todos</option>
              {laboratoristas.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onGerarResumo}
            disabled={loadingData || !obraId || !tipoEnsaioSelecionado}
            className="bg-[#00233B] text-white hover:bg-[#00233B]/90"
          >
            {loadingData ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Carregando...</>
            ) : 'Gerar Resumo'}
          </Button>
          {temDados && (
            <Button
              onClick={onExportarCSV}
              variant="outline"
              className="border-[#00233B] text-[#00233B] hover:bg-[#00233B]/10"
            >
              Exportar CSV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}