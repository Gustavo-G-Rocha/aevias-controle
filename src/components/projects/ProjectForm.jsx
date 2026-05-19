import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import AgregadosForm from "@/components/projects/AgregadosForm";
import ProjectFormBasicInfo from "@/components/projects/ProjectFormBasicInfo";
import ProjectFormSpecification from "@/components/projects/ProjectFormSpecification";
import ProjectFormCAUQ from "@/components/projects/ProjectFormCAUQ";
import ProjectFormMRAF from "@/components/projects/ProjectFormMRAF";
import ProjectFormConcrete from "@/components/projects/ProjectFormConcrete";
import ProjectFormGranular from "@/components/projects/ProjectFormGranular";
import ProjectFormUpload from "@/components/projects/ProjectFormUpload";
import { sanitizeProjectData } from "@/utils/dataSanitization";
import { filterRegionaisByAccessLevel } from "@/utils/regionalFilter";

// ========================================
// MAPEAMENTO FIXO E FINAL DE PENEIRAS DNIT/ASTM
// ========================================
const PENEIRAS_PADRAO = {
  75.0: { key: 'peneira_75_0mm', nome: '75.0 mm', astm: '3"' },
  63.0: { key: 'peneira_63_0mm', nome: '63.0 mm', astm: '2 1/2"' },
  50.0: { key: 'peneira_50_0mm', nome: '50.0 mm', astm: '2"' },
  37.5: { key: 'peneira_37_5mm', nome: '37.5 mm', astm: '1 1/2"' },
  25.0: { key: 'peneira_25_0mm', nome: '25.0 mm', astm: '1"' },
  19.0: { key: 'peneira_19_0mm', nome: '19.0 mm', astm: '3/4"' },
  16.0: { key: 'peneira_16_0mm', nome: '16.0 mm', astm: '5/8"' },
  12.5: { key: 'peneira_12_5mm', nome: '12.5 mm', astm: '1/2"' },
  9.5: { key: 'peneira_9_5mm', nome: '9.5 mm', astm: '3/8"' },
  6.3: { key: 'peneira_6_3mm', nome: '6.3 mm', astm: '1/4"' },
  4.75: { key: 'peneira_4_75mm', nome: '4.75 mm', astm: 'Nº 4' },
  2.36: { key: 'peneira_2_36mm', nome: '2.36 mm', astm: 'Nº 8' },
  2.0: { key: 'peneira_2_0mm', nome: '2.0 mm', astm: 'Nº 10' }, 
  1.18: { key: 'peneira_1_18mm', nome: '1.18 mm', astm: 'Nº 16' },
  0.6: { key: 'peneira_0_6mm', nome: '0.6 mm', astm: 'Nº 30' },
  0.42: { key: 'peneira_0_42mm', nome: '0.42 mm', astm: 'Nº 40' },
  0.3: { key: 'peneira_0_3mm', nome: '0.3 mm', astm: 'Nº 50' },
  0.18: { key: 'peneira_0_18mm', nome: '0.18 mm', astm: 'Nº 80' },
  0.15: { key: 'peneira_0_15mm', nome: '0.15 mm', astm: 'Nº 100' },
  0.075: { key: 'peneira_0_075mm', nome: '0.075 mm', astm: 'Nº 200' }
};

const extrairAberturaNumero = (aberturaString) => {
  const match = aberturaString.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : null;
};

const obterPeneiraPadrao = (aberturaString) => {
  const aberturaNum = extrairAberturaNumero(aberturaString);
  if (aberturaNum === null) return null;
  return PENEIRAS_PADRAO[aberturaNum];
};

export default function ProjectForm({ project, faixas, regionais, user, onSave, onCancel }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);

  const [formData, setFormData] = useState({
    tipo_projeto: "CAUQ",
    regional_id: "",
    name: "",
    client: "",
    location: "",
    description: "",
    faixa_granulometrica_id: "",
    equivalente_areia_minimo: "",
    agregados: [],
    ligante: { tipo: "", fornecedor: "", densidade: "" },
    emulsao_utilizada: "",
    temperaturas: {
      mistura: { min: "", max: "" },
      compactacao: { min: "", max: "" },
      espalhamento: { min: "", max: "" }
    },
    faixa_trabalho: {},
    faixa_trabalho_min: {},
    faixa_trabalho_max: {},
    teor_ligante: { min: "", max: "", otimo: "" },
    teor_ligante_residual: { min: "", max: "", otimo: "" },
    percentual_emulsao: "",
    taxa_aplicacao_mraf: { min: "", max: "", otimo: "" },
    densidade_mistura_mraf: "",
    massa_especifica_aparente: "",
    densidade_maxima_medida: "",
    volume_vazios: { min: "", max: "", otimo: "" },
    rtcd: { min: "" },
    estabilidade: { min: "", projeto: "" },
    fluencia: { min: "", max: "", projeto: "" },
    vam: { min: "", projeto: "" },
    rbv: { min: "", max: "", projeto: "" },
    carta_traco_concreto: {
      fck: "",
      slump_projeto: "",
      slump_minimo: "",
      slump_maximo: "",
      consumo_agua: "",
      tipo_aditivo: "",
      tipo_cimento: "",
      concreteira: ""
    },
    camadas_granulares: {
      melhorador_utilizado: "",
      umidade_otima: "",
      densidade_otima: "",
      resistencia_mpa: ""
    },
    status: "ativo",
  });

  const [peneirasDisponiveis, setPeneirasDisponiveis] = useState([]);
  
  const faixasFiltradas = React.useMemo(() => {
    if (!faixas) return [];
    return faixas.filter(f => {
      const tipoMatch = f.tipo === formData.tipo_projeto;
      const ativa = f.status === 'ativo';
      const isCurrentSelection = f.id === formData.faixa_granulometrica_id;
      return tipoMatch && (ativa || isCurrentSelection);
    });
  }, [faixas, formData.tipo_projeto, formData.faixa_granulometrica_id]);

  const faixaSelecionada = React.useMemo(() => {
    return faixasFiltradas?.find(f => f.id === formData.faixa_granulometrica_id);
  }, [faixasFiltradas, formData.faixa_granulometrica_id]);

  useEffect(() => {
    if (faixaSelecionada?.peneiras && Array.isArray(faixaSelecionada.peneiras)) {
      const peneiras = faixaSelecionada.peneiras
        .map(p => {
          const peneiraPadrao = obterPeneiraPadrao(p.abertura);
          if (!peneiraPadrao) return null;
          
          return {
            key: peneiraPadrao.key,
            nome: peneiraPadrao.nome,
            astm: peneiraPadrao.astm,
            especificacao_min: p.min,
            especificacao_max: p.max
          };
        })
        .filter(p => p !== null);
      
      setPeneirasDisponiveis(peneiras);
    } else {
      setPeneirasDisponiveis([]);
    }
  }, [faixaSelecionada]);

  // Filtrar regionais baseado no nível de acesso do usuário
  const regionaisFiltradas = React.useMemo(() => {
    return filterRegionaisByAccessLevel(regionais, user);
  }, [regionais, user]);

  useEffect(() => {
    if (project) {
      const isCartaTraco = project.tipo_projeto === 'CARTA_TRACO_CONCRETO' || project._isCartaTraco === true;
      
      const isCamadasGranularesEdit = project.tipo_projeto === "CAMADAS_GRANULARES";
      
      setFormData({
        tipo_projeto: project.tipo_projeto || "CAUQ",
        regional_id: project.regional_id || "",
        name: project.name || "",
        client: project.client || "",
        location: project.location || "",
        description: project.description || "",
        faixa_granulometrica_id: project.faixa_granulometrica_id || "",
        equivalente_areia_minimo: project.equivalente_areia_minimo || "",
        agregados: project.agregados || [],
        ligante: project.ligante || { tipo: "", fornecedor: "", densidade: "" },
        emulsao_utilizada: project.emulsao_utilizada || "",
        temperaturas: project.temperaturas || {
          mistura: { min: "", max: "" },
          compactacao: { min: "", max: "" },
          espalhamento: { min: "", max: "" }
        },
        faixa_trabalho: project.faixa_trabalho || {},
        faixa_trabalho_min: project.faixa_trabalho_min || {},
        faixa_trabalho_max: project.faixa_trabalho_max || {},
        teor_ligante: project.teor_ligante || { min: "", max: "", otimo: "" },
        teor_ligante_residual: project.teor_ligante_residual || { min: "", max: "", otimo: "" },
        percentual_emulsao: project.percentual_emulsao || "",
        taxa_aplicacao_mraf: project.taxa_aplicacao_mraf || { min: "", max: "", otimo: "" },
        densidade_mistura_mraf: project.densidade_mistura_mraf || "",
        massa_especifica_aparente: project.massa_especifica_aparente || "",
        densidade_maxima_medida: project.densidade_maxima_medida || "",
        volume_vazios: project.volume_vazios || { min: "", max: "", otimo: "" },
        rtcd: project.rtcd || { min: "" },
        estabilidade: project.estabilidade || { min: "", projeto: "" },
        fluencia: project.fluencia || { min: "", max: "", projeto: "" },
        vam: project.vam || { min: "", projeto: "" },
        rbv: project.rbv || { min: "", max: "", projeto: "" },
        carta_traco_concreto: isCartaTraco ? {
          fck: project.fck || "",
          slump_projeto: project.slump_projeto || "",
          slump_minimo: project.slump_minimo || "",
          slump_maximo: project.slump_maximo || "",
          consumo_agua: project.consumo_agua || "",
          tipo_aditivo: project.tipo_aditivo || "",
          tipo_cimento: project.tipo_cimento || "",
          concreteira: project.concreteira || ""
        } : {
          fck: "",
          slump_projeto: "",
          slump_minimo: "",
          slump_maximo: "",
          consumo_agua: "",
          tipo_aditivo: "",
          tipo_cimento: "",
          concreteira: ""
        },
        camadas_granulares: isCamadasGranularesEdit ? {
          melhorador_utilizado: project.melhorador_utilizado || "",
          umidade_otima: project.umidade_otima || "",
          densidade_otima: project.densidade_otima || "",
          resistencia_mpa: project.resistencia_mpa || ""
        } : {
          melhorador_utilizado: "",
          umidade_otima: "",
          densidade_otima: "",
          resistencia_mpa: ""
        },
        status: project.status || "ativo",
      });
    }
  }, [project]);



  // Limpa a faixa SOMENTE quando o usuário muda manualmente o tipo do projeto
  const handleTipoProjeto = (value) => {
    setFormData(prev => ({ ...prev, tipo_projeto: value, faixa_granulometrica_id: "" }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handleNestedInputChange = (group, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value === '' ? '' : parseFloat(value),
      },
    }));
  };

  const handleDeepNestedInputChange = (group, subgroup, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [subgroup]: {
          ...prev[group][subgroup],
          [field]: value === '' ? '' : parseFloat(value),
        },
      },
    }));
  };

  const handleCartaTracoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      carta_traco_concreto: {
        ...prev.carta_traco_concreto,
        [field]: value === '' ? '' : (field === 'tipo_aditivo' || field === 'tipo_cimento' || field === 'concreteira' ? value : parseFloat(value)),
      },
    }));
  };

  const handleCamadasGranularesChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      camadas_granulares: {
        ...prev.camadas_granulares,
        [field]: value === '' ? '' : (field === 'melhorador_utilizado' ? value : parseFloat(value)),
      },
    }));
  };

  const adicionarAgregado = () => {
    setFormData(prev => ({
      ...prev,
      agregados: [...prev.agregados, {
        nome: "",
        pedreira: "",
        percentual_mistura: "",
        granulometria: {}
      }]
    }));
  };

  const removerAgregado = (index) => {
    setFormData(prev => ({
      ...prev,
      agregados: prev.agregados.filter((_, i) => i !== index)
    }));
  };

  const handleAgregadoChange = (index, field, value) => {
    setFormData(prev => {
      const newAgregados = [...prev.agregados];
      if (field === 'percentual_mistura') {
        newAgregados[index][field] = value === '' ? '' : parseFloat(value);
      } else {
        newAgregados[index][field] = value;
      }
      return { ...prev, agregados: newAgregados };
    });
  };

  const handleAgregadoGranChange = (agregadoIndex, peneiraKey, value) => {
    setFormData(prev => {
      const newAgregados = [...prev.agregados];
      if (!newAgregados[agregadoIndex].granulometria) {
        newAgregados[agregadoIndex].granulometria = {};
      }
      newAgregados[agregadoIndex].granulometria = {
        ...newAgregados[agregadoIndex].granulometria,
        [peneiraKey]: value === '' ? '' : parseFloat(value)
      };
      return { ...prev, agregados: newAgregados };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar se tem tipo de projeto, faixa e regional selecionados
    if (!formData.tipo_projeto || !formData.faixa_granulometrica_id || !formData.regional_id) {
      setExtractionError('Por favor, selecione o tipo de projeto, faixa granulométrica e regional antes de fazer upload.');
      return;
    }

    // Validar tamanho do arquivo (máximo 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setExtractionError('O arquivo é muito grande. Tamanho máximo: 50MB');
      return;
    }

    setIsExtracting(true);
    setExtractionError(null);

    try {
      // Upload do arquivo
      console.log('📤 Fazendo upload do arquivo...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('✅ Arquivo enviado:', file_url);

      setUploadedFile(file_url);

      // Chamar função de extração
      console.log('🤖 Extraindo dados do projeto...');
      const response = await base44.functions.invoke('extrairDadosProjeto', {
        file_url,
        tipo_projeto: formData.tipo_projeto,
        faixa_id: formData.faixa_granulometrica_id,
        regional_id: formData.regional_id
      });

      console.log('✅ Dados extraídos:', response);

      if (response.success && response.dados) {
        // Preencher o formulário com os dados extraídos
        setFormData(prev => ({
          ...prev,
          ...response.dados,
          // Manter os campos já selecionados
          tipo_projeto: prev.tipo_projeto,
          regional_id: prev.regional_id,
          faixa_granulometrica_id: prev.faixa_granulometrica_id
        }));

        alert('✅ Dados extraídos com sucesso! Revise os campos antes de salvar.');
      } else {
        throw new Error('Falha ao extrair dados do arquivo');
      }

    } catch (error) {
      console.error('❌ Erro ao processar arquivo:', error);
      setExtractionError(error.message || 'Erro ao extrair dados do arquivo');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = sanitizeProjectData(formData, formData.tipo_projeto);
    console.log('📤 Salvando projeto:', dataToSave);
    onSave(dataToSave);
  };

  const peneirasCarregadas = peneirasDisponiveis.length > 0;
  const isCauq = formData.tipo_projeto === "CAUQ";
  const isMraf = formData.tipo_projeto === "MRAF";
  const isBgs = formData.tipo_projeto === "BGS";
  const isCartaTraco = formData.tipo_projeto === "CARTA_TRACO_CONCRETO";
  const isCamadasGranulares = formData.tipo_projeto === "CAMADAS_GRANULARES";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      <ProjectFormBasicInfo
        formData={formData}
        regionaisFiltradas={regionaisFiltradas}
        project={project}
        onTipoProjetoChange={handleTipoProjeto}
        onInputChange={handleInputChange}
      />

      <ProjectFormUpload
        formData={formData}
        isExtracting={isExtracting}
        uploadedFile={uploadedFile}
        extractionError={extractionError}
        onFileUpload={setUploadedFile}
        onExtractionError={setExtractionError}
        onExtractionStart={() => setIsExtracting(true)}
        onExtractionEnd={() => setIsExtracting(false)}
        project={project}
        onFormDataUpdate={(dados) => setFormData(prev => ({ ...prev, ...dados }))}
      />

      <ProjectFormConcrete
        formData={formData}
        tipoProjetoAtual={formData.tipo_projeto}
        onInputChange={handleInputChange}
      />

      {!isCartaTraco && (
        <>
          <ProjectFormSpecification
            formData={formData}
            faixasFiltradas={faixasFiltradas}
            faixaSelecionada={faixaSelecionada}
            peneirasCarregadas={peneirasCarregadas}
            peneirasDisponiveis={peneirasDisponiveis}
            onFaixaChange={(value) => handleInputChange('faixa_granulometrica_id', value)}
            onEquivalenteChange={(value) => handleInputChange("equivalente_areia_minimo", value)}
          />

          {!isCartaTraco && isCauq && (
              <ProjectFormCAUQ
                formData={formData}
                peneirasCarregadas={peneirasCarregadas}
                peneirasDisponiveis={peneirasDisponiveis}
                agregados={formData.agregados}
                onLiganteChange={(field, value) => setFormData(prev => ({
                  ...prev,
                  ligante: { ...prev.ligante, [field]: field === 'densidade' && value !== '' ? parseFloat(value) : value }
                }))}
                onAgregadoAdd={adicionarAgregado}
                onAgregadoRemove={removerAgregado}
                onAgregadoChange={handleAgregadoChange}
                onAgregadoGranChange={handleAgregadoGranChange}
                onFaixaTrabalhoChange={(key, type, value) => {
                  const faixaType = `faixa_trabalho${type === 'min' ? '_min' : type === 'max' ? '_max' : ''}`;
                  setFormData(prev => ({
                    ...prev,
                    [faixaType]: { ...prev[faixaType], [key]: value === '' ? '' : parseFloat(value) }
                  }));
                }}
                onTemperaturaChange={(group, field, value) => handleDeepNestedInputChange('temperaturas', group, field, value)}
                onNestedChange={handleNestedInputChange}
                onInputChange={handleInputChange}
              />
              )}

              {!isCartaTraco && isMraf && (
              <ProjectFormMRAF
                formData={formData}
                peneirasCarregadas={peneirasCarregadas}
                peneirasDisponiveis={peneirasDisponiveis}
                agregados={formData.agregados}
                onFaixaTrabalhoChange={(key, type, value) => {
                  const faixaType = `faixa_trabalho${type === 'min' ? '_min' : type === 'max' ? '_max' : ''}`;
                  setFormData(prev => ({
                    ...prev,
                    [faixaType]: { ...prev[faixaType], [key]: value === '' ? '' : parseFloat(value) }
                  }));
                }}
                onInputChange={handleInputChange}
                onNestedChange={handleNestedInputChange}
                onAgregadoAdd={adicionarAgregado}
                onAgregadoRemove={removerAgregado}
                onAgregadoChange={handleAgregadoChange}
                onAgregadoGranChange={handleAgregadoGranChange}
              />
              )}

              {!isCartaTraco && isBgs && (
              <Card className="bg-slate-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-500" />
                    <CardTitle className="text-lg">
                      Projeto {formData.tipo_projeto} - Configuração Simplificada
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 mb-4">
                    Para projetos do tipo <strong>{formData.tipo_projeto}</strong>, os parâmetros técnicos específicos podem ser configurados conforme necessário. 
                    O sistema já está preparado com a especificação granulométrica e o limite de equivalente de areia.
                  </p>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle className="text-base">Agregados (Opcional)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-slate-600">
                          Adicione agregados se necessário para este projeto.
                        </p>
                        <Button type="button" onClick={adicionarAgregado} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Agregado
                        </Button>
                      </div>

                      {formData.agregados.length > 0 ? (
                        <div className="space-y-4">
                          {formData.agregados.map((agregado, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-slate-50">
                              <div className="flex justify-between items-center mb-3">
                                <h5 className="font-semibold text-sm">Agregado {index + 1}</h5>
                                <Button
                                  type="button"
                                  onClick={() => removerAgregado(index)}
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Nome/Tipo</Label>
                                  <Input
                                    value={agregado.nome}
                                    onChange={(e) => handleAgregadoChange(index, 'nome', e.target.value)}
                                    placeholder="Ex: Areia natural"
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <Label className="text-xs">Pedreira</Label>
                                  <Input
                                    value={agregado.pedreira}
                                    onChange={(e) => handleAgregadoChange(index, 'pedreira', e.target.value)}
                                    placeholder="Ex: Pedreira Central"
                                    className="text-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-slate-400 py-8 italic text-sm">
                          Nenhum agregado adicionado ainda.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
              )}

              {!isCartaTraco && isCamadasGranulares && (
              <ProjectFormGranular
                formData={formData}
                peneirasCarregadas={peneirasCarregadas}
                peneirasDisponiveis={peneirasDisponiveis}
                faixasFiltradas={faixasFiltradas}
                faixaSelecionada={faixaSelecionada}
                agregados={formData.agregados}
                onFaixaChange={(value) => handleInputChange('faixa_granulometrica_id', value)}
                onAgregadoAdd={adicionarAgregado}
                onAgregadoRemove={removerAgregado}
                onAgregadoChange={handleAgregadoChange}
                onAgregadoGranChange={handleAgregadoGranChange}
                onInputChange={handleInputChange}
                onCamadasGranularesChange={handleCamadasGranularesChange}
              />
              )}


        </>
      )}

      <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white border-t p-4 -mx-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Salvar Projeto
        </Button>
      </div>
    </form>
  );
}