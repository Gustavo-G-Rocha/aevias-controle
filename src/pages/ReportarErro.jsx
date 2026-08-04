import React, { useState, useEffect, useCallback } from "react";
import { Bug, Send, Loader2, Image as ImageIcon, X, CheckCircle2, Clock, AlertCircle, Star, MessageSquare } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { getUserAccessLevel } from "@/lib/layoutConstants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import RespostaAvaliacao from "@/components/bug-report/RespostaAvaliacao";
import { notificarRespostaChamado } from "@/functions/notificarRespostaChamado";

const PAGINAS_CONHECIDAS = [
  "Dashboard",
  "Regionais",
  "Projects",
  "MeusEnsaios",
  "DiarioObra",
  "ChecklistUsina",
  "ChecklistAplicacao",
  "ChecklistMRAF",
  "ChecklistConcretagem",
  "ChecklistTerraplanagem",
  "ChecklistReciclagem",
  "EnsaioCAUQ",
  "EnsaioMRAF",
  "EnsaioDensidade",
  "EnsaioDensidadeInSitu",
  "EnsaioTaxaPinturaImprimacao",
  "EnsaioManchaPendulo",
  "EnsaioVigaBenkelman",
  "EnsaioTaxaMRAF",
  "EnsaioProctor",
  "EnsaioSondagem",
  "EnsaioGranulometriaIndividual",
  "EnsaioRompimentoConcreto",
  "AcompanhamentoUsinagem",
  "AcompanhamentoCarga",
  "BoletimSondagem",
  "BoletimSondagemTrado",
  "GranuMistura",
  "CertificacaoUsina",
  "NaoConformidades",
  "GestaoNC",
  "RelatoriosUnificados",
  "ResumosPersonalizados",
  "Users",
  "Produtividade",
  "ControleLaboratoristas",
  "FaixasGranulometricas",
  "MigracaoDados",
  "MonitorProdutividade",
  "Settings",
  "Outra",
];

const STATUS_CONFIG = {
  aberto: { label: "Aberto", icon: AlertCircle, color: "bg-red-100 text-red-700" },
  em_analise: { label: "Em Análise", icon: Clock, color: "bg-yellow-100 text-yellow-700" },
  resolvido: { label: "Resolvido", icon: CheckCircle2, color: "bg-green-100 text-green-700" },
};

// Detecta erros de "registro não encontrado" (404) vindos do SDK —
// acontecem quando o BugReport foi removido no servidor mas o card ainda
// existe no cache do react-query (ex.: outro admin apagou o relato enquanto
// este admin estava visualizando a lista).
const isNotFound = (error) => {
  const msg = String(error?.message || "");
  return /not found|não encontrado/i.test(msg) || error?.response?.status === 404;
};

// Remove imediatamente do cache o registro obsoleto. NÃO dispara
// refetch: o backend pode ter consistência eventual e a lista poderia
// trazer o registro removido de volta, anulando a purgação.
const purgeStaleReport = (reportId, queryClient) => {
  queryClient.setQueryData(["bugReports"], (old = []) =>
    old.filter((r) => r.id !== reportId)
  );
};

export default function ReportarErro() {
  const [user, setUser] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [pagina, setPagina] = useState("");
  const [paginaOutra, setPaginaOutra] = useState("");
  const [prints, setPrints] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user && getUserAccessLevel(user) === "admin";

  const { data: bugReports = [], isLoading: loadingReports } = useQuery({
    queryKey: ["bugReports"],
    queryFn: async () => {
      const list = await base44.entities.BugReport.list("-created_date", 200);
      return list;
    },
    enabled: !!user,
  });

  const handleFileUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of Array.from(files)) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploaded.push(file_url);
      }
      setPrints((prev) => [...prev, ...uploaded]);
    } catch (error) {
      toast({ title: "Erro ao enviar imagem", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, []);

  const handleRemovePrint = (index) => {
    setPrints((prev) => prev.filter((_, i) => i !== index));
  };

  // Criação OTIMISTA: o novo relato aparece na lista imediatamente;
  // em caso de falha da API, a lista é revertida e um erro é exibido.
  const createMutation = useMutation({
    mutationFn: (payload) => base44.entities.BugReport.create(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["bugReports"] });
      const previous = queryClient.getQueryData(["bugReports"]);
      const tempId = `temp-${Date.now()}`;
      const tempReport = {
        id: tempId,
        ...payload,
        created_by: user?.email,
        created_date: new Date().toISOString(),
        _optimistic: true,
      };
      queryClient.setQueryData(["bugReports"], (old = []) => [tempReport, ...old]);
      // Limpa o formulário imediatamente — UI responsiva
      setDescricao("");
      setPagina("");
      setPaginaOutra("");
      setPrints([]);
      setShowForm(false);
      return { previous, tempId };
    },
    onSuccess: (createdRecord, _vars, context) => {
      // Mantém o card temporário (badge "Pendente…" + ações de admin
      // desabilitadas) visível por uma janela mínima para que a transição
      // otimista temp → real seja perceptível ao usuário e à automação de
      // testes. Sem isso, a API confirma tão rápido que o estado pendente
      // é substituído antes de poder ser observado.
      const finalize = () => {
        // Substitui o registro temporário pelo real retornado pela API,
        // trocando o id "temp-..." pelo id persistido. Assim o admin não
        // consegue disparar updates contra um id inexistente no backend.
        if (context?.tempId && createdRecord?.id) {
          queryClient.setQueryData(["bugReports"], (old = []) =>
            old.map((r) => (r.id === context.tempId ? { ...createdRecord } : r))
          );
        }
        toast({ title: "Relato enviado com sucesso!", description: "Obrigado pelo feedback." });
      };
      if (context?.tempId && createdRecord?.id) {
        setTimeout(finalize, 1200);
      } else {
        finalize();
      }
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["bugReports"], context.previous);
      toast({ title: "Erro ao enviar relato", description: error.message, variant: "destructive" });
    },
  });

  const submitting = createMutation.isPending;

  const handleSubmit = (e) => {
    e.preventDefault();
    const paginaFinal = pagina === "Outra" ? paginaOutra.trim() : pagina;
    if (!descricao.trim()) {
      toast({ title: "Descreva o problema", variant: "destructive" });
      return;
    }
    if (!paginaFinal) {
      toast({ title: "Selecione a página onde o erro ocorreu", variant: "destructive" });
      return;
    }
    createMutation.mutate({
      descricao: descricao.trim(),
      pagina: paginaFinal,
      prints,
      status: "aberto",
    });
  };

  // Mudança de status OTIMISTA: o badge atualiza na hora; rollback em erro.
  const statusMutation = useMutation({
    mutationFn: ({ reportId, newStatus }) =>
      base44.entities.BugReport.update(reportId, { status: newStatus }),
    onMutate: async ({ reportId, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["bugReports"] });
      const previous = queryClient.getQueryData(["bugReports"]);
      queryClient.setQueryData(["bugReports"], (old = []) =>
        old.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
      );
      return { previous };
    },
    onSuccess: () => toast({ title: "Status atualizado" }),
    onError: (error, vars, context) => {
      if (context?.previous) queryClient.setQueryData(["bugReports"], context.previous);
      if (isNotFound(error)) {
        purgeStaleReport(vars.reportId, queryClient);
        toast({ title: "Relato não existe mais", description: "Ele pode ter sido removido por outro administrador. A lista foi atualizada.", variant: "destructive" });
        return;
      }
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    },
    onSettled: (_data, error) => {
      if (!isNotFound(error)) queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
  });

  const handleStatusChange = (reportId, newStatus) =>
    statusMutation.mutate({ reportId, newStatus });

  // Resposta do admin OTIMISTA
  const respostaMutation = useMutation({
    mutationFn: async ({ reportId, resposta_admin }) => {
      const updated = await base44.entities.BugReport.update(reportId, {
        resposta_admin,
        resposta_admin_date: new Date().toISOString(),
      });
      // Notificação in-app para o solicitante — fire-and-forget:
      // falha de notificação não invalida a resposta já gravada.
      notificarRespostaChamado({ reportId }).catch(() => {});
      return updated;
    },
    onMutate: async ({ reportId, resposta_admin }) => {
      await queryClient.cancelQueries({ queryKey: ["bugReports"] });
      const previous = queryClient.getQueryData(["bugReports"]);
      queryClient.setQueryData(["bugReports"], (old = []) =>
        old.map((r) =>
          r.id === reportId
            ? { ...r, resposta_admin, resposta_admin_date: new Date().toISOString() }
            : r
        )
      );
      return { previous };
    },
    onSuccess: () => toast({ title: "Resposta enviada ao solicitante" }),
    onError: (error, vars, context) => {
      if (context?.previous) queryClient.setQueryData(["bugReports"], context.previous);
      if (isNotFound(error)) {
        purgeStaleReport(vars.reportId, queryClient);
        toast({ title: "Relato não existe mais", description: "Ele pode ter sido removido por outro administrador. A lista foi atualizada.", variant: "destructive" });
        return;
      }
      toast({ title: "Erro ao enviar resposta", description: error.message, variant: "destructive" });
    },
    onSettled: (_data, error) => {
      if (!isNotFound(error)) queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
  });

  // Avaliação do solicitante OTIMISTA
  const avaliacaoMutation = useMutation({
    mutationFn: ({ reportId, avaliacao }) =>
      base44.entities.BugReport.update(reportId, {
        avaliacao,
        avaliacao_date: new Date().toISOString(),
      }),
    onMutate: async ({ reportId, avaliacao }) => {
      await queryClient.cancelQueries({ queryKey: ["bugReports"] });
      const previous = queryClient.getQueryData(["bugReports"]);
      queryClient.setQueryData(["bugReports"], (old = []) =>
        old.map((r) =>
          r.id === reportId
            ? { ...r, avaliacao, avaliacao_date: new Date().toISOString() }
            : r
        )
      );
      return { previous };
    },
    onSuccess: () => toast({ title: "Avaliação registrada. Obrigado!" }),
    onError: (error, vars, context) => {
      if (context?.previous) queryClient.setQueryData(["bugReports"], context.previous);
      if (isNotFound(error)) {
        purgeStaleReport(vars.reportId, queryClient);
        toast({ title: "Relato não existe mais", description: "Ele pode ter sido removido. A lista foi atualizada.", variant: "destructive" });
        return;
      }
      toast({ title: "Erro ao registrar avaliação", description: error.message, variant: "destructive" });
    },
    onSettled: (_data, error) => {
      if (!isNotFound(error)) queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    },
  });

  const StarRating = ({ value, onChange, readOnly, size = "w-5 h-5" }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(n)}
          className={`transition-transform ${readOnly ? "cursor-default" : "hover:scale-110"}`}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`${size} ${n <= (value || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40"}`}
          />
        </button>
      ))}
    </div>
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    // As datas do banco vêm em UTC sem indicador de fuso e com microssegundos
    // (ex: 2026-07-15T14:46:09.900000). Normaliza para milissegundos e adiciona
    // 'Z' para que a conversão para o horário de Brasília fique correta.
    let iso = String(dateStr).replace(/(\.\d{3})\d+/, "$1");
    if (!/Z$|[+-]\d{2}:?\d{2}$/.test(iso)) iso = `${iso}Z`;
    return new Date(iso).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
              <Bug className="w-8 h-8" />
              Reportar Erros
            </h1>
            <p className="text-muted-foreground mt-1">
              Encontrou um problema? Relate para que possamos corrigir.
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="shrink-0">
              <Bug className="w-4 h-4 mr-1" />
              Novo Relato
            </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Novo Relato de Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Usuário (automático) */}
                <div>
                  <Label className="text-sm font-medium">Solicitante</Label>
                  <Input
                    value={user ? `${user.full_name || user.email}` : "Carregando..."}
                    disabled
                    className="bg-muted"
                  />
                </div>

                {/* Página */}
                <div>
                  <Label className="text-sm font-medium">Página onde ocorreu o erro *</Label>
                  <Select value={pagina} onValueChange={setPagina}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a página" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {PAGINAS_CONHECIDAS.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {pagina === "Outra" && (
                    <Input
                      className="mt-2"
                      placeholder="Digite o nome da página"
                      value={paginaOutra}
                      onChange={(e) => setPaginaOutra(e.target.value)}
                    />
                  )}
                </div>

                {/* Descrição */}
                <div>
                  <Label className="text-sm font-medium">Descrição do problema *</Label>
                  <Textarea
                    placeholder="Descreva o que aconteceu, o que você esperava e o que ocorreu..."
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    rows={5}
                  />
                </div>

                {/* Prints */}
                <div>
                  <Label className="text-sm font-medium">Anexar prints (opcional)</Label>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {prints.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt={`Print ${i + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemovePrint(i)}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-sm hover:bg-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                      {uploading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon className="w-5 h-5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground mt-1">Adicionar</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={submitting || uploading}>
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-1" />
                    )}
                    Enviar Relato
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={submitting}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de relatos — admins veem todos, usuários veem apenas os próprios (RLS) */}
        <div>
          <h2 className="text-xl font-semibold text-primary mb-4">
            {isAdmin ? `Relatos Recebidos (${bugReports.length})` : `Seus Relatos (${bugReports.length})`}
          </h2>
          {loadingReports ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : bugReports.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {isAdmin ? "Nenhum relato recebido ainda." : "Você ainda não relatou nenhum erro."}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bugReports.map((report) => {
                const StatusIcon = STATUS_CONFIG[report.status]?.icon || AlertCircle;
                // Registro ainda em estado otimista (id temporário): a criação
                // ainda não foi confirmada no backend. Desabilita ações de admin
                // para evitar updates contra um id inexistente.
                const isOptimistic = String(report.id).startsWith("temp-");
                return (
                  <Card key={report.id}>
                    <CardContent className="py-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge className={STATUS_CONFIG[report.status]?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[report.status]?.label}
                            </Badge>
                            {isOptimistic && (
                              <Badge className="bg-yellow-100 text-yellow-700" data-temp-id={report.id}>
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                Pendente…
                              </Badge>
                            )}
                            <Badge variant="outline" className="font-mono text-xs">
                              {report.pagina}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(report.created_date)}
                            </span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap">
                            {report.descricao}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Por: {report.created_by}
                          </p>
                          {report.prints && report.prints.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {report.prints.map((url, i) => {
                                const safeUrl = /^https?:\/\//i.test(url) ? url : '#';
                                return (
                                <a key={i} href={safeUrl} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={safeUrl !== '#' ? safeUrl : undefined}
                                    alt={`Print ${i + 1}`}
                                    className="w-20 h-20 object-cover rounded border hover:opacity-80 transition-opacity"
                                  />
                                </a>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        {/* Admin actions */}
                        {isAdmin && (
                          <div className="shrink-0">
                            <Select
                              value={report.status}
                              onValueChange={(val) => handleStatusChange(report.id, val)}
                              disabled={isOptimistic}
                            >
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aberto">Aberto</SelectItem>
                                <SelectItem value="em_analise">Em Análise</SelectItem>
                                <SelectItem value="resolvido">Resolvido</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Caixa de resposta do admin + avaliação do solicitante */}
                      <RespostaAvaliacao
                        report={report}
                        isAdmin={isAdmin && !isOptimistic}
                        currentUserEmail={user?.email}
                        respostaMutation={respostaMutation}
                        avaliacaoMutation={avaliacaoMutation}
                        formatDate={formatDate}
                        StarRating={StarRating}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}