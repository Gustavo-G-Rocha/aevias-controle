import React from 'react';

export default function DashboardHeader({ user, isClienteUser }) {
  return (
    <div
      className="mb-8 rounded-xl overflow-hidden relative"
      style={{
        backgroundImage: 'url(https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/f0f118ebc_Semttulo.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="px-6 py-8" style={{ background: 'linear-gradient(to right, rgba(0,35,59,0.75) 0%, rgba(0,35,59,0.4) 100%)' }}>
        <h1 className="text-3xl font-bold mb-2 text-white">Dashboard</h1>
        <p className="text-white/80">
          Bem-vindo(a), {user?.full_name}.{' '}
          {isClienteUser
            ? 'Acompanhe os registros das suas obras.'
            : 'Aqui está o resumo das suas atividades.'}
        </p>
      </div>
    </div>
  );
}