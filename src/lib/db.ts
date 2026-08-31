import { supabase } from './supabase';
import type {
  Room, Booking, Employee, EmployeePayment, Department,
  HkTask, Expense, Note, Product, Category, Supplier,
  Sale, Vehicle, Load, Cheque, Bank,
  Organization, UserProfile, CashierPermissions, PricingPlan, BankDetails,
  PricingTier, ExtraCharge, RoomStatus, HousekeepingStatus,
  HkTaskStatus, HkPriority, HkType, BookingStatus,
  PaymentMethodType, SaleStatus, AppNotification
} from './types';

// -- HELPERS --

function toSnake(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

function toCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function keysToSnake(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[toSnake(key)] = obj[key];
  }
  return result;
}

export function keysToCamel<T = unknown>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[toCamel(key)] = obj[key];
  }
  return result as T;
}

function mapList<T>(data: unknown[] | null, converter: (item: Record<string, unknown>) => T): T[] {
  return (data || []).map(item => converter(item as Record<string, unknown>));
}

// -- ORG HELPERS --
let currentOrganizationId: string | null = null;
let currentUserId: string | null = null;

export function setDbContext(orgId: string | null, userId: string | null) {
  currentOrganizationId = orgId;
  currentUserId = userId;
}

export function clearDbContext() {
  currentOrganizationId = null;
  currentUserId = null;
}

// ============================================================
// ROOMS
// ============================================================
const roomConverter = (r: Record<string, unknown>): Room => ({
  ...(keysToCamel<Omit<Room, 'pricingTiers' | 'amenities'>>(r)),
  pricingTiers: (r.pricing_tiers || []) as PricingTier[],
  amenities: (r.amenities || []) as string[],
});

export async function fetchRooms(orgId: string): Promise<Room[]> {
  const { data } = await supabase.from('rooms').select('*').eq('organization_id', orgId);
  return mapList(data, roomConverter);
}

export async function addRoom(room: Room): Promise<void> {
  if (!currentOrganizationId) {
    throw new Error('Organization context not set. Try refreshing the page or signing in again.');
  }
  const { error } = await supabase.from('rooms').insert({
    ...keysToSnake(room as unknown as Record<string, unknown>),
    pricing_tiers: room.pricingTiers,
    amenities: room.amenities,
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateRoom(roomId: string, data: Partial<Room>): Promise<void> {
  const { error } = await supabase.from('rooms').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', roomId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateRoomStatus(roomId: string, status: RoomStatus): Promise<void> {
  const { error } = await supabase.from('rooms').update({ status }).eq('id', roomId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteRoom(roomId: string): Promise<void> {
  const { error } = await supabase.from('rooms').delete().eq('id', roomId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// ROOM DATE PRICING
// ============================================================
export async function fetchRoomDatePricing(orgId: string): Promise<Record<string, Record<string, number>>> {
  const { data } = await supabase.from('room_date_pricing').select('*').eq('organization_id', orgId);
  const result: Record<string, Record<string, number>> = {};
  (data || []).forEach((row: Record<string, unknown>) => {
    const roomId = row.room_id as string;
    const date = row.date as string;
    const price = row.price as number;
    if (!result[roomId]) result[roomId] = {};
    result[roomId][date] = price;
  });
  return result;
}

export async function setRoomDatePrice(roomId: string, date: string, price: number): Promise<void> {
  const { error } = await supabase.from('room_date_pricing').upsert(
    { room_id: roomId, date, price, organization_id: currentOrganizationId },
    { onConflict: 'room_id, date' }
  );
  if (error) throw new Error(error?.message || 'Database error');
}

export async function clearRoomDatePrice(roomId: string, date: string): Promise<void> {
  const { error } = await supabase.from('room_date_pricing').delete().eq('room_id', roomId).eq('date', date);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function setBulkRoomDatePrices(roomIds: string[], dates: string[], price: number): Promise<void> {
  const rows = roomIds.flatMap(roomId =>
    dates.map(date => ({ room_id: roomId, date, price, organization_id: currentOrganizationId }))
  );
  const { error } = await supabase.from('room_date_pricing').upsert(rows, { onConflict: 'room_id, date' });
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// ROOM TYPES
// ============================================================
export async function fetchRoomTypes(orgId: string): Promise<string[]> {
  const { data } = await supabase.from('room_types').select('name').eq('organization_id', orgId);
  return (data || []).map(r => (r as Record<string, unknown>).name as string);
}

export async function addRoomType(type: string): Promise<void> {
  const { error } = await supabase.from('room_types').insert({
    id: `rt-${Date.now()}`,
    name: type,
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function removeRoomType(type: string): Promise<void> {
  const { error } = await supabase.from('room_types').delete().eq('name', type);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// BOOKINGS
// ============================================================
const bookingConverter = (b: Record<string, unknown>): Booking => keysToCamel<Booking>(b);

export async function fetchBookings(orgId: string): Promise<Booking[]> {
  const { data } = await supabase.from('bookings').select('*').eq('organization_id', orgId);
  return mapList(data, bookingConverter);
}

export async function addBooking(booking: Booking): Promise<void> {
  const { extraCharges, ...bookingData } = booking;
  const { error } = await supabase.from('bookings').insert({
    ...keysToSnake(bookingData as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateBooking(bookingId: string, data: Partial<Booking>): Promise<void> {
  const { extraCharges, ...cleanData } = data;
  const { error } = await supabase.from('bookings').update(keysToSnake(cleanData as unknown as Record<string, unknown>)).eq('id', bookingId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === 'completed') update.completed_at = new Date().toISOString();
  const { error } = await supabase.from('bookings').update(update).eq('id', bookingId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteBooking(bookingId: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// EXTRA CHARGES
// ============================================================
export async function addExtraCharge(bookingId: string, charge: ExtraCharge, orgIdOverride?: string): Promise<void> {
  const { error } = await supabase.from('extra_charges').insert({
    id: charge.id,
    booking_id: bookingId,
    description: charge.description,
    amount: charge.amount,
    date: charge.date,
    source: charge.source || 'staff',
    sale_id: charge.saleId || null,
    organization_id: orgIdOverride || currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function removeExtraCharge(bookingId: string, chargeId: string): Promise<void> {
  const { error } = await supabase.from('extra_charges').delete().eq('booking_id', bookingId).eq('id', chargeId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function fetchExtraCharges(bookingId: string): Promise<ExtraCharge[]> {
  const { data } = await supabase.from('extra_charges').select('*').eq('booking_id', bookingId);
  return mapList(data, (r) => keysToCamel<ExtraCharge>({
    ...r,
    saleId: r.sale_id,
  }));
}

export async function fetchExtraChargesForBookings(bookingIds: string[]): Promise<Record<string, ExtraCharge[]>> {
  if (bookingIds.length === 0) return {};
  const { data } = await supabase.from('extra_charges').select('*').in('booking_id', bookingIds);
  const grouped: Record<string, ExtraCharge[]> = {};
  for (const row of data || []) {
    const bkId = row.booking_id as string;
    const charge: ExtraCharge = {
      id: row.id as string,
      description: row.description as string,
      amount: Number(row.amount),
      date: row.date as string,
      source: (row.source as 'guest' | 'staff') || 'staff',
      saleId: (row.sale_id as string) || undefined,
    };
    if (!grouped[bkId]) grouped[bkId] = [];
    grouped[bkId].push(charge);
  }
  return grouped;
}

// ============================================================
// EMPLOYEES
// ============================================================
const employeeConverter = (e: Record<string, unknown>): Employee => {
  const emp = keysToCamel<Employee>(e);
  emp.payments = emp.payments || [];
  return emp;
};

export async function fetchEmployees(orgId: string): Promise<Employee[]> {
  const { data } = await supabase.from('employees').select('*').eq('organization_id', orgId);
  return mapList(data, employeeConverter);
}

export async function addEmployee(emp: Employee): Promise<void> {
  const { payments, ...empData } = emp;
  const { error } = await supabase.from('employees').insert({
    ...keysToSnake(empData as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateEmployee(employeeId: string, data: Partial<Employee>): Promise<void> {
  const { payments, ...updateData } = data;
  const { error } = await supabase.from('employees').update(keysToSnake(updateData as unknown as Record<string, unknown>)).eq('id', employeeId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteEmployee(employeeId: string): Promise<void> {
  const { error } = await supabase.from('employees').delete().eq('id', employeeId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function addEmployeePayment(employeeId: string, payment: EmployeePayment): Promise<void> {
  const { error } = await supabase.from('employee_payments').insert({
    employee_id: employeeId,
    month: payment.month,
    amount: payment.amount,
    date: payment.date,
    status: payment.status,
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function fetchEmployeePayments(employeeId: string): Promise<EmployeePayment[]> {
  const { data } = await supabase.from('employee_payments').select('*').eq('employee_id', employeeId);
  return mapList(data, (r) => keysToCamel<EmployeePayment>(r));
}

// ============================================================
// DEPARTMENTS
// ============================================================
export async function fetchDepartments(orgId: string): Promise<Department[]> {
  const { data } = await supabase.from('departments').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Department>(r));
}

export async function addDepartment(dept: Department): Promise<void> {
  const { error } = await supabase.from('departments').insert({
    ...keysToSnake(dept as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateDepartment(deptId: string, data: Partial<Department>): Promise<void> {
  const { error } = await supabase.from('departments').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', deptId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteDepartment(deptId: string): Promise<void> {
  const { error } = await supabase.from('departments').delete().eq('id', deptId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// HOUSEKEEPING TASKS
// ============================================================
export async function fetchHkTasks(orgId: string): Promise<HkTask[]> {
  const { data } = await supabase.from('hk_tasks').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<HkTask>(r));
}

export async function addHkTask(task: HkTask): Promise<void> {
  const { error } = await supabase.from('hk_tasks').insert({
    ...keysToSnake(task as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateHkTaskStatus(taskId: string, status: HkTaskStatus): Promise<void> {
  const { error } = await supabase.from('hk_tasks').update({ status }).eq('id', taskId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteHkTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('hk_tasks').delete().eq('id', taskId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// EXPENSES
// ============================================================
export async function fetchExpenses(orgId: string): Promise<Expense[]> {
  const { data } = await supabase.from('expenses').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Expense>(r));
}

export async function addExpense(expense: Expense): Promise<void> {
  const { error } = await supabase.from('expenses').insert({
    ...keysToSnake(expense as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateExpense(expenseId: string, data: Partial<Expense>): Promise<void> {
  const { error } = await supabase.from('expenses').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', expenseId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteExpense(expenseId: string): Promise<void> {
  const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// NOTES
// ============================================================
export async function fetchNotes(orgId: string): Promise<Note[]> {
  const { data } = await supabase.from('notes').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Note>(r));
}

export async function addNote(note: Note): Promise<void> {
  const { error } = await supabase.from('notes').insert({
    ...keysToSnake(note as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateNote(noteId: string, data: Partial<Note>): Promise<void> {
  const { error } = await supabase.from('notes').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', noteId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// CATEGORIES
// ============================================================
export async function fetchCategories(orgId: string): Promise<Category[]> {
  const { data } = await supabase.from('categories').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Category>(r));
}

export async function addCategory(cat: Category): Promise<void> {
  const { error } = await supabase.from('categories').insert({
    ...keysToSnake(cat as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<void> {
  const { error } = await supabase.from('categories').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// PRODUCTS
// ============================================================
export async function fetchProducts(orgId: string): Promise<Product[]> {
  const { data } = await supabase.from('products').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Product>(r));
}

export async function addProduct(product: Product): Promise<void> {
  const { error } = await supabase.from('products').insert({
    ...keysToSnake(product as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateProduct(productId: string, field: string, value: unknown): Promise<void> {
  const { error } = await supabase.from('products').update({ [toSnake(field)]: value }).eq('id', productId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteProduct(product: Product): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', product.id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteProducts(ids: string[]): Promise<void> {
  const { error } = await supabase.from('products').delete().in('id', ids);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// SUPPLIERS
// ============================================================
export async function fetchSuppliers(orgId: string): Promise<Supplier[]> {
  const { data } = await supabase.from('suppliers').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Supplier>(r));
}

export async function addSupplier(sup: Supplier): Promise<void> {
  const { error } = await supabase.from('suppliers').insert({
    ...keysToSnake(sup as unknown as Record<string, unknown>),
    phone: sup.phone || [],
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateSupplier(id: string, data: Partial<Supplier>): Promise<void> {
  const { error } = await supabase.from('suppliers').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase.from('suppliers').delete().eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteSuppliers(ids: string[]): Promise<void> {
  const { error } = await supabase.from('suppliers').delete().in('id', ids);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// CUSTOMERS
// ============================================================
export async function fetchCustomers(orgId: string): Promise<any[]> {
  const { data } = await supabase.from('customers').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel(r));
}

export async function addCustomer(customer: any): Promise<string> {
  const { error } = await supabase.from('customers').insert({
    ...keysToSnake(customer),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
  return customer.id;
}

// ============================================================
// SALES
// ============================================================
export async function fetchSales(orgId: string): Promise<Sale[]> {
  const { data } = await supabase.from('sales').select('*').eq('organization_id', orgId).order('sale_date', { ascending: false });
  const sales = mapList(data, (r) => keysToCamel<Sale>({
    ...r,
    saleDate: r.sale_date,
    items: [],
  }));
  const saleIds = sales.map(s => s.id);
  if (saleIds.length > 0) {
    const itemMap = await fetchSaleItems(saleIds);
    for (const sale of sales) {
      sale.items = itemMap[sale.id] || [];
    }
  }
  return sales;
}

export async function fetchSaleItems(saleIds: string[]): Promise<Record<string, Sale['items']>> {
  const { data } = await supabase.from('sale_items').select('*').in('sale_id', saleIds);
  const grouped: Record<string, Sale['items']> = {};
  (data || []).forEach((item: Record<string, unknown>) => {
    const saleId = item.sale_id as string;
    if (!grouped[saleId]) grouped[saleId] = [];
    grouped[saleId].push({
      productId: item.product_id as string,
      productName: item.product_name as string,
      quantity: item.quantity as number,
      unitPrice: item.unit_price as number,
      discount: item.discount as number | undefined,
      isPrepared: item.is_prepared as boolean | undefined,
    });
  });
  return grouped;
}

export async function addSale(sale: Sale): Promise<void> {
  const { id, items, saleDate, ...saleData } = sale;
  const { error } = await supabase.from('sales').insert({
    id,
    sale_date: saleDate.toISOString(),
    ...keysToSnake(saleData as unknown as Record<string, unknown>),
    organization_id: sale.organizationId || currentOrganizationId,
    user_id: currentUserId,
  });
  if (error) throw new Error(error?.message || 'Database error');

  if (items && items.length > 0) {
    const saleItems = items.map(item => ({
      sale_id: id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount: item.discount || 0,
      is_prepared: item.isPrepared || false,
      organization_id: currentOrganizationId,
    }));
    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
    if (itemsError) throw itemsError;
  }
}

export async function updateSale(id: string, data: Partial<Sale>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'items') continue; // handled separately
    if (key === 'saleDate') {
      updateData.sale_date = (value as Date).toISOString();
    } else {
      updateData[toSnake(key)] = value;
    }
  }
  const { error } = await supabase.from('sales').update(updateData).eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');

  if (data.items) {
    await supabase.from('sale_items').delete().eq('sale_id', id);
    const saleItems = data.items.map(item => ({
      sale_id: id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount: item.discount || 0,
      is_prepared: item.isPrepared || false,
      organization_id: currentOrganizationId,
    }));
    const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
    if (itemsError) throw itemsError;
  }
}

export async function deleteSale(id: string): Promise<void> {
  const { error } = await supabase.from('sales').delete().eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function toggleOrderItemStatus(saleId: string, productId: string): Promise<void> {
  const { data } = await supabase.from('sale_items').select('is_prepared').eq('sale_id', saleId).eq('product_id', productId).single();
  if (data) {
    const { error } = await supabase.from('sale_items').update({ is_prepared: !(data as any).is_prepared }).eq('sale_id', saleId).eq('product_id', productId);
    if (error) throw new Error(error?.message || 'Database error');
  }
}

// ============================================================
// VEHICLES
// ============================================================
export async function fetchVehicles(orgId: string): Promise<Vehicle[]> {
  const { data } = await supabase.from('vehicles').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Vehicle>(r));
}

export async function addVehicle(vehicle: Vehicle): Promise<void> {
  const { error } = await supabase.from('vehicles').insert({
    ...keysToSnake(vehicle as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
  const { error } = await supabase.from('vehicles').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteVehicle(id: string): Promise<void> {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// LOADS
// ============================================================
export async function fetchLoads(orgId: string): Promise<Load[]> {
  const { data } = await supabase.from('loads').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Load>({ ...r, createdAt: r.created_at }));
}

export async function addLoad(load: Load): Promise<void> {
  const { id, items, createdAt, ...loadData } = load;
  const { error } = await supabase.from('loads').insert({
    id,
    created_at: createdAt.toISOString(),
    ...keysToSnake(loadData as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');

  if (items && items.length > 0) {
    const loadItems = items.map(item => ({
      load_id: id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      emoji: item.emoji,
      rack_location: item.rackLocation || null,
      organization_id: currentOrganizationId,
    }));
    const { error: itemsError } = await supabase.from('load_items').insert(loadItems);
    if (itemsError) throw itemsError;
  }
}

export async function updateLoad(id: string, data: Partial<Load>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'items') continue;
    if (key === 'createdAt') continue;
    updateData[toSnake(key)] = value;
  }
  const { error } = await supabase.from('loads').update(updateData).eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteLoad(id: string): Promise<void> {
  const { error } = await supabase.from('loads').delete().eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// CHEQUES
// ============================================================
export async function fetchCheques(orgId: string): Promise<Cheque[]> {
  const { data } = await supabase.from('cheques').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Cheque>({ ...r, date: r.date ? new Date(r.date as string) : undefined }));
}

export async function addCheque(cheque: Cheque): Promise<void> {
  const { error } = await supabase.from('cheques').insert({
    ...keysToSnake(cheque as unknown as Record<string, unknown>),
    date: cheque.date?.toISOString(),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateCheque(id: string, data: Partial<Cheque>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'date') {
      updateData.date = (value as Date).toISOString();
    } else {
      updateData[toSnake(key)] = value;
    }
  }
  const { error } = await supabase.from('cheques').update(updateData).eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteCheque(id: string): Promise<void> {
  const { error } = await supabase.from('cheques').delete().eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// BANKS
// ============================================================
export async function fetchBanks(orgId: string): Promise<Bank[]> {
  const { data } = await supabase.from('banks').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<Bank>(r));
}

export async function addBank(bank: Bank): Promise<void> {
  const { error } = await supabase.from('banks').insert({
    ...keysToSnake(bank as unknown as Record<string, unknown>),
    organization_id: currentOrganizationId,
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateBank(id: string, data: Partial<Bank>): Promise<void> {
  const { error } = await supabase.from('banks').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deleteBank(id: string): Promise<void> {
  const { error } = await supabase.from('banks').delete().eq('id', id);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// ORGANIZATIONS
// ============================================================
export async function fetchOrganizations(userId: string): Promise<Organization[]> {
  const { data } = await supabase.from('organizations').select('*');
  return mapList(data, (r) => keysToCamel<Organization>(r));
}

export async function fetchOrganization(orgId: string): Promise<Organization | null> {
  const { data } = await supabase.from('organizations').select('*').eq('id', orgId).single();
  return data ? keysToCamel<Organization>(data as Record<string, unknown>) : null;
}

export async function addOrganization(org: Organization): Promise<void> {
  const { error } = await supabase.from('organizations').insert({
    ...keysToSnake(org as unknown as Record<string, unknown>),
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateOrganization(orgId: string, data: Partial<Organization>): Promise<void> {
  const { error } = await supabase.from('organizations').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', orgId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// USERS
// ============================================================
export async function fetchUsers(orgId: string): Promise<UserProfile[]> {
  const { data } = await supabase.from('users').select('*').eq('organization_id', orgId);
  return mapList(data, (r) => keysToCamel<UserProfile>(r));
}

export async function fetchUserByUid(uid: string): Promise<UserProfile | null> {
  const { data } = await supabase.from('users').select('*').eq('uid', uid).single();
  return data ? keysToCamel<UserProfile>(data as Record<string, unknown>) : null;
}

export async function addUser(user: UserProfile): Promise<void> {
  const { error } = await supabase.from('users').upsert(
    {
      ...keysToSnake(user as unknown as Record<string, unknown>),
      created_at: user.createdAt?.toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateUserRole(userId: string, role: UserProfile['role']): Promise<void> {
  const { error } = await supabase.from('users').update({ role }).eq('uid', userId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateUserPermissions(userId: string, permissions: CashierPermissions): Promise<void> {
  const { error } = await supabase.from('users').update({ cashier_permissions: permissions }).eq('uid', userId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updateUserLocation(userId: string, lat: number, lng: number): Promise<void> {
  const { error } = await supabase.from('users').update({
    last_location: { lat, lng, timestamp: new Date().toISOString() },
  }).eq('uid', userId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export async function fetchNotifications(orgId: string): Promise<AppNotification[]> {
  try {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });
    return mapList(data, (r) => keysToCamel<AppNotification>(r));
  } catch {
    console.warn(
      '[notifications] Table not found. Notifications will work cross-tab only via localStorage.\n' +
      'To enable DB persistence, run in Supabase SQL editor:\n' +
      'CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL, type TEXT NOT NULL DEFAULT \'task_assigned\', related_id TEXT, read BOOLEAN NOT NULL DEFAULT false, created_at TEXT NOT NULL, organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE);\n' +
      'Then enable Realtime for the notifications table in Supabase Dashboard > Database > Replication.'
    );
    return [];
  }
}

export async function addNotification(notif: AppNotification): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    ...keysToSnake(notif as unknown as Record<string, unknown>),
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function markNotificationRead(notifId: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notifId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// PRICING PLANS
// ============================================================
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const { data } = await supabase.from('pricing_plans').select('*');
  return mapList(data, (r) => keysToCamel<PricingPlan>(r));
}

export async function addPricingPlan(plan: PricingPlan): Promise<void> {
  const { error } = await supabase.from('pricing_plans').insert({
    ...keysToSnake(plan as unknown as Record<string, unknown>),
  });
  if (error) throw new Error(error?.message || 'Database error');
}

export async function updatePricingPlan(planId: string, data: Partial<PricingPlan>): Promise<void> {
  const { error } = await supabase.from('pricing_plans').update(keysToSnake(data as unknown as Record<string, unknown>)).eq('id', planId);
  if (error) throw new Error(error?.message || 'Database error');
}

export async function deletePricingPlan(planId: string): Promise<void> {
  const { error } = await supabase.from('pricing_plans').delete().eq('id', planId);
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// SETTINGS
// ============================================================
export async function fetchSettings(orgId: string): Promise<Record<string, unknown> | null> {
  const { data } = await supabase.from('settings').select('*').eq('organization_id', orgId).single();
  return data ? keysToCamel<Record<string, unknown>>(data as Record<string, unknown>) : null;
}

export async function upsertSettings(orgId: string, settings: Record<string, unknown>): Promise<void> {
  const snakeData = keysToSnake(settings);
  const { error } = await supabase.from('settings').upsert(
    { organization_id: orgId, ...snakeData },
    { onConflict: 'organization_id' }
  );
  if (error) throw new Error(error?.message || 'Database error');
}

// ============================================================
// BANK DETAILS
// ============================================================
export async function fetchBankDetails(orgId: string): Promise<BankDetails | null> {
  const { data } = await supabase.from('bank_details').select('*').eq('organization_id', orgId).single();
  return data ? keysToCamel<BankDetails>(data as Record<string, unknown>) : null;
}

export async function upsertBankDetails(orgId: string, details: BankDetails): Promise<void> {
  const { error } = await supabase.from('bank_details').upsert(
    { organization_id: orgId, ...keysToSnake(details as unknown as Record<string, unknown>) },
    { onConflict: 'organization_id' }
  );
  if (error) throw new Error(error?.message || 'Database error');
}
