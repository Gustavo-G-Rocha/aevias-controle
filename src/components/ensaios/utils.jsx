import { MapPin, Building, Clock, CheckCircle, XCircle } from "lucide-react";

export const getLocalInfo = (ensaio) => {
  const entityType = ensaio.entityType;

  if (entityType === "DiarioObra") {
    if (ensaio.tipo_local === "usina") {
      return {
        tipo: "Usina",
        detalhes: ensaio.usina_selecionada || "Não informado",
        icon: Building
      };
    } else {
      return {
        tipo: "Campo",
        detalhes: `${ensaio.rodovia || "Rodovia não informada"} - ${ensaio.trecho || "Trecho não informado"}`,
        icon: MapPin
      };
    }
  } else if (entityType === "ChecklistUsina") {
    return {
      tipo: "Usina",
      detalhes: ensaio.usina || "Não informado",
      icon: Building
    };
  } else if (entityType === "ChecklistAplicacao" || entityType === "ChecklistMRAF" || entityType === "ChecklistConcretagem" || entityType === "ChecklistTerraplanagem" || entityType === "ChecklistReciclagem" || entityType === "EnsaioSondagem" || entityType === "EnsaioTaxaPinturaImprimacao" || entityType === "EnsaioGranulometriaIndividual" || entityType === "EnsaioManchaPendulo" || entityType === "EnsaioVigaBenkelman") {
    return {
      tipo: "Campo",
      detalhes: `${ensaio.rodovia || "Rodovia não informada"} - ${ensaio.trecho || ensaio.estaca || ensaio.local_coleta || "Trecho não informado"}`,
      icon: MapPin
    };
  } else {
    return {
      tipo: "Local",
      detalhes: ensaio.collection_point || ensaio.location || "Não informado",
      icon: MapPin
    };
  }
};

export const getLaboratoristaInfo = (ensaio, allUsers) => {
  if (ensaio.laboratorista_name) return ensaio.laboratorista_name;
  
  if (ensaio.created_by && allUsers) {
    const user = allUsers.find(u => u.email?.toLowerCase() === ensaio.created_by?.toLowerCase());
    if (user) {
      return user.laboratorista_name || user.full_name || ensaio.created_by.split('@')[0];
    }
  }
  
  return ensaio.created_by?.split('@')[0] || "Não identificado";
};

export const getResponsavelInfo = (ensaio) => {
  const entityType = ensaio.entityType;
  
  if (entityType === "ChecklistUsina" || entityType === "ChecklistAplicacao" || entityType === "ChecklistMRAF") {
    return ensaio.usina || "Não informado";
  } else if (entityType === "ChecklistConcretagem") {
    return ensaio.concreteira || "Não informado";
  } else if (entityType === "ChecklistTerraplanagem") {
    return ensaio.empreiteira || "Não informado";
  }
  
  return null;
};

export const getEmpireiteiraInfo = (ensaio) => {
  const entityType = ensaio.entityType;
  
  if (entityType === "DiarioObra" || entityType === "ChecklistAplicacao" || entityType === "ChecklistMRAF" || entityType === "ChecklistConcretagem" || entityType === "ChecklistTerraplanagem" || entityType === "ChecklistReciclagem") {
    return ensaio.empreiteira || null;
  }
  
  return null;
};

export const getRodoviaInfo = (ensaio) => {
  return ensaio.rodovia || null;
};

export const getTrechoInfo = (ensaio) => {
  return ensaio.trecho || ensaio.estaca || null;
};

// Registry de extração de não conformidades por entityType.
// Cada entrada é uma função (ensaio) => string[] — adicionar um novo
// tipo de ensaio significa apenas adicionar uma entrada aqui.
const NC_EXTRACTORS = {
  ChecklistUsina: (ensaio) => {
    const result = [];
    const controle = ensaio.controle_cauq || {};

    if (controle.granulometria?.conforme === false) {
      result.push("Granulometria");
    }
    if (controle.volume_vazios?.conforme === false) {
      result.push("Volume de Vazios");
    }
    if (controle.rbv?.conforme === false) {
      result.push("RBV");
    }
    if (controle.rtcd_25c?.conforme === false) {
      result.push("RTCD a 25°C");
    }
    if (controle.estabilidade?.conforme === false) {
      result.push("Estabilidade");
    }
    if (controle.fluencia?.conforme === false) {
      result.push("Fluência");
    }
    if (controle.extracao_ligante_rotarex?.conforme === false) {
      result.push("Extração Ligante (Rotarex)");
    }
    if (controle.extracao_ligante_soxhlet?.conforme === false) {
      result.push("Extração Ligante (Soxhlet)");
    }
    return result;
  },

  ChecklistMRAF: (ensaio) => {
    const result = [];
    const acomp = ensaio.acompanhamento_aplicacao || {};

    if (acomp.taxa_aplicacao?.conforme === false) {
      result.push("Taxa de Aplicação");
    }
    if (acomp.residuo_emulsao?.conforme === false) {
      result.push("Resíduo da Emulsão");
    }
    if (acomp.espessura_camada?.conforme === false) {
      result.push("Espessura da Camada");
    }
    return result;
  },

  ChecklistAplicacao: (ensaio) => {
    const result = [];
    const pintura = ensaio.pintura_ligacao || {};

    if (pintura.taxa_pintura?.conforme === false) {
      result.push("Taxa de Pintura");
    }
    if (pintura.taxa_pintura_residual?.conforme === false) {
      result.push("Taxa de Pintura Residual");
    }
    return result;
  },

  ChecklistConcretagem: (ensaio) => {
    const result = [];
    const cargas = ensaio.cargas_concreto || [];
    cargas.forEach((carga, idx) => {
      if (carga.slump_test?.conforme === false) {
        result.push(`Slump Test (Carga ${carga.numero_carga || idx + 1})`);
      }
      if (carga.espessura_camada?.conforme === false) {
        result.push(`Espessura da Camada (Carga ${carga.numero_carga || idx + 1})`);
      }
    });
    return result;
  },

  EnsaioVigaBenkelman: (ensaio) => {
    const result = [];
    const def_admissivel = parseFloat(ensaio.def_admissivel) || 0;
    if (def_admissivel > 0) {
      const levantamentos = ensaio.levantamentos || [];
      const pontosNC = [];

      levantamentos.forEach((lev, idx) => {
        if (lev.bordo_esquerdo?.deflexao > def_admissivel ||
            lev.eixo?.deflexao > def_admissivel ||
            lev.bordo_direito?.deflexao > def_admissivel) {
          if (lev.estaca_km) {
            pontosNC.push(`Estaca ${lev.estaca_km}`);
          }
        }
      });

      if (pontosNC.length > 0) {
        result.push(`Deflexão acima do limite em ${pontosNC.length} ponto(s)`);
      }
    }
    return result;
  },

  EnsaioManchaPendulo: (ensaio) => {
    const result = [];
    if (ensaio.condicao_conformidade === "NÃO CONFORME") {
      result.push("Resultado não conforme");
    }
    return result;
  },
};

export const getNaoConformidades = (ensaio) => {
  const extractor = NC_EXTRACTORS[ensaio.entityType];
  return extractor ? extractor(ensaio) : [];
};

export const getStatusInfo = (ensaio) => {
  // Se status foi revertido para rascunho, tem prioridade sobre approved
  if (ensaio.status === 'rascunho' && !ensaio.client_signature?.signed_by) {
    return { text: "Execução", icon: Clock, className: "bg-blue-100/80 text-secondary border border-blue-300/50 hover:bg-blue-200/80 hover:border-blue-400/50 transition-colors" };
  }
  if (ensaio.client_signature?.signed_by) {
    return { text: "Assinado", icon: CheckCircle, className: "bg-muted/10 text-foreground border border-border/30 hover:bg-muted/20 hover:border-border/40 transition-colors" };
  }
  if (ensaio.approved === true) {
    return { text: "Aprovado", icon: CheckCircle, className: "bg-green-100 text-green-700 border border-green-300/50 hover:bg-green-200 hover:border-green-400/50 transition-colors" };
  }
  if (ensaio.approved === false) {
    return { text: "Reprovado", icon: XCircle, className: "bg-red-100 text-destructive border border-red-300/50 hover:bg-red-200 hover:border-red-400/50 transition-colors" };
  }
  if (ensaio.was_rejected === true) {
    return { text: "Pendente", icon: Clock, className: "bg-orange-100/80 text-orange-800 border border-border/50 hover:bg-orange-200/80 hover:border-orange-400/50 transition-colors", wasRejected: true };
  }
  return { text: "Pendente", icon: Clock, className: "bg-yellow-100 text-yellow-700 border border-yellow-300/50 hover:bg-yellow-200 hover:border-yellow-400/50 transition-colors" };
};