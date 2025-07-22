import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config/config';
import { Button } from 'react-native-paper'; // Or use your preferred button
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigation';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuthStore } from '../store/auth';
import { approveUser, fetchPendingCampingRequests, fetchPendingUserRequests, rejectUser } from '../services/user.api';
type NavigationProp = StackNavigationProp<RootStackParamList>;
const PendingRequestsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [userRequests, setUserRequests] = useState([]);
  const [campingRequests, setCampingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>({});
  const [modalVisible, setModalVisible] = useState(false);
  const { token } = useAuthStore();

 const fetchRequests = async () => {
  try {
    const [userResult, campingResult] = await Promise.allSettled([
      fetchPendingUserRequests(),
      fetchPendingCampingRequests(),
    ]);

    if (userResult.status === 'fulfilled') {
      setUserRequests(userResult.value);
    }

    if (campingResult.status === 'fulfilled') {
      setCampingRequests(campingResult.value);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchRequests();
  }, []);

  const handleReview = (user: any) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

 const handleApprove = async () => {
  if (!selectedUser) return;
  try {
    await approveUser(selectedUser._id);
    setUserRequests(prev => prev.filter((u: any) => u._id !== selectedUser._id));
    setModalVisible(false);
  } catch (error) {
    console.error("Approval failed", error);
  }
};

const handleDecline = async () => {
  if (!selectedUser) return;
  try {
    await rejectUser(selectedUser._id);
    setUserRequests(prev => prev.filter((u: any) => u._id !== selectedUser._id));
    setModalVisible(false);
  } catch (error) {
    console.error("Decline failed", error);
  }
};
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }
  
  const handleReviewSpotRequest = (item: any) => {
    navigation.navigate<any>('SpotDetails', { spot: item?.spotDetails, requestId: item._id,
      requestStatus: item.status, setCampingRequests: setCampingRequests });
    };
    
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>User Pending Requests</Text>
      <FlatList
        data={userRequests}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.firstName} {item.lastName}</Text>
            <Text>{item.email}</Text>
            <Text>Status: {item.status}</Text>
            <Button mode="contained" onPress={() => handleReview(item)} style={styles.reviewBtn}>
              Review
            </Button>
          </View>
        )}
        ListEmptyComponent={<Text>No user pending requests.</Text>}
      />

     

      {/* Modal for review */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Review User</Text>
              {selectedUser && (
                <>
                  <Text>Name: {selectedUser.firstName} {selectedUser.lastName}</Text>
                  <Text>Email: {selectedUser.email}</Text>
                  <Text>Phone: {selectedUser.phoneNumber}</Text>
                  <Text>Business Name: {selectedUser.businessName}</Text>
                  <Text>Business Contact: {selectedUser.businessContact}</Text>
                  <Text>Business Address: {selectedUser.businessAddress}</Text>
                  <Text>Email Verified: {selectedUser.isEmailVerified ? 'Yes' : 'No'}</Text>
                  <Text>Phone Verified: {selectedUser.isPhoneVerified ? 'Yes' : 'No'}</Text>
                  <Text>User Type: {selectedUser.userType}</Text>
                </>
              )}
              <View style={styles.modalButtons}>
               <TouchableOpacity style={styles.approveButton} onPress={handleApprove}>
  <Text style={styles.buttonText}>Approve</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.declineButton} onPress={handleDecline}>
  <Text style={styles.buttonText}>Decline</Text>
</TouchableOpacity>
              </View>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.closeText}>Close</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Text style={styles.heading}>Camping Pending Requests</Text>

       <FlatList
        data={campingRequests}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item?.spotDetails?.name} {item?.spotDetails?.location}</Text>
            <Text>{item?.spotDetails?.price}</Text>
            <Text>Status: {item.status}</Text>
            <Button mode="contained" onPress={() => handleReviewSpotRequest(item)} style={styles.reviewBtn}>
              Review
            </Button>
          </View>
        )}
        ListEmptyComponent={<Text>No camping pending requests.</Text>}
      />
    </View>
  );
};

export default PendingRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  approveBtn: {
    backgroundColor: '#4CAF50',
    color: 'white'
  },
  declineBtn: {
    borderColor: 'red',
    borderWidth: 1,
    color: 'white'
  },
  closeText: {
    color: 'blue',
    textAlign: 'center',
    marginTop: 10,
  },
  buttonText: {
  color: '#ffffff', // white text
  fontWeight: 'bold',
  textAlign: 'center',
},

approveButton: {
  backgroundColor: '#4CAF50', // green
  padding: 10,
  borderRadius: 6,
  marginVertical: 4,
},

declineButton: {
  backgroundColor: '#F44336', // red
  padding: 10,
  borderRadius: 6,
  marginVertical: 4,
},

});
