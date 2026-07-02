import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, HardHat, MapPin, Building2, Calendar as CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { STATUS_LABELS } from "@/utils/naoConformidadesUtils";

export default function NaoConformidadesFilters({
  // filter values
  filtroStatus, filtroParametro, filtroObraId,
  filtroEmpreiteira, setFiltroEmpreiteira,
  filtroRodovia, setFiltroRodovia,
  filtroUsina, setFiltroUsina,
  filtroDataInicial, setFiltroDataInicial,
  filtroDataFinal, setFiltroDataFinal,
  // clear individual
  setFiltroStatus, setFiltroParametro, setFiltroObraId,
  // options
  opcoesEmpreiteira, opcoesRodovia, opcoesUsina,
  // obra lookup for badge label
  obras,
  // composite
  hasActiveFilter,
}) {
  return (
    <>
      {/* Dropdowns */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-foreground text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-secondary" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <span className="text-xs text-muted-foreground font-medium mb-1 block flex items-center gap-1"><HardHat className="w-3 h-3" /> Empreiteira</span>
              <Select value={filtroEmpreiteira || '_all'} onValueChange={v => setFiltroEmpreiteira(v === '_all' ? null : v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todas</SelectItem>
                  {opcoesEmpreiteira.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3" /> Rodovia</span>
              <Select value={filtroRodovia || '_all'} onValueChange={v => setFiltroRodovia(v === '_all' ? null : v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todas</SelectItem>
                  {opcoesRodovia.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium mb-1 block flex items-center gap-1"><Building2 className="w-3 h-3" /> Usina</span>
              <Select value={filtroUsina || '_all'} onValueChange={v => setFiltroUsina(v === '_all' ? null : v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">Todas</SelectItem>
                  {opcoesUsina.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium mb-1 block flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Data Inicial</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full h-9 px-3 text-sm bg-background border border-input rounded-md text-foreground text-left flex items-center justify-between hover:bg-accent transition-colors">
                    {filtroDataInicial ? format(filtroDataInicial, 'dd/MM/yyyy') : 'Selecionar'}
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filtroDataInicial} onSelect={setFiltroDataInicial} />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium mb-1 block flex items-center gap-1"><CalendarIcon className="w-3 h-3" /> Data Final</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="w-full h-9 px-3 text-sm bg-background border border-input rounded-md text-foreground text-left flex items-center justify-between hover:bg-accent transition-colors">
                    {filtroDataFinal ? format(filtroDataFinal, 'dd/MM/yyyy') : 'Selecionar'}
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={filtroDataFinal} onSelect={setFiltroDataFinal} disabled={(date) => filtroDataInicial ? date < filtroDataInicial : false} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active filter badges */}
      {hasActiveFilter && (
        <div className="flex flex-wrap gap-2">
          {filtroStatus && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroStatus(null)}>Status: {STATUS_LABELS[filtroStatus]} <X className="w-3 h-3"/></Badge>}
          {filtroParametro && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroParametro(null)}>Parâmetro: {filtroParametro} <X className="w-3 h-3"/></Badge>}
          {filtroObraId && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroObraId(null)}>Obra: {obras.find(o => o.id === filtroObraId)?.name} <X className="w-3 h-3"/></Badge>}
          {filtroEmpreiteira && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroEmpreiteira(null)}>Empreiteira: {filtroEmpreiteira} <X className="w-3 h-3"/></Badge>}
          {filtroRodovia && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroRodovia(null)}>Rodovia: {filtroRodovia} <X className="w-3 h-3"/></Badge>}
          {filtroUsina && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroUsina(null)}>Usina: {filtroUsina} <X className="w-3 h-3"/></Badge>}
          {filtroDataInicial && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroDataInicial(null)}>De: {format(filtroDataInicial, 'dd/MM/yyyy')} <X className="w-3 h-3"/></Badge>}
          {filtroDataFinal && <Badge className="bg-secondary/20/30 text-foreground border border-secondary/30/50 cursor-pointer gap-1" onClick={() => setFiltroDataFinal(null)}>Até: {format(filtroDataFinal, 'dd/MM/yyyy')} <X className="w-3 h-3"/></Badge>}
        </div>
      )}
    </>
  );
}