// Linha de tabela para AdminInterface
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, Trash2, Pencil } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getEnsaioTypeInfo, getReportLink, getDataFormatted } from "@/components/ensaios/ensaioMappers";
import { getLocalInfo, getLaboratoristaInfo, getEmpireiteiraInfo, getNaoConformidades, getStatusInfo } from "@/components/ensaios/utils";
import { CopyIdButton } from "@/components/ensaios/TableFilters";
import { canGestorPreencherResultado } from "@/utils/certificacaoUsinaAccess";

const TableRowAdmin = React.memo(({ ensaio, obra, projeto, index, canApprove, allUsers, obras, user, regionais = [], onApprove, onReject, onDelete }) => {
  const status = getStatusInfo(ensaio);
  const { name, icon: TypeIcon } = getEnsaioTypeInfo(ensaio);
  const reportUrl = getReportLink(ensaio);
  const localInfo = getLocalInfo(ensaio);
  const laboratorista = getLaboratoristaInfo(ensaio, allUsers);
  const dataFormatted = getDataFormatted(ensaio);
  const naoConformidades = getNaoConformidades(ensaio);
  const temAcoesCorretivas = ensaio.acoes_corretivas_realizado === true;
  const temDeflexaoExcessiva = ensaio.tem_deflexao_excessiva === true;
  // Gestor da regional pode reabrir a Certificação de Usina para preencher o Resultado
  const podeEditarCertificacao =
    ensaio.entityType === "CertificacaoUsina" &&
    canGestorPreencherResultado(user, ensaio, obra, regionais);

  return (
    <tr className={`border-b border-border hover:bg-muted/50 ${index % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}`}>
      <td className="px-2 py-2">
        <div className="font-medium text-foreground flex items-center gap-1 text-xs">
          <TypeIcon className="w-3 h-3 text-secondary" />
          <span className="truncate max-w-[120px]" title={name}>{name}</span>
          <CopyIdButton id={ensaio.id} />
          {naoConformidades.length > 0 && <span role="img" aria-label={`Não conformidades: ${naoConformidades.join(', ')}`} className="text-destructive cursor-help" title={`Não conformidades:\n${naoConformidades.join('\n')}`}>⚠️</span>}
          {!naoConformidades.length && temDeflexaoExcessiva && <span role="img" aria-label="Pontos com deflexão acima do limite admissível" className="cursor-help" title="Pontos com deflexão acima do limite admissível">🟡</span>}
          {!naoConformidades.length && !temDeflexaoExcessiva && temAcoesCorretivas && <span role="img" aria-label="Ações corretivas realizadas" className="text-orange-500 cursor-help" title="Ações corretivas realizadas">⚠️</span>}
        </div>
      </td>
      <td className="px-2 py-2 text-muted-foreground text-xs whitespace-nowrap">{dataFormatted}</td>
      <td className="px-2 py-2">
        <div className="font-medium text-foreground text-xs truncate max-w-[140px]" title={obra?.name}>{obra?.name || 'N/A'}</div>
        <div className="text-xs text-muted-foreground">{obra?.code}</div>
      </td>
      <td className="px-2 py-2 text-muted-foreground text-xs truncate max-w-[100px]" title={laboratorista}>{laboratorista}</td>
      <td className="px-2 py-2">
        <div className="text-muted-foreground text-xs">{localInfo.tipo}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[120px]" title={localInfo.detalhes}>{localInfo.detalhes}</div>
      </td>
      <td className="px-2 py-2">{getEmpireiteiraInfo(ensaio) ? <div className="text-muted-foreground text-xs truncate max-w-[100px]">{getEmpireiteiraInfo(ensaio)}</div> : <div className="text-muted-foreground/60 text-center text-xs">-</div>}</td>
      <td className="px-2 py-2">{projeto ? <div className="text-muted-foreground text-xs truncate max-w-[100px]" title={projeto.name}>{projeto.name}</div> : <div className="text-muted-foreground/60 text-center text-xs">-</div>}</td>
      <td className="px-2 py-2 text-center">
        <Badge className={`${status.className} text-xs px-2 py-0.5 gap-1`}><status.icon className="w-3 h-3" />{status.text}</Badge>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <Button asChild variant="outline" size="sm" className="text-foreground hover:bg-muted h-7 px-2">
            <RouterLink to={reportUrl} target="_blank"><FileText className="w-3 h-3" /></RouterLink>
          </Button>
          {canApprove && ensaio.status !== 'rascunho' && (
            <div className="flex gap-1">
              {(ensaio.approved === null || ensaio.approved === false) && (
                <Button size="sm" style={{ backgroundColor: '#566E3D' }} className="text-white hover:opacity-90 h-7 px-2" onClick={() => onApprove(ensaio)} title="Aprovar">
                  <CheckCircle className="w-3 h-3" />
                </Button>
              )}
              {ensaio.approved === null && (
                <Button size="sm" style={{ backgroundColor: '#800020' }} className="text-white hover:opacity-90 h-7 px-2" onClick={() => onReject(ensaio)} title="Reprovar">
                  <XCircle className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
          {canApprove && ensaio.status === 'rascunho' && <span className="text-xs italic text-muted-foreground ml-2">Em execução</span>}
          {podeEditarCertificacao && (
            <Button asChild size="sm" style={{ backgroundColor: '#00233B' }} className="text-white hover:opacity-90 h-7 px-2" title="Editar / Preencher Resultado">
              <RouterLink to={createPageUrl(`CertificacaoUsina?editId=${ensaio.id}`)}><Pencil className="w-3 h-3" /></RouterLink>
            </Button>
          )}
          {canApprove && (
            <Button size="sm" variant="destructive" className="h-7 px-2" onClick={() => onDelete(ensaio)} title="Excluir">
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
});

TableRowAdmin.displayName = 'TableRowAdmin';
export default TableRowAdmin;