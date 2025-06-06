// campingwalaMobile/src/screens/AddSpotScreen.tsx
import React, { useState } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/config';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';

const AddSpotScreen = () => {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
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
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

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
      
      // Create form data for image upload
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);
      
      // Upload to server
      const response = await axios.post(`${API_URL}/image/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.imageUrl) {
        if (isMainImage) {
        setThumbnailImage(response.data.imageUrl);
      } else {
        setImageUrls((prev: any[]) => [...prev, response.data.imageUrl]);
      }
    
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
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
        thumbnailImage,
        imageUrls,
      };
      
      await axios.post(`${API_URL}/vendor/spot-requests`, spotData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      Alert.alert('Success', "Camping site request submitted for approval"
);
      navigation.goBack();
    } catch (error) {
      console.error('Error creating camping spot:', error);
      Alert.alert('Error', 'Failed to create camping spot');
    } finally {
      setLoading(false);
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

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Enter location"
        />

        <Text style={styles.label}>Price per night (₹) *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price"
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

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your camping spot"
          multiline
          numberOfLines={4}
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

        <Text style={styles.label}>Amenities</Text>
        <TextInput
          style={styles.input}
          value={amenities}
          onChangeText={setAmenities}
          placeholder="Comma-separated list (e.g. WiFi, Parking)"
        />

        <Text style={styles.label}>Check-In Time</Text>
        <TextInput
          style={styles.input}
          value={checkInTime}
          onChangeText={setCheckInTime}
          placeholder="e.g. 2:00 PM"
        />

        <Text style={styles.label}>Check-Out Time</Text>
        <TextInput
          style={styles.input}
          value={checkOutTime}
          onChangeText={setCheckOutTime}
          placeholder="e.g. 11:00 AM"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email address"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Cancellation Policy</Text>
        <TextInput
          style={styles.input}
          value={cancellationPolicy}
          onChangeText={setCancellationPolicy}
          placeholder="Describe your cancellation policy"
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
            <Text style={styles.submitButtonText}>Create Camping Spot</Text>
          )}
        </TouchableOpacity>
      </View>
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
});

export default AddSpotScreen;
