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
import { ProductFormDialog } from "./add-product-dialog";
import { CategoryManager } from "./category-manager";
import { ImportProductsDialog } from "./import-products-dialog";
import type { Product, Category, Supplier } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Import, Layers, LayoutGrid, PackageSearch, AlertTriangle } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, deleteProducts, categories, suppliers, t, formatCurrency, userProfile, organization, pricingPlans } = useStore();

  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { toast } = useToast();
  
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const productLimit = useMemo(() => {
    if (userProfile?.role === 'super-admin') return 999;
    const planName = organization?.subscriptionPlan || 'Basic';
    const plan = pricingPlans.find(p => p.name.toLowerCase() === planName.toLowerCase());
    return plan?.products || 50;
  }, [organization, pricingPlans, userProfile]);

  const isLimitReached = products.length >= productLimit;

  const handleOpenAddDialog = useCallback(() => {
    setProductToEdit(null);
    setIsFormDialogOpen(true);
  }, []);

  const handleRowClick = useCallback((product: Product) => {
    setProductToEdit(product);
    setIsFormDialogOpen(true);
  }, []);

  const handleSaveProduct = useCallback(async (productData: Product) => {
    if (productToEdit) {
        // Edit mode
        const fields: (keyof Product)[] = ['name', 'price', 'stock', 'category', 'emoji', 'supplier', 'buyingPrice', 'expireDate', 'hasWarranty', 'warrantyPeriod', 'genericName', 'manufacturer', 'packSize', 'batchNumber', 'manufacturingDate', 'rackLocation'];
        fields.forEach(field => {
            updateProduct(productData.id, field, productData[field]);
        });
    } else {
        // Add mode
        await addProduct(productData);
    }
    setIsFormDialogOpen(false);
    setProductToEdit(null);
  }, [addProduct, updateProduct, productToEdit]);

  const handleOpenDeleteDialog = useCallback((product: Product) => {
      setProductToDelete(product);
      setIsDeleteAlertOpen(true);
  }, []);

  const handleDeleteProduct = useCallback(() => {
    if (!productToDelete) return;
    deleteProduct(productToDelete);
    toast({
        title: t("Product Deleted"),
        description: t('Product {name} has been deleted.', { name: productToDelete.name })
    })
    setIsDeleteAlertOpen(false);
    setProductToDelete(null);
  }, [productToDelete, deleteProduct, toast, t]);
  
  const handleBulkDelete = useCallback(() => {
    const productIds = selectedProducts.map(p => p.id);
    deleteProducts(productIds);
    toast({
        title: t('{count} Product(s) Deleted', { count: productIds.length }),
        description: t(`The selected products have been successfully deleted.`)
    });
    setRowSelection({});
    setIsBulkDeleteAlertOpen(false);
  }, [deleteProducts, toast, t]);

  const handleImport = async (importedProducts: Product[]) => {
    const remainingSlots = productLimit - products.length;
    const toImport = importedProducts.slice(0, Math.max(0, remainingSlots));
    
    if (toImport.length < importedProducts.length) {
        toast({
            variant: 'destructive',
            title: t('Limit Partially Reached'),
            description: t('Only {count} products were imported due to your plan limit.', { count: toImport.length })
        });
    }

    for (const p of toImport) {
        await addProduct(p);
    }
  };

  const columns = useMemo(() => getColumns(formatCurrency, updateProduct, handleOpenDeleteDialog, categories, t), [formatCurrency, updateProduct, handleOpenDeleteDialog, categories, t]);

  const selectedProducts = useMemo(() => {
    return Object.keys(rowSelection)
        .map(index => (products || [])[parseInt(index, 10)])
        .filter((p): p is Product => !!p);
  }, [rowSelection, products]);

  const numSelected = selectedProducts.length;

  const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.cashierPermissions?.products;

  if (!canAccess) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
            <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Inventory Management')}</h1>
          <p className="text-muted-foreground">{t('Comprehensive control over your product catalog.')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
            {isLimitReached && (
                <Badge variant="destructive" className="h-9 px-3 gap-2">
                    <AlertTriangle className="h-4 w-4" /> Product Limit Reached ({productLimit})
                </Badge>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)} className="h-9" disabled={isLimitReached}>
                <Import className="mr-2 h-4 w-4" /> {t('Import')}
            </Button>
            <Button size="sm" onClick={handleOpenAddDialog} className="h-9" disabled={isLimitReached}>
                <PlusCircle className="mr-2 h-4 w-4" /> {t('Add Product')}
            </Button>
        </div>
      </div>

      <Tabs defaultValue="all-products" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="all-products" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            {t('All Products')}
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Layers className="h-4 w-4" />
            {t('Categories')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-products" className="space-y-6 border-none p-0 focus-visible:ring-0">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle>{t('Product Directory')}</CardTitle>
              <CardDescription>
                {t('Quickly update stock levels, prices, and categories inline.')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                <div className="relative w-full md:max-w-sm">
                  <PackageSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('Search by name, SKU or HSN...')}
                    value={(columnFilters.find(f => f.id === 'name')?.value as string) ?? ""}
                    onChange={(event) =>
                      setColumnFilters([{ id: 'name', value: event.target.value }])
                    }
                    className="pl-9"
                  />
                </div>
                {numSelected > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsBulkDeleteAlertOpen(true)}
                    className="w-full md:w-auto"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {t('Delete ({count})', { count: numSelected })}
                  </Button>
                )}
              </div>
              <DataTable 
                columns={columns} 
                data={products || []} 
                onRowClick={handleRowClick}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                columnFilters={columnFilters}
                onColumnFiltersChange={setColumnFilters}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="border-none p-0 focus-visible:ring-0">
          <CategoryManager categories={categories} />
        </TabsContent>
      </Tabs>

      <ProductFormDialog
        key={productToEdit?.id || 'new'}
        open={isFormDialogOpen}
        onOpenChange={(open) => {
            if (!open) setProductToEdit(null);
            setIsFormDialogOpen(open);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
        suppliers={suppliers}
      />
    
      <ImportProductsDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
      />

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the product "{name}".', { name: productToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the {numSelected} selected product(s).', { numSelected })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRowSelection({})}>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}