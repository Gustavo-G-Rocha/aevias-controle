import React from "react";
import ChecklistRow from "./ChecklistRow";
import SectionTitle from "./SectionTitle";
import SubSectionTitle from "./SubSectionTitle";

export default function SecaoSaudeSeguranca({ formData, onNestedChange, disabled }) {
  const ss = formData.saude_seguranca || {};
  const t = ss.treinamentos || {};
  const epis = ss.epis || {};
  const ac = ss.acessos || {};
  const em = ss.escadas_marinheiro || {};
  const gp = ss.gaiolas_protecao || {};
  const ie = ss.instalacoes_eletricas || {};
  const sisSeg = ss.sistemas_seguranca || {};
  const prot = ss.protecoes || {};
  const nr35 = ss.nr35_trabalho_altura || {};
  const nr10 = ss.nr10_eletricidade || {};

  const row = (label, section, key) => (
    <ChecklistRow
      key={key}
      label={label}
      path={`saude_seguranca.${section}.${key}`}
      value={(ss[section] || {})[key]}
      onChange={onNestedChange}
      disabled={disabled}
    />
  );

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-[#00233B] text-sm bg-slate-100 px-3 py-2 rounded">
        5 - ASPECTOS DE SAÚDE E SEGURANÇA DO TRABALHO
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-slate-300 rounded">
          <tbody>
            <SubSectionTitle>Treinamentos</SubSectionTitle>
            {row("Os eletricistas possuem treinamento em NR-10", "treinamentos", "nr10_eletricistas")}
            {row("Os operadores de máquinas e equipamentos possuem treinamento em NR-11 e NR-12", "treinamentos", "nr11_nr12_operadores")}
            {row("Todos os funcionários possuem treinamento de integração (NR-18)", "treinamentos", "nr18_integracao")}
            {row("Os funcionários que desenvolvem atividades acima de 2,0m de altura possuem treinamento em NR-35", "treinamentos", "nr35_altura")}
            {row("Os funcionários que manipulam produtos químicos possuem treinamento das FISPQ's", "treinamentos", "fispq_quimicos")}

            <SubSectionTitle>Equipamentos de proteção individual e coletiva</SubSectionTitle>
            {row("Os EPI's entregues aos funcionários são aprovados pelo Ministério do Trabalho", "epis", "aprovados_ministerio")}
            {row("Os EPI's entregues aos funcionários são compatíveis com as atividades desempenhadas", "epis", "compativeis_atividades")}
            {row("Os EPI's entregues aos funcionários estão sendo cautelados", "epis", "sendo_cautelados")}
            {row("Os extintores estão instalados conforme norma do Corpo de Bombeiros NPT-021", "epis", "extintores_npt021")}

            <SubSectionTitle>NR-12 - Acessos</SubSectionTitle>
            {row("Os meios de acesso da usina são dimensionados, construídos e fixados de modo seguro e resistente", "acessos", "dimensionados_seguros")}
            {row("Os meios de acesso são construídos de material resistente às intempéries e corrosão", "acessos", "material_resistente")}
            {row("Os meios de acesso possuem travessão superior instalado de 1,10m a 1,20m de altura em relação ao piso por toda a extensão, em ambos os lados", "acessos", "travessao_superior")}
            {row("Os meios de acesso não possuem travessão com superfície plana", "acessos", "sem_superficie_plana")}
            {row("Os meios de acesso possuem rodapé de, no mínimo 0,20m de altura e travessão intermediário a 0,70m de altura em relação ao piso", "acessos", "rodape_travessao_intermediario")}
            {row("As passarelas, plataformas e rampas têm largura de 0,60m", "acessos", "largura_060m")}

            <SubSectionTitle>Escadas do tipo marinheiro</SubSectionTitle>
            {row("Possuem gaiolas de proteção, caso possuam altura superior a 3,50m instaladas a partir de 2,0m do piso", "escadas_marinheiro", "gaiolas_protecao")}
            {row("Possuem corrimão ou continuação dos montantes da escada ultrapassando a plataforma em 1,10m a 1,20m", "escadas_marinheiro", "corrimao_montantes")}
            {row("Possuem largura de 0,40m a 0,60m", "escadas_marinheiro", "largura_040_060m")}
            {row("Possuem altura total máxima de 10m se for de um único lance", "escadas_marinheiro", "altura_max_10m")}
            {row("Possuem altura máxima de 6m entre duas plataformas de descanso, se for de múltiplos lances", "escadas_marinheiro", "altura_max_6m_plataformas")}
            {row("Possuem espaçamento entre barras horizontais de 0,25m a 0,30m", "escadas_marinheiro", "espacamento_barras_025_030m")}
            {row("Possuem espaçamento entre o piso da máquina ou da edificação e a primeira barra não superior a 0,55m", "escadas_marinheiro", "espacamento_piso_primeira_barra")}
            {row("Possuem distância em relação à estrutura em que é fixada de, no mínimo 0,15m", "escadas_marinheiro", "distancia_estrutura_015m")}
            {row("Possuem barras horizontais de 0,025m a 0,038m de diâmetro ou espessura", "escadas_marinheiro", "diametro_barras")}
            {row("Possuem barras horizontais com superfícies, formas ou ranhuras a fim de prevenir deslizamentos", "escadas_marinheiro", "barras_antideslizamento")}

            <SubSectionTitle>Gaiolas de proteção</SubSectionTitle>
            {row("Têm diâmetro de 0,65 a 0,80m", "gaiolas_protecao", "diametro_065_080m")}
            {row("Possuem barras verticais com espaçamento máximo de 0,30m entre si e distância máxima de 1,50m entre arcos", "gaiolas_protecao", "barras_verticais_espacamento")}
            {row("Possuem vãos entre arcos de, no máximo, 0,30m dotadas de barra vertical de sustentação dos arcos", "gaiolas_protecao", "vaos_arcos")}

            <SubSectionTitle>Instalações elétricas - Condutores de alimentação</SubSectionTitle>
            {row("Oferecem resistência mecânica", "instalacoes_eletricas", "condutores_resistencia_mecanica")}
            {row("Possuem proteção contra a possibilidade de rompimento mecânico, de contatos abrasivos e de contato com lubrificantes, combustíveis e calor", "instalacoes_eletricas", "condutores_protecao_rompimento")}
            {row("Têm localização de forma que nenhum segmento fique em contato com as partes móveis ou cantos vivos", "instalacoes_eletricas", "condutores_localizacao")}
            {row("Não dificultam o trânsito de pessoas e materiais ou a operação das máquinas", "instalacoes_eletricas", "condutores_transito")}
            {row("Não oferecem quaisquer outros tipos de riscos na sua localização", "instalacoes_eletricas", "condutores_sem_riscos")}
            {row("São construídos de materiais que não propaguem fogo", "instalacoes_eletricas", "condutores_material_nao_propaga_fogo")}

            <SubSectionTitle>Quadros ou Painéis de comando e potência</SubSectionTitle>
            {row("Possuem porta de acesso mantida permanentemente fechada, exceto em manutenções", "instalacoes_eletricas", "quadros_porta_fechada")}
            {row("Possuem sinalização quanto ao perigo de choque elétrico e restrição de acesso por pessoas não autorizadas", "instalacoes_eletricas", "quadros_sinalizacao_choque")}
            {row("São mantidos em bom estado de conservação, limpos e livres de objetos e ferramentas", "instalacoes_eletricas", "quadros_conservacao")}
            {row("Possuem proteção e identificação dos circuitos", "instalacoes_eletricas", "quadros_identificacao_circuitos")}
            {row("Possuem dispositivo protetor contra sobretensão quando a elevação da tensão puder ocasionar risco de acidentes", "instalacoes_eletricas", "quadros_protecao_sobretensao")}

            <SubSectionTitle>Dispositivos de partida, acionamento e parada</SubSectionTitle>
            {row("Não se localizam em zonas perigosas", "instalacoes_eletricas", "dispositivos_sem_zona_perigosa")}
            {row("Podem ser acionados ou desligados em caso de emergência por outra pessoa que não seja o operador", "instalacoes_eletricas", "dispositivos_emergencia")}
            {row("Impedem o acionamento ou desligamento involuntário pelo operador ou por qualquer outra forma acidental", "instalacoes_eletricas", "dispositivos_sem_acionamento_involuntario")}
            {row("É dificultado a burla", "instalacoes_eletricas", "dispositivos_sem_burla")}
            {row("Possuem dispositivos que impeçam seu funcionamento automático ao serem energizadas", "instalacoes_eletricas", "dispositivos_sem_funcionamento_automatico")}

            <SubSectionTitle>Sistemas de segurança</SubSectionTitle>
            {row("Possui proteções fixas, proteções móveis e dispositivos de segurança interligados, que protejam a saúde e a integridade física dos funcionários", "sistemas_seguranca", "protecoes_fixas_moveis")}
            {row("Todas as engrenagens, polias, correntes, rodas dentadas e outras peças móveis estão protegidas", "sistemas_seguranca", "engrenagens_protegidas")}

            <SubSectionTitle>Proteções</SubSectionTitle>
            {row("Cumprem suas funções durante a vida útil ou possibilitam a reposição de partes danificadas", "protecoes", "funcoes_vida_util")}
            {row("São construídas de materiais resistentes e adequados à contenção de projeção de peças, materiais e partículas", "protecoes", "materiais_contencao")}
            {row("Possuem fixação firme e garantia de estabilidade e resistência mecânica", "protecoes", "fixacao_estabilidade")}
            {row("Não criam pontos de esmagamento ou agarramento com partes da máquina ou com outras proteções", "protecoes", "sem_esmagamento")}
            {row("Não possuem extremidades e arestas cortantes ou outras saliências perigosas", "protecoes", "sem_arestas_cortantes")}
            {row("Resistem às condições ambientais do local onde estão instaladas", "protecoes", "resistem_condicoes_ambientais")}
            {row("Dificulta-se a burla", "protecoes", "dificulta_burla")}
            {row("Proporcionam condições de higiene e limpeza", "protecoes", "higiene_limpeza")}
            {row("Impedem o acesso à zona de perigo", "protecoes", "impedem_acesso_perigo")}
            {row("Têm seus dispositivos de intertravamento protegidos adequadamente contra sujidade, poeiras e corrosão", "protecoes", "intertravamento_protegidos")}

            <SubSectionTitle>NR-35 – Trabalho em altura</SubSectionTitle>
            {row("Todos os funcionários autorizados a realizar trabalho em altura possuem treinamento em NR-35", "nr35_trabalho_altura", "treinamento_nr35")}
            {row("Os ASO's dos funcionários que realizam trabalho em altura constam aptos para trabalho em altura", "nr35_trabalho_altura", "aso_apto_altura")}
            {row("Antes do início das atividades foi feita a Análise de Risco", "nr35_trabalho_altura", "analise_risco")}
            {row("As atividades não rotineiras são previamente autorizadas através de Permissão de Trabalho", "nr35_trabalho_altura", "permissao_trabalho")}
            {row("Os funcionários estão fazendo o uso do cinto de segurança e talabarte compatível", "nr35_trabalho_altura", "cinto_talabarte")}

            <SubSectionTitle>NR-10 – Segurança em instalações e serviços em eletricidade</SubSectionTitle>
            {row("Para instalação elétrica superior a 75kW possui prontuários de instalações elétricas, incluindo o sistema de proteção contra descargas atmosféricas", "nr10_eletricidade", "prontuarios_75kw")}
            {row("Os painéis elétricos devem possuir esquema unifilar elaborado por profissional legalmente habilitado", "nr10_eletricidade", "esquema_unifilar")}
            {row("Nos painéis elétricos estão instalados dispositivo DR (disjuntor residual) conforme NBR 5410", "nr10_eletricidade", "dispositivo_dr_nbr5410")}
            {row("As instalações e equipamentos estão aterrados", "nr10_eletricidade", "aterramento")}
            {row("Os eletricistas receberão treinamento de NR-10", "nr10_eletricidade", "treinamento_nr10")}
          </tbody>
        </table>
      </div>
    </div>
  );
}