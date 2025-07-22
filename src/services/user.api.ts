// src/services/user.api.ts
import api from './api';

// ✅ Update profile
export const updateUserProfile = async (updatedUser: {
  firstName: string;
  phoneNumber: string;
  lastName: string;
  email?: string;
  businessName?: string;
  businessAddress?: string;
  businessContact?: string;
}) => {
  const res = await api.put('/user/profile', updatedUser);
  return res.data;
};

// ✅ Send reset code
export const sendResetPasswordCode = async (email: string) => {
  const res = await api.post('/user/auth/forgot-password/send-code', { email });
  return res.data;
};

// ✅ Verify code & reset password
export const verifyCodeAndResetPassword = async (email: string, code: string, newPassword: string) => {
  await api.post('/user/auth/forgot-password/verify-code', { email, code });
  await api.post('/user/auth/forgot-password/reset', { email, newPassword });
};

// Fetch all users
export const fetchAllUsers = async (): Promise<any[]> => {
  const res = await api.get('/user/all-users');
  return res.data;
};

// Delete user by ID
export const deleteUserById = async (id: string): Promise<void> => {
  await api.delete(`/user/${id}`);
};

export const fetchPendingUserRequests = async () => {
  const res = await api.get('/user/pending-users');
  return res.data;
};

export const fetchPendingCampingRequests = async () => {
  const res = await api.get('/admin/spot-requests');
  return res.data?.filter((item: any) => item.status?.toLowerCase() === 'pending');
};


export const approveUser = async (userId: string) => {
  return await api.post(`/user/approve/${userId}`, {});
};

export const rejectUser = async (userId: string) => {
  return await api.post(`/user/reject/${userId}`, {});
};
