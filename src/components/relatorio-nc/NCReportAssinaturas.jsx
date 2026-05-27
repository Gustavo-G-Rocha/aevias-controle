/**
 * Seção de assinaturas do relatório de NC.
 */
import React from 'react';
import { formatDateTimeSpBr } from '@/utils/relatorioNCUtils';

export default function NCReportAssinaturas({ nc }) {
  return (
    <footer className="mt-10 pt-6 grid grid-cols-2 gap-16 items-end">
      {/* Assinatura do Gestor */}
      <div className="flex flex-col items-center">
        <div className="w-full text-center text-xs text-gray-600 mb-2 min-h-[80px] flex flex-col justify-end">
          {nc.manager_signature?.signed_by && (
            <>
              <p className="text-gray-500">Assinado digitalmente por</p>
              <p className="font-bold text-gray-800 mt-0.5">
                {nc.manager_signature.manager_name || nc.relatorio_criador}
              </p>
              <p className="text-gray-500">{nc.manager_signature.signed_by}</p>
              {nc.manager_signature.crea_number && (
                <p className="text-gray-500">
                  CREA: {nc.manager_signature.crea_number}
                </p>
              )}
              <p className="text-gray-500">
                em {formatDateTimeSpBr(nc.manager_signature.signed_date)}
              </p>
            </>
          )}
        </div>
        <div className="w-full border-b border-gray-500"></div>
        <p className="text-xs text-gray-600 mt-1">
          {nc.relatorio_criador || 'Gestor Responsável'}
        </p>
      </div>

      {/* Assinatura do Cliente */}
      <div className="flex flex-col items-center">
        <div className="w-full text-center text-xs text-gray-600 mb-2 min-h-[80px] flex flex-col justify-end">
          {nc.client_signature?.signed_by && (
            <>
              <p className="text-gray-500">Assinado digitalmente por</p>
              <p className="font-bold text-gray-800 mt-0.5">
                {nc.client_signature.engineer_name}
              </p>
              <p className="text-gray-500">{nc.client_signature.signed_by}</p>
              {nc.client_signature.crea_number && (
                <p className="text-gray-500">
                  CREA: {nc.client_signature.crea_number}
                </p>
              )}
              <p className="text-gray-500">
                em {formatDateTimeSpBr(nc.client_signature.signed_date)}
              </p>
            </>
          )}
        </div>
        <div className="w-full border-b border-gray-500"></div>
        <p className="text-xs text-gray-600 mt-1">Engenheiro Cliente</p>
      </div>
    </footer>
  );
}