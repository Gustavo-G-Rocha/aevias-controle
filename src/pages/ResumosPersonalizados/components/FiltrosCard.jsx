import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5 text-secondary" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Obra */}
        <div>
          <Label htmlFor="obra" className="text-foreground">Obra *</Label>
          <Select value={obraId || ""} onValueChange={onObraChange}>
            <SelectTrigger id="obra">
              <SelectValue placeholder="Selecione uma obra" />
            </SelectTrigger>
            <SelectContent title="Selecione uma obra">
              {obras.map(obra => {
                const regional = regionais.find(r => r.id === obra.regional_id);
                return (
                  <SelectItem key={obra.id} value={obra.id}>
                    {obra.name} - {obra.code} {regional && `(${regional.nome})`}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de Ensaio */}
        <div>
          <Label htmlFor="tipoEnsaio" className="text-foreground">Tipo de Ensaio *</Label>
          <Select value={tipoEnsaioSelecionado || ""} onValueChange={onTipoChange}>
            <SelectTrigger id="tipoEnsaio">
              <SelectValue placeholder="Selecione um tipo de ensaio" />
            </SelectTrigger>
            <SelectContent title="Tipo de Ensaio">
              {TIPOS_ENSAIO.map(tipo => (
                <SelectItem key={tipo.value} value={tipo.value}>{tipo.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Período */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dataInicio" className="text-foreground">Data Início</Label>
            <Input
              id="dataInicio" type="date" value={dataInicio}
              onChange={(e) => onDataInicioChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="dataFim" className="text-foreground">Data Fim</Label>
            <Input
              id="dataFim" type="date" value={dataFim}
              onChange={(e) => onDataFimChange(e.target.value)}
            />
          </div>
        </div>

        {/* Laboratorista */}
        {laboratoristas.length > 0 && (
          <div>
            <Label htmlFor="laboratorista" className="text-foreground">Laboratorista</Label>
            <Select
              value={laboratoristaFiltro || "__all__"}
              onValueChange={(value) => onLaboratoristaChange(value === "__all__" ? "" : value)}
            >
              <SelectTrigger id="laboratorista">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent title="Laboratorista">
                <SelectItem value="__all__">Todos</SelectItem>
                {laboratoristas.map(lab => (
                  <SelectItem key={lab} value={lab}>{lab}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={onGerarResumo}
            disabled={loadingData || !obraId || !tipoEnsaioSelecionado}
          >
            {loadingData ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Carregando...</>
            ) : 'Gerar Resumo'}
          </Button>
          {temDados && (
            <Button onClick={onExportarCSV} variant="outline">
              Exportar CSV
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}