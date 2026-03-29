import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Attach JWT token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Producer {
  id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  genres: string[];
  mood_tags: string[];
  credits: { artist: string; song: string; year: number }[];
  social_links: Record<string, string>;
  contact_email?: string;
  years_experience?: number;
  equipment: string[];
  custom_price_min?: number;
  custom_price_max?: number;
  delivery_days?: number;
  beat_count?: number;
}

export interface License {
  id: string;
  type: 'basic' | 'premium' | 'exclusive';
  price: number;
  description?: string;
  file_formats: string[];
  distribution_limit?: number;
  is_available: boolean;
}

export interface Beat {
  id: string;
  title: string;
  cover_url?: string;
  preview_url: string;
  genre?: string;
  mood?: string;
  bpm?: number;
  key?: string;
  tags: string[];
  play_count: number;
  is_sold_out: boolean;
  type: 'beat' | 'showcase';
  producer: Pick<Producer, 'id' | 'name' | 'avatar_url'>;
  licenses: License[];
  created_at: string;
}

// API calls
export const getProducers = () => api.get<{ producers: Producer[] }>('/producers').then((r) => r.data.producers);
export const getProducer = (id: string) => api.get<Producer & { beats: Beat[]; showcase: Beat[] }>(`/producers/${id}`).then((r) => r.data);

export const getBeats = (params?: Record<string, string | number>) =>
  api.get<{ beats: Beat[]; total: number; page: number; limit: number }>('/beats', { params }).then((r) => r.data);
export const getBeat = (id: string) => api.get<Beat>(`/beats/${id}`).then((r) => r.data);
export const incrementPlay = (id: string) => api.post(`/beats/${id}/play`);

export const login = (email: string, password: string) =>
  api.post<{ token: string; producer: Producer }>('/auth/login', { email, password }).then((r) => r.data);
export const register = (name: string, email: string, password: string) =>
  api.post<{ token: string; producer: Producer }>('/auth/register', { name, email, password }).then((r) => r.data);
