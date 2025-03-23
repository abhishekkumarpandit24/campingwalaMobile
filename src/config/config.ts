// campingwalaMobile/src/config/config.ts
export const API_URL = __DEV__ 
  ? 'https://campingwala-backend2-preprod.vercel.app' // Android emulator
  : 'https://campingwala-backend2.vercel.app'; // Replace with your actual API URL
// For local development with Expo, you might use something like:
// export const API_URL = 'http://192.168.1.100:5000';