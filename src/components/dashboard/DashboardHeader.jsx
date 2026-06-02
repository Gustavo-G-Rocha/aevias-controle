import React from 'react';
import NicknameEditor from './NicknameEditor';

export default function DashboardHeader({ user, isClienteUser }) {
  return (
    <div
      className="mb-8 rounded-xl overflow-hidden relative"
      style={{
        backgroundImage: 'url(https://media.base44.com/images/public/68a7599ee3fb9205cfb852ec/1ecf83e7e_image.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 75%',
      }}
    >
      <div className="px-6 py-14" style={{ background: 'linear-gradient(to right, rgba(0,35,59,0.75) 0%, rgba(0,35,59,0.4) 100%)' }}>
        <NicknameEditor user={user} />
        <p className="text-white/70 text-sm mt-1">
          {isClienteUser
            ? 'Acompanhe os registros das suas obras.'
            : 'Aqui está o resumo das suas atividades.'}
        </p>
      </div>
    </div>
  );
}