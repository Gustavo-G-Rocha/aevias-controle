import { useState } from "react";
import { filtrarRegistros } from "@/services/recordsService";
import { uploadArquivo } from "@/services/uploadService";

export const TIPOS_CHECKLIST = [
  { value: "DiarioObra", label: "Diário de Obra" },
  { value: "ChecklistUsina", label: "Checklist de Usina" },
  { value: "ChecklistAplicacao", label: "Checklist de Aplicação" },
  { value: "ChecklistMRAF", label: "Checklist MRAF" },
  { value: "ChecklistConcretagem", label: "Checklist de Concretagem" },
  { value: "ChecklistTerraplanagem", label: "Checklist de Terraplanagem" },
  { value: "ChecklistReciclagem", label: "Checklist de Reciclagem" }
];

const INITIAL_FORM = {
  numero_rnc: "",
  cliente: "",
  rodovia: "",
  trecho: "",
  fiscal: "",
  data_nc: new Date().toISOString().split("T")[0],
  campo: "",
  executora: "",
  contrato: "",
  descricao_nc: "",
  acoes: "",
  local_nc: "",
  categoria_nc: "",
  parametro_nc: ""
};

export function useNovaNCForm(user) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [obraId, setObraId] = useState("");
  const [tipoChecklist, setTipoChecklist] = useState("");
  const [checklists, setChecklists] = useState([]);
  const [checklistId, setChecklistId] = useState("");
  const [loadingChecklists, setLoadingChecklists] = useState(false);
  const [fotos, setFotos] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [uploadingFotos, setUploadingFotos] = useState(false);
  const [uploadingPdfs, setUploadingPdfs] = useState(false);

  const handleObraChange = async (obras, regionais, id) => {
    setObraId(id);
    const obra = obras.find(o => o.id === id);
    const regional = regionais.find(r => r.id === obra?.regional_id);
    setForm(f => ({
      ...f,
      cliente: regional?.cliente || "",
      contrato: obra?.code || "",
      executora: (obra?.empreiteiras || [])[0] || "",
      rodovia: (obra?.rodovias || [])[0] || "",
      relatorio_criador: user?.laboratorista_name || user?.full_name || ""
    }));
    setChecklists([]);
    setChecklistId("");
    setTipoChecklist("");
  };

  const handleTipoChecklistChange = async (tipo) => {
    setTipoChecklist(tipo);
    setChecklistId("");
    if (!obraId || !tipo) return;
    setLoadingChecklists(true);
    try {
      const data = await filtrarRegistros(tipo, { obra_id: obraId });
      setChecklists([...data].sort((a, b) => new Date(b.data) - new Date(a.data)));
    } catch (error) {
      console.error("[useNovaNCForm] Erro ao carregar checklists:", error?.message || error);
      setChecklists([]);
    } finally {
      setLoadingChecklists(false);
    }
  };

  const handleChecklistChange = (id) => {
    setChecklistId(id);
    const cl = checklists.find(c => c.id === id);
    if (!cl) return;
    setForm(f => ({
      ...f,
      rodovia: cl.rodovia || f.rodovia,
      trecho: cl.trecho || f.trecho,
      campo: cl.laboratorista_name || f.campo,
      data_nc: cl.data || f.data_nc,
      executora: cl.empreiteira || cl.usina || f.executora
    }));
  };

  const handleUploadFotos = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingFotos(true);
    try {
      const urls = await Promise.all(files.map(async (file) => {
        const { file_url } = await uploadArquivo(file);
        return file_url;
      }));
      setFotos(prev => [...prev, ...urls]);
    } catch (error) {
      console.error("[useNovaNCForm] Erro ao fazer upload de fotos:", error?.message || error);
    } finally {
      setUploadingFotos(false);
    }
  };

  const handleUploadPdfs = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingPdfs(true);
    try {
      const results = await Promise.all(files.map(async (file) => {
        const { file_url } = await uploadArquivo(file);
        return { url: file_url, nome: file.name };
      }));
      setPdfs(prev => [...prev, ...results]);
    } catch (error) {
      console.error("[useNovaNCForm] Erro ao fazer upload de PDFs:", error?.message || error);
    } finally {
      setUploadingPdfs(false);
    }
  };

  return {
    form, setForm,
    obraId, handleObraChange,
    tipoChecklist, handleTipoChecklistChange,
    checklists, checklistId, handleChecklistChange,
    loadingChecklists,
    fotos, setFotos, uploadingFotos, handleUploadFotos,
    pdfs, setPdfs, uploadingPdfs, handleUploadPdfs
  };
}