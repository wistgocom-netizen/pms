'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Laptop,
  ArrowRight,
  ShoppingCart,
  Warehouse,
  Users,
  BarChart2,
  Settings,
  Moon,
  Sun,
  DollarSign,
  Package,
  Scale,
  CreditCard,
  Check,
  Monitor,
  ChevronRight,
  TrendingUp,
  Clock,
  ArrowUpRight,
  UserPlus,
  CalendarCheck,
  Bed,
  Calendar as CalendarIcon,
  Lock,
  Wrench,
  Truck,
  Brush,
  Receipt
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { PublicFooter } from '@/components/public-footer';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// Helper component for feature list items
const FeatureListItem = ({ children }: { children: React.ReactNode }) => (
    <li className="flex items-start gap-4">
    <div className="bg-primary/10 text-primary rounded-full p-2 mt-1 flex-shrink-0">
      <Check className="w-5 h-5" />
    </div>
    <span className="text-muted-foreground">{children}</span>
  </li>
);

// Helper components for Dashboard Preview
const StatCard = ({ title, value, change, icon: Icon }: { title: string, value: string, change: string, icon: React.ElementType }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-2 sm:p-4">
      <CardTitle className="text-[9px] sm:text-xs font-medium uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent className="p-2 sm:p-4 pt-0">
      <div className="text-base sm:text-2xl font-bold">{value}</div>
      <p className="text-[8px] sm:text-xs text-muted-foreground font-medium">{change}</p>
    </CardContent>
  </Card>
);

const DashboardPreview = () => {
  const [dashboardDemoTheme, setDashboardDemoTheme] = useState<'light' | 'dark'>('light');
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const weeklySalesCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setDateTime(new Date());
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWeeklySalesMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!weeklySalesCardRef.current) return;
    const { left, top, width, height } = weeklySalesCardRef.current.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;

    const rotateX = -(y / height) * 10;
    const rotateY = (x / width) * 10;

    weeklySalesCardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleWeeklySalesMouseLeave = () => {
    if (!weeklySalesCardRef.current) return;
    weeklySalesCardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
  };
  
    // Mock data for the preview - matching Adyfire Dashboard
  const stats = [
    { title: "Total Revenue", value: "₹1,45,000", change: "₹85,000 from rooms", icon: DollarSign },
    { title: "Active Bookings", value: "12", change: "4 check-ins today", icon: CalendarCheck },
    { title: "Net Performance", value: "₹92,400", change: "+12% from last month", icon: TrendingUp },
    { title: "Room Status", value: "8 Available", change: "6 occupied, 2 maintenance", icon: Bed },
  ];

  const recentBookings = [
    { guest: "Arjun Sharma", room: "Room R201", stay: "Mar 25 - Mar 30", status: "Active" },
    { guest: "Priya Nair", room: "Room R101", stay: "Apr 01 - Apr 05", status: "Upcoming" },
    { guest: "John Doe", room: "Room R302", stay: "Mar 28 - Mar 31", status: "Active" },
  ];
  
  const topProducts = [
    { name: 'Espresso', sold: 120, emoji: '☕' },
    { name: 'Croissant', sold: 95, emoji: '🥐' },
    { name: 'Cappuccino', sold: 85, emoji: '🥛' },
    { name: 'Sandwich', sold: 70, emoji: '🥪' },
    { name: 'Muffin', sold: 60, emoji: '🧁' },
  ];

  return (
    <Card className={cn("max-w-6xl mx-auto shadow-2xl overflow-hidden border-2 sm:border-4", dashboardDemoTheme === 'dark' && 'dark')}>
        <CardHeader className="flex flex-row flex-wrap sm:flex-nowrap justify-between items-center p-2 sm:p-3 border-b bg-card text-card-foreground gap-2 sm:gap-3">
            <div className="flex items-center justify-start gap-1.5 sm:gap-3 shrink-0">
                <Laptop className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                <h3 className="font-bold text-xs sm:text-base font-brand">Adyfire (PMS)</h3>
            </div>
            <div className="text-center w-full sm:w-auto order-3 sm:order-none shrink-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">
                    {isClient && dateTime ? dateTime.toLocaleString() : ' '}
                </p>
            </div>
            <div className="flex justify-end shrink-0 ml-auto sm:ml-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setDashboardDemoTheme(dashboardDemoTheme === 'light' ? 'dark' : 'light')}>
                    <Sun className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    < Moon className="absolute h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-background text-foreground">
            <h1 className="text-xl sm:text-2xl font-bold font-headline">Property Overview</h1>
            <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    <Card
                      ref={weeklySalesCardRef}
                      onMouseMove={handleWeeklySalesMouseMove}
                      onMouseLeave={handleWeeklySalesMouseLeave}
                      className="transition-transform duration-300 ease-out h-full"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                        <CardHeader className="p-4">
                            <CardTitle className="text-base font-headline">Weekly Occupancy Trends</CardTitle>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-4 pb-4">
                            <div className="h-[150px] sm:h-[250px] w-full flex items-end gap-1 sm:gap-4 px-2">
                                {[45, 80, 30, 60, 90, 75, 50].map((height, i) => (
                                <div key={i} className="relative flex-grow h-full flex items-end">
                                    <div
                                    className="w-full bg-primary rounded-t-[2px]"
                                    style={{ height: `${height}%` }}
                                    />
                                </div>
                                ))}
                            </div>
                            <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-2 px-2">
                                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base flex items-center gap-2 font-headline">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                Recent Bookings
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:gap-6 p-4 pt-0">
                            {recentBookings.map((b, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                    <div className="min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold truncate">{b.guest}</p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground">{b.room} • {b.stay}</p>
                                    </div>
                                    <Badge variant={b.status === 'Active' ? 'default' : 'outline'} className="text-[10px] px-1.5 py-0 h-5 shrink-0">{b.status}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base font-headline">Top Services & Amenities</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <ol className="space-y-3 sm:space-y-4">
                                {topProducts.map((product, index) => (
                                    <li key={product.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <span className="text-xl sm:text-2xl">{product.emoji}</span>
                                            <p className="text-xs sm:text-sm font-medium truncate w-full">{product.name}</p>
                                        </div>
                                        <p className="text-xs sm:text-sm font-bold">{product.sold} requested</p>
                                    </li>
                                ))}
                            </ol>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

// Demo Room type
type DemoRoom = {
    id: string;
    type: 'Standard' | 'Deluxe' | 'Suite';
    price: number;
    status: 'available' | 'occupied' | 'maintenance';
    floor: number;
};

const BookingPreview = () => {
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [demoTheme, setDemoTheme] = useState<'light' | 'dark'>('light');
    const [dateTime, setDateTime] = useState<Date | null>(null);
    const [activeFilter, setActiveCategory] = useState<'all' | 'available' | 'occupied' | 'maintenance'>('all');
  
    useEffect(() => {
      setDateTime(new Date());
      const timer = setInterval(() => {
        setDateTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
    }, []);

    const demoRooms: DemoRoom[] = [
        { id: 'R101', type: 'Standard', price: 3500, status: 'available', floor: 1 },
        { id: 'R102', type: 'Standard', price: 3500, status: 'occupied', floor: 1 },
        { id: 'R201', type: 'Deluxe', price: 6500, status: 'available', floor: 2 },
        { id: 'R202', type: 'Deluxe', price: 6500, status: 'occupied', floor: 2 },
        { id: 'R301', type: 'Suite', price: 12000, status: 'available', floor: 3 },
        { id: 'R302', type: 'Suite', price: 12000, status: 'maintenance', floor: 3 },
        { id: 'R103', type: 'Standard', price: 3500, status: 'available', floor: 1 },
        { id: 'R203', type: 'Deluxe', price: 6500, status: 'available', floor: 2 },
    ];
    
    const filteredRooms = demoRooms.filter(r => activeFilter === 'all' || r.status === activeFilter);
    const selectedRoom = demoRooms.find(r => r.id === selectedRoomId);

    const filters: {name: 'all' | 'available' | 'occupied' | 'maintenance', label: string, icon: React.ElementType }[] = [
        { name: 'all', label: 'All Rooms', icon: Bed },
        { name: 'available', label: 'Available', icon: Check },
        { name: 'occupied', label: 'Occupied', icon: Lock },
        { name: 'maintenance', label: 'In Service', icon: Wrench },
    ];

    return (
        <Card className={cn("max-w-6xl mx-auto shadow-2xl overflow-hidden border-2 sm:border-4", demoTheme === 'dark' && 'dark')}>
            <CardHeader className="flex flex-row flex-wrap sm:flex-nowrap justify-between items-center p-2 sm:p-3 border-b bg-card text-card-foreground gap-2 sm:gap-3">
                <div className="flex items-center justify-start gap-1.5 sm:gap-3 shrink-0">
                    <Laptop className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                    <h3 className="font-bold text-xs sm:text-base font-brand">Adyfire (PMS)</h3>
                </div>
                <div className="text-center w-full sm:w-auto order-3 sm:order-none shrink-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground whitespace-nowrap">{dateTime ? dateTime.toLocaleString() : ' '}</p>
                </div>
                <div className="flex justify-end shrink-0 ml-auto sm:ml-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setDemoTheme(demoTheme === 'light' ? 'dark' : 'light')}>
                        <Sun className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </CardHeader>
            <div className="flex flex-col md:flex-row bg-card text-card-foreground min-h-[500px]">
                <div className="p-4 border-b md:border-b-0 md:border-r flex flex-row md:flex-col gap-2 bg-muted/20 overflow-x-auto no-scrollbar md:min-w-[180px]">
                    <h3 className="hidden md:block text-xs font-black uppercase tracking-widest mb-4 px-2 text-muted-foreground">Filters</h3>
                    {filters.map(({ name, label, icon: Icon }) => (
                        <Button
                            key={name}
                            variant={activeFilter === name ? 'default' : 'ghost'}
                            onClick={() => setActiveCategory(name)}
                            className="flex-shrink-0 md:w-full justify-start gap-2 h-9 md:h-10 text-xs md:text-sm font-semibold rounded-full md:rounded-lg"
                        >
                            <Icon className="h-3 w-3 md:h-4 md:w-4" />
                            {label}
                        </Button>
                    ))}
                </div>
                <div className="flex-grow p-4 sm:p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight font-headline">Room Inventory</h3>
                        <Badge variant="outline" className="text-[10px] font-bold">{filteredRooms.length} Rooms Found</Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {filteredRooms.map(room => (
                            <Card 
                                key={room.id} 
                                onClick={() => setSelectedRoomId(room.id)} 
                                className={cn(
                                    "cursor-pointer hover:shadow-lg transition-all group border-2",
                                    selectedRoomId === room.id ? "border-primary shadow-md ring-1 ring-primary" : "border-transparent",
                                    room.status === 'occupied' && "opacity-80"
                                )}
                            >
                                <CardContent className="p-3 sm:p-4 flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <p className="font-black text-sm sm:text-lg">{room.id}</p>
                                        <div className={cn(
                                            "w-2.5 h-2.5 rounded-full",
                                            room.status === 'available' ? "bg-green-500" : room.status === 'occupied' ? "bg-destructive" : "bg-primary"
                                        )} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{room.type}</p>
                                        <p className="font-bold text-xs sm:text-sm text-primary">₹{room.price.toLocaleString()}</p>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-1">Floor {room.floor}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
                <div className="bg-muted/30 p-4 sm:p-6 flex flex-col md:min-w-[280px] lg:min-w-[320px] border-t md:border-t-0 md:border-l">
                    <div className="flex items-center gap-2 mb-6">
                        <UserPlus className="h-5 w-5 text-primary" />
                        <h3 className="text-base sm:text-lg font-black uppercase tracking-tight font-headline">Quick Reservation</h3>
                    </div>
                    
                    <div className="flex-grow space-y-6">
                        {selectedRoom ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Selected Unit</p>
                                    <div className="flex justify-between items-center">
                                        <p className="font-black text-lg">Room {selectedRoom.id}</p>
                                        <p className="font-bold text-sm">₹{selectedRoom.price.toLocaleString()}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground">Guest Full Name</Label>
                                        <Input placeholder="e.g. Rahul Sharma" className="h-9 bg-background" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Check-in</Label>
                                            <div className="h-9 px-3 border rounded-md bg-background flex items-center gap-2 text-xs">
                                                <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" /> Today
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-bold uppercase text-muted-foreground">Stay Mode</Label>
                                            <div className="h-9 px-3 border rounded-md bg-background flex items-center justify-between text-xs">
                                                Standard <ChevronRight className="h-3 w-3 opacity-50 rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-full py-12 text-muted-foreground border-2 border-dashed rounded-2xl">
                                <Bed className="w-10 h-10 mb-4 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Select a room to<br />start booking</p>
                            </div>
                        )}
                    </div>

                    {selectedRoom && (
                        <div className="pt-6 mt-6 border-t space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-muted-foreground">Estimated Total</span>
                                <span className="font-black text-xl text-primary">₹{selectedRoom.price.toLocaleString()}</span>
                            </div>
                            <Button className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                                Confirm Booking
                            </Button>
                            <Button variant="ghost" className="w-full text-[10px] font-bold uppercase tracking-widest h-8" onClick={() => setSelectedRoomId(null)}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};


export default function HomePage() {
  const router = useRouter();
  const { userProfile } = useStore();
  
  useEffect(() => {
    // Landing page is strictly Light as the preferred default look
    document.documentElement.classList.remove('dark', 'midnight', 'blue', 'coinlytix', 'green');
    document.documentElement.classList.add('light');
  }, []);

  useEffect(() => {
    if (userProfile) {
        router.push('/dashboard');
    }
  }, [userProfile, router]);
  
  const faqs = [
    { question: "Is Adyfire (PMS) suitable for boutique hotels?", answer: "Absolutely. Our platform is designed to scale from small guest houses to large boutique hotels, offering flexible room management and custom pricing." },
    { question: "Can I try the PMS for free first?", answer: "Yes! We offer a 7-day free trial of our Pro plan. You can set up your rooms, add staff, and process bookings immediately with no credit card required." },
    { question: "How safe is my property and guest data?", answer: "We use bank-grade encryption and regular security audits. Your data is stored securely in the cloud with automated daily backups." },
    { question: "Does it support thermal receipt printing for check-outs?", answer: "Yes, Adyfire supports standard thermal printers (80mm and 58mm) as well as A4 professional invoices for business guests." },
    { question: "Can I manage housekeeping tasks through the app?", answer: "Yes, we have a dedicated Housekeeping module where staff can see their assigned rooms and update cleaning status in real-time." },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 bg-gradient-to-b from-blue-50 dark:from-blue-900/20 to-white dark:to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 p-2 bg-gradient-to-b from-blue-50/80 dark:from-blue-900/40 to-transparent">
        <div className="container mx-auto flex h-16 items-center justify-between rounded-lg border bg-white/80 px-4 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
            <Link href="/" className="flex items-center gap-2">
              <Laptop className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl tracking-tighter text-gray-900 dark:text-white font-brand">Adyfire (PMS)</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
              <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
              <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="/about" className="hover:text-primary transition-colors">About</Link>
              <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            </nav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-12 pb-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white font-headline">
              Make your property systematic and easy to manage.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400">
              The all-in-one Property Management System to streamline your reservations, housekeeping, and guest services.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Button size="lg" asChild>
                    <Link href="/signup">
                        Try 7 Days Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/features">Explore Features</Link>
                </Button>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-12 sm:py-20 animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Operations Dashboard</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Get a birds-eye view of your property's performance with real-time occupancy and revenue tracking.
                    </p>
                </div>
                <DashboardPreview />
            </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold font-headline">Room Management Grid</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Effortlessly manage room inventory and reservations. Click a room below to experience the streamlined booking flow.
                    </p>
                </div>
                <BookingPreview />
            </div>
        </section>

        {/* Alternating Feature Sections */}
        <section className="py-20 space-y-20">
          <div className="container mx-auto px-4">
            {/* Card 1: Property Reservation Engine */}
            <div className="grid md:grid-cols-2 items-center gap-12 rounded-2xl border bg-card text-card-foreground shadow-lg overflow-hidden p-8 md:p-12 mb-12 group animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="space-y-6">
                  <div className="inline-block bg-primary/10 text-primary p-3 rounded-xl">
                    <CalendarCheck className="h-8 w-8" />
                  </div>
                  <h2 className="text-4xl font-black font-headline tracking-tight leading-tight">Unified Property Reservation Engine</h2>
                  <p className="text-lg text-muted-foreground">Manage walk-ins and pre-booked guests with a fast, intuitive interface. Handle hourly slots or multi-night stays with dynamic pricing support.</p>
                  <ul className="space-y-4">
                    <FeatureListItem>Real-time visual room availability grid.</FeatureListItem>
                    <FeatureListItem>Support for Hourly, Half-Day, and Daily stay modes.</FeatureListItem>
                    <FeatureListItem>Automated check-in/out workflows.</FeatureListItem>
                    <FeatureListItem>Advance payment and security deposit tracking.</FeatureListItem>
                  </ul>
                </div>
                <div className="hidden md:flex items-center justify-center bg-muted/30 rounded-xl border border-dashed aspect-square transition-all duration-700 group-hover:bg-muted/50 group-hover:border-primary/30">
                  <CalendarCheck className="h-48 w-48 text-primary/20 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 group-hover:text-primary/30" />
                </div>
            </div>

            {/* Card 2: Housekeeping & Maintenance */}
            <div className="grid md:grid-cols-2 items-center gap-12 rounded-2xl border bg-card text-card-foreground shadow-lg overflow-hidden p-8 md:p-12 mb-12 group animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="hidden md:flex items-center justify-center bg-primary/5 rounded-xl border border-dashed aspect-square md:order-1 order-2 transition-all duration-700 group-hover:bg-primary/10 group-hover:border-primary/30">
                  <Brush className="h-48 w-48 text-primary/20 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-primary/30" />
                </div>
                <div className="space-y-6 md:order-2 order-1">
                  <div className="inline-block bg-primary/10 text-primary p-3 rounded-xl">
                    <Brush className="h-8 w-8" />
                  </div>
                  <h2 className="text-4xl font-black font-headline tracking-tight leading-tight">Seamless Housekeeping & Maintenance</h2>
                  <p className="text-lg text-muted-foreground">Keep your property spotless and in top condition. Coordinate your cleaning staff and maintenance team directly through the platform.</p>
                  <ul className="space-y-4">
                    <FeatureListItem>Task assignment for cleaning and repair staff.</FeatureListItem>
                    <FeatureListItem>Real-time room status updates (Dirty, Inspecting, Clean).</FeatureListItem>
                    <FeatureListItem>Historical cleaning logs per room.</FeatureListItem>
                    <FeatureListItem>Maintenance block tracking to prevent bookings.</FeatureListItem>
                  </ul>
                </div>
            </div>

            {/* Card 3: Guest CRM & Billing Profiles */}
            <div className="grid md:grid-cols-2 items-center gap-12 rounded-2xl border bg-card text-card-foreground shadow-lg overflow-hidden p-8 md:p-12 mb-12 group animate-in fade-in slide-in-from-left-8 duration-700">
                <div className="space-y-6">
                  <div className="inline-block bg-primary/10 text-primary p-3 rounded-xl">
                    <Users className="h-8 w-8" />
                  </div>
                  <h2 className="text-4xl font-black font-headline tracking-tight leading-tight">Comprehensive Guest CRM & Billing</h2>
                  <p className="text-lg text-muted-foreground">Build guest loyalty with detailed profiles and stay histories. Manage service charges and generate professional invoices instantly.</p>
                  <ul className="space-y-4">
                    <FeatureListItem>Itemized service charging (Food, Laundry, Amenities).</FeatureListItem>
                    <FeatureListItem>Guest profile archiving with identity verification.</FeatureListItem>
                    <FeatureListItem>Automated digital bills accessible via QR code.</FeatureListItem>
                    <FeatureListItem>Professional A4 and Thermal receipt templates.</FeatureListItem>
                  </ul>
                </div>
                <div className="hidden md:flex items-center justify-center bg-muted/30 rounded-xl border border-dashed aspect-square transition-all duration-700 group-hover:bg-muted/50 group-hover:border-primary/30">
                  <Users className="h-48 w-48 text-primary/20 transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 group-hover:text-primary/30" />
                </div>
            </div>

            {/* Card 4: Financial Reporting & Analytics */}
            <div className="grid md:grid-cols-2 items-center gap-12 rounded-2xl border bg-card text-card-foreground shadow-lg overflow-hidden p-8 md:p-12 group animate-in fade-in slide-in-from-right-8 duration-700">
                <div className="hidden md:flex items-center justify-center bg-primary/5 rounded-xl border border-dashed aspect-square md:order-1 order-2 transition-all duration-700 group-hover:bg-primary/10 group-hover:border-primary/30">
                  <Receipt className="h-48 w-48 text-primary/20 transition-all duration-700 group-hover:scale-110 group-hover:-rotate-3 group-hover:text-primary/30" />
                </div>
                <div className="space-y-6 md:order-2 order-1">
                  <div className="inline-block bg-primary/10 text-primary p-3 rounded-xl">
                    <BarChart2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-4xl font-black font-headline tracking-tight leading-tight">Advanced Financial Reporting & Analytics</h2>
                  <p className="text-lg text-muted-foreground">Know exactly where your revenue is coming from. Track operational expenses and staff payroll to understand your true net profit.</p>
                  <ul className="space-y-4">
                    <FeatureListItem>Daily, Weekly, and Monthly revenue breakdown.</FeatureListItem>
                    <FeatureListItem>Expense tracking for utilities and supplies.</FeatureListItem>
                    <FeatureListItem>Staff payroll and salary payment history.</FeatureListItem>
                    <FeatureListItem>Occupancy rate and top-service analytics.</FeatureListItem>
                  </ul>
                </div>
            </div>
          </div>
        </section>
        
        {/* Detailed Features Link Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href="/features">View All Detailed Features <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="p-8">
              <p className="text-xl font-medium italic text-gray-900 dark:text-white leading-relaxed">"Adyfire (PMS) has completely transformed how we manage our retreat. The visual room grid and housekeeping tools have saved our team hours of manual work every week."</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                  <img src="https://picsum.photos/seed/testimonial/40/40" alt="Nishanth Shan" width={40} height={40} className="rounded-full border shadow-sm" />
                  <div>
                      <p className="font-semibold">Nishanth Shan</p>
                      <p className="text-sm text-muted-foreground">Property Owner</p>
                  </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-20 bg-muted/10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-left font-semibold hover:text-primary transition-colors">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
            <div className="container mx-auto px-4">
                <div className="bg-primary text-primary-foreground rounded-3xl p-12 text-center shadow-2xl">
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Start optimizing your property today</h2>
                    <p className="mt-2 max-w-xl mx-auto opacity-80 text-lg">Join forward-thinking property owners who have streamlined their operations with Adyfire (PMS).</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <Button size="lg" variant="secondary" className="px-8" asChild>
                           <Link href="/signup">Launch Free Trial</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 px-8" asChild>
                           <Link href="/contact">Talk to Sales</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

      </main>

      <PublicFooter />

    </div>
  );
}
