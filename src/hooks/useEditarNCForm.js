import { useState, useMemo } from "react";
import { initializeNCForm } from "@/utils/editarNCUtils";
import { getCategoriasByLocal, getParametrosByLocalCategoria } from "@/components/nc/ncData";

export const useEditarNCForm = (nc) => {
  const [form, setForm] = useState(() =>
    nc ? initializeNCForm(nc) : getEmptyForm()
  );
  const [fotos, setFotos] = useState(nc?.fotos || []);
  const [pdfs, setPdfs] = useState(nc?.pdfs || []);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetCategoryAndParameter = () => {
    updateForm("categoria_nc", "");
    updateForm("parametro_nc", "");
  };

  const resetParameter = () => {
    updateForm("parametro_nc", "");
  };

  const categorias = useMemo(
    () => getCategoriasByLocal(form.local_nc),
    [form.local_nc]
  );

  const parametros = useMemo(
    () => getParametrosByLocalCategoria(form.local_nc, form.categoria_nc),
    [form.local_nc, form.categoria_nc]
  );

  return {
    form,
    setForm,
    updateForm,
    resetCategoryAndParameter,
    resetParameter,
    fotos,
    setFotos,
    pdfs,
    setPdfs,
    categorias,
    parametros,
  };
};

const getEmptyForm = () => ({
  numero_rnc: "",
  cliente: "",
  rodovia: "",
  trecho: "",
  fiscal: "",
  data_nc: "",
  campo: "",
  executora: "",
  contrato: "",
  descricao_nc: "",
  acoes: "",
  local_nc: "",
  categoria_nc: "",
  parametro_nc: "",
});