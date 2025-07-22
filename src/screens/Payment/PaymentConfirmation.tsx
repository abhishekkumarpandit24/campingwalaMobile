import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, Button, StyleSheet } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import axios from 'axios';
import { API_URL } from '../../config/config';
import { SpotDetailsNavigationProp } from '../../types/spotDetail';
import { RAZORPAY_KEY_ID } from '@env'

const key = RAZORPAY_KEY_ID;


const PaymentConfirmationScreen = () => {
  const navigation = useNavigation<SpotDetailsNavigationProp>();
  const route = useRoute();
  const { token, user } = useAuthStore();

  const { orderId, amount, currency, bookingId }: any = route.params || {};

  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    if (!orderId || !bookingId) {
      Alert.alert('Error', 'Invalid payment details');
      navigation.goBack();
      return;
    }

    const initiatePayment = async () => {
      const options = {
        description: 'Camping Site Booking Payment',
        image: 'https://yourapp.com/logo.png',
        currency: currency || 'INR',
        key: key || '', // Razorpay public key
        amount: amount, // in paise
        name: 'Camping Wala',
        order_id: orderId,
        prefill: {
          email: user?.email,
          contact: user?.phoneNumber,
          name: user?.firstName + ' ' + user?.lastName,
        },
        theme: { color: '#528FF0' },
        notes: {
          bookingId,
          orderId,
        },
      };


      RazorpayCheckout.open(options)
        .then((response) => {
          verifyPayment(response);
        })
        .catch((error) => {
          console.error('Payment cancelled or failed:', error);
          setPaymentStatus('error');
          Alert.alert('Payment Cancelled', 'You cancelled the payment.');
        });
    };

    const verifyPayment = async (response: any) => {
      try {
        const verifyRes = await axios.post(
          `${API_URL}/bookings/verify-payment`,
          {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId,
          }
        );

        if (verifyRes.data.success) {
          setPaymentStatus('success');
          Alert.alert('Success', 'Payment completed successfully');
        } else {
          throw new Error(verifyRes.data.message);
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setPaymentStatus('error');
        Alert.alert('Payment Error', err?.message || 'Could not verify payment');
      }
    };

    initiatePayment();
  }, []);

  return (
    <View style={styles.container}>
      {paymentStatus === 'processing' && (
        <>
          <ActivityIndicator size="large" color="#528FF0" />
          <Text style={styles.text}>Processing payment...</Text>
        </>
      )}

      {paymentStatus === 'success' && (
        <>
          <Text style={styles.success}>✅ Payment Successful!</Text>
          <Text style={styles.text}>Booking ID: {bookingId}</Text>
          <Text style={styles.text}>Amount Paid: ₹{amount / 100}</Text>
          <Button title="Go to My Bookings" onPress={() => navigation.navigate('MyBookings')} />
        </>
      )}

      {paymentStatus === 'error' && (
        <>
          <Text style={styles.error}>❌ Payment Failed</Text>
          <Text style={styles.text}>Something went wrong with your payment.</Text>
          <Button title="Retry" onPress={() => setPaymentStatus('processing')} />
        </>
      )}
    </View>
  );
};

export default PaymentConfirmationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 16,
    marginVertical: 12,
    textAlign: 'center',
  },
  success: {
    fontSize: 20,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  error: {
    fontSize: 20,
    color: 'red',
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
