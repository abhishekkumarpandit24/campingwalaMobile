// Note: This is a simplified and mobile-optimized version of the BookingPage
// from React.js to React Native. Styling is managed with inline styles and StyleSheet.

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useBookingStore } from '../../store/booking';
import { useCampingStore } from '../../store/camping';
import { createBooking } from '../../services/booking.api';
import { SpotDetailsNavigationProp } from '../../types/spotDetail';

const BookingScreen = () => {
  const navigation = useNavigation<SpotDetailsNavigationProp>();
  const route = useRoute();
  const { spot }: any = route.params ?? {};

  const { bookings, fetchBookings } = useBookingStore();
  const { campingSites } = useCampingStore();

  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    fetchBookings();
    if (!spot) {
      Alert.alert('Error', 'Camping site not found');
      navigation.goBack();
    }
  }, [fetchBookings, spot?._id]);
  console.log('spot: ', spot);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      return Alert.alert('Missing info', 'Select check-in and check-out dates');
    }

    if (guestCount > spot.maxGuests) {
      return Alert.alert('Limit exceeded', `Max guests: ${spot.maxGuests}`);
    }

    const totalAmount = dayjs(endDate).diff(dayjs(startDate), 'day') * spot.price;

    try {
        const siteId = spot?._id
      const res = await createBooking({
        siteId,
        startDate: dayjs(startDate).format('YYYY-MM-DD'),
        endDate: dayjs(endDate).format('YYYY-MM-DD'),
        guestCount,
        specialRequests,
        totalAmount,
      });

      navigation.navigate('PaymentConfirmation', {
        orderId: res.paymentDetails.orderId,
        amount: res.paymentDetails.amount,
        currency: res.paymentDetails.currency,
        bookingId: res.bookingId,
      });
    } catch (err) {
      Alert.alert('Error', 'Failed to book');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: spot.thumbnailImage }} style={styles.image} />
      <Text style={styles.title}>{spot.name}</Text>
      <Text>{spot.location}</Text>
      <Text style={styles.price}>₹{spot.price} / night</Text>

      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <Text style={styles.label}>Check-in Date</Text>
        <Text style={styles.input}>{startDate ? dayjs(startDate).format('MMM D, YYYY') : 'Select date'}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (date) setStartDate(date);
          }}
        />
      )}

      <TouchableOpacity onPress={() => setShowEndPicker(true)}>
        <Text style={styles.label}>Check-out Date</Text>
        <Text style={styles.input}>{endDate ? dayjs(endDate).format('MMM D, YYYY') : 'Select date'}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={(e, date) => {
            setShowEndPicker(Platform.OS === 'ios');
            if (date) setEndDate(date);
          }}
        />
      )}

      <Text style={styles.label}>Number of Guests</Text>
      <TextInput
        keyboardType="numeric"
        style={styles.textInput}
        value={guestCount.toString()}
        onChangeText={val => setGuestCount(Number(val))}
      />

      <Text style={styles.label}>Special Requests</Text>
      <TextInput
        multiline
        style={[styles.textInput, { height: 80 }]}
        value={specialRequests}
        onChangeText={setSpecialRequests}
        placeholder="Any specific requests?"
      />

      <TouchableOpacity style={styles.button} onPress={handleBooking}>
        <Text style={styles.buttonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 8,
  },
  label: {
    marginTop: 16,
    fontWeight: '600',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 14,
    marginTop: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookingScreen;
