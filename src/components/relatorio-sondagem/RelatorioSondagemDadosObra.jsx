import React from "react";
import { formatDate } from "@/utils/relatorioSondagemUtils";

export default function RelatorioSondagemDadosObra({ ensaio, obra, regional, project }) {
  return (
    <>
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-2 py-0.5 font-bold text-center mb-0">
        DADOS DA OBRA
      </div>

      <div className="grid grid-cols-5 gap-x-2 gap-y-0 mb-0 text-[10px]">
        <div className="col-span-1">
          <p className="font-bold text-gray-700">CLIENTE:</p>
          <p className="text-gray-900">{regional?.cliente || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">PROJETO:</p>
          <p className="text-gray-900">{project?.name || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">VOLUME VAZIOS PROJETO:</p>
          <p className="text-gray-900">{ensaio.volume_vazios_projeto ? `${ensaio.volume_vazios_projeto}%` : 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">FATOR CORREÇÃO PRENSA:</p>
          <p className="text-gray-900">{ensaio.fator_correcao_prensa || '1.0000'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">DENS. ÁGUA 25°C:</p>
          <p className="text-gray-900">{ensaio.dens_agua_25c || '0.9971'} g/cm³</p>
        </div>

        <div className="col-span-1">
          <p className="font-bold text-gray-700">OBRA:</p>
          <p className="text-gray-900">{obra?.name || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">FAIXA ESPECIFICADA:</p>
          <p className="text-gray-900">{project?.faixa_especificada || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">DENS. APARENTE PROJETO:</p>
          <p className="text-gray-900">{ensaio.dens_aparente_projeto ? `${parseFloat(ensaio.dens_aparente_projeto).toFixed(3)} g/cm³` : 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">DENS. RICE PROJETO:</p>
          <p className="text-gray-900">{ensaio.dens_rice_projeto ? `${parseFloat(ensaio.dens_rice_projeto).toFixed(3)} g/cm³` : 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">DATA:</p>
          <p className="text-gray-900">{formatDate(ensaio.data)}</p>
        </div>

        <div className="col-span-1">
          <p className="font-bold text-gray-700">RODOVIA:</p>
          <p className="text-gray-900">{ensaio.rodovia}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">USINA FORNECEDORA:</p>
          <p className="text-gray-900">{ensaio.usina_fornecedora || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">TRECHO:</p>
          <p className="text-gray-900">{ensaio.trecho}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">SERVIÇO:</p>
          <p className="text-gray-900">{ensaio.servico || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">ESPESSURA PROJETO:</p>
          <p className="text-gray-900">{ensaio.espessura_projeto ? `${ensaio.espessura_projeto} cm` : 'N/A'}</p>
        </div>

        <div className="col-span-1">
          <p className="font-bold text-gray-700">ENSAIO REALIZADO POR:</p>
          <p className="text-gray-900">{ensaio.ensaio_realizado_por || 'N/A'}</p>
        </div>
        <div className="col-span-1">
          <p className="font-bold text-gray-700">LABORATORISTA:</p>
          <p className="text-gray-900">{ensaio.laboratorista_name || 'N/A'}</p>
        </div>
      </div>
    </>
  );
}