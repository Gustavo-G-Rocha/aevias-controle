import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Users as UsersIcon } from "lucide-react";
import {
  getAccessLevelLabel,
  getAccessLevelBadgeVariant,
  getLoginStatus,
  getRegionalForUser,
} from "@/utils/usersUtils";

export default function UsersTable({ filteredUsers, regionais, canManageUsers, isCliente, isAdmin, searchTerm, onEdit }) {
  return (
    <div className="rounded-lg overflow-x-auto border-0" style={{ backgroundColor: 'var(--color-surface)', boxShadow: 'var(--card-shadow)' }}>
      <table className="min-w-full" style={{ borderColor: 'var(--color-border)' }}>
        <thead style={{ backgroundColor: 'var(--color-surface-muted)' }}>
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Usuário</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Empresa/Cargo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Regional</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Nível</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Ativo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Status</th>
            {(canManageUsers && !isCliente) && (
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
            )}
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => {
            const regional    = getRegionalForUser(user.email, regionais);
            const loginStatus = getLoginStatus(user);
            return (
              <tr key={user.id} className="border-t transition-colors" style={{ borderColor: 'var(--color-border)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-muted)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{user.laboratorista_name}</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm" style={{ color: 'var(--color-text)' }}>{user.company || "—"}</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{user.position || "—"}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {regional ? (
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{regional.nome}</div>
                      <div className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{regional.codigo}</div>
                    </div>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--color-text-subtle)' }}>—</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={getAccessLevelBadgeVariant(user.access_level)}>
                    {getAccessLevelLabel(user.access_level)}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={user.is_active ? 'success' : 'destructive'}>
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {loginStatus.status === 'online' && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                    <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{loginStatus.text}</span>
                  </div>
                </td>
                {(canManageUsers && !isCliente) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UsersIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-subtle)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </h3>
          <p style={{ color: 'var(--color-text-muted)' }}>
            {searchTerm
              ? 'Tente ajustar os filtros de pesquisa.'
              : isAdmin
                ? 'Comece convidando seu primeiro usuário.'
                : 'Não há usuários ativos vinculados às suas regionais.'}
          </p>
        </div>
      )}
    </div>
  );
}