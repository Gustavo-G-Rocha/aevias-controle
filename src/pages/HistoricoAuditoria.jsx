import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChangeEntry from "@/components/auditoria/ChangeEntry";

export default function HistoricoAuditoria() {
  const [searchParams] = useSearchParams();
  const entityName = searchParams.get("entity_name");
  const entityId = searchParams.get("entity_id");

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
        <Button variant="outline" asChild className="mt-4">
          <Link to="/">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link to="/meus-ensaios">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <History className="w-6 h-6 text-slate-400" />
        <div>
          <h1 className="text-xl font-bold text-slate-800">Histórico de Alterações</h1>
          <p className="text-sm text-slate-500">
            {entityName} · ID: {entityId?.slice(0, 12)}...
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