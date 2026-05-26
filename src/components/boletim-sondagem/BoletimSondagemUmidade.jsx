import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import UmidadeNaturalTable from "./UmidadeNaturalTable";

const UMIDADE_2_INICIAL = {
  camada_ensaiada_1: "",
  no_capsula_1: "", no_capsula_2: "",
  massa_capsula_1: null, massa_capsula_2: null,
  massa_cap_solo_umido_1: null, massa_cap_solo_umido_2: null,
  massa_cap_solo_seco_1: null, massa_cap_solo_seco_2: null,
  massa_agua_1: null, massa_agua_2: null,
  massa_solo_seco_1: null, massa_solo_seco_2: null,
  umidade_1: null, umidade_2: null,
};

export default function BoletimSondagemUmidade({ formData, setFormData, isEditable, handleUmidadeChange }) {
  const handleUmidade2Change = (field, value) => {
    setFormData(prev => ({ ...prev, umidade_natural_2: { ...prev.umidade_natural_2, [field]: value } }));
  };

  return (
    <>
      {/* UMIDADE NATURAL 1 */}
      <Card className="bg-black/5 border-[#00233B]/10">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base text-[#00233B]">Umidade Natural 1 — DNER-ME 213/94</CardTitle>
            {isEditable && !formData.umidade_natural_2 && (
              <Button
                type="button" size="sm" variant="outline"
                className="border-[#00233B]/30 text-[#00233B] hover:bg-[#00233B]/10 text-xs"
                onClick={() => setFormData(prev => ({ ...prev, umidade_natural_2: { ...UMIDADE_2_INICIAL } }))}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar 2ª Umidade
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <UmidadeNaturalTable
            umidade={formData.umidade_natural}
            isEditable={isEditable}
            onChange={handleUmidadeChange}
          />
        </CardContent>
      </Card>

      {/* UMIDADE NATURAL 2 */}
      {formData.umidade_natural_2 && (
        <Card className="bg-black/5 border-[#00233B]/10">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base text-[#00233B]">Umidade Natural 2 — DNER-ME 213/94</CardTitle>
              {isEditable && (
                <Button
                  type="button" size="sm" variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50 text-xs"
                  onClick={() => setFormData(prev => ({ ...prev, umidade_natural_2: null }))}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Remover
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <UmidadeNaturalTable
              umidade={formData.umidade_natural_2}
              isEditable={isEditable}
              onFieldChange={handleUmidade2Change}
            />
          </CardContent>
        </Card>
      )}
    </>
  );
}