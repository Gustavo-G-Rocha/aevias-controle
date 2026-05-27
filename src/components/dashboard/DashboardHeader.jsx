import React from 'react';

export default function DashboardHeader({ user, isClienteUser }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Bem-vindo(a), {user?.full_name}.{' '}
        {isClienteUser
          ? 'Acompanhe os registros das suas obras.'
          : 'Aqui está o resumo das suas atividades.'}
      </p>
    </div>
  );
}