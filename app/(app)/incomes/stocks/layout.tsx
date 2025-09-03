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
      {children}
      <StocksCustomEditModal />
    </StockProvider>
  );
}

function StocksCustomEditModal() {
  const { editingStock, isEditOpen, setIsEditOpen } = React.useContext(StockContext);
  if (!isEditOpen || !editingStock) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => setIsEditOpen?.(false)} />
      <div className="relative z-10 w-full max-w-md rounded-lg border bg-card text-card-foreground shadow-lg">
        <div className="p-4 border-b">
          <h3 className="text-sm font-medium">Editar compra de acciones</h3>
        </div>
        <div className="p-4">
          <StocksForm setOpenDialog={setIsEditOpen!} editStock={editingStock} />
        </div>
      </div>
    </div>
  );
}
