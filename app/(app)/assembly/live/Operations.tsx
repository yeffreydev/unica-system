"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, MoreVertical, Trash2, DollarSign, FileText } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DepositsDialog } from "../../incomes/deposits/DepositsDialog";
import { IDeposit } from "../../incomes/deposits/types";
import { DepositForm } from "../../incomes/deposits/DepositForm";
import { useAssembly } from "../AssemblyContext";
import { IAssemblyScheduleRun } from "../types";
import { apiGetAssemblyRun } from "../api";
import apiClient from "@/config/apiClient";
import { ISocialFundsTransaction } from "@/types/ISocialFunds";
import { LegalsDialog } from "../../incomes/social/LegalsDialog";
import { SocialLegalFundsForm } from "../../incomes/social/SocialLegalFundsForm";
import { IOtherIncome } from "../../incomes/others/types";
import { OthersDialog } from "../../incomes/others/OthersDialog";
import { OtherIncomeForm } from "../../incomes/others/OtherIncomeForm";
import { socialFundsData } from "@/constants";
import { IWithdrawal } from "../../expenses/withdrawls/types";
import { WithdrawalsDialog } from "../../expenses/withdrawls/WithdrawalsDialog";
import { WithdrawForm } from "../../expenses/withdrawls/WithdrawForm";
import { IAdministrativeExpense } from "../../expenses/administrative/types";
import { AdministrativeDialog } from "../../expenses/administrative/AdministrativeDialog";
import { AdminExpenseForm } from "../../expenses/administrative/AdminExpenseForm";
import { IPayout } from "../../expenses/payouts/types";
import { PayoutsDialog } from "../../expenses/payouts/PayoutsDialog";
import { InterestPaymentForm } from "../../expenses/payouts/InterestPaymentForm";
import { ISocialFundsExpenseTransaction } from "../../expenses/social/types";
import { SocialDialog } from "../../expenses/social/SocialDialog";
import { SocialLegalFundsExpenseForm } from "../../expenses/social/SocialLegalFundsExpenseForm";
import { IOtherExpense } from "../../expenses/others/types";
import { OthersExpenseDialog } from "../../expenses/others/OthersExpenseDialog";
import { OtherExpenseForm } from "../../expenses/others/OtherExpenseForm";
import { ISocialFunds } from "@/types/ISocialFunds";

type OperationType = 'deposits' | 'funds' | 'others' | 'withdrawals' | 'administrative' | 'payouts' | 'social' | 'expense-others';

interface OperationData {
  id: string;
  user?: string;
  amount: number;
  date: string;
  description?: string;
}

export default function Operations() {
  const [selectedIngresoType, setSelectedIngresoType] = useState<OperationType | null>(null);
  const [selectedEgresoType, setSelectedEgresoType] = useState<OperationType | null>(null);
  const [editDeposit, setEditDeposit] = useState<IDeposit | null>(null);
  const [deposits, setDeposits] = useState<IDeposit[]>([]);
  const [funds, setFunds] = useState<ISocialFundsTransaction[]>([]);
  const [otherIncomes, setOtherIncomes] = useState<IOtherIncome[]>([]);
  const [withdrawals, setWithdrawals] = useState<IWithdrawal[]>([]);
  const [administrativeExpenses, setAdministrativeExpenses] = useState<IAdministrativeExpense[]>([]);
  const [payouts, setPayouts] = useState<IPayout[]>([]);
  const [socialFundsExpenses, setSocialFundsExpenses] = useState<ISocialFundsExpenseTransaction[]>([]);
  const [otherExpenses, setOtherExpenses] = useState<IOtherExpense[]>([]);
  const [socialFunds, setSocialFunds] = useState<ISocialFunds[]>([]);
  const { assembly } = useAssembly();
  const [assemblyRun, setAssemblyRun] = useState<IAssemblyScheduleRun | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [depositToDelete, setDepositToDelete] = useState<string | null>(null);
  const [fundToDelete, setFundToDelete] = useState<string | null>(null);
  const [otherIncomeToDelete, setOtherIncomeToDelete] = useState<string | null>(null);
  const [withdrawalToDelete, setWithdrawalToDelete] = useState<string | null>(null);
  const [administrativeToDelete, setAdministrativeToDelete] = useState<string | null>(null);
  const [payoutToDelete, setPayoutToDelete] = useState<string | null>(null);
  const [socialFundExpenseToDelete, setSocialFundExpenseToDelete] = useState<string | null>(null);
  const [otherExpenseToDelete, setOtherExpenseToDelete] = useState<string | null>(null);

  

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
        //fetch deposits for this assembly run
        (async () => {
          if (!assemblyRun?.id) {
            console.log("No assembly run ID available yet");
            return;
          }
          try {
            const res = await apiClient.get(`/deposits/schedule-run/${assemblyRun.id}`);
            if (!res.data) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = res.data as IDeposit[];
            console.log("Fetched deposits:", data);
            setDeposits(data);
          } catch (error) {
            console.error("Error fetching deposits for assembly run:", error);
            setDeposits([]);
          }
        })();
     }, [assemblyRun?.id]);


      useEffect(() => {
        //fetch deposits for this assembly run
        (async () => {
          if (!assemblyRun?.id) {
            console.log("No assembly run ID available yet");
            return;
          }
          try {
            const res = await apiClient.get(`/incomes/social-funds/schedule-run/${assemblyRun.id}`);
            if (!res.data) {
              throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = res.data as ISocialFundsTransaction[];
            console.log("Fetched funds:", data);
            setFunds(data);
          } catch (error) {
            console.error("Error fetching funds for assembly run:", error);
            setFunds([]);
          }
        })();
     }, [assemblyRun?.id]);

     useEffect(() => {
       //fetch other incomes for this assembly run
       (async () => {
         if (!assemblyRun?.id) {
           console.log("No assembly run ID available yet");
           return;
         }
         try {
           const res = await apiClient.get(`/incomes/others/schedule-run/${assemblyRun.id}`);
           if (!res.data) {
             throw new Error(`HTTP error! status: ${res.status}`);
           }
           const data = res.data as IOtherIncome[];
           console.log("Fetched other incomes:", data);
           setOtherIncomes(data);
         } catch (error) {
           console.error("Error fetching other incomes for assembly run:", error);
           setOtherIncomes([]);
         }
       })();
    }, [assemblyRun?.id]);

     useEffect(() => {
       //fetch withdrawals for this assembly run
       (async () => {
         if (!assemblyRun?.id) return;
         try {
           const res = await apiClient.get(`/withdrawals/schedule-run/${assemblyRun.id}`);
           if (!res.data) throw new Error(`HTTP error! status: ${res.status}`);
           setWithdrawals(res.data as IWithdrawal[]);
         } catch (error) {
           console.error("Error fetching withdrawals:", error);
           setWithdrawals([]);
         }
       })();
    }, [assemblyRun?.id]);

    useEffect(() => {
      //fetch administrative expenses
      (async () => {
        if (!assemblyRun?.id) return;
        try {
          const res = await apiClient.get(`/expenses/administrative/schedule-run/${assemblyRun.id}`);
          if (!res.data) throw new Error(`HTTP error! status: ${res.status}`);
          setAdministrativeExpenses(res.data as IAdministrativeExpense[]);
        } catch (error) {
          console.error("Error fetching administrative expenses:", error);
          setAdministrativeExpenses([]);
        }
      })();
   }, [assemblyRun?.id]);

   useEffect(() => {
     //fetch payouts
     (async () => {
       if (!assemblyRun?.id) return;
       try {
         const res = await apiClient.get(`/payouts/schedule-run/${assemblyRun.id}`);
         if (!res.data) throw new Error(`HTTP error! status: ${res.status}`);
         setPayouts(res.data as IPayout[]);
       } catch (error) {
         console.error("Error fetching payouts:", error);
         setPayouts([]);
       }
     })();
  }, [assemblyRun?.id]);

  useEffect(() => {
    //fetch social funds expenses
    (async () => {
      if (!assemblyRun?.id) return;
      try {
        const res = await apiClient.get(`/expenses/social-funds/schedule-run/${assemblyRun.id}`);
        if (!res.data) throw new Error(`HTTP error! status: ${res.status}`);
        setSocialFundsExpenses(res.data as ISocialFundsExpenseTransaction[]);
      } catch (error) {
        console.error("Error fetching social funds expenses:", error);
        setSocialFundsExpenses([]);
      }
    })();
 }, [assemblyRun?.id]);

 useEffect(() => {
   //fetch other expenses
   (async () => {
     if (!assemblyRun?.id) return;
     try {
       const res = await apiClient.get(`/expenses/others/schedule-run/${assemblyRun.id}`);
       if (!res.data) throw new Error(`HTTP error! status: ${res.status}`);
       setOtherExpenses(res.data as IOtherExpense[]);
     } catch (error) {
       console.error("Error fetching other expenses:", error);
       setOtherExpenses([]);
     }
   })();
}, [assemblyRun?.id]);

useEffect(() => {
  //fetch social funds types
  (async () => {
    try {
      const res = await apiClient.get("/banks/social-funds-types");
      if (!res.data) throw new Error(`HTTP error! status: ${res.status}`);
      setSocialFunds(res.data as ISocialFunds[]);
    } catch (error) {
      console.error("Error fetching social funds types:", error);
      setSocialFunds([]);
    }
  })();
}, []);

  const addDeposit = (deposit: IDeposit) => {
    setDeposits((prev) => [deposit, ...prev]);
  }

  const handleDeleteDeposit = async () => {
    if (!depositToDelete) return;
    
    // Close dialog first to prevent overlay issues
    setDeleteConfirmOpen(false);
    
    try {
      await apiClient.delete(`/deposits/${depositToDelete}`);
      setDeposits((prev) => prev.filter(d => d.id !== depositToDelete));
      console.log("Deposit deleted successfully");
    } catch (error) {
      console.error("Error deleting deposit:", error);
    } finally {
      setDepositToDelete(null);
    }
  }

  const handleDeleteFund = async () => {
    if (!fundToDelete) return;
    
    // Close dialog first to prevent overlay issues
    setDeleteConfirmOpen(false);
    
    try {
      await apiClient.delete(`/incomes/social-funds/${fundToDelete}`);
      setFunds((prev) => prev.filter(f => f.id !== fundToDelete));
      console.log("Fund deleted successfully");
    } catch (error) {
      console.error("Error deleting fund:", error);
    } finally {
      setFundToDelete(null);
    }
  }

  const handleDeleteOtherIncome = async () => {
    if (!otherIncomeToDelete) return;
    
    // Close dialog first to prevent overlay issues
    setDeleteConfirmOpen(false);
    
    try {
      await apiClient.delete(`/incomes/others/${otherIncomeToDelete}`);
      setOtherIncomes((prev) => prev.filter(o => o.id.toString() !== otherIncomeToDelete));
      console.log("Other income deleted successfully");
    } catch (error) {
      console.error("Error deleting other income:", error);
    } finally {
      setOtherIncomeToDelete(null);
    }
  }

  const handleDeleteWithdrawal = async () => {
    if (!withdrawalToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      await apiClient.delete(`/withdrawals/${withdrawalToDelete}`);
      setWithdrawals((prev) => prev.filter(w => w.id.toString() !== withdrawalToDelete));
      console.log("Withdrawal deleted successfully");
    } catch (error) {
      console.error("Error deleting withdrawal:", error);
    } finally {
      setWithdrawalToDelete(null);
    }
  }

  const handleDeleteAdministrative = async () => {
    if (!administrativeToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      await apiClient.delete(`/expenses/administrative/${administrativeToDelete}`);
      setAdministrativeExpenses((prev) => prev.filter(a => a.id !== administrativeToDelete));
      console.log("Administrative expense deleted successfully");
    } catch (error) {
      console.error("Error deleting administrative expense:", error);
    } finally {
      setAdministrativeToDelete(null);
    }
  }

  const handleDeletePayout = async () => {
    if (!payoutToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      await apiClient.delete(`/payouts/${payoutToDelete}`);
      setPayouts((prev) => prev.filter(p => p.id.toString() !== payoutToDelete));
      console.log("Payout deleted successfully");
    } catch (error) {
      console.error("Error deleting payout:", error);
    } finally {
      setPayoutToDelete(null);
    }
  }

  const handleDeleteSocialFundExpense = async () => {
    if (!socialFundExpenseToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      await apiClient.delete(`/expenses/social-funds/${socialFundExpenseToDelete}`);
      setSocialFundsExpenses((prev) => prev.filter(s => s.id.toString() !== socialFundExpenseToDelete));
      console.log("Social fund expense deleted successfully");
    } catch (error) {
      console.error("Error deleting social fund expense:", error);
    } finally {
      setSocialFundExpenseToDelete(null);
    }
  }

  const handleDeleteOtherExpense = async () => {
    if (!otherExpenseToDelete) return;
    setDeleteConfirmOpen(false);
    try {
      await apiClient.delete(`/expenses/others/${otherExpenseToDelete}`);
      setOtherExpenses((prev) => prev.filter(o => o.id.toString() !== otherExpenseToDelete));
      console.log("Other expense deleted successfully");
    } catch (error) {
      console.error("Error deleting other expense:", error);
    } finally {
      setOtherExpenseToDelete(null);
    }
  }

  const confirmDelete = (itemId: string, type: 'deposit' | 'fund' | 'other' | 'withdrawal' | 'administrative' | 'payout' | 'social-expense' | 'other-expense') => {
    if (type === 'deposit') {
      setDepositToDelete(itemId);
    } else if (type === 'fund') {
      setFundToDelete(itemId);
    } else if (type === 'other') {
      setOtherIncomeToDelete(itemId);
    } else if (type === 'withdrawal') {
      setWithdrawalToDelete(itemId);
    } else if (type === 'administrative') {
      setAdministrativeToDelete(itemId);
    } else if (type === 'payout') {
      setPayoutToDelete(itemId);
    } else if (type === 'social-expense') {
      setSocialFundExpenseToDelete(itemId);
    } else if (type === 'other-expense') {
      setOtherExpenseToDelete(itemId);
    }
    setDeleteConfirmOpen(true);
  }
  // Placeholder data - in real implementation, fetch from API
  const mockData: Record<OperationType, OperationData[]> = {
    deposits: [
    ],
    funds: [],
    others: [],
    withdrawals: [],
    administrative: [],
    payouts: [],
    social: [],
    'expense-others': []
  };

  const ingresoTypes = [
    { value: 'deposits', label: 'Depósitos', description: 'Ver depósitos realizados por los socios' },
    { value: 'funds', label: 'Fondos', description: 'Ver aportes a fondos sociales' },
    { value: 'others', label: 'Otros', description: 'Ver otros ingresos registrados' }
  ];

  const egresoTypes = [
    { value: 'withdrawals', label: 'Retiros', description: 'Ver retiros realizados por los socios' },
    { value: 'administrative', label: 'Gastos Administrativos', description: 'Ver gastos administrativos' },
    { value: 'payouts', label: 'Pagos a los ahorristas', description: 'Ver pagos a los ahorristas' },
    { value: 'social', label: 'Fondos Social', description: 'Ver gastos en fondos sociales' },
    { value: 'expense-others', label: 'Otros', description: 'Ver otros egresos registrados' }
  ];

  const renderTable = (data: OperationData[], type: string) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No hay operaciones registradas para este tipo
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Monto</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.user || '-'}</TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatCurrency(item.amount)}
              </TableCell>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.description || '-'}</TableCell>
              <TableCell>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <DropdownMenuItem className="cursor-pointer">
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem> */}
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onSelect={(e) => {
                        e.preventDefault();
                        if (item.id) {
                          if (type === 'deposits') {
                            confirmDelete(item.id, 'deposit');
                          } else if (type === 'funds') {
                            confirmDelete(item.id, 'fund');
                          } else if (type === 'others') {
                            confirmDelete(item.id, 'other');
                          } else if (type === 'withdrawals') {
                            confirmDelete(item.id, 'withdrawal');
                          } else if (type === 'administrative') {
                            confirmDelete(item.id, 'administrative');
                          } else if (type === 'payouts') {
                            confirmDelete(item.id, 'payout');
                          } else if (type === 'social') {
                            confirmDelete(item.id, 'social-expense');
                          } else if (type === 'expense-others') {
                            confirmDelete(item.id, 'other-expense');
                          }
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Confirmar eliminación?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La operación será eliminada permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setDepositToDelete(null);
                setFundToDelete(null);
                setOtherIncomeToDelete(null);
                setWithdrawalToDelete(null);
                setAdministrativeToDelete(null);
                setPayoutToDelete(null);
                setSocialFundExpenseToDelete(null);
                setOtherExpenseToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={
                depositToDelete ? handleDeleteDeposit :
                fundToDelete ? handleDeleteFund :
                otherIncomeToDelete ? handleDeleteOtherIncome :
                withdrawalToDelete ? handleDeleteWithdrawal :
                administrativeToDelete ? handleDeleteAdministrative :
                payoutToDelete ? handleDeletePayout :
                socialFundExpenseToDelete ? handleDeleteSocialFundExpense :
                handleDeleteOtherExpense
              }
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="uppercase tracking-wide text-[10px]">Paso 5</Badge>
            <div>
              <CardTitle className="text-base">Operaciones</CardTitle>
              <CardDescription>Registro de ingresos y egresos de la sesión</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="ingresos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ingresos" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Ingresos
              </TabsTrigger>
              <TabsTrigger value="egresos" className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Egresos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ingresos" className="space-y-4">
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {ingresoTypes.map((type) => (
                    <Tooltip key={type.value}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedIngresoType === type.value ? "default" : "outline"}
                          onClick={() => setSelectedIngresoType(type.value as OperationType)}
                          className="flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          {type.label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{type.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>

              {selectedIngresoType ? (
                <div className="rounded-md border bg-card">
                  <div className="p-3 border-b flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {ingresoTypes.find(t => t.value === selectedIngresoType)?.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Operaciones registradas
                      </div>
                    </div>
                    {/* <Button size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Agregar
                    </Button> */}
                    
                    {
                      ingresoTypes.find(t => t.value === selectedIngresoType)?.label === 'Depósitos' && (
                        <DepositsDialog open={openDialog} onOpenChange={setOpenDialog}>
                              <DepositForm defaultDate={new Date(assemblyRun?.startAt ?? Date.now())} scheduleRunId={assemblyRun?.id} addDeposit={addDeposit} setOpenDialog={setOpenDialog} editDeposit={editDeposit} setEditDeposit={setEditDeposit} />
                            </DepositsDialog>
                      )
                    }
                    {
                      ingresoTypes.find(t => t.value === selectedIngresoType)?.label === 'Fondos' && (
                       <LegalsDialog open={openDialog} onOpenChange={setOpenDialog}>
                                 <SocialLegalFundsForm
                                   defaultDate={new Date(assemblyRun?.startAt ?? Date.now())}
                                   setOpenDialog={setOpenDialog}
                                   socialFundsTransactions={funds}
                                   setSocialFundsTransactions={setFunds}
                                   scheduleRunId={assemblyRun?.id}
                                 />
                               </LegalsDialog>
                      )
                    }
                    {
                      ingresoTypes.find(t => t.value === selectedIngresoType)?.label === 'Otros' && (
                        <OthersDialog open={openDialog} onOpenChange={setOpenDialog}>
                          <OtherIncomeForm
                            setOpenDialog={setOpenDialog}
                            otherIncomes={otherIncomes}
                            setOtherIncomes={setOtherIncomes}
                            defaultDate={new Date(assemblyRun?.startAt ?? Date.now())}
                            scheduleRunId={assemblyRun?.id}
                          />
                        </OthersDialog>
                      )
                    }
                  </div>
                  <div className="p-3">
                    { selectedIngresoType === 'deposits'
                      ? renderTable(
                          deposits.map(d => ({
                            id: d.id || '',
                            user: d.user?.name || d.user?.lastname || '-',
                            amount: d.amount,
                            date: new Date(d.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: 'Depósito'
                          })),
                          selectedIngresoType
                        )
                      :  selectedIngresoType === 'funds' ? renderTable(
                          funds.map(f => ({
                            id: f.id || '',
                            user: f.user?.name || f.user?.lastname || '-',
                            amount: f.amount,
                            date: new Date(f.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: f.description ? f.description  +  " '"+ socialFundsData[
                                                      f.socialFunds.name as keyof typeof socialFundsData
                                                    ] + "'": 'Fondo social'
                          })),
                          selectedIngresoType
                        )
                      : selectedIngresoType === 'others' ? renderTable(
                          otherIncomes.map(o => ({
                            id: o.id.toString(),
                            user: o.user?.name || o.user?.lastname || '-',
                            amount: o.amount,
                            date: new Date(o.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: o.description || 'Otro ingreso'
                          })),
                          selectedIngresoType
                        )
                      : renderTable(mockData[selectedIngresoType], selectedIngresoType)
                    }
                   
    
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">Selecciona un tipo de operación</p>
                  <p className="text-sm">Haz clic en uno de los botones arriba para ver las transacciones registradas</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="egresos" className="space-y-4">
              <TooltipProvider>
                <div className="flex flex-wrap gap-2">
                  {egresoTypes.map((type) => (
                    <Tooltip key={type.value}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={selectedEgresoType === type.value ? "default" : "outline"}
                          onClick={() => setSelectedEgresoType(type.value as OperationType)}
                          className="flex items-center gap-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          {type.label}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{type.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </TooltipProvider>

              {selectedEgresoType ? (
                <div className="rounded-md border bg-card">
                  <div className="p-3 border-b flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {egresoTypes.find(t => t.value === selectedEgresoType)?.label}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Operaciones registradas
                      </div>
                    </div>
                    {
                      egresoTypes.find(t => t.value === selectedEgresoType)?.label === 'Retiros' && (
                        <WithdrawalsDialog open={openDialog} onOpenChange={setOpenDialog}>
                          <WithdrawForm
                            setOpenDialog={setOpenDialog}
                            withdrawals={withdrawals}
                            setWithdrawals={setWithdrawals}
                            defaultDate={new Date(assemblyRun?.startAt ?? Date.now())}
                            scheduleRunId={assemblyRun?.id}
                          />
                        </WithdrawalsDialog>
                      )
                    }
                    {
                      egresoTypes.find(t => t.value === selectedEgresoType)?.label === 'Gastos Administrativos' && (
                        <AdministrativeDialog open={openDialog} onOpenChange={setOpenDialog}>
                          <AdminExpenseForm
                            setOpenDialog={setOpenDialog}
                            administrativeExpenses={administrativeExpenses}
                            setAdministrativeExpenses={setAdministrativeExpenses}
                            defaultDate={new Date(assemblyRun?.startAt ?? Date.now())}
                            scheduleRunId={assemblyRun?.id}
                          />
                        </AdministrativeDialog>
                      )
                    }
                    {
                      egresoTypes.find(t => t.value === selectedEgresoType)?.label === 'Pagos a los ahorristas' && (
                        <PayoutsDialog open={openDialog} onOpenChange={setOpenDialog}>
                          <InterestPaymentForm
                            setOpenDialog={setOpenDialog}
                            payouts={payouts}
                            setPayouts={setPayouts}
                            defaultDate={new Date(assemblyRun?.startAt ?? Date.now())}
                            scheduleRunId={assemblyRun?.id}
                          />
                        </PayoutsDialog>
                      )
                    }
                    {
                      egresoTypes.find(t => t.value === selectedEgresoType)?.label === 'Fondos Social' && (
                        <SocialDialog open={openDialog} onOpenChange={setOpenDialog}>
                          <SocialLegalFundsExpenseForm
                            socialFunds={socialFunds}
                            setOpenDialog={setOpenDialog}
                            socialFundsTransactions={socialFundsExpenses}
                            setSocialFundsTransactions={setSocialFundsExpenses}
                            defaultDate={new Date(assemblyRun?.startAt ?? Date.now())}
                            scheduleRunId={assemblyRun?.id}
                          />
                        </SocialDialog>
                      )
                    }
                    {
                      egresoTypes.find(t => t.value === selectedEgresoType)?.label === 'Otros' && (
                        <OthersExpenseDialog open={openDialog} onOpenChange={setOpenDialog}>
                          <OtherExpenseForm
                            setOpenDialog={setOpenDialog}
                            otherExpenses={otherExpenses}
                            setOtherExpenses={setOtherExpenses}
                            defaultDate={new Date(assemblyRun?.startAt ?? Date.now())}
                            scheduleRunId={assemblyRun?.id}
                          />
                        </OthersExpenseDialog>
                      )
                    }
                  </div>
                  <div className="p-3">
                    { selectedEgresoType === 'withdrawals'
                      ? renderTable(
                          withdrawals.map(w => ({
                            id: w.id.toString(),
                            user: w.user?.name || w.user?.lastname || '-',
                            amount: w.amount,
                            date: new Date(w.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: w.description || 'Retiro'
                          })),
                          selectedEgresoType
                        )
                      : selectedEgresoType === 'administrative' ? renderTable(
                          administrativeExpenses.map(a => ({
                            id: a.id,
                            user: a.user?.name || a.user?.lastname || '-',
                            amount: a.amount,
                            date: new Date(a.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: a.description || 'Gasto administrativo'
                          })),
                          selectedEgresoType
                        )
                      : selectedEgresoType === 'payouts' ? renderTable(
                          payouts.map(p => ({
                            id: p.id.toString(),
                            user: p.user?.name || p.user?.lastname || '-',
                            amount: p.amount,
                            date: new Date(p.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: p.description || 'Pago de intereses'
                          })),
                          selectedEgresoType
                        )
                      : selectedEgresoType === 'social' ? renderTable(
                          socialFundsExpenses.map(s => ({
                            id: s.id.toString(),
                            user: s.user?.name || s.user?.lastname || '-',
                            amount: s.amount,
                            date: new Date(s.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: s.description ? s.description + " '" + socialFundsData[s.socialFunds.name as keyof typeof socialFundsData] + "'" : 'Egreso de fondos'
                          })),
                          selectedEgresoType
                        )
                      : selectedEgresoType === 'expense-others' ? renderTable(
                          otherExpenses.map(o => ({
                            id: o.id.toString(),
                            user: o.user?.name || o.user?.lastname || '-',
                            amount: o.amount,
                            date: new Date(o.date).toLocaleDateString("es-PE", { timeZone: "UTC" }),
                            description: o.description || 'Otro egreso'
                          })),
                          selectedEgresoType
                        )
                      : renderTable(mockData[selectedEgresoType], selectedEgresoType)
                    }
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-lg font-medium">Selecciona un tipo de operación</p>
                  <p className="text-sm">Haz clic en uno de los botones arriba para ver las transacciones registradas</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        </Card>
      </div>
    </>
  );
}