'use client';

import { useState, useMemo, useCallback } from "react";
import { getColumns } from "./columns";
import { DataTable } from "../components/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SupplierFormDialog } from "./add-supplier-dialog";
import type { Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useStore } from "@/context/StoreContext";
import { Input } from "@/components/ui/input";
import type { ColumnFiltersState, RowSelectionState } from "@tanstack/react-table";

export default function SuppliersPage() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, deleteSuppliers, t, userProfile } = useStore();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const { toast } = useToast();
  
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);

  const handleOpenAddDialog = useCallback(() => {
    setSupplierToEdit(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((supplier: Supplier) => {
    setSupplierToEdit(supplier);
    setIsFormDialogOpen(true);
  }, []);

  const handleSaveSupplier = useCallback((supplierData: Omit<Supplier, 'id'> & { id?: string }) => {
    const isEditMode = !!supplierData.id;
    
    if (isEditMode) {
      updateSupplier(supplierData.id!, supplierData);
      toast({
        title: t('Supplier Updated'),
        description: t('Supplier {name} has been successfully updated.', { name: supplierData.name }),
      });
    } else {
      addSupplier(supplierData);
      toast({
        title: t('Supplier Added'),
        description: t('Supplier {name} has been successfully added.', { name: supplierData.name }),
      });
    }

    setIsFormDialogOpen(false);
    setSupplierToEdit(null);
  }, [toast, addSupplier, updateSupplier, t]);

  const handleOpenDeleteDialog = useCallback((supplier: Supplier) => {
      setSupplierToDelete(supplier);
      setIsDeleteAlertOpen(true);
  }, []);

  const handleDeleteSupplier = useCallback(() => {
    if (!supplierToDelete) return;
    deleteSupplier(supplierToDelete.id);
    toast({
        title: t("Supplier Deleted"),
        description: t('Supplier {name} has been deleted.', { name: supplierToDelete.name })
    })
    setIsDeleteAlertOpen(false);
    setSupplierToDelete(null);
  }, [supplierToDelete, deleteSupplier, toast, t]);
  
  const handleBulkDelete = useCallback(() => {
    const supplierIds = selectedSuppliers.map(s => s.id);
    deleteSuppliers(supplierIds);
    toast({
        title: t('{count} Supplier(s) Deleted', { count: supplierIds.length }),
        description: t(`The selected suppliers have been successfully deleted.`)
    });
    setRowSelection({}); // Clear selection
    setIsBulkDeleteAlertOpen(false);
  }, [deleteSuppliers, toast, t]); // Simplified dependencies for safety

  const columns = useMemo(() => getColumns(handleOpenDeleteDialog, t), [handleOpenDeleteDialog, t]);

  const selectedSuppliers = useMemo(() => {
    return Object.keys(rowSelection)
        .map(index => (suppliers || [])[parseInt(index, 10)])
        .filter((p): p is Supplier => !!p);
  }, [rowSelection, suppliers]);

  const numSelected = selectedSuppliers.length;

  // Check permissions AFTER all hooks are initialized
  const canAccess = userProfile?.role === 'super-admin' || userProfile?.cashierPermissions?.suppliers;

  if (!canAccess) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
            <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
        </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Suppliers')}</h1>
          <p className="text-muted-foreground">{t('Manage your product suppliers.')}</p>
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('All Suppliers')}</CardTitle>
              <Button onClick={handleOpenAddDialog}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('Add Supplier')}
              </Button>
            </div>
            <CardDescription>
              {t('View, edit, and manage all suppliers for your store.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4">
              <Input
                placeholder={t('Filter by name or email...')}
                value={(columnFilters.find(f => f.id === 'name')?.value as string) ?? ""}
                onChange={(event) =>
                  setColumnFilters([{ id: 'name', value: event.target.value }])
                }
                className="max-w-sm"
              />
              {numSelected > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setIsBulkDeleteAlertOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t('Delete ({count})', { count: numSelected })}
                </Button>
              )}
            </div>
            <DataTable 
              columns={columns} 
              data={suppliers || []} 
              onRowClick={handleRowClick}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              columnFilters={columnFilters}
              onColumnFiltersChange={setColumnFilters}
            />
          </CardContent>
        </Card>
      </div>

      <SupplierFormDialog
        key={supplierToEdit?.id || 'new'}
        open={isFormDialogOpen}
        onOpenChange={(open) => {
            if (!open) setSupplierToEdit(null);
            setIsFormDialogOpen(open);
        }}
        onSave={handleSaveSupplier}
        supplierToEdit={supplierToEdit}
      />
    
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the supplier "{name}".', { name: supplierToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSupplierToDelete(null)}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSupplier} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the {numSelected} selected supplier(s).', { numSelected })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
