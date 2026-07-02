import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const SectionTitle = ({ children }) => (
  <CardHeader className="bg-muted/50 border-b">
    <CardTitle className="text-sm font-semibold text-foreground">{children}</CardTitle>
  </CardHeader>
);

export default function DadosClienteSection({
  formData,
  onInputChange,
  onObraChange,
  obrasDisponiveis,
  rodoviasDaObra
}) {
  return (
    <Card className="mb-6">
      <SectionTitle>Dados do Cliente</SectionTitle>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label>Obra *</Label>
            <Select value={formData.obra_id} onValueChange={onObraChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a obra" />
              </SelectTrigger>
              <SelectContent>
                {obrasDisponiveis.map(obra => (
                  <SelectItem key={obra.id} value={obra.id}>{obra.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Rodovia</Label>
            <Select value={formData.rodovia} onValueChange={(value) => onInputChange('rodovia', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a rodovia" />
              </SelectTrigger>
              <SelectContent>
                {rodoviasDaObra.map((rodovia, idx) => (
                  <SelectItem key={idx} value={rodovia}>{rodovia}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Trecho</Label>
            <Input value={formData.trecho} onChange={(e) => onInputChange('trecho', e.target.value)} />
          </div>

          <div>
            <Label>Empreiteira</Label>
            <Select value={formData.empreiteira || ''} onValueChange={(value) => onInputChange('empreiteira', value)} disabled={!formData.obra_id}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empreiteira" />
              </SelectTrigger>
              <SelectContent>
                {(obrasDisponiveis?.find(o => o.id === formData.obra_id)?.empreiteiras || []).map((em, idx) => (
                  <SelectItem key={idx} value={em}>{em}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Camada</Label>
            <Input value={formData.camada} onChange={(e) => onInputChange('camada', e.target.value)} />
          </div>

          <div>
            <Label>Pista</Label>
            <Input value={formData.pista} onChange={(e) => onInputChange('pista', e.target.value)} />
          </div>

          <div>
            <Label>Orgao</Label>
            <Select value={formData.orgao} onValueChange={(value) => onInputChange('orgao', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DER/PR">DER/PR</SelectItem>
                <SelectItem value="DNIT">DNIT</SelectItem>
                <SelectItem value="ECO-RODOVIAS">ECO-RODOVIAS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Data do Ensaio *</Label>
            <Input type="date" value={formData.data_ensaio} onChange={(e) => onInputChange('data_ensaio', e.target.value)} />
          </div>

          <div>
            <Label>Data de Aplicação *</Label>
            <Input type="date" value={formData.data_aplicacao} onChange={(e) => onInputChange('data_aplicacao', e.target.value)} />
          </div>

          <div>
            <Label>Laboratorista</Label>
            <Input value={formData.laboratorista_name} readOnly className="bg-muted/30" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}