/**
 * Formulário de criação/edição de Obra dentro de uma Regional.
 * Extraído de Regionais.jsx onde era um componente inline `ObraForm`.
 */
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, HardHat, Construction, Wrench, FileText, Factory } from "lucide-react";

const TagInput = ({ field, value, setValue, placeholder, badgeClass, items, onAdd, onRemove }) => (
  <div className="space-y-2">
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="bg-card border-border/20 text-foreground"
        onKeyPress={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); onAdd(field, value, setValue); }
        }}
      />
      <Button type="button" onClick={() => onAdd(field, value, setValue)} className="bg-[#566E3D] hover:bg-[#566E3D]/90 text-white">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary" className={`${badgeClass} flex items-center gap-1`}>
          {item}
          <button type="button" onClick={() => onRemove(field, index)} className="ml-1 hover:text-destructive">×</button>
        </Badge>
      ))}
    </div>
  </div>
);

const ObraForm = React.memo(({ obra, regional, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: obra?.name || "",
    code: obra?.code || "",
    tipo_obra: obra?.tipo_obra || "implantacao",
    status: obra?.status || "planejamento",
    empreiteiras: obra?.empreiteiras || [],
    clientes: obra?.clientes || [],
    usinas: obra?.usinas || [],
    rodovias: obra?.rodovias || [],
  });

  const [novaEmpreiteira, setNovaEmpreiteira] = useState("");
  const [novoCliente, setNovoCliente] = useState("");
  const [novaUsina, setNovaUsina] = useState("");
  const [novaRodovia, setNovaRodovia] = useState("");

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSave(formData);
  }, [formData, onSave]);

  const addItem = (field, value, setValue) => {
    if (value.trim()) {
      setFormData(prev => ({ ...prev, [field]: [...prev[field], value.trim()] }));
      setValue("");
    }
  };

  const removeItem = (field, index) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nome da Obra *</Label>
        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="bg-card border-border/20 text-foreground" />
      </div>

      <div>
        <Label htmlFor="code">Código da Obra *</Label>
        <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required className="bg-card border-border/20 text-foreground" />
      </div>

      <div>
        <Label htmlFor="tipo_obra">Tipo de Obra *</Label>
        <Select value={formData.tipo_obra} onValueChange={(value) => setFormData({ ...formData, tipo_obra: value })}>
          <SelectTrigger className="bg-card border-border/20 text-foreground"><SelectValue placeholder="Selecione o tipo de obra" /></SelectTrigger>
          <SelectContent className="bg-card border-border/20 text-foreground">
            <SelectItem value="supervisao"><div className="flex items-center gap-2"><HardHat className="w-4 h-4 text-blue-600" />Supervisão</div></SelectItem>
            <SelectItem value="implantacao"><div className="flex items-center gap-2"><Construction className="w-4 h-4 text-green-600" />Implantação</div></SelectItem>
            <SelectItem value="conservacao"><div className="flex items-center gap-2"><Wrench className="w-4 h-4 text-amber-600" />Conservação</div></SelectItem>
            <SelectItem value="sondagem"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-purple-600" />Sondagem</div></SelectItem>
            <SelectItem value="levantamentos"><div className="flex items-center gap-2"><FileText className="w-4 h-4 text-teal-600" />Levantamentos</div></SelectItem>
            <SelectItem value="homologacao_usinas"><div className="flex items-center gap-2"><Factory className="w-4 h-4 text-orange-600" />Homologação de Usinas</div></SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-foreground/60 mt-1">Define quais ensaios estarão disponíveis para esta obra</p>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger className="bg-card border-border/20 text-foreground"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-card border-border/20 text-foreground">
            <SelectItem value="planejamento">Planejamento</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="pausada">Pausada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.tipo_obra === "supervisao" && (
        <div><Label>Empreiteiras do Contrato</Label><TagInput field="empreiteiras" value={novaEmpreiteira} setValue={setNovaEmpreiteira} placeholder="Nome da empreiteira" badgeClass="bg-blue-100 text-secondary" items={formData.empreiteiras} onAdd={addItem} onRemove={removeItem} /></div>
      )}

      {(formData.tipo_obra === "levantamentos" || formData.tipo_obra === "sondagem") && (
        <div><Label>Clientes da Obra</Label><TagInput field="clientes" value={novoCliente} setValue={setNovoCliente} placeholder="Nome do cliente" badgeClass="bg-teal-100 text-teal-800" items={formData.clientes} onAdd={addItem} onRemove={removeItem} /></div>
      )}

      {(formData.tipo_obra === "supervisao" || formData.tipo_obra === "implantacao" || formData.tipo_obra === "conservacao" || formData.tipo_obra === "homologacao_usinas") && (
        <div><Label>Usinas do Contrato</Label><TagInput field="usinas" value={novaUsina} setValue={setNovaUsina} placeholder="Nome da usina" badgeClass="bg-green-100 text-green-800" items={formData.usinas} onAdd={addItem} onRemove={removeItem} /></div>
      )}

      {formData.tipo_obra !== "homologacao_usinas" && (
        <div><Label>Rodovias da Obra</Label><TagInput field="rodovias" value={novaRodovia} setValue={setNovaRodovia} placeholder="Nome da rodovia" badgeClass="bg-purple-100 text-purple-800" items={formData.rodovias} onAdd={addItem} onRemove={removeItem} /></div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-border/20 text-foreground hover:bg-muted/5">Cancelar</Button>
        <Button type="submit" className="">{obra ? "Atualizar Obra" : "Criar Obra"}</Button>
      </div>
    </form>
  );
});

ObraForm.displayName = 'ObraForm';
export default ObraForm;