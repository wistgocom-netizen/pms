
'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '../components/data-table';
import { getColumns } from './columns';
import type { Cheque, ChequeStatus } from '@/lib/types';
import { PlusCircle, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { AddChequeDialog } from './add-cheque-dialog';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BankManager } from './bank-manager';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIsMobile } from '@/hooks/use-mobile';


const initialFilterState = {
    invoiceNo: '',
    chequeNo: '',
    issueDateFrom: undefined as Date | undefined,
    issueDateTo: undefined as Date | undefined,
    clearDateFrom: undefined as Date | undefined,
    clearDateTo: undefined as Date | undefined,
    durationMin: '',
    durationMax: '',
    status: 'Any' as 'Any' | ChequeStatus,
    bank: 'Any' as 'Any' | string,
};

export default function PaymentsPage() {
    const { t, formatCurrency, cheques, banks, updateCheque, deleteCheque, addCheque, isLoadingCheques, userProfile, sales, customers } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const { toast } = useToast();
    const [filterInputs, setFilterInputs] = useState(initialFilterState);
    const [appliedFilters, setAppliedFilters] = useState(initialFilterState);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const isMobile = useIsMobile();

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            setIsFilterOpen(true);
        } else {
            setIsFilterOpen(false);
        }
    }, [isMobile]);

    const filteredCheques = useMemo(() => {
        if (!cheques) return [];

        return cheques.filter(cheque => {
            const {
                invoiceNo,
                chequeNo,
                issueDateFrom,
                issueDateTo,
                clearDateFrom,
                clearDateTo,
                durationMin,
                durationMax,
                status,
                bank,
            } = appliedFilters;

            const issueDate = cheque.chequeIssueDate ? new Date(cheque.chequeIssueDate + 'T00:00:00') : null;
            const clearDate = cheque.chequeClearDate ? new Date(cheque.chequeClearDate + 'T00:00:00') : null;

            if (invoiceNo && !cheque.invoiceNo.toLowerCase().includes(invoiceNo.toLowerCase())) return false;
            if (chequeNo && !cheque.chequeNo.toLowerCase().includes(chequeNo.toLowerCase())) return false;
            
            if (issueDateFrom && (!issueDate || issueDate < issueDateFrom)) return false;
            if (issueDateTo && (!issueDate || issueDate > issueDateTo)) return false;
            
            if (clearDateFrom && (!clearDate || clearDate < clearDateFrom)) return false;
            if (clearDateTo && (!clearDate || clearDate > clearDateTo)) return false;
            
            const min = parseInt(durationMin, 10);
            if (!isNaN(min) && (cheque.duration === undefined || cheque.duration < min)) return false;
            
            const max = parseInt(durationMax, 10);
            if (!isNaN(max) && (cheque.duration === undefined || cheque.duration > max)) return false;

            if (status !== 'Any' && cheque.status !== status) return false;
            if (bank !== 'Any' && cheque.bank !== bank) return false;

            return true;
        }).sort((a, b) => b.date.getTime() - a.date.getTime());
    }, [cheques, appliedFilters]);

    const updateChequeStatus = useCallback(async (chequeId: string, status: ChequeStatus) => {
        await updateCheque(chequeId, { status });
        toast({
            title: t("Status Updated"),
            description: t("Cheque status has been updated."),
        });
    }, [updateCheque, toast, t]);
    
    const handleAddCheque = useCallback(async (chequeData: Omit<Cheque, 'id'>) => {
        await addCheque(chequeData);
        toast({
            title: t("Cheque Added"),
            description: t("The new cheque has been successfully recorded."),
        });
        setIsAddDialogOpen(false);
    }, [addCheque, toast, t]);

    const handleDeleteCheque = useCallback(async (chequeId: string) => {
        await deleteCheque(chequeId);
        toast({
            title: t("Cheque Deleted"),
            description: t("The cheque has been successfully deleted."),
        });
    }, [deleteCheque, toast, t]);

    const columns = useMemo(() => getColumns(formatCurrency, updateChequeStatus, handleDeleteCheque, t, isClient, customers, sales), [formatCurrency, updateChequeStatus, handleDeleteCheque, t, isClient, customers, sales]);
    
    const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.cashierPermissions?.payments;

    if (!canAccess) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-headline font-bold">{t('Access Denied')}</h1>
                <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
            </div>
        );
    }
    
    const handleFilterChange = (filterName: keyof typeof initialFilterState, value: any) => {
        setFilterInputs(prev => ({ ...prev, [filterName]: value }));
    };

    const handleLoadRecords = () => {
        setAppliedFilters(filterInputs);
    };

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-headline font-bold">{t('Payments')}</h1>
                    <p className="text-muted-foreground">{t('Manage your cheque payments and banks.')}</p>
                </div>
                <Tabs defaultValue="cheques">
                    <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                        <TabsTrigger value="cheques">{t('Cheques')}</TabsTrigger>
                        <TabsTrigger value="banks">{t('Banks')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="cheques">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>{t('Cheque Details')}</CardTitle>
                                    <Button onClick={() => setIsAddDialogOpen(true)}>
                                        <PlusCircle className="mr-2 h-4 w-4" />
                                        {t('Add Cheque')}
                                    </Button>
                                </div>
                                <CardDescription>{t('All recorded cheque payments.')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                    <Card className="mb-6">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle>{t('Filter Options')}</CardTitle>
                                            <CollapsibleTrigger asChild>
                                                <Button variant="ghost" size="sm" className="md:hidden">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    {isFilterOpen ? t('Hide') : t('Show')}
                                                </Button>
                                            </CollapsibleTrigger>
                                        </CardHeader>
                                        <CollapsibleContent>
                                            <CardContent className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-invoiceNo">{t('Invoice No')}</Label>
                                                        <Input id="filter-invoiceNo" value={filterInputs.invoiceNo} onChange={e => handleFilterChange('invoiceNo', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-issueDateFrom">{t('Issue Date')} From</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button id="filter-issueDateFrom" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filterInputs.issueDateFrom && "text-muted-foreground")}>
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {filterInputs.issueDateFrom ? format(filterInputs.issueDateFrom, "PPP") : <span>Pick a date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar mode="single" selected={filterInputs.issueDateFrom} onSelect={date => handleFilterChange('issueDateFrom', date)} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-issueDateTo">To</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button id="filter-issueDateTo" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filterInputs.issueDateTo && "text-muted-foreground")}>
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {filterInputs.issueDateTo ? format(filterInputs.issueDateTo, "PPP") : <span>Pick a date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar mode="single" selected={filterInputs.issueDateTo} onSelect={date => handleFilterChange('issueDateTo', date)} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-chequeNo">{t('Cheque No')}</Label>
                                                        <Input id="filter-chequeNo" value={filterInputs.chequeNo} onChange={e => handleFilterChange('chequeNo', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-clearDateFrom">{t('Clear Date')} From</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button id="filter-clearDateFrom" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filterInputs.clearDateFrom && "text-muted-foreground")}>
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {filterInputs.clearDateFrom ? format(filterInputs.clearDateFrom, "PPP") : <span>Pick a date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar mode="single" selected={filterInputs.clearDateFrom} onSelect={date => handleFilterChange('clearDateFrom', date)} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-clearDateTo">To</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button id="filter-clearDateTo" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filterInputs.clearDateTo && "text-muted-foreground")}>
                                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                                    {filterInputs.clearDateTo ? format(filterInputs.clearDateTo, "PPP") : <span>Pick a date</span>}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0">
                                                                <Calendar mode="single" selected={filterInputs.clearDateTo} onSelect={date => handleFilterChange('clearDateTo', date)} initialFocus />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>{t('Duration')}</Label>
                                                        <div className="flex items-center gap-2">
                                                            <Input placeholder={t('Min')} type="number" value={filterInputs.durationMin} onChange={e => handleFilterChange('durationMin', e.target.value)} />
                                                            <Input placeholder={t('Max')} type="number" value={filterInputs.durationMax} onChange={e => handleFilterChange('durationMax', e.target.value)} />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-status">{t('Cheque Status')}</Label>
                                                        <Select value={filterInputs.status} onValueChange={value => handleFilterChange('status', value)}>
                                                            <SelectTrigger id="filter-status">
                                                                <SelectValue placeholder={t('Select status')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Any">{t('Any')}</SelectItem>
                                                                <SelectItem value="Pending">{t('Pending')}</SelectItem>
                                                                <SelectItem value="Success">{t('Success')}</SelectItem>
                                                                <SelectItem value="Returned">{t('Returned')}</SelectItem>
                                                                <SelectItem value="Cleared">{t('Cleared')}</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="filter-bank">{t('Bank')}</Label>
                                                        <Select value={filterInputs.bank} onValueChange={value => handleFilterChange('bank', value)}>
                                                            <SelectTrigger id="filter-bank">
                                                                <SelectValue placeholder={t('Select bank')} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="Any">{t('Any')}</SelectItem>
                                                                {(banks || []).map(bank => (
                                                                    <SelectItem key={bank.id} value={bank.name}>
                                                                        {bank.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2 self-end">
                                                        <Button onClick={handleLoadRecords} className="w-full">{t('Load Records')}</Button>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{t('From date or To date for specific date. From date and To date: show all records with in rage(recommended).')}</p>
                                            </CardContent>
                                        </CollapsibleContent>
                                    </Card>
                                </Collapsible>
                                <DataTable
                                    columns={columns}
                                    data={filteredCheques}
                                    columnFilters={[]}
                                    onColumnFiltersChange={() => {}}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="banks">
                        <BankManager />
                    </TabsContent>
                </Tabs>
            </div>
            <AddChequeDialog 
                open={isAddDialogOpen}
                onOpenChange={setIsAddDialogOpen}
                onSave={handleAddCheque}
            />
        </>
    );
}
