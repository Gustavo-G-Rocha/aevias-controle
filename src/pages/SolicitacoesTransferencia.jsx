import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react";

import { useSolicitacoesTransferenciaData } from "@/hooks/useSolicitacoesTransferenciaData";
import { useSolicitacoesTransferenciaFilters } from "@/hooks/useSolicitacoesTransferenciaFilters";
import { useSolicitacoesTransferenciaActions } from "@/hooks/useSolicitacoesTransferenciaActions";
import { SolicitacaoCard } from "@/components/solicitacoes-transferencia/SolicitacaoCard";
import { NovaSolicitacaoDialog } from "@/components/solicitacoes-transferencia/NovaSolicitacaoDialog";

export default function SolicitacoesTransferenciaPage() {
  // Data hook
  const { solicitacoes, regionais, user, loading, loadData } = useSolicitacoesTransferenciaData();

  // Filters hook
  const {
    isDialogOpen,
    setIsDialogOpen,
    userAccessLevel,
    canManage,
    isLaboratorista,
    regionalAtual,
    solicitacoesPendentes,
    solicitacoesAprovadas,
    solicitacoesRejeitadas
  } = useSolicitacoesTransferenciaFilters(solicitacoes, user, regionais);

  // Actions hook
  const { handleNovaSolicitacao, handleApprove, handleReject } = 
    useSolicitacoesTransferenciaActions(user, regionais, loadData);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-transparent">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#BFCF99]" />
          <p className="text-muted-foreground mt-2">Carregando solicitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-transparent min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Transferências de Regional
            </h1>
            <p className="text-muted-foreground">
              {canManage 
                ? userAccessLevel === 'admin'
                  ? "Gerencie as solicitações de transferência entre regionais"
                  : "Gerencie as solicitações de transferência para suas regionais"
                : `Solicite transferência de regional ou acompanhe suas solicitações`}
            </p>
            {isLaboratorista && regionalAtual && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Sua Regional Atual:</strong> {regionalAtual.nome}
                </p>
              </div>
            )}
            {isLaboratorista && !regionalAtual && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 inline text-amber-600 mr-2" />
                <span className="text-sm text-amber-800">
                  Você não está alocado em nenhuma regional no momento.
                </span>
              </div>
            )}
          </div>
          {isLaboratorista && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90"
              disabled={!regionalAtual}
              title={!regionalAtual ? "Você precisa estar alocado em uma regional para solicitar transferência" : ""}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Solicitação
            </Button>
          )}
        </div>

        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/20 backdrop-blur-lg border border-white/20">
            <TabsTrigger value="pendentes">
              Pendentes <Badge className="ml-2">{solicitacoesPendentes.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="aprovadas">
              Aprovadas <Badge className="ml-2">{solicitacoesAprovadas.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="rejeitadas">
              Rejeitadas <Badge className="ml-2">{solicitacoesRejeitadas.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="mt-6 space-y-4">
            {solicitacoesPendentes.length > 0 ? (
              solicitacoesPendentes.map(solicitacao => (
                <SolicitacaoCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  canManage={canManage}
                  regionais={regionais}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma solicitação pendente
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {isLaboratorista 
                      ? "Você não possui solicitações pendentes no momento."
                      : "Não há solicitações aguardando aprovação para suas regionais."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="aprovadas" className="mt-6 space-y-4">
            {solicitacoesAprovadas.length > 0 ? (
              solicitacoesAprovadas.map(solicitacao => (
                <SolicitacaoCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  canManage={false}
                  regionais={regionais}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="w-16 h-16 text-[#566E3D]/40 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma solicitação aprovada
                  </h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejeitadas" className="mt-6 space-y-4">
            {solicitacoesRejeitadas.length > 0 ? (
              solicitacoesRejeitadas.map(solicitacao => (
                <SolicitacaoCard
                  key={solicitacao.id}
                  solicitacao={solicitacao}
                  canManage={false}
                  regionais={regionais}
                />
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <XCircle className="w-16 h-16 text-[#800020]/40 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhuma solicitação rejeitada
                  </h3>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <NovaSolicitacaoDialog
          isOpen={isDialogOpen}
          onClose={setIsDialogOpen}
          onSubmit={(formData) => handleNovaSolicitacao(formData, regionalAtual)}
          regionais={regionais}
          regionalAtual={regionalAtual}
        />
      </div>
    </div>
  );
}