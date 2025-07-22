import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  StatusBar
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import AppIcon from '../components/AppIcon';
import TopBar from '../components/Topbar';
import { useAuthStore } from '../store/auth';
import { fetchAllCampingSpots, fetchVendorCampingData } from '../services/camping.api';

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
  status?: string
}

type RootStackParamList = {
  Home: undefined;
  SpotDetails: { spot: CampingSpot };
  AddSpot: undefined;
  EditSpot: { spot: CampingSpot };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const [campingSpots, setCampingSpots] = useState<CampingSpot[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user, token, logout, loadStoredAuth } = useAuthStore();
  console.log('user: ', user);
  const navigation = useNavigation<NavigationProp>();
  const [searchText, setSearchText] = useState('');
  const [filteredSpots, setFilteredSpots] = useState(campingSpots);

  useEffect(() => {
    const filtered = campingSpots.filter(spot =>
      spot.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredSpots(filtered);
  }, [searchText, campingSpots]);


const fetchCampingSpots = useCallback(async () => {
  if (!token) {
    Alert.alert('Authentication Required', 'Please login to view camping spots.', [
      { text: 'OK', onPress: logout },
    ]);
    return;
  }

  setLoading(true);

  try {
    const spots = user?.userType === 'vendor'
      ? await fetchVendorCampingData()
      : await fetchAllCampingSpots();

    setCampingSpots(spots);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      Alert.alert('Session Expired', 'Please login again.', [{ text: 'OK', onPress: logout }]);
    } else {
      Alert.alert('Error', 'Failed to fetch spots. Check your connection.');
    }
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [token, user?.userType, logout]);



  useFocusEffect(useCallback(() => { fetchCampingSpots(); }, [fetchCampingSpots]));
  const onRefresh = () => { setRefreshing(true); fetchCampingSpots(); };

  const renderCampingSpot = ({ item }: { item: CampingSpot }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SpotDetails', { spot: item })}>

      {/* 🟡 Ribbon Badge for Pending */}
      {item.status === 'pending' && (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>Pending</Text>
        </View>
      )}

      <Image source={{ uri: item.thumbnailImage || 'https://via.placeholder.com/150' }} style={styles.thumbnail} />

      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.price}>₹{item.price}/night</Text>
        <View style={styles.tagsContainer}>
          <View style={styles.categoryTag}><Text style={styles.categoryText}>{item.category}</Text></View>
          {item.isPetFriendly && (
            <View style={styles.featureTag}>
              <AppIcon name="pets" size={14} color="#555" />
              <Text style={styles.featureText}>Pet Friendly</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );


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
                <View style={{ width: 60, height: 25, marginRight: 10 }} />
                <View style={{ width: 100, height: 25 }} />
              </View>
            </View>
          </View>
        </SkeletonPlaceholder>
      ))}
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      {!loading && (
        <>
          <Icon name="nature-people" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No camping spots found</Text>
          {user?.role === 'vendor' && (
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AddSpot')}>
              <Text style={styles.addButtonText}>Add Your First Spot</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar
        searchText={searchText}
        setSearchText={setSearchText}
        user={user}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {user?.userType === 'vendor' ? 'My Camping Spots' : 'Discover Camping Spots'}
        </Text>

        {user?.userType === 'vendor' && (
          <TouchableOpacity style={styles.addSpotButton} onPress={() => navigation.navigate('AddSpot')}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {loading && !refreshing ? renderSkeletonLoader() : (
        <FlatList
          data={filteredSpots}
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
    margin: 'auto',
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
  // // container: {
  // //   flex: 1,
  // //   backgroundColor: '#f5f5f9',
  // // },
  // cardContainer: {
  //   paddingHorizontal: 8,
  // },
  // image: {
  //   width: 250,
  //   height: 160,
  //   borderRadius: 8,
  // },
  // thumb: {
  //   marginRight: 16,
  // },
  // description: {
  //   fontSize: 14,
  //   color: '#666',
  // },
  ribbon: {
    position: 'absolute',
    top: 10,
    left: -30,
    backgroundColor: '#FFAA00',
    paddingVertical: 2,
    paddingHorizontal: 40,
    transform: [{ rotate: '-45deg' }],
    zIndex: 1,
  },

  ribbonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },

});

export default HomeScreen;
