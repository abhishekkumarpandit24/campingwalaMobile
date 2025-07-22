import { API_URL as API_BASE_URL } from '../config/config';
import api from './api';

export const fetchAllCampingSpots = async (): Promise<any[]> => {
  const res = await api.get('/camping-spots');
  return res.data;
};

export const fetchVendorCampingData = async (): Promise<any[]> => {
  const [approvedRes, requestRes] = await Promise.all([
    api.get('/camping-spots/vendor'),
    api.get('/vendor/spot-requests'),
  ]);

  const approvedSpots = approvedRes.data.map((spot: any) => ({
    ...spot,
    status: 'approved',
    requestId: spot._id,
  }));

  const pendingRequests = requestRes.data
    .filter((req: any) => req.status === 'pending')
    .map((req: any) => ({
      ...req.spotDetails,
      status: 'pending',
      requestId: req._id,
    }));

  return [...approvedSpots, ...pendingRequests];
};

// ✅ Public fetch
export const fetchCampingSpots = async () => {
  const response = await fetch(`${API_BASE_URL}/camping-spots`);
  if (!response.ok) throw new Error('Failed to fetch camping spots');
  return await response.json();
};

// ✅ New functions for submission
export const submitVendorPendingUpdate = async (requestId: string, spotData: any) => {
  return await api.put(`/vendor/spot-requests/${requestId}`, spotData);
};

export const createVendorUpdateRequest = async (spotData: any) => {
  return await api.post('/vendor/spot-requests', spotData);
};

export const updateAdminSpot = async (requestId: string, spotData: any) => {
  return await api.put(`/admin/spot-requests/spot/${requestId}`, spotData);
};

export const createNewVendorSpotRequest = async (spotData: any) => {
  return await api.post('/vendor/spot-requests', spotData);
};

export const uploadCampingImage = async (uri: string, token: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);

  try {
    const response = await api.post('/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });

    return response?.data?.imageUrl ?? null;
  } catch (err) {
    console.error('Image upload failed:', err);
    throw err;
  }
};

export const deleteSpotRequestByAdmin = async (spotId: string): Promise<void> => {
  try {
    await api.delete(`/admin/spot-requests/spot/${spotId}`);
  } catch (err) {
    console.error('Delete Spot Request Failed:', err);
    throw err;
  }
};

export const deleteCampingSpot = async (spot: any) => {
  if (spot?.status === 'approved') {
    // Submit delete request to admin
    return await api.post(
      `/vendor/spot-requests/delete/${spot._id}`,
      {
        originalSpotId: spot._id,
        updateType: 'delete',
      }
    );
  } else {
    // Directly delete the pending spot request
    return await api.delete(`/vendor/spot-requests/${spot.requestId}`);
  }
};

export const approveCampingRequest = async (requestId: string | undefined) => {
  return await api.put(`/admin/spot-requests/${requestId}`, {
    status: 'approved',
  });
};

export const rejectCampingRequest = async (requestId: string, rejectionReason: string) => {
  return await api.put(`/admin/spot-requests/${requestId}`, {
    status: 'rejected',
    rejectionReason,
  });
};


// // ✅ Upload image
// export const uploadImage = async (file: any) => {
//   const formData: any = new FormData();
//   formData.append('image', {
//     uri: file.uri,
//     type: file.type,
//     name: file.fileName || 'image.jpg'
//   });

//   try {
//     const response = await axios.post(`${API_BASE_URL}/image/upload`, formData, {
//       headers: {
//         Authorization: `Bearer ${getToken()}`,
//         'Content-Type': 'multipart/form-data'
//       }
//     });
//     return response.data;
//   } catch (error) {
//     console.error('Image upload error:', error);
//     throw new Error('Failed to upload camping site image.');
//   }
// };

// // ✅ Delete image from Cloudinary
// export const deleteImageFromCloudinary = async (imageUrl: string) => {
//   try {
//     const response = await fetch(`${API_BASE_URL}/image/delete`, {
//       method: 'DELETE',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${getToken()}`
//       },
//       body: JSON.stringify({ imageUrl })
//     });

//     const data = await response.json();
//     if (!response.ok) throw new Error(data?.message || 'Failed to delete image');

//     return data;
//   } catch (error) {
//     console.error('Image deletion error:', error);
//     throw error;
//   }
// };

// // ✅ Create a new camping spot request (vendor)
// export const createCampingSiteRequest = async (siteData: any) => {
//   try {
//     const response = await api.post(`/vendor/spot-requests`, siteData);
//     return response.data;
//   } catch (error) {
//     console.error('Create camping site error:', error);
//     throw new Error('Failed to create camping site.');
//   }
// };

// // ✅ Get vendor's pending camping site requests
// export const getPendingRequests = async () => {
//   try {
//     const response = await api.get(`/vendor/spot-requests`);
//     return response.data;
//   } catch (error) {
//     throw new Error('Failed to fetch camping site requests.');
//   }
// };

// // ✅ Update a pending camping request
// export const updatePendingCampingRequest = async (id: string, siteData: any) => {
//   try {
//     const response = await api.put(`/vendor/spot-requests/${id}`, siteData);
//     return response.data;
//   } catch (error: any) {
//     throw new Error(error.response?.data?.message || 'Failed to update camping site.');
//   }
// };

// // ✅ Delete a pending site
// export const deletePendingCampingSite = async (id: string) => {
//   try {
//     const response = await api.delete(`/vendor/spot-requests/${id}`);
//     return response.data;
//   } catch (error) {
//     throw new Error('Failed to delete camping site.');
//   }
// };

// // ✅ Create a new spot request (admin-facing or generic)
// export const createSpotRequest = async (payload: any) => {
//   const response = await api.post(`/spot-requests`, payload);
//   return response.data;
// };
