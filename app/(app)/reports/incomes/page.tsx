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
import { IStock } from "@/types/IStock";
import { IUser } from "@/types/IUser";
import { useContext, useEffect, useState } from "react";
import { IDeposit } from "../../incomes/deposits/types";
import { ILoanPayment } from "../../assembly/types";
import { ISocialFundsTransaction } from "@/types/ISocialFunds";
import { IOtherIncome } from "../../incomes/others/types";
import { FileText, FileSpreadsheet } from "lucide-react";
  interface IDataState {
    stocks: IStock[]
    deposits: IDeposit[],
    users: IUser[]
    payments: ILoanPayment[],
    socialFunds: ISocialFundsTransaction[]
   others: IOtherIncome[]
  accumulated:{
    deposits:number;
    payments:number;
    interests:number;
    stocks:number;
    stocksValue:number;
    socialFundsSocial:number;
    socialFundsLegal:number;
    others:number;
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

  const getBankIncomes = (data: IDataState) => {
    const bankIncomes = {
      stocks: data.stocks.filter(item => !item.userId).reduce((acc,i)=> acc+Number(i.quantity),0),
      stocksValue: data.stocks.filter(item => !item.userId).reduce((acc,i)=> acc + (Number(i.quantity) * i.price),0),
      deposits: data.deposits.filter(item => !item.userId).reduce((acc,i) => acc+i.amount,0),
      payments: data.payments.filter(item => !item.userId).reduce((acc,i) => acc+i.amount,0),
      interests: data.payments.filter(item => !item.userId).reduce((acc,i) => acc+Number(i.interest),0),
      socialFundsLegal: data.socialFunds.filter(item => !item.userId && item.socialFunds.name=='LEGAL').reduce((acc,i) => acc+i.amount,0),
      socialFundsSocial: data.socialFunds.filter(item => !item.userId && item.socialFunds.name=='SOCIAL').reduce((acc,i) => acc+i.amount,0),
      others: data.others.filter(item => !item.userId).reduce((acc,i) => acc+i.amount,0),
    };
    return bankIncomes;
  }

   const getSum = (data: IDataState) => {
    const sum = {
      stocks: data.stocks.reduce((acc,i)=> acc+Number(i.quantity),0),
      stocksValue: data.stocks.reduce((acc,i)=> acc + (Number(i.quantity) * i.price),0),
      deposits: data.deposits.reduce((acc,i) => acc+i.amount,0),
      payments: data.payments.reduce((acc,i) => acc+i.amount,0),
      interests: data.payments.reduce((acc,i) => acc+Number(i.interest),0),
      socialFundsLegal: data.socialFunds.reduce((acc,i) => acc+i.amount,0),
      socialFundsSocial: data.socialFunds.reduce((acc,i) => acc+i.amount,0),
      others: data.others.reduce((acc,i) => acc+i.amount,0),
    };
    return sum;
  }
 const getTotalSum = (data: IDataState) => {
    const sum = {
      stocks: data.stocks.reduce((acc,i)=> acc+Number(i.quantity),0)+data.accumulated.stocks,
      stocksValue: data.stocks.reduce((acc,i)=> acc + (Number(i.quantity) * i.price),0) + data.accumulated.stocksValue,
      deposits: data.deposits.reduce((acc,i) => acc+i.amount,0) + data.accumulated.deposits,
      payments: data.payments.reduce((acc,i) => acc+i.amount,0) + data.accumulated.payments,
      interests: data.payments.reduce((acc,i) => acc+Number(i.interest),0) + data.accumulated.interests,
      socialFundsLegal: data.socialFunds.filter(item => !item.userId && item.socialFunds.name=='LEGAL').reduce((acc,i) => acc+i.amount,0) + data.accumulated.socialFundsLegal,
      socialFundsSocial: data.socialFunds.filter(item => !item.userId && item.socialFunds.name=='SOCIAL').reduce((acc,i) => acc+i.amount,0)+ data.accumulated.socialFundsSocial,
      others: data.others.reduce((acc,i) => acc+i.amount,0) + + data.accumulated.others,
    };
    return sum;
  }

function IncomesReportTable() {

  const [data,setData] = useState<IDataState>({
    stocks: [],
    users: [],
    deposits: [],
    payments: [],
    socialFunds: [],
    others: [],
    accumulated: {
    deposits:0,
    payments:0,
    interests:0,
    stocks:0,
    stocksValue:0,
    socialFundsSocial:0,
    socialFundsLegal:0,
    others:0,
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
  const {bank} = useContext(AppContext)

  const fetchIncomes = async(monthValue: string) => {
    const [year, month] = monthValue.split('-').map(Number);
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);
    const startOfDate = startOfMonth.toISOString();
    const endOfDate = endOfMonth.toISOString();
    const res = await apiClient.get(`/reports/incomes?startOfDate=${startOfDate}&endOfDate=${endOfDate}`)
    if (res.data) {
      console.log(res.data)
      setData(res.data);
    }
  };

  useEffect(() => {
    fetchIncomes(selectedMonth);
  }, [selectedMonth])

  const bankIncomes = getBankIncomes(data);
  const sum = getSum(data);
  const totalSum = getTotalSum(data);
  const monthOptions = generateMonthOptions();

  const filteredUsers = data.users.filter(user => `${user.name} ${user.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredDeposits = data.deposits.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);
  const filteredPayments = data.payments.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + i.amount, 0);
  const filteredInterests = data.payments.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + Number(i.interest), 0);
  const filteredStocks = data.stocks.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + Number(i.quantity), 0);
  const filteredStocksValue = data.stocks.filter(item => item.userId && filteredUsers.some(u => u.id === item.userId)).reduce((acc, i) => acc + (Number(i.quantity) * i.price), 0);
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
              <CardTitle>Reporte de Ingresos</CardTitle>
              <p className="text-gray-600">Selecciona un mes para ver los ingresos</p>
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
            <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Deposito Ahorros</TableHead>
            <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Pagos de Capital</TableHead>
            <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Intereses Recibidos </TableHead>
            <TableHead className="min-w-[100px] w-fit whitespace-nowrap">Acciones</TableHead>
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
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankIncomes.deposits)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankIncomes.payments)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankIncomes.interests)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">
              <div>{bankIncomes.stocks}</div>
              <div className="text-sm text-gray-500">{formatCurrency(bankIncomes.stocksValue)}</div>
            </TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankIncomes.socialFundsLegal)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankIncomes.socialFundsSocial)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(bankIncomes.others)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap"></TableCell>
          </TableRow>
        {filteredUsers.map((user) => {
          const userDeposits = data.deposits.filter(item => item.userId ===user.id).reduce((acum, item) => acum + item.amount, 0);
          const capitalPayments = data.payments.filter(item => item.userId===user.id).reduce((acum,item)=> acum + item.amount, 0);
          const interestReceived = data.payments.filter(item => item.userId===user.id).reduce((acum,item)=> acum + Number(item.interest), 0);
          const acciones = data.stocks.filter(item => item.userId ===user.id).reduce((acum,item) => acum+Number(item.quantity),0);
          const accionesValue = data.stocks.filter(item => item.userId ===user.id).reduce((acum,item) => acum + (Number(item.quantity) * item.price),0);
          const legalAmount = data.socialFunds.filter(item => item.userId===user.id && item.socialFunds.name=='LEGAL').reduce((acum,item) => acum + Number(item.amount), 0);
          const socialAmount = data.socialFunds.filter(item => item.userId===user.id && item.socialFunds.name=='SOCIAL').reduce((acum,item) => acum + Number(item.amount), 0);
          const others = data.others.filter(item => item.userId === user.id).reduce((acum,item)=> acum+item.amount,0);

          return (
          <TableRow key={user.id}>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{selectedMonthLabel}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">
              <div>{user.lastname},</div>
              <div>{user.name}</div>
            </TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(userDeposits)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(capitalPayments)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(interestReceived)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">
              <div>{acciones}</div>
              <div className="text-sm text-gray-500">{formatCurrency(accionesValue)}</div>
            </TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(legalAmount)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(socialAmount)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(others)}</TableCell>
            <TableCell className="min-w-[100px] w-fit whitespace-nowrap"></TableCell>
          </TableRow>
        )
        })}
        
      </TableBody>
      <TableFooter>
        <TableRow className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TableCell className="font-medium text-right min-w-[100px] w-fit whitespace-nowrap" colSpan={2}>
            Total Ingresos del Mes
          </TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredDeposits + bankIncomes.deposits)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredPayments + bankIncomes.payments)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredInterests + bankIncomes.interests)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredStocksValue + bankIncomes.stocksValue)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredSocialFundsLegal + bankIncomes.socialFundsLegal)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredSocialFundsSocial + bankIncomes.socialFundsSocial)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredOthers + bankIncomes.others)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(filteredDeposits + bankIncomes.deposits + filteredPayments + bankIncomes.payments + filteredInterests + bankIncomes.interests + filteredStocksValue + bankIncomes.stocksValue + filteredSocialFundsLegal + bankIncomes.socialFundsLegal + filteredSocialFundsSocial + bankIncomes.socialFundsSocial + filteredOthers + bankIncomes.others)}</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TableCell className="font-medium text-right min-w-[100px] w-fit whitespace-nowrap" colSpan={2}>
            Ingresos Acumulados del Mes Anterior
          </TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.deposits)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.payments)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.interests)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.stocksValue)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.socialFundsSocial)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.socialFundsLegal)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.others)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(data.accumulated.deposits + data.accumulated.payments + data.accumulated.interests + data.accumulated.stocksValue + data.accumulated.socialFundsSocial + data.accumulated.socialFundsLegal + data.accumulated.others)}</TableCell>
        </TableRow>
        <TableRow className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <TableCell className="font-medium text-right min-w-[100px] w-fit whitespace-nowrap" colSpan={2}>
            Total de Ingresos Acumulados a la Fecha
          </TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.deposits)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.payments)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.interests)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.stocksValue)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.socialFundsLegal)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.socialFundsSocial)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.others)}</TableCell>
          <TableCell className="min-w-[100px] w-fit whitespace-nowrap">{formatCurrency(totalSum.deposits + totalSum.payments + totalSum.interests + totalSum.stocksValue + totalSum.socialFundsLegal + totalSum.socialFundsSocial + totalSum.others)}</TableCell>
        </TableRow>
      </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
export default function IncomesReportPage() {
  return <IncomesReportTable />;
}
