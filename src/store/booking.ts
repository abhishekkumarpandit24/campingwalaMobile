import {create} from "zustand";
import { getAllMyBookings, createBooking } from "../services/booking.api";

interface Booking {
  _id: string;
  campingSpot: {
    name: string;
    location: string;
    pricePerNight: number;
  };
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  specialRequests?: string;
  createdAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalBookings: number;
}

interface BookingStore {
  bookings: Booking[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  fetchBookings: (page?: number, limit?: number) => Promise<void>;
  addBooking: (bookingData: {
    startDate: string;
    endDate: string;
    siteId: string;
    guestCount: number;
    specialRequests: string;
    totalAmount: number;
  }) => Promise<any>;
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0
  },
  loading: false,
  error: null,
  fetchBookings: async (page = 1, limit = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await getAllMyBookings(page, limit);
      set({ 
        bookings: response.bookings,
        pagination: response.pagination,
        loading: false
      });
    } catch (error: any) {
      console.error("Error fetching bookings:", error);
      set({ 
        error: error.message || 'Failed to fetch bookings',
        loading: false 
      });
    }
  },
  addBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const response = await createBooking(bookingData);
      set((state) => ({
        bookings: [response, ...state.bookings],
        loading: false
      }));
      return response;
    } catch (error: any) {
      console.error("Error creating booking:", error);
      set({ 
        error: error.message || 'Failed to create booking',
        loading: false 
      });
      throw error;
    }
  },
}));
