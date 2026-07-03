import React from "react";
import { SecTitle, SubTitle, SectionTable, ConformeRow } from "./RelatorioCertificacaoPrimitives";

/**
 * Seção 6 - Meio Ambiente do relatório de Certificação de Usina.
 * Recebe o slice `ma` (meio_ambiente) do registro.
 */
export default function SecaoMeioAmbienteReport({ ma }) {
  const maRow = (label, section, key) => <ConformeRow key={`${section}_${key}`} label={label} value={(ma[section] || {})[key]} />;

  return (
    <>
      <SecTitle breakBefore>6 - MEIO AMBIENTE</SecTitle>

      <SubTitle>Ruídos</SubTitle>
      <SectionTable>
        {maRow("Estão sendo realizadas semestralmente a medição de ruídos conforme NBR 10.151/2019", "ruidos", "medicao_semestral_nbr10151")}
        {maRow("Estão sendo respeitados os horários e a intensidade de ruído conforme legislação municipal", "ruidos", "horarios_intensidade_municipio")}
        {maRow("Estão sendo feitas as manutenções periódicas das máquinas e equipamentos", "ruidos", "manutencao_maquinas")}
      </SectionTable>

      <SubTitle>Emissão Atmosférica</SubTitle>
      <SectionTable>
        {maRow("É realizada a medição de poluentes na chaminé da usina com periodicidade semestral", "emissao_atmosferica", "medicao_poluentes_chamine")}
        {maRow("Estão sendo atendidos os valores especificados na resolução SEMA nº016/2014", "emissao_atmosferica", "resolucao_sema_016_2014")}
        {maRow("É realizado o monitoramento do índice de fumaça preta dos equipamentos que utilizam diesel", "emissao_atmosferica", "monitoramento_fumaca_preta")}
        {maRow("A usina possui filtro para material particulado", "emissao_atmosferica", "filtro_material_particulado")}
        {maRow("Existe meta de redução de carbono?", "emissao_atmosferica", "meta_reducao_carbono")}
      </SectionTable>

      <SubTitle>Efluentes Líquidos</SubTitle>
      <SectionTable>
        {maRow("Possui fossa séptica de acordo com a norma NBR 7229 em local onde não possui rede de esgoto", "efluentes_liquidos", "fossa_septica_nbr7229")}
        {maRow("É promovida a manutenção e limpeza por empresas licenciadas e especializadas das fossas sépticas", "efluentes_liquidos", "manutencao_fossas")}
        {maRow("O óleo lubrificante, já utilizado, é estocado em tambores, e acondicionados em local coberto, delimitado por bacias de contenção", "efluentes_liquidos", "oleo_lubrificante_tambores")}
        {maRow("O óleo usado é destinado única e exclusivamente a empresa recicladoras de óleo, devidamente licenciadas pelo órgão ambiental", "efluentes_liquidos", "oleo_recicladoras_licenciadas")}
        {maRow("Os efluentes lançados seguem as condições e padrões de lançamento de efluentes conforme Resolução CONAMA 357/05", "efluentes_liquidos", "efluentes_conama_357")}
        {maRow("A utilização e o armazenamento de substâncias combustíveis e oleosas são realizadas em locais adequados", "efluentes_liquidos", "armazenamento_combustiveis")}
        {maRow("Não existem sinais de vazamentos/transbordamentos das unidades de armazenamento e tratamento de efluentes", "efluentes_liquidos", "sem_sinais_vazamentos")}
      </SectionTable>

      <SubTitle>Resíduos Sólidos</SubTitle>
      <SectionTable>
        {maRow("São disponibilizados mecanismos de coleta seletiva", "residuos_solidos", "coleta_seletiva")}
        {maRow("O transporte de resíduos são realizados por empresas licenciadas", "residuos_solidos", "transporte_licenciado")}
        {maRow("A destinação final dos resíduos é realizada por empresa licenciada", "residuos_solidos", "destinacao_licenciada")}
        {maRow("As licenças do transporte e destinação dos resíduos são arquivadas", "residuos_solidos", "licencas_arquivadas")}
        {maRow("Estão sendo emitidas as MTR's dos resíduos transportados", "residuos_solidos", "mtr_emitidas")}
      </SectionTable>

      <SubTitle>Contaminação com Produtos Perigosos</SubTitle>
      <SectionTable>
        {maRow("É disponibilizado o Plano de Atendimento a Emergências - PAE", "contaminacao_produtos_perigosos", "plano_atendimento_emergencias")}
        {maRow("São disponibilizadas as FISPQ's dos produtos químicos", "contaminacao_produtos_perigosos", "fispqs_disponiveis")}
        {maRow("Os funcionários que manuseiam produtos químicos são treinados nas FISPQ's", "contaminacao_produtos_perigosos", "funcionarios_treinados_fispqs")}
        {maRow("São mantidos kit's de emergência caso ocorra acidente ambiental", "contaminacao_produtos_perigosos", "kits_emergencia")}
      </SectionTable>

      <SubTitle>Considerações Gerais</SubTitle>
      <SectionTable>
        {maRow("Foi solicitada a Autorização de Supressão de Vegetação junto ao órgão ambiental caso haja necessidade de desmatamento", "consideracoes_gerais", "autorizacao_supressao_vegetacao")}
        {maRow("A vegetação remanescente na usina e seu entorno é mantida sem interferência, sendo verificado se há interferência negativa com a fauna na usina e seu entorno.", "consideracoes_gerais", "vegetacao_remanescente")}
        {maRow("São frequentemente verificadas as estruturas de contenção (bacias de contenção, canaletas de drenagem, etc.) a fim de mantê-las desobstruídas.", "consideracoes_gerais", "estruturas_contencao")}
        {maRow("As captações superficiais possuem outorga de direito de uso de recursos hídricos, verificando o atendimento às condicionantes da outorga.", "consideracoes_gerais", "outorga_captacao")}
        {maRow("São realizados DDSMA (Diálogo Diário de Segurança e Meio Ambiente) a respeito de meio ambiente.", "consideracoes_gerais", "ddsma")}
        {maRow("Foram elaboradas as Análises Preliminares de Riscos abordando os aspectos e impactos ambientais da usina.", "consideracoes_gerais", "apr_aspectos_ambientais")}
        {maRow("Existe captação de chuvas?", "consideracoes_gerais", "captacao_chuvas")}
        {maRow("Existe plano de gerenciamento de resíduos?", "consideracoes_gerais", "plano_gerenciamento_residuos")}
      </SectionTable>
    </>
  );
}