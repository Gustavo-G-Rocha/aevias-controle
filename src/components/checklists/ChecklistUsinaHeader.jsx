import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ChecklistUsinaHeader({
  formData,
  setFormData,
  obras,
  regionais,
  projects,
  projetosDisponiveis,
  obraSelecionada,
  regionalSelecionada,
  isEditable,
  isApproved,
  editingChecklist
}) {
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleObraChange = (obraId) => {
    setFormData((prev) => ({ ...prev, obra_id: obraId, project_id: "" }));
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      setFormData((prev) => ({ ...prev, project_id: "" }));
      return;
    }

    const pedreiras = project.agregados && Array.isArray(project.agregados) ?
    [...new Set(project.agregados.map((ag) => ag.pedreira).filter(Boolean))].join(' + ') :
    "";

    setFormData((prev) => ({
      ...prev,
      project_id: projectId,
      faixa_especificada: "Não definida",
      ligante: project.ligante?.tipo || "",
      pedreira: pedreiras,
      controle_agregados: (project.agregados || []).map((ag) => ({
        nome: ag.nome,
        estoque_coberto: false,
        estoque_coberto_qtde: 0,
        material_homogeneizado: false,
        material_homogeneizado_qtde: 0,
        granulometria_individual: false,
        granulometria_individual_qtde: 0
      })),
      controle_ligante: {
        ...prev.controle_ligante,
        fornecedor: project.ligante?.fornecedor || ""
      }
    }));
  };

  return null;





















































































































































}