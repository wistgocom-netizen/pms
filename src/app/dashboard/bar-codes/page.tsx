'use client';

import { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Barcode from 'react-barcode';
import { Printer, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';


// New type for custom barcodes
type CustomBarcode = {
  id: string;
  value: string;
  label: string;
  quantity: number;
};

export default function BarcodesPage() {
    const { products, formatCurrency, t, userProfile, isLoading } = useStore();
    const [selectedProducts, setSelectedProducts] = useState<Map<string, number>>(new Map());
    const [searchTerm, setSearchTerm] = useState('');
    const [printLayout, setPrintLayout] = useState('3-col');
    
    // State for custom barcodes
    const [customBarcodes, setCustomBarcodes] = useState<CustomBarcode[]>([]);
    const [customValue, setCustomValue] = useState('');
    const [customLabel, setCustomLabel] = useState('');
    const [customQuantity, setCustomQuantity] = useState(1);

    const filteredProducts = useMemo(() => {
        if (!products) return [];
        return products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [products, searchTerm]);

    const itemsToPrint = useMemo(() => {
        const productItems = Array.from(selectedProducts.entries()).map(([productId, quantity]) => {
            const product = products.find(p => p.id === productId);
            if (!product) return null;
            return {
                id: product.id,
                name: product.name,
                value: product.id,
                price: product.price,
                quantity: quantity
            };
        }).filter(Boolean) as { id: string; name: string; value: string; price: number, quantity: number }[];

        const customItems = customBarcodes.map(cb => ({
            id: cb.id,
            name: cb.label || 'Custom Barcode',
            value: cb.value,
            price: null,
            quantity: cb.quantity,
        }));

        return [...productItems, ...customItems];
    }, [products, selectedProducts, customBarcodes]);


    if (isLoading) {
      return (
        <div className="space-y-6">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-72" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (userProfile?.role !== 'super-admin' && !userProfile?.cashierPermissions?.barcodes) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
                <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
            </div>
        );
    }

    const handleSelectProduct = (productId: string) => {
        setSelectedProducts(prev => {
            const newMap = new Map(prev);
            if (newMap.has(productId)) {
                newMap.delete(productId);
            } else {
                newMap.set(productId, 1); // Default quantity is 1
            }
            return newMap;
        });
    };
    
    const handleProductQuantityChange = (productId: string, quantity: number) => {
        setSelectedProducts(prev => {
            const newMap = new Map(prev);
            if (quantity > 0) {
                newMap.set(productId, quantity);
            } else {
                newMap.delete(productId);
            }
            return newMap;
        });
    };

    const handleSelectAll = (checked: boolean | 'indeterminate') => {
        if (checked === true) {
            const newMap = new Map();
            filteredProducts.forEach(p => newMap.set(p.id, 1));
            setSelectedProducts(newMap);
        } else {
            setSelectedProducts(new Map());
        }
    };

    const handleAddCustomBarcode = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customValue.trim() || customQuantity < 1) return;
        
        const newCustomBarcode: CustomBarcode = {
            id: `custom-${Date.now()}`,
            value: customValue,
            label: customLabel,
            quantity: customQuantity
        };
        setCustomBarcodes(prev => [...prev, newCustomBarcode]);

        // Reset form
        setCustomValue('');
        setCustomLabel('');
        setCustomQuantity(1);
    };

    const handleCustomBarcodeQuantityChange = (id: string, quantity: number) => {
        setCustomBarcodes(prev => prev.map(cb => cb.id === id ? { ...cb, quantity } : cb));
    };

    const handleRemoveCustomBarcode = (id: string) => {
        setCustomBarcodes(prev => prev.filter(cb => cb.id !== id));
    };

    const handlePrint = () => {
        window.print();
    };

    const totalBarcodes = itemsToPrint.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            <div className="space-y-6" id="barcodes-page-container">
                <div className="non-printable">
                    <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Generate Barcodes')}</h1>
                    <p className="text-muted-foreground">{t('Select products or create custom barcodes to print.')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 non-printable">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('Select Products')}</CardTitle>
                            <div className="flex items-center pt-4">
                                <Input
                                    placeholder={t('Filter products...')}
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    className="max-w-sm"
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-96">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">
                                                <Checkbox
                                                    checked={filteredProducts.length > 0 && selectedProducts.size >= filteredProducts.length ? true : (filteredProducts.length > 0 && selectedProducts.size > 0 ? 'indeterminate' : false)}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead>{t('Product')}</TableHead>
                                            <TableHead>{t('ID / Barcode')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.map(product => (
                                            <TableRow key={product.id} onClick={() => handleSelectProduct(product.id)} className="cursor-pointer">
                                                <TableCell>
                                                    <Checkbox checked={selectedProducts.has(product.id)} onCheckedChange={() => handleSelectProduct(product.id)} onClick={(e) => e.stopPropagation()} />
                                                </TableCell>
                                                <TableCell>{product.name}</TableCell>
                                                <TableCell className="font-mono">{product.id}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                     <Card className="non-printable">
                        <CardHeader>
                            <CardTitle>{t('Create Custom Barcode')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleAddCustomBarcode} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="custom-value">{t('Value / Data')}</Label>
                                    <Input id="custom-value" value={customValue} onChange={e => setCustomValue(e.target.value)} required />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="custom-label">{t('Label (Optional)')}</Label>
                                    <Input id="custom-label" value={customLabel} onChange={e => setCustomLabel(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="custom-quantity">{t('Quantity')}</Label>
                                    <Input id="custom-quantity" type="number" min="1" value={customQuantity} onChange={e => setCustomQuantity(parseInt(e.target.value) || 1)} required />
                                </div>
                                <Button type="submit" className="w-full">{t('Add to Print Queue')}</Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
                
                <Card>
                    <CardHeader className="non-printable">
                        <CardTitle>{t('Print Queue')}</CardTitle>
                        <CardDescription>{totalBarcodes > 0 ? t('{count} total barcodes', { count: totalBarcodes }) : t('{count} item(s)', { count: 0 })} {t('in queue')}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {itemsToPrint.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                <div className="non-printable grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                    <div className="space-y-1">
                                        <Label htmlFor="print-layout">{t('Print Layout')}</Label>
                                        <Select value={printLayout} onValueChange={setPrintLayout}>
                                            <SelectTrigger id="print-layout">
                                                <SelectValue placeholder={t('Select layout')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1-col">{t('1 Column')}</SelectItem>
                                                <SelectItem value="2-col">{t('2 Columns')}</SelectItem>
                                                <SelectItem value="3-col">{t('3 Columns')}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button onClick={handlePrint}>
                                        <Printer className="mr-2 h-4 w-4" />
                                        {t('Print All')}
                                    </Button>
                                </div>
                                <ScrollArea className="h-[50vh]">
                                    <div className="space-y-4 pr-4">
                                        {itemsToPrint.map(item => (
                                            <div key={item.id} className="non-printable flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-md">
                                                <div className="flex-grow">
                                                    <p className="font-semibold truncate">{item.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{item.value}</p>
                                                </div>
                                                <Input 
                                                    type="number" 
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const newQuantity = parseInt(e.target.value) || 1;
                                                        if (item.price !== null) { // It's a product
                                                            handleProductQuantityChange(item.id, newQuantity);
                                                        } else { // It's a custom barcode
                                                            handleCustomBarcodeQuantityChange(item.id, newQuantity);
                                                        }
                                                    }}
                                                    className="w-16 h-8"
                                                />
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => {
                                                        if (item.price !== null) { // It's a product
                                                            handleProductQuantityChange(item.id, 0);
                                                        } else { // It's a custom barcode
                                                            handleRemoveCustomBarcode(item.id);
                                                        }
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                    <div id="barcode-section" data-layout={printLayout}>
                                        {itemsToPrint.flatMap(item => (
                                            Array.from({ length: item.quantity }).map((_, i) => (
                                                <div key={`${item.id}-${i}`} className="barcode-item">
                                                    <p className="font-semibold text-sm truncate">{item.name}</p>
                                                    {item.price !== null && <p className="text-xs">{formatCurrency(item.price)}</p>}
                                                    <Barcode value={item.value} height={50} fontSize={12} margin={2} textAlign="center" />
                                                </div>
                                            ))
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-muted-foreground non-printable">
                                <p>{t('Select products or create custom barcodes to print.')}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <style jsx global>{`
                /* --- SCREEN STYLES --- */
                #barcode-section {
                    display: grid;
                    gap: 12px;
                    margin-top: 1.5rem;
                    padding: 1rem;
                    border-radius: var(--radius);
                    border: 1px solid hsl(var(--border));
                }
                .barcode-item {
                    padding: 8px;
                    border-radius: 4px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    background: hsl(var(--card));
                    color: hsl(var(--card-foreground));
                    box-sizing: border-box;
                    overflow: hidden;
                }
                 .barcode-item p {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    max-width: 100%;
                    text-align: center;
                }
                .barcode-item svg {
                    max-width: 100%;
                    height: auto;
                }
                .barcode-item svg g text {
                    fill: hsl(var(--card-foreground)) !important;
                }

                /* --- GRID LAYOUT STYLES --- */
                #barcode-section[data-layout="1-col"] { grid-template-columns: repeat(1, 1fr); }
                #barcode-section[data-layout="2-col"] { grid-template-columns: repeat(2, 1fr); }
                #barcode-section[data-layout="3-col"] { grid-template-columns: repeat(3, 1fr); }

                /* --- PRINT-ONLY STYLES --- */
                @media print {
                    @page {
                        /* Let printer decide size, which is better for label printers */
                        margin: 2mm;
                    }

                    body {
                        background: white !important;
                    }

                    /* Hide everything by default */
                    body * {
                        visibility: hidden;
                    }

                    /* Make only the barcode section and its children visible */
                    #barcode-section, #barcode-section * {
                        visibility: visible;
                    }
                    
                    /* Place the barcode section at the top of the page */
                    #barcode-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 0;
                        border: none;
                        display: grid;
                        align-content: flex-start;
                        gap: 2mm;
                        box-sizing: border-box;
                    }

                    /* Ensure .non-printable is still hidden, just in case */
                    .non-printable {
                        display: none !important;
                    }
                    
                    /* Styles for each individual barcode label */
                    .barcode-item {
                        border: 1px dashed #aaa;
                        background: white !important;
                        color: black !important;
                        page-break-inside: avoid; /* Critical for preventing labels from splitting across pages */
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: space-between;
                        box-sizing: border-box;
                        overflow: hidden;
                        padding: 2mm;
                    }
                    
                    .barcode-item p {
                        color: black !important;
                        margin: 0;
                        padding: 0.5mm 0;
                        font-size: 8pt; /* Use points for print consistency */
                        max-width: 100%;
                        text-align: center;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .barcode-item svg {
                        max-width: 100%;
                        width: 100%;
                        height: auto;
                    }

                    .barcode-item svg g text {
                        fill: black !important;
                        font-size: 7pt;
                    }
                }
            `}</style>
        </>
    );
}
