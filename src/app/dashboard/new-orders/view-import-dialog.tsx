'use client';

import { useState, useMemo } from 'react';
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
import { DataTable } from '../components/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

type ImportedOrder = {
    [key: string]: string;
};

interface ViewImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewImportDialog({ open, onOpenChange }: ViewImportDialogProps) {
    const { t } = useStore();
    const { toast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [importedData, setImportedData] = useState<ImportedOrder[]>([]);
    const [columns, setColumns] = useState<ColumnDef<ImportedOrder>[]>([]);
    const [filter, setFilter] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            try {
                // Supports both CSV and TSV
                const separator = text.includes('\t') ? '\t' : ',';
                const lines = text.split('\n').filter(line => line.trim() !== '');
                if (lines.length < 1) {
                    throw new Error(t('File is empty.'));
                }
                const header = lines[0].split(separator).map(h => h.trim().replace(/"/g, ''));
                
                const data = lines.slice(1).map(line => {
                    const values = line.split(separator);
                    return header.reduce((obj, h, i) => {
                        obj[h] = values[i] ? values[i].trim().replace(/"/g, '') : '';
                        return obj;
                    }, {} as ImportedOrder);
                });

                const generatedColumns: ColumnDef<ImportedOrder>[] = header.map(h => ({
                    accessorKey: h,
                    header: h,
                }));

                setColumns(generatedColumns);
                setImportedData(data);
                toast({ title: t('File Loaded'), description: t('{count} rows loaded for viewing.', { count: data.length }) });

            } catch (error) {
                console.error("Import view error:", error);
                toast({
                    variant: 'destructive',
                    title: t('Load Failed'),
                    description: error instanceof Error ? error.message : t('An error occurred during file parsing.'),
                });
            }
        };
        reader.readAsText(selectedFile);
    };

    const filteredData = useMemo(() => {
        if (!filter) return importedData;
        const lowerFilter = filter.toLowerCase();
        return importedData.filter(row => 
            Object.values(row).some(val => 
                String(val).toLowerCase().includes(lowerFilter)
            )
        );
    }, [importedData, filter]);
    
    const handleClose = () => {
        onOpenChange(false);
        // Reset state on close, fulfilling the "automatically delete" requirement
        setFile(null);
        setImportedData([]);
        setColumns([]);
        setFilter('');
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('View Imported File')}</DialogTitle>
                    <DialogDescription>
                        {t('Select a CSV or TSV file to view its contents. This data is temporary and will be gone when you close this window.')}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div className='space-y-1.5'>
                        <Label htmlFor="import-view-file">{t('File to View')}</Label>
                        <Input id="import-view-file" type="file" accept=".csv,.tsv" onChange={handleFileChange} />
                    </div>
                     {importedData.length > 0 && (
                        <Input
                            placeholder={t('Search in imported data...')}
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="max-w-sm"
                        />
                    )}
                </div>
                {importedData.length > 0 ? (
                    <ScrollArea className="flex-grow min-h-0">
                         <DataTable columns={columns} data={filteredData} onColumnFiltersChange={() => {}} columnFilters={[]} paginated={false} />
                    </ScrollArea>
                ) : (
                    <div className="flex-grow flex items-center justify-center text-muted-foreground">
                        {t('Please select a file to view its contents.')}
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>{t('Cancel')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
