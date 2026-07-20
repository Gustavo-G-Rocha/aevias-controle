/**
 * Mapper para RelatorioControleExecucaoServicos.
 * Transforma Data Models (entidade bruta + dados relacionados) em
 * Presentation Model (formato pronto para exibição no JSX).
 */

import { formatDate, buildSignatureProps } from './relatorioUtils';

const display = (value, fallback = 'N/A') =>
  value === null || value === undefined || value === '' ? fallback : value;

/**
 * Transforma um serviço bruto em row de apresentação da tabela.
 */
export const mapServicoToRow = (servico) => ({
  servico: display(servico?.servico, ''),
  estaca_inicial: display(servico?.estaca_inicial, ''),
  estaca_final: display(servico?.estaca_final, ''),
  comprimento_m: display(servico?.comprimento_m, ''),
  espessura_cm: display(servico?.espessura_cm, ''),
  largura_m: display(servico?.largura_m, ''),
  quantidade: display(servico?.quantidade, ''),
  executora: display(servico?.executora, ''),
});

/**
 * Transforma os dados brutos em Presentation Model do relatório.
 * @param {Object} params - { registro, obra, regional }
 */
export const mapControleToPresentation = ({ registro, obra, regional }) => {
  if (!registro) return null;

  return {
    cliente: display(regional?.cliente),
    obra_nome: display(obra?.name),
    rodovia: display(registro.rodovia),
    trecho: display(registro.trecho),
    inspetor: display(registro.laboratorista_name),
    data: formatDate(registro.data),

    servicos: (registro.servicos || []).map(mapServicoToRow),

    observacoes_gerais: display(registro.observacoes_gerais, '—'),

    logo_url: regional?.logo_url ||
      'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a58d6328b_AE-LogoVerPrincipal_1.png',

    signatureProps: buildSignatureProps(registro, 'Inspetor'),
  };
};