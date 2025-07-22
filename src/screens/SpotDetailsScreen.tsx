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
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import axios from 'axios';
import { API_URL } from '../config/config';
import { SpotDetailsNavigationProp, SpotDetailsRouteProp } from '../types/spotDetail';
import { useAuthStore } from '../store/auth';
import { approveCampingRequest, deleteCampingSpot, rejectCampingRequest } from '../services/camping.api';

const { width, height } = Dimensions.get('window');

const SpotDetailsScreen = () => {
  const navigation = useNavigation<SpotDetailsNavigationProp>();
  const route = useRoute<SpotDetailsRouteProp>();
  const { user, token, userType } = useAuthStore();
  const { spot, requestId, requestStatus, setCampingRequests } = route.params;
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
            await deleteCampingSpot(spot);

            Alert.alert(
              'Success',
              spot?.status === 'approved'
                ? 'Delete request submitted for admin approval'
                : 'Camping spot deleted successfully'
            );

            navigation.goBack();
          } catch (error) {
            console.error('Error deleting camping spot:', error);
            Alert.alert('Error', 'Failed to delete camping spot');
          } finally {
            setLoading(false);
          }
        },
      },
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
    await approveCampingRequest(requestId);
    setCampingRequests((prev: any) => prev.filter((u: any) => u._id !== requestId));

    Alert.alert('Success', 'Request approved successfully');
    navigation.goBack();
  } catch (error) {
    console.error('Approval error:', error);
    Alert.alert('Error', 'Failed to approve request');
  } finally {
    setLoading(false);
  }
};

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  const handleDecline = async () => {
  if (!rejectionReason.trim()) {
    Alert.alert('Reason Required', 'Please provide a reason for rejection.');
    return;
  }

  try {
    setLoading(true);
    if(requestId){
      await rejectCampingRequest(requestId, rejectionReason);
    }

    setCampingRequests((prev: any) => prev.filter((u: any) => u._id !== requestId));
    setShowRejectionModal(false);
    Alert.alert('Success', 'Request declined successfully');
    navigation.goBack();
  } catch (error) {
    console.error('Rejection error:', error);
    Alert.alert('Error', 'Failed to decline request');
  } finally {
    setLoading(false);
    setRejectionReason('');
  }
};


  // const displayedKeys = new Set([
  //   'name', 'location', 'price', 'description', 'category', 'discount',
  //   'distanceFromCity', 'bestSeasonToVisit', 'bedTypes', 'cancellationPolicy',
  //   'accommodationType', 'numberOfUnits', 'maxGuests', 'minimumNights',
  //   'checkInTime', 'checkOutTime', 'hasElectricity', 'hasRunningWater',
  //   'parkingAvailable', 'firewoodProvided', 'facilities', 'mealOptions',
  //   'rules', 'nearbyAttractions', 'petPolicy', 'alcoholPolicy',
  //   'groupDiscount', 'emergencyContact', 'instagramHandle', 'facebookPage',
  //   'imageUrls', 'thumbnailImage', 'videoUrls', 'status', 'isChildFriendly', 'isPetFriendly',
  //   'allowCampfires', 'allowBBQ', 'createdAt', '_id', '__v', 'updatedAt', 'latitude', 'longitude',
  //   'seasonalPricing', 'wheelchairAccessible', 'originalSpotId', 'pricingOptions', 'availability', 'ownerId',
  //   'extraCharges', 'securityMeasures', 'tags', 'activitiesAvailable', 'acceptedPaymentMethods', 'amenities',
  //   'refundPolicy', 'numberOfTentsAllowed', 'specialOffers', 'averageTemperature', 'averageRating', 'reviews'
  // ]);

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
            <Text style={[styles.sectionTitle]}>{spot.category}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Average Rating</Text>
            <View style={styles.ratingRow}>
              {/* Stars */}
              {Array.from({ length: 5 }).map((_, index) => (
                <Icon
                  key={`${index + 1}`}
                  name={index < Math.floor(spot?.averageRating ?? 0) ? 'star' : 'star-border'}
                  size={24}
                  color="#f4c430" // gold/yellow
                />
              ))}
              {/* Rating Value */}
              <Text style={styles.ratingValue}>{spot?.averageRating?.toFixed(1) ?? '0.0'}</Text>
            </View>

            {/* <View style={styles.section}>
              <Text style={styles.sectionTitle}>User Reviews</Text>

              {spot?.reviews?.length > 0 ? (
                spot?.reviews.slice(0, 3).map((review: any, index: any) => (
                  <View key={index} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarInitial}>
                          {review?.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
                        </Text>
                      </View>

                      
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.reviewerName}>{review?.user?.name ?? 'Anonymous'}</Text>
                        <View style={styles.ratingRow}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Icon
                              key={i}
                              name={i < Math.floor(review.rating) ? 'star' : 'star-border'}
                              size={18}
                              color="#f4c430"
                            />
                          ))}
                          <Text style={styles.reviewDate}>{formatDate(review?.date)}</Text>
                        </View>
                      </View>
                    </View>

                   
                    <Text style={styles.reviewText}>{review?.text}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noReview}>No reviews available</Text>
              )}
            </View> */}

          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latitude</Text>
            <Text style={styles.description}>{spot.latitude}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Longitude</Text>
            <Text style={styles.description}>{spot.longitude}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Discount</Text>
            <Text style={styles.description}>{spot.discount}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{spot.description}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Average Temperature</Text>
            <Text style={styles.description}>{spot.averageTemperature}</Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Accommodation Details</Text>
            <Text style={styles.detail}>Type: {spot.accommodationType}</Text>
            {spot.numberOfUnits && <Text style={styles.detail}>Units Available: {spot.numberOfUnits}</Text>}
            {spot.maxGuests && <Text style={styles.detail}>Max Guests: {spot.maxGuests}</Text>}
            {spot.minimumNights && <Text style={styles.detail}>Minimum Nights: {spot.minimumNights}</Text>}
            {spot.numberOfTentsAllowed && <Text style={styles.detail}>Maximum number of {spot.accommodationType} allowed: {spot.numberOfTentsAllowed}</Text>}

          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timings</Text>
            <Text style={styles.detail}>Check-in: {spot.checkInTime}</Text>
            <Text style={styles.detail}>Check-out: {spot.checkOutTime}</Text>
          </View>

          {spot?.pricingOptions?.length > 0 && <Text style={styles.sectionTitle}>Pricing Options</Text>}
          {spot?.pricingOptions?.map((item: any) => (<View style={styles.section}>
            <Text style={styles.detail}>{item?.occupancyType}: ₹{item?.pricePerPerson}/- price per person</Text>

          </View>))}

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
              {spot?.isPetFriendly && (
                <View style={styles.amenityItem}>
                  <Icon name="pets" size={24} color="#666" />
                  <Text style={styles.amenityText}>Pet Allowed</Text>
                </View>
              )}

              {spot?.isChildFriendly && (
                <View style={styles.amenityItem}>
                  <Icon name="child-friendly" size={24} color="#666" />
                  <Text style={styles.amenityText}>Child Friendly</Text>
                </View>
              )}

              {spot?.allowCampfires && (
                <View style={styles.amenityItem}>
                  <Icon name="whatshot" size={24} color="#666" />
                  <Text style={styles.amenityText}>Campfires</Text>
                </View>
              )}

              {spot?.allowBBQ && (
                <View style={styles.amenityItem}>
                  <Icon name="outdoor-grill" size={24} color="#666" />
                  <Text style={styles.amenityText}>Barbecue</Text>
                </View>
              )}
              {spot?.wheelchairAccessible && (
                <View style={styles.amenityItem}>
                  <Icon name="accessible" size={24} color="#666" />
                  <Text style={styles.amenityText}>Wheel Chair</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>Seasonal Pricing</Text>
          {spot?.seasonalPricing?.map((item: any) => (<View style={styles.section}>
            <Text style={styles.detail}>{item?.season}: ₹{item?.pricing}</Text>
          </View>))}

          {spot?.availability?.length > 0 && (<>
            <Text style={styles.sectionTitle}>Available Dates</Text>
            {spot?.availability?.map((item: any, index: number) => {
              const formattedDate = new Intl.DateTimeFormat('en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }).format(new Date(item?.date));

              return (
                <View key={index} style={styles.section}>
                  <Text style={styles.detail}>{formattedDate}</Text>
                </View>
              );
            })}
          </>)}


          {spot.facilities && spot.facilities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Facilities</Text>
              <View style={styles.tagContainer}>
                {spot.facilities.map((facility, index) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {spot.bedTypes && spot.bedTypes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Bed Types</Text>
              <View style={styles.tagContainer}>
                {spot.bedTypes.map((facility, index) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {(['breakfast', 'lunch', 'dinner'] as const).map((meal) => {
            const option: any = spot?.mealOptions?.[meal]; // TS infers this as one of the valid keys

            if (!option?.available) return null;

            return (
              <View key={meal} style={styles.mealOption}>
                <Text style={styles.mealType}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>
                <Text style={styles.mealDetail}>
                  {option.isComplimentary ? 'Complimentary' : `₹${option.price}`}
                </Text>
                {option.timings && (
                  <Text style={styles.mealTiming}>
                    {typeof option.timings === 'string'
                      ? option.timings
                      : `${option.timings?.start} - ${option?.timings?.end}`}
                  </Text>
                )}
                {option.description?.split()?.map((facility: any, index: any) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
              </View>
            );
          })}



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
            {spot.cancellationPolicy && <Text style={styles.detail}>Cancellation Policy: {spot.cancellationPolicy}</Text>}
            {spot.extraCharges && <Text style={styles.detail}>Extra charges: {spot.extraCharges}</Text>}
            {spot.refundPolicy && <Text style={styles.detail}>Refund policy: {spot.refundPolicy}</Text>}


          </View>

          {spot.activitiesAvailable && spot.activitiesAvailable.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activities Available</Text>
              <View style={styles.tagContainer}>
                {spot.activitiesAvailable.map((method, index) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{method}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {spot.tags && spot.tags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.tagContainer}>
                {spot.tags.map((tag, index) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {spot.bestSeasonToVisit && spot.bestSeasonToVisit.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Best season to visit</Text>
              <View style={styles.tagContainer}>
                {spot.bestSeasonToVisit.map((facility, index) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {spot.amenities && spot.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.tagContainer}>
                {spot.amenities?.map((facility: any, index: any) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {spot.securityMeasures && spot.securityMeasures.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Measures</Text>
              <View style={styles.tagContainer}>
                {spot.securityMeasures.map((facility, index) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {spot.acceptedPaymentMethods && spot.acceptedPaymentMethods.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Accepted Payment Methods</Text>
              <View style={styles.tagContainer}>
                {spot.acceptedPaymentMethods.map((method, index) => (
                  <View key={`${index + 1}`} style={styles.tag}>
                    <Text style={styles.tagText}>{method}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distance from city</Text>
            <Text style={styles.description}>{spot.distanceFromCity}</Text>
          </View>

          {spot?.specialOffers && <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special offers</Text>
            <Text style={styles.description}>{spot.specialOffers}</Text>
          </View>}


        </View>
        {/* <View style={[styles.section, { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 12 }]}>
          
          {Object.entries(spot)
            .filter(([key]) => !displayedKeys.has(key))
            .map(([key, value]) => (
              <View
                key={key}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                }}
              >
                <Text style={{ fontWeight: '600', color: '#333', marginBottom: 4 }}>
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>

                {Array.isArray(value) ? (
                  value.length === 0 ? (
                    <Text style={{ color: '#888' }}>Not available</Text>
                  ) : (
                    value.map((item, idx) => (
                      <Text key={idx} style={{ color: '#444', paddingLeft: 6 }}>• {String(item)}</Text>
                    ))
                  )
                ) : typeof value === 'object' && value !== null ? (
                  Object.entries(value).map(([subKey, subVal], idx) => (
                    <Text key={idx} style={{ color: '#444', paddingLeft: 6 }}>
                      {subKey}: {typeof subVal === 'object' ? JSON.stringify(subVal) : String(subVal)}
                    </Text>
                  ))
                ) : (
                  <Text style={{ color: '#444' }}>{String(value)}</Text>
                )}
              </View>
            ))}
        </View> */}

        {/* Booking Button */}
        {userType === "customer" && (
  <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
    <Text style={styles.bookButtonText}>Book Now</Text>
  </TouchableOpacity>
)}

        {/* Vendor Actions */}
        {user?.userType === 'vendor'
          // && spot?.status === "pending"
          && (
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
            {/* <TouchableOpacity style={styles.declineButton} onPress={() => handleDecline()}>
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.declineButton} onPress={() => setShowRejectionModal(true)}>
              <Text style={styles.actionButtonText}>Decline</Text>
            </TouchableOpacity>

          </View>
        )}

        <Modal
          visible={showRejectionModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRejectionModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rejection Reason</Text>
              <TextInput
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Enter reason for rejection"
                multiline
                numberOfLines={4}
                style={styles.modalInput}
                placeholderTextColor="#888"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setShowRejectionModal(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDecline} style={styles.submitButton}>
                  <Text style={styles.submitText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingValue: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontWeight: 'bold',
    color: '#555',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  reviewDate: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  reviewText: {
    marginTop: 4,
    fontSize: 14,
    color: '#444',
  },
  noReview: {
    fontStyle: 'italic',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '100%',
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },

  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },

  cancelButton: {
    marginRight: 10,
  },

  cancelText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },

  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },

  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },


});

export default SpotDetailsScreen;
