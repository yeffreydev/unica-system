'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { useContext, useEffect, useState } from "react";
import { FileText, FileSpreadsheet } from "lucide-react";

interface IDataStateExpenses {
  withdrawals: any[],
  users: any[],
  loans: any[],
  payouts: any[],
  socialFunds: any[],
  others: any[],
  dividends: any[],
  administrative: any[],
  accumulated: {
    withdrawals: number;
    loans: number;
    administrative: number;
    dividends: number;
    payouts: number;
    socialFundsSocial: number;
    socialFundsLegal: number;
    others: number;
  }
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const formatCurrency = (amount: number) => `S/. ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const generateMonthOptions = () => {
  const options = [];
  const startYear = 2024;
  const startMonth = 0; // January
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  for (let year = startYear; year <= currentYear; year++) {
    const startM = year === startYear ? startMonth : 0;
    const endM = year === currentYear ? currentMonth : 11;
    for (let month = startM; month <= endM; month++) {
      options.push({ value: `${year}-${month}`, label: `${months[month]} ${year}` });
    }
  }
  return options;
};

const getBankExpenses = (data: IDataStateExpenses) => {
  const bankExpenses = {
    withdrawals: data.withdrawals.filter(item => !item.userId).reduce((acc, i) => acc + i.amount, 0),
    loans: data.loans.filter(item => !item.userId).reduce((acc, i) => acc + i.amount, 0),
    payouts: data.payouts.filter(item => !item.userId).reduce((acc, i) => acc + i.amount, 0),
    administrative: data.administrative.filter(item => !item.userId).reduce((acc, i) => acc + i.amount, 0),
    dividends: data.dividends.filter(item => !item.userId).reduce((acc, i) => acc + i.amount, 0),
    socialFundsLegal: data.socialFunds.filter(item => !item.userId && item.socialFunds.name === 'LEGAL').reduce((acc, i) => acc + i.amount, 0),
    socialFundsSocial: data.socialFunds.filter(item => !item.userId && item.socialFunds.name === 'SOCIAL').reduce((acc, i) => acc + i.amount, 0),
    others: data.others.filter(item => !item.userId).reduce((acc, i) => acc + i.amount, 0),
  };
  return bankExpenses;
}

const getSum = (data: IDataStateExpenses) => {
  const sum = {
    withdrawals: data.withdrawals.reduce((acc, i) => acc + i.amount, 0),
    loans: data.loans.reduce((acc, i) => acc + i.amount, 0),
    payouts: data.payouts.reduce((acc, i) => acc + i.amount, 0),
    administrative: data.administrative.reduce((acc, i) => acc + i.amount, 0),
    dividends: data.dividends.reduce((acc, i) => acc + i.amount, 0),
    socialFundsLegal: data.socialFunds.filter(item => item.socialFunds.name === 'LEGAL').reduce((acc, i) => acc + i.amount, 0),
    socialFundsSocial: data.socialFunds.filter(item => item.socialFunds.name === 'SOCIAL').reduce((acc, i) => acc + i.amount, 0),
    others: data.others.reduce((acc, i) => acc + i.amount, 0),
  };
  return sum;
}

const getTotalSum = (data: IDataStateExpenses) => {
  const sum = {
    withdrawals: data.withdrawals.reduce((acc, i) => acc + i.amount, 0) + data.accumulated.withdrawals,
    loans: data.loans.reduce((acc, i) => acc + i.amount, 0) + data.accumulated.loans,
    payouts: data.payouts.reduce((acc, i) => acc + i.amount, 0) + data.accumulated.payouts,
    administrative: data.administrative.reduce((acc, i) => acc + i.amount, 0) + data.accumulated.administrative,
    dividends: data.dividends.reduce((acc, i) => acc + i.amount, 0) + data.accumulated.dividends,
    socialFundsLegal: data.socialFunds.filter(item => item.socialFunds.name === 'LEGAL').reduce((acc, i) => acc + i.amount, 0) + data.accumulated.socialFundsLegal,
    socialFundsSocial: data.socialFunds.filter(item => item.socialFunds.name === 'SOCIAL').reduce((acc, i) => acc + i.amount, 0) + data.accumulated.socialFundsSocial,
    others: data.others.reduce((acc, i) => acc + i.amount, 0) + data.accumulated.others,
  };
  return sum;
}

function ExpensesReportTable() {
  const [data, setData] = useState<IDataStateExpenses>({
    withdrawals: [],
    users: [],
    loans: [],
    payouts: [],
    socialFunds: [],
    others: [],
    dividends: [],
    administrative: [],
    accumulated: {
      withdrawals: 0,
      loans: 0,
      administrative: 0,
      dividends: 0,
      payouts: 0,
      socialFundsSocial: 0,
      socialFundsLegal: 0,
      others: 0,
    }
  })
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const defaultMonthValue = `${currentYear}-${currentMonth}`;
  const defaultMonthLabel = `${months[currentMonth]} ${currentYear}`;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonthValue);
  const [selectedMonthLabel, setSelectedMonthLabel] = useState(defaultMonthLabel);
  const { bank } = useContext(AppContext)

  const fetchExpenses = async (monthValue: string) => {
    const [year, month] = monthValue.split('-').map(Number);
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    const startOfDate = startOfMonth.toISOString();
    const endOfDate = endOfMonth.toISOString();
    const res = await apiClient.get(`/reports/expenses?startOfDate=${startOfDate}&endOfDate=${endOfDate}`)
    if (res.data) {
      console.log(res.data)
      setData(res.data);
    }
  };

  useEffect(() => {
    fetchExpenses(selectedMonth);
  }, [selectedMonth])

  const bankExpenses = getBankExpenses(data);
  const sum = getSum(data);
  const totalSum = getTotalSum(data);
  const monthOptions = generateMonthOptions();

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    const option = monthOptions.find(opt => opt.value === value);
    if (option) setSelectedMonthLabel(option.label);
  };

  const handleExportPDF = () => {
    // Placeholder for PDF export
    alert('Exportar a PDF');
  };

  const handleExportExcel = () => {
    // Placeholder for Excel export
    alert('Exportar a Excel');
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reporte de Egresos</h1>
          <p className="text-gray-600">Selecciona un mes para ver los egresos</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecciona un mes" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </Button>
        </div>
      </div>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Nombres y Appellidos</TableHead>
          <TableHead>Retiro Ahorros</TableHead>
          <TableHead>Prestamos</TableHead>
          <TableHead>Intereses Pagados </TableHead>
          <TableHead>Gastos Administrativos </TableHead>
          <TableHead>Utilidad Distribuida</TableHead>
          <TableHead>Reserva Legal</TableHead>
          <TableHead>Fondo Social</TableHead>
          <TableHead>Otros</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>{selectedMonthLabel}</TableCell>
          <TableCell>{bank.bank.name}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.withdrawals)}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.loans)}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.payouts)}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.administrative)}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.dividends)}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.socialFundsLegal)}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.socialFundsSocial)}</TableCell>
          <TableCell>{formatCurrency(bankExpenses.others)}</TableCell>
        </TableRow>
        {data.users.map((user) => {
          const userWithdrawals = data.withdrawals.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userLoans = data.loans.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userPayouts = data.payouts.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userAdministrative = data.administrative.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userDividends = data.dividends.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userSocialFundsLegal = data.socialFunds.filter(item => item.userId === user.id && item.socialFunds.name === 'LEGAL').reduce((acum, item) => acum + item.amount, 0);
          const userSocialFundsSocial = data.socialFunds.filter(item => item.userId === user.id && item.socialFunds.name === 'SOCIAL').reduce((acum, item) => acum + item.amount, 0);
          const userOthers = data.others.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          return (
            <TableRow key={user.id}>
              <TableCell>{selectedMonthLabel}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{formatCurrency(userWithdrawals)}</TableCell>
              <TableCell>{formatCurrency(userLoans)}</TableCell>
              <TableCell>{formatCurrency(userPayouts)}</TableCell>
              <TableCell>{formatCurrency(userAdministrative)}</TableCell>
              <TableCell>{formatCurrency(userDividends)}</TableCell>
              <TableCell>{formatCurrency(userSocialFundsLegal)}</TableCell>
              <TableCell>{formatCurrency(userSocialFundsSocial)}</TableCell>
              <TableCell>{formatCurrency(userOthers)}</TableCell>
            </TableRow>
          )
        })}
      </TableBody>
      <TableFooter>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Total de Egresos del Mes
          </TableCell>
          <TableCell>{formatCurrency(sum.withdrawals)}</TableCell>
          <TableCell>{formatCurrency(sum.loans)}</TableCell>
          <TableCell>{formatCurrency(sum.payouts)}</TableCell>
          <TableCell>{formatCurrency(sum.administrative)}</TableCell>
          <TableCell>{formatCurrency(sum.dividends)}</TableCell>
          <TableCell>{formatCurrency(sum.socialFundsLegal)}</TableCell>
          <TableCell>{formatCurrency(sum.socialFundsSocial)}</TableCell>
          <TableCell>{formatCurrency(sum.others)}</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Egresos acumulados al mes anterior
          </TableCell>
          <TableCell>{formatCurrency(data.accumulated.withdrawals)}</TableCell>
          <TableCell>{formatCurrency(data.accumulated.loans)}</TableCell>
          <TableCell>{formatCurrency(data.accumulated.payouts)}</TableCell>
          <TableCell>{formatCurrency(data.accumulated.administrative)}</TableCell>
          <TableCell>{formatCurrency(data.accumulated.dividends)}</TableCell>
          <TableCell>{formatCurrency(data.accumulated.socialFundsLegal)}</TableCell>
          <TableCell>{formatCurrency(data.accumulated.socialFundsSocial)}</TableCell>
          <TableCell>{formatCurrency(data.accumulated.others)}</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 border-t border-gray-200">
          <TableCell className="font-medium text-right" colSpan={2}>
            Total de egresos Acumulados a la Fecha
          </TableCell>
          <TableCell>{formatCurrency(totalSum.withdrawals)}</TableCell>
          <TableCell>{formatCurrency(totalSum.loans)}</TableCell>
          <TableCell>{formatCurrency(totalSum.payouts)}</TableCell>
          <TableCell>{formatCurrency(totalSum.administrative)}</TableCell>
          <TableCell>{formatCurrency(totalSum.dividends)}</TableCell>
          <TableCell>{formatCurrency(totalSum.socialFundsLegal)}</TableCell>
          <TableCell>{formatCurrency(totalSum.socialFundsSocial)}</TableCell>
          <TableCell>{formatCurrency(totalSum.others)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
    </>
  );
}
export default function ExpensesReportPage() {
  return <ExpensesReportTable />;
}
