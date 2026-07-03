import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users } from "lucide-react";
import { obterUsuarioAtual } from "@/services/usuariosService";
import { loadAuxData, loadRecordsByEntities } from "@/services/recordsService";

const MONITOR_ENTITIES = [
  'DiarioObra', 'EnsaioCAUQ', 'EnsaioDensidade', 'EnsaioDensidadeInSitu',
  'EnsaioTaxaPinturaImprimacao', 'ChecklistUsina', 'ChecklistAplicacao', 'ChecklistMRAF',
  'ChecklistConcretagem', 'ChecklistTerraplanagem', 'EnsaioSondagem',
];

export default function MonitorProdutividade() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [gestoresData, setGestoresData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
    try {
      const user = await obterUsuarioAtual();
      setCurrentUser(user);

      // Verificar se é admin
      if (user.role !== 'admin' && user.access_level !== 'admin') {
        alert('Acesso negado. Esta página é exclusiva para administradores.');
        return;
      }

      // Carregar dados auxiliares e registros em paralelo via service layer
      const [{ obras: obrasData, regionais: regionaisData, users: todosUsuarios }, todosRegistros] = await Promise.all([
        loadAuxData({ needsRegionais: true, needsUsers: true }),
        loadRecordsByEntities(MONITOR_ENTITIES, 500),
      ]);

      // Identificar gestores de contrato
      const gestores = todosUsuarios.filter(u => 
        u.access_level === 'gestor_contrato' || 
        regionaisData.some(r => 
          r.gestor_contrato_responsavel?.toLowerCase() === u.email?.toLowerCase() ||
          (r.gestores_contrato_responsaveis || []).some(email => email.toLowerCase() === u.email?.toLowerCase())
        )
      );

      // Calcular métricas para cada gestor
      const gestoresComMetricas = gestores.map(gestor => {
        // Encontrar regionais do gestor
        const regionaisDoGestor = regionaisData.filter(r => 
          r.gestor_contrato_responsavel?.toLowerCase() === gestor.email?.toLowerCase() ||
          (r.gestores_contrato_responsaveis || []).some(email => email.toLowerCase() === gestor.email?.toLowerCase())
        );

        const regionaisIds = regionaisDoGestor.map(r => r.id);
        const obrasDoGestor = obrasData.filter(o => regionaisIds.includes(o.regional_id));
        const obrasIds = obrasDoGestor.map(o => o.id);

        // Contar registros criados nas obras do gestor
        const registrosCriados = todosRegistros.filter(r => obrasIds.includes(r.obra_id));

        // Contar registros aprovados pelo gestor (somente das obras dele)
        const registrosAprovados = registrosCriados.filter(r => 
          r.approved === true && 
          r.approved_by?.toLowerCase() === gestor.email?.toLowerCase()
        );

        // Calcular taxa de aprovação
        const taxaAprovacao = registrosCriados.length > 0 
          ? ((registrosAprovados.length / registrosCriados.length) * 100).toFixed(1)
          : 0;

        return {
          gestor,
          regionais: regionaisDoGestor,
          totalObras: obrasDoGestor.length,
          registrosCriados: registrosCriados.length,
          registrosAprovados: registrosAprovados.length,
          registrosPendentes: registrosCriados.filter(r => r.approved === null && r.status === 'finalizado').length,
          registrosReprovados: registrosCriados.filter(r => r.approved === false).length,
          taxaAprovacao
        };
      });

      // Ordenar por número de registros criados (maior para menor)
      gestoresComMetricas.sort((a, b) => b.registrosCriados - a.registrosCriados);

      setGestoresData(gestoresComMetricas);
    } catch (error) {
      console.error("[MonitorProdutividade] Erro ao carregar dados:", error?.message || error);
      alert('Erro ao carregar dados do monitor.');
    } finally {
      setLoading(false);
    }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-6 min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: 'var(--color-text-subtle)' }} />
            <p className="mt-2" style={{ color: 'var(--color-text-muted)' }}>Carregando dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.access_level !== 'admin')) {
    return (
      <div className="p-6 min-h-screen bg-transparent">
        <div className="max-w-7xl mx-auto">
          <Card style={{ backgroundColor: 'var(--color-danger-bg)', borderColor: 'var(--color-danger)' }}>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-danger)' }}>Acesso Negado</h2>
              <p className="mt-2" style={{ color: 'var(--color-danger)' }}>Esta página é exclusiva para administradores.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text)' }}>Monitor de Produtividade</h1>
          <p className="mt-1" style={{ color: 'var(--color-text-muted)' }}>Acompanhamento da produtividade dos Gestores de Contrato</p>
        </div>

        {/* Lista de gestores */}
        <div className="space-y-4">
          {gestoresData.map((gestorData) => (
            <Card key={gestorData.gestor.id} className="backdrop-blur-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg" style={{ color: 'var(--color-text)' }}>
                      {gestorData.gestor.laboratorista_name || gestorData.gestor.full_name}
                    </CardTitle>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{gestorData.gestor.email}</p>
                    <div className="flex gap-2 mt-2">
                      {gestorData.regionais.map(r => (
                        <Badge key={r.id} variant="outline" className="text-xs">
                          {r.nome}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge
                    className="border"
                    style={
                      parseFloat(gestorData.taxaAprovacao) >= 80
                        ? { backgroundColor: 'var(--color-success-bg)', color: 'var(--color-success)', borderColor: 'var(--color-success)' }
                        : parseFloat(gestorData.taxaAprovacao) >= 50
                        ? { backgroundColor: 'var(--color-warning-bg)', color: 'var(--color-warning)', borderColor: 'var(--color-warning)' }
                        : { backgroundColor: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }
                    }
                  >
                    {gestorData.taxaAprovacao}% aprovação
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Obras</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{gestorData.totalObras}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-muted)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Registros Criados</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{gestorData.registrosCriados}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--color-success)' }}>Aprovados</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-success)' }}>{gestorData.registrosAprovados}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-warning-bg)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--color-warning)' }}>Pendentes</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-warning)' }}>{gestorData.registrosPendentes}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg" style={{ backgroundColor: 'var(--color-danger-bg)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--color-danger)' }}>Reprovados</div>
                    <div className="text-xl font-bold" style={{ color: 'var(--color-danger)' }}>{gestorData.registrosReprovados}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {gestoresData.length === 0 && (
          <Card className="backdrop-blur-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-subtle)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Nenhum gestor encontrado
              </h3>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Não há gestores de contrato cadastrados no sistema.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}