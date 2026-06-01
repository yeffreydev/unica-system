"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search, BarChart3, Minus, Plus } from "lucide-react";
import { sileo } from "sileo";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";
import { apiBuySharesInAssembly, apiGetAssemblyRun, apiGetPartnersWithShares } from "../api";
import { IAssemblyScheduleRun, IPartnerShares, IUserStock } from "../types";
import { useAssembly } from "../AssemblyContext";

export default function Shares() {
  const { users, bank } = useContext(AppContext);
  const { assembly } = useAssembly();

  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [partnerShares, setPartnerShares] = useState<IPartnerShares[]>([]);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [quantity, setQuantity] = useState(1);
  const price = bank?.mainStock?.price ?? 0;
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddShares = (user: IPartnerShares) => {
    setSelectedUser(user);
    const currentShares = user.shares.reduce((sum, share) => sum + share.quantity, 0);
    setQuantity(currentShares || 1);
    setModalOpen(true);
  };

  const confirmPurchase = async () => {
    try {
      if (!selectedUser) return;

      const data: IUserStock = await apiBuySharesInAssembly(assemblyRun?.id || "", {
        userId: selectedUser.id,
        shares: quantity,
        date: assemblyRun?.startAt ?? new Date(),
      });

      const updatedShares = partnerShares.map((partner) => {
        if (partner.id === selectedUser.id) {
          const shares = partner.shares.some((share) => share.id === data.id)
            ? partner.shares.map((share) => (share.id === data.id ? data : share))
            : [...partner.shares, data];
          return { ...partner, shares };
        }
        return partner;
      });
      setPartnerShares(updatedShares);

      const isUpdate = (partnerShares.find((p) => p.id === selectedUser.id)?.shares?.reduce((s, sh) => s + sh.quantity, 0) ?? 0) > 0;
      sileo.success({
        title: isUpdate ? "Acciones actualizadas" : "Compra registrada",
        description: `${quantity} acciones para ${selectedUser.name} ${selectedUser.lastname} (S/ ${(quantity * price).toFixed(2)}).`,
      });

      setModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error confirming purchase:", error);
      sileo.error({ title: "Error", description: "No se pudo registrar la compra de acciones." });
    }
  };

  useEffect(() => {
    (async () => {
      if (!assembly?.lastRun) return;
      const data = await apiGetAssemblyRun(assembly.lastRun.id);
      setAssemblyRun(data);
    })();
  }, [assembly?.lastRun]);

  useEffect(() => {
    if (!assemblyRun) return;
    const fetchPartnersWithShares = async () => {
      try {
        const data = await apiGetPartnersWithShares(assemblyRun?.id || "");
        setPartnerShares(data);
      } catch (error) {
        console.error("Error fetching partners with shares:", error);
        sileo.error({ title: "Error", description: "No se pudieron cargar las acciones." });
      }
    };
    fetchPartnersWithShares();
  }, [assemblyRun]);

  const totalShares = partnerShares.reduce((sum, user) => sum + user.shares.reduce((s, share) => s + share.quantity, 0), 0);
  const totalAmount = partnerShares.reduce((sum, user) => sum + user.shares.reduce((s, share) => s + share.quantity * share.price, 0), 0);
  const buyersCount = partnerShares.filter((u) => u.shares.reduce((s, sh) => s + sh.quantity, 0) > 0).length;

  const selectedUserShares = selectedUser
    ? partnerShares.find((p) => p.id === selectedUser.id)?.shares?.reduce((s, sh) => s + sh.quantity, 0) ?? 0
    : 0;
  const isUpdate = selectedUserShares > 0;

  return (
    <Card className="w-full overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-0 pt-4 sm:pt-5 px-3 sm:px-5">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-base font-semibold">Compra de Acciones</CardTitle>
          <Badge variant="outline" className="text-xs font-medium gap-1">
            <BarChart3 className="w-3 h-3" />
            S/ {price.toFixed(2)} / acción
          </Badge>
        </div>

        {/* Stats */}
        {assemblyRun && (
          <div className="flex items-center gap-2 flex-wrap pb-4">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-semibold tabular-nums">{buyersCount}</span>
              <span className="text-muted-foreground">Compraron</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-xs">
              <span className="font-semibold tabular-nums">{totalShares}</span>
              <span className="text-muted-foreground">Acciones</span>
            </div>
            {totalAmount > 0 && (
              <>
                <div className="h-4 w-px bg-border mx-1" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">S/ {totalAmount.toFixed(2)}</span>
              </>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-0">
        {!assemblyRun ? (
          <div className="px-3 sm:px-5 pb-5 space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="px-3 sm:px-5 pt-1 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-muted/30 border-0 focus-visible:ring-1 text-sm"
                />
              </div>
            </div>

            {/* Partners List */}
            <div className="px-3 sm:px-5 pb-5 space-y-1.5 max-h-[500px] overflow-y-auto">
              {[...partnerShares]
                .filter((user) => {
                  if (!searchQuery.trim()) return true;
                  const fullName = `${user.lastname} ${user.name}`.toLowerCase();
                  return fullName.includes(searchQuery.toLowerCase());
                })
                .sort((a, b) => {
                  const lastNameCompare = (a.lastname || "").localeCompare(b.lastname || "", "es");
                  if (lastNameCompare !== 0) return lastNameCompare;
                  return (a.name || "").localeCompare(b.name || "", "es");
                })
                .map((user: IPartnerShares) => {
                  const shares = user.shares.reduce((sum, share) => sum + share.quantity, 0);
                  const totalForUser = user.shares.reduce((sum, share) => sum + share.quantity * share.price, 0);
                  return (
                    <div
                      key={user.id}
                      className="group flex flex-wrap items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border bg-card hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => handleAddShares(user)}
                    >
                      {/* Avatar */}
                      <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {user.name?.[0]}
                        {user.lastname?.[0]}
                      </div>

                      {/* Name & shares */}
                      <div className="flex-1 min-w-[140px]">
                        <div className="font-medium text-sm truncate">
                          {user.lastname}, {user.name}
                        </div>
                        {shares > 0 ? (
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
                              {shares} {shares === 1 ? "acción" : "acciones"}
                            </Badge>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              S/ {totalForUser.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">Sin acciones</span>
                        )}
                      </div>

                      {/* Action */}
                      <Button
                        size="sm"
                        variant={shares > 0 ? "outline" : "default"}
                        className="gap-1.5 h-8 text-xs shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddShares(user);
                        }}
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        {shares > 0 ? "Editar" : "Comprar"}
                      </Button>
                    </div>
                  );
                })}
              {partnerShares.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">No hay usuarios disponibles</div>
              )}
            </div>
          </>
        )}
      </CardContent>

      {/* Purchase Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isUpdate ? "Actualizar Acciones" : "Comprar Acciones"}</DialogTitle>
            <DialogDescription>
              {selectedUser && `${selectedUser.name} ${selectedUser.lastname}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            {/* Quantity with stepper */}
            <div className="space-y-2">
              <Label className="text-sm">Cantidad de acciones</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-10 w-10 p-0 shrink-0" onClick={() => setQuantity(Math.max(0, quantity - 1))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity === 0 ? "" : quantity}
                  onChange={(e) => setQuantity(e.target.value === "" ? 0 : Number(e.target.value))}
                  className="text-center text-lg font-semibold h-10"
                  min="0"
                />
                <Button variant="outline" size="sm" className="h-10 w-10 p-0 shrink-0" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Precio unitario</span>
                <span>S/ {price.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cantidad</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="border-t border-border pt-1.5 flex items-center justify-between">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold text-primary">S/ {(quantity * price).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmPurchase}>{isUpdate ? "Actualizar" : "Confirmar Compra"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
