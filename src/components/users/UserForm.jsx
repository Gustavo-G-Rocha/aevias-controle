import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Users as UsersIcon } from "lucide-react";
import { resolveAccessLevel, validateEmailDomain, sanitizeUserFormData } from "@/utils/usersUtils";

const UserForm = React.memo(({ user: editingUser, onSave, onCancel, currentUser, regionais }) => {
  const [formData, setFormData] = useState(
    editingUser ? {
      ...editingUser,
      access_level: editingUser.access_level || (editingUser.role === 'admin' ? 'admin' : 'user'),
    } : {
      laboratorista_name: "",
      email: "",
      access_level: "user",
      company: "",
      position: "",
      phone: "",
      crea_number: "",
      is_active: true,
    }
  );

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (!editingUser && formData.email) {
      const error = validateEmailDomain(formData.email, formData.access_level);
      if (error) { alert(error); return; }
    }

    onSave(sanitizeUserFormData(formData));
  }, [formData, editingUser, onSave]);

  const currentUserAccessLevel = resolveAccessLevel(currentUser);
  const isGestorOrSalaTecnica  = currentUserAccessLevel === 'gestor_contrato' || currentUserAccessLevel === 'sala_tecnica_afirmaevias';

  const regionalDoUsuario = useMemo(() => {
    if (!isGestorOrSalaTecnica || !regionais || !currentUser) return null;
    return regionais.find(regional => {
      if (currentUserAccessLevel === 'gestor_contrato') {
        return regional.gestor_contrato_responsavel?.toLowerCase() === currentUser.email.toLowerCase();
      }
      if (currentUserAccessLevel === 'sala_tecnica_afirmaevias') {
        const salas = regional.salas_tecnicas_responsaveis || [];
        return salas.some(e => e.toLowerCase() === currentUser.email.toLowerCase());
      }
      return false;
    });
  }, [isGestorOrSalaTecnica, regionais, currentUser, currentUserAccessLevel]);

  return (
    <div className="space-y-6">
      {!editingUser && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold text-blue-900">Cadastro Corporativo</h4>
              <p className="text-sm text-blue-700 mt-1">
                O usuário receberá um convite por email para acessar o sistema.
                {isGestorOrSalaTecnica && regionalDoUsuario && (
                  <span className="block mt-2 font-semibold">
                    ✅ O laboratorista será automaticamente alocado na regional "{regionalDoUsuario.nome}".
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="laboratorista_name">Nome Completo *</Label>
            <Input id="laboratorista_name" value={formData.laboratorista_name}
              onChange={(e) => handleInputChange("laboratorista_name", e.target.value)}
              required placeholder="Nome completo do colaborador" />
          </div>
          <div>
            <Label htmlFor="email">Email Corporativo *</Label>
            <Input id="email" type="email" value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="usuario@empresa.com" required disabled={!!editingUser} />
            {!editingUser && (
              <p className="text-xs text-slate-500 mt-1">
                Apenas emails dos domínios autorizados pela empresa são aceitos
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="company">Empresa/Setor *</Label>
            <Input id="company" value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Ex: Afirmaevias, Laboratório, etc." required />
          </div>
          <div>
            <Label htmlFor="position">Cargo</Label>
            <Input id="position" value={formData.position}
              onChange={(e) => handleInputChange("position", e.target.value)}
              placeholder="Ex: Engenheiro, Técnico, Analista" />
            {formData.access_level === 'cliente' && (
              <p className="text-xs text-slate-500 mt-1">
                <strong>Engenheiros</strong> poderão assinar registros para dar ciência
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="access_level">Nível de Acesso *</Label>
          <Select value={formData.access_level}
            onValueChange={(value) => handleInputChange("access_level", value)}
            disabled={isGestorOrSalaTecnica}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {!isGestorOrSalaTecnica && <SelectItem value="admin">Administrador</SelectItem>}
              {!isGestorOrSalaTecnica && <SelectItem value="sala_tecnica_afirmaevias">Sala Técnica - Afirmaevias</SelectItem>}
              {!isGestorOrSalaTecnica && <SelectItem value="gestor_contrato">Gestor de Contrato</SelectItem>}
              <SelectItem value="user">Laboratorista</SelectItem>
              {!isGestorOrSalaTecnica && <SelectItem value="cliente">Cliente</SelectItem>}
            </SelectContent>
          </Select>
          {isGestorOrSalaTecnica && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Você só pode criar usuários com nível "Laboratorista"
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(XX) XXXXX-XXXX" />
          </div>
          <div>
            <Label htmlFor="crea_number">Número do CREA/CAU</Label>
            <Input id="crea_number" value={formData.crea_number}
              onChange={(e) => handleInputChange("crea_number", e.target.value)}
              placeholder="Ex: CREA-PR 12345/D" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="is_active" checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange("is_active", checked)} />
          <Label htmlFor="is_active">Usuário Ativo</Label>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} className="hover:bg-black/10">
            Cancelar
          </Button>
          <Button type="submit" className="bg-[#00233B] text-[#F2F1EF] hover:bg-[#00233B]/90">
            {editingUser ? "Salvar Alterações" : "Cadastrar e Enviar Convite"}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
});

UserForm.displayName = 'UserForm';
export default UserForm;