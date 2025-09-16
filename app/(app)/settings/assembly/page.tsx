"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import apiClient from "@/config/apiClient";
import { IUser } from "@/types/IUser";

type Invitee = { id: string; name: string; email: string; role: "Miembro" | "Invitado" | "Directiva" };
type MonthlyRule = { dayOfMonth: number; startTime: string; endTime: string; place: string };

export default function AssemblySettingsPage() {
  


  const [invitees] = useState<Invitee[]>([]);

  const [users, setUsers] = useState<IUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [roleFilters, setRoleFilters] = useState<{ socio: boolean; member: boolean; user: boolean; all: boolean }>({ socio: true, member: true, user: true, all: true });
  const [externalInvite, setExternalInvite] = useState<{ name: string; email: string; phone: string }>({ name: "", email: "", phone: "" });
  const [inviteMessage, setInviteMessage] = useState<string>(
    "Hola, te invitamos a la asamblea mensual. Lugar: Sede Central. Hora: 7:00 pm. ¡Te esperamos!"
  );

  // Regla mensual (simulada por defecto)
  const [monthlyRule, setMonthlyRule] = useState<MonthlyRule>({
    dayOfMonth: 10,
    startTime: "07:00",
    endTime: "09:00",
    place: "Sede Central",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiClient.get("/users");
        if (res.status === 200) setUsers(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUsers();
  }, []);

  const enabledCount = 12; // con regla mensual, todos los meses aplican



  // La configuración mensual reemplaza la edición por mes

  const handleSave = () => {
    // Solo simulación
    console.log({ invitees, monthlyRule, selectedUserIds: Array.from(selectedUserIds), externalInvite, inviteMessage });
    alert("Configuración simulada guardada en consola");
  };

  const toggleAllUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map((u) => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
    setRoleFilters((p) => ({ ...p, all: checked }));
  };

  const toggleRoleFilter = (roleKey: keyof typeof roleFilters, checked: boolean) => {
    setRoleFilters((p) => ({ ...p, [roleKey]: checked, all: false }));
  };

  const roleMatches = (u: IUser) => {
    const roles = (u.roles || []).map((r) => r.toLowerCase());
    if (roleFilters.all) return true;
    return (
      (roleFilters.socio && roles.includes("socio")) ||
      (roleFilters.member && roles.includes("member")) ||
      (roleFilters.user && roles.includes("user"))
    );
  };

  return (
    <div className="px-2 md:px-4 lg:px-6 xl:px-8 2xl:px-10 py-8 flex flex-col gap-6">
<div>
        <h1 className="text-2xl font-bold text-foreground">Configuración de Asamblea</h1>
        <p className="text-sm text-muted-foreground">Invitados por defecto y fechas por cada mes</p>
      </div>

      <div className="flex flex-col gap-6">

<Card className="lg:col-span-2">
  <CardHeader>
    <CardTitle>Configuración mensual</CardTitle>
    <CardDescription>Se repetirá todos los meses según esta regla</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div className="grid grid-cols-1 gap-1">
        <label className="text-[11px] text-muted-foreground">Día del mes</label>
        <Input
          type="number"
          min={1}
          max={31}
          value={monthlyRule.dayOfMonth}
          onChange={(e) => setMonthlyRule((p) => ({ ...p, dayOfMonth: Math.max(1, Math.min(31, Number(e.target.value) || 1)) }))}
        />
      </div>
      <div className="grid grid-cols-1 gap-1">
        <label className="text-[11px] text-muted-foreground">Hora inicio</label>
        <Input type="time" value={monthlyRule.startTime} onChange={(e) => setMonthlyRule((p) => ({ ...p, startTime: e.target.value }))} />
      </div>
      <div className="grid grid-cols-1 gap-1">
        <label className="text-[11px] text-muted-foreground">Hora fin</label>
        <Input type="time" value={monthlyRule.endTime} onChange={(e) => setMonthlyRule((p) => ({ ...p, endTime: e.target.value }))} />
      </div>
      <div className="grid grid-cols-1 gap-1 md:col-span-1">
        <label className="text-[11px] text-muted-foreground">Lugar</label>
        <Input type="text" value={monthlyRule.place} onChange={(e) => setMonthlyRule((p) => ({ ...p, place: e.target.value }))} />
      </div>
    </div>
    <div className="mt-3 text-xs text-muted-foreground">
      Ejemplo: Todos los días <span className="text-foreground font-medium">{monthlyRule.dayOfMonth}</span> de cada mes, de {monthlyRule.startTime} a {monthlyRule.endTime} en {monthlyRule.place}.
    </div>
  </CardContent>
</Card>
</div>


      <Card>
        <CardHeader>
          <CardTitle>Invitados</CardTitle>
          <CardDescription>Selecciona usuarios por rol, agrega externos y define el mensaje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox id="all-users" checked={roleFilters.all && selectedUserIds.size === users.length && users.length > 0} onCheckedChange={(v) => toggleAllUsers(Boolean(v))} />
              <label htmlFor="all-users" className="text-sm">Todos</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="role-socio" checked={roleFilters.socio} onCheckedChange={(v) => toggleRoleFilter("socio", Boolean(v))} />
              <label htmlFor="role-socio" className="text-sm">Socio</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="role-member" checked={roleFilters.member} onCheckedChange={(v) => toggleRoleFilter("member", Boolean(v))} />
              <label htmlFor="role-member" className="text-sm">Member</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="role-user" checked={roleFilters.user} onCheckedChange={(v) => toggleRoleFilter("user", Boolean(v))} />
              <label htmlFor="role-user" className="text-sm">User</label>
            </div>
            <div className="ml-auto text-xs text-muted-foreground">
              Seleccionados: <span className="text-foreground font-medium">{selectedUserIds.size}</span> de {users.length}
            </div>
          </div>

          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[1%]"></TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Documento</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.filter(roleMatches).map((u) => {
                  const checked = selectedUserIds.has(u.id);
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Checkbox checked={checked} onCheckedChange={(v) => {
                          setSelectedUserIds((prev) => {
                            const next = new Set(prev);
                            if (v) next.add(u.id); else next.delete(u.id);
                            return next;
                          });
                        }} />
                      </TableCell>
                      <TableCell className="text-sm">{u.name} {u.lastname}</TableCell>
                      <TableCell className="text-sm">{u.dni}</TableCell>
                      <TableCell className="text-sm lowercase">{u.email}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{u.roles?.join(", ")}</TableCell>
                    </TableRow>
                  );
                })}
                {users.filter(roleMatches).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">No hay usuarios para los filtros seleccionados</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="grid grid-cols-1 gap-1">
              <label className="text-[11px] text-muted-foreground">Nombre (externo)</label>
              <Input placeholder="Nombre y Apellido" value={externalInvite.name} onChange={(e) => setExternalInvite((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 gap-1">
              <label className="text-[11px] text-muted-foreground">Email (externo)</label>
              <Input placeholder="correo@dominio.com" value={externalInvite.email} onChange={(e) => setExternalInvite((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="grid grid-cols-1 gap-1">
              <label className="text-[11px] text-muted-foreground">Teléfono (externo)</label>
              <Input placeholder="999 999 999" value={externalInvite.phone} onChange={(e) => setExternalInvite((p) => ({ ...p, phone: e.target.value }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-[11px] text-muted-foreground">Mensaje de invitación (editable)</label>
            <Textarea rows={4} value={inviteMessage} onChange={(e) => setInviteMessage(e.target.value)} />
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => { setSelectedUserIds(new Set()); setExternalInvite({ name: "", email: "", phone: "" }); }}>Limpiar</Button>
            <Button onClick={() => {
              const selectedUsers = users.filter(u => selectedUserIds.has(u.id));
              console.log("Enviar invitaciones", { selectedUsers, externalInvite, inviteMessage });
              alert("Invitaciones simuladas en consola");
            }}>Enviar invitaciones</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{enabledCount}</span> meses activos · {invitees.length} invitados
        </div>
        <Button onClick={handleSave}>Guardar configuración</Button>
      </div>
    </div>
  );
}


