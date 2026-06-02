import React from 'react';
import NicknameEditor from './NicknameEditor';

export default function DashboardHeader({ user, isClienteUser }) {
  const displayName = user?.nickname?.trim() || user?.full_name || '';

  return (
    <div
      className="mb-8 rounded-xl overflow-hidden relative min-h-[320px]"
      style={{
        backgroundImage: 'url(https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/a0653a144_Gemini_Generated_Image_gcu5d3gcu5d3gcu5.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="px-6 pt-14 pb-24" style={{ background: 'linear-gradient(to right, rgba(0,35,59,0.75) 0%, rgba(0,35,59,0.4) 100%)' }}>
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