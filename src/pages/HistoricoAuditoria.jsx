import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChangeEntry from "@/components/auditoria/ChangeEntry";

export default function HistoricoAuditoria() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const entityName = searchParams.get("entity_name");
  const entityId = searchParams.get("entity_id");

  const handleBack = () => navigate(-1);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!entityName || !entityId) {
      setError("Parâmetros insuficientes.");
      setLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        const data = await base44.entities.AuditTrail.filter(
          { entity_name: entityName, entity_id: entityId },
          "-created_date",
          200
        );
        setEntries(data);
      } catch (err) {
        setError("Não foi possível carregar o histórico de alterações.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [entityName, entityId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600">{error}</p>
        <Button variant="outline" onClick={handleBack} className="mt-4">
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-200">
        <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
          <History className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Histórico de Alterações</h1>
          <p className="text-sm text-slate-500 font-mono">
            {entityName} · {entityId?.slice(0, 12)}...
          </p>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Nenhuma alteração registrada para este registro.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          {entries.map((entry) => (
            <ChangeEntry key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}