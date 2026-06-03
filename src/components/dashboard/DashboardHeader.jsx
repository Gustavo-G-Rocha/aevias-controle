import React from 'react';
import NicknameEditor from './NicknameEditor';

export default function DashboardHeader({ user, isClienteUser }) {
  const displayName = user?.nickname?.trim() || user?.full_name || '';

  return (
    <div className="mb-8 rounded-xl overflow-hidden relative" style={{ backgroundColor: '#001f35' }}>
      {/* Imagem ocupa a metade direita, esticada com object-fit: cover */}
      <img
        src="https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/07dc922ec_20260603_100305jpg.jpg"
        alt=""
        className="absolute top-0 right-0 h-full"
        style={{ width: '50%', objectFit: 'cover', objectPosition: 'center 60%' }}
      />
      {/* Filtro azulado apenas sobre a foto */}
      <div className="absolute top-0 right-0 h-full" style={{ width: '50%', background: 'rgba(0,60,120,0.35)', mixBlendMode: 'multiply' }} />
      <div className="px-6 pt-16 pb-24 relative" style={{ background: 'linear-gradient(to right, rgba(0,35,59,0.90) 0%, rgba(0,35,59,0.75) 50%, rgba(0,35,59,0.0) 100%)' }}>
        <NicknameEditor user={user} />
        <p className="text-white/70 text-sm mt-1 mb-1">Bem-vindo(a),</p>
        <p className="text-white/70 text-sm mt-2">
          {isClienteUser
            ? 'Acompanhe os registros das suas obras.'
            : 'Aqui está o resumo das suas atividades.'}
        </p>
      </div>
    </div>
  );
}