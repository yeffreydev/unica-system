"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { useContext, useState } from "react";
import { AppContext } from "@/context/AppContext";
import { IUser } from "@/types/IUser";

type SharePurchase = { userId: string; quantity: number; price: number };

export default function Shares() {
  const { users } = useContext(AppContext);
  const [purchases, setPurchases] = useState<Map<string, SharePurchase>>(new Map());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [price] = useState(10); // Fixed price for now

  const handleAddShares = (user: IUser) => {
    setSelectedUser(user);
    setQuantity(1);
    setModalOpen(true);
  };

  const confirmPurchase = () => {
    if (!selectedUser || quantity <= 0) return;

    const purchase: SharePurchase = {
      userId: selectedUser.id,
      quantity,
      price,
    };

    setPurchases(prev => new Map(prev.set(selectedUser!.id, purchase)));
    setModalOpen(false);
    setSelectedUser(null);
  };

  const getUserPurchase = (userId: string) => {
    return purchases.get(userId);
  };

  const totalShares = Array.from(purchases.values()).reduce((sum, purchase) => sum + purchase.quantity, 0);
  const totalAmount = Array.from(purchases.values()).reduce((sum, purchase) => sum + (purchase.quantity * purchase.price), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aporte de compra de acciones</CardTitle>
        <CardDescription>Lista de usuarios - haz clic en &quot;Agregar&quot; para comprar acciones</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DNI</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Acciones Compradas</TableHead>
                <TableHead>Precio Unitario</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const purchase = getUserPurchase(user.id);
                const hasPurchased = purchase && purchase.quantity > 0;
                return (
                  <TableRow key={user.id}>
                    <TableCell className="text-sm">{user.dni}</TableCell>
                    <TableCell className="text-sm font-medium">{`${user.name} ${user.lastname}`}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={hasPurchased ? "default" : "destructive"}
                          className={`text-xs ${hasPurchased ? "bg-green-600 hover:bg-green-700" : "bg-orange-500 hover:bg-orange-600"}`}
                        >
                          {hasPurchased ? `${purchase.quantity} acciones` : "Sin comprar"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>S/ {price.toFixed(2)}</TableCell>
                    <TableCell className={`font-semibold ${hasPurchased ? "text-green-700 dark:text-green-400" : "text-gray-500"}`}>
                      S/ {purchase ? (purchase.quantity * purchase.price).toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleAddShares(user)}
                        size="sm"
                        variant={hasPurchased ? "outline" : "default"}
                        className="gap-2"
                      >
                        <PlusCircle className="w-4 h-4" />
                        {hasPurchased ? 'Actualizar' : 'Agregar'}
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

        <div className="flex justify-between items-center text-sm">
          <div>
            Total acciones: <span className="font-semibold">{totalShares}</span>
          </div>
          <div>
            Total monto: <span className="font-semibold text-foreground">S/ {totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Comprar Acciones</DialogTitle>
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
                  onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                  className="col-span-3"
                  min="1"
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
                Confirmar Compra
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}


