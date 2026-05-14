"use client";

import { useState } from "react";
import { Plus, Trash2, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useOnboarding } from "../OnboardingProvider";
import { addParticipant, createUser } from "../api";
import { StepShell } from "../components/StepShell";

interface DraftUser {
  dni: string;
  name: string;
  lastname: string;
  email: string;
  phone: string;
}

const emptyDraft: DraftUser = { dni: "", name: "", lastname: "", email: "", phone: "" };

export function StepUsers() {
  const { state, setState } = useOnboarding();
  const [draft, setDraft] = useState<DraftUser>(emptyDraft);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  const addOne = async () => {
    if (!draft.dni.trim() || !draft.name.trim() || !draft.lastname.trim()) {
      toast({ title: "Datos incompletos", description: "DNI, nombre y apellido son obligatorios." });
      return;
    }
    setCreating(true);
    try {
      const created = await createUser({
        dni: draft.dni.trim(),
        name: draft.name.trim(),
        lastname: draft.lastname.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim() || undefined,
      });
      setState((s) => ({ ...s, users: [...s.users, created] }));
      setDraft(emptyDraft);
      toast({ title: "Socio agregado", description: `${created.name} ${created.lastname}` });
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo crear el socio.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const remove = (id: string) =>
    setState((s) => ({ ...s, users: s.users.filter((u) => u.id !== id) }));

  const onNext = async () => {
    if (state.users.length === 0) {
      toast({ title: "Sin socios", description: "Agrega al menos un socio antes de continuar." });
      throw new Error("no users");
    }
    setSaving(true);
    try {
      await Promise.allSettled(state.users.map((u) => addParticipant(u.id)));
      toast({ title: "Socios listos" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <StepShell
      stepId="users"
      title="Socios de la úNICA"
      description="Registra a todos los socios. Estos serán los participantes de la asamblea."
      onNext={onNext}
      saving={saving}
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border p-5 bg-muted/30">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Agregar socio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">DNI</Label>
              <Input
                placeholder="00000000"
                value={draft.dni}
                onChange={(e) => setDraft({ ...draft, dni: e.target.value })}
                className="mt-1"
              />
            </div>
            <div className="md:col-span-1" />
            <div>
              <Label className="text-xs">Nombres</Label>
              <Input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Apellidos</Label>
              <Input
                value={draft.lastname}
                onChange={(e) => setDraft({ ...draft, lastname: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Email (opcional)</Label>
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Teléfono (opcional)</Label>
              <Input
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={addOne} disabled={creating} size="sm">
              {creating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Plus className="mr-1.5 h-4 w-4" />}
              Agregar
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold mb-2">
            Socios registrados ({state.users.length})
          </h2>
          {state.users.length === 0 ? (
            <div className="rounded-md border border-dashed p-6 text-sm text-muted-foreground text-center">
              Aún no hay socios. Agrega el primero arriba.
            </div>
          ) : (
            <div className="rounded-lg border border-border divide-y">
              {state.users.map((u) => (
                <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {u.name} {u.lastname}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      DNI {u.dni}
                      {u.email && ` · ${u.email}`}
                      {u.phone && ` · ${u.phone}`}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => remove(u.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </StepShell>
  );
}
