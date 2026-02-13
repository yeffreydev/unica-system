"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";
import { apiBuySharesInAssembly, apiGetAssemblyRun, apiGetPartnersWithShares } from "../api";
import { IAssemblyScheduleRun, IPartnerShares, IUserStock } from "../types";
import { useAssembly } from "../AssemblyContext";


export default function Shares() {
  const { users } = useContext(AppContext);
    const { assembly } = useAssembly();
  
   const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [partnerShares, setPartnerShares] = useState<IPartnerShares[]>([]); // To store shares data
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price] = useState(10); // Fixed price for now
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddShares = (user: IPartnerShares) => {
    setSelectedUser(user);
    const currentShares = user.shares.reduce((sum, share) => sum + share.quantity, 0);
    setQuantity(currentShares || 1);
    setModalOpen(true);
  };

  const confirmPurchase = async () => {
   try {
     if (!selectedUser) return;

    const data: IUserStock = await apiBuySharesInAssembly(
      assemblyRun?.id || '',
      {
      userId: selectedUser.id,
      shares: quantity,
      date: assemblyRun?.startAt ?? new Date(),
      }
    );
    
    //update state on partnerShares
    
    const updatedShares = partnerShares.map(partner => {
      if (partner.id === selectedUser.id) {
        // Replace or add the new share in the user's shares array
        const shares = partner.shares.some(share => share.id === data.id)
          ? partner.shares.map(share => share.id === data.id ? data : share)
          : [...partner.shares, data];
        return {
          ...partner,
          shares,
        };
      }
      return partner;
    });
    setPartnerShares(updatedShares);
    
    setModalOpen(false);
    setSelectedUser(null);
   } catch (error) {
     console.error('Error confirming purchase:', error);
   }
  };

  

  // const totalShares = Array.from(purchases.values()).reduce((sum, purchase) => sum + purchase.quantity, 0);
  // const totalAmount = Array.from(purchases.values()).reduce((sum, purchase) => sum + (purchase.quantity * purchase.price), 0);
  useEffect(() => {
     //get assembly run
     (async () => {
       if (!assembly?.lastRun) return;
       const data = await apiGetAssemblyRun(assembly.lastRun.id);
       console.log({ data });
       setAssemblyRun(data);
     })();
   }, [assembly?.lastRun]);
 
  useEffect(() => {
    console.log('effect run');
    console.log(assemblyRun)
    if (!assemblyRun) return;
    console.log(assemblyRun)
    // Fetch partners with shares from the server
    const fetchPartnersWithShares = async () => {
      try {
        const data = await apiGetPartnersWithShares(assemblyRun?.id || '');
       console.log('Fetched partners with shares:', data);
        setPartnerShares(data);
      } catch (error) {
        console.error('Error fetching partners with shares:', error);
      }
    };

    fetchPartnersWithShares();
  }, [assemblyRun]);

  const totalShares = partnerShares.reduce((sum, user) => sum + user.shares.reduce((s, share) => s + share.quantity, 0), 0);
  const totalAmount = partnerShares.reduce((sum, user) => sum + user.shares.reduce((s, share) => s + (share.quantity * share.price), 0), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aporte de compra de acciones</CardTitle>
        <CardDescription>Lista de usuarios - haz clic en &quot;Agregar&quot; para comprar acciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center text-sm">
          <div>
            Total acciones: <span className="font-semibold">{totalShares}</span>
          </div>
          <div>
            Total monto: <span className="font-semibold text-foreground">S/ {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead>DNI</TableHead> */}
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones Compradas</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...partnerShares]
              .filter((user) => {
                if (!searchQuery.trim()) return true;
                const fullName = `${user.lastname} ${user.name}`.toLowerCase();
                return fullName.includes(searchQuery.toLowerCase());
              })
              .sort((a, b) => {
                const lastNameCompare = (a.lastname || '').localeCompare(b.lastname || '', 'es');
                if (lastNameCompare !== 0) return lastNameCompare;
                return (a.name || '').localeCompare(b.name || '', 'es');
              }).map((user: IPartnerShares) => {
  const shares = user.shares.reduce((sum, share) => sum + share.quantity, 0);
  const totalForUser = user.shares.reduce((sum, share) => sum + (share.quantity * share.price), 0);
                return (
                  <TableRow key={user.id}>
                    {/* <TableCell className="text-sm">{user.dni}</TableCell> */}
                    <TableCell className="text-sm font-medium">{`${user.lastname}, ${user.name}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={shares> 0 ? "default" : "destructive"}
                          className={`text-xs ${shares >0 ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}`}
                        >
                          {shares > 0 ? `${shares} acciones` : "Sin comprar"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>S/ {price.toFixed(2)}</TableCell>
                    <TableCell className={`font-semibold ${totalForUser >0 ? "text-green-700 dark:text-green-400" : "text-gray-500"}`}>
                      S/ {totalForUser >0 ? totalForUser.toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAddShares(user)}
                        size="sm"
                        variant={shares >0 ? "outline" : "default"}
                        className="gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        {shares >0 ? 'Actualizar' : 'Agregar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    No hay usuarios disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedUser && (partnerShares.find(p => p.id === selectedUser.id)?.shares?.reduce((sum, share) => sum + share.quantity, 0) ?? 0) > 0
                  ? "Actualizar Acciones"
                  : "Comprar Acciones"}
              </DialogTitle>
              <DialogDescription>
                {selectedUser && `Comprar acciones para ${selectedUser.name} ${selectedUser.lastname}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Cantidad
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                  className="col-span-3"
                  min="0"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Precio Unitario</Label>
                <div className="col-span-3 text-sm">S/ {price.toFixed(2)}</div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Total</Label>
                <div className="col-span-3 text-sm font-semibold">
                  S/ {(quantity * price).toFixed(2)}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmPurchase}>
                {selectedUser && (partnerShares.find(p => p.id === selectedUser.id)?.shares?.reduce((sum, share) => sum + share.quantity, 0) ?? 0) > 0
                  ? "Actualizar"
                  : "Confirmar Compra"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}


