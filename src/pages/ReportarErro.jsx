import React, { useState, useEffect, useCallback } from "react";
import { Bug, Send, Loader2, Image as ImageIcon, X, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function ReportarErro() {
  const [user, setUser] = useState(null);
  const [descricao, setDescricao] = useState("");
  const [pagina, setPagina] = useState("");
  const [paginaOutra, setPaginaOutra] = useState("");
  const [prints, setPrints] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user && (getUserAccessLevel(user) === "admin" || user.role === "admin");

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

  const handleSubmit = async (e) => {
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
    setSubmitting(true);
    try {
      await base44.entities.BugReport.create({
        descricao: descricao.trim(),
        pagina: paginaFinal,
        prints,
        status: "aberto",
      });
      toast({ title: "Relato enviado com sucesso!", description: "Obrigado pelo feedback." });
      setDescricao("");
      setPagina("");
      setPaginaOutra("");
      setPrints([]);
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    } catch (error) {
      toast({ title: "Erro ao enviar relato", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await base44.entities.BugReport.update(reportId, { status: newStatus });
      await queryClient.invalidateQueries({ queryKey: ["bugReports"] });
      toast({ title: "Status atualizado" });
    } catch (error) {
      toast({ title: "Erro ao atualizar status", description: error.message, variant: "destructive" });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleString("pt-BR", {
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
                              {report.prints.map((url, i) => (
                                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                  <img
                                    src={url}
                                    alt={`Print ${i + 1}`}
                                    className="w-20 h-20 object-cover rounded border hover:opacity-80 transition-opacity"
                                  />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Admin actions */}
                        {isAdmin && (
                          <div className="shrink-0">
                            <Select
                              value={report.status}
                              onValueChange={(val) => handleStatusChange(report.id, val)}
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