
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
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
import { useStore } from '@/context/StoreContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AddVehicleDialog } from './add-vehicle-dialog';

export function VehicleManager() {
  const { toast } = useToast();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, t } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  const handleOpenDialog = (vehicle: Vehicle | null) => {
    setEditingVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleSaveVehicle = async (vehicleData: Omit<Vehicle, 'id'>) => {
    try {
      await addVehicle(vehicleData);
      toast({ title: t('Vehicle Added'), description: t('The new vehicle has been added.') });
    } catch(error) {
      toast({ title: t('Error'), description: t('Failed to add vehicle.'), variant: 'destructive' });
    }
  };

  const handleUpdateVehicle = async (vehicleId: string, vehicleData: Partial<Omit<Vehicle, 'id'>>) => {
    try {
        await updateVehicle(vehicleId, vehicleData);
        toast({ title: t('Vehicle Updated'), description: t('The vehicle details have been updated.') });
    } catch(error) {
        toast({ title: t('Error'), description: t('Failed to update vehicle.'), variant: 'destructive' });
    }
  };

  const handleOpenDeleteDialog = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    try {
      await deleteVehicle(vehicleToDelete.id);
      toast({ title: t('Vehicle Deleted'), description: t('The vehicle has been deleted.') });
    } catch(error) {
       toast({ title: t('Error'), description: t('Failed to delete vehicle.'), variant: 'destructive' });
    } finally {
      setIsDeleteAlertOpen(false);
      setVehicleToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('Manage Vehicles')}</CardTitle>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('Add Vehicle')}
            </Button>
          </div>
          <CardDescription>
            {t('Add, edit, or delete vehicles for your fleet.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Name')}</TableHead>
                    <TableHead>{t('Type')}</TableHead>
                    <TableHead>{t('License Plate')}</TableHead>
                    <TableHead className="text-right w-[120px]">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!vehicles || vehicles.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                              {t('No vehicles found.')}
                          </TableCell>
                      </TableRow>
                  ) : (
                      (vehicles || []).map(vehicle => (
                      <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.name}</TableCell>
                          <TableCell className="capitalize">{t(vehicle.type)}</TableCell>
                          <TableCell className="font-mono">{vehicle.licensePlate}</TableCell>
                          <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(vehicle)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">{t('Edit')}</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(vehicle)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">{t('Delete')}</span>
                          </Button>
                          </TableCell>
                      </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>

      <AddVehicleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicleToEdit={editingVehicle}
        onSave={handleSaveVehicle}
        onUpdate={handleUpdateVehicle}
      />
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the vehicle "{name}".', { name: vehicleToDelete?.name || '' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
