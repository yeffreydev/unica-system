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
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient from "@/config/apiClient";
import { AppContext } from "@/context/AppContext";
import { useContext, useEffect, useState } from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { IDataStateExpenses } from "./types";
import { getExpensesSum } from "./utils";


const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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
  const [searchTerm, setSearchTerm] = useState('');
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
  const totalSum = getTotalSum(data);
  const monthOptions = generateMonthOptions();

  const filteredUsers = data.users.filter(user => `${user.name} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredWithdrawals = data.withdrawals.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);
  const filteredLoans = data.loans.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);
  const filteredPayouts = data.payouts.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);
  const filteredAdministrative = data.administrative.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);
  const filteredDividends = data.dividends.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);
  const filteredSocialFundsLegal = data.socialFunds.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId) && item.socialFunds.name === 'LEGAL').reduce((acc, i) => acc + i.amount, 0);
  const filteredSocialFundsSocial = data.socialFunds.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId) && item.socialFunds.name === 'SOCIAL').reduce((acc, i) => acc + i.amount, 0);
  const filteredOthers = data.others.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);

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
    <div className="space-y-6 py-5">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Reporte de Egresos</CardTitle>
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
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[200px]"
              />
              <Button onClick={handleExportPDF} className="bg-red-500 hover:bg-red-600 text-white">
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleExportExcel} className="bg-green-500 hover:bg-green-600 text-white">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Fecha</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Nombres y Appellidos</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Retiro Ahorros</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Prestamos</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Intereses Pagados </TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Gastos Administrativos </TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Utilidad Distribuida</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Reserva Legal</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Fondo Social</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Otros</TableHead>
          <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Totales</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{selectedMonthLabel}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{bank.bank.name}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.withdrawals)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.loans)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.payouts)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.administrative)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.dividends)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.socialFundsLegal)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.socialFundsSocial)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.others)}</TableCell>
          {/* <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankExpenses.withdrawals + bankExpenses.loans + bankExpenses.payouts + bankExpenses.administrative + bankExpenses.dividends + bankExpenses.socialFundsLegal + bankExpenses.socialFundsSocial + bankExpenses.others)}</TableCell> */}
        </TableRow>
        {filteredUsers.map((user) => {
          const userWithdrawals = data.withdrawals.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userLoans = data.loans.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userPayouts = data.payouts.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userAdministrative = data.administrative.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userDividends = data.dividends.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          const userSocialFundsLegal = data.socialFunds.filter(item => item.userId === user.id && item.socialFunds.name === 'LEGAL').reduce((acum, item) => acum + item.amount, 0);
          const userSocialFundsSocial = data.socialFunds.filter(item => item.userId === user.id && item.socialFunds.name === 'SOCIAL').reduce((acum, item) => acum + item.amount, 0);
          const userOthers = data.others.filter(item => item.userId === user.id).reduce((acum, item) => acum + item.amount, 0);
          // const userTotal = userWithdrawals + userLoans + userPayouts + userAdministrative + userDividends + userSocialFundsLegal + userSocialFundsSocial + userOthers;
          return (
            <TableRow key={user.id}>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{selectedMonthLabel}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">
                <div>{user.lastname},</div>
                <div>{user.name}</div>
              </TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userWithdrawals)}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userLoans)}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userPayouts)}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userAdministrative)}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userDividends)}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userSocialFundsLegal)}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userSocialFundsSocial)}</TableCell>
              <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userOthers)}</TableCell>
              {/* <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userTotal)}</TableCell> */}
            </TableRow>
          )
        })}
      </TableBody>
      <TableFooter>
        <TableRow className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TableCell className="font-medium text-right min-w-[100px] w-fit whitespace-nowrap" colSpan={2}>
            Total de Egresos del Mes
          </TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredWithdrawals + bankExpenses.withdrawals)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredLoans + bankExpenses.loans)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredPayouts + bankExpenses.payouts)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredAdministrative + bankExpenses.administrative)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredDividends + bankExpenses.dividends)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredSocialFundsLegal + bankExpenses.socialFundsLegal)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredSocialFundsSocial + bankExpenses.socialFundsSocial)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredOthers + bankExpenses.others)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredWithdrawals + bankExpenses.withdrawals + filteredLoans + bankExpenses.loans + filteredPayouts + bankExpenses.payouts + filteredAdministrative + bankExpenses.administrative + filteredDividends + bankExpenses.dividends + filteredSocialFundsLegal + bankExpenses.socialFundsLegal + filteredSocialFundsSocial + bankExpenses.socialFundsSocial + filteredOthers + bankExpenses.others)}</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TableCell className="font-medium text-right min-w-[100px] w-fit whitespace-nowrap" colSpan={2}>
            Egresos acumulados al mes anterior
          </TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.withdrawals)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.loans)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.payouts)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.administrative)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.dividends)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.socialFundsLegal)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.socialFundsSocial)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.others)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.withdrawals + data.accumulated.loans + data.accumulated.payouts + data.accumulated.administrative + data.accumulated.dividends + data.accumulated.socialFundsLegal + data.accumulated.socialFundsSocial + data.accumulated.others)}</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TableCell className="font-medium text-right min-w-[100px] w-fit whitespace-nowrap" colSpan={2}>
            Total de egresos Acumulados a la Fecha
          </TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.withdrawals)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.loans)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.payouts)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.administrative)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.dividends)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.socialFundsLegal)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.socialFundsSocial)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.others)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.withdrawals + totalSum.loans + totalSum.payouts + totalSum.administrative + totalSum.dividends + totalSum.socialFundsLegal + totalSum.socialFundsSocial + totalSum.others)}</TableCell>
        </TableRow>
        <TableRow className="border-t border-gray-200 dark:border-gray-700">
          <TableCell colSpan={11} className="py-2">
            <div className="text-center text-sm text-gray-500">
              ******************** Fin del Reporte de Egresos ********************
            </div>
          </TableCell>
        </TableRow>
      </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default function ExpensesReportPage() {
  return <ExpensesReportTable />;
}
