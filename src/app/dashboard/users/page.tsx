
'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getUsersColumns } from './columns';
import { DataTable } from '../components/data-table';
import { useMemo, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { AddUserDialog } from './add-user-dialog';
import { UserPermissionsDialog } from './user-permissions-dialog';
import { Button } from '@/components/ui/button';
import { UserPlus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile, CashierPermissions } from '@/lib/types';

export default function UsersPage() {
  const { users, userProfile, t, formatCurrency, createUser, updateUserRole, updateUserPermissions, isLoading } = useStore();
  const { toast } = useToast();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const handleCreateUser = useCallback(async (data: any) => {
    const result = await createUser(data);
    if (result.success) {
        toast({ title: t("User Created"), description: t("The new login account has been successfully created.") });
        setIsAddOpen(false);
    } else {
        toast({ variant: "destructive", title: t("Creation Failed"), description: result.error?.message || t("Error creating user.") });
    }
  }, [createUser, t, toast]);

  const handleEditPermissions = useCallback((user: UserProfile) => {
    setSelectedUser(user);
    setIsPermissionsOpen(true);
  }, []);

  const handleSavePermissions = useCallback(async (userId: string, permissions: CashierPermissions) => {
    await updateUserPermissions(userId, permissions);
    toast({ title: t("Permissions Updated"), description: t("The user's access levels have been updated.") });
    setIsPermissionsOpen(false);
  }, [updateUserPermissions, t, toast]);

  const columns = useMemo(() => {
    return getUsersColumns(
        t, 
        userProfile, 
        (u) => { setSelectedUser(u); setIsAddOpen(true); }, 
        handleEditPermissions, 
        [], // Empty sales for now
        formatCurrency, 
        (u) => { toast({ title: "Delete Requested", description: "This functionality is coming soon." }) }
    );
  }, [t, userProfile, formatCurrency, handleEditPermissions, toast]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-48" />
        <Card>
          <CardHeader><Skeleton className="h-8 w-32" /></CardHeader>
          <CardContent><Skeleton className="h-40 w-full" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Logins</h1>
          <p className="text-muted-foreground text-sm">Manage authentication credentials and access permissions for your team.</p>
        </div>
        <Button className="gap-2" onClick={() => setIsAddOpen(true)}>
          <UserPlus className="h-4 w-4" /> Create Login
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Accounts</CardTitle>
          <CardDescription>A list of all users with active system access.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={users || []} 
            columnFilters={[]} 
            onColumnFiltersChange={() => {}} 
          />
        </CardContent>
      </Card>

      <AddUserDialog 
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSave={handleCreateUser}
        currentUserRole={userProfile?.role}
        userToEdit={selectedUser}
      />

      <UserPermissionsDialog 
        open={isPermissionsOpen}
        onOpenChange={setIsPermissionsOpen}
        user={selectedUser}
        onSave={handleSavePermissions}
      />
    </div>
  );
}
