// campingwalaMobile/src/config/config.ts
export const API_URL = __DEV__ 
  ? 'http://192.168.1.5:5051/api' // Android emulator
  : 'https://campingwala-backend2-preprod.vercel.app/api'; // Replace with your actual API URL
// For local development with Expo, you might use something like:
// export const API_URL = 'http://192.168.1.100:5000';
// https://campingwala-backend2-preprod.vercel.app/api
// http://192.168.1.2:5051/api

