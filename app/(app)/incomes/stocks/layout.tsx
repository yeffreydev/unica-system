"use client";
import React from "react";
import { StockProvider, StockContext } from "./StockContext";
import { StocksForm } from "./StocksForm";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StockProvider>
      <div className="relative">
        {children}
        <StocksCustomEditModal />
      </div>
    </StockProvider>
  );
}

function StocksCustomEditModal() {
  const { editingStock, isEditOpen, setIsEditOpen } = React.useContext(StockContext);
  if (!isEditOpen || !editingStock) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="relative z-10 w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg pointer-events-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-sm font-medium">Editar compra de acciones</h3>
          <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setIsEditOpen?.(false)}>
            Cerrar
          </button>
        </div>
        <div className="p-4">
          <StocksForm setOpenDialog={setIsEditOpen!} editStock={editingStock} />
        </div>
      </div>
    </div>
  );
}
