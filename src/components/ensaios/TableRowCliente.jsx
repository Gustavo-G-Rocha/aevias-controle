// Linha de tabela para ClienteInterface
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MessageSquare } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { getEnsaioTypeInfo, getReportLink, getDataFormatted } from "@/components/ensaios/ensaioMappers";
import { getLocalInfo, getLaboratoristaInfo, getEmpreiteiraInfo, getNaoConformidades, getStatusInfo } from "@/components/ensaios/utils";
import { CopyIdButton } from "@/components/ensaios/TableFilters";
import { ACTION_COLORS, SIGN_DIALOG, buildSignDescription } from "@/constants/ensaioUi";
import CriticalActionDialog from "@/components/ensaios/CriticalActionDialog";

const TableRowCliente = React.memo(({ ensaio, obra, projeto, index, allUsers, onAssinar }) => {
  const status = getStatusInfo(ensaio);
  const { name, icon: TypeIcon } = getEnsaioTypeInfo(ensaio);
  const reportUrl = getReportLink(ensaio);
  const localInfo = getLocalInfo(ensaio);
  const laboratorista = getLaboratoristaInfo(ensaio, allUsers);
  const dataFormatted = getDataFormatted(ensaio);
  const podeAssinar = ensaio.approved === true && !ensaio.client_signature?.signed_by;
  const naoConformidades = getNaoConformidades(ensaio);
  const temAcoesCorretivas = ensaio.acoes_corretivas_realizado === true;

  return (
    <tr className={`border-b border-white/10 hover:bg-black/5 ${index % 2 === 0 ? 'bg-transparent' : 'bg-black/[0.02]'}`}>
      <td className="px-2 py-2">
        <div className="font-medium text-foreground flex items-center gap-1 text-xs">
          <TypeIcon className="w-3 h-3 text-secondary" />
          <span className="truncate max-w-[120px]" title={name}>{name}</span>
          <CopyIdButton id={ensaio.id} />
          {naoConformidades.length > 0 && <span role="img" aria-label={`Não conformidades: ${naoConformidades.join(', ')}`} className="text-destructive cursor-help" title={`Não conformidades:\n${naoConformidades.join('\n')}`}>⚠️</span>}
          {!naoConformidades.length && temAcoesCorretivas && <span role="img" aria-label="Ações corretivas realizadas" className="text-orange-500 cursor-help" title="Ações corretivas realizadas">⚠️</span>}
        </div>
      </td>
      <td className="px-2 py-2 text-center">
        <Badge className={`${status.className} gap-1 text-[10px] px-2 py-0.5`}><status.icon className="w-3 h-3" />{status.text}</Badge>
      </td>
      <td className="px-2 py-2 text-foreground/90 text-xs whitespace-nowrap">{dataFormatted}</td>
      <td className="px-2 py-2">
        <div className="font-medium text-foreground text-xs truncate max-w-[140px]" title={obra?.name}>{obra?.name || 'N/A'}</div>
        <div className="text-[10px] text-foreground/70">{obra?.code}</div>
      </td>
      <td className="px-2 py-2 text-foreground/90 text-xs truncate max-w-[100px]" title={laboratorista}>{laboratorista}</td>
      <td className="px-2 py-2">
        <div className="text-foreground/90 text-xs">{localInfo.tipo}</div>
        <div className="text-[10px] text-foreground/70 truncate max-w-[120px]" title={localInfo.detalhes}>{localInfo.detalhes}</div>
      </td>
      <td className="px-2 py-2">{getEmpreiteiraInfo(ensaio) ? <div className="text-foreground/90 text-xs truncate max-w-[100px]">{getEmpreiteiraInfo(ensaio)}</div> : <div className="text-foreground/50 text-center text-xs">-</div>}</td>
      <td className="px-2 py-2">{projeto ? <div className="text-foreground/90 text-xs truncate max-w-[100px]" title={projeto.name}>{projeto.name}</div> : <div className="text-foreground/50 text-center text-xs">-</div>}</td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <Button asChild variant="outline" size="sm" className="text-foreground hover:bg-muted/10 border-white/20 h-7 px-2">
            <RouterLink to={reportUrl} target="_blank"><FileText className="w-3 h-3" /></RouterLink>
          </Button>
          {podeAssinar && (
            <CriticalActionDialog
              title={SIGN_DIALOG.title}
              description={buildSignDescription(ensaio)}
              confirmLabel={SIGN_DIALOG.confirmLabel}
              onConfirm={() => onAssinar(ensaio)}
            >
              <Button size="sm" style={{ backgroundColor: ACTION_COLORS.APPROVE }} className="text-white hover:opacity-90 h-7 px-2" title="Assinar" aria-label="Assinar registro">
                <MessageSquare className="w-3 h-3" />
              </Button>
            </CriticalActionDialog>
          )}
        </div>
      </td>
    </tr>
  );
});

TableRowCliente.displayName = 'TableRowCliente';
export default TableRowCliente;