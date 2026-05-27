import React from 'react';
import { Building2, FolderOpen, FlaskConical, CheckCircle, Clock, FileSignature } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const StatCard = React.memo(({ title, value, icon: Icon, note, onClick, className }) => (
  <Card
    className={`relative overflow-hidden border-0 ${onClick ? 'cursor-pointer transition-all duration-200' : ''} ${className || ''}`}
    style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: 'var(--card-radius)',
      boxShadow: onClick ? undefined : 'var(--card-shadow)',
    }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'; e.currentTarget.style.transform = 'translateY(-1px)'; } : undefined}
    onMouseLeave={onClick ? e => { e.currentTarget.style.boxShadow = 'var(--card-shadow)'; e.currentTarget.style.transform = 'translateY(0)'; } : undefined}
    onClick={onClick}
  >
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{title}</CardTitle>
      <div className="p-2 rounded-xl" style={{ backgroundColor: 'var(--color-secondary-subtle)' }}>
        <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{value}</div>
      {note && <p className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>{note}</p>}
    </CardContent>
  </Card>
));
StatCard.displayName = 'StatCard';

export default function DashboardStats({ stats, isClienteUser, isEngenheiroUser, approvalPercentage }) {
  const navigate = useNavigate();

  if (isClienteUser) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Obras" value={stats.obras} icon={Building2} />
        <StatCard title="Projetos" value={stats.projects} icon={FolderOpen} />
        <StatCard
          title="Registros Assinados"
          value={stats.assinados}
          icon={CheckCircle}
          note={isEngenheiroUser ? `${approvalPercentage}% assinados` : undefined}
        />
        {isEngenheiroUser && (
          <StatCard
            title="Aguardando Assinatura"
            value={stats.aguardando_assinatura}
            icon={FileSignature}
            note="Clique para visualizar"
            onClick={() => navigate(createPageUrl('MeusEnsaios'))}
            className="cursor-pointer hover:shadow-md transition-shadow"
          />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
      <StatCard title="Obras Ativas" value={stats.obras} icon={Building2} />
      <StatCard title="Projetos" value={stats.projects} icon={FolderOpen} />
      <StatCard title="Total de Registros" value={stats.ensaios} icon={FlaskConical} />
      <StatCard title="Aprovados" value={stats.approved} icon={CheckCircle} note={`${approvalPercentage}% de aprovação`} />
      <StatCard title="Pendentes" value={stats.pending} icon={Clock} />
    </div>
  );
}