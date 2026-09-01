'use client';

import React, { createContext, useContext, ReactNode, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import type {
  Room, Booking, Employee, EmployeePayment, RoomStatus, BookingStatus,
  StoreContextType, UserProfile, ExtraCharge, PricingTier, PricingPlan, Organization, BankDetails, Note, Expense, CashierPermissions,
  HkTask, HkTaskStatus, Department, Product, Category, Supplier, Sale, Vehicle, Load, Cheque, Bank, PaymentMethodType, AppNotification
} from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { initialData } from './initial-data';
import { format, addDays } from 'date-fns';
import * as db from '@/lib/db';

const parseLocalDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const defaultPlans: PricingPlan[] = [
  {
    id: 'plan-basic',
    name: 'Basic',
    description: 'Perfect for small guest houses and individual hosts.',
    priceMonthly: 1500,
    priceYearly: 16200,
    yearlyDiscount: 10,
    durationDays: 365,
    features: ['Unlimited Rooms', 'Unlimited Products', 'Basic Reporting', 'Email Support', 'Manual Check-ins'],
    isPopular: false,
    rooms: 999999,
    products: 999999
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    description: 'Best for growing boutique properties and retreats.',
    priceMonthly: 3500,
    priceYearly: 37800,
    yearlyDiscount: 10,
    durationDays: 365,
    features: ['Unlimited Rooms', 'Unlimited Products', 'Advanced Reporting', 'Priority Support', 'Hourly/Slot Bookings', 'Housekeeping Dashboard'],
    isPopular: true,
    rooms: 999999,
    products: 999999
  },
  {
    id: 'plan-business',
    name: 'Business',
    description: 'Complete professional solution for large hotel chains.',
    priceMonthly: 7500,
    priceYearly: 81000,
    yearlyDiscount: 10,
    durationDays: 365,
    features: ['Unlimited Rooms', 'Unlimited Products', 'Custom Pricing Tiers', 'Payroll Management', 'Multi-Property Support', 'API Access'],
    isPopular: false,
    rooms: 999999,
    products: 999999
  }
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

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [roomDatePricing, setRoomDatePricing] = useState<Record<string, Record<string, number>>>({});
  const roomDatePricingRef = useRef(roomDatePricing);
  roomDatePricingRef.current = roomDatePricing;
  const [roomTypes, setRoomTypes] = useState<string[]>(['Standard', 'Deluxe', 'Suite']);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [hkTasks, setHkTasks] = useState<HkTask[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetails | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingPricingPlans, setIsLoadingPricingPlans] = useState(true);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);

  const [storeName, setStoreName] = useState('Adyfire (PMS)');
  const [storeAddress, setStoreAddress] = useState('123 Hospitality Lane, City Center');
  const [storePhone, setStorePhone] = useState('+91 90000 00000');
  const [storeEmail, setStoreEmail] = useState('manager@adyfire.com');
  const [currency, setCurrency] = useState('lkr');
  const [taxRate, setTaxRate] = useState(12);
  const [theme, setTheme] = useState('light');
  const [zoom, setZoom] = useState(100);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(false);
  const [printFontScale, setPrintFontScale] = useState(1.2);
  const [hotelLogo, setHotelLogo] = useState('');
  const [reviewQrCode, setReviewQrCode] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<Record<PaymentMethodType, boolean>>({
    cash: true,
    card: true,
    loan: true,
    qr: true,
    split: true,
    cheque: true,
  });
  const [cashDenominations, setCashDenominations] = useState<number[]>([100, 500, 1000, 2000, 5000]);

  const barcodeFocusHandlerRef = React.useRef<(() => void) | null>(null);
  const registerBarcodeFocusHandler = useCallback((handler: () => void) => {
    barcodeFocusHandlerRef.current = handler;
  }, []);
  const focusBarcode = useCallback(() => {
    barcodeFocusHandlerRef.current?.();
  }, []);

  const generateOrgId = () => crypto.randomUUID();

  const withRecalculatedTotal = useCallback((b: Booking, currentRooms: Room[]) => {
    const room = currentRooms.find(r => r.id.toLowerCase() === b.roomId.toLowerCase());
    if (!room) return b;

    let unitPrice = room.price || 0;
    let tier = null;
    if (b.pricingTierId && room.pricingTiers) {
      tier = room.pricingTiers.find((t: any) => t.id === b.pricingTierId);
      if (tier) unitPrice = tier.price;
    }

    const isBaseRate = !tier || tier.price === room.price;
    const datePricing = roomDatePricingRef.current;
    let roomSubtotal = 0;

    if (b.stayMode === 'hourly') {
      const units = Number(b.durationUnits) || 1;
      const checkIn = parseLocalDate(b.checkIn);
      if (checkIn && !isNaN(checkIn.getTime())) {
        const dateStr = format(checkIn, 'yyyy-MM-dd');
        const overridePrice = datePricing?.[room?.id || '']?.[dateStr];
        const effectivePrice = isBaseRate ? (overridePrice ?? unitPrice) : unitPrice;
        roomSubtotal = effectivePrice * units;
      } else {
        roomSubtotal = unitPrice * units;
      }
    } else {
      const checkIn = parseLocalDate(b.checkIn);
      const checkOut = parseLocalDate(b.checkOut);
      if (checkIn && checkOut && !isNaN(checkIn.getTime()) && !isNaN(checkOut.getTime())) {
        const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86400000));
        for (let i = 0; i < nights; i++) {
          const date = addDays(checkIn, i);
          const dateStr = format(date, 'yyyy-MM-dd');
          const overridePrice = datePricing?.[room?.id || '']?.[dateStr];
          roomSubtotal += isBaseRate ? (overridePrice ?? unitPrice) : unitPrice;
        }
      } else {
        roomSubtotal = unitPrice;
      }
    }

    const extraTotal = b.extraCharges?.reduce((sum: number, c: any) => sum + (Number(c.amount) || 0), 0) || 0;

    return { ...b, totalAmount: roomSubtotal + extraTotal };
  }, []);

  // Seed default data for a new organization
  const seedInitialData = useCallback(async (orgId: string) => {
    const seededRooms = initialData.rooms.map(r => ({
      ...r,
      pricingTiers: r.pricingTiers || [{ id: 'default', label: 'Per Night', price: r.price || 0 }]
    }));
    for (const room of seededRooms) {
      await db.addRoom({ ...room, organizationId: orgId } as Room);
    }
    setRooms(seededRooms as Room[]);

    for (const booking of initialData.bookings) {
      await db.addBooking({ ...booking, organizationId: orgId } as Booking);
    }
    setBookings(initialData.bookings as Booking[]);

    for (const emp of initialData.employees) {
      await db.addEmployee({ ...emp, organizationId: orgId } as Employee);
    }
    setEmployees(initialData.employees as Employee[]);
  }, []);

  const loadDataRef = useRef<(() => Promise<void>) | null>(null);

  // Load all data from Supabase on mount
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setIsLoading(false);
          setIsLoadingPricingPlans(false);
          setIsLoadingOrganizations(false);
          return;
        }

        // Find or create user profile
        let profile = await db.fetchUserByUid(session.user.id);
        if (!profile) {
          profile = {
            id: session.user.id,
            uid: session.user.id,
            email: session.user.email || '',
            displayName: session.user.email || '',
            role: 'admin',
            createdAt: new Date(),
          };
        }
        if (!cancelled) setUserProfile(profile);

        const orgId = profile.organizationId || null;
        db.setDbContext(orgId, profile.uid);
        if (orgId) {

          const [fetchedRooms, fetchedBookings, fetchedEmployees, fetchedDepts] = await Promise.all([
            db.fetchRooms(orgId),
            db.fetchBookings(orgId),
            db.fetchEmployees(orgId),
            db.fetchDepartments(orgId),
          ]);

          const hasData = fetchedRooms.length > 0 || fetchedEmployees.length > 0;
          if (!hasData && !cancelled) {
            await seedInitialData(orgId);
            const [r, b, e, d] = await Promise.all([
              db.fetchRooms(orgId), db.fetchBookings(orgId),
              db.fetchEmployees(orgId), db.fetchDepartments(orgId),
            ]);
            if (!cancelled) {
              setRooms(r);
              const chargeMap = await db.fetchExtraChargesForBookings(b.map((bk: Booking) => bk.id));
              setBookings(b.map((bk: Booking) => ({ ...bk, extraCharges: chargeMap[bk.id] || bk.extraCharges || [] })));
              setEmployees(e);
              setDepartments(d);
            }
          } else if (!cancelled) {
            setRooms(fetchedRooms);
            // Load extra charges for all bookings
            const chargeMap = await db.fetchExtraChargesForBookings(fetchedBookings.map(b => b.id));
            const bookingsWithCharges = fetchedBookings.map(b => ({ ...b, extraCharges: chargeMap[b.id] || b.extraCharges || [] }));
            setBookings(bookingsWithCharges);
            setEmployees(fetchedEmployees);
            setDepartments(fetchedDepts);
          }

          const [
            fetchedExpenses, fetchedNotes, fetchedHkTasks,
            fetchedProducts, fetchedCategories, fetchedSuppliers,
            fetchedSales, fetchedVehicles, fetchedLoads,
            fetchedCheques, fetchedBanks, fetchedCustomers,
            fetchedRoomTypes, fetchedRoomDatePricing,
            fetchedPricingPlans, fetchedUsers, fetchedSettings,
            fetchedBankDetails, fetchedNotifications
          ] = await Promise.all([
            db.fetchExpenses(orgId),
            db.fetchNotes(orgId),
            db.fetchHkTasks(orgId),
            db.fetchProducts(orgId),
            db.fetchCategories(orgId),
            db.fetchSuppliers(orgId),
            db.fetchSales(orgId),
            db.fetchVehicles(orgId),
            db.fetchLoads(orgId),
            db.fetchCheques(orgId),
            db.fetchBanks(orgId),
            db.fetchCustomers(orgId),
            db.fetchRoomTypes(orgId),
            db.fetchRoomDatePricing(orgId),
            db.fetchPricingPlans(),
            db.fetchUsers(orgId),
            db.fetchSettings(orgId),
            db.fetchBankDetails(orgId),
            db.fetchNotifications(orgId),
          ]);

          if (!cancelled) {
            setExpenses(fetchedExpenses);
            setNotes(fetchedNotes);
            setHkTasks(fetchedHkTasks);
            setProducts(fetchedProducts);
            setCategories(fetchedCategories.length > 0 ? fetchedCategories : [{ id: 'cat-1', name: 'All Items', emoji: '📦' }]);
            setSuppliers(fetchedSuppliers);
            setSales(fetchedSales);
            setVehicles(fetchedVehicles);
            setLoads(fetchedLoads);
            setCheques(fetchedCheques);
            setBanks(fetchedBanks.length > 0 ? fetchedBanks : [{ id: 'bank-1', name: 'Commercial Bank' }]);
            setCustomers(fetchedCustomers);
            if (fetchedRoomTypes.length > 0) setRoomTypes(fetchedRoomTypes);
            setRoomDatePricing(fetchedRoomDatePricing);
            setPricingPlans(fetchedPricingPlans.length > 0 ? fetchedPricingPlans : defaultPlans);
            setUsers(fetchedUsers);
            setBankDetails(fetchedBankDetails);
            try {
              const dbNotifs = (fetchedNotifications || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
              // Only persist to localStorage if we got real data (not fallback empty array)
              if (dbNotifs.length > 0) {
                setNotifications(dbNotifs);
                try { localStorage.setItem(`nt_persist_${orgId}`, JSON.stringify(dbNotifs)); } catch {}
              } else {
                // DB returned empty — try localStorage fallback
                const saved = localStorage.getItem(`nt_persist_${orgId}`);
                if (saved) {
                  const parsed = JSON.parse(saved) as AppNotification[];
                  if (parsed.length > 0) {
                    setNotifications(parsed);
                  }
                }
              }
            } catch {
              // notifications table may not exist yet
            }
            if (fetchedSettings) {
              if (fetchedSettings.storeName) setStoreName(fetchedSettings.storeName as string);
              if (fetchedSettings.storeAddress) setStoreAddress(fetchedSettings.storeAddress as string);
              if (fetchedSettings.storePhone) setStorePhone(fetchedSettings.storePhone as string);
              if (fetchedSettings.storeEmail) setStoreEmail(fetchedSettings.storeEmail as string);
              if (fetchedSettings.currency) setCurrency(fetchedSettings.currency as string);
              if (fetchedSettings.taxRate !== undefined) setTaxRate(fetchedSettings.taxRate as number);
              if (fetchedSettings.theme) setTheme(fetchedSettings.theme as string);
              if (fetchedSettings.zoom) setZoom(fetchedSettings.zoom as number);
              if (fetchedSettings.autoPrintReceipt !== undefined) setAutoPrintReceipt(fetchedSettings.autoPrintReceipt as boolean);
              if (fetchedSettings.printFontScale !== undefined) setPrintFontScale(fetchedSettings.printFontScale as number);
              if (fetchedSettings.hotelLogo) setHotelLogo(fetchedSettings.hotelLogo as string);
              if (fetchedSettings.reviewQrCode) setReviewQrCode(fetchedSettings.reviewQrCode as string);
              if (fetchedSettings.paymentMethods) setPaymentMethods(fetchedSettings.paymentMethods as Record<PaymentMethodType, boolean>);
              if (fetchedSettings.cashDenominations) setCashDenominations(fetchedSettings.cashDenominations as number[]);
            }
          }
        } else {
          // User has no org - load global data
          const plans = await db.fetchPricingPlans();
          if (!cancelled) {
            setPricingPlans(plans.length > 0 ? plans : defaultPlans);
          }
        }
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setIsLoadingPricingPlans(false);
          setIsLoadingOrganizations(false);
        }
      }
    };

    loadDataRef.current = loadData;
    loadData();
    return () => { cancelled = true; };
  }, [seedInitialData]);

  // Persist settings to Supabase when they change
  useEffect(() => {
    if (!isLoading && userProfile?.organizationId) {
      db.upsertSettings(userProfile.organizationId, {
        storeName, storeAddress, storePhone, storeEmail, currency,
        taxRate, theme, zoom, autoPrintReceipt, printFontScale, hotelLogo, reviewQrCode, paymentMethods, cashDenominations
      }).catch(() => {});
      document.documentElement.classList.remove('light', 'dark', 'midnight', 'blue', 'green', 'coinlytix');
      document.documentElement.classList.add(theme);
      if (theme !== 'light') document.documentElement.classList.add('dark');
      document.documentElement.style.fontSize = `${zoom}%`;
    }
  }, [storeName, storeAddress, storePhone, storeEmail, currency, taxRate, theme, zoom, autoPrintReceipt, printFontScale, hotelLogo, reviewQrCode, paymentMethods, cashDenominations, isLoading, userProfile]);

  // Load notifications from localStorage as fallback when DB table is missing
  useEffect(() => {
    if (!userProfile?.organizationId || isLoading) return;
    if (notifications.length > 0) return; // already loaded from DB
    try {
      const saved = localStorage.getItem(`nt_persist_${userProfile.organizationId}`);
      if (saved) {
        const parsed = JSON.parse(saved) as AppNotification[];
        if (parsed.length > 0) {
          setNotifications(parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
        }
      }
    } catch {}
  }, [userProfile?.organizationId, isLoading, notifications.length]);

  // Sync db context module-level variables whenever userProfile changes
  useEffect(() => {
    if (userProfile?.organizationId && userProfile?.uid) {
      db.setDbContext(userProfile.organizationId, userProfile.uid);
    }
  }, [userProfile?.organizationId, userProfile?.uid]);

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        db.clearDbContext();
      } else if (event === 'SIGNED_IN' && session?.user) {
        const foundUser = users.find(u => u.uid === session.user.id || u.email === session.user.email);
        if (foundUser) {
          setUserProfile(foundUser);
          db.setDbContext(foundUser.organizationId || null, foundUser.uid);
        } else {
          // Reload data from server to pick up the user profile
          loadDataRef.current?.();
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [users]);

  // Real-time subscription for sales (instant cross-tab updates when Realtime is enabled)
  useEffect(() => {
    const orgId = userProfile?.organizationId;
    if (!orgId || isLoading) return;

    const channel = supabase
      .channel(`sales-realtime-${orgId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sales', filter: `organization_id=eq.${orgId}` },
        (payload) => {
          const newSale = db.keysToCamel<Sale>(payload.new as Record<string, unknown>);
          setSales(prev => {
            if (prev.some(s => s.id === newSale.id)) return prev;
            return [{ ...newSale, items: [] }, ...prev];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.organizationId, isLoading]);

  // Real-time subscription for notifications
  useEffect(() => {
    const orgId = userProfile?.organizationId;
    if (!orgId || isLoading) return;

    try {
      const channel = supabase
        .channel(`notifications-realtime-${orgId}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `organization_id=eq.${orgId}` },
          (payload) => {
            const notif = db.keysToCamel<AppNotification>(payload.new as Record<string, unknown>);
            setNotifications(prev => [notif, ...prev]);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    } catch {
      // notifications table may not exist yet
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.organizationId, isLoading]);

  // Real-time subscription for extra_charges
  useEffect(() => {
    const orgId = userProfile?.organizationId;
    if (!orgId || isLoading) return;

    const channel = supabase
      .channel(`extra-charges-${orgId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'extra_charges', filter: `organization_id=eq.${orgId}` },
        async (payload) => {
          const bkId = (payload.new as any)?.booking_id || (payload.old as any)?.booking_id;
          if (!bkId) return;
          const charges = await db.fetchExtraCharges(bkId);
          setBookings(prev => prev.map(b =>
            b.id === bkId ? { ...b, extraCharges: charges } : b
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.organizationId, isLoading]);

  const organization = useMemo(() => {
    if (!userProfile || !organizations) return null;
    return organizations.find(o => o.id === userProfile.organizationId) || organizations.find(o => o.ownerUid === userProfile.uid) || null;
  }, [userProfile, organizations]);

  // Sync db context when organization is resolved (e.g. via ownerUid match)
  useEffect(() => {
    if (organization?.id && userProfile?.uid) {
      db.setDbContext(organization.id, userProfile.uid);
    }
  }, [organization?.id, userProfile?.uid]);

  // ============================================================
  // CRUD OPERATIONS - all call Supabase via db service
  // ============================================================

  const addProduct = async (product: Product) => {
    await db.addProduct(product);
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = async (productId: string, field: keyof Product, value: any) => {
    await db.updateProduct(productId, field, value);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, [field]: value } : p));
  };

  const deleteProduct = async (product: Product) => {
    await db.deleteProduct(product);
    setProducts(prev => prev.filter(p => p.id !== product.id));
  };

  const deleteProducts = async (ids: string[]) => {
    await db.deleteProducts(ids);
    setProducts(prev => prev.filter(p => !ids.includes(p.id)));
  };

  const addCategory = async (cat: Omit<Category, 'id'>) => {
    const newCat = { ...cat, id: generateId('cat') };
    await db.addCategory(newCat);
    setCategories(prev => [...prev, newCat]);
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    await db.updateCategory(id, data);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCategory = async (id: string) => {
    await db.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addSupplier = async (sup: Omit<Supplier, 'id'>) => {
    const newSup = { ...sup, id: generateId('sup') };
    await db.addSupplier(newSup);
    setSuppliers(prev => [...prev, newSup]);
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    await db.updateSupplier(id, data);
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteSupplier = async (id: string) => {
    await db.deleteSupplier(id);
    setSuppliers(prev => prev.filter(s => s.id !== id));
  };

  const deleteSuppliers = async (ids: string[]) => {
    await db.deleteSuppliers(ids);
    setSuppliers(prev => prev.filter(s => !ids.includes(s.id)));
  };

  const addRoom = async (room: Room) => {
    if (organization?.id && userProfile?.uid) {
      db.setDbContext(organization.id, userProfile.uid);
    }
    await db.addRoom(room);
    setRooms(prev => [...prev, room]);
  };

  const addRoomType = async (type: string) => {
    if (roomTypes.includes(type)) return;
    await db.addRoomType(type);
    setRoomTypes(prev => [...prev, type]);
  };

  const removeRoomType = async (type: string) => {
    await db.removeRoomType(type);
    setRoomTypes(prev => prev.filter(t => t !== type));
  };

  const removeRoom = async (roomId: string) => {
    await db.deleteRoom(roomId);
    setRooms(prev => prev.filter(r => r.id !== roomId));
  };

  const updateRoom = async (roomId: string, data: Partial<Room>) => {
    await db.updateRoom(roomId, data);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...data } : r));
  };

  const updateRoomStatus = async (roomId: string, status: RoomStatus) => {
    await db.updateRoomStatus(roomId, status);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status } : r));
  };

  const setRoomDatePrice = async (roomId: string, date: string, price: number) => {
    await db.setRoomDatePrice(roomId, date, price);
    setRoomDatePricing(prev => ({ ...prev, [roomId]: { ...(prev[roomId] || {}), [date]: price } }));
  };

  const clearRoomDatePrice = async (roomId: string, date: string) => {
    await db.clearRoomDatePrice(roomId, date);
    setRoomDatePricing(prev => {
      if (!prev[roomId]) return prev;
      const { [date]: _, ...rest } = prev[roomId];
      return Object.keys(rest).length > 0 ? { ...prev, [roomId]: rest } : (delete prev[roomId], { ...prev });
    });
  };

  const setBulkRoomDatePrices = async (roomIds: string[], dates: string[], price: number) => {
    await db.setBulkRoomDatePrices(roomIds, dates, price);
    setRoomDatePricing(prev => {
      const next = { ...prev };
      roomIds.forEach(roomId => {
        next[roomId] = { ...(next[roomId] || {}) };
        dates.forEach(date => { next[roomId][date] = price; });
      });
      return next;
    });
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'status' | 'totalAmount'>) => {
    const newBooking: Booking = { ...bookingData, id: generateId('BK'), status: 'upcoming', totalAmount: 0, extraCharges: [] };
    const recalculated = withRecalculatedTotal(newBooking, rooms);
    await db.addBooking(recalculated);
    setBookings(prev => [...prev, recalculated]);
  };

  const updateBooking = async (bookingId: string, data: Partial<Booking>) => {
    const existingBooking = bookings.find(b => b.id === bookingId);
    const merged = existingBooking ? { ...existingBooking, ...data } : (data as Booking);
    const recalculated = withRecalculatedTotal(merged, rooms);
    await db.updateBooking(bookingId, { ...data, totalAmount: recalculated.totalAmount });
    setBookings(prev => prev.map(b => b.id === bookingId ? withRecalculatedTotal({ ...b, ...data }, rooms) : b));
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    await db.updateBookingStatus(bookingId, status);
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      return { ...b, status, completedAt: status === 'completed' ? new Date().toISOString() : b.completedAt };
    }));
  };

  const addExtraCharge = async (bookingId: string, charge: Omit<ExtraCharge, 'id' | 'date'>) => {
    const newCharge: ExtraCharge = { ...charge, id: generateId('CHG'), date: new Date().toISOString().split('T')[0] };
    await db.addExtraCharge(bookingId, newCharge);
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      const updated = { ...b, extraCharges: [...(b.extraCharges || []), newCharge] };
      return withRecalculatedTotal(updated, rooms);
    }));
  };

  const removeExtraCharge = async (bookingId: string, chargeId: string) => {
    await db.removeExtraCharge(bookingId, chargeId);
    setBookings(prev => prev.map(b => {
      if (b.id !== bookingId) return b;
      const updated = { ...b, extraCharges: b.extraCharges?.filter(c => c.id !== chargeId) };
      return withRecalculatedTotal(updated, rooms);
    }));
  };

  const addEmployee = async (emp: Omit<Employee, 'id' | 'payments'>) => {
    const newEmp: Employee = { ...emp, id: generateId('E'), payments: [] };
    await db.addEmployee(newEmp);
    setEmployees(prev => [...prev, newEmp]);
  };

  const updateEmployee = async (employeeId: string, data: Partial<Employee>) => {
    await db.updateEmployee(employeeId, data);
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, ...data } : e));
  };

  const deleteEmployee = async (employeeId: string) => {
    await db.deleteEmployee(employeeId);
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  };

  const addEmployeePayment = async (employeeId: string, payment: EmployeePayment) => {
    await db.addEmployeePayment(employeeId, payment);
    setEmployees(prev => prev.map(e => e.id === employeeId ? { ...e, payments: [payment, ...e.payments] } : e));
  };

  const addDepartment = async (dept: Omit<Department, 'id'>) => {
    const newDept: Department = { ...dept, id: generateId('D') };
    await db.addDepartment(newDept);
    setDepartments(prev => [...prev, newDept]);
  };

  const updateDepartment = async (deptId: string, data: Partial<Department>) => {
    await db.updateDepartment(deptId, data);
    setDepartments(prev => prev.map(d => d.id === deptId ? { ...d, ...data } : d));
  };

  const deleteDepartment = async (deptId: string) => {
    await db.deleteDepartment(deptId);
    setDepartments(prev => prev.filter(d => d.id !== deptId));
  };

  const persistNotifications = (items: AppNotification[]) => {
    const orgId = userProfile?.organizationId;
    if (!orgId) return;
    try { localStorage.setItem(`nt_persist_${orgId}`, JSON.stringify(items)); } catch {}
  };

  const addNotification = async (notif: Omit<AppNotification, 'id' | 'createdAt'>) => {
    const newNotif: AppNotification = { ...notif, id: generateId('NT'), createdAt: new Date().toISOString() };
    try {
      await db.addNotification(newNotif);
    } catch (e) {
      console.warn('Notification table not available, skipping DB save:', e);
    }
    setNotifications(prev => {
      const next = [newNotif, ...prev];
      persistNotifications(next);
      return next;
    });
    // Cross-tab sync signal
    try {
      localStorage.setItem('nt_cross_tab', JSON.stringify({ ...newNotif, _ts: Date.now() }));
    } catch {}
  };

  // Listen for cross-tab notification events
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key !== 'nt_cross_tab' || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        if (!data || !data.id) return;
        setNotifications(prev => {
          if (prev.some(n => n.id === data.id)) return prev;
          const notif: AppNotification = {
            id: data.id, userId: data.userId, title: data.title,
            message: data.message, type: data.type, relatedId: data.relatedId,
            read: data.read ?? false, createdAt: data.createdAt,
            organizationId: data.organizationId,
          };
          const next = [notif, ...prev];
          try { localStorage.setItem(`nt_persist_${data.organizationId}`, JSON.stringify(next)); } catch {}
          return next;
        });
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const markNotificationRead = async (notifId: string) => {
    try {
      await db.markNotificationRead(notifId);
    } catch (e) {
      console.warn('Notification table not available, skipping DB update:', e);
    }
    setNotifications(prev => {
      const next = prev.map(n => n.id === notifId ? { ...n, read: true } : n);
      persistNotifications(next);
      return next;
    });
  };

  const addHkTask = async (task: Omit<HkTask, 'id' | 'status' | 'createdAt'>) => {
    const newTask: HkTask = { ...task, id: generateId('HK'), status: 'pending', createdAt: new Date().toISOString() };
    await db.addHkTask(newTask);
    setHkTasks(prev => [...prev, newTask]);

    // Notify assigned user
    if (task.assignedTo && users) {
      const assignee = users.find(u => u.uid === task.assignedTo);
      const room = rooms.find(r => r.id === task.roomId);
      addNotification({
        userId: task.assignedTo,
        title: 'New Task Assigned',
        message: `You have been assigned to ${task.type} for ${room?.id || task.roomId}`,
        type: 'task_assigned',
        relatedId: newTask.id,
        read: false,
        organizationId: userProfile?.organizationId || '',
      });
    }
  };

  const updateHkTaskStatus = async (taskId: string, status: HkTaskStatus) => {
    const prevTask = hkTasks.find(t => t.id === taskId);
    await db.updateHkTaskStatus(taskId, status);
    setHkTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));

    // Notify admin when staff starts or completes a task
    if (prevTask && prevTask.assignedTo && users) {
      const assignee = users.find(u => u.uid === prevTask.assignedTo);
      const staffName = assignee?.displayName || assignee?.username || assignee?.email || 'A staff member';
      const room = rooms.find(r => r.id === prevTask.roomId);
      if (prevTask.status === 'pending' && status === 'in-progress') {
        addNotification({
          userId: taskId,
          title: 'Task Started',
          message: `${staffName} started ${prevTask.type} for ${room?.id || prevTask.roomId}`,
          type: 'task_started',
          relatedId: taskId,
          read: false,
          organizationId: userProfile?.organizationId || '',
        });
      } else if (prevTask.status === 'in-progress' && status === 'completed') {
        addNotification({
          userId: taskId,
          title: 'Task Completed',
          message: `${staffName} completed ${prevTask.type} for ${room?.id || prevTask.roomId}`,
          type: 'task_completed',
          relatedId: taskId,
          read: false,
          organizationId: userProfile?.organizationId || '',
        });
      }
    }
  };

  const deleteHkTask = async (taskId: string) => {
    await db.deleteHkTask(taskId);
    setHkTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: generateId('EXP') };
    await db.addExpense(newExpense);
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = async (expenseId: string, data: Partial<Expense>) => {
    await db.updateExpense(expenseId, data);
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, ...data } : e));
  };

  const deleteExpense = async (expenseId: string) => {
    await db.deleteExpense(expenseId);
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
  };

  const addNote = async (note: Omit<Note, 'id' | 'createdAt'>) => {
    const newNote: Note = { ...note, id: generateId('note'), createdAt: new Date().toISOString() };
    await db.addNote(newNote);
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = async (noteId: string, data: Partial<Note>) => {
    await db.updateNote(noteId, data);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...data } : n));
  };

  const deleteNote = async (noteId: string) => {
    await db.deleteNote(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const addSale = async (saleData: any): Promise<Sale> => {
    const newSale: Sale = {
      ...saleData,
      id: generateId('S'),
      saleDate: new Date(),
      status: saleData.status || 'Completed',
      userId: userProfile?.uid,
      organizationId: userProfile?.organizationId,
    };
    await db.addSale(newSale);
    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  const addWholesaleSale = async (saleData: any) => {
    await addSale({ ...saleData, orderType: 'wholesale' });
  };

  const saveWholesaleDraft = async (saleData: any) => {
    await addSale({ ...saleData, orderType: 'wholesale', status: 'Draft' });
  };

  const updateSaleDetails = async (id: string, data: Partial<Sale>) => {
    await db.updateSale(id, data);
    // Determine sync needs before updating state
    const prevSale = sales.find(s => s.id === id);
    // Use prev sale if found in state; otherwise derive from data (freshly created order not yet in state)
    const customerId = prevSale?.customerId || data.customerId;
    const orderType = prevSale?.orderType || data.orderType;
    const wasCancelled = prevSale?.status === 'Cancelled';
    const isNowCancelled = data.status === 'Cancelled';
    // Determine if extra charges need to be synced for dine-in orders
    let syncNeeded: { bookingId: string; targetItems: Sale['items']; removeAll: boolean } | null = null;
    if (customerId && orderType === 'dine-in') {
      const newItemsAdded = !!(data.items && data.items.length > 0);
      if (!wasCancelled && isNowCancelled) {
        // Going to cancelled → remove all charges for this sale
        syncNeeded = { bookingId: customerId, targetItems: [], removeAll: true };
      } else if (wasCancelled && !isNowCancelled) {
        // Coming back from cancelled → re-add items (prefer payload, fallback to state, then DB)
        const saleItems = data.items || prevSale?.items || [];
        if (saleItems.length > 0) {
          syncNeeded = { bookingId: customerId, targetItems: saleItems, removeAll: false };
        } else {
          // Fallback: fetch items from DB if neither payload nor state has them
          try {
            const itemMap = await db.fetchSaleItems([id]);
            const dbItems = itemMap[id] || [];
            if (dbItems.length > 0) {
              syncNeeded = { bookingId: customerId, targetItems: dbItems, removeAll: false };
              data.items = dbItems;
            }
          } catch {}
        }
      } else if (newItemsAdded && !isNowCancelled) {
        // Items being set (initial order or re-adding after cancel)
        syncNeeded = { bookingId: customerId, targetItems: data.items!, removeAll: false };
      } else if (!isNowCancelled && prevSale?.items && prevSale.items.length > 0) {
        // Status change to non-cancelled (e.g., New → Approved): sync existing sale items
        syncNeeded = { bookingId: customerId, targetItems: prevSale.items, removeAll: false };
      }
    }
    // Persist extra charges to DB if needed
    if (syncNeeded) {
      const { bookingId, targetItems: rawTarget, removeAll } = syncNeeded;
      const targetItems = rawTarget || [];
      // Always remove existing charges for this sale first
      const existingCharges = bookings.find(b => b.id === bookingId)?.extraCharges || [];
      const toRemove = existingCharges.filter(c => c.saleId === id);
      if (toRemove.length > 0) {
        await Promise.allSettled(toRemove.map(c => db.removeExtraCharge(bookingId, c.id)));
      }
      // Add new charges if not removing all
      if (!removeAll && targetItems.length > 0) {
        const bookingOrgId = bookings.find(b => b.id === bookingId)?.organizationId;
        for (const item of targetItems) {
          const cId = generateId('CHG');
          const charge: ExtraCharge = {
            id: cId,
            description: `${item.quantity}x ${item.productName}`,
            amount: item.unitPrice * item.quantity,
            date: new Date().toISOString().split('T')[0],
            source: 'guest',
            saleId: id,
          };
          try { await db.addExtraCharge(bookingId, charge, bookingOrgId || undefined); } catch {}
        }
      }
    }
    // Update React state
    setSales(prev => {
      const sale = prev.find(s => s.id === id);
      const next: Sale[] = prev.map(s => s.id === id ? {
        ...s, ...data,
        ...(data.status === 'Approved' && s.orderType !== 'dine-in' ? { orderType: 'dine-in' } : {})
      } as Sale : s);

      if (syncNeeded && sale?.customerId && sale.orderType === 'dine-in') {
        const { bookingId, targetItems: rawTarget } = syncNeeded;
        const targetItems = rawTarget || [];
        setBookings(bPrev => bPrev.map(b => {
          if (b.id !== bookingId) return b;
          if (targetItems.length === 0) {
            return withRecalculatedTotal({ ...b, extraCharges: (b.extraCharges || []).filter(c => c.saleId !== id) }, rooms);
          }
          const charges = targetItems.map(item => ({
            id: generateId('CHG'),
            description: `${item.quantity}x ${item.productName}`,
            amount: item.unitPrice * item.quantity,
            date: new Date().toISOString().split('T')[0],
            source: 'guest' as const,
            saleId: id,
          }));
          const existing = b.extraCharges || [];
          return withRecalculatedTotal({ ...b, extraCharges: [...existing.filter(c => c.saleId !== id), ...charges] }, rooms);
        }));
      }
      return next;
    });
  };

  const deleteSale = async (id: string) => {
    await db.deleteSale(id);
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const toggleOrderItemStatus = async (saleId: string, productId: string) => {
    await db.toggleOrderItemStatus(saleId, productId);
    setSales(prev => prev.map(s => s.id === saleId ? {
      ...s, items: s.items.map(i => i.productId === productId ? { ...i, isPrepared: !i.isPrepared } : i)
    } : s));
  };

  const createNewOrder = async (customerId: string, tableNumber?: string, customerName?: string, orderType?: 'dine-in' | 'take-away' | 'wholesale', guestOrgId?: string) => {
    const orgId = guestOrgId || userProfile?.organizationId;
    const newSale: Sale = {
      id: generateId('S'), saleDate: new Date(), status: 'New',
      userId: userProfile?.uid, organizationId: orgId,
      customerId, tableNumber, customerName, orderType,
      items: [], totalAmount: 0, subtotal: 0, taxes: 0, discountAmount: 0, paymentMethod: 'cash',
    };
    await db.addSale(newSale);
    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  const addVehicle = async (v: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...v, id: generateId('v') };
    await db.addVehicle(newVehicle);
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
    await db.updateVehicle(id, data);
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  };

  const deleteVehicle = async (id: string) => {
    await db.deleteVehicle(id);
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  const addLoad = async (l: any) => {
    const newLoad = { ...l, id: generateId('L'), createdAt: new Date() };
    await db.addLoad(newLoad);
    setLoads(prev => [newLoad, ...prev]);
    return newLoad;
  };

  const updateLoad = async (id: string, data: Partial<Load>) => {
    await db.updateLoad(id, data);
    setLoads(prev => prev.map(l => l.id === id ? { ...l, ...data } : l));
  };

  const deleteLoad = async (id: string) => {
    await db.deleteLoad(id);
    setLoads(prev => prev.filter(l => l.id !== id));
  };

  const addCheque = async (c: any) => {
    const newCheque = { ...c, id: generateId('CHQ'), date: new Date() };
    await db.addCheque(newCheque);
    setCheques(prev => [newCheque, ...prev]);
  };

  const updateCheque = async (id: string, data: Partial<Cheque>) => {
    await db.updateCheque(id, data);
    setCheques(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteCheque = async (id: string) => {
    await db.deleteCheque(id);
    setCheques(prev => prev.filter(c => c.id !== id));
  };

  const addBank = async (b: Omit<Bank, 'id'>) => {
    const newBank = { ...b, id: generateId('bank') };
    await db.addBank(newBank);
    setBanks(prev => [...prev, newBank]);
  };

  const updateBank = async (id: string, data: Partial<Bank>) => {
    await db.updateBank(id, data);
    setBanks(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  };

  const deleteBank = async (id: string) => {
    await db.deleteBank(id);
    setBanks(prev => prev.filter(b => b.id !== id));
  };

  const addCustomer = async (c: any) => {
    const newId = generateId('cust');
    const newCust = { ...c, id: newId, totalLoanAmount: 0, totalPaidAmount: 0 };
    await db.addCustomer(newCust);
    setCustomers(prev => [...prev, newCust]);
    return newId;
  };

  const updateUserLocation = useCallback(async (lat: number, lng: number) => {
    if (!userProfile) return;
    await db.updateUserLocation(userProfile.uid, lat, lng);
    setUsers(prev => prev.map(u => u.uid === userProfile.uid ? {
      ...u, lastLocation: { lat, lng, timestamp: new Date().toISOString() }
    } : u));
  }, [userProfile]);

  const addPricingPlan = async (plan: Omit<PricingPlan, 'id'>) => {
    const newPlan = { ...plan, id: generateId('plan') };
    await db.addPricingPlan(newPlan);
    setPricingPlans(prev => [...prev, newPlan]);
  };

  const updatePricingPlan = async (planId: string, data: Partial<PricingPlan>) => {
    await db.updatePricingPlan(planId, data);
    setPricingPlans(prev => prev.map(p => p.id === planId ? { ...p, ...data } : p));
  };

  const deletePricingPlan = async (planId: string) => {
    await db.deletePricingPlan(planId);
    setPricingPlans(prev => prev.filter(p => p.id !== planId));
  };

  const updateBankDetails = async (details: BankDetails) => {
    if (!userProfile?.organizationId) return;
    await db.upsertBankDetails(userProfile.organizationId, details);
    setBankDetails(details);
  };

  const updateOrganization = async (orgId: string, data: Partial<Organization>) => {
    await db.updateOrganization(orgId, data);
    setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, ...data } : o));
  };

  const requestSubscriptionChange = async (orgId: string, planName: string, cycle: 'monthly' | 'yearly') => {
    await updateOrganization(orgId, { subscriptionPlan: planName, billingCycle: cycle, subscriptionStatus: 'pending' });
  };

  const processSubscriptionPayment = async (orgId: string, cycle?: 'monthly' | 'yearly', dodoSubscriptionId?: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (!org) return;
    const effectiveCycle = cycle || org.billingCycle || 'monthly';
    const durationDays = effectiveCycle === 'yearly' ? 365 : 30;
    const currentEnd = org.subscriptionEndDate ? new Date(org.subscriptionEndDate) : new Date();
    const baseDate = currentEnd > new Date() ? currentEnd : new Date();
    const newEnd = new Date(baseDate.getTime() + durationDays * 86400000);
    const updatedOrg: Partial<Organization> = {
      subscriptionPlan: org.subscriptionPlan || 'Pro',
      subscriptionStatus: 'paid',
      subscriptionEndDate: newEnd.toISOString(),
      lastPaymentDate: new Date().toISOString(),
      billingCycle: effectiveCycle,
    };
    if (dodoSubscriptionId) {
      updatedOrg.dodoSubscriptionId = dodoSubscriptionId;
    }
    await db.updateOrganization(orgId, updatedOrg);
    setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, ...updatedOrg } : o));
  };

  const updateUserRole = async (userId: string, role: UserProfile['role']) => {
    await db.updateUserRole(userId, role);
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, role } : u));
  };

  const updateUserPermissions = async (userId: string, permissions: CashierPermissions) => {
    await db.updateUserPermissions(userId, permissions);
    setUsers(prev => prev.map(u => u.uid === userId ? { ...u, cashierPermissions: permissions } : u));
    if (userProfile?.uid === userId) {
      setUserProfile(prev => prev ? { ...prev, cashierPermissions: permissions } : prev);
    }
  };

  const createStoreAndAdmin = async (data: any) => {
    if (!userProfile?.uid) return { success: false, error: { message: 'Not authenticated' } };
    const orgId = generateOrgId();
    const userId = generateId('u');
    const newOrg: Organization = {
      id: orgId, name: data.storeName, ownerUid: userProfile.uid,
      subscriptionPlan: data.subscriptionPlan, subscriptionStatus: 'paid',
      subscriptionEndDate: new Date(Date.now() + 3650 * 86400000).toISOString(), billingCycle: 'monthly',
    };
    const newUser: UserProfile = {
      id: userId, uid: userId, email: data.email,
      displayName: `${data.firstName} ${data.lastName}`,
      role: 'admin', organizationId: orgId, createdAt: new Date(),
      cashierPermissions: adminDefaultPermissions,
    };
    await db.addOrganization(newOrg);
    await db.addUser(newUser);
    // Update the current auth user's row to associate them with the org
    if (userProfile.uid) {
      // Upsert the auth user into the users table with org membership
      const authUserRow: UserProfile = {
        id: userProfile.uid,
        uid: userProfile.uid,
        email: userProfile.email || data.email,
        displayName: userProfile.displayName || data.email,
        role: 'admin',
        organizationId: orgId,
        createdAt: userProfile.createdAt || new Date(),
        cashierPermissions: adminDefaultPermissions,
      };
      await db.addUser(authUserRow);
      setUserProfile(authUserRow);
      db.setDbContext(orgId, authUserRow.uid);
      setUsers(prev => {
        const filtered = prev.filter(u => u.uid !== authUserRow.uid);
        return [...filtered, authUserRow];
      });
    }
    setOrganizations(prev => [...prev, newOrg]);
    return { success: true };
  };

  const createStoreByAdmin = async (data: any) => {
    if (!userProfile) return { success: false, error: { message: 'Not authenticated' } };
    const orgId = generateOrgId();
    const newOrg: Organization = {
      id: orgId, name: data.storeName, ownerUid: userProfile.uid,
      subscriptionPlan: organization?.subscriptionPlan || 'Pro',
      subscriptionStatus: organization?.subscriptionStatus || 'paid',
      subscriptionEndDate: organization?.subscriptionEndDate || new Date(Date.now() + 3650 * 86400000).toISOString(),
      billingCycle: organization?.billingCycle || 'monthly',
    };
    await db.addOrganization(newOrg);
    setOrganizations(prev => [...prev, newOrg]);
    return { success: true };
  };

  const createUser = async (data: any) => {
    if (!userProfile) return { success: false, error: { message: 'Not authenticated' } };
    const { data: authData, error: authError } = await supabase.auth.signUp({ email: data.email, password: data.password });
    if (authError) return { success: false, error: authError };
    const uid = authData.user?.id;
    if (!uid) return { success: false, error: { message: 'Failed to create auth user' } };
    const newUser: UserProfile = {
      id: uid, uid, email: data.email,
      displayName: `${data.firstName} ${data.lastName}`,
      role: data.role || 'staff',
      organizationId: data.organizationId || userProfile.organizationId,
      createdAt: new Date(),
      cashierPermissions: data.cashierPermissions ||
        (data.role === 'admin' ? adminDefaultPermissions :
         data.role === 'cashier' ? cashierDefaultPermissions : staffDefaultPermissions),
    };
    await db.addUser(newUser);
    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  const signIn = async (loginId: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginId, password: pass });
    if (error) return { success: false, error: error.message };
    const uid = data.user?.id;
    const email = data.user?.email;
    if (!uid) return { success: false, error: 'No user ID returned from authentication.' };

    let profile: UserProfile | null = null;
    try {
      const existingUser = await db.fetchUserByUid(uid);
      if (existingUser) {
        profile = existingUser;
        setUserProfile(existingUser);
        db.setDbContext(existingUser.organizationId || null, existingUser.uid);
      } else if (email) {
        const newUser: UserProfile = { id: uid, uid, email, displayName: email, role: 'admin', createdAt: new Date() };
        await db.addUser(newUser);
        db.setDbContext(null, uid);
        setUsers(prev => [...prev, newUser]);
        profile = newUser;
        setUserProfile(newUser);
      }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to load user profile.' };
    }

    if (!profile) return { success: false, error: 'User profile not found. Contact your administrator.' };
    return { success: true, error: null };
  };

  const signUp = async (data: any) => {
    const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password });
    if (error) return { success: false, error: error.message };
    const uid = authData.user?.id;
    if (!uid) return { success: false, error: 'Signup failed. Please try again.' };
    const orgId = generateOrgId();
    const newUser: UserProfile = {
      id: uid, uid, email: data.email,
      displayName: `${data.firstName} ${data.lastName}`,
      role: 'admin', organizationId: orgId, createdAt: new Date(),
      cashierPermissions: adminDefaultPermissions,
    };
    const newOrg: Organization = {
      id: orgId, name: `${data.firstName}'s Property`, ownerUid: uid,
      subscriptionPlan: 'Pro', subscriptionStatus: 'paid',
      subscriptionEndDate: new Date(Date.now() + 3650 * 86400000).toISOString(), billingCycle: 'monthly',
    };
    await db.addOrganization(newOrg);
    await db.addUser(newUser);
    db.setDbContext(orgId, uid);
    setOrganizations(prev => [...prev, newOrg]);
    setUsers(prev => [...prev, newUser]);
    setUserProfile(newUser);
    return { success: true, error: null };
  };

  const t = (key: string) => key;
  const formatCurrency = (amount: number) => {
    const val = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase(), minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(val);
    } catch {
      return `${currency.toUpperCase()} ${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    }
  };
  const signOut = () => { setUserProfile(null); db.clearDbContext(); supabase.auth.signOut(); window.location.href = '/login'; };

  return (
    <StoreContext.Provider value={{
      rooms, bookings, employees, departments, expenses, notes, hkTasks, notifications, addNotification, markNotificationRead, userProfile, isLoading,
      products, categories, suppliers, sales, vehicles, loads, cheques, banks, customers,
      pricingPlans, isLoadingPricingPlans, organizations, isLoadingOrganizations, organization, isLoadingOrganization: false, bankDetails, users,
      storeName, setStoreName, storeAddress, setStoreAddress, storePhone, setStorePhone, storeEmail, setStoreEmail,
      currency, setCurrency, taxRate, setTaxRate, theme, setTheme, zoom, setZoom, autoPrintReceipt, setAutoPrintReceipt,
      printFontScale, setPrintFontScale, hotelLogo, setHotelLogo, reviewQrCode, setReviewQrCode,
      paymentMethods, cashDenominations,
      registerBarcodeFocusHandler, focusBarcode, updateUserLocation,
      roomTypes, addRoomType, removeRoomType, addRoom, removeRoom, updateRoom, updateRoomStatus, setRoomDatePrice, clearRoomDatePrice, setBulkRoomDatePrices, roomDatePricing, addBooking, updateBooking, updateBookingStatus, addExtraCharge, removeExtraCharge,
      addEmployee, updateEmployee, deleteEmployee, addEmployeePayment, addDepartment, updateDepartment, deleteDepartment, addHkTask, updateHkTaskStatus, deleteHkTask, addExpense, updateExpense, deleteExpense, addNote, updateNote, deleteNote, addPricingPlan, updatePricingPlan, deletePricingPlan,
      addProduct, updateProduct, deleteProduct, deleteProducts, addCategory, updateCategory, deleteCategory, addSupplier, updateSupplier, deleteSupplier, deleteSuppliers,
      addSale, addWholesaleSale, saveWholesaleDraft, updateSaleDetails, deleteSale, toggleOrderItemStatus, createNewOrder, addCustomer,
      addVehicle, updateVehicle, deleteVehicle, addLoad, updateLoad, deleteLoad, addCheque, updateCheque, deleteCheque, addBank, updateBank, deleteBank,
      requestSubscriptionChange, processSubscriptionPayment, updateBankDetails, updateOrganization, updateUserRole, updateUserPermissions,
      createStoreAndAdmin, createStoreByAdmin, createUser,
      seedDemoData: seedInitialData,
      t, formatCurrency, signOut, signIn, signUp
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
