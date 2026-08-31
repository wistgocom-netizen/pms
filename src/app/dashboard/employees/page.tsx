'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, IndianRupee, Phone, Calendar, Briefcase, Wallet, UserPlus, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddUserDialog } from '../users/add-user-dialog';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function EmployeesPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, addEmployeePayment, formatCurrency, isLoading, departments, createUser, t, userProfile } = useStore();
  const { toast } = useToast();
  
  const [mounted, setMounted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);
  const [newEmp, setNewEmp] = useState({ name: '', role: '', department: '', salary: 0, phone: '', joiningDate: '' });
  const [paymentModal, setPaymentModal] = useState<string | null>(null);
  const [newPay, setNewPay] = useState({ month: '', amount: 0, date: new Date().toISOString().split('T')[0], status: 'paid' as 'paid' | 'pending' });

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentMonthStr = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  
  const selectedEmpForPayment = employees.find(e => e.id === paymentModal);
  const selectedMonthPaid = selectedEmpForPayment?.payments
    .filter(p => p.month === (newPay.month || currentMonthStr))
    .reduce((sum, p) => sum + p.amount, 0) || 0;
  const remainingForSelected = Math.max(0, (selectedEmpForPayment?.salary || 0) - selectedMonthPaid);

  const handleAddOrEditEmployee = () => {
      const sanitizedEmp = {
          ...newEmp,
          salary: isNaN(newEmp.salary) ? 0 : newEmp.salary,
      };

      if (editingEmpId) {
          updateEmployee(editingEmpId, sanitizedEmp);
          toast({ title: t("Profile Updated") });
      } else {
          addEmployee(sanitizedEmp as any);
          toast({ title: t("Employee Added") });
      }

      setIsAddOpen(false);
      setEditingEmpId(null);
      setNewEmp({ name: '', role: '', department: '', salary: 0, phone: '', joiningDate: '' });
  };

  const handleOpenEdit = (emp: any) => {
      setEditingEmpId(emp.id);
      setNewEmp({
          name: emp.name,
          role: emp.role,
          department: emp.department,
          salary: emp.salary,
          phone: emp.phone,
          joiningDate: emp.joiningDate
      });
      setIsAddOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteEmployee(id);
    toast({ title: t("Profile Deleted"), description: t("The staff record has been removed.") });
  };

  const handleAddPayment = () => {
      if (paymentModal) {
          const sanitizedPay = {
              ...newPay,
              amount: isNaN(newPay.amount) ? 0 : newPay.amount,
          };
          addEmployeePayment(paymentModal, sanitizedPay);
          setPaymentModal(null);
          setNewPay({ month: '', amount: 0, date: new Date().toISOString().split('T')[0], status: 'paid' });
          toast({ title: t("Payment Recorded") });
      }
  };

  const handleCreateStaffUser = async (userData: any) => {
    const result = await createUser(userData);
    if (result.success) {
        toast({ title: t("Staff Login Created"), description: t("The new credentials are ready for use.") });
        setIsAddUserOpen(false);
    } else {
        toast({ variant: "destructive", title: t("Creation Failed"), description: result.error?.message || t("Error creating user.") });
    }
  };

  if (!mounted || isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Manage employee records, payroll, and payment history.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button variant="outline" className="gap-2 h-11 md:h-10 flex-1 md:flex-none" onClick={() => setIsAddUserOpen(true)}>
                <UserPlus className="h-4 w-4" /> Create Login
            </Button>
            <Dialog open={isAddOpen} onOpenChange={(open) => {
                setIsAddOpen(open);
                if (!open) setEditingEmpId(null);
            }}>
            <DialogTrigger asChild>
                <Button className="gap-2 h-11 md:h-10 flex-1 md:flex-none" onClick={() => setNewEmp({ name: '', role: '', department: '', salary: 0, phone: '', joiningDate: '' })}>
                <Plus className="h-4 w-4" /> Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader className="p-6 pb-0 shrink-0"><DialogTitle>{editingEmpId ? 'Edit Employee' : 'New Employee Record'}</DialogTitle></DialogHeader>
                <ScrollArea className="flex-grow min-h-0">
                <div className="p-6">
                  <div className="grid gap-6 py-1">
                  <div className="space-y-2">
                      <Label className="text-xs">Full Name</Label>
                      <Input placeholder="John Doe" value={newEmp.name} onChange={e => setNewEmp({...newEmp, name: e.target.value})} className="h-10" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                      <Label className="text-xs">Role</Label>
                      <Input placeholder="e.g. Front Desk" value={newEmp.role} onChange={e => setNewEmp({...newEmp, role: e.target.value})} className="h-10" />
                      </div>
                      <div className="space-y-2">
                      <Label className="text-xs">Department</Label>
                      <Select value={newEmp.department} onValueChange={v => setNewEmp({...newEmp, department: v})}>
                          <SelectTrigger className="h-10">
                              <SelectValue placeholder="Select area" />
                          </SelectTrigger>
                          <SelectContent>
                              {departments.filter(d => !!d.id).map(d => (
                                  <SelectItem key={d.id} value={d.name} className="text-sm">{d.name}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                      <Label className="text-xs">Salary (Monthly)</Label>
                      <Input 
                          type="number" 
                          className="h-10"
                          value={isNaN(newEmp.salary) ? "" : (newEmp.salary === 0 ? "" : newEmp.salary)} 
                          onChange={e => setNewEmp({...newEmp, salary: parseFloat(e.target.value) || 0})} 
                      />
                      </div>
                      <div className="space-y-2">
                      <Label className="text-xs">Phone</Label>
                      <Input placeholder="Contact No" value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} className="h-10" />
                      </div>
                  </div>
                  <div className="space-y-2 pb-4">
                      <Label className="text-xs">Joining Date</Label>
                      <Input type="date" value={newEmp.joiningDate} onChange={e => setNewEmp({...newEmp, joiningDate: e.target.value})} className="h-10" />
                  </div>
                  </div>
                </div>
                </ScrollArea>
                <DialogFooter className="p-6 border-t bg-muted/5 shrink-0">
                <Button onClick={handleAddOrEditEmployee} className="w-full h-12 rounded-xl">{editingEmpId ? 'Update Record' : 'Save Employee'}</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Staff</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black">{employees.length}</div>
              </CardContent>
          </Card>
          <Card className="border-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                  <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Monthly Payroll</CardTitle>
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                  <div className="text-2xl font-black">{formatCurrency(totalPayroll)}</div>
              </CardContent>
          </Card>
      </div>

      <div className="space-y-4">
        {employees.map(emp => {
          const paidThisMonth = emp.payments
            .filter(p => p.month === currentMonthStr)
            .reduce((sum, p) => sum + p.amount, 0);
          const remaining = Math.max(0, emp.salary - paidThisMonth);

          return (
            <Card key={emp.id} className="overflow-hidden border-none shadow-sm bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start sm:items-center gap-4">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14 bg-primary/10 border-2 border-primary/5 shrink-0">
                      <AvatarFallback className="text-primary font-black text-lg">
                        {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg leading-tight truncate">{emp.name}</h3>
                        <div className="flex gap-0.5 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleOpenEdit(emp)}>
                                <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-full">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Profile?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to delete the record for {emp.name}? This will remove all their payroll and payment history.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(emp.id)} className="bg-destructive hover:bg-destructive/90">
                                            Delete Record
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground font-bold uppercase tracking-tight truncate">{emp.role} • {emp.department}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground pt-1">
                          <span className="flex items-center gap-1.5 font-medium"><Phone className="h-3 w-3" /> {emp.phone}</span>
                          <span className="flex items-center gap-1.5 font-medium"><Calendar className="h-3 w-3" /> Joined {emp.joiningDate}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 md:pt-0 border-t md:border-none">
                    <div className="md:text-right">
                      <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest mb-1">Monthly Package</p>
                      <p className="font-black text-xl text-primary">{formatCurrency(emp.salary)}</p>
                      {remaining > 0 ? (
                        <Badge variant="destructive" className="text-[9px] font-black uppercase px-2 h-4 mt-1">Pending: {formatCurrency(remaining)}</Badge>
                      ) : (
                        <Badge variant="success" className="text-[9px] font-black uppercase px-2 h-4 mt-1 bg-green-500/10 text-green-600 border-green-200">Fully Paid</Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="h-10 px-4 gap-2 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 rounded-full font-black text-[10px] uppercase tracking-wider" onClick={() => {
                        setPaymentModal(emp.id);
                        const m = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
                        const paid = emp.payments.filter(p => p.month === m).reduce((s, p) => s + p.amount, 0);
                        setNewPay({
                            ...newPay, 
                            amount: Math.max(0, emp.salary - paid), 
                            month: m 
                        });
                    }}>
                      <Wallet className="h-3.5 w-3.5" /> Pay
                    </Button>
                  </div>
                </div>

                {emp.payments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-dashed">
                    <p className="text-[9px] font-black uppercase text-muted-foreground mb-3 tracking-widest">Recent Payroll History</p>
                    <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-3 pb-2">
                        {emp.payments.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-muted/30 px-3 py-2 rounded-xl text-xs border border-muted/50">
                                <span className="font-bold">{p.month}</span>
                                <span className="text-primary font-black">{formatCurrency(p.amount)}</span>
                                <Badge variant={p.status === 'paid' ? 'success' : 'outline'} className="text-[8px] h-4 px-1.5 uppercase font-black">{p.status}</Badge>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!paymentModal} onOpenChange={() => setPaymentModal(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="p-6 pb-0 shrink-0"><DialogTitle>Record Salary Payment</DialogTitle></DialogHeader>
          <ScrollArea className="flex-grow min-h-0">
          <div className="p-6">
            <div className="grid gap-6 py-1">
              <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Pending for {newPay.month}</p>
                <p className="text-3xl font-black text-primary">{formatCurrency(remainingForSelected)}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Billing Month</Label>
                <Input placeholder="e.g. April 2026" value={newPay.month} onChange={e => setNewPay({...newPay, month: e.target.value})} className="h-10 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Amount</Label>
                  <Input 
                    type="number" 
                    className="h-10 text-sm"
                    value={isNaN(newPay.amount) ? "" : (newPay.amount === 0 ? "" : newPay.amount)} 
                    placeholder={remainingForSelected.toString()}
                    onChange={e => setNewPay({...newPay, amount: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Payment Date</Label>
                  <Input type="date" value={newPay.date} onChange={e => setNewPay({...newPay, date: e.target.value})} className="h-10 text-sm" />
                </div>
              </div>
              <div className="space-y-2 pb-4">
                <Label className="text-xs">Status</Label>
                <Select value={newPay.status} onValueChange={v => setNewPay({...newPay, status: v as any})}>
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
            <Button onClick={handleAddPayment} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs">Confirm Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddUserDialog 
        open={isAddUserOpen}
        onOpenChange={setIsAddUserOpen}
        onSave={handleCreateStaffUser}
        currentUserRole={userProfile?.role}
      />
    </div>
  );
}
