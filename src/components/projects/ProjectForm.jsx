import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProjectFormBasicInfo from "@/components/projects/ProjectFormBasicInfo";
import ProjectFormSpecification from "@/components/projects/ProjectFormSpecification";
import ProjectFormCAUQ from "@/components/projects/ProjectFormCAUQ";
import ProjectFormMRAF from "@/components/projects/ProjectFormMRAF";
import ProjectFormConcrete from "@/components/projects/ProjectFormConcrete";
import ProjectFormGranular from "@/components/projects/ProjectFormGranular";
import ProjectFormUpload from "@/components/projects/ProjectFormUpload";
import ProjectFormBGS from "@/components/projects/ProjectFormBGS";
import { sanitizeProjectData } from "@/utils/dataSanitization";
import { filterRegionaisByAccessLevel } from "@/utils/regionalFilter";
import {
  INITIAL_FORM_DATA,
  mapProjectToFormData,
  mapPeneiraFaixaToDisponivel,
  resolveFaixaTrabalhoType,
} from "@/utils/projectFormUtils";

export default function ProjectForm({ project, faixas, regionais, user, onSave, onCancel }) {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);

  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });

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
        .map(mapPeneiraFaixaToDisponivel)
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
      setFormData(mapProjectToFormData(project));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = sanitizeProjectData(formData, formData.tipo_projeto);
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
                  const faixaType = resolveFaixaTrabalhoType(type);
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
                  const faixaType = resolveFaixaTrabalhoType(type);
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
              <ProjectFormBGS
                formData={formData}
                onAgregadoAdd={adicionarAgregado}
                onAgregadoRemove={removerAgregado}
                onAgregadoChange={handleAgregadoChange}
              />
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