import { create } from 'zustand';
import { fetchCampingSpots } from '../services/camping.api';

interface CampingSite {
  _id: any;
  id: number;
  name: string;
  description: string;
  price: string;
}

interface CampingStore {
  campingSites: CampingSite[];
  loading: boolean;
  error: string | null;
  fetchCampingSites: () => Promise<void>;
}

export const useCampingStore = create<CampingStore>((set) => ({
  campingSites: [],
  loading: false,
  error: null,

  fetchCampingSites: async () => {
    set({ loading: true, error: null }); // Set loading state
    try {
      const response = await fetchCampingSpots();
      set({ campingSites: response, loading: false }); // Update camping sites
    } catch (err: any) {
      set({ error: err.message, loading: false }); // Handle errors
    }
  },
}));
