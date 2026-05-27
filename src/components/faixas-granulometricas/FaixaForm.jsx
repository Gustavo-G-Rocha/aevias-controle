import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { PENEIRAS_ASTM, getInitialFaixaData, validatePeneiras } from "@/utils/faixasGranulometricasUtils";

const FaixaForm = React.memo(({ faixa: editingFaixa, onSave, onCancel }) => {
  const [faixa, setFaixa] = useState(() => editingFaixa || getInitialFaixaData());

  const handleInputChange = useCallback((field, value) => {
    setFaixa(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePeneiraChange = useCallback((index, field, value) => {
    const updatedPeneiras = [...faixa.peneiras];
    updatedPeneiras[index] = {
      ...updatedPeneiras[index],
      [field]: field === 'astm' ? value : (value === '' ? '' : parseFloat(value))
    };
    setFaixa(prev => ({ ...prev, peneiras: updatedPeneiras }));
  }, [faixa.peneiras]);

  const addPeneira = useCallback(() => {
    setFaixa(prev => ({
      ...prev,
      peneiras: [...prev.peneiras, { astm: "", min: "", max: "" }]
    }));
  }, []);

  const removePeneira = useCallback((index) => {
    setFaixa(prev => {
      if (prev.peneiras.length <= 1) return prev;
      return {
        ...prev,
        peneiras: prev.peneiras.filter((_, i) => i !== index)
      };
    });
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const peneirasValidas = validatePeneiras(faixa.peneiras);

    if (peneirasValidas.length === 0) {
      alert('Adicione pelo menos uma peneira com Peneira ASTM, Mínimo e Máximo preenchidos.');
      return;
    }

    onSave({
      ...faixa,
      peneiras: peneirasValidas
    });
  }, [faixa, onSave]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-[#00233B]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select value={faixa.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
            <SelectTrigger className="bg-transparent border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAUQ">
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-500">CAUQ</Badge>
                  <span>Concreto Asfáltico Usinado a Quente</span>
                </div>
              </SelectItem>
              <SelectItem value="MRAF">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">MRAF</Badge>
                  <span>Micro Revestimento Asfáltico a Frio</span>
                </div>
              </SelectItem>
              <SelectItem value="BGS">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500">BGS</Badge>
                  <span>Brita Graduada Simples</span>
                </div>
              </SelectItem>
              <SelectItem value="CAMADAS_GRANULARES">
                <div className="flex items-center gap-2">
                  <Badge className="bg-orange-500">CAMADAS GRANULARES</Badge>
                  <span>Camadas Granulares</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="nome">Nome da Faixa *</Label>
          <Input
            id="nome"
            value={faixa.nome}
            onChange={(e) => handleInputChange("nome", e.target.value)}
            placeholder="Ex: Faixa III, Faixa B"
            required
            className="bg-transparent border-white/20 placeholder:text-[#00233B]/60 focus:border-[#BFCF99] focus:ring-[#BFCF99]"
          />
        </div>
        <div>
          <Label htmlFor="especificacao">Especificação *</Label>
          <Input
            id="especificacao"
            value={faixa.especificacao}
            onChange={(e) => handleInputChange("especificacao", e.target.value)}
            placeholder="Ex: ES-P 14/05, DNIT 031/2006"
            required
            className="bg-transparent border-white/20 placeholder:text-[#00233B]/60 focus:border-[#BFCF99] focus:ring-[#BFCF99]"
          />
        </div>
        <div>
          <Label htmlFor="orgao">Órgão *</Label>
          <Input
            id="orgao"
            value={faixa.orgao}
            onChange={(e) => handleInputChange("orgao", e.target.value)}
            placeholder="Ex: DER/PR, DNIT, ABNT"
            required
            className="bg-transparent border-white/20 placeholder:text-[#00233B]/60 focus:border-[#BFCF99] focus:ring-[#BFCF99]"
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={faixa.status} onValueChange={(value) => handleInputChange("status", value)}>
            <SelectTrigger className="bg-transparent border-white/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Peneiras (% Passante)</h3>
        <div className="space-y-3">
          {faixa.peneiras.map((peneira, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 p-3 rounded-lg bg-black/5">
              <Select value={peneira.astm} onValueChange={(value) => handlePeneiraChange(index, 'astm', value)}>
                <SelectTrigger className="bg-transparent border-white/20">
                  <SelectValue placeholder="Selecione Peneira ASTM" />
                </SelectTrigger>
                <SelectContent>
                  {PENEIRAS_ASTM.map(p => <SelectItem key={p.astm} value={p.astm}>{p.descricao}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                type="number"
                step="0.1"
                placeholder="Mínimo %"
                value={peneira.min}
                onChange={(e) => handlePeneiraChange(index, "min", e.target.value)}
                required
                className="bg-transparent border-white/20 placeholder:text-[#00233B]/60 focus:border-[#BFCF99] focus:ring-[#BFCF99]"
              />
              <Input
                type="number"
                step="0.1"
                placeholder="Máximo %"
                value={peneira.max}
                onChange={(e) => handlePeneiraChange(index, "max", e.target.value)}
                required
                className="bg-transparent border-white/20 placeholder:text-[#00233B]/60 focus:border-[#BFCF99] focus:ring-[#BFCF99]"
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => removePeneira(index)} className="text-red-500 hover:bg-red-500/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button type="button" onClick={addPeneira} variant="outline" className="mt-4 hover:bg-black/10 text-[#00233B] border-white/20">
          <Plus className="w-4 h-4 mr-2" /> Adicionar Peneira
        </Button>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-black/10 border-white/20 text-[#00233B]">Cancelar</Button>
        <Button type="submit" className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
          <Save className="w-4 h-4 mr-2 text-[#BFCF99]" />
          Salvar
        </Button>
      </DialogFooter>
    </form>
  );
});

FaixaForm.displayName = 'FaixaForm';
export default FaixaForm;