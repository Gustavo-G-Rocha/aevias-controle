export const CAMPOS_ENSAIOS = {
  EnsaioCAUQ: [
    { key: "data_ensaio", label: "Data" },
    { key: "laboratorista_name", label: "Laboratorista" },
    { key: "rodovia", label: "Rodovia" },
    { key: "usina_fornecedora", label: "Usina" },
    { key: "project_name", label: "Projeto" },
    { key: "extracao_ligante.teor_ligante", label: "Teor Ligante (%)" },
    { key: "extracao_ligante.teor_ligante_real", label: "Teor Ligante Real (%)" },
    { key: "granulometria", label: "Granulometria (% passante)", subfields: [
      { key: "peneira_75_0mm", label: 'Nº 3"', astm: 'Nº 3"' },
      { key: "peneira_63_0mm", label: 'Nº 2½"', astm: 'Nº 2½"' },
      { key: "peneira_50_0mm", label: 'Nº 2"', astm: 'Nº 2"' },
      { key: "peneira_37_5mm", label: 'Nº 1½"', astm: 'Nº 1½"' },
      { key: "peneira_25_0mm", label: 'Nº 1"', astm: 'Nº 1"' },
      { key: "peneira_19_0mm", label: 'Nº ¾"', astm: 'Nº ¾"' },
      { key: "peneira_16_0mm", label: 'Nº ⅝"', astm: 'Nº ⅝"' },
      { key: "peneira_12_5mm", label: 'Nº ½"', astm: 'Nº ½"' },
      { key: "peneira_9_5mm", label: 'Nº ⅜"', astm: 'Nº ⅜"' },
      { key: "peneira_4_75mm", label: "Nº 4", astm: "Nº 4" },
      { key: "peneira_2_36mm", label: "Nº 8", astm: "Nº 8" },
      { key: "peneira_2_0mm", label: "Nº 10", astm: "Nº 10" },
      { key: "peneira_1_18mm", label: "Nº 16", astm: "Nº 16" },
      { key: "peneira_0_6mm", label: "Nº 30", astm: "Nº 30" },
      { key: "peneira_0_42mm", label: "Nº 40", astm: "Nº 40" },
      { key: "peneira_0_3mm", label: "Nº 50", astm: "Nº 50" },
      { key: "peneira_0_18mm", label: "Nº 80", astm: "Nº 80" },
      { key: "peneira_0_15mm", label: "Nº 100", astm: "Nº 100" },
      { key: "peneira_0_075mm", label: "Nº 200", astm: "Nº 200" }
    ]},
    { key: "corpos_prova_marshall", label: "Parâmetros Marshall", subfields: [
      { key: "densidade_aparente", label: "Densidade Aparente (g/cm³)" },
      { key: "volume_vazios", label: "Volume Vazios (%)" },
      { key: "vam", label: "VAM (%)" },
      { key: "rbv", label: "RBV (%)" },
      { key: "rtcd_valor", label: "RTCD (MPa)" },
      { key: "estabilidade_corrigida", label: "Estabilidade (Kgf/cm²)" },
      { key: "fluencia", label: "Fluência (mm)" }
    ]},
    { key: "densidade_rice.densidade_rice", label: "RICE - Densidade (g/cm³)" },
    { key: "approved", label: "Status Aprovação" }
  ],
  EnsaioSondagem: [
    { key: "data", label: "Data Ensaio" },
    { key: "project_name", label: "Projeto" },
    { key: "usina_fornecedora", label: "Usina" },
    { key: "dens_aparente_projeto", label: "Dens. Aparente Projeto (g/cm³)" },
    { key: "corpos_prova", label: "Corpos de Prova", subfields: [
      { key: "data_execucao", label: "Data Execução CP" },
      { key: "estaca", label: "Estaca" },
      { key: "lado", label: "Lado" },
      { key: "media_espessura", label: "Espessura Média (cm)" },
      { key: "densidade", label: "Dens. Aparente CP (g/cm³)" },
      { key: "dens_rice_do_dia", label: "Dens. RICE do Dia (g/cm³)" },
      { key: "gc_dens_projeto", label: "GC Dens. Projeto (%)" },
      { key: "gc_dens_rice_dia", label: "GC RICE do Dia (%)" },
      { key: "rtcd_25c", label: "RTCD (MPa)" }
    ]},
    { key: "approved", label: "Status Aprovação" }
  ],
  EnsaioDensidadeInSitu: [
    { key: "data_ensaio", label: "Data" },
    { key: "camada", label: "Camada" },
    { key: "material", label: "Material" },
    { key: "furos", label: "Dados do Furo", subfields: [
      { key: "estaca", label: "Estaca" },
      { key: "densidade_seca_solo", label: "Densidade Seca Solo (g/cm³)" },
      { key: "umidade", label: "Umidade (%)" }
    ]},
    { key: "dados_proctor.densidade_seca_max", label: "Densidade Seca Max Proctor (g/cm³)" },
    { key: "dados_proctor.umidade_otima", label: "Umidade Ótima Proctor (%)" },
    { key: "furos_variacao", label: "Dados do Furo Final", subfields: [
      { key: "desvio_umidade", label: "Variação Umidade (%)" },
      { key: "grau_compactacao", label: "Grau Compactação (%)" }
    ]}
  ],
  EnsaioTaxaPinturaImprimacao: [
    { key: "data_ensaio", label: "Data" },
    { key: "tipo_servico", label: "Serviço" },
    { key: "ensaios", label: "Dados do Ensaio", subfields: [
      { key: "camada", label: "Camada" },
      { key: "material_camada", label: "Material" },
      { key: "estaca", label: "Estaca" },
      { key: "taxa_aplicada", label: "Taxa Aplicada (l/m²)" },
      { key: "taxa_residual", label: "Taxa Residual (l/m²)" },
      { key: "taxa_emulsao_aplicada", label: "Taxa Emulsão (l/m²)" },
      { key: "ensaio_residuo.data", label: "Data Ensaio Resíduo" },
      { key: "ensaio_residuo.residuo", label: "% Resíduo" }
    ]}
  ],
  EnsaioManchaPendulo: [
    { key: "laboratorista_name", label: "Laboratorista" },
    { key: "rodovia", label: "Rodovia" },
    { key: "trecho", label: "Trecho" },
    { key: "empreiteira", label: "Empreiteira" },
    { key: "camada", label: "Camada" },
    { key: "pista", label: "Pista" },
    { key: "orgao", label: "Orgão" },
    { key: "data_ensaio", label: "Data Ensaio" },
    { key: "data_aplicacao", label: "Data Aplicação" },
    { key: "media_hs", label: "Média HS (mm)" },
    { key: "classificacao_media_hs", label: "Classificação HS" },
    { key: "media_vrd", label: "Média VRD" },
    { key: "classificacao_media_vrd", label: "Classificação VRD" },
    { key: "condicao_conformidade", label: "Conformidade" }
  ],
  EnsaioMRAF: [
    { key: "data_ensaio", label: "Data" },
    { key: "laboratorista_name", label: "Laboratorista" },
    { key: "placa_caminhao", label: "Placa Usina/Caminhão" },
    { key: "rodovia", label: "Rodovia" },
    { key: "trecho", label: "Trecho" },
    { key: "faixa_especificada", label: "Faixa" },
    { key: "tipo_ligante", label: "Tipo Ligante" },
    { key: "extracao_ligante.teor_ligante", label: "Teor Ligante (%)" },
    { key: "extracao_ligante.umidade", label: "Umidade (%)" },
    { key: "extracao_ligante.residuo_emulsao", label: "Resíduo da Emulsão (%)" },
    { key: "granulometria", label: "Granulometria (% passante)", subfields: [
      { key: "peneira_75_0mm", label: 'Nº 3"', astm: 'Nº 3"' },
      { key: "peneira_63_0mm", label: 'Nº 2½"', astm: 'Nº 2½"' },
      { key: "peneira_50_0mm", label: 'Nº 2"', astm: 'Nº 2"' },
      { key: "peneira_37_5mm", label: 'Nº 1½"', astm: 'Nº 1½"' },
      { key: "peneira_25_0mm", label: 'Nº 1"', astm: 'Nº 1"' },
      { key: "peneira_19_0mm", label: 'Nº ¾"', astm: 'Nº ¾"' },
      { key: "peneira_16_0mm", label: 'Nº ⅝"', astm: 'Nº ⅝"' },
      { key: "peneira_12_5mm", label: 'Nº ½"', astm: 'Nº ½"' },
      { key: "peneira_9_5mm", label: 'Nº ⅜"', astm: 'Nº ⅜"' },
      { key: "peneira_4_75mm", label: "Nº 4", astm: "Nº 4" },
      { key: "peneira_2_36mm", label: "Nº 8", astm: "Nº 8" },
      { key: "peneira_2_0mm", label: "Nº 10", astm: "Nº 10" },
      { key: "peneira_1_18mm", label: "Nº 16", astm: "Nº 16" },
      { key: "peneira_0_6mm", label: "Nº 30", astm: "Nº 30" },
      { key: "peneira_0_42mm", label: "Nº 40", astm: "Nº 40" },
      { key: "peneira_0_3mm", label: "Nº 50", astm: "Nº 50" },
      { key: "peneira_0_18mm", label: "Nº 80", astm: "Nº 80" },
      { key: "peneira_0_15mm", label: "Nº 100", astm: "Nº 100" },
      { key: "peneira_0_075mm", label: "Nº 200", astm: "Nº 200" }
    ]},
    { key: "approved", label: "Status Aprovação" }
  ]
};