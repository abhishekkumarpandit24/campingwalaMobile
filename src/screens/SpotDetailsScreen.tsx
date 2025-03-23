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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '../config/config';

const { width } = Dimensions.get('window');

// Define the camping spot type
interface CampingSpot {
  _id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  thumbnailImage: string;
  imageUrls: string[];
  category: string;
  // Add other properties as needed
}

// Define route param types
type RootStackParamList = {
  SpotDetails: { spot: CampingSpot };
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
  const { spot } = route.params;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // All images including thumbnail
  const allImages = [spot.thumbnailImage, ...spot.imageUrls].filter(Boolean);

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

  // Add these functions for image sliding
  const goToNextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    } else {
      setCurrentImageIndex(0); // Loop back to first image
    }
  };

  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    } else {
      setCurrentImageIndex(allImages.length - 1); // Loop to last image
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Image Carousel */}
        <View style={styles.imageContainer}>
          {allImages.length > 0 ? (
            <>
              <Image 
                source={{ uri: allImages[currentImageIndex] }} 
                style={styles.image} 
                resizeMode="cover"
              />
              
              {/* Image navigation arrows */}
              {allImages.length > 1 && (
                <>
                  <TouchableOpacity 
                    style={[styles.arrowButton, styles.leftArrow]}
                    onPress={goToPrevImage}
                  >
                    <Icon name="chevron-left" size={30} color="#fff" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.arrowButton, styles.rightArrow]}
                    onPress={goToNextImage}
                  >
                    <Icon name="chevron-right" size={30} color="#fff" />
                  </TouchableOpacity>
                </>
              )}
              
              {/* Image navigation dots */}
              {allImages.length > 1 && (
                <View style={styles.dotsContainer}>
                  {allImages.map((_, index) => (
                    <TouchableOpacity 
                      key={index}
                      style={[
                        styles.dot, 
                        currentImageIndex === index && styles.activeDot
                      ]}
                      onPress={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.noImageContainer}>
              <Icon name="image-not-supported" size={60} color="#ccc" />
              <Text style={styles.noImageText}>No images available</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.detailsContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{spot.name}</Text>
              <Text style={styles.location}>
                <Icon name="location-on" size={16} color="#666" /> {spot.location}
              </Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{spot.price}</Text>
              <Text style={styles.priceSubtext}>per night</Text>
            </View>
          </View>

          <View style={styles.categoryContainer}>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryText}>{spot.category || 'Standard'}</Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{spot.description}</Text>
          
          {/* Conditional rendering based on user role */}
          {user?.role === 'vendor' || true ? (
            <View style={styles.vendorActions}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEditSpot}
              >
                <Icon name="edit" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteSpot}
              >
                <Icon name="delete" size={18} color="#fff" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={handleBookNow}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    marginTop: StatusBar.currentHeight,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#666',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vendorActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noImageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  noImageText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: 10,
  },
  rightArrow: {
    right: 10,
  },
});

export default SpotDetailsScreen;
