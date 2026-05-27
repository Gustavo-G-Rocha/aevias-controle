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
    <div className="bg-white/20 backdrop-blur-lg border border-white/20 rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-white/10">
        <thead className="bg-black/5">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00233B]/70 uppercase tracking-wider">Usuário</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00233B]/70 uppercase tracking-wider">Empresa/Cargo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00233B]/70 uppercase tracking-wider">Regional</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00233B]/70 uppercase tracking-wider">Nível</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00233B]/70 uppercase tracking-wider">Ativo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#00233B]/70 uppercase tracking-wider">Status</th>
            {(canManageUsers && !isCliente) && (
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Editar</span></th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {filteredUsers.map(user => {
            const regional    = getRegionalForUser(user.email, regionais);
            const loginStatus = getLoginStatus(user);
            return (
              <tr key={user.id} className="hover:bg-black/5">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-[#00233B]">{user.laboratorista_name}</div>
                    <div className="text-sm text-[#00233B]/80">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-[#00233B]">{user.company || "—"}</div>
                    <div className="text-sm text-[#00233B]/80">{user.position || "—"}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {regional ? (
                    <div>
                      <div className="text-sm font-medium text-[#00233B]">{regional.nome}</div>
                      <div className="text-xs text-[#00233B]/60">{regional.codigo}</div>
                    </div>
                  ) : (
                    <span className="text-sm text-[#00233B]/40">—</span>
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
                    <span className="text-sm text-[#00233B]/80">{loginStatus.text}</span>
                  </div>
                </td>
                {(canManageUsers && !isCliente) && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(user)} className="hover:bg-black/10">
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
          <UsersIcon className="w-12 h-12 text-[#00233B]/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#00233B] mb-2">
            {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
          </h3>
          <p className="text-[#00233B]/80">
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