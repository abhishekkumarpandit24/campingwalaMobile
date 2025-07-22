import React, { useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import { useBookingStore } from '../../store/booking'; 
import { Button, Card, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SpotDetailsNavigationProp } from '../../types/spotDetail';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'green';
    case 'pending':
      return 'orange';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

const getPaymentColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'green';
    case 'pending':
      return 'orange';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
};

const MyBookingsScreen = () => {
  const { bookings, loading, fetchBookings } = useBookingStore();
const navigation = useNavigation<SpotDetailsNavigationProp>();
  

  useEffect(() => {
    fetchBookings();
  }, []);

  const renderBooking = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Title
        title={item?.campingSpotId?.name}
        subtitle={item?.campingSpotId?.location}
        left={(props) => <Icon {...props} name="tent" size={30} />}
      />
      <Card.Content>
        <Text style={styles.dates}>
          🏕️ {dayjs(item.checkInDate).format('MMM D')} → {dayjs(item.checkOutDate).format('MMM D, YYYY')}
        </Text>
        <Text>Guests: {item.guestCount}</Text>
        <Text>Total: ₹{item.totalAmount}</Text>
        <View style={styles.statusRow}>
          <Chip style={{ backgroundColor: getStatusColor(item.status), marginRight: 6 }}>
            {item.status.toUpperCase()}
          </Chip>
          <Chip style={{ backgroundColor: getPaymentColor(item.paymentStatus) }}>
            {item.paymentStatus.toUpperCase()}
          </Chip>
        </View>
        {item.specialRequests ? (
          <Text style={styles.special}>📝 {item.specialRequests}</Text>
        ) : null}
      </Card.Content>
      {/* <Card.Actions style={styles.actions}>
        <Button onPress={() => navigation.navigate('BookingDetail', { id: item._id })}>
          View Details
        </Button>
        {item.status === 'confirmed' && (
          <Button onPress={() => navigation.navigate('CancelBooking', { id: item._id })} textColor="red">
            Cancel
          </Button>
        )}
      </Card.Actions> */}
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#528FF0" />
      </View>
    );
  }

  if (!bookings.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>You haven't made any bookings yet.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('Home')}>
          Book Now
        </Button>
      </View>
    );
  }

  return (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item._id}
      renderItem={renderBooking}
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
  },
  card: {
    marginBottom: 16,
    elevation: 3,
  },
  dates: {
    marginBottom: 6,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  special: {
    marginTop: 4,
    fontStyle: 'italic',
    color: '#555',
  },
  actions: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 12,
    color: '#888',
  },
});

export default MyBookingsScreen;
