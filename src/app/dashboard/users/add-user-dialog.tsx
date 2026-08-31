
'use client';

import { useEffect, useState } from 'react';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useStore } from '@/context/StoreContext';
import type { UserProfile, CashierPermissions, Organization } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const userObjectSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'cashier', 'staff']),
  organizationId: z.string().optional(),
  cashierPermissions: z.any().optional(),
  email: z.string().email('Invalid email address'),
  employeeId: z.string().optional(),
});

const editUserSchema = userObjectSchema;

const createUserSchema = userObjectSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const permissionKeys: (keyof CashierPermissions)[] = [
    'dashboard', 'rooms', 'bookings', 'ordering', 'orderBoard', 'orders', 
    'housekeeping', 'guests', 'employees', 'users', 'departments', 
    'products', 'expenses', 'notes', 'reports', 'control', 
    'stores', 'subscription', 'settings'
];

const adminDefaultPermissions: CashierPermissions = {
    dashboard: true, rooms: true, bookings: true, ordering: true, orderBoard: true,
    orders: true, housekeeping: true, guests: true, employees: true, users: true,
    departments: true, products: true, expenses: true, notes: true, reports: true,
    control: true, stores: true, subscription: true, settings: true,
};

const staffDefaultPermissions: CashierPermissions = {
    dashboard: true, rooms: false, bookings: false, ordering: false, orderBoard: false,
    orders: false, housekeeping: true, guests: false, employees: false, users: false,
    departments: false, products: false, expenses: false, notes: true, reports: false,
    control: false, stores: false, subscription: false, settings: false,
};

const cashierDefaultPermissions: CashierPermissions = {
    dashboard: true, rooms: false, bookings: true, ordering: true, orderBoard: true,
    orders: true, housekeeping: false, guests: true, employees: false, users: false,
    departments: false, products: false, expenses: false, notes: false, reports: false,
    control: false, stores: false, subscription: false, settings: false,
};


interface AddUserDialogProps {
  onSave: (data: any) => Promise<void>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserRole?: UserProfile['role'];
  userToEdit?: UserProfile | null;
}

export function AddUserDialog({ open, onOpenChange, onSave, currentUserRole, userToEdit }: AddUserDialogProps) {
  const { t, employees, organizations } = useStore();
  const defaultRole = currentUserRole === 'super-admin' ? 'admin' : 'staff';
  const isEditMode = !!userToEdit;

  const form = useForm({
    resolver: zodResolver(isEditMode ? editUserSchema : createUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: defaultRole,
      employeeId: 'none',
      organizationId: (currentUserRole === 'admin' && organizations && organizations.length === 1) ? organizations[0].id : '',
      cashierPermissions: staffDefaultPermissions,
    }
  });

  const role = form.watch('role');
  
  useEffect(() => {
    if (open) {
      if (isEditMode && userToEdit) {
        const [firstName, ...lastNameParts] = userToEdit.displayName?.split(' ') || ['',''];
        form.reset({
          firstName: firstName,
          lastName: lastNameParts.join(' '),
          email: userToEdit.email || '',
          password: '',
          role: userToEdit.role as any,
          employeeId: 'none',
          organizationId: userToEdit.organizationId || '',
          cashierPermissions: userToEdit.cashierPermissions || (userToEdit.role === 'admin' ? adminDefaultPermissions : staffDefaultPermissions),
        });
      } else {
        const initialPermissions = defaultRole === 'admin' ? adminDefaultPermissions : staffDefaultPermissions;
        form.reset({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          role: defaultRole,
          employeeId: 'none',
          organizationId: (currentUserRole === 'admin' && organizations && organizations.length === 1) ? organizations[0].id : '',
          cashierPermissions: initialPermissions
        });
      }
    }
  }, [open, form, defaultRole, currentUserRole, organizations, isEditMode, userToEdit]);

  function onSubmit(values: any) {
    onSave(values);
  }

  const handleRoleChange = (newRole: 'admin' | 'cashier' | 'staff') => {
      form.setValue('role', newRole);
      if (newRole === 'admin') {
          form.setValue('cashierPermissions', adminDefaultPermissions);
      } else if (newRole === 'staff') {
          form.setValue('cashierPermissions', staffDefaultPermissions);
      } else {
          form.setValue('cashierPermissions', cashierDefaultPermissions);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('Edit User') : t('Create New User')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t("Update the user's details.") : t("Link a staff member and set their login credentials.")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <ScrollArea className="h-[65vh] pr-4">
              <div className="space-y-4 px-1">
                {!isEditMode && (
                    <FormField control={form.control} name="employeeId" render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-bold text-primary">{t('Select Staff Member (Optional)')}</FormLabel>
                            <Select 
                                onValueChange={(val) => {
                                    field.onChange(val);
                                    if (val !== 'none') {
                                        const emp = employees.find(e => e.id === val);
                                        if (emp) {
                                            const parts = emp.name.split(' ');
                                            form.setValue('firstName', parts[0] || '');
                                            form.setValue('lastName', parts.slice(1).join(' ') || '');
                                            if (emp.role.toLowerCase().includes('admin') || emp.role.toLowerCase().includes('manager')) {
                                                handleRoleChange('admin');
                                            } else if (emp.role.toLowerCase().includes('cashier')) {
                                                handleRoleChange('cashier');
                                            } else {
                                                handleRoleChange('staff');
                                            }
                                        }
                                    }
                                }} 
                                value={field.value}
                            >
                                <FormControl><SelectTrigger><SelectValue placeholder={t("Select staff to link login")} /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="none">{t('Manual Entry (Not linked to staff)')}</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={emp.id}>{emp.name} — {emp.role}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('First Name')}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Last Name')}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Email Address (Login ID)')}</FormLabel>
                      <FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEditMode && (
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('Password')}</FormLabel>
                          <FormControl><Input type="password" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                )}

                <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('Role')}</FormLabel>
                      <Select onValueChange={handleRoleChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("Select a role")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currentUserRole === 'super-admin' && <SelectItem value="admin">{t('Admin')}</SelectItem>}
                          <SelectItem value="cashier">{t('Cashier')}</SelectItem>
                          <SelectItem value="staff">{t('Housekeeping Staff')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {(currentUserRole === 'super-admin' && (role === 'cashier' || role === 'admin' || role === 'staff')) && (
                  <FormField
                    control={form.control}
                    name="organizationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('Property')}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''} >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('Select a property')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(organizations || []).map(org => (
                              <SelectItem key={org.id} value={org.id}>
                                {org.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(role === 'cashier' || role === 'staff' || (role === 'admin' && currentUserRole === 'super-admin')) && (
                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-md font-medium">{t('Permissions')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {permissionKeys.map(key => (
                              <FormField
                                    key={key}
                                    control={form.control}
                                    name={`cashierPermissions.${key}`}
                                    render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <FormLabel className="text-xs">{t(key.charAt(0).toUpperCase() + key.slice(1))}</FormLabel>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
              <Button type="submit">{isEditMode ? t('Save Changes') : t('Create User')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
