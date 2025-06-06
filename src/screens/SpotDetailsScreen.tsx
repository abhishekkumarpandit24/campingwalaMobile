import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '../config/config';

const { width, height } = Dimensions.get('window');

// Define the camping spot type with all available fields
interface CampingSpot {
  _id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  thumbnailImage: string;
  imageUrls: string[];
  category: string;
  isPetFriendly: boolean;
  isChildFriendly: boolean;
  hasElectricity: boolean;
  hasRunningWater: boolean;
  firewoodProvided: boolean;
  parkingAvailable: boolean;
  allowCampfires: boolean;
  allowBBQ: boolean;
  wheelchairAccessible: boolean;
  distanceFromCity: string;
  checkInTime: string;
  checkOutTime: string;
  emergencyContact: string;
  instagramHandle?: string;
  facebookPage?: string;
  petPolicy?: string;
  alcoholPolicy?: string;
  groupDiscount?: string;
  nearbyAttractions?: string[];
  rules?: string[];
  securityMeasures?: string[];
  accommodationType: string;
  numberOfUnits?: string;
  maxGuests?: string;
  minimumNights?: string;
  bedTypes?: string[];
  facilities?: string[];
  mealOptions?: {
    breakfast?: {
      available: boolean;
      isComplimentary: boolean;
      price?: number;
      timings?: string;
    };
    lunch?: {
      available: boolean;
      isComplimentary: boolean;
      price?: number;
      timings?: string;
    };
    dinner?: {
      available: boolean;
      isComplimentary: boolean;
      price?: number;
      timings?: string;
    };
  };
}

// Define route param types
type RootStackParamList = {
  SpotDetails: { spot: CampingSpot, requestId?: string, requestStatus?: string, setCampingRequests?: any };
  BookingScreen: { spot: CampingSpot };
  EditSpot: { spot: CampingSpot };
  // Add other screens as needed
};

type SpotDetailsRouteProp = RouteProp<RootStackParamList, 'SpotDetails'>;
type SpotDetailsNavigationProp = StackNavigationProp<RootStackParamList>;

const SpotDetailsScreen = () => {
  const navigation = useNavigation<SpotDetailsNavigationProp>();
  const route = useRoute<SpotDetailsRouteProp>();
  const { user, token } = useAuth();
  const { spot, requestId, requestStatus, setCampingRequests  } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);

  // All images including thumbnail
  const allImages = [spot.thumbnailImage, ...spot.imageUrls].filter(Boolean);

  const handleImagePress = (index: number) => {
    setCurrentImageIndex(index);
    setShowFullScreen(true);
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
  };

  const goToNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Navigate to booking screen
  const handleBookNow = () => {
    navigation.navigate('BookingScreen', { spot });
  };

  // Handle spot deletion (for vendors)
  const handleDeleteSpot = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this camping spot? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const endpoint = `${API_URL}/api/my-spots/${spot._id}`;
              await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
              });
              Alert.alert('Success', 'Camping spot deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting camping spot:', error);
              Alert.alert('Error', 'Failed to delete camping spot');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Navigate to edit spot (for vendors)
  const handleEditSpot = () => {
    navigation.navigate('EditSpot', { spot });
  };

  const handleApprove = async () => {
  try {
    setLoading(true);
    await axios.put(`${API_URL}/admin/spot-requests/${requestId}`, { status: 'approved'}, {
      headers: { Authorization: `Bearer ${token}` },
    });
      setCampingRequests((prev: any) => prev.filter((u: any) => u._id !== requestId));

    Alert.alert('Success', 'Request approved successfully');
    navigation.goBack(); // or navigate somewhere else
  } catch (error) {
    Alert.alert('Error', 'Failed to approve request');
  } finally {
    setLoading(false);
  }
};

const handleDecline = async () => {
  try {
    setLoading(true);
    await axios.put(`${API_URL}/admin/spot-requests/${requestId}`, { status: 'rejected'}, {
      headers: { Authorization: `Bearer ${token}` },
    });
      setCampingRequests((prev: any) => prev.filter((u: any) => u._id !== requestId));

    Alert.alert('Success', 'Request declined successfully');
    navigation.goBack(); // or navigate somewhere else
  } catch (error) {
    Alert.alert('Error', 'Failed to decline request');
  } finally {
    setLoading(false);
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.container}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => handleImagePress(currentImageIndex)}>
            <Image
              source={{ uri: allImages[currentImageIndex] }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnailContainer}>
            {allImages.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentImageIndex(index)}
                style={[
                  styles.thumbnailWrapper,
                  currentImageIndex === index && styles.selectedThumbnail,
                ]}
              >
                <Image source={{ uri: image }} style={styles.thumbnail} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Spot Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{spot.name}</Text>
          <Text style={styles.location}>{spot.location}</Text>
          <Text style={styles.price}>₹{spot.price} per night</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{spot.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accommodation Details</Text>
            <Text style={styles.detail}>Type: {spot.accommodationType}</Text>
            {spot.numberOfUnits && <Text style={styles.detail}>Units Available: {spot.numberOfUnits}</Text>}
            {spot.maxGuests && <Text style={styles.detail}>Max Guests: {spot.maxGuests}</Text>}
            {spot.minimumNights && <Text style={styles.detail}>Minimum Nights: {spot.minimumNights}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timings</Text>
            <Text style={styles.detail}>Check-in: {spot.checkInTime}</Text>
            <Text style={styles.detail}>Check-out: {spot.checkOutTime}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {spot.hasElectricity && (
                <View style={styles.amenityItem}>
                  <Icon name="power" size={24} color="#666" />
                  <Text style={styles.amenityText}>Electricity</Text>
                </View>
              )}
              {spot.hasRunningWater && (
                <View style={styles.amenityItem}>
                  <Icon name="water-drop" size={24} color="#666" />
                  <Text style={styles.amenityText}>Running Water</Text>
                </View>
              )}
              {spot.parkingAvailable && (
                <View style={styles.amenityItem}>
                  <Icon name="local-parking" size={24} color="#666" />
                  <Text style={styles.amenityText}>Parking</Text>
                </View>
              )}
              {spot.firewoodProvided && (
                <View style={styles.amenityItem}>
                  <Icon name="local-fire-department" size={24} color="#666" />
                  <Text style={styles.amenityText}>Firewood</Text>
                </View>
              )}
            </View>
          </View>

          {spot.facilities && spot.facilities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.tagContainer}>
                {spot.facilities.map((facility, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {spot.mealOptions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meal Options</Text>
              {spot.mealOptions.breakfast?.available && (
                <View style={styles.mealOption}>
                  <Text style={styles.mealType}>Breakfast</Text>
                  <Text style={styles.mealDetail}>
                    {spot.mealOptions.breakfast.isComplimentary 
                      ? 'Complimentary' 
                      : `₹${spot.mealOptions.breakfast.price}`}
                  </Text>
                  {spot.mealOptions.breakfast.timings && (
                    <Text style={styles.mealTiming}>{spot.mealOptions.breakfast.timings}</Text>
                  )}
                </View>
              )}
              {/* Similar blocks for lunch and dinner */}
            </View>
          )}

          {spot.rules && spot.rules.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rules</Text>
              {spot.rules.map((rule, index) => (
                <Text key={index} style={styles.bulletPoint}>• {rule}</Text>
              ))}
            </View>
          )}

          {spot.nearbyAttractions && spot.nearbyAttractions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nearby Attractions</Text>
              {spot.nearbyAttractions.map((attraction, index) => (
                <Text key={index} style={styles.bulletPoint}>• {attraction}</Text>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Policies</Text>
            {spot.petPolicy && <Text style={styles.detail}>Pet Policy: {spot.petPolicy}</Text>}
            {spot.alcoholPolicy && <Text style={styles.detail}>Alcohol Policy: {spot.alcoholPolicy}</Text>}
            {spot.groupDiscount && <Text style={styles.detail}>Group Discount: {spot.groupDiscount}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            <Text style={styles.detail}>Emergency: {spot.emergencyContact}</Text>
            {spot.instagramHandle && (
              <Text style={styles.detail}>Instagram: {spot.instagramHandle}</Text>
            )}
            {spot.facebookPage && (
              <Text style={styles.detail}>Facebook: {spot.facebookPage}</Text>
            )}
          </View>
        </View>

        {/* Booking Button */}
        {/* <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity> */}

        {/* Vendor Actions */}
        {user?.userType === 'vendor' && (
          <View style={styles.vendorActions}>
            <TouchableOpacity style={styles.editButton} onPress={handleEditSpot}>
              <Text style={styles.editButtonText}>Edit Spot</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteSpot}>
              <Text style={styles.deleteButtonText}>Delete Spot</Text>
            </TouchableOpacity>
          </View>
        )}

        {user?.userType === "admin" && requestId && (
  <View style={styles.actionButtonsContainer}>
    <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove()}>
      <Text style={styles.actionButtonText}>Approve</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline()}>
      <Text style={styles.actionButtonText}>Decline</Text>
    </TouchableOpacity>
  </View>
)}
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal visible={showFullScreen} transparent={true} onRequestClose={closeFullScreen}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeFullScreen}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <View style={styles.imageControls}>
            <TouchableOpacity onPress={goToPrevImage} style={styles.controlButton}>
              <Icon name="chevron-left" size={40} color="#fff" />
            </TouchableOpacity>
            <Image
              source={{ uri: allImages[currentImageIndex] }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={goToNextImage} style={styles.controlButton}>
              <Icon name="chevron-right" size={40} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  thumbnailContainer: {
    height: 70,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  thumbnailWrapper: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedThumbnail: {
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  detailsContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 16,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  mealOption: {
    marginBottom: 12,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  mealTiming: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  bulletPoint: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  vendorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 32,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  imageControls: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  controlButton: {
    padding: 20,
  },
  fullScreenImage: {
    width: width - 100,
    height: height - 200,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  approveButton: {
    backgroundColor: 'green',
    padding: 12,
    borderRadius: 8,
  },
  declineButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SpotDetailsScreen;
