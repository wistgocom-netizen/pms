'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (products: Product[]) => Promise<void>;
}

export function ImportProductsDialog({ open, onOpenChange, onImport }: ImportProductsDialogProps) {
    const { t } = useStore();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleImportClick = async () => {
        if (!file) {
            toast({ variant: 'destructive', title: t('No file selected'), description: t('Please select a CSV file to import.') });
            return;
        }

        setIsImporting(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            try {
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 2) {
                    throw new Error(t('CSV must have a header and at least one data row.'));
                }
                const header = lines[0].split(',').map(h => h.trim());
                const productsToImport: Product[] = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const productData: any = header.reduce((obj, h, i) => {
                        obj[h] = values[i] ? values[i].trim() : '';
                        return obj;
                    }, {} as any);

                    return {
                        id: productData.id,
                        name: productData.name,
                        category: productData.category,
                        price: parseFloat(productData.price) || 0,
                        stock: parseInt(productData.stock, 10) || 0,
                        emoji: productData.emoji || '📦',
                        supplier: productData.supplier,
                        buyingPrice: parseFloat(productData.buyingPrice) || 0,
                        expireDate: productData.expireDate,
                        hasWarranty: productData.hasWarranty?.toUpperCase() === 'TRUE',
                        warrantyPeriod: productData.warrantyPeriod,
                        genericName: productData.genericName,
                        manufacturer: productData.manufacturer,
                        packSize: productData.packSize,
                        batchNumber: productData.batchNumber,
                        manufacturingDate: productData.manufacturingDate,
                        rackLocation: productData.rackLocation,
                    };
                });
                
                const validProducts = productsToImport.filter(p => p.id && p.name);

                if (validProducts.length === 0) {
                    throw new Error(t("No valid product data found in the file."));
                }

                await onImport(validProducts);

                toast({
                    title: t('Import Successful'),
                    description: t('{count} products have been imported.', { count: validProducts.length }),
                });

                onOpenChange(false);
                setFile(null);
            } catch (error) {
                console.error("Import error:", error);
                toast({
                    variant: 'destructive',
                    title: t('Import Failed'),
                    description: error instanceof Error ? error.message : t('An error occurred during import. Please check file format.'),
                });
            } finally {
                setIsImporting(false);
            }
        };

        reader.readAsText(file);
    };
    
    const exampleHeaders = "id,name,category,price,stock,emoji,supplier,buyingPrice,expireDate,hasWarranty,warrantyPeriod";

    return (
        <Dialog open={open} onOpenChange={(isOpen) => { onOpenChange(isOpen); if (!isOpen) setFile(null); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('Import Products')}</DialogTitle>
                    <DialogDescription>
                        {t('Upload a CSV file to bulk-add products.')}
                        {t('The first row must be a header with the following columns (minimum: id, name, category, price, stock):')}
                    </DialogDescription>
                     <div className="text-xs text-muted-foreground bg-muted p-2 rounded-md font-mono break-all">
                        {exampleHeaders}
                    </div>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="csv-file">{t('CSV File')}</Label>
                    <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isImporting}>{t('Cancel')}</Button>
                    <Button onClick={handleImportClick} disabled={isImporting || !file}>
                        {isImporting ? t('Importing...') : t('Import')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}