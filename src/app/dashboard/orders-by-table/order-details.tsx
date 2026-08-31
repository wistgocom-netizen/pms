'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/context/StoreContext";
import { Product, Sale } from "@/lib/types";
import { Clock, Mail, Phone, Plus, Minus, Trash2, Save, X, Printer, FileText } from "lucide-react";
import { useState, useMemo, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Receipt } from "../components/receipt";
import { Invoice } from "../components/invoice";
import { cn } from "@/lib/utils";

type SaleItem = Sale['items'][0];

interface OrderDetailsProps {
    order: Sale & { customerName?: string, customerEmail?: string, customerPhone?: string };
    onPayBill: () => void;
    onClose: () => void;
}

export function OrderDetails({ order: initialOrder, onPayBill, onClose }: OrderDetailsProps) {
    const { products, updateSaleDetails, storeName, t } = useStore();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [items, setItems] = useState<SaleItem[]>(initialOrder.items || []);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const [tableNumber, setTableNumber] = useState(initialOrder.tableNumber || '');
    const [serviceCharge, setServiceCharge] = useState(initialOrder.serviceCharge || 0);
    const [discountAmount, setDiscountAmount] = useState(initialOrder.discountAmount || 0);
    const [taxAmount, setTaxAmount] = useState(initialOrder.taxes || 0);
    const [printType, setPrintType] = useState<'receipt' | 'invoice' | null>(null);


    useEffect(() => {
        setItems(initialOrder.items || []);
        setIsEditing(false);
        setProductSearchTerm('');
        setTableNumber(initialOrder.tableNumber || '');
        setServiceCharge(initialOrder.serviceCharge || 0);
        setDiscountAmount(initialOrder.discountAmount || 0);
        setTaxAmount(initialOrder.taxes || 0);
    }, [initialOrder]);
    
    const customerInitial = initialOrder.customerName ? initialOrder.customerName.split(' ').map(n => n[0]).join('').toUpperCase() : 'W';

    const { subtotal, total } = useMemo(() => {
        const calculatedSubtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        const calculatedTotal = calculatedSubtotal - discountAmount + taxAmount + serviceCharge;
        return {
            subtotal: calculatedSubtotal,
            total: calculatedTotal,
        };
    }, [items, discountAmount, taxAmount, serviceCharge]);

    const availableProducts = useMemo(() => {
        if (!productSearchTerm) return [];
        const lowerCaseSearch = productSearchTerm.toLowerCase();
        return products.filter(
            p => (p.name.toLowerCase().includes(lowerCaseSearch) || p.id.toLowerCase().includes(lowerCaseSearch)) && !items.some(i => i.productId === p.id)
        );
    }, [productSearchTerm, products, items]);

    const handleUpdateQuantity = (productId: string, newQuantity: number) => {
        if (!isEditing) setIsEditing(true);
        const quantity = Math.max(0, newQuantity);
        setItems(currentItems =>
            currentItems
                .map(item => item.productId === productId ? { ...item, quantity } : item)
                .filter(item => item.quantity > 0)
        );
    };

    const handleAddItem = (product: Product) => {
        if (!isEditing) setIsEditing(true);
        setItems(currentItems => {
            const existingItem = currentItems.find(i => i.productId === product.id);
            if (existingItem) {
                return currentItems.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            } else {
                return [...currentItems, { productId: product.id, productName: product.name, quantity: 1, unitPrice: product.price }];
            }
        });
        setProductSearchTerm('');
    };
    
    const handleSaveChanges = () => {
        const updatedSaleData: Partial<Sale> = {
            items,
            totalAmount: total,
            taxes: taxAmount,
            discountAmount: discountAmount,
            tableNumber: tableNumber,
            serviceCharge: serviceCharge,
        };
        updateSaleDetails(initialOrder.id, updatedSaleData);
        toast({ title: t("Order Updated"), description: t("The order has been successfully saved.") });
        setIsEditing(false);
    };
    
    const handleCancel = () => {
        setItems(initialOrder.items || []);
        setTableNumber(initialOrder.tableNumber || '');
        setServiceCharge(initialOrder.serviceCharge || 0);
        setDiscountAmount(initialOrder.discountAmount || 0);
        setTaxAmount(initialOrder.taxes || 0);
        setIsEditing(false);
    };

    // Printing logic with effect to ensure rendering
    useEffect(() => {
        if (printType) {
            const timer = setTimeout(() => {
                window.print();
                setPrintType(null);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [printType]);

    const handlePrint = useCallback((type: 'receipt' | 'invoice') => {
        setPrintType(type);
    }, []);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: white !important; 
                        width: 100% !important; 
                    }
                    
                    body > *:not(.print-container) {
                        display: none !important;
                    }

                    .non-printable, header, nav, footer, aside, button, [data-sidebar="sidebar"], [role="dialog"] > button { 
                        display: none !important; 
                        visibility: hidden !important; 
                    }

                    .print-container {
                        display: block !important;
                        visibility: visible !important;
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: auto !important;
                        background: white !important;
                        z-index: 999999 !important;
                    }

                    ${printType === 'receipt' ? `
                        @page { size: 80mm auto !important; margin: 0 !important; }
                        .printable-receipt { 
                            display: block !important;
                            width: 80mm !important; 
                            margin: 0 !important;
                        }
                    ` : ''}

                    ${printType === 'invoice' ? `
                        @page { size: A4 !important; margin: 0 !important; }
                        .printable-invoice { 
                            display: block !important;
                            width: 100% !important; 
                        }
                    ` : ''}
                }
            `}} />

            <div className="flex flex-col h-full bg-card non-printable">
                <CardHeader className="relative flex flex-col sm:flex-row items-start justify-between gap-4 p-4 shrink-0">
                    <Button size="icon" className="absolute top-2 right-2 h-7 w-7 bg-foreground text-background hover:bg-foreground/90 dark:bg-destructive dark:text-destructive-foreground dark:hover:bg-destructive/90" onClick={onClose}>
                        <X className="h-4 w-4" />
                        <span className="sr-only">{t('Close')}</span>
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                            <AvatarFallback>{customerInitial}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{initialOrder.customerName}</CardTitle>
                            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                {initialOrder.customerEmail && (
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3 w-3" />
                                        {initialOrder.customerEmail}
                                    </div>
                                )}
                                    {initialOrder.customerPhone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="h-3 w-3" />
                                        {initialOrder.customerPhone}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="w-full sm:w-auto shrink-0 grid grid-cols-2 sm:flex sm:flex-col sm:items-end gap-2">
                         <div className="text-left sm:text-right">
                            <p className="text-xs text-muted-foreground">{t('Order ID')}</p>
                            <p className="font-mono text-sm">#{initialOrder.id.slice(-6)}</p>
                         </div>
                         <div className="text-left sm:text-right">
                            <Label htmlFor="table-number-details" className="text-xs text-muted-foreground mt-1">{t('Table')}</Label>
                            <Input 
                                id="table-number-details"
                                className="font-mono text-sm h-7 w-full sm:w-24 text-left sm:text-right p-1 mt-0.5"
                                value={tableNumber}
                                onChange={(e) => {
                                    setTableNumber(e.target.value)
                                    if (!isEditing) setIsEditing(true);
                                }}
                                placeholder="N/A"
                            />
                         </div>
                    </div>
                </CardHeader>
                <ScrollArea className="flex-grow min-h-0">
                    <div className="p-4 pt-0">
                        <div className="flex justify-between items-center mb-3">
                            <Badge variant={initialOrder.status === 'Completed' || initialOrder.status === 'Ready' ? 'secondary' : 'default'} className="capitalize">{t(initialOrder.status)}</Badge>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>{initialOrder.saleDate ? new Date(initialOrder.saleDate).toLocaleString() : '...'}</span>
                            </div>
                        </div>

                        <div className="space-y-2 mb-3">
                            <Label htmlFor="product-search" className="text-xs">{t('Add Product')}</Label>
                            <Input id="product-search" placeholder={t("Search by name or barcode...")} value={productSearchTerm} onChange={e => setProductSearchTerm(e.target.value)} className="h-9" />
                        </div>
                        
                        <div>
                            {productSearchTerm && (
                                <div className="pb-3 mb-3 border-b">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">
                                        {availableProducts.length > 0 ? t('Search Results') : t('No products found')}
                                    </p>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                        {availableProducts.map(p => {
                                            return (
                                                <div key={p.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md text-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-xl shrink-0">
                                                            {p.emoji}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-xs">{p.name}</p>
                                                            <p className="text-xs text-muted-foreground">{(p.price).toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                    <Button size="sm" variant="outline" onClick={() => handleAddItem(p)} className="h-7">
                                                        <Plus className="mr-1.5 h-3 w-3"/> {t('Add')}
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                {items.map((item) => {
                                    const product = products.find(p => p.id === item.productId);
                                    const emoji = product?.emoji || '📦';
                                    return (
                                        <div key={item.productId} className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center text-2xl shrink-0">
                                                {emoji}
                                            </div>
                                            <div className="flex-grow">
                                                <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                                                <p className="text-xs text-muted-foreground">{(item.unitPrice).toFixed(2)} each</p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}><Minus className="h-4 w-4" /></Button>
                                                    <Input type="number" value={item.quantity} onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 0)} className="h-7 w-12 text-center px-1" />
                                                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}><Plus className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0 gap-1">
                                                <p className="font-semibold text-sm text-right">{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleUpdateQuantity(item.productId, 0)}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {items.length === 0 && <p className="text-muted-foreground text-center text-sm py-8">{t('This order is empty.')}</p>}
                            </div>
                        </div>

                         <div className="space-y-1.5 text-sm pt-4 mt-4 border-t">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('Subtotal')}</span>
                                <span>{(subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="tax-amount" className="text-muted-foreground">{t('Tax')}</Label>
                                <Input
                                    id="tax-amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={taxAmount > 0 ? taxAmount : ''}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setTaxAmount(isNaN(value) || value < 0 ? 0 : value);
                                        if (!isEditing) setIsEditing(true);
                                    }}
                                    className="h-8 w-24 text-right pr-2"
                                    placeholder="0.00"
                                />
                            </div>
                             <div className="flex justify-between items-center">
                                <Label htmlFor="discount-amount" className="text-muted-foreground">{t('Discount')}</Label>
                                 <div className="flex items-center gap-1">
                                    <span className="text-destructive font-medium">-</span>
                                    <Input
                                        id="discount-amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={discountAmount > 0 ? discountAmount : ''}
                                        onChange={(e) => {
                                            const value = parseFloat(e.target.value);
                                            setDiscountAmount(isNaN(value) || value < 0 ? 0 : value);
                                            if (!isEditing) setIsEditing(true);
                                        }}
                                        className="h-8 w-24 text-right pr-2"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label htmlFor="service-charge" className="text-muted-foreground">{t('Service Charge')}</Label>
                                <Input
                                    id="service-charge"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={serviceCharge > 0 ? serviceCharge : ''}
                                    onChange={(e) => {
                                        const value = parseFloat(e.target.value);
                                        setServiceCharge(isNaN(value) || value < 0 ? 0 : value);
                                        if (!isEditing) setIsEditing(true);
                                    }}
                                    className="h-8 w-24 text-right pr-2"
                                    placeholder="0.00"
                                />
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold text-base">
                                <span>{t('Total')}</span>
                                <span>{(total).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
                <div className="p-4 border-t bg-card shrink-0">
                    {isEditing ? (
                        <div className="grid grid-cols-2 gap-2">
                            <Button size="lg" variant="outline" onClick={handleCancel}>{t('Cancel')}</Button>
                            <Button size="lg" onClick={handleSaveChanges}><Save className="mr-2 h-4 w-4" /> {t('Save')}</Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" onClick={() => handlePrint('receipt')}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    {t('Receipt')}
                                </Button>
                                <Button variant="outline" onClick={() => handlePrint('invoice')}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    {t('Invoice')}
                                </Button>
                            </div>
                            <Button size="lg" className="w-full" onClick={onPayBill} disabled={total <= 0}>{t('Pay Bills')}</Button>
                        </div>
                    )}
                </div>
            </div>

            <div className={cn("hidden print:block print-container")}>
                {printType === 'receipt' && (
                    <div className="printable-receipt">
                        <Receipt order={{
                            ...initialOrder,
                            items: items,
                            subtotal: subtotal,
                            taxes: taxAmount,
                            discount: discountAmount,
                            total: total,
                            serviceCharge: serviceCharge,
                        } as any} />
                    </div>
                )}
                {printType === 'invoice' && (
                    <div className="printable-invoice">
                        <Invoice 
                            order={{
                                ...initialOrder,
                                items: items,
                                subtotal: subtotal,
                                taxes: taxAmount,
                                discount: discountAmount,
                                total: total,
                                serviceCharge: serviceCharge,
                            } as any} 
                            storeName={storeName}
                            customerName={initialOrder.customerName || t('Walk-in Customer')}
                        />
                    </div>
                )}
            </div>
        </>
    )
}