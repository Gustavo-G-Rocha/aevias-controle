/**
 * ProjectDetails.jsx
 *
 * Orquestrador de visualização de um projeto.
 * Responsabilidade: montar as seções condicionais com base no tipo de projeto.
 * Sem lógica de negócio — cada seção é tratada por um sub-componente dedicado.
 *
 * Estrutura de sub-componentes (em details/):
 *   DetailPrimitives      — DetailSection, DetailItem, DetailRange
 *   AgregadosList         — tabela granulométrica dos agregados
 *   LiganteInfo           — card do ligante asfáltico (CAUQ)
 *   TemperaturasControl   — temperaturas de mistura/compactação/espalhamento (CAUQ)
 *   FaixaEspecificacaoTable — tabela de faixa de especificação
 *   FaixaTrabalhoTable    — tabela de faixa de trabalho (mín/mistura/máx)
 *   GraficoGranulometriaProject — gráfico Recharts em escala log
 *   TabelaMarshall        — parâmetros Marshall (CAUQ)
 *   CartaTracoSection     — seção completa para CARTA_TRACO_CONCRETO
 */
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { DetailSection, DetailItem, DetailRange } from "@/components/projects/details/DetailPrimitives";
import AgregadosList from "@/components/projects/details/AgregadosList";
import LiganteInfo from "@/components/projects/details/LiganteInfo";
import TemperaturasControl from "@/components/projects/details/TemperaturasControl";
import FaixaEspecificacaoTable from "@/components/projects/details/FaixaEspecificacaoTable";
import FaixaTrabalhoTable from "@/components/projects/details/FaixaTrabalhoTable";
import GraficoGranulometriaProject from "@/components/projects/details/GraficoGranulometriaProject";
import TabelaMarshall from "@/components/projects/details/TabelaMarshall";
import CartaTracoSection from "@/components/projects/details/CartaTracoSection";

const BADGE_COLORS = {
  CAUQ: 'bg-[#00233B] text-white',
  MRAF: 'bg-[#566E3D] text-white',
  CARTA_TRACO_CONCRETO: 'bg-orange-500 text-white',
};

export default function ProjectDetails({ project, faixas }) {
  if (!project) return null;

  const faixa = faixas?.find(f => f.id === project.faixa_granulometrica_id);
  const isCauq = project.tipo_projeto === 'CAUQ';
  const isMraf = project.tipo_projeto === 'MRAF';
  const isCartaTraco = project.tipo_projeto === 'CARTA_TRACO_CONCRETO';
  const badgeClass = BADGE_COLORS[project.tipo_projeto] || 'bg-purple-500 text-white';
  const badgeLabel = isCartaTraco ? 'CARTA TRAÇO' : (project.tipo_projeto || 'CAUQ');

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-[#00233B]">{project.name}</h2>
          <Badge className={badgeClass}>{badgeLabel}</Badge>
        </div>
        {project.description && <p className="text-sm text-[#00233B]/80">{project.description}</p>}
        {project.location && <p className="text-sm text-[#00233B]/60 mt-1">📍 {project.location}</p>}
      </div>

      <Separator className="bg-[#00233B]/20" />

      {/* Informações básicas */}
      <DetailSection title="📋 Informações Básicas">
        <DetailItem label="Cliente" value={project.client} />
        <DetailItem label="Status" value={
          project.status === 'ativo' ? 'Ativo' :
          project.status === 'inativo' ? 'Inativo' : 'Pausado'
        } />
        {!isCartaTraco && faixa && <DetailItem label="Faixa Granulométrica" value={faixa.nome} />}
      </DetailSection>

      <Separator className="bg-[#00233B]/20" />

      {/* ── CARTA TRAÇO ─────────────────────────────────────────────────────── */}
      {isCartaTraco && (
        <>
          <DetailSection title="🏗️ Especificações da Carta Traço">
            <CartaTracoSection project={project} />
          </DetailSection>
          <Separator className="bg-[#00233B]/20" />
        </>
      )}

      {/* ── CAUQ / MRAF / BGS / CAMADAS_GRANULARES ──────────────────────────── */}
      {!isCartaTraco && (
        <>
          {project.agregados?.length > 0 && (
            <>
              <DetailSection title="🪨 Agregados">
                <AgregadosList agregados={project.agregados} />
              </DetailSection>
              <Separator className="bg-[#00233B]/20" />
            </>
          )}

          {isCauq && project.ligante && (
            <>
              <DetailSection title="🛢️ Ligante Asfáltico">
                <LiganteInfo ligante={project.ligante} />
              </DetailSection>
              <Separator className="bg-[#00233B]/20" />
            </>
          )}

          {isMraf && (
            <>
              <DetailSection title="🛢️ Emulsão Asfáltica">
                <div className="space-y-3">
                  <DetailItem label="Emulsão Utilizada" value={project.emulsao_utilizada} />
                  <DetailItem label="Percentual de Emulsão" value={project.percentual_emulsao} unit="%" />
                  <DetailRange label="Teor Ligante Residual"
                    min={project.teor_ligante_residual?.min} max={project.teor_ligante_residual?.max}
                    otimo={project.teor_ligante_residual?.otimo} unit="%" />
                  <DetailRange label="Taxa de Aplicação"
                    min={project.taxa_aplicacao_mraf?.min} max={project.taxa_aplicacao_mraf?.max}
                    otimo={project.taxa_aplicacao_mraf?.otimo} unit=" kg/m²" />
                  <DetailItem label="Densidade da Mistura"
                    value={project.densidade_mistura_mraf ? Number(project.densidade_mistura_mraf).toFixed(3) : null}
                    unit="g/cm³" />
                </div>
              </DetailSection>
              <Separator className="bg-[#00233B]/20" />
            </>
          )}

          {isCauq && project.temperaturas && (
            <>
              <DetailSection title="🌡️ Controle de Temperaturas">
                <TemperaturasControl temperaturas={project.temperaturas} />
              </DetailSection>
              <Separator className="bg-[#00233B]/20" />
            </>
          )}

          {faixa && (
            <>
              <DetailSection title="📐 Faixa de Especificação (% Passante)">
                <div className="space-y-2 mb-3">
                  <DetailItem label="Nome" value={faixa.nome} />
                  <DetailItem label="Órgão" value={faixa.orgao} />
                  <DetailItem label="Especificação" value={faixa.especificacao} />
                </div>
                <FaixaEspecificacaoTable faixaEspecificacao={faixa} />
              </DetailSection>
              <Separator className="bg-[#00233B]/20" />
            </>
          )}

          {(project.faixa_trabalho || project.faixa_trabalho_min || project.faixa_trabalho_max) && (
            <>
              <DetailSection title="📊 Faixa de Trabalho (% Passante)">
                <FaixaTrabalhoTable
                  faixaTrabalho={project.faixa_trabalho}
                  faixaMin={project.faixa_trabalho_min}
                  faixaMax={project.faixa_trabalho_max}
                />
                {project.faixa_trabalho && faixa && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-[#00233B] mb-3">Gráfico da Faixa de Trabalho</h4>
                    <GraficoGranulometriaProject project={project} faixaEspecificacao={faixa} />
                  </div>
                )}
              </DetailSection>
              <Separator className="bg-[#00233B]/20" />
            </>
          )}

          {isCauq && (
            <DetailSection title="🔬 Parâmetros Marshall">
              <TabelaMarshall project={project} />
            </DetailSection>
          )}
        </>
      )}
    </div>
  );
}