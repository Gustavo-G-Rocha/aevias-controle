import React from "react";
import { fmtDate } from "@/utils/relatorioRompimentoConcretoUtils";

export default function RelatorioRompimentoDadosGerais({
  ensaio,
  obra,
  regional,
}) {
  return (
    <>
      {/* CABEÇALHO */}
      <header className="grid items-center py-2" style={{ gridTemplateColumns: "90px 1fr 90px" }}>
        <div>
          <picture>
            <source
              srcSet={
                regional?.logo_url ||
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"
              }
            />
            <img
              src={
                regional?.logo_url ||
                "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png"
              }
              alt="Logo"
              className="h-14 object-contain"
              width="auto"
              height="56"
            />
          </picture>
        </div>
        <h1 className="text-base font-bold text-gray-800 text-center">
          FICHA DE MOLDAGEM
        </h1>
        <div className="text-sm font-semibold text-gray-800 text-right border border-slate-400 rounded px-2 py-1 h-fit flex items-center justify-center">
          {fmtDate(ensaio.data_ensaio)}
        </div>
      </header>

      {/* DADOS BÁSICOS */}
      <div className="border border-slate-400 text-[10px]">
        <div className="grid grid-cols-5 gap-0">
          {/* Linha 1: Labels */}
          <div className="px-2 py-0.5 font-semibold bg-white">OBRA:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">RODOVIA:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">FORNECEDOR:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">CARTA TRAÇO:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">
            N° DE MOLDAGEM:
          </div>
          {/* Linha 1: Valores */}
          <div className="px-2 py-1 min-h-[40px] bg-white">
            {obra?.name || ""}
          </div>
          <div className="px-2 py-1 bg-white">{ensaio.rodovia || ""}</div>
          <div className="px-2 py-1 bg-white">{ensaio.fornecedor || ""}</div>
          <div className="px-2 py-1 bg-white">
            {ensaio.projeto_trac || ""}
          </div>
          <div className="px-2 py-1 bg-white">
            {ensaio.numero_moldagem || ""}
          </div>
          {/* Linha 2: Labels */}
          <div className="px-2 py-0.5 font-semibold bg-white">CLIENTE:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">TRECHO:</div>
          <div className="px-2 py-0.5 font-semibold bg-white">
            VOLUME BETONADO:
          </div>
          <div className="px-2 py-0.5 font-semibold bg-white">
            HORA MOLDAGEM:
          </div>
          <div className="px-2 py-0.5 font-semibold bg-white">
            LABORATORISTA:
          </div>
          {/* Linha 2: Valores */}
          <div className="px-2 py-1 min-h-[40px] bg-white">
            {ensaio.cliente || obra?.client || ""}
          </div>
          <div className="px-2 py-1 bg-white">{ensaio.trecho || ""}</div>
          <div className="px-2 py-1 bg-white">
            {ensaio.volume_betonado || ""}
          </div>
          <div className="px-2 py-1 bg-white">{ensaio.hora_moldagem || ""}</div>
          <div className="px-2 py-1 bg-white">
            {ensaio.laboratorista_name || ""}
          </div>
        </div>
      </div>
    </>
  );
}