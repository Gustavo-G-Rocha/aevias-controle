// Linha de tabela para AdminInterface
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, XCircle, Trash2, Pencil, MessageSquare } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getEnsaioTypeInfo, getReportLink, getDataFormatted } from "@/components/ensaios/ensaioMappers";
import { getLocalInfo, getLaboratoristaInfo, getEmpreiteiraInfo, getNaoConformidades, getStatusInfo } from "@/components/ensaios/utils";
import { CopyIdButton } from "@/components/ensaios/TableFilters";
import { canUserEditRecord, RESTRICTED_EDIT_ENTITIES } from "@/utils/recordEditPermission";
import { ACTION_COLORS, SIGN_DIALOG, buildSignDescription } from "@/constants/ensaioUi";
import CriticalActionDialog from "@/components/ensaios/CriticalActionDialog";

const TableRowAdmin = React.memo(({ ensaio, obra, projeto, index, canApprove, allUsers, obras: _obras, user, regionais = [], onApprove: _onApprove, onReject, onDelete, onAssinar }) => {
  const status = getStatusInfo(ensaio);
  const { name, icon: TypeIcon } = getEnsaioTypeInfo(ensaio);
  const reportUrl = getReportLink(ensaio);
  const localInfo = getLocalInfo(ensaio);
  const laboratorista = getLaboratoristaInfo(ensaio, allUsers);
  const dataFormatted = getDataFormatted(ensaio);
  const naoConformidades = getNaoConformidades(ensaio);
  const temAcoesCorretivas = ensaio.acoes_corretivas_realizado === true;
  const temDeflexaoExcessiva = ensaio.tem_deflexao_excessiva === true;
  const podeAssinar = ensaio.approved === true && !ensaio.client_signature?.signed_by && onAssinar;
  // Registros restritos (Boletins e Usina): só criador (até ser aprovado) ou
  // admin (apenas com a obra em andamento) podem editar.
  const isRestrito = RESTRICTED_EDIT_ENTITIES.has(ensaio.entityType);
  const statusPermiteEdicao = ensaio.status === 'rascunho' || ensaio.approved === false || ensaio.approved === null;
  const podeEditarRestrito =
    isRestrito &&
    !ensaio.client_signature?.signed_by &&
    (
      (user.role === 'admin' && obra?.status === 'em_andamento') ||
      (ensaio.created_by === user.email && statusPermiteEdicao)
    );
  // Demais registros: admin, autor ou responsável da regional (mesmas regras do servidor)
  // podem abrir o formulário editável de registros em execução/reprovados
  const podeEditarRegistro =
    !isRestrito &&
    (ensaio.status === 'rascunho' || ensaio.approved === false) &&
    !ensaio.client_signature?.signed_by &&
    canUserEditRecord(user, ensaio, obra, regionais);

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
      <td className="px-2 py-2 text-center">
        <Badge className={`${status.className} text-xs px-2 py-0.5 gap-1`}><status.icon className="w-3 h-3" />{status.text}</Badge>
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
      <td className="px-2 py-2">{getEmpreiteiraInfo(ensaio) ? <div className="text-muted-foreground text-xs truncate max-w-[100px]">{getEmpreiteiraInfo(ensaio)}</div> : <div className="text-muted-foreground/60 text-center text-xs">-</div>}</td>
      <td className="px-2 py-2">{projeto ? <div className="text-muted-foreground text-xs truncate max-w-[100px]" title={projeto.name}>{projeto.name}</div> : <div className="text-muted-foreground/60 text-center text-xs">-</div>}</td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-1">
          <Button asChild variant="outline" size="sm" className="text-foreground hover:bg-muted h-7 px-2" title={`Ver relatório de ${name}`} aria-label={`Ver relatório de ${name}`}>
            <RouterLink to={reportUrl}><FileText className="w-3 h-3" /></RouterLink>
          </Button>
          {canApprove && ensaio.status !== 'rascunho' && (
            <div className="flex gap-1">
              {(ensaio.approved === null || ensaio.approved === false) && (
                <Button asChild size="sm" style={{ backgroundColor: ACTION_COLORS.APPROVE }} className="text-white hover:opacity-90 h-7 px-2" title="Aprovar (abre relatório para assinatura)">
                  <RouterLink to={reportUrl}><CheckCircle className="w-3 h-3" /></RouterLink>
                </Button>
              )}
              {ensaio.approved === null && (
                <Button size="sm" style={{ backgroundColor: ACTION_COLORS.REJECT }} className="text-white hover:opacity-90 h-7 px-2" onClick={() => onReject(ensaio)} title="Reprovar">
                  <XCircle className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
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
          {podeEditarRegistro && (
            <Button asChild size="sm" style={{ backgroundColor: ACTION_COLORS.EDIT }} className="text-white hover:opacity-90 h-7 px-2" title="Editar registro">
              <RouterLink to={createPageUrl(`${ensaio.entityType}?editId=${ensaio.id}`)}><Pencil className="w-3 h-3" /></RouterLink>
            </Button>
          )}
          {canApprove && ensaio.status === 'rascunho' && <span className="text-xs italic text-muted-foreground ml-2">Em execução</span>}
          {podeEditarRestrito && (
            <Button asChild size="sm" style={{ backgroundColor: ACTION_COLORS.EDIT }} className="text-white hover:opacity-90 h-7 px-2" title="Editar registro">
              <RouterLink to={createPageUrl(`${ensaio.entityType}?editId=${ensaio.id}`)}><Pencil className="w-3 h-3" /></RouterLink>
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