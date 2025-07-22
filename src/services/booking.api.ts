import { API_URL as API_BASE_URL } from '../config/config';
import api from './api';

const BASE_URL = `${API_BASE_URL}/bookings`;

interface BookingData {
  startDate: string;
  endDate: string;
  siteId: string;
  guestCount: number;
  specialRequests: string;
  totalAmount: number;
}

// ✅ Fetch bookings for the current user (pagination optional)
export const getAllMyBookings = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`${BASE_URL}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
};

// ✅ Create a new booking
export const createBooking = async (bookingData: BookingData): Promise<any> => {
  try {
    const mappedData = {
      campingSpotId: bookingData.siteId,
      checkInDate: new Date(bookingData.startDate).toISOString(),
      checkOutDate: new Date(bookingData.endDate).toISOString(),
      guestCount: Number(bookingData.guestCount),
      specialRequests: bookingData.specialRequests,
      totalAmount: Number(bookingData.totalAmount),
      status: 'pending',
      paymentStatus: 'pending',
    };

    const response = await api.post(BASE_URL, mappedData);
    return response.data;
  } catch (error: any) {
    console.error('Error creating booking:', error);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    throw error;
  }
};

// ✅ Confirm payment after success (e.g., Razorpay, Stripe)
export const confirmPayment = async (orderId: string, paymentDetails: any) => {
  try {
    const response = await api.post(`${BASE_URL}/confirm-payment`, {
      orderId,
      ...paymentDetails,
    });
    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};
