
'use client';

import { useState } from 'react';
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
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import type { Category } from '@/lib/types';
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

interface CategoryManagerProps {
  categories: Category[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const { toast } = useToast();
  const { addCategory, updateCategory, deleteCategory, isLoadingCategories, t } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryEmoji, setCategoryEmoji] = useState('');
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const handleOpenDialog = (category: Category | null) => {
    setEditingCategory(category);
    setCategoryName(category ? category.name : '');
    setCategoryEmoji(category && category.emoji ? category.emoji : '');
    setDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!categoryName.trim()) {
      toast({
        title: t('Error'),
        description: t('Category name cannot be empty.'),
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryName, emoji: categoryEmoji });
        toast({ title: t('Category Updated'), description: t('Category "{name}" has been updated.', { name: categoryName }) });
      } else {
        const newCategory: Omit<Category, 'id'> = {
          name: categoryName,
          emoji: categoryEmoji,
        };
        await addCategory(newCategory);
        toast({ title: t('Category Added'), description: t('Category "{name}" has been added.', { name: categoryName }) });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error("Failed to save category:", error);
      toast({
        variant: 'destructive',
        title: t('Save Failed'),
        description: error instanceof Error ? error.message : t("An unknown error occurred while saving the category."),
      });
    }
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteAlertOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      toast({ title: t('Category Deleted'), description: t('The category "{name}" has been deleted.', { name: categoryToDelete.name }) });
    } catch(error) {
       toast({ title: t('Error'), description: t('Failed to delete category.') });
    } finally {
      setIsDeleteAlertOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('Manage Categories')}</CardTitle>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('Add Category')}
            </Button>
          </div>
          <CardDescription>
            {t('Add, edit, or delete product categories.')}
          </CardDescription>
        </CardHeader>
        <CardContent>
           {isLoadingCategories ? (
             <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
             </div>
           ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('Category Name')}</TableHead>
                    <TableHead className="text-right w-[120px]">{t('Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                      <TableRow>
                          <TableCell colSpan={2} className="h-24 text-center">
                              {t('No categories found.')}
                          </TableCell>
                      </TableRow>
                  ) : (
                      categories.map(category => (
                      <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.emoji} {category.name}</TableCell>
                          <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(category)}>
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">{t('Edit')}</span>
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleOpenDeleteDialog(category)}>
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
           )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? t('Edit Category') : t('Add New Category')}</DialogTitle>
            <DialogDescription>
              {editingCategory ? t('Change the details of the category.') : t('Enter the details for the new category.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('Name')}
              </Label>
              <Input
                id="name"
                value={categoryName}
                onChange={e => setCategoryName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emoji" className="text-right">
                {t('Emoji')}
              </Label>
              <Input
                id="emoji"
                value={categoryEmoji}
                onChange={e => setCategoryEmoji(e.target.value)}
                className="col-span-3"
                placeholder="e.g. ☕️"
                onKeyDown={(e) => e.key === 'Enter' && handleSaveChanges()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('Cancel')}</Button>
            <Button onClick={handleSaveChanges}>{t('Save Changes')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you absolutely sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('This action cannot be undone. This will permanently delete the category "{name}".', { name: categoryToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory} className="bg-destructive hover:bg-destructive/90">{t('Delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
