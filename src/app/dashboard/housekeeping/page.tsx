'use client';

import { useStore } from '@/context/StoreContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Plus, 
    Trash2, 
    Clock, 
    CheckCircle2, 
    Brush, 
    Droplets, 
    Wrench,
    User,
    Info,
    LayoutList,
} from 'lucide-react';
import { useState, useMemo } from 'react';
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
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { HkTask, HkPriority, HkType, HkTaskStatus } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function HousekeepingPage() {
  const { rooms, users, hkTasks, addHkTask, updateHkTaskStatus, deleteHkTask, isLoading, userProfile, t } = useStore();
  const { toast } = useToast();
  const [filter, setFilter] = useState<HkTaskStatus | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [newTask, setNewTask] = useState({
    roomId: '',
    assignedTo: '',
    type: 'Full Clean' as HkType,
    priority: 'Medium' as HkPriority,
    notes: ''
  });

  const isStaff = userProfile?.role === 'staff';
  const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super-admin';

  const stats = useMemo(() => {
    const dirtyRooms = rooms.filter(r => r.hkStatus === 'dirty').length;
    const cleanRooms = rooms.filter(r => r.hkStatus === 'clean').length;
    const inspecting = rooms.filter(r => r.hkStatus === 'inspecting').length;
    const pendingTasks = hkTasks.filter(t => t.status === 'pending').length;
    
    return { dirtyRooms, cleanRooms, inspecting, pendingTasks };
  }, [rooms, hkTasks]);

  const filteredTasks = useMemo(() => {
    let tasks = hkTasks;
    
    // Rule: Staff only see their own work
    if (isStaff) {
        tasks = tasks.filter(t => t.assignedTo === userProfile?.uid);
    }

    return tasks.filter(t => filter === 'all' || t.status === filter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [hkTasks, filter, isStaff, userProfile?.uid]);

  // List of users available for assignment (Staff role)
  const staffUsers = useMemo(() => {
    return (users || []).filter(u => u.role === 'staff' || u.role === 'cashier');
  }, [users]);

  const handleAddTask = () => {
    if (!newTask.roomId) return;
    addHkTask(newTask);
    setIsAddOpen(false);
    setNewTask({ roomId: '', assignedTo: '', type: 'Full Clean', priority: 'Medium', notes: '' });
  };

  if (isLoading) return null;

  const canAccess = userProfile?.role === 'super-admin' || userProfile?.role === 'admin' || userProfile?.role === 'staff' || userProfile?.cashierPermissions?.housekeeping;

  if (!canAccess) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-headline font-bold">{t('Access Denied')}</h1>
        <p className="text-muted-foreground">{t('You do not have permission to view this page.')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isStaff ? 'My Work Queue' : 'Housekeeping'}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm">
            {isStaff 
                ? 'View and update your assigned cleaning and maintenance tasks.' 
                : 'Manage room cleaning schedules and maintenance tasks.'}
          </p>
        </div>
        {isAdmin && (
            <div className="flex gap-2 w-full md:w-auto">
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Button className="gap-2 w-full md:w-auto h-11 md:h-10">
                    <Plus className="h-4 w-4" /> Assign Task
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader className="p-6 pb-0 shrink-0">
                      <DialogTitle>New Housekeeping Task</DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="flex-grow min-h-0">
                      <div className="p-6">
                        <div className="grid gap-4 py-1">
                        <div className="space-y-2">
                            <Label className="text-xs">Select Room</Label>
                            <Select value={newTask.roomId} onValueChange={v => setNewTask({...newTask, roomId: v})}>
                            <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Choose a room" />
                            </SelectTrigger>
                            <SelectContent>
                                {rooms.filter(r => !!r.id).map(r => (
                                <SelectItem key={r.id} value={r.id} className="text-sm">Room {r.id} ({r.hkStatus})</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Assign to Staff</Label>
                            <Select value={newTask.assignedTo} onValueChange={v => setNewTask({...newTask, assignedTo: v})}>
                            <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Select staff user" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="unassigned" className="text-sm">Unassigned</SelectItem>
                                {staffUsers.filter(u => !!u.uid).map(u => (
                                <SelectItem key={u.uid} value={u.uid} className="text-sm">{u.displayName || u.username || u.email}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label className="text-xs">Task Type</Label>
                            <Select value={newTask.type} onValueChange={(v: HkType) => setNewTask({...newTask, type: v})}>
                                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="Full Clean" className="text-sm">Full Clean</SelectItem>
                                <SelectItem value="Turndown" className="text-sm">Turndown</SelectItem>
                                <SelectItem value="Maintenance" className="text-sm">Maintenance</SelectItem>
                                <SelectItem value="Inspection" className="text-sm">Inspection</SelectItem>
                                <SelectItem value="Mini Bar Restock" className="text-sm">Minibar</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                            <div className="space-y-2">
                            <Label className="text-xs">Priority</Label>
                            <Select value={newTask.priority} onValueChange={(v: HkPriority) => setNewTask({...newTask, priority: v})}>
                                <SelectTrigger className="h-10 text-sm"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                <SelectItem value="High" className="text-sm">High</SelectItem>
                                <SelectItem value="Medium" className="text-sm">Medium</SelectItem>
                                <SelectItem value="Low" className="text-sm">Low</SelectItem>
                                </SelectContent>
                            </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Notes</Label>
                            <Input placeholder="e.g. VIP guest arriving at 3 PM" value={newTask.notes} onChange={e => setNewTask({...newTask, notes: e.target.value})} className="h-10 text-sm" />
                        </div>
                        </div>
                      </div>
                    </ScrollArea>
                    <DialogFooter className="p-6 border-t bg-muted/5 shrink-0">
                        <Button onClick={handleAddTask} className="w-full h-12 rounded-xl">Create Task</Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            </div>
        )}
      </div>

      {isAdmin && (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Dirty" value={stats.dirtyRooms} icon={Droplets} color="text-destructive" />
            <StatCard title="Clean" value={stats.cleanRooms} icon={Brush} color="text-green-600" />
            <StatCard title="Inspect" value={stats.inspecting} icon={Info} color="text-amber-600" />
            <StatCard title="Pending" value={stats.pendingTasks} icon={Clock} color="text-primary" />
        </div>
      )}

      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit">
            {['all', 'pending', 'in-progress', 'completed'].map(f => (
            <Button 
                key={f} 
                variant={filter === f ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setFilter(f as any)}
                className="capitalize px-4 h-8 text-[11px] font-bold rounded-lg"
            >
                {f}
            </Button>
            ))}
        </div>
      </ScrollArea>

      <div className="grid gap-4">
        {filteredTasks.map(task => {
          const assignedUser = users.find(u => u.uid === task.assignedTo);
          
          return (
            <Card key={task.id} className="overflow-hidden border-none shadow-sm bg-card">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                      task.type === 'Maintenance' ? 'bg-amber-100 text-amber-600' : 'bg-primary/10 text-primary'
                    )}>
                      {task.type === 'Maintenance' ? <Wrench size={24} /> : <Brush size={24} />}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-black text-lg">Room {task.roomId}</h3>
                        <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest h-4 px-1.5">{task.type}</Badge>
                        <Badge variant={
                          task.status === 'completed' ? 'success' : 
                          task.status === 'in-progress' ? 'default' : 'outline'
                        } className="text-[9px] font-black h-4 px-1.5">
                          {task.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <User size={12} className="shrink-0" /> {assignedUser?.displayName || assignedUser?.username || assignedUser?.email || 'Unassigned'}
                      </p>
                      {task.notes && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground italic bg-muted/40 p-2 rounded-lg border-l-2 border-primary/20 leading-relaxed">
                          "{task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 md:gap-2 pt-2 md:pt-0 border-t md:border-none">
                    <div className="flex flex-col md:items-end">
                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">Status</p>
                      <Badge variant={
                        task.status === 'completed' ? 'success' : 
                        task.status === 'in-progress' ? 'default' : 'outline'
                      } className="capitalize text-[10px] h-5 rounded-full">
                        {task.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button size="sm" variant="outline" className="h-9 gap-1.5 font-bold text-xs rounded-full px-4" onClick={() => updateHkTaskStatus(task.id, 'in-progress')}>
                          <Clock size={14} /> Start
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button size="sm" variant="outline" className="h-9 gap-1.5 font-bold text-xs rounded-full px-4 border-green-200 text-green-700 hover:bg-green-50" onClick={() => updateHkTaskStatus(task.id, 'completed')}>
                          <CheckCircle2 size={14} /> Finish
                        </Button>
                      )}
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => deleteHkTask(task.id)}>
                            <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredTasks.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/5">
            <LayoutList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-black text-lg uppercase tracking-tight">
                {isStaff ? 'Queue is clear!' : 'No tasks found'}
            </h3>
            <p className="text-muted-foreground text-xs sm:text-sm">
                {isStaff ? 'Great job! Check back later for new assignments.' : 'Everything seems to be in order!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
        <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{title}</CardTitle>
        <Icon className={cn("h-3.5 w-3.5", color)} />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 pt-0">
        <div className="text-xl sm:text-2xl font-black">{value}</div>
      </CardContent>
    </Card>
  );
}
