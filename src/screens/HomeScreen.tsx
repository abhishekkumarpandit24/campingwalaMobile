// campingwalaMobile/src/screens/HomeScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { IconButton } from 'react-native-paper';
import AppIcon from '../components/AppIcon';

// Define the camping spot type based on your backend model
interface CampingSpot {
  _id: string;
  name: string;
  location: string;
  price: number;
  description: string;
  thumbnailImage: string;
  imageUrls: string[];
  category: string;
  amenities: string[];
  isPetFriendly: boolean;
  isChildFriendly: boolean;
}

// Define your navigation param list
type RootStackParamList = {
  Home: undefined;
  SpotDetails: { spot: CampingSpot };
  AddSpot: undefined;
  EditSpot: { spot: CampingSpot };
  // Add other screens as needed
};

// Create a typed navigation hook
type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const [campingSpots, setCampingSpots] = useState<CampingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, token, logout } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
console.log(user, "userFromHomeScreen")
  // Function to fetch camping spots
  const fetchCampingSpots = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if token exists
      if (!token) {
        console.log("No token found, redirecting to login");
        Alert.alert(
          "Authentication Required",
          "Please login to view camping spots.",
          [{ text: "OK", onPress: () => logout() }]
        );
        return;
      }
      
      console.log("Using token for API call:", token);
      
      // Make sure the endpoint is correctly formatted
      const endpoint = token 
        ? `${API_URL}/api/my-spots` 
        : `${API_URL}/api/camping-spots`;
      
      console.log("Calling endpoint:", endpoint);
      
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000 // 5 second timeout
      };
      
      try {
        const response = await axios.get(endpoint, config);
        console.log("API response:", response.data);
        setCampingSpots(response.data);
      } catch (error: any) {
        console.error('Error fetching camping spots:', error);
        
        // Check for authentication errors (401 Unauthorized)
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          console.log("Token invalid or expired, redirecting to login");
          Alert.alert(
            "Session Expired",
            "Your session has expired. Please login again.",
            [{ text: "OK", onPress: () => logout() }]
          );
          return;
        }
        
        // Show error alert
        Alert.alert('Error', 'Failed to load camping spots. Please check your connection.');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, token, logout]);

  // Refresh the list when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log("Screen focused, fetching camping spots with token:", token);
      fetchCampingSpots();
    }, [fetchCampingSpots])
  );

  // Pull to refresh functionality
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCampingSpots();
  }, [fetchCampingSpots]);

  // Handle spot deletion (for vendors)
  const handleDeleteSpot = async (spotId: string) => {
    // Check if token exists
    if (!token) {
      Alert.alert(
        "Session Expired",
        "Your session has expired. Please login again.",
        [{ text: "OK", onPress: () => logout() }]
      );
      return;
    }
    
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
              const endpoint = `${API_URL}/api/my-spots/${spotId}`;
              await axios.delete(endpoint, {
                headers: { Authorization: `Bearer ${token}` }
              });
              // Remove the deleted spot from the list
              setCampingSpots(prevSpots => 
                prevSpots.filter(spot => spot._id !== spotId)
              );
              Alert.alert('Success', 'Camping spot deleted successfully');
            } catch (error) {
              console.error('Error deleting camping spot:', error);
              
              // Check for authentication errors
              if (axios.isAxiosError(error) && error.response?.status === 401) {
                Alert.alert(
                  "Session Expired",
                  "Your session has expired. Please login again.",
                  [{ text: "OK", onPress: () => logout() }]
                );
                return;
              }
              
              Alert.alert('Error', 'Failed to delete camping spot');
            }
          }
        }
      ]
    );
  };

  // Navigate to spot details
  const navigateToSpotDetails = (spot: CampingSpot) => {
    navigation.navigate('SpotDetails', { spot });
  };

  // Navigate to edit spot (for vendors)
  const navigateToEditSpot = (spot: CampingSpot) => {
    navigation.navigate('EditSpot', { spot });
  };

  // Navigate to add new spot (for vendors)
  const navigateToAddSpot = () => {
    navigation.navigate('AddSpot');
  };

  // Render each camping spot card
  const renderCampingSpot = ({ item }: { item: CampingSpot }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => navigateToSpotDetails(item)}
    >
      <Image 
        source={{ uri: item.thumbnailImage || 'https://via.placeholder.com/150' }} 
        style={styles.thumbnail}
      />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.price}>₹{item.price}/night</Text>
        
        <View style={styles.tagsContainer}>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          {item.isPetFriendly && (
            <View style={styles.featureTag}>
              <AppIcon name="pets" size={14} color="#555" />
              <Text style={styles.featureText}>Pet Friendly</Text>
            </View>
          )}
        </View>
      </View>
      
      {user?.role === 'vendor' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => navigateToEditSpot(item)}
          >
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteSpot(item._id)}
          >
            <Icon name="delete" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render skeleton loader
  const renderSkeletonLoader = () => (
    <View style={styles.listContainer}>
      {[1, 2, 3].map((_, index) => (
        <SkeletonPlaceholder key={index} borderRadius={4} speed={800}>
          <View style={styles.card}>
            <View style={styles.thumbnail} />
            <View style={styles.cardContent}>
              <View style={{ width: '70%', height: 20, marginBottom: 10 }} />
              <View style={{ width: '40%', height: 15, marginBottom: 10 }} />
              <View style={{ width: '30%', height: 15, marginBottom: 15 }} />
              <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 60, height: 25, borderRadius: 4, marginRight: 10 }} />
                <View style={{ width: 100, height: 25, borderRadius: 4 }} />
              </View>
            </View>
          </View>
        </SkeletonPlaceholder>
      ))}
    </View>
  );

  // Render empty state
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {!loading && (
        <>
          <Icon name="nature-people" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No camping spots found</Text>
          {user?.role === 'vendor' && (
            <TouchableOpacity 
              style={styles.addButton}
              onPress={navigateToAddSpot}
            >
              <Text style={styles.addButtonText}>Add Your First Spot</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.role === 'vendor' ? 'My Camping Spots' : 'Discover Camping Spots'}
        </Text>
        {token && (
          <TouchableOpacity 
            style={styles.addSpotButton}
            onPress={() => logout()}
          >

            <Icon name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        )}
        {user?.role === 'vendor' && (
          <TouchableOpacity 
            style={styles.addSpotButton}
            onPress={navigateToAddSpot}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? (
        renderSkeletonLoader()
      ) : (
        <FlatList
          data={campingSpots}
          renderItem={renderCampingSpot}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: StatusBar.currentHeight,

    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4CAF50',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addSpotButton: {
    backgroundColor: '#388E3C',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding at bottom for better scrolling
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
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
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#555',
    marginLeft: 4,
  },
  actionButtons: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#2196F3',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;