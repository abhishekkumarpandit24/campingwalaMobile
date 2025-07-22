import { StackNavigationProp } from "@react-navigation/stack";
import { CampingSpot } from "../interfaces/ISpotDetail";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  SpotDetails: { spot: CampingSpot, requestId?: string, requestStatus?: string, setCampingRequests?: any };
  BookingScreen: { spot: CampingSpot };
  EditSpot: { spot: CampingSpot };
  PaymentConfirmation: { 
    orderId: string,
    amount: string,
    currency: string,
    bookingId: string    
  };
  MyBookings: any;
  Home: any;
  // Add other screens as needed
};

export type SpotDetailsRouteProp = RouteProp<RootStackParamList, 'SpotDetails'>;
export type SpotDetailsNavigationProp = StackNavigationProp<RootStackParamList>;
