
'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useStore } from '@/context/StoreContext';
import type { UserProfile, CashierPermissions } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const permissionKeys: (keyof CashierPermissions)[] = [
    'dashboard', 'rooms', 'bookings', 'ordering', 'orderBoard', 'orders', 
    'housekeeping', 'guests', 'employees', 'users', 'departments', 
    'products', 'expenses', 'notes', 'reports', 'control', 
    'stores', 'subscription', 'settings'
];

interface UserPermissionsDialogProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (userId: string, permissions: CashierPermissions) => void;
  currentUserRole?: UserProfile['role'];
}

export function UserPermissionsDialog({
  user,
  open,
  onOpenChange,
  onSave,
  currentUserRole,
}: UserPermissionsDialogProps) {
  const { t } = useStore();
  const [permissions, setPermissions] = useState<CashierPermissions>({});

  useEffect(() => {
    if (user) {
      setPermissions(user.cashierPermissions || {});
    }
  }, [user]);

  if (!user) return null;

  const handleToggle = (permission: keyof CashierPermissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission],
    }));
  };
  
  const handleSave = () => {
    onSave(user.uid, permissions);
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('Edit Permissions for')} {user.displayName}</DialogTitle>
          <DialogDescription>
            {t('Control which modules this user can access.')}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 py-4 pr-6">
                {permissionKeys.map((key) => (
                    <div key={key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <Label htmlFor={`perm-${key}`} className="capitalize">{t(key)}</Label>
                        <Switch
                            id={`perm-${key}`}
                            checked={!!permissions[key]}
                            onCheckedChange={() => handleToggle(key)}
                        />
                    </div>
                ))}
            </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('Cancel')}</Button>
          <Button onClick={handleSave}>{t('Save Permissions')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
