import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { obterDiarioById, criarDiario, atualizarDiario } from "@/services/diarioObraService";
import { uploadMultipleFiles } from "@/utils/imageUpload";
import { createPageUrl } from "@/utils";
import { useCurrentUser, useAuxData } from "@/hooks/useQueryData";

import { toast } from "@/components/ui/use-toast";
export const getInitialFormData = () => ({
  obra_id: "",
  data: new Date().toISOString().split("T")[0],
  jornada: { horario_inicio: "", horario_fim: "" },
  tipo_local: "campo",
  usina_selecionada: "",
  rodovia: "",
  trecho: "",
  empreiteira: "",
  condicoes_climaticas: "ensolarado",
  temperatura: "",
  atividades_realizadas: "",
  observacoes: "",
  acoes_corretivas_realizado: null,
  acoes_corretivas_descricao: "",
  nao_conformidades: [],
  efetivo_obra_ativo: false,
  efetivo_maquinas: {
    motoniveladora: 0, pa_carregadeira: 0, retroescavadeira: 0, escavadeira_hidraulica: 0,
    mini_carregadeira: 0, extrusora: 0, caminhao_prancha: 0, caminhao_munck: 0,
    caminhao_sinalizacao: 0, caminhao_pipa: 0, caminhao_basculante: 0, caminhao_cimento: 0,
    caminhao_viga: 0, caminhao_espargidor: 0, recicladora: 0, vibro_acabadora: 0,
    rolo_carneiro: 0, rolo_liso: 0, rolo_pneu: 0, tanque_combustivel: 0, comboio: 0,
    onibus: 0, trator_grade: 0, trator_esteira: 0, veiculo_leve: 0, placa_vibratoria: 0,
  },
  efetivo_colaboradores: {
    encarregado: 0, greidista: 0, operadores: 0, motorista: 0, pedreiro: 0,
    armador: 0, carpinteiro: 0, ajudante: 0, topografo: 0, aux_topografia: 0,
    laboratorista: 0, aux_laboratorio: 0, spoter: 0, seguranca: 0, apontador: 0,
    pintor: 0, eletricista: 0,
  },
  fotos: [],
  cliente: "",
  approved: null,
  rejection_reason: null,
  created_by: "",
  checklist_veiculo_ativo: false,
  checklist_veiculo: {
    nome_condutor: "", tipo_veiculo: "passeio", veiculo: "", placa: "", empresa: "", hodometro: "", areas_afetadas: "",
    condicoes_gerais: { limpeza_externa: "bom", limpeza_interna: "bom", pneus: "bom", estepe: "bom", cacamba: "bom" },
    luzes_traseiras: {
      direita: { da_placa: "sim", luz: "sim", luz_re: "sim", luz_freio: "sim", seta: "sim" },
      esquerda: { luz: "sim", luz_re: "sim", luz_freio: "sim", seta: "sim" },
    },
    luzes_dianteiras: {
      direita: { farol_alto: "sim", farol_baixo: "sim", seta: "sim", neblina: "sim" },
      esquerda: { farol_alto: "sim", farol_baixo: "sim", seta: "sim", neblina: "sim" },
    },
    seguranca: {
      alarme: "sim", buzina: "sim", chave_roda: "sim", cintos: "sim", documentos: "sim",
      extintor: "sim", limpadores: "sim", macaco: "sim", painel: "sim",
      retrovisor_interno: "sim", retrovisor_direito: "sim", retrovisor_esquerdo: "sim",
      travas: "sim", triangulo: "sim",
    },
    motor: {
      acelerador: "sim", agua_limpador: "sim", agua_radiador: "sim", embreagem: "sim",
      freio: "sim", freio_mao: "sim", oleo_freio: "sim", oleo_moto: "sim", tanque_partida: "sim",
    },
    observacoes: "",
  },
});

export function useDiarioObra() {
  const navigate = useNavigate();
  const location = useLocation();

  const [editingDiarioOriginal, setEditingDiarioOriginal] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const { data: auxData, isLoading: loadingAux } = useAuxData({ needsRegionais: true });

  const regionais = auxData?.regionais ?? [];

  const obras = useMemo(() => {
    if (!auxData?.obras || !user) return [];
    const emailLower = user.email.toLowerCase();
    const regionaisDoUsuario = regionais
      .filter(r =>
        (r.laboratoristas_responsaveis || []).some(e => e.toLowerCase() === emailLower) ||
        (r.salas_tecnicas_responsaveis || []).some(e => e.toLowerCase() === emailLower)
      )
      .map(r => r.id);
    if (regionaisDoUsuario.length > 0) {
      const regionaisSet = new Set(regionaisDoUsuario);
      return auxData.obras.filter(o => regionaisSet.has(o.regional_id) && o.status === "em_andamento");
    } else if (user.role !== "admin") {
      return [];
    }
    return auxData.obras;
  }, [auxData?.obras, regionais, user]);

  const loading = loadingUser || loadingAux || editLoading;
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [selectedFileNames, setSelectedFileNames] = useState("Nenhum ficheiro selecionado");
  const [uploadProgress, setUploadProgress] = useState([]);

  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleFileChange = useCallback(async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    if (!files.length) { setSelectedFileNames("Nenhum ficheiro selecionado"); return; }

    setLoadingUpload(true);
    setSelectedFileNames(files.length === 1 ? files[0].name : `${files.length} ficheiros selecionados`);
    setUploadProgress(files.map((file, i) => ({ id: i, fileName: file.name, status: "pending", error: null })));

    const { urls, errors } = await uploadMultipleFiles(files, (i, status, err) => {
      setUploadProgress(prev => prev.map(p => p.id === i ? { ...p, status, error: err || null } : p));
    });

    if (urls.length > 0) setFormData(prev => ({ ...prev, fotos: [...(prev.fotos || []), ...urls] }));
    if (errors.length > 0) toast({ title: `${urls.length} de ${files.length} fotos enviadas.\n\nErros:\n` + errors.map(e => `• ${e.fileName}: ${e.error}`).join("\n"), variant: "destructive" });

    setLoadingUpload(false);
    setUploadProgress([]);
    e.target.value = "";
  }, []);

  const handleRemovePhoto = useCallback((index) => {
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter((_, i) => i !== index) }));
  }, []);

  const handleSubmit = useCallback(async (e, saveStatus = "finalizado") => {
    e.preventDefault();

    if (!formData.obra_id) { toast({ title: "Por favor, selecione uma obra.", variant: "destructive" }); return; }

    if (saveStatus === "finalizado") {
      if (!formData.data || !formData.jornada?.horario_inicio || !formData.jornada?.horario_fim) {
        toast({ title: "Preencha todos os campos de data e horários.", variant: "destructive" }); return;
      }
      const obraAtual = obras.find(o => o.id === formData.obra_id);
      if (formData.tipo_local !== "escritorio" && obraAtual?.tipo_obra === "supervisao" && !formData.empreiteira) {
        toast({ title: "Selecione uma empreiteira.", variant: "destructive" }); return;
      }
      if (formData.tipo_local === "campo" && (!formData.rodovia || !formData.trecho)) {
        toast({ title: "Preencha rodovia e trecho.", variant: "destructive" }); return;
      }
      if (formData.tipo_local === "usina" && !formData.usina_selecionada) {
        toast({ title: "Selecione uma usina.", variant: "destructive" }); return;
      }
      if (!formData.atividades_realizadas) { toast({ title: "Preencha as atividades realizadas.", variant: "destructive" }); return; }
      if (formData.tipo_local !== "escritorio" && formData.acoes_corretivas_realizado === null) {
        toast({ title: "Indique se foram realizadas ações corretivas.", variant: "destructive" }); return;
      }
      if (formData.tipo_local !== "escritorio" && formData.acoes_corretivas_realizado === true && !formData.acoes_corretivas_descricao?.trim()) {
        toast({ title: "Descreva as ações corretivas realizadas.", variant: "destructive" }); return;
      }
    }

    const dataToSave = {
      ...formData,
      status: saveStatus,
      temperatura: formData.temperatura === "" ? null : Number(formData.temperatura),
      fotos: (formData.fotos || []).map(f => (typeof f === 'string' ? f : (f?.url || ''))).filter(Boolean),
    };

    try {
      if (editingDiarioOriginal?.id) {
        const updateData = { ...dataToSave };
        if (editingDiarioOriginal.approved === false && saveStatus === "finalizado") {
          Object.assign(updateData, { approved: null, rejection_reason: null, approved_by: null, approved_date: null, was_rejected: true });
        }
        await atualizarDiario(editingDiarioOriginal.id, updateData);
        toast({ title: saveStatus === "rascunho" ? "Progresso salvo!" : "Diário atualizado com sucesso!" });
      } else {
        await criarDiario({ ...dataToSave, created_by: user.email, laboratorista_name: user.laboratorista_name || user.full_name });
        toast({ title: saveStatus === "rascunho" ? "Progresso salvo!" : "Diário criado com sucesso!" });
      }
      navigate(createPageUrl("MeusEnsaios"));
    } catch (error) {
      console.error("[DiarioObra] Erro:", error?.message || error);
      toast({ title: "Ocorreu um erro ao salvar o diário.", variant: "destructive" });
    }
  }, [formData, editingDiarioOriginal, obras, user, navigate]);

  const handleCancel = useCallback(() => {
    navigate(createPageUrl("MeusEnsaios"));
  }, [navigate]);

  useEffect(() => {
    if (loadingUser || loadingAux || !user) return;

    const params = new URLSearchParams(location.search);
    const editId = params.get("editId");

    if (editId) {
      setEditLoading(true);
      obterDiarioById(editId)
        .then(diarioToEdit => {
          setEditingDiarioOriginal(diarioToEdit);
          if (user.role === "admin" || (diarioToEdit.created_by === user.email && diarioToEdit.approved !== true)) {
            setFormData({
              ...getInitialFormData(), ...diarioToEdit,
              data: diarioToEdit.data ? new Date(diarioToEdit.data).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
              fotos: Array.isArray(diarioToEdit.fotos) ? diarioToEdit.fotos : [],
              temperatura: diarioToEdit.temperatura ?? "",
            });
          } else {
            toast({ title: "Você não tem permissão para editar este registro.", variant: "destructive" });
            navigate(createPageUrl("MeusEnsaios"));
          }
        })
        .catch(error => {
          console.error("[DiarioObra] Erro ao carregar:", error?.message || error);
          toast({ title: "Não foi possível carregar os dados.", variant: "destructive" });
          navigate(createPageUrl("MeusEnsaios"));
        })
        .finally(() => setEditLoading(false));
    } else {
      const initial = getInitialFormData();
      if (obras.length > 0) initial.obra_id = obras[0].id;
      setFormData(initial);
      setEditingDiarioOriginal(null);
    }
  }, [location.search, loadingUser, loadingAux, user?.id, obras, navigate]);

  const isApproved = formData.approved === true;
  const userCanEdit = user?.role === "admin" || (formData.created_by === user?.email && formData.approved !== true);
  const isEditable = !editingDiarioOriginal?.id || userCanEdit;
  const isCreatingNew = !editingDiarioOriginal?.id;

  return {
    loading, user, obras, regionais, editingDiarioOriginal,
    formData, setFormData, handleChange,
    loadingUpload, selectedFileNames, uploadProgress,
    handleFileChange, handleRemovePhoto, handleSubmit, handleCancel,
    isApproved, isEditable, isCreatingNew,
  };
}