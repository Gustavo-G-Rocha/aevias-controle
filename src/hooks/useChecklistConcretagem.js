import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Project } from "@/entities/Project";
import { useFormPersistence } from "@/components/hooks/useFormPersistence";
import { createPageUrl } from "@/utils";

export const getInitialFormData = () => ({
  obra_id: "",
  project_id: "",
  data: new Date().toISOString().split("T")[0],
  jornada: { horario_inicio: "", horario_fim: "" },
  concreteira: "",
  rodovia: "",
  trecho: "",
  fck: "",
  volume: "",
  inspetor_campo: "",
  laboratorista_name: "",
  empreiteira: "",
  estrutura: "",
  ensaio_realizado_por: "Afirma Evias",
  periodos_clima: [
    { periodo: "manha", temperatura_ambiente: "", condicoes_climaticas: "bom" },
    { periodo: "tarde", temperatura_ambiente: "", condicoes_climaticas: "bom" },
    { periodo: "noite", temperatura_ambiente: "", condicoes_climaticas: "bom" },
  ],
  cargas_concreto: [
    {
      numero_carga: 1,
      nota_fiscal: "",
      placa_betoneira: "",
      slump_test: { realizado: false, resultado: null, limite: "", conforme: null },
      espessura_camada: { realizado: false, resultado: null, limite: "", conforme: null },
      equipamento_lancamento: "",
      superficie_tratada_limpa: null,
      adensamento_realizado: null,
      observacoes_lancamento: "",
      moldado_fiscalizacao: false,
      corpos_prova: [],
    },
  ],
  observacoes_gerais: "",
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: "",
  nao_conformidades: [],
  fotos: [],
  status: "rascunho",
});

export function useChecklistConcretagem() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [obras, setObras] = useState([]);
  const [projects, setProjects] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [regionais, setRegionais] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());

  const { clearSavedData } = useFormPersistence("checklist_concretagem", formData, setFormData, !!editingChecklist);

  const projectsRef = useRef(projects);
  useEffect(() => { projectsRef.current = projects; }, [projects]);

  // Auto-fill from project when project_id changes
  useEffect(() => {
    if (!formData.project_id) return;
    const selectedProject = projectsRef.current.find(p => p.id === formData.project_id);
    if (!selectedProject) return;
    setFormData(prev => ({
      ...prev,
      concreteira: prev.concreteira || selectedProject.concreteira || "",
      fck: prev.fck || (selectedProject.fck ? selectedProject.fck.toString() : ""),
      cargas_concreto: prev.cargas_concreto.map(carga => {
        const slumpLimite = selectedProject.slump_minimo && selectedProject.slump_maximo
          ? `${selectedProject.slump_minimo} a ${selectedProject.slump_maximo} cm`
          : "";
        return { ...carga, slump_test: { ...carga.slump_test, limite: slumpLimite } };
      }),
    }));
  }, [formData.project_id]);

  // Filter projects when obra changes
  useEffect(() => {
    if (!formData.obra_id || !obras.length || !allProjects.length || !regionais.length) return;

    const obraSelecionada = obras.find(o => o.id === formData.obra_id);
    if (!obraSelecionada?.regional_id) { setProjects([]); return; }

    const regional = regionais.find(r => r.id === obraSelecionada.regional_id);
    if (!regional) { setProjects([]); return; }

    const projectIdsSet = new Set(regional.project_ids || []);
    const projetosFiltrados = allProjects.filter(p =>
      p.tipo_projeto === "CARTA_TRACO_CONCRETO" && (projectIdsSet.has(p.id) || p.regional_id === regional.id)
    );
    setProjects(projetosFiltrados);

    if (formData.project_id && !editingChecklist) {
      const stillAvailable = projetosFiltrados.some(p => p.id === formData.project_id);
      if (!stillAvailable) setFormData(prev => ({ ...prev, project_id: "" }));
    }
  }, [formData.obra_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, obrasData, projectsData, regionaisData] = await Promise.all([
        base44.auth.me(),
        base44.entities.Obra.list(),
        Project.list(),
        base44.entities.Regional.list(),
      ]);

      setUser(userData);
      setRegionais(regionaisData);
      setAllProjects(projectsData);
      setProjects([]);

      const userAccessLevel = userData?.access_level || (userData?.role === "admin" ? "admin" : "user");

      if (userAccessLevel === "user") {
        const emailLower = userData.email.toLowerCase();
        const regionalDoLab = regionaisData.find(r =>
          (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
        );
        if (regionalDoLab) {
          setObras(obrasData.filter(o =>
            o.regional_id === regionalDoLab.id && o.status === "em_andamento" && o.tipo_obra === "supervisao"
          ));
        } else {
          setObras([]);
        }
      } else {
        setObras(obrasData.filter(o => o.status === "em_andamento" && o.tipo_obra === "supervisao"));
      }

      const params = new URLSearchParams(location.search);
      const editId = params.get("editId");

      if (editId) {
        const checklistToEdit = await base44.entities.ChecklistConcretagem.get(editId);
        if (userAccessLevel === "admin" || (checklistToEdit.created_by === userData.email && (checklistToEdit.status === "rascunho" || checklistToEdit.approved === false))) {
          setEditingChecklist(checklistToEdit);
          setFormData(checklistToEdit);
        } else {
          alert("Você não tem permissão para editar este registro.");
          navigate(createPageUrl("MeusEnsaios"));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          inspetor_campo: userData.laboratorista_name || userData.full_name,
          laboratorista_name: userData.laboratorista_name || userData.full_name,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados iniciais.");
    } finally {
      setLoading(false);
    }
  }, [location.search, navigate]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  // --- Handlers de cargas ---
  const checkSlumpConformidade = useCallback((resultado, projectId) => {
    if (!projectId || resultado === null || resultado === "" || resultado === undefined) return null;
    const project = projects.find(p => p.id === projectId);
    if (!project || project.slump_minimo === null || project.slump_maximo === null) return null;
    const num = parseFloat(resultado);
    return isNaN(num) ? null : num >= project.slump_minimo && num <= project.slump_maximo;
  }, [projects]);

  const adicionarCarga = useCallback(() => {
    if (formData.cargas_concreto.length >= 10) return;
    const selectedProject = projects.find(p => p.id === formData.project_id);
    const slumpLimite = selectedProject?.slump_minimo != null && selectedProject?.slump_maximo != null
      ? `${selectedProject.slump_minimo} a ${selectedProject.slump_maximo} cm`
      : "";
    setFormData(prev => ({
      ...prev,
      cargas_concreto: [...prev.cargas_concreto, {
        numero_carga: prev.cargas_concreto.length + 1,
        nota_fiscal: "", placa_betoneira: "",
        slump_test: { realizado: false, resultado: null, limite: slumpLimite, conforme: null },
        espessura_camada: { realizado: false, resultado: null, limite: "", conforme: null },
        equipamento_lancamento: "", superficie_tratada_limpa: null, adensamento_realizado: null,
        observacoes_lancamento: "", moldado_fiscalizacao: false, corpos_prova: [],
      }],
    }));
  }, [formData.cargas_concreto.length, formData.project_id, projects]);

  const removerCarga = useCallback((index) => {
    if (formData.cargas_concreto.length <= 1) return;
    setFormData(prev => ({ ...prev, cargas_concreto: prev.cargas_concreto.filter((_, i) => i !== index) }));
  }, [formData.cargas_concreto.length]);

  const handleCargaChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newCargas = [...prev.cargas_concreto];
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        newCargas[index] = { ...newCargas[index], [parent]: { ...newCargas[index][parent], [child]: value } };
        if (parent === "slump_test" && child === "resultado") {
          newCargas[index].slump_test.conforme = checkSlumpConformidade(value, prev.project_id);
        }
      } else {
        newCargas[index] = { ...newCargas[index], [field]: value };
      }
      return { ...prev, cargas_concreto: newCargas };
    });
  }, [checkSlumpConformidade]);

  const handleCPConfigChange = useCallback((cargaIndex, diasRuptura, field, value) => {
    setFormData(prev => {
      const newCargas = [...prev.cargas_concreto];
      const carga = { ...newCargas[cargaIndex], corpos_prova: [...(newCargas[cargaIndex].corpos_prova || [])] };
      const cpsExistentes = carga.corpos_prova.filter(cp => cp.dias_ruptura === diasRuptura);

      if (field === "quantidade") {
        const nova = parseInt(value) || 0;
        const atual = cpsExistentes.length;
        if (nova > atual) {
          const tipo = cpsExistentes[0]?.tipo_ruptura || "compressao_axial";
          for (let i = 0; i < nova - atual; i++) carga.corpos_prova.push({ dias_ruptura: diasRuptura, tipo_ruptura: tipo });
        } else if (nova < atual) {
          let rem = atual - nova;
          carga.corpos_prova = carga.corpos_prova.filter(cp => {
            if (cp.dias_ruptura === diasRuptura && rem > 0) { rem--; return false; }
            return true;
          });
        }
      } else if (field === "tipo_ruptura") {
        carga.corpos_prova = carga.corpos_prova.map(cp =>
          cp.dias_ruptura === diasRuptura ? { ...cp, tipo_ruptura: value } : cp
        );
      }
      newCargas[cargaIndex] = carga;
      return { ...prev, cargas_concreto: newCargas };
    });
  }, []);

  const getQuantidadeCPs = useCallback((cargaIndex, diasRuptura) => {
    return (formData.cargas_concreto[cargaIndex]?.corpos_prova || []).filter(cp => cp.dias_ruptura === diasRuptura).length;
  }, [formData.cargas_concreto]);

  const getTipoRupturaCPs = useCallback((cargaIndex, diasRuptura) => {
    const cp = (formData.cargas_concreto[cargaIndex]?.corpos_prova || []).find(cp => cp.dias_ruptura === diasRuptura);
    return cp?.tipo_ruptura || "compressao_axial";
  }, [formData.cargas_concreto]);

  // --- Upload de fotos ---
  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) { setSelectedFileNames("Nenhum ficheiro selecionado"); return; }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) { alert(`Tipo não suportado: ${file.type}`); e.target.value = ""; return; }
      if (file.size > 50 * 1024 * 1024) { alert(`Arquivo muito grande: ${(file.size / 1024 / 1024).toFixed(2)}MB`); e.target.value = ""; return; }
    }

    setUploadingPhotos(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);
    const results = await Promise.all(files.map(file => base44.integrations.Core.UploadFile({ file })));
    setFormData(prev => ({ ...prev, fotos: [...prev.fotos, ...results.map(r => r.file_url)] }));
    setUploadingPhotos(false);
    e.target.value = "";
  }, []);

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  }, []);

  // --- Submissão ---
  const handleSubmit = useCallback(async (e, saveStatus = "finalizado") => {
    e.preventDefault();
    setSaving(true);

    if (!formData.obra_id) { alert("Por favor, selecione uma obra."); setSaving(false); return; }

    if (saveStatus === "finalizado") {
      const requiredFields = [
        [!formData.project_id?.trim(), "selecione a Carta Traço de Concreto"],
        [!formData.concreteira?.trim(), "preencha o campo Concreteira"],
        [!formData.empreiteira?.trim(), "preencha o campo Empreiteira"],
        [!formData.rodovia?.trim(), "preencha o campo Rodovia"],
        [!formData.trecho?.trim(), "preencha o campo Trecho"],
        [!formData.volume, "preencha o campo Volume (m³)"],
        [!formData.fck, "preencha o campo Fck (MPa)"],
        [!formData.estrutura?.trim(), "preencha o campo Estrutura"],
        [!formData.inspetor_campo?.trim(), "preencha o campo Inspetor Campo"],
        [formData.acoes_corretivas_realizado === true && !formData.acoes_corretivas_descricao?.trim(), "descreva as ações corretivas"],
      ];
      for (const [cond, msg] of requiredFields) {
        if (cond) { alert(`Por favor, ${msg}.`); setSaving(false); return; }
      }
      for (const p of formData.periodos_clima) {
        if (!p.temperatura_ambiente) {
          alert(`Preencha a temperatura do período ${p.periodo}.`);
          setSaving(false); return;
        }
      }
      for (const c of formData.cargas_concreto) {
        if (c.moldado_fiscalizacao && (!c.corpos_prova || c.corpos_prova.length === 0)) {
          alert(`Configure ao menos 1 corpo de prova para a Carga ${c.numero_carga}.`);
          setSaving(false); return;
        }
      }
    }

    const dataToSave = {
      ...formData,
      status: saveStatus,
      fck: formData.fck ? parseFloat(formData.fck) : null,
      volume: formData.volume ? parseFloat(formData.volume) : null,
      periodos_clima: formData.periodos_clima.map(p => ({ ...p, temperatura_ambiente: p.temperatura_ambiente ? parseFloat(p.temperatura_ambiente) : null })),
      cargas_concreto: formData.cargas_concreto.map(c => ({
        ...c,
        slump_test: { ...c.slump_test, resultado: c.slump_test.resultado !== null && c.slump_test.resultado !== "" ? parseFloat(c.slump_test.resultado) : null },
        espessura_camada: { ...c.espessura_camada, resultado: c.espessura_camada.resultado !== null && c.espessura_camada.resultado !== "" ? parseFloat(c.espessura_camada.resultado) : null },
        corpos_prova: c.corpos_prova.map(cp => ({ ...cp, dias_ruptura: cp.dias_ruptura != null ? parseInt(cp.dias_ruptura) : null })),
      })),
    };

    try {
      if (editingChecklist?.id) {
        const updateData = { ...dataToSave };
        if (editingChecklist.approved === false && saveStatus === "finalizado") {
          Object.assign(updateData, { approved: null, rejection_reason: null, approved_by: null, approved_date: null, was_rejected: true });
        }
        await base44.entities.ChecklistConcretagem.update(editingChecklist.id, updateData);
        alert(saveStatus === "rascunho" ? "Progresso salvo!" : "Checklist atualizado com sucesso!");
      } else {
        await base44.entities.ChecklistConcretagem.create(dataToSave);
        alert(saveStatus === "rascunho" ? "Progresso salvo!" : "Checklist criado com sucesso!");
      }
      clearSavedData();
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      console.error("Erro ao salvar checklist:", error);
      alert(`Erro ao salvar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }, [formData, editingChecklist, clearSavedData, navigate]);

  const handleCancel = useCallback(() => {
    clearSavedData();
    navigate(createPageUrl("MeusEnsaios"));
  }, [clearSavedData, navigate]);

  return {
    loading, saving, user, obras, projects, regionais,
    uploadingPhotos, selectedFileNames, editingChecklist,
    formData, setFormData,
    adicionarCarga, removerCarga, handleCargaChange, handleCPConfigChange,
    getQuantidadeCPs, getTipoRupturaCPs,
    handleFileChange, handleRemovePhoto, handleSubmit, handleCancel,
  };
}