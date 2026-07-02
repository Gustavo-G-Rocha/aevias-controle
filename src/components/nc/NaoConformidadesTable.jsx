import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ClipboardList, Search, X, Eye, FileText } from "lucide-react";
import { createPageUrl } from "@/utils";

import { mapRncToRow, mapCncToRow, filterTableRows, formatDateBR } from "@/utils/ncComponentUtils";

const ITEMS_PER_PAGE = 20;

export default function NaoConformidadesTable({ rncsVisiveis, cncsVisiveis, tabelaResumo, filtroObraId, hasActiveFilter, onObraClick }) {
  const [busca, setBusca] = useState('');
  const [tipo, setTipo] = useState('_all');
  const [page, setPage] = useState(1);

  const allRows = useMemo(() => [
    ...rncsVisiveis.map(mapRncToRow),
    ...cncsVisiveis.map(mapCncToRow),
  ], [rncsVisiveis, cncsVisiveis]);

  const tiposDisponiveis = useMemo(() => {
    const s = new Set(allRows.map(r => r.tipoLabel));
    return [...s].sort();
  }, [allRows]);

  const filteredRows = useMemo(
    () => filterTableRows(allRows, tipo, busca),
    [allRows, tipo, busca]
  );

  const total = filteredRows.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const displayRows = filteredRows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearLocal = () => { setBusca(''); setTipo('_all'); setPage(1); };

  return (
    <>
      {/* Tabela unificada de ocorrências */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[#BFCF99]" />
            Ocorrências Detalhadas
            {total > 0 && <Badge className="bg-[#BFCF99]/40 text-foreground text-xs ml-2">{total}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={busca}
                onChange={e => { setBusca(e.target.value); setPage(1); }}
                placeholder="Buscar por criador, parâmetro, rodovia, usina..."
                className="pl-8 h-9 text-sm"
              />
            </div>
            <Select value={tipo} onValueChange={v => { setTipo(v); setPage(1); }}>
              <SelectTrigger className="h-9 text-sm w-full sm:w-52">
                <SelectValue placeholder="Tipo de registro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos os tipos</SelectItem>
                {tiposDisponiveis.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            {(busca || tipo !== '_all') && (
              <Button size="sm" variant="ghost" onClick={clearLocal} className="h-9 px-3 text-muted-foreground gap-1 whitespace-nowrap">
                <X className="w-3.5 h-3.5" /> Limpar
              </Button>
            )}
          </div>
          {displayRows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Tipo de Registro","Criado por","Data","Parâmetro / NC","Rodovia","Usina","Empreiteira",""].map(h => (
                      <th key={h} className="text-left py-2 px-3 text-foreground font-semibold text-xs uppercase tracking-wide whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                      <td className="py-2 px-3 whitespace-nowrap">
                        <Badge className={row._kind === 'rnc' ? "bg-red-100 text-red-800 font-normal" : "bg-blue-100 text-blue-800 font-normal"}>
                          {row.tipoLabel}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{row.criador || '—'}</td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{formatDateBR(row.data)}</td>
                      <td className="py-2 px-3 text-foreground max-w-[180px] truncate">{row.parametro || '—'}</td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{row.rodovia || '—'}</td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{row.usina || '—'}</td>
                      <td className="py-2 px-3 text-muted-foreground whitespace-nowrap">{row.empreiteira || '—'}</td>
                      <td className="py-2 px-3">
                        {row.page && row.id && (
                          <a href={createPageUrl(row.page) + `?id=${row.id}`} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground gap-1">
                              <Eye className="w-3.5 h-3.5" /><span className="text-xs">Ver</span>
                            </Button>
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {total > ITEMS_PER_PAGE && (
                <div className="flex justify-center items-center gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3 disabled:opacity-50">Anterior</Button>
                  <span className="text-xs text-muted-foreground">Página {page} de {totalPages} ({total} registros)</span>
                  <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-3 disabled:opacity-50">Próxima</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <ClipboardList className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Nenhuma ocorrência para os filtros selecionados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela Resumo por Obra */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#BFCF99]" />
            Tabela Resumo de NCs por Obra
            {hasActiveFilter && <Badge className="bg-[#BFCF99]/40 text-foreground text-xs ml-2">{tabelaResumo.length} obra(s)</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tabelaResumo.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-foreground font-semibold text-xs uppercase tracking-wide">Obra</th>
                    <th className="text-center py-2 px-3 text-foreground font-semibold text-xs uppercase tracking-wide">Total RNC</th>
                    <th className="text-center py-2 px-3 text-red-600 font-semibold text-xs uppercase tracking-wide">Abertas</th>
                    <th className="text-center py-2 px-3 text-amber-600 font-semibold text-xs uppercase tracking-wide">Em Tratativa</th>
                    <th className="text-center py-2 px-3 text-green-600 font-semibold text-xs uppercase tracking-wide">Finalizadas</th>
                    <th className="text-center py-2 px-3 text-gray-500 font-semibold text-xs uppercase tracking-wide">Canceladas</th>
                    <th className="text-center py-2 px-3 text-blue-600 font-semibold text-xs uppercase tracking-wide">NCs Checklist</th>
                  </tr>
                </thead>
                <tbody>
                  {tabelaResumo.map((row, i) => (
                    <tr key={i} className={`border-b border-border/50 transition-colors cursor-pointer ${filtroObraId === row.obra.id ? 'bg-[#BFCF99]/20' : 'hover:bg-muted/50'}`} onClick={() => onObraClick({ obraId: row.obra.id })}>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-foreground">{row.obra.name}</p>
                        <p className="text-xs text-muted-foreground">{row.obra.code}</p>
                      </td>
                      <td className="text-center py-2.5 px-3 font-bold text-foreground">{row.totalRnc}</td>
                      <td className="text-center py-2.5 px-3">{row.abertas > 0 ? <Badge className="bg-red-100 text-red-700">{row.abertas}</Badge> : <span className="text-muted-foreground/40">—</span>}</td>
                      <td className="text-center py-2.5 px-3">{row.emTratativa > 0 ? <Badge className="bg-amber-100 text-amber-700">{row.emTratativa}</Badge> : <span className="text-muted-foreground/40">—</span>}</td>
                      <td className="text-center py-2.5 px-3">{row.finalizadas > 0 ? <Badge className="bg-green-100 text-green-700">{row.finalizadas}</Badge> : <span className="text-muted-foreground/40">—</span>}</td>
                      <td className="text-center py-2.5 px-3">{row.canceladas > 0 ? <Badge className="bg-gray-100 text-gray-600">{row.canceladas}</Badge> : <span className="text-muted-foreground/40">—</span>}</td>
                      <td className="text-center py-2.5 px-3">{row.paramChecklist > 0 ? <Badge className="bg-blue-100 text-blue-700">{row.paramChecklist}</Badge> : <span className="text-muted-foreground/40">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mb-3 opacity-30" />
              <p className="text-sm">{hasActiveFilter ? 'Nenhuma obra corresponde aos filtros selecionados' : 'Nenhuma não conformidade registrada'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}