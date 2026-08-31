'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, Edit, Receipt, DollarSign, Calendar, Tag, CreditCard, Wallet, Filter } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import type { Expense, ExpenseCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

const CATEGORIES: ExpenseCategory[] = ['Utilities', 'Maintenance', 'Food & Beverage', 'Supplies', 'Marketing', 'Staff', 'Other'];

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense, formatCurrency, t, isLoading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsFormOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  
  const [newExpense, setNewExpense] = useState({
    date: '',
    category: 'Utilities' as ExpenseCategory,
    amount: 0,
    description: '',
    status: 'paid' as 'paid' | 'pending',
    paymentMethod: 'Cash'
  });

  useEffect(() => {
    if (!newExpense.date) {
        setNewExpense(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
    }
  }, [newExpense.date]);

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const paid = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0);
    const pending = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthlySpend = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((sum, e) => sum + e.amount, 0);

    return { total, paid, pending, monthlySpend };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, searchTerm]);

  const handleAddOrEditExpense = () => {
    if (editingExpenseId) {
        updateExpense(editingExpenseId, newExpense);
    } else {
        addExpense(newExpense);
    }
    setIsFormOpen(false);
    setEditingExpenseId(null);
    setNewExpense({
        date: new Date().toISOString().split('T')[0],
        category: 'Utilities',
        amount: 0,
        description: '',
        status: 'paid',
        paymentMethod: 'Cash'
    });
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpenseId(expense.id);
    setNewExpense({
        date: expense.date,
        category: expense.category,
        amount: expense.amount,
        description: expense.description,
        status: expense.status,
        paymentMethod: expense.paymentMethod
    });
    setIsFormOpen(true);
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Expense Management</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Track property costs, utilities, and vendor payments.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
                setEditingExpenseId(null);
                setNewExpense({
                    date: new Date().toISOString().split('T')[0],
                    category: 'Utilities',
                    amount: 0,
                    description: '',
                    status: 'paid',
                    paymentMethod: 'Cash'
                });
            }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 md:h-10 w-full md:w-auto rounded-xl md:rounded-md">
              <Plus className="h-4 w-4" /> Record Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader className="p-6 pb-0 shrink-0">
              <DialogTitle>{editingExpenseId ? 'Edit Expense' : 'Record New Expense'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow min-h-0">
              <div className="p-6">
                <div className="grid gap-6 py-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Date</Label>
                        <Input type="date" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} className="h-10 text-sm" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Category</Label>
                        <Select value={newExpense.category} onValueChange={v => setNewExpense({...newExpense, category: v as ExpenseCategory})}>
                            <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Input placeholder="e.g. Monthly Electricity Bill" value={newExpense.description} onChange={e => setNewExpense({...newExpense, description: e.target.value})} className="h-10 text-sm" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input 
                            type="number" 
                            placeholder="0.00" 
                            className="h-10 text-sm"
                            value={newExpense.amount === 0 ? '' : newExpense.amount} 
                            onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs">Payment Method</Label>
                        <Input placeholder="Cash, Card, Transfer" value={newExpense.paymentMethod} onChange={e => setNewExpense({...newExpense, paymentMethod: e.target.value})} className="h-10 text-sm" />
                    </div>
                  </div>
                  <div className="space-y-2 pb-4">
                    <Label className="text-xs">Status</Label>
                    <Select value={newExpense.status} onValueChange={v => setNewExpense({...newExpense, status: v as any})}>
                        <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="paid" className="text-sm">Paid</SelectItem>
                            <SelectItem value="pending" className="text-sm">Pending</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 border-t bg-muted/5 shrink-0">
              <Button onClick={handleAddOrEditExpense} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">
                {editingExpenseId ? 'Update Record' : 'Save Expense'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total" value={formatCurrency(stats.total)} icon={Receipt} color="text-primary" />
        <StatCard title="This Month" value={formatCurrency(stats.monthlySpend)} icon={Calendar} color="text-blue-600" />
        <StatCard title="Paid" value={formatCurrency(stats.paid)} icon={CreditCard} color="text-green-600" />
        <StatCard title="Pending" value={formatCurrency(stats.pending)} icon={Wallet} color="text-amber-600" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-lg font-black uppercase tracking-tight">Transaction History</CardTitle>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search expenses..." 
                        className="pl-9 h-9 text-xs rounded-full bg-muted/30 border-none" 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map(expense => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-[10px] font-bold text-muted-foreground">{expense.date}</TableCell>
                    <TableCell>
                      <div className="flex flex-col min-w-0">
                          <span className="font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">{expense.description}</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-medium">{expense.paymentMethod} • <span className="sm:hidden">{expense.category}</span></span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter h-4 px-1.5 border-muted-foreground/20">
                          {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-xs sm:text-sm">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={expense.status === 'paid' ? 'success' : 'default'} className="capitalize text-[9px] h-4 px-1.5 font-black">
                          {expense.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-0.5">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenEdit(expense)}>
                              <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full">
                                  <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Record?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the record for "{expense.description}"?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteExpense(expense.id)}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredExpenses.length === 0 && (
                  <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic text-xs">
                          No expense records found.
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
        <CardTitle className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</CardTitle>
        <Icon className={cn("h-3.5 w-3.5", color)} />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="text-lg sm:text-2xl font-black truncate">{value}</div>
      </CardContent>
    </Card>
  );
}
