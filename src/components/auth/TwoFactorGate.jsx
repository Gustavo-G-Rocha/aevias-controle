import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Gate de 2FA pós-login (layout route).
 *
 * 2FA no login desativado por solicitação — era um atrito grande no uso
 * diário em campo. A verificação em duas etapas permanece disponível
 * server-side para atos que exigem reautenticação (ex.: assinaturas
 * eletrônicas), mas não bloqueia mais o acesso ao app após o login.
 */
export default function TwoFactorGate() {
  return <Outlet />;
}