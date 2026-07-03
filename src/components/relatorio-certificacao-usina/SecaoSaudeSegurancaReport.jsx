import React from "react";
import { SecTitle, SubTitle, SectionTable, ConformeRow } from "./RelatorioCertificacaoPrimitives";

/**
 * Seção 5 - Aspectos de Saúde e Segurança do Trabalho do relatório de
 * Certificação de Usina. Recebe o slice `ss` (saude_seguranca) do registro.
 */
export default function SecaoSaudeSegurancaReport({ ss }) {
  const ssRow = (label, section, key) => <ConformeRow key={`${section}_${key}`} label={label} value={(ss[section] || {})[key]} />;

  return (
    <>
      <SecTitle>5 - ASPECTOS DE SAÚDE E SEGURANÇA DO TRABALHO</SecTitle>

      <SubTitle>Treinamentos</SubTitle>
      <SectionTable>
        {ssRow("Os eletricistas possuem treinamento em NR-10", "treinamentos", "nr10_eletricistas")}
        {ssRow("Os operadores de máquinas e equipamentos possuem treinamento em NR-11 e NR-12", "treinamentos", "nr11_nr12_operadores")}
        {ssRow("Todos os funcionários possuem treinamento de integração (NR-18)", "treinamentos", "nr18_integracao")}
        {ssRow("Os funcionários que desenvolvem atividades acima de 2,0m de altura possuem treinamento em NR-35", "treinamentos", "nr35_altura")}
        {ssRow("Os funcionários que manipulam produtos químicos possuem treinamento das FISPQ's", "treinamentos", "fispq_quimicos")}
      </SectionTable>

      <SubTitle>Equipamentos de Proteção Individual e Coletiva</SubTitle>
      <SectionTable>
        {ssRow("Os EPI's entregues aos funcionários são aprovados pelo Ministério do Trabalho", "epis", "aprovados_ministerio")}
        {ssRow("Os EPI's entregues aos funcionários são compatíveis com as atividades desempenhadas", "epis", "compativeis_atividades")}
        {ssRow("Os EPI's entregues aos funcionários estão sendo cautelados", "epis", "sendo_cautelados")}
        {ssRow("Os extintores estão instalados conforme norma do Corpo de Bombeiros NPT-021", "epis", "extintores_npt021")}
      </SectionTable>

      <SubTitle>NR-12 – Acessos</SubTitle>
      <SectionTable>
        {ssRow("Os meios de acesso da usina são dimensionados, construídos e fixados de modo seguro e resistente", "acessos", "dimensionados_seguros")}
        {ssRow("Os meios de acesso são construídos de material resistente às intempéries e corrosão", "acessos", "material_resistente")}
        {ssRow("Os meios de acesso possuem travessão superior instalado de 1,10m a 1,20m de altura em relação ao piso por toda a extensão, em ambos os lados", "acessos", "travessao_superior")}
        {ssRow("Os meios de acesso não possuem travessão com superfície plana", "acessos", "sem_superficie_plana")}
        {ssRow("Os meios de acesso possuem rodapé de, no mínimo 0,20m de altura e travessão intermediário a 0,70m de altura em relação ao piso", "acessos", "rodape_travessao_intermediario")}
        {ssRow("As passarelas, plataformas e rampas têm largura de 0,60m", "acessos", "largura_060m")}
      </SectionTable>

      <SubTitle>Escadas do Tipo Marinheiro</SubTitle>
      <SectionTable>
        {ssRow("Possuem gaiolas de proteção, caso possuam altura superior a 3,50m instaladas a partir de 2,0m do piso", "escadas_marinheiro", "gaiolas_protecao")}
        {ssRow("Possuem corrimão ou continuação dos montantes da escada ultrapassando a plataforma em 1,10m a 1,20m", "escadas_marinheiro", "corrimao_montantes")}
        {ssRow("Possuem largura de 0,40m a 0,60m", "escadas_marinheiro", "largura_040_060m")}
        {ssRow("Possuem altura total máxima de 10m se for de um único lance", "escadas_marinheiro", "altura_max_10m")}
        {ssRow("Possuem altura máxima de 6m entre duas plataformas de descanso, se for de múltiplos lances", "escadas_marinheiro", "altura_max_6m_plataformas")}
        {ssRow("Possuem espaçamento entre barras horizontais de 0,25m a 0,30m", "escadas_marinheiro", "espacamento_barras_025_030m")}
        {ssRow("Possuem espaçamento entre o piso da máquina ou da edificação e a primeira barra não superior a 0,55m", "escadas_marinheiro", "espacamento_piso_primeira_barra")}
        {ssRow("Possuem distância em relação à estrutura em que é fixada de, no mínimo 0,15m", "escadas_marinheiro", "distancia_estrutura_015m")}
        {ssRow("Possuem barras horizontais de 0,025m a 0,038m de diâmetro ou espessura", "escadas_marinheiro", "diametro_barras")}
        {ssRow("Possuem barras horizontais com superfícies, formas ou ranhuras a fim de prevenir deslizamentos", "escadas_marinheiro", "barras_antideslizamento")}
      </SectionTable>

      <SubTitle>Gaiolas de Proteção</SubTitle>
      <SectionTable>
        {ssRow("Têm diâmetro de 0,65 a 0,80m", "gaiolas_protecao", "diametro_065_080m")}
        {ssRow("Possuem barras verticais com espaçamento máximo de 0,30m entre si e distância máxima de 1,50m entre arcos", "gaiolas_protecao", "barras_verticais_espacamento")}
        {ssRow("Possuem vãos entre arcos de, no máximo, 0,30m dotadas de barra vertical de sustentação dos arcos", "gaiolas_protecao", "vaos_arcos")}
      </SectionTable>

      <SubTitle>Instalações Elétricas – Condutores de Alimentação Elétrica</SubTitle>
      <SectionTable>
        {ssRow("Oferecem resistência mecânica", "instalacoes_eletricas", "condutores_resistencia_mecanica")}
        {ssRow("Possuem proteção contra rompimento mecânico, contatos abrasivos e contato com lubrificantes, combustíveis e calor", "instalacoes_eletricas", "condutores_protecao_rompimento")}
        {ssRow("Têm localização de forma que nenhum segmento fique em contato com partes móveis ou cantos vivos", "instalacoes_eletricas", "condutores_localizacao")}
        {ssRow("Não dificultam o trânsito de pessoas e materiais ou a operação das máquinas", "instalacoes_eletricas", "condutores_transito")}
        {ssRow("Não oferecem quaisquer outros tipos de riscos na sua localização", "instalacoes_eletricas", "condutores_sem_riscos")}
        {ssRow("São construídos de materiais que não propaguem fogo", "instalacoes_eletricas", "condutores_material_nao_propaga_fogo")}
      </SectionTable>

      <SubTitle>Quadros ou Painéis de Comando e Potência</SubTitle>
      <SectionTable>
        {ssRow("Possuem porta de acesso mantida permanentemente fechada, exceto em manutenções", "instalacoes_eletricas", "quadros_porta_fechada")}
        {ssRow("Possuem sinalização quanto ao perigo de choque elétrico e restrição de acesso por pessoas não autorizadas", "instalacoes_eletricas", "quadros_sinalizacao_choque")}
        {ssRow("São mantidos em bom estado de conservação, limpos e livres de objetos e ferramentas", "instalacoes_eletricas", "quadros_conservacao")}
        {ssRow("Possuem proteção e identificação dos circuitos", "instalacoes_eletricas", "quadros_identificacao_circuitos")}
        {ssRow("Possuem dispositivo protetor contra sobretensão quando a elevação da tensão puder ocasionar risco de acidentes", "instalacoes_eletricas", "quadros_protecao_sobretensao")}
      </SectionTable>

      <SubTitle>Dispositivos de Partida, Acionamento e Parada</SubTitle>
      <SectionTable>
        {ssRow("Não se localizam em zonas perigosas", "instalacoes_eletricas", "dispositivos_sem_zona_perigosa")}
        {ssRow("Podem ser acionados ou desligados em caso de emergência por outra pessoa que não seja o operador", "instalacoes_eletricas", "dispositivos_emergencia")}
        {ssRow("Impedem o acionamento ou desligamento involuntário pelo operador ou por qualquer outra forma acidental", "instalacoes_eletricas", "dispositivos_sem_acionamento_involuntario")}
        {ssRow("É dificultado a burla", "instalacoes_eletricas", "dispositivos_sem_burla")}
        {ssRow("Possuem dispositivos que impeçam seu funcionamento automático ao serem energizadas", "instalacoes_eletricas", "dispositivos_sem_funcionamento_automatico")}
      </SectionTable>

      <SubTitle>Sistemas de Segurança</SubTitle>
      <SectionTable>
        {ssRow("Possui proteções fixas, proteções móveis e dispositivos de segurança interligados, que protejam a saúde e a integridade física dos funcionários", "sistemas_seguranca", "protecoes_fixas_moveis")}
        {ssRow("Todas as engrenagens, polias, correntes, rodas dentadas e outras peças móveis estão protegidas", "sistemas_seguranca", "engrenagens_protegidas")}
      </SectionTable>
      <SubTitle>Proteções</SubTitle>
      <SectionTable>
        {ssRow("Cumprem suas funções durante a vida útil ou possibilitam a reposição de partes danificadas", "protecoes", "funcoes_vida_util")}
        {ssRow("São construídas de materiais resistentes e adequados à contenção de projeção de peças, materiais e partículas", "protecoes", "materiais_contencao")}
        {ssRow("Possuem fixação firme e garantia de estabilidade e resistência mecânica", "protecoes", "fixacao_estabilidade")}
        {ssRow("Não criam pontos de esmagamento ou agarramento com partes da máquina ou com outras proteções", "protecoes", "sem_esmagamento")}
        {ssRow("Não possuem extremidades e arestas cortantes ou outras saliências perigosas", "protecoes", "sem_arestas_cortantes")}
        {ssRow("Resistem às condições ambientais do local onde estão instaladas", "protecoes", "resistem_condicoes_ambientais")}
        {ssRow("Dificulta-se a burla", "protecoes", "dificulta_burla")}
        {ssRow("Proporcionam condições de higiene e limpeza", "protecoes", "higiene_limpeza")}
        {ssRow("Impedem o acesso à zona de perigo", "protecoes", "impedem_acesso_perigo")}
        {ssRow("Têm seus dispositivos de intertravamento protegidos adequadamente contra sujidade, poeiras e corrosão", "protecoes", "intertravamento_protegidos")}
      </SectionTable>

      <SubTitle>NR-35 – Trabalho em Altura</SubTitle>
      <SectionTable>
        {ssRow("Todos os funcionários autorizados a realizar trabalho em altura possuem treinamento em NR-35", "nr35_trabalho_altura", "treinamento_nr35")}
        {ssRow("Os ASO's dos funcionários que realizam trabalho em altura constam aptos para trabalho em altura", "nr35_trabalho_altura", "aso_apto_altura")}
        {ssRow("Antes do início das atividades foi feita a Análise de Risco", "nr35_trabalho_altura", "analise_risco")}
        {ssRow("As atividades não rotineiras são previamente autorizadas através de Permissão de Trabalho", "nr35_trabalho_altura", "permissao_trabalho")}
        {ssRow("Os funcionários estão fazendo o uso do cinto de segurança e talabarte compatível", "nr35_trabalho_altura", "cinto_talabarte")}
      </SectionTable>

      <SubTitle>NR-10 – Segurança em Instalações e Serviços em Eletricidade</SubTitle>
      <SectionTable>
        {ssRow("Para instalação elétrica superior a 75kW possui prontuários de instalações elétricas, incluindo o sistema de proteção contra descargas atmosféricas", "nr10_eletricidade", "prontuarios_75kw")}
        {ssRow("Os painéis elétricos devem possuir esquema unifilar elaborado por profissional legalmente habilitado", "nr10_eletricidade", "esquema_unifilar")}
        {ssRow("Nos painéis elétricos estão instalados dispositivo DR (disjuntor residual) conforme NBR 5410", "nr10_eletricidade", "dispositivo_dr_nbr5410")}
        {ssRow("As instalações e equipamentos estão aterrados", "nr10_eletricidade", "aterramento")}
        {ssRow("Os eletricistas receberão treinamento de NR-10", "nr10_eletricidade", "treinamento_nr10")}
      </SectionTable>
    </>
  );
}