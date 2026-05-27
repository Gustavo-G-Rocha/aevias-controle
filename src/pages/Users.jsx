import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users as UsersIcon, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

import { useUsersData }    from "@/hooks/useUsersData";
import { useUsersFilters } from "@/hooks/useUsersFilters";
import { useUsersActions } from "@/hooks/useUsersActions";

import UserForm    from "@/components/users/UserForm";
import UsersTable  from "@/components/users/UsersTable";

export default function UsersPage() {
  const { users, regionais, currentUser, loading, loadData } = useUsersData();

  const {
    searchTerm, setSearchTerm, filteredUsers,
    isAdmin, isSalaTecnica, isGestorContrato, isCliente, canManageUsers,
  } = useUsersFilters(users, currentUser);

  const {
    isFormOpen, setIsFormOpen, editingUser,
    handleEdit, handleCloseForm, handleSaveUser,
  } = useUsersActions({ currentUser, regionais, loadData });

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-transparent min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-[#00233B]/20 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-[#00233B] mb-2">Carregando usuários...</h3>
            <p className="text-[#00233B]/80">Aguarde enquanto carregamos os dados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-transparent min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#00233B] flex items-center gap-3">
              <UsersIcon className="w-8 h-8 text-[#BFCF99]" />
              {isAdmin ? 'Gestão de Usuários Corporativos' : 'Usuários da Minha Regional'}
            </h1>
            <p className="text-[#00233B]/80 mt-2">
              {isAdmin
                ? 'Cadastre colaboradores e laboratoristas.'
                : isCliente
                ? 'Visualize os usuários da sua regional'
                : 'Visualize, gerencie e cadastre laboratoristas para sua regional'}
            </p>
          </div>

          {canManageUsers && !isCliente && (
            <Dialog open={isFormOpen} onOpenChange={(open) => {
              setIsFormOpen(open);
              if (!open) handleCloseForm();
            }}>
              <DialogTrigger asChild>
                <Button className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
                  <Plus className="w-4 h-4 mr-2 text-[#BFCF99]" />
                  Cadastrar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F2F1EF]/80 backdrop-blur-lg border-white/20 text-[#00233B]">
                <DialogHeader>
                  <DialogTitle className="text-[#00233B]">
                    {editingUser ? 'Editar Usuário' : 'Cadastrar Novo Usuário Corporativo'}
                  </DialogTitle>
                </DialogHeader>
                <UserForm
                  user={editingUser}
                  onSave={handleSaveUser}
                  onCancel={handleCloseForm}
                  currentUser={currentUser}
                  regionais={regionais}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card className="mb-6 bg-white/20 backdrop-blur-lg border border-white/20">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-[#BFCF99]" />
              <Input
                placeholder="Pesquisar por nome, email, empresa ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-transparent border-white/20 text-[#00233B] placeholder:text-[#00233B]/60"
              />
            </div>
          </CardContent>
        </Card>

        <UsersTable
          filteredUsers={filteredUsers}
          regionais={regionais}
          canManageUsers={canManageUsers}
          isCliente={isCliente}
          isAdmin={isAdmin}
          searchTerm={searchTerm}
          onEdit={handleEdit}
        />
      </div>
    </div>
  );
}