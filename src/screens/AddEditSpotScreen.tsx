// campingwalaMobile/src/screens/AddEditSpotScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
  Button
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker, List, Input } from '@ant-design/react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '../store/auth';
import {
  submitVendorPendingUpdate,
  createVendorUpdateRequest,
  updateAdminSpot,
  createNewVendorSpotRequest,
  uploadCampingImage,
} from '../services/camping.api';

function formatTime(date: Date) {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}
const AddEditSpotScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { spot }: any = route.params ?? {};
  const { token, userType } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [pricingOptions, setPricingOptions] = useState<any>([]);
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [discount, setDiscount] = useState('');
  const [facilities, setFacilities] = useState<any>([]);
  const [hasElectricity, setHasElectricity] = useState(true);
  const [hasRunningWater, setHasRunningWater] = useState(true);
  const [firewoodProvided, setFirewoodProvided] = useState(false);
  const [parkingAvailable, setParkingAvailable] = useState(true);
  const [bedTypes, setBedTypes] = useState<any>([]);
  const [numberOfTentsAllowed, setNumberOfTentsAllowed] = useState('');
  const [securityMeasures, setSecurityMeasures] = useState<any>([]);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [availability, setAvailability] = useState<{ date: string; isBooked: boolean }[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [minimumNights, setMinimumNights] = useState('');
  const [extraCharges, setExtraCharges] = useState('');
  const [averageRating, setAverageRating] = useState('');
  const [reviews, setReviews] = useState<any>([]);
  const [rules, setRules] = useState<any>([]);
  const [allowCampfires, setAllowCampfires] = useState(false);
  const [allowBBQ, setAllowBBQ] = useState(false);
  const [nearbyAttractions, setNearbyAttractions] = useState<any>([]);
  const [distanceFromCity, setDistanceFromCity] = useState('');
  const [videoUrls, setVideoUrls] = useState<any>([]);
  const [instagramHandle, setInstagramHandle] = useState('');
  const [facebookPage, setFacebookPage] = useState('');
  const [mealOptions, setMealOptions] = useState<any>({
    breakfast: {
      available: false,
      price: 0,
      description: '',
      timings: { start: '', end: '' },
      isComplimentary: false
    },
    lunch: {
      available: false,
      price: 0,
      description: '',
      timings: { start: '', end: '' },
      isComplimentary: false
    },
    dinner: {
      available: false,
      price: 0,
      description: '',
      timings: { start: '', end: '' },
      isComplimentary: false
    }
  });


  const [tags, setTags] = useState<any>([]);
  const [seasonalPricing, setSeasonalPricing] = useState<any>([]);
  const [groupDiscount, setGroupDiscount] = useState('');
  const [accommodationType, setAccomodationType] = useState<any>('');
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<any>([]);
  const [refundPolicy, setRefundPolicy] = useState('');
  const [petPolicy, setPetPolicy] = useState('');
  const [alcoholPolicy, setAlcoholPolicy] = useState('');
  const [bestSeasonToVisit, setBestSeasonToVisit] = useState<any>([]);
  const [averageTemperature, setAverageTemperature] = useState('');
  const [specialOffers, setSpecialOffers] = useState('');
  const [activitiesAvailable, setActivitiesAvailable] = useState('');

  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPetFriendly, setIsPetFriendly] = useState(false);
  const [isChildFriendly, setIsChildFriendly] = useState(false);
  const [thumbnailImage, setThumbnailImage] = useState('');
  const [imageUrls, setImageUrls] = useState<any>([]);

  const [maxGuests, setMaxGuests] = useState('');
  const [amenities, setAmenities] = useState('');
  const [cancellationPolicy, setCancellationPolicy] = useState('');

  const [checkInTime, setCheckInTime] = useState('11:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('10:00 AM');
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);

  useEffect(() => {
    if (spot) {
      setName(spot.name ?? '');
      setLocation(spot?.location ?? '');
      setPrice(spot.price?.toString() ?? '');
      setDescription(spot?.description ?? '');
      setCategory(spot?.category ?? '');
      setIsPetFriendly(spot?.isPetFriendly ?? false);
      setIsChildFriendly(spot?.isChildFriendly ?? false);
      setLatitude(spot?.latitude?.toString() ?? '');
      setLongitude(spot?.longitude?.toString() ?? '');
      setDiscount(spot?.discount?.toString() ?? '');
      setPricingOptions(spot?.pricingOptions)
      setAllowCampfires(spot?.allowCampfires ?? false);
      setAllowBBQ(spot?.allowBBQ ?? false);

      setFacilities(spot?.facilities ?? []);
      setHasElectricity(spot?.hasElectricity ?? true);
      setHasRunningWater(spot?.hasRunningWater ?? true);
      setFirewoodProvided(spot?.firewoodProvided ?? false);
      setParkingAvailable(spot?.parkingAvailable ?? true);
      setWheelchairAccessible(spot?.wheelchairAccessible ?? false);

      setBedTypes(spot?.bedTypes ?? []);
      setNumberOfTentsAllowed(spot?.numberOfTentsAllowed?.toString() ?? '');
      setEmergencyContact(spot?.emergencyContact ?? '');
      setSecurityMeasures(spot?.securityMeasures ?? []);
      setAmenities(spot?.amenities ?? '');

      setCheckInTime(spot?.checkInTime ?? '11:00 AM');
      setCheckOutTime(spot?.checkOutTime ?? '10:00 AM');
      setAvailability(spot?.availability ?? []);

      setMealOptions({
        breakfast: {
          available: spot?.mealOptions?.breakfast?.available ?? false,
          price: spot?.mealOptions?.breakfast?.price?.toString() ?? '0',
          description: spot?.mealOptions?.breakfast?.description ?? '',
          timings: {
            start: spot?.mealOptions?.breakfast?.timings?.start ?? '',
            end: spot?.mealOptions?.breakfast?.timings?.end ?? '',
          },
          isComplimentary: spot?.mealOptions?.breakfast?.isComplimentary ?? false,
        },
        lunch: {
          available: spot?.mealOptions?.lunch?.available ?? false,
          price: spot?.mealOptions?.lunch?.price?.toString() ?? '0',
          description: spot?.mealOptions?.lunch?.description ?? '',
          timings: {
            start: spot?.mealOptions?.lunch?.timings?.start ?? '',
            end: spot?.mealOptions?.lunch?.timings?.end ?? '',
          },
          isComplimentary: spot?.mealOptions?.lunch?.isComplimentary ?? false,
        },
        dinner: {
          available: spot?.mealOptions?.dinner?.available ?? false,
          price: spot?.mealOptions?.dinner?.price?.toString() ?? '0',
          description: spot?.mealOptions?.dinner?.description ?? '',
          timings: {
            start: spot?.mealOptions?.dinner?.timings?.start ?? '',
            end: spot?.mealOptions?.dinner?.timings?.end ?? '',
          },
          isComplimentary: spot?.mealOptions?.dinner?.isComplimentary ?? false,
        }
      });


      setMinimumNights(spot?.minimumNights?.toString() ?? '');
      setExtraCharges(spot?.extraCharges?.toString() ?? '');
      setAverageRating(spot?.averageRating?.toString() ?? '');
      setDistanceFromCity(spot?.distanceFromCity?.toString() ?? '');

      setRules(spot?.rules ?? []);
      setImageUrls(spot?.imageUrls ?? []);
      setThumbnailImage(spot?.thumbnailImage ?? '');

      setTags(spot?.tags || []);
      setSeasonalPricing(spot?.seasonalPricing ?? []);
      setGroupDiscount(spot?.groupDiscount?.toString() ?? '');
      setAccomodationType(spot?.accommodationType ?? '');
      setAcceptedPaymentMethods(spot?.acceptedPaymentMethods ?? []);
      setRefundPolicy(spot?.refundPolicy ?? '');
      setPetPolicy(spot?.petPolicy ?? '');
      setAlcoholPolicy(spot?.alcoholPolicy ?? '');
      setBestSeasonToVisit(spot?.bestSeasonToVisit ?? []);
      setAverageTemperature(spot?.averageTemperature?.toString() ?? '');
      setSpecialOffers(spot?.specialOffers ?? '');
      setActivitiesAvailable(spot.activitiesAvailable ?? '');
      setMaxGuests(spot.maxGuests?.toString() ?? '');
      setCancellationPolicy(spot?.cancellationPolicy ?? '');
      setVideoUrls(spot?.videoUrls ?? []);
      setInstagramHandle(spot?.instagramHandle ?? '');
      setFacebookPage(spot?.facebookPage ?? '');
      setReviews(spot?.reviews ?? []);
    }
  }, [spot]);

  // Image picker function
  const pickImage = async (isMainImage = false) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: false,
        quality: 0.8,
        maxWidth: 1280,
        maxHeight: 720,
      });

      if (result.didCancel) return;

      const selectedAsset = result.assets?.[0];

      if (selectedAsset?.uri) {
        await uploadImage(selectedAsset.uri, isMainImage);
      } else {
        Alert.alert('Error', 'No image selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };


  // Upload image to server
const uploadImage = async (uri: string, isMainImage: boolean) => {
  try {
    setUploadingImage(true);
    const imageUrl = await uploadCampingImage(uri, token!);

    if (imageUrl) {
      if (isMainImage) {
        setThumbnailImage(imageUrl);
      } else {
        setImageUrls((prev: any[]) => [...prev, imageUrl]);
      }
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to upload image');
  } finally {
    setUploadingImage(false);
  }
};


  const resetForm = () => {
    setName('');
    setPricingOptions([]);
    setLocation('');
    setLatitude('');
    setLongitude('');
    setDiscount('');
    setFacilities([]);
    setHasElectricity(true);
    setHasRunningWater(true);
    setFirewoodProvided(false);
    setParkingAvailable(true);
    setBedTypes([]);
    setNumberOfTentsAllowed('');
    setSecurityMeasures([]);
    setWheelchairAccessible(false);
    setEmergencyContact('');
    setShowDatePicker(false);
    setAvailability([]);
    setSelectedDate(new Date());
    setMinimumNights('');
    setExtraCharges('');
    setAverageRating('');
    setReviews([]);
    setRules([]);
    setAllowCampfires(false);
    setAllowBBQ(false);
    setNearbyAttractions([]);
    setDistanceFromCity('');
    setVideoUrls([]);
    setInstagramHandle('');
    setFacebookPage('');
    setMealOptions({
      breakfast: {
        available: false,
        price: 0,
        description: '',
        timings: '',
        isComplimentary: false,
      },
      lunch: {
        available: false,
        price: 0,
        description: '',
        timings: '',
        isComplimentary: false,
      },
      dinner: {
        available: false,
        price: 0,
        description: '',
        timings: '',
        isComplimentary: false,
      },
    });
    setTags([]);
    setSeasonalPricing([]);
    setGroupDiscount('');
    setAccomodationType('');
    setAcceptedPaymentMethods([]);
    setRefundPolicy('');
    setPetPolicy('');
    setAlcoholPolicy('');
    setBestSeasonToVisit([]);
    setAverageTemperature('');
    setSpecialOffers('');
    setActivitiesAvailable('');
    setPrice('');
    setDescription('');
    setCategory('');
    setIsPetFriendly(false);
    setIsChildFriendly(false);
    setThumbnailImage('');
    setImageUrls([]);
    setMaxGuests('');
    setAmenities('');
    setCancellationPolicy('');
    setCheckInTime('11:00 AM');
    setCheckOutTime('10:00 AM');
    setShowCheckInPicker(false);
    setShowCheckOutPicker(false);
  };


  // Submit form
  const handleSubmit = async () => {
    if (!name || !location || !price || !description) {
      Alert.alert('Missing Fields', 'Please fill in all required fields and upload a main image');
      return;
    }

    try {
      setLoading(true);

      const spotData = {
        name,
        location,
        price: parseFloat(price),
        description,
        category,
        isPetFriendly,
        isChildFriendly,
        pricingOptions,
        seasonalPricing,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        discount: parseFloat(discount),

        facilities,
        bestSeasonToVisit,
        tags,
        videoUrls,
        allowBBQ,
        allowCampfires,
        acceptedPaymentMethods,
        groupDiscount,
        averageTemperature,
        specialOffers,
        activitiesAvailable,
        instagramHandle,
        facebookPage,


        hasElectricity,
        hasRunningWater,
        firewoodProvided,
        parkingAvailable,
        wheelchairAccessible,

        bedTypes,
        numberOfTentsAllowed: parseInt(numberOfTentsAllowed),
        emergencyContact,

        securityMeasures,
        amenities,


        checkInTime,
        checkOutTime,

        availability,

        mealOptions: {
          breakfast: {
            available: mealOptions.breakfast.available,
            price: parseFloat(mealOptions.breakfast.price || 0),
            description: mealOptions.breakfast.description,
            timings: mealOptions.breakfast.timings,
            isComplimentary: mealOptions.breakfast.isComplimentary,
          },
          lunch: {
            available: mealOptions.lunch.available,
            price: parseFloat(mealOptions.lunch.price ?? 0),
            description: mealOptions.lunch.description,
            timings: mealOptions.lunch.timings,
            isComplimentary: mealOptions.lunch.isComplimentary,
          },
          dinner: {
            available: mealOptions.dinner.available,
            price: parseFloat(mealOptions.dinner.price ?? 0),
            description: mealOptions.dinner.description,
            timings: mealOptions.dinner.timings,
            isComplimentary: mealOptions.dinner.isComplimentary,
          },
        },

        minimumNights: parseInt(minimumNights.replace(/\D/g, '')),
        extraCharges: parseFloat(extraCharges),
        averageRating: parseFloat(averageRating),
        distanceFromCity: parseFloat(distanceFromCity),

        // reviews: (reviews || []).map((r: any) => ({
        //     ...r,
        //     date: new Date().toISOString(), // Or r.date && new Date(r.date).toISOString()
        //     rating: parseInt(r.rating || "0"),
        //     userId: r.userId || "your_user_id_here" // Replace with real ID
        //   })),
        rules: (rules ?? []).filter((r: any) => r.trim() !== ""),
        imageUrls,
        thumbnailImage,
        createdAt: new Date().toISOString(),
      };

      if (spot?.status === 'pending' && userType === 'vendor') {
        console.log("HERE VENDOR UPDATES PENDING REQUEST----");
        await submitVendorPendingUpdate(spot?.requestId, spotData);
        Alert.alert('Success', 'Camping site request submitted for approval');

      } else if (userType === 'vendor' && spot?.status === 'approved') {
        console.log("HERE VENDOR WANTS TO UPDATE APPROVED SPOT → CREATE REQUEST");
        await createVendorUpdateRequest({
          ...spotData,
          updateType: 'update',
          originalSpotId: spot._id,
        });
        Alert.alert('Success', 'Update request submitted to admin for approval');

      } else if (userType === 'admin') {
        console.log("HERE ADMIN UPDATES IT----");
        await updateAdminSpot(spot?.requestId, spotData);
        spot?.fetchSpots?.(); // ✅ optional
        Alert.alert('Success', 'Camping site updated successfully!');

      } else {
        console.log("HERE VENDOR CREATES SPOT REQUEST---");
        await createNewVendorSpotRequest({
          ...spotData,
          updateType: 'create',
        });
        Alert.alert('Success', 'Camping site request submitted for approval');
      }


      resetForm();

      navigation.goBack();
    } catch (error) {
      console.error('Error creating camping spot:', error);
      Alert.alert('Error', 'Failed to create camping spot');
    } finally {
      setLoading(false);
    }
  };

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [currentMeal, setCurrentMeal] = useState('');
  const [timeType, setTimeType] = useState<'start' | 'end' | any>('');

  const showTimePicker = (meal: string, type: 'start' | 'end') => {
    setCurrentMeal(meal);
    setTimeType(type);
    setTimePickerVisible(true);
  };

  const onTimeChange = (event: any, selectedTime: Date | undefined) => {
    setTimePickerVisible(false);
    if (selectedTime) {
      const formatted = selectedTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });

      setMealOptions((prev: any) => ({
        ...prev,
        [currentMeal]: {
          ...prev[currentMeal],
          timings: {
            ...prev[currentMeal]?.timings,
            [timeType]: formatted,
          },
        },
      }));
    }
  };


  return (
    <ScrollView>
      <View style={styles.form}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter camping spot name"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your camping spot"
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <Text style={styles.label}>Latitude</Text>
        <Input
          value={latitude}
          onChangeText={setLatitude}
          placeholder="Enter latitude"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Longitude</Text>
        <Input
          value={longitude}
          onChangeText={setLongitude}
          placeholder="Enter longitude"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {['Standard', 'Luxury', 'Ultra Luxury'].map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                category === cat && styles.selectedCategoryText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Price per night (₹) *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Check-In Time</Text>
        <TouchableOpacity onPress={() => setShowCheckInPicker(true)} style={styles.input}>
          <Text>{checkInTime}</Text>
        </TouchableOpacity>

        {showCheckInPicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowCheckInPicker(false);
              if (event.type === 'set' && selectedDate) {
                const formatted = formatTime(selectedDate);
                setCheckInTime(formatted);
              }
            }}
          />
        )}



        <Text style={styles.label}>Check-Out Time</Text>
        <TouchableOpacity onPress={() => setShowCheckOutPicker(true)} style={styles.input}>
          <Text>{checkOutTime}</Text>
        </TouchableOpacity>
        {showCheckOutPicker && (
          <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={(event, selectedDate) => {
              setShowCheckOutPicker(false);
              if (event.type === 'set' && selectedDate) {
                const formatted = formatTime(selectedDate);
                setCheckOutTime(formatted);
              }
            }}
          />
        )}



        <Text style={styles.label}>Bed Types</Text>
        {['Single', 'Double', 'Queen', 'King'].map(option => (
          <TouchableOpacity
            key={option}
            style={styles.checkboxContainer}
            onPress={() => {
              setBedTypes((prev: any) =>
                prev.includes(option)
                  ? prev.filter((item: any) => item !== option)
                  : [...prev, option]
              );
            }}
          >
            <View style={styles.checkbox}>
              {bedTypes.includes(option) && <View style={styles.checked} />}
            </View>
            <Text style={styles.checkboxLabel}>{option}</Text>
          </TouchableOpacity>
        ))}

        {/* Accommodation Type (Enum) */}

        <View style={styles.container}>
          <Text style={styles.label}>Accommodation Type</Text>

          <Picker
            data={[
              { label: 'Tent', value: 'Tent' },
              { label: 'Cabin', value: 'Cabin' },
              { label: 'RV', value: 'RV' },
              { label: 'Treehouse', value: 'Treehouse' },
              { label: 'Cottage', value: 'Cottage' },
              { label: 'Resort', value: 'Resort' },
              { label: 'Dome', value: 'Dome' },
              { label: 'Yurt', value: 'Yurt' },
              { label: 'Eco-Hut', value: 'Eco-Hut' },
              { label: 'Glamping Pod', value: 'Glamping Pod' }
            ]}
            cols={1}
            value={accommodationType ? [accommodationType] : []}
            onChange={val => setAccomodationType(val[0])}
            okText="OK"
            dismissText="Cancel"
          >
            <List.Item arrow="horizontal">Select Accommodation</List.Item>
          </Picker>
        </View>

        <Text style={styles.label}>Maximum Number of {accommodationType} Allowed</Text>
        <Input
          value={numberOfTentsAllowed}
          onChangeText={setNumberOfTentsAllowed}
          placeholder="e.g., 3"
          keyboardType="numeric"
        />


        <Text style={styles.label}>Minimum Nights</Text>
        <Input
          value={minimumNights}
          onChangeText={(val) => setMinimumNights(val.replace(/\D/g, ''))}
          keyboardType="numeric"
          placeholder="e.g., 2"
        />

        <Text style={styles.label}>Extra Charges (₹)</Text>
        <Input
          value={extraCharges}
          onChangeText={(val) => setExtraCharges(val.replace(/\D/g, ''))}
          keyboardType="numeric"
          placeholder="e.g., 200"
        />

        <Text style={styles.label}>Average Rating</Text>
        <Input
          value={averageRating}
          onChangeText={(val) => setAverageRating(val.replace(/\D/g, ''))}
          keyboardType="numeric"
        />



        <Text style={styles.label}>Max Guests</Text>
        <TextInput
          style={styles.input}
          value={maxGuests}
          onChangeText={setMaxGuests}
          placeholder="Enter maximum guests allowed"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Security Measures</Text>
        {['CCTV', 'Security Guard', 'Fencing', 'Lockable Tents'].map(option => (
          <TouchableOpacity
            key={option}
            style={styles.checkboxContainer}
            onPress={() => {
              setSecurityMeasures((prev: any) =>
                prev.includes(option)
                  ? prev.filter((item: any) => item !== option)
                  : [...prev, option]
              );
            }}
          >
            <View style={styles.checkbox}>
              {securityMeasures.includes(option) && <View style={styles.checked} />}
            </View>
            <Text style={styles.checkboxLabel}>{option}</Text>
          </TouchableOpacity>
        ))}



        <Text style={styles.label}>Meal Options</Text>

        {['breakfast', 'lunch', 'dinner'].map((meal) => (
          <View key={meal} style={styles.mealContainer}>
            <Text style={styles.subLabel}>{meal.charAt(0).toUpperCase() + meal.slice(1)}</Text>

            <List.Item
              extra={
                <Switch

                  value={mealOptions?.[meal]?.available}
                  onValueChange={(val) =>
                    setMealOptions((prev: any) => ({
                      ...prev,
                      [meal]: { ...prev?.[meal], available: val },
                    }))
                  }
                />
              }
            >
              Available
            </List.Item>

            <Input
              value={mealOptions?.[meal]?.price || ''}
              onChangeText={(val) =>
                setMealOptions((prev: any) => ({
                  ...prev,
                  [meal]: { ...prev?.[meal], price: val.replace(/\D/g, '') || 0 },
                }))
              }
              keyboardType="numeric"
              placeholder="Price (₹)"
              style={styles.input}
            />

            <Input
              value={mealOptions?.[meal]?.description || ''}
              onChangeText={(val) =>
                setMealOptions((prev: any) => ({
                  ...prev,
                  [meal]: { ...prev?.[meal], description: val },
                }))
              }
              placeholder="Description"
              style={styles.input}
            />

            <View style={styles.timeRangeContainer}>
              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => showTimePicker(meal, 'start')}
              >
                <Text>
                  {mealOptions?.[meal]?.timings?.start ?? 'Start Time'}
                </Text>
              </TouchableOpacity>

              <Text style={{ marginHorizontal: 10 }}>to</Text>

              <TouchableOpacity
                style={styles.timeInput}
                onPress={() => showTimePicker(meal, 'end')}
              >
                <Text>
                  {mealOptions?.[meal]?.timings?.end ?? 'End Time'}
                </Text>
              </TouchableOpacity>
            </View>


            <List.Item
              extra={
                <Switch
                  value={mealOptions?.[meal]?.isComplimentary}
                  onValueChange={(val) =>
                    setMealOptions((prev: any) => ({
                      ...prev,
                      [meal]: { ...prev[meal], isComplimentary: val },
                    }))
                  }
                />
              }
            >
              Complimentary
            </List.Item>

            <View style={styles.divider} />
          </View>
        ))}




        <Text style={styles.label}>Availability</Text>

        <Button title="Add Available Date" onPress={() => setShowDatePicker(true)} />

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDateValue) => {
              setShowDatePicker(false);
              const isAndroid = Platform.OS === 'android';

              if ((!isAndroid || event.type === 'set') && selectedDateValue instanceof Date) {
                const isoDate = selectedDateValue.toISOString();
                setSelectedDate(selectedDateValue);
                setAvailability(prev => [...prev, { date: isoDate, isBooked: false }]);
              }
            }}
          />
        )}

        {availability.length > 0 &&
          availability.map((item, index) => (
            <View key={`${index}-${item?.date}`} style={{ flexDirection: 'row', marginVertical: 6 }}>
              <Text style={{ flex: 1 }}>
                {new Date(item.date).toDateString()} -{' '}
                {item.isBooked ? 'Booked' : 'Available'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  const updated = [...availability];
                  updated[index].isBooked = !updated[index].isBooked;
                  setAvailability(updated);
                }}
              >
                <Text style={{ color: '#007bff' }}>
                  Mark as {item.isBooked ? 'Available' : 'Booked'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}

        <Text style={styles.label}>Amenities</Text>
        <TextInput
          style={styles.input}
          value={amenities}
          onChangeText={setAmenities}
          placeholder="Comma-separated list (e.g. WiFi, Parking)"
        />



        <View style={styles.switchRow}>
          <Text style={styles.label}>Pet Friendly</Text>
          <Switch
            value={isPetFriendly}
            onValueChange={setIsPetFriendly}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Child Friendly</Text>
          <Switch
            value={isChildFriendly}
            onValueChange={setIsChildFriendly}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
          />
        </View>

        <Text style={styles.label}>Main Image *</Text>
        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={() => pickImage(true)}
          disabled={uploadingImage}
        >
          {thumbnailImage ? (
            <Image source={{ uri: thumbnailImage }} style={styles.previewImage} />
          ) : (
            <>
              <Icon name="add-photo-alternate" size={24} color="#666" />
              <Text style={styles.uploadText}>
                {uploadingImage ? 'Uploading...' : 'Upload Main Image'}
              </Text>
            </>
          )}
        </TouchableOpacity>






        {/* Refund Policy (Enum) */}
        <Text style={styles.label}>Refund Policy</Text>
        <View style={styles.categoryContainer}>
          {['No Refunds', 'Partial Refund', 'Full Refund'].map(policy => (
            <TouchableOpacity
              key={policy}
              style={[
                styles.categoryButton,
                refundPolicy === policy && styles.selectedCategory
              ]}
              onPress={() => setRefundPolicy(policy)}
            >
              <Text style={[
                styles.categoryText,
                refundPolicy === policy && styles.selectedCategoryText
              ]}>
                {policy}
              </Text>
            </TouchableOpacity>
          ))}
        </View>


        {/* Cancellation Policy (Enum) */}
        <Text style={styles.label}>Cancellation Policy</Text>
        <View style={styles.categoryContainer}>
          {['Flexible', 'Moderate', 'Strict'].map(policy => (
            <TouchableOpacity
              key={policy}
              style={[
                styles.categoryButton,
                cancellationPolicy === policy && styles.selectedCategory
              ]}
              onPress={() => setCancellationPolicy(policy)}
            >
              <Text style={[
                styles.categoryText,
                cancellationPolicy === policy && styles.selectedCategoryText
              ]}>
                {policy}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Cancellation Policy</Text>
        <TextInput
          style={styles.input}
          value={cancellationPolicy}
          onChangeText={setCancellationPolicy}
          placeholder="Describe your cancellation policy"
        />

        <Text style={styles.label}>Rules</Text>
        <Input
          value={rules.join(', ')}
          onChangeText={(val) => setRules(val.split(',').map(item => item.trim()))}
          placeholder="e.g., No loud music, No littering"
        />

        <Text style={styles.label}>Nearby Attractions</Text>
        <Input
          value={nearbyAttractions.join(', ')}
          onChangeText={(val) => setNearbyAttractions(val.split(',').map(item => item.trim()))}
          placeholder="e.g., Lake, Forest, Waterfall"
        />

        <Text style={styles.label}>Video URLs</Text>
        <Input
          value={videoUrls.join(', ')}
          onChangeText={(val) => setVideoUrls(val.split(',').map(item => item.trim()))}
          placeholder="Paste video links separated by commas"
        />

        <Text style={styles.label}>Tags</Text>
        <Input
          value={tags.join(', ')}
          onChangeText={(val) => setTags(val.split(',').map(item => item.trim()))}
          placeholder="e.g., adventure, nature"
        />


        {/* Best Season to Visit (Multi-select enum as checkboxes) */}
        <Text style={styles.label}>Best Seasons to Visit</Text>
        {['Summer', 'Winter', 'Monsoon', 'Spring'].map((season: string) => (
          <View key={season} style={styles.checkboxContainer}>
            <Switch
              value={bestSeasonToVisit.includes(season)}
              onValueChange={(val) => {
                setBestSeasonToVisit((prev: any) =>
                  val ? [...prev, season] : prev.filter((s: any) => s !== season)
                );
              }}
            />
            <Text style={styles.checkboxLabel}>{season}</Text>
          </View>
        ))}

        {/* Occupancy-Based Pricing */}
        <Text style={styles.label}>Occupancy Pricing Options</Text>
        {['Single', 'Double', 'Triple', 'Quad', 'Group'].map(type => (
          <View key={type} style={styles.pricingRow}>
            <Text style={styles.checkboxLabel}>{type}</Text>
            <TextInput
              style={styles.input}
              placeholder="₹ per person"
              keyboardType="numeric"
              value={
                pricingOptions.find((p: any) => p.occupancyType === type)?.pricePerPerson?.toString() ?? ''
              }
              onChangeText={(value) => {
                const num = parseFloat(value) || 0;
                setPricingOptions((prev: any) => {
                  const exists = prev.find((p: any) => p.occupancyType === type);
                  if (exists) {
                    return prev.map((p: any) =>
                      p.occupancyType === type ? { ...p, pricePerPerson: num } : p
                    );
                  } else {
                    return [...prev, { occupancyType: type, pricePerPerson: num }];
                  }
                });
              }}
            />
          </View>
        ))}

        {/* Seasonal Pricing */}
        <Text style={styles.label}>Seasonal Pricing</Text>
        {['Summer', 'Winter', 'Monsoon', 'Spring'].map(season => (
          <View key={season} style={styles.pricingRow}>
            <Text style={styles.checkboxLabel}>{season}</Text>
            <TextInput
              style={styles.input}
              placeholder="₹ price"
              keyboardType="numeric"
              value={
                seasonalPricing.find((s: any) => s.season === season)?.pricing?.toString() ?? ''
              }
              onChangeText={(value) => {
                const num = parseFloat(value) || 0;
                setSeasonalPricing((prev: any) => {
                  const exists = prev.find((s: any) => s.season === season);
                  if (exists) {
                    return prev.map((s: any) =>
                      s.season === season ? { ...s, pricing: num } : s
                    );
                  } else {
                    return [...prev, { season, pricing: num }];
                  }
                });
              }}
            />
          </View>
        ))}

        <View style={styles.switchRow}>
          <Text style={styles.label}>Has Electricity</Text>
          <Switch value={hasElectricity} onValueChange={setHasElectricity} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Running Water</Text>
          <Switch value={hasRunningWater} onValueChange={setHasRunningWater} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Firewood Provided</Text>
          <Switch value={firewoodProvided} onValueChange={setFirewoodProvided} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Parking Available</Text>
          <Switch value={parkingAvailable} onValueChange={setParkingAvailable} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Wheelchair Accessible</Text>
          <Switch value={wheelchairAccessible} onValueChange={setWheelchairAccessible} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Allow Campfires</Text>
          <Switch value={allowCampfires} onValueChange={setAllowCampfires} />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Allow BBQ</Text>
          <Switch value={allowBBQ} onValueChange={setAllowBBQ} />
        </View>


        {/* Payment Methods */}
        <Text style={styles.label}>Accepted Payment Methods</Text>
        {['Credit Card', 'UPI', 'Cash'].map((method) => (
          <View key={method} style={styles.checkboxContainer}>
            <Switch
              value={acceptedPaymentMethods.includes(method)}
              onValueChange={(val) => {
                setAcceptedPaymentMethods((prev: any) =>
                  val ? [...prev, method] : prev.filter((m: any) => m !== method)
                );
              }}
            />
            <Text style={styles.checkboxLabel}>{method}</Text>
          </View>
        ))}

        {/* Alcohol Policy */}
        <Text style={styles.label}>Alcohol Policy</Text>
        <TextInput
          style={styles.input}
          value={alcoholPolicy}
          onChangeText={setAlcoholPolicy}
          placeholder="e.g. Allowed in designated areas"
        />

        {/* Pet Policy */}
        <Text style={styles.label}>Pet Policy</Text>
        <TextInput
          style={styles.input}
          value={petPolicy}
          onChangeText={setPetPolicy}
          placeholder="e.g. Pets allowed with prior notice"
        />

        {/* Group Discount */}
        <Text style={styles.label}>Group Discount (%)</Text>
        <TextInput
          style={styles.input}
          value={groupDiscount}
          onChangeText={setGroupDiscount}
          keyboardType="numeric"
        />

        {/* Average Temperature */}
        <Text style={styles.label}>Average Temperature (°C)</Text>
        <TextInput
          style={styles.input}
          value={averageTemperature}
          onChangeText={setAverageTemperature}
          keyboardType="numeric"
        />

        {/* Special Offers */}
        <Text style={styles.label}>Special Offers</Text>
        <TextInput
          style={styles.input}
          value={specialOffers}
          onChangeText={setSpecialOffers}
          placeholder="e.g. 10% off for weekday bookings"
        />

        {/* Activities */}
        <Text style={styles.label}>Activities Available</Text>
        <TextInput
          style={styles.input}
          value={activitiesAvailable}
          onChangeText={setActivitiesAvailable}
          placeholder="Comma-separated (e.g. Hiking, Fishing)"
        />

        <Text style={styles.label}>Instagram Handle</Text>
        <Input
          value={instagramHandle}
          onChangeText={setInstagramHandle}
          placeholder="@yourhandle"
        />

        <Text style={styles.label}>Facebook Page URL</Text>
        <Input
          value={facebookPage}
          onChangeText={setFacebookPage}
          placeholder="https://facebook.com/yourpage"
        />

        <Text style={styles.label}>Emergency Contact</Text>
        <Input
          value={emergencyContact}
          onChangeText={setEmergencyContact}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Discount (%)</Text>
        <Input
          value={discount}
          onChangeText={setDiscount}
          placeholder="Enter discount"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Facilities</Text>
        {[
          'Toilets',
          'Showers',
          'BBQ Area',
          'Drinking Water',
          'WiFi',
          'Waste Disposal',
          'Kitchen Access'
        ].map(option => (
          <TouchableOpacity
            key={option}
            style={styles.checkboxContainer}
            onPress={() => {
              setFacilities((prev: any) =>
                prev.includes(option)
                  ? prev.filter((item: any) => item !== option)
                  : [...prev, option]
              );
            }}
          >
            <View style={styles.checkbox}>
              {facilities.includes(option) && <View style={styles.checked} />}
            </View>
            <Text style={styles.checkboxLabel}>{option}</Text>
          </TouchableOpacity>
        ))}


        {/* <Text style={styles.label}>Reviews</Text>

{reviews.map((review: any, index: any) => (
  <View key={index} style={styles.reviewCard}>
    <Input
      placeholder="User Comment"
      value={review.comment}
      onChangeText={(val) => {
        const updated = [...reviews];
        updated[index].comment = val;
        setReviews(updated);
      }}
      style={styles.input}
    />

    <Input
      placeholder="Rating (1-5)"
      keyboardType="numeric"
      value={review.rating || ''}
      onChangeText={(val) => {
        const updated = [...reviews];
        updated[index].rating = val.replace(/[^0-9]/g, '') || 0;
        setReviews(updated);
      }}
      style={styles.input}
    />

    <TouchableOpacity
      onPress={() => {
        const updated = [...reviews];
        updated.splice(index, 1);
        setReviews(updated);
      }}
      style={styles.removeButton}
    >
      <Text style={styles.removeButtonText}>Remove Review</Text>
    </TouchableOpacity>

    <View style={styles.divider} />
  </View>
))}

<AntButton
  type="primary"
  style={{ backgroundColor: '#1890ff', paddingHorizontal: 16 }}
  onPress={() => {
    setReviews([
      ...reviews,
      { comment: '', rating: 1, date: new Date().toISOString() },
    ]);
  }}
>
  <Text style={{ color: '#fff' }}>Add Review</Text>
</AntButton> */}


        <Text style={styles.label}>Distance from City</Text>
        <Input
          value={distanceFromCity}
          onChangeText={setDistanceFromCity}
          placeholder="Enter distance in km"
          keyboardType="numeric"
          style={styles.input}
        />



        <Text style={styles.label}>Additional Images</Text>
        <View style={styles.imagesContainer}>
          {imageUrls.map((url: any, index: any) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image source={{ uri: url }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImageUrls((prev: any) => prev.filter((_: any, i: any) => i !== index))}
              >
                <Icon name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addImageButton}
            onPress={() => pickImage(false)}
            disabled={uploadingImage}
          >
            <Icon name="add" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>{`${spot ? 'Update' : 'Create'}`} Camping Spot</Text>
          )}
        </TouchableOpacity>

      </View>
      {timePickerVisible && (
        <DateTimePicker
          mode="time"
          display="default"
          value={new Date()}
          onChange={onTimeChange}
        />
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: StatusBar.currentHeight,

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#4CAF50',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    color: '#666',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  imageUploadButton: {
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  uploadText: {
    marginTop: 8,
    color: '#666',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  imagePreviewContainer: {
    width: 100,
    height: 100,
    margin: 4,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#F44336',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reviewCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  removeButton: {
    backgroundColor: '#ffcccc',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#a00',
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginTop: 12,
  },


  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: '#444',
  },

  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },

  pricingRowInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: '#fff',
  },

  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  mealContainer: {
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fdfdfd',
  },
  subLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },

  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  timeInput: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center'
  },


});

export default AddEditSpotScreen;
