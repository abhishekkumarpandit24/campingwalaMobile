import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { Button } from 'react-native-paper'
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../store/auth';
import { deleteSpotRequestByAdmin, fetchAllCampingSpots } from '../services/camping.api';
type RootStackParamList = {
  EditSpot: { spot: any };
};
type SpotDetailsNavigationProp = StackNavigationProp<RootStackParamList>;
const ManageSpotsScreen = () => {
  const { token } = useAuthStore();
   const navigation = useNavigation<SpotDetailsNavigationProp>();
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    try {
      const response: any = await fetchAllCampingSpots()
      setSpots(response);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to fetch spots');
    }
  };

  const handleDelete = async (id: string) => {
  try {
    await deleteSpotRequestByAdmin(id);
    Alert.alert('Success', 'Spot deleted successfully');
    fetchSpots();
  } catch (err) {
    Alert.alert('Error', 'An error occurred while deleting the spot');
  }
};

  const handleEdit = (spot: any) => {
    navigation.navigate('EditSpot', { spot: {...spot, requestId: spot?._id, fetchSpots: fetchSpots} });
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
            <Text style={styles.cardText}>{item?.name} {item?.location}</Text>
            <Text>{item?.price}</Text>
            {/* <Text>Status: {item.status}</Text> */}
            {/* <Text>Vendor name: {`${item.ownerId?.firstName} ${item.ownerId?.lastName}`}</Text>
            <Text>Vendor email: {`${item.ownerId?.email}`}</Text> */}
            <Button mode="contained" onPress={() => handleEdit(item)} style={styles.reviewBtn}>
              Edit
            </Button>
        
            <Button mode="contained" onPress={() => handleDelete(item._id)} style={styles.reviewBtn}>
              Delete
            </Button>
          </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Spots</Text>
      <FlatList
        data={spots}
        keyExtractor={(item: any) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ManageSpotsScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewBtn: {
    marginTop: 10,
  },
});

