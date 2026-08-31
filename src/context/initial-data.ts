
import type { Room, Booking, Employee } from '@/lib/types';

export const initialData = {
  rooms: [
    { id: "R101", type: "Standard", floor: 1, capacity: 2, price: 3500, amenities: ["AC", "TV", "WiFi"], status: "available", hkStatus: "clean", lastCleaned: "2026-03-31" },
    { id: "R102", type: "Standard", floor: 1, capacity: 2, price: 3500, amenities: ["AC", "TV", "WiFi"], status: "available", hkStatus: "dirty", lastCleaned: "2026-03-30" },
    { id: "R201", type: "Deluxe", floor: 2, capacity: 3, price: 6500, amenities: ["AC", "TV", "WiFi", "Mini Bar"], status: "occupied", hkStatus: "clean", lastCleaned: "2026-03-31" },
    { id: "R202", type: "Deluxe", floor: 2, capacity: 3, price: 6500, amenities: ["AC", "TV", "WiFi", "Mini Bar"], status: "available", hkStatus: "inspecting", lastCleaned: "2026-03-31" },
    { id: "R301", type: "Suite", floor: 3, capacity: 4, price: 12000, amenities: ["AC", "TV", "WiFi", "Mini Bar", "Jacuzzi"], status: "available", hkStatus: "clean", lastCleaned: "2026-03-31" },
    { id: "R302", type: "Suite", floor: 3, capacity: 4, price: 12000, amenities: ["AC", "TV", "WiFi", "Mini Bar", "Jacuzzi"], status: "maintenance", hkStatus: "dirty", lastCleaned: "2026-03-29" },
  ] as Room[],
  bookings: [
    { id: "BK001", roomId: "R201", guestName: "Arjun Sharma", phone: "9876543210", email: "arjun@email.com", checkIn: "2026-03-25", checkOut: "2026-03-30", checkInTime: "12:00 PM", checkOutTime: "11:00 AM", guests: 2, advance: 5000, status: "active", totalAmount: 32500, stayMode: 'daily', durationUnits: 5, timeRange: '', bookingType: 'Per Night' },
    { id: "BK002", roomId: "R101", guestName: "Priya Nair", phone: "9123456789", email: "priya@email.com", checkIn: "2026-04-01", checkOut: "2026-04-05", checkInTime: "02:00 PM", checkOutTime: "11:00 AM", guests: 1, advance: 3500, status: "upcoming", totalAmount: 14000, stayMode: 'daily', durationUnits: 4, timeRange: '', bookingType: 'Per Night' },
  ] as Booking[],
  employees: [
    { id: "E001", name: "Ravi Kumar", role: "Front Desk", department: "Reception", salary: 28000, phone: "9000000001", joiningDate: "2024-01-15", payments: [{ month: "March 2026", amount: 28000, date: "2026-03-01", status: "paid" }, { month: "February 2026", amount: 28000, date: "2026-02-01", status: "paid" }] },
    { id: "E002", name: "Meena Devi", role: "Housekeeping", department: "Operations", salary: 18000, phone: "9000000002", joiningDate: "2023-06-10", payments: [{ month: "March 2026", amount: 18000, date: "2026-03-01", status: "paid" }] },
    { id: "E003", name: "Suresh Pillai", role: "Manager", department: "Management", salary: 55000, phone: "9000000003", joiningDate: "2022-03-01", payments: [{ month: "March 2026", amount: 55000, date: "2026-03-01", status: "paid" }, { month: "February 2026", amount: 55000, date: "2026-02-01", status: "paid" }] },
  ] as Employee[],
  userProfile: {
    id: 'admin-user',
    uid: 'admin-user',
    email: 'admin@hotelmaster.com',
    displayName: 'Hotel Admin',
    role: 'super-admin',
    organizationId: 'org-00001',
    createdAt: new Date(),
  },
};
