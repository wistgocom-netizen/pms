
'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Layers, Users } from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function DepartmentsPage() {
  const { departments, addDepartment, updateDepartment, deleteDepartment, employees, isLoading } = useStore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsFormOpen] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [newDept, setNewDept] = useState({ name: '', description: '' });

  const handleAddOrEditDept = () => {
    if (!newDept.name.trim()) return;

    if (editingDeptId) {
        updateDepartment(editingDeptId, newDept);
        toast({ title: "Department Updated" });
    } else {
        addDepartment(newDept);
        toast({ title: "Department Created" });
    }
    
    setIsFormOpen(false);
    setEditingDeptId(null);
    setNewDept({ name: '', description: '' });
  };

  const handleOpenEdit = (dept: any) => {
    setEditingDeptId(dept.id);
    setNewDept({ name: dept.name, description: dept.description || '' });
    setIsFormOpen(true);
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground text-sm">Organize your staff and operations into functional areas.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
                setEditingDeptId(null);
                setNewDept({ name: '', description: '' });
            }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDeptId ? 'Edit Department' : 'New Department'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Department Name</Label>
                <Input 
                    placeholder="e.g. Front Office" 
                    value={newDept.name} 
                    onChange={e => setNewDept({...newDept, name: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                    placeholder="Briefly describe department responsibilities..." 
                    value={newDept.description} 
                    onChange={e => setNewDept({...newDept, description: e.target.value})} 
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddOrEditDept} className="w-full">
                {editingDeptId ? 'Update Department' : 'Create Department'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const deptStaffCount = employees.filter(e => e.department === dept.name).length;
          
          return (
            <Card key={dept.id} className="relative overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Layers size={24} />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(dept)}>
                        <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Department?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the "{dept.name}" department? This will not delete staff, but they will be left without a department.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteDepartment(dept.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardTitle className="mt-4">{dept.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                    {dept.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users size={16} />
                    {deptStaffCount} Staff Members
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
