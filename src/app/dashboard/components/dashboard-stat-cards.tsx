
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, Scale, Wallet, CreditCard, QrCode, ArrowUp, ArrowDown, FileText } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { cn } from '@/lib/utils';

function StatChange({ value, unit = '' }: { value: number, unit?: string }) {
    const { t } = useStore();
    if (value === 0 || !isFinite(value)) {
        return <p className="text-xs text-muted-foreground">{t('No change from yesterday')}</p>;
    }
    const isIncrease = value > 0;
    const valueString = unit === '%' ? `${Math.abs(value).toFixed(1)}%` : `${Math.abs(value)}`;
    return (
        <p className={cn("text-xs flex items-center", isIncrease ? 'text-green-500' : 'text-red-500')}>
            {isIncrease ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
            {value > 0 && '+'}{valueString} {t('from yesterday')}
        </p>
    );
}

export function StatCards() {
  const { formatCurrency, sales, customers, payments, cheques, t } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    todayStats,
    yesterdayStats,
    outstandingDebt
  } = useMemo(() => {
    if (!isClient) {
      return { 
          todayStats: { revenue: 0, transactions: 0, itemsSold: 0, cashierAmount: 0, cardPayments: 0, qrPayments: 0, chequePayments: 0 },
          yesterdayStats: { revenue: 0, transactions: 0, itemsSold: 0, cashierAmount: 0, cardPayments: 0, qrPayments: 0, chequePayments: 0 },
          outstandingDebt: 0 
        };
    }
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(todayStart.getDate() - 1);
    
    const todaysSales = (sales || []).filter(sale => {
      if (!sale.saleDate) return false;
      const saleDate = sale.saleDate;
      return saleDate >= todayStart && sale.status === 'Completed';
    });

    const yesterdaysSales = (sales || []).filter(sale => {
      if (!sale.saleDate) return false;
      const saleDate = sale.saleDate;
      return saleDate >= yesterdayStart && saleDate < todayStart && sale.status === 'Completed';
    });
    
    const calculateStats = (salesData: typeof sales, dateStart: Date) => {
        const revenue = salesData.reduce((acc, sale) => acc + sale.totalAmount, 0);
        const transactions = salesData.length;
        const items = salesData.reduce((acc, sale) => acc + (sale.items?.reduce((iAcc, i) => iAcc + i.quantity, 0) || 0), 0);
        const cashierAmount = salesData
            .filter(sale => sale.paymentMethod === 'cash')
            .reduce((acc, sale) => acc + sale.totalAmount, 0);
        const cardPayments = salesData
            .filter(sale => sale.paymentMethod === 'card')
            .reduce((acc, sale) => acc + sale.totalAmount, 0);
        const qrPayments = salesData
            .filter(sale => sale.paymentMethod === 'qr')
            .reduce((acc, sale) => acc + sale.totalAmount, 0);
            
        const dateEnd = new Date(dateStart);
        dateEnd.setDate(dateStart.getDate() + 1);

        const loanPaymentsOnDate = (payments || []).filter(payment => {
            if (!payment.date) return false;
            const paymentDate = payment.date;
            return paymentDate >= dateStart && paymentDate < dateEnd;
        }).reduce((acc, payment) => acc + payment.amount, 0);

        const chequePaymentsOnDate = (cheques || []).filter(cheque => {
            if (!cheque.date) return false;
            const chequeDate = cheque.date;
            return chequeDate >= dateStart && chequeDate < dateEnd;
        }).reduce((acc, cheque) => acc + cheque.chequeAmount, 0);

        return {
          revenue: revenue,
          transactions: transactions,
          itemsSold: items,
          cashierAmount: cashierAmount + loanPaymentsOnDate,
          cardPayments: cardPayments,
          qrPayments: qrPayments,
          chequePayments: chequePaymentsOnDate,
        };
    }

    const _outstandingDebt = (customers || []).reduce((acc, customer) => acc + (customer.totalLoanAmount - customer.totalPaidAmount), 0);
    
    return {
      todayStats: calculateStats(todaysSales, todayStart),
      yesterdayStats: calculateStats(yesterdaysSales, yesterdayStart),
      outstandingDebt: _outstandingDebt,
    };
  }, [sales, isClient, customers, payments, cheques]);


  const calculateChange = (today: number, yesterday: number) => {
    if (yesterday === 0) return today > 0 ? Infinity : 0;
    return ((today - yesterday) / yesterday) * 100;
  };

  const salesChange = calculateChange(todayStats.revenue, yesterdayStats.revenue);
  const transactionsChange = todayStats.transactions - yesterdayStats.transactions;
  const itemsSoldChange = todayStats.itemsSold - yesterdayStats.itemsSold;
  const cashierChange = calculateChange(todayStats.cashierAmount, yesterdayStats.cashierAmount);
  const cardPaymentsChange = calculateChange(todayStats.cardPayments, yesterdayStats.cardPayments);
  const qrPaymentsChange = calculateChange(todayStats.qrPayments, yesterdayStats.qrPayments);
  const chequePaymentsChange = calculateChange(todayStats.chequePayments, yesterdayStats.chequePayments);


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("Today's Sales")}</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.revenue)}</div>
          <StatChange value={salesChange} unit="%" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("Today's Cashier Revenue")}</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.cashierAmount)}</div>
          <StatChange value={cashierChange} unit="%" />
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("Today's Card Payments")}</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.cardPayments)}</div>
          <StatChange value={cardPaymentsChange} unit="%" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("Today's QR Payments")}</CardTitle>
          <QrCode className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.qrPayments)}</div>
          <StatChange value={qrPaymentsChange} unit="%" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t("Today's Cheque Payments")}</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(todayStats.chequePayments)}</div>
          <StatChange value={chequePaymentsChange} unit="%" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('Transactions')}</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayStats.transactions}</div>
          <StatChange value={transactionsChange} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('Outstanding Debt')}</CardTitle>
          <Scale className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(outstandingDebt)}</div>
           <p className="text-xs text-muted-foreground">{t('Total across all customers')}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{t('Items Sold')}</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayStats.itemsSold}</div>
          <StatChange value={itemsSoldChange} />
        </CardContent>
      </Card>
    </div>
  );
}
