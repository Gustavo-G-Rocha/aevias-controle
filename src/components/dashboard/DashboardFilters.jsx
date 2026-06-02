import React from 'react';
import { Filter, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardFilters({ filters, setFilters, clearFilters, hasActiveFilters, obras }) {
  const set = (key, value) => setFilters(prev => ({ ...prev, [key]: value === 'todas' || value === 'todos' ? null : value }));

  return (
    <Card className="mb-6 border-0" style={{ backgroundColor: 'var(--color-primary)', borderRadius: 'var(--card-radius)', boxShadow: 'var(--card-shadow)' }}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" style={{ color: 'var(--color-secondary)' }} />
            <CardTitle className="text-lg" style={{ color: '#ffffff' }}>Filtros</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} style={{ color: 'rgba(255,255,255,0.7)' }}>
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Obra */}
          <div>
            <span className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>Obra</span>
            <Select value={filters.obraId || 'todas'} onValueChange={v => set('obraId', v)}>
              <SelectTrigger className="border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}><SelectValue /></SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <SelectItem value="todas">Todas as Obras</SelectItem>
                {obras.map(obra => <SelectItem key={obra.id} value={obra.id}>{obra.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <span className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>Status</span>
            <Select value={filters.status || 'todos'} onValueChange={v => set('status', v)}>
              <SelectTrigger className="border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}><SelectValue /></SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="rejected">Reprovados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Registro */}
          <div>
            <span className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>Tipo de Registro</span>
            <Select value={filters.tipoRegistro || 'todos'} onValueChange={v => set('tipoRegistro', v)}>
              <SelectTrigger className="border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}><SelectValue /></SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="DiarioObra">Diário de Obra</SelectItem>
                <SelectItem value="EnsaioCAUQ">Ensaio CAUQ</SelectItem>
                <SelectItem value="EnsaioDensidade">Densidade</SelectItem>
                <SelectItem value="ChecklistUsina">Checklist Usina</SelectItem>
                <SelectItem value="ChecklistAplicacao">Checklist Aplicação</SelectItem>
                <SelectItem value="ChecklistMRAF">Checklist MRAF</SelectItem>
                <SelectItem value="ChecklistConcretagem">Checklist Concretagem</SelectItem>
                <SelectItem value="ChecklistTerraplanagem">Checklist Terraplanagem</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div>
            <span className="text-sm font-medium mb-2 block" style={{ color: 'rgba(255,255,255,0.7)' }}>Período</span>
            <Select value={filters.periodo} onValueChange={v => setFilters(prev => ({ ...prev, periodo: v }))}>
              <SelectTrigger className="border" style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)', color: '#ffffff' }}><SelectValue /></SelectTrigger>
              <SelectContent style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <SelectItem value="1mes">Último Mês</SelectItem>
                <SelectItem value="3meses">Últimos 3 Meses</SelectItem>
                <SelectItem value="6meses">Últimos 6 Meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.obraId && (
              <Badge variant="secondary" className="text-xs" style={{ backgroundColor: 'var(--color-secondary-subtle)', color: 'var(--color-text)' }}>
                Obra: {obras.find(o => o.id === filters.obraId)?.name}
                <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilters(p => ({ ...p, obraId: null }))} />
              </Badge>
            )}
            {filters.status && (
              <Badge variant="secondary" className="text-xs" style={{ backgroundColor: 'var(--color-secondary-subtle)', color: 'var(--color-text)' }}>
                Status: {filters.status === 'approved' ? 'Aprovados' : filters.status === 'pending' ? 'Pendentes' : 'Reprovados'}
                <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilters(p => ({ ...p, status: null }))} />
              </Badge>
            )}
            {filters.tipoRegistro && (
              <Badge variant="secondary" className="text-xs" style={{ backgroundColor: 'var(--color-secondary-subtle)', color: 'var(--color-text)' }}>
                Tipo: {filters.tipoRegistro.replace('Checklist', 'Checklist ')}
                <X className="w-3 h-3 ml-2 cursor-pointer" onClick={() => setFilters(p => ({ ...p, tipoRegistro: null }))} />
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}