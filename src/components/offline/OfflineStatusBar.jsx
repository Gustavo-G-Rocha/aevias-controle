/**
 * OfflineStatusBar.jsx
 * Barra discreta de status offline/sincronização com notificação de conflitos.
 * Inclui toggle de simulação de modo offline (sempre visível) para testes
 * e uso manual em campo.
 */

import React, { useState } from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { AlertCircle, WifiOff, Loader, AlertTriangle } from 'lucide-react';
import { ConflictResolutionDialog } from '@/components/offline/ConflictResolutionDialog';
import { setOfflineSimulation } from '@/utils/offlineSimulation';

export default function OfflineStatusBar() {
  const { isOnline, isSyncing, pendingCount, failedCount, conflictCount, conflicts, resolveConflict, retryFailed, failedError } = useOfflineSync();
  const [selectedConflict, setSelectedConflict] = useState(null);

  // Deriva o estado de simulação: offline simulado = isOnline false mas rede real ativa
  const realOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const simulatedOffline = !isOnline && realOnline;

  const handleToggleSimulation = () => {
    setOfflineSimulation(!simulatedOffline);
  };

  return (
    <div className="fixed top-4 right-4 z-40 max-w-xs">
      {/* Toggle de modo offline — sempre visível */}
      <button
        onClick={handleToggleSimulation}
        data-testid="offline-mode-toggle"
        aria-label={simulatedOffline ? 'Desativar modo offline' : 'Ativar modo offline'}
        className={`mb-2 w-full flex items-center gap-2 rounded-lg p-2 shadow-sm transition-colors text-sm font-medium ${
          simulatedOffline
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-white/90 border border-slate-200 text-slate-600 hover:bg-slate-50'
        }`}
      >
        <WifiOff className="w-4 h-4 flex-shrink-0" />
        <span>{simulatedOffline ? 'Modo Offline Ativo' : 'Modo Offline'}</span>
      </button>

      {/* Status Offline */}
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2 shadow-sm flex items-start gap-2">
          <WifiOff className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-yellow-800 font-medium">Offline</p>
            <p className="text-yellow-700 text-xs">
              {pendingCount > 0 ? `${pendingCount} registro(s) aguardando sincronização` : 'Sem conexão'}
            </p>
          </div>
        </div>
      )}

      {/* Sincronizando */}
      {isSyncing && isOnline && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2 shadow-sm flex items-start gap-2">
          <Loader className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
          <div className="text-sm">
            <p className="text-secondary font-medium">Sincronizando</p>
            <p className="text-blue-700 text-xs">Enviando registros...</p>
          </div>
        </div>
      )}

      {/* Conflito de Sincronização */}
      {conflictCount > 0 && (
        <button
          onClick={() => setSelectedConflict(conflicts[0])}
          className="w-full text-left bg-amber-50 border border-amber-300 rounded-lg p-3 mb-2 shadow-sm flex items-start gap-2 cursor-pointer hover:bg-amber-100 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-amber-800 font-medium">Conflito de sincronização</p>
            <p className="text-amber-700 text-xs">
              {conflictCount} registro(s) com conflito. Toque para resolver.
            </p>
          </div>
        </button>
      )}

      {/* Erro de Sincronização */}
      {failedCount > 0 && !isSyncing && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div className="text-sm min-w-0">
              <p className="text-destructive font-medium">Erro na sincronização</p>
              <p className="text-destructive text-xs">
                {failedCount} registro(s) não puderam ser enviados.
              </p>
              {failedError && (
                <p className="text-red-600 text-xs mt-1 break-words">{failedError}</p>
              )}
            </div>
          </div>
          {isOnline && (
            <button
              onClick={retryFailed}
              className="mt-2 w-full text-center text-xs font-medium bg-red-600 text-white rounded-md py-1.5 hover:bg-red-700 transition-colors"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {selectedConflict && (
        <ConflictResolutionDialog
          conflict={selectedConflict}
          isOpen={!!selectedConflict}
          onClose={() => setSelectedConflict(null)}
          onResolve={async (conflict, resolution) => {
            const result = await resolveConflict(conflict, resolution);
            if (result.success) {
              setSelectedConflict(null);
            }
          }}
        />
      )}
    </div>
  );
}