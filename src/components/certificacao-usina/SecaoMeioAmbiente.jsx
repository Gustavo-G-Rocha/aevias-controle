import React from "react";
import ChecklistRow from "./ChecklistRow";
import SubSectionTitle from "./SubSectionTitle";

export default function SecaoMeioAmbiente({ formData, onNestedChange, disabled }) {
  const ma = formData.meio_ambiente || {};

  const row = (label, section, key, opcao1 = "Sim", opcao2 = "Não") => (
    <ChecklistRow
      key={key}
      label={label}
      path={`meio_ambiente.${section}.${key}`}
      value={(ma[section] || {})[key]}
      onChange={onNestedChange}
      disabled={disabled}
      opcao1={opcao1}
      opcao2={opcao2}
    />
  );

  return (
    <div className="space-y-2">
      <h3 className="font-bold text-foreground text-sm bg-muted px-3 py-2 rounded">
        6 - MEIO AMBIENTE
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border border-border rounded">
          <tbody>
            <SubSectionTitle>Ruídos</SubSectionTitle>
            {row("Estão sendo realizadas semestralmente a medição de ruídos conforme NBR 10.151/2019", "ruidos", "medicao_semestral_nbr10151")}
            {row("Estão sendo respeitados os horários e a intensidade de ruído conforme legislação municipal", "ruidos", "horarios_intensidade_municipio")}
            {row("Estão sendo feitas as manutenções periódicas das máquinas e equipamentos", "ruidos", "manutencao_maquinas")}

            <SubSectionTitle>Emissão atmosférica</SubSectionTitle>
            {row("É realizada a medição de poluentes na chaminé da usina com periodicidade semestral", "emissao_atmosferica", "medicao_poluentes_chamine")}
            {row("Estão sendo atendidos os valores especificados na resolução SEMA nº016/2014", "emissao_atmosferica", "resolucao_sema_016_2014")}
            {row("É realizado o monitoramento do índice de fumaça preta dos equipamentos que utilizam diesel", "emissao_atmosferica", "monitoramento_fumaca_preta")}
            {row("A usina possui filtro para material particulado", "emissao_atmosferica", "filtro_material_particulado")}
            {row("Existe meta de redução de carbono?", "emissao_atmosferica", "meta_reducao_carbono")}

            <SubSectionTitle>Efluentes Líquidos</SubSectionTitle>
            {row("Possui fossa séptica de acordo com a norma NBR 7229 em local onde não possui rede de esgoto", "efluentes_liquidos", "fossa_septica_nbr7229")}
            {row("É promovida a manutenção e limpeza por empresas licenciadas e especializadas das fossas sépticas", "efluentes_liquidos", "manutencao_fossas")}
            {row("O óleo lubrificante, já utilizado, é estocado em tambores, e acondicionados em local coberto, delimitado por bacias de contenção", "efluentes_liquidos", "oleo_lubrificante_tambores")}
            {row("O óleo usado é destinado única e exclusivamente a empresa recicladoras de óleo, devidamente licenciadas pelo órgão ambiental", "efluentes_liquidos", "oleo_recicladoras_licenciadas")}
            {row("Os efluentes lançados seguem as condições e padrões de lançamento de efluentes conforme Resolução CONAMA 357/05", "efluentes_liquidos", "efluentes_conama_357")}
            {row("A utilização e o armazenamento de substâncias combustíveis e oleosas são realizadas em locais adequados", "efluentes_liquidos", "armazenamento_combustiveis")}
            {row("Não existem sinais de vazamentos/transbordamentos das unidades de armazenamento e tratamento de efluentes", "efluentes_liquidos", "sem_sinais_vazamentos")}

            <SubSectionTitle>Resíduos Sólidos</SubSectionTitle>
            {row("São disponibilizados mecanismos de coleta seletiva", "residuos_solidos", "coleta_seletiva")}
            {row("O transporte de resíduos são realizados por empresas licenciadas", "residuos_solidos", "transporte_licenciado")}
            {row("A destinação final dos resíduos é realizada por empresa licenciada", "residuos_solidos", "destinacao_licenciada")}
            {row("As licenças do transporte e destinação dos resíduos são arquivadas", "residuos_solidos", "licencas_arquivadas")}
            {row("Estão sendo emitidas as MTR's dos resíduos transportados", "residuos_solidos", "mtr_emitidas")}

            <SubSectionTitle>Contaminação com produtos perigosos</SubSectionTitle>
            {row("É disponibilizado o Plano de Atendimento a Emergências - PAE", "contaminacao_produtos_perigosos", "plano_atendimento_emergencias")}
            {row("São disponibilizadas as FISPQ's dos produtos químicos", "contaminacao_produtos_perigosos", "fispqs_disponiveis")}
            {row("Os funcionários que manuseiam produtos químicos são treinados nas FISPQ's", "contaminacao_produtos_perigosos", "funcionarios_treinados_fispqs")}
            {row("São mantidos kit's de emergência caso ocorra acidente ambiental", "contaminacao_produtos_perigosos", "kits_emergencia")}

            <SubSectionTitle>Considerações gerais</SubSectionTitle>
            {row("Foi solicitada a Autorização de Supressão de Vegetação junto ao órgão ambiental caso haja necessidade de desmatamento", "consideracoes_gerais", "autorizacao_supressao_vegetacao")}
            {row("A vegetação remanescente na usina e seu entorno é mantida sem interferência, sendo verificado se há interferência negativa com a fauna na usina e seu entorno.", "consideracoes_gerais", "vegetacao_remanescente")}
            {row("São frequentemente verificadas as estruturas de contenção (bacias de contenção, canaletas de drenagem, etc.) a fim de mantê-las desobstruídas.", "consideracoes_gerais", "estruturas_contencao")}
            {row("As captações superficiais possuem outorga de direito de uso de recursos hídricos, verificando o atendimento às condicionantes da outorga.", "consideracoes_gerais", "outorga_captacao")}
            {row("Existe captação de chuvas?", "consideracoes_gerais", "captacao_chuvas")}
            {row("Existe plano de gerenciamento de resíduos?", "consideracoes_gerais", "plano_gerenciamento_residuos")}
            {row("São realizados DDSMA (Diálogo Diário de Segurança e Meio Ambiente) a respeito de meio ambiente.", "consideracoes_gerais", "ddsma")}
            {row("Foram elaboradas as Análises Preliminares de Riscos abordando os aspectos e impactos ambientais da usina.", "consideracoes_gerais", "apr_aspectos_ambientais")}
          </tbody>
        </table>
      </div>
    </div>
  );
}