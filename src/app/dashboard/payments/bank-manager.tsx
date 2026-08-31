
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Bank } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStore } from '@/context/StoreContext';
import { Skeleton } from '@/components/ui/skeleton';

export function BankManager() {
  const { toast } = useToast();
  const { banks, addBank, updateBank, deleteBank, isLoadingBanks, t } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [bankName, setBankName] = useState('');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

  const handleOpenDialog = (bank: Bank | null) => {
    setEditingBank(bank);
    setBankName(bank ? bank.name : '');
    setDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!bankName.trim()) {
      toast({
        title: t('Error'),
        description: t('Bank name cannot be empty.'),
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingBank) {
        await updateBank(editingBank.id, { name: bankName });
        toast({ title: t('Bank Updated'), description: t('Bank "{name}" has been updated.', { name: bankName }) });
      } else {
        const newBank: Omit<Bank, 'id'> = {
          name: bankName,
        };
        await addBank(newBank);
        toast({ title: t('Bank Added'), description: t('Bank "{name}" has been added.', { name: bankName }) });
      }
      setDialogOpen(false);
    } catch(error) {
      console.error("Failed to save bank", error);
      toast({
        title: t('Error'),
        description: t('Failed to save bank.'),
        variant: 'destructive',
      });
    }
  };

  const handleOpenDeleteDialog = (bank: Bank) => {
    setBankToDelete(bank);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteBank = async () => {
    if (!bankToDelete) return;
    try {
      await deleteBank(bankToDelete.id);
      toast({ title: t('Bank Deleted'), description: t('The bank "{name}" has been deleted.', { name: bankToDelete.name }) });
    } catch(error) {
       toast({ title: t('Error'), description: t('Failed to delete bank.') });
    } finally {
      setIsDeleteAlertOpen(false);
      setBankToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('Manage Banks')}</CardTitle>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('Add Bank')}
            </Button>
          </div>
          <CardDescription>
            {t('Add, edit, or delete banks for cheque payments.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {isLoadingBanks ? (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
           ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Bank Name')}</TableHead>
                    <TableHead className="text-right w-[120px]">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(banks || []).length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                              {t('No banks found.')}
                          </TableCell>
                      </TableRow>
                  ) : (
                      (banks || []).map(bank => (
                      <TableRow key={bank.id}>
                          <TableCell className="font-medium">{bank.name}</TableCell>
                          <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(bank)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">{t('Edit')}</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(bank)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t('Delete')}</span>
                          </Button>
                          </TableCell>
                      </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
           )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBank ? t('Edit Bank') : t('Add New Bank')}</DialogTitle>
            <DialogDescription>
              {editingBank ? t('Change the details of the bank.') : t('Enter the name for the new bank.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('Name')}
              </Label>
              <Input
                id="name"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('Cancel')}</Button>
            <Button onClick={handleSaveChanges}>{t('Save Changes')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the bank "{name}".', { name: bankToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBank} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
