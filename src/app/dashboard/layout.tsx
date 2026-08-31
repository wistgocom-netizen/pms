'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bed,
  CalendarCheck,
  Users,
  UserCheck,
  LogOut,
  Hotel,
  Settings,
  CreditCard,
  Shield,
  Building,
  FileText,
  Receipt,
  Brush,
  Layers,
  KeyRound,
  Package,
  BarChart2,
  ShoppingCart,
  LayoutList,
  ChefHat,
  Truck,
  Calendar,
  Bell,
  TrendingUp,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStore } from '@/context/StoreContext';
import type { AppNotification } from '@/lib/types';
import { useNewOrderNotifications } from '@/hooks/use-new-order-notification';
import { useNotifications } from '@/hooks/use-notifications';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userProfile, signOut, notifications, markNotificationRead } = useStore();
  const { newOrderCount, recentOrders, markOrdersAsSeen } = useNewOrderNotifications();
  const { notificationCount } = useNotifications();
  const [mounted, setMounted] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const role = userProfile?.role;
  const perms = userProfile?.cashierPermissions;
  const isAdmin = role === 'admin' || role === 'super-admin';

  const canAccess = (permKey: string): boolean => {
    if (role === 'super-admin') return true;
    if (role === 'admin') return permKey !== 'control' && permKey !== 'stores';
    if (role === 'cashier' || role === 'staff') {
      return perms?.[permKey as keyof typeof perms] === true;
    }
    return true;
  };

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Overview', perm: 'dashboard' },
    { href: '/dashboard/rooms', icon: Bed, label: 'Rooms', perm: 'rooms' },
    { href: '/dashboard/rooms/dynamic-pricing', icon: TrendingUp, label: 'Dynamic Pricing', perm: 'rooms' },
    { href: '/dashboard/bookings', icon: CalendarCheck, label: 'Bookings', perm: 'bookings' },
    { href: '/dashboard/checkout', icon: ShoppingCart, label: 'POS', perm: 'ordering' },
    { href: '/dashboard/orders-by-table', icon: LayoutList, label: 'Order Board', perm: 'orderBoard' },
    { href: '/dashboard/new-orders', icon: FileText, label: 'New Orders', perm: 'orders' },
    { href: '/dashboard/housekeeping', icon: Brush, label: 'Housekeeping', perm: 'housekeeping' },
    { href: '/dashboard/guests', icon: Users, label: 'Guests', perm: 'guests' },
    { href: '/dashboard/employees', icon: UserCheck, label: 'Staff Profiles', perm: 'employees' },
    { href: '/dashboard/users', icon: KeyRound, label: 'Staff Logins', perm: 'users' },
    { href: '/dashboard/departments', icon: Layers, label: 'Departments', perm: 'departments' },
    { href: '/dashboard/products', icon: Package, label: 'Products', perm: 'products' },
    { href: '/dashboard/expenses', icon: Receipt, label: 'Expenses', perm: 'expenses' },
    { href: '/dashboard/notes', icon: FileText, label: 'Notes', perm: 'notes' },
    { href: '/dashboard/completed-history', icon: Receipt, label: 'Completed', perm: 'bookings' },
    { href: '/dashboard/reports', icon: BarChart2, label: 'Reports', perm: 'reports' },
    { href: '/dashboard/reports/profit-loss', icon: TrendingUp, label: 'Profit & Loss', perm: 'reports' },
    { href: '/dashboard/control', icon: Shield, label: 'Master Control', perm: 'control' },
    { href: '/dashboard/stores', icon: Building, label: 'Properties', perm: 'stores' },
    { href: '/dashboard/subscription', icon: CreditCard, label: 'Subscription', perm: 'subscription' },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', perm: 'settings' },
  ].filter(item => canAccess(item.perm));

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="h-16 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg text-primary-foreground">
                <Hotel className="h-5 w-5" />
            </div>
            <h1 className="font-bold text-lg group-data-[collapsible=icon]:hidden font-brand">Adyfire (PMS)</h1>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.label}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{userProfile?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="text-sm font-medium truncate">{userProfile?.displayName}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{userProfile?.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="group-data-[collapsible=icon]:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center border-b px-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <div className="ml-4 h-4 w-px bg-border" />
          <div className="ml-4 font-medium flex-1">Dashboard</div>
          <div className="relative">
            {mounted ? (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" title="Notifications">
                    <Bell className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                {(newOrderCount + notificationCount) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white pointer-events-none">
                    {(newOrderCount + notificationCount) > 99 ? '99+' : newOrderCount + notificationCount}
                  </Badge>
                )}
              <PopoverContent align="end" className="w-80 p-0">
                <div className="max-h-80 overflow-y-auto">
                  {/* Task Notifications */}
                  <div>
                    <div className="p-3 font-semibold text-sm border-b bg-muted/20">
                      Task Notifications
                      {notificationCount > 0 && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                          ({notificationCount} new)
                        </span>
                      )}
                    </div>
                    {notifications && userProfile ? (
                      (() => {
                        const myNotifs = notifications
                          .filter(n => isAdmin || n.userId === userProfile.uid)
                          .filter(n => !n.read)
                          .slice(0, 5);
                        const getNotifHref = (n: AppNotification) => {
                          if (n.type === 'task_assigned' || n.type === 'task_started' || n.type === 'task_completed') return '/dashboard/housekeeping';
                          return '#';
                        };
                        return myNotifs.length > 0 ? (
                          myNotifs.map(n => (
                            <Link
                              key={n.id}
                              href={getNotifHref(n)}
                              onClick={() => { markNotificationRead(n.id); setIsPopoverOpen(false); }}
                              className="flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{n.title}</p>
                                <p className="text-xs text-muted-foreground">{n.message}</p>
                                <p className="text-[10px] text-muted-foreground mt-1">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                        );
                      })()
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
                    )}
                  </div>

                  {/* New Orders - Admin Only */}
                  {isAdmin && (
                    <div>
                      <div className="p-3 font-semibold text-sm border-b bg-muted/20">
                        New Orders
                        {newOrderCount > 0 && (
                          <span className="ml-2 text-xs text-muted-foreground font-normal">
                            ({newOrderCount} new)
                          </span>
                        )}
                      </div>
                      {recentOrders.length > 0 ? (
                        <div className="p-1">
                          {recentOrders.map((order: any) => (
                            <Link
                              key={order.id}
                              href="/dashboard/new-orders"
                              onClick={markOrdersAsSeen}
                              className="flex items-start gap-3 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {order.customerName || 'Unknown Customer'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {order.items?.map((i: any) => i.productName).join(', ') || `Order #${order.id.slice(-6)}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(order.saleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {' · '}
                                  <span className="font-medium text-foreground/70">
                                    ${order.totalAmount?.toFixed(2)}
                                  </span>
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">No new orders</div>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            ) : (
              <Button variant="ghost" size="icon" title="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
            )}
          </div>
          <Button variant="ghost" size="icon" asChild title="Calendar">
            <Link href="/dashboard/bookings">
              <Calendar className="h-5 w-5" />
            </Link>
          </Button>
        </header>
        <main className="flex-1 p-6 bg-muted/10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutContent>{children}</DashboardLayoutContent>;
}
