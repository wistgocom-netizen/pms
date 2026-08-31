'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, Trash2, Edit, Tag, Clock, FileText, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Note } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const CATEGORIES = ['General', 'Guest Request', 'Maintenance', 'Billing', 'Staff', 'Urgent'];
const COLORS = [
    { name: 'Default', value: 'bg-card' },
    { name: 'Blue', value: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: 'Yellow', value: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { name: 'Green', value: 'bg-green-50 dark:bg-green-900/20' },
    { name: 'Red', value: 'bg-red-50 dark:bg-red-900/20' },
    { name: 'Purple', value: 'bg-purple-50 dark:bg-purple-900/20' },
];

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, t, isLoading } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsFormOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'General',
    color: 'bg-card'
  });

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, searchTerm]);

  const handleAddOrEditNote = () => {
    if (editingNoteId) {
        updateNote(editingNoteId, newNote);
    } else {
        addNote(newNote);
    }
    setIsFormOpen(false);
    setEditingNoteId(null);
    setNewNote({ title: '', content: '', category: 'General', color: 'bg-card' });
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setNewNote({
        title: note.title,
        content: note.content,
        category: note.category,
        color: note.color || 'bg-card'
    });
    setIsFormOpen(true);
  };

  if (isLoading) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Staff Notes</h1>
          <p className="text-muted-foreground text-xs md:text-sm">Internal coordination and reminders for the property team.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) {
                setEditingNoteId(null);
                setNewNote({ title: '', content: '', category: 'General', color: 'bg-card' });
            }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 md:h-10 w-full md:w-auto rounded-xl md:rounded-md">
              <Plus className="h-4 w-4" /> New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader className="p-6 pb-0 shrink-0">
              <DialogTitle>{editingNoteId ? 'Edit Note' : 'Create New Note'}</DialogTitle>
            </DialogHeader>
            <ScrollArea className="flex-grow min-h-0">
              <div className="p-6">
                <div className="grid gap-6 py-1">
                  <div className="space-y-2">
                    <Label className="text-xs">Title</Label>
                    <Input 
                        placeholder="Brief summary" 
                        value={newNote.title} 
                        onChange={e => setNewNote({...newNote, title: e.target.value})} 
                        className="h-10 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Category</Label>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <Badge 
                                key={cat} 
                                variant={newNote.category === cat ? 'default' : 'outline'}
                                className="cursor-pointer h-7 px-3 text-[10px] font-black uppercase tracking-widest rounded-full"
                                onClick={() => setNewNote({...newNote, category: cat})}
                            >
                                {cat}
                            </Badge>
                        ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Content</Label>
                    <Textarea 
                        placeholder="Details of the note or request..." 
                        className="min-h-[150px] text-sm leading-relaxed"
                        value={newNote.content}
                        onChange={e => setNewNote({...newNote, content: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 pb-4">
                    <Label className="text-xs">Card Color</Label>
                    <div className="flex flex-wrap gap-3 p-1">
                        {COLORS.map(color => (
                            <button
                                key={color.name}
                                type="button"
                                className={cn(
                                    "h-9 w-9 rounded-full border-2 transition-all shadow-sm",
                                    color.value,
                                    newNote.color === color.value ? "border-primary scale-110" : "border-transparent"
                                )}
                                onClick={() => setNewNote({...newNote, color: color.value})}
                                title={color.name}
                            />
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 border-t bg-muted/5 shrink-0">
              <Button onClick={handleAddOrEditNote} className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/10">
                {editingNoteId ? 'Update Note' : 'Create Note'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative px-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
            placeholder="Search notes or categories..." 
            className="pl-10 h-11 bg-muted/30 border-none rounded-2xl text-sm" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
            <Button variant="ghost" size="icon" className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full" onClick={() => setSearchTerm('')}>
                <X className="h-3 w-3" />
            </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNotes.map(note => (
          <Card key={note.id} className={cn("flex flex-col group transition-all hover:shadow-lg rounded-2xl border-none shadow-sm", note.color)}>
            <CardHeader className="pb-2 p-5">
              <div className="flex justify-between items-start">
                <Badge variant="outline" className="text-[8px] sm:text-[9px] uppercase font-black tracking-widest mb-2 px-1.5 h-4 border-muted-foreground/20">
                    {note.category}
                </Badge>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => handleOpenEdit(note)}>
                        <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-full">
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this note?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteNote(note.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                </div>
              </div>
              <CardTitle className="text-base sm:text-lg font-black leading-tight truncate">{note.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-5 pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed line-clamp-6">
                {note.content}
              </p>
            </CardContent>
            <CardFooter className="pt-0 pb-4 p-5 flex items-center justify-between text-[9px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                </div>
            </CardFooter>
          </Card>
        ))}
        {filteredNotes.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5 mx-1">
                <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-black text-lg uppercase tracking-tight">No notes found</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">Create a new note to start coordinating with your team.</p>
            </div>
        )}
      </div>
    </div>
  );
}
