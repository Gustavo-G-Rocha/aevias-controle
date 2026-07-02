/**
 * OfflineStatusBar.jsx
 * Barra discreta de status offline/sincronização
 */

import React from 'react';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { AlertCircle, Wifi, WifiOff, Loader } from 'lucide-react';

export default function OfflineStatusBar() {
  const { isOnline, isSyncing, pendingCount, failedCount, lastError } = useOfflineSync();

  // Não exibir se tudo está OK
  if (isOnline && pendingCount === 0 && failedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs">
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

      {/* Erro de Sincronização */}
      {failedCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-destructive font-medium">Erro na sincronização</p>
            <p className="text-destructive text-xs">
              {failedCount} registro(s) falharam. Tente novamente mais tarde.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}