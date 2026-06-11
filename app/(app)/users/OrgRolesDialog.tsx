"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Plus, Trash, Pencil, Check, X, Lock, Loader2 } from "lucide-react";
import { IOrgRole } from "@/types/IUser";
import {
  apiGetOrgRoles,
  apiCreateOrgRole,
  apiUpdateOrgRole,
  apiDeleteOrgRole,
} from "./orgRolesApi";

interface OrgRolesDialogProps {
  // Se llama tras cualquier cambio para refrescar la tabla de usuarios.
  onChanged?: () => void;
}

export function OrgRolesDialog({ onChanged }: OrgRolesDialogProps) {
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState<IOrgRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setRoles(await apiGetOrgRoles());
    } catch (e) {
      console.error("Error cargando cargos:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    setError(null);
    try {
      await apiCreateOrgRole(name);
      setNewName("");
      await load();
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message || "No se pudo crear el cargo");
    } finally {
      setCreating(false);
    }
  };

  const handleRename = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    setError(null);
    try {
      await apiUpdateOrgRole(id, name);
      setEditingId(null);
      setEditName("");
      await load();
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message || "No se pudo renombrar el cargo");
    }
  };

  const handleDelete = async (role: IOrgRole) => {
    if (!window.confirm(`¿Eliminar el cargo "${role.name}"?`)) return;
    setError(null);
    try {
      await apiDeleteOrgRole(role.id);
      await load();
      onChanged?.();
    } catch (e: any) {
      setError(e?.response?.data?.message || "No se pudo eliminar el cargo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Briefcase className="h-4 w-4" />
          Gestionar cargos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Cargos organizativos
          </DialogTitle>
          <DialogDescription>
            Cargos de la asociación (Presidente, Secretario, Tesorero, etc.). No
            son roles de sistema. Crea los que tu única necesite.
          </DialogDescription>
        </DialogHeader>

        {/* Crear nuevo */}
        <div className="flex items-center gap-2">
          <Input
            placeholder="Nuevo cargo (ej. Fiscal, Vocal)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            className="h-10"
          />
          <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="gap-1.5 shrink-0">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Agregar
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Lista */}
        <div className="max-h-[340px] overflow-y-auto space-y-1.5 pr-1">
          {loading ? (
            <div className="flex justify-center py-8 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No hay cargos todavía.
            </p>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
              >
                {editingId === role.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleRename(role.id);
                        }
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      autoFocus
                      className="h-8"
                    />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => handleRename(role.id)}>
                      <Check className="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => setEditingId(null)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium">{role.name}</span>
                    {role.isDefault && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Lock className="h-3 w-3" />
                        Por defecto
                      </Badge>
                    )}
                    {typeof role._count?.users === "number" && (
                      <span className="text-[11px] text-muted-foreground">
                        {role._count.users} socio{role._count.users === 1 ? "" : "s"}
                      </span>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      onClick={() => {
                        setEditingId(role.id);
                        setEditName(role.name);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0"
                      disabled={role.isDefault}
                      title={role.isDefault ? "No se puede eliminar un cargo por defecto" : "Eliminar"}
                      onClick={() => handleDelete(role)}
                    >
                      <Trash className={`h-4 w-4 ${role.isDefault ? "opacity-30" : "text-destructive"}`} />
                    </Button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
