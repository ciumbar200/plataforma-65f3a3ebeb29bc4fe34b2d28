

export enum UserRole {
  INQUILINO = 'INQUILINO',
  PROPIETARIO = 'PROPIETARIO',
  ANFITRION = 'ANFITRION',
  ADMIN = 'ADMIN',
}

export enum RentalGoal {
  FIND_ROOMMATES_AND_APARTMENT = 'FIND_ROOMMATES_AND_APARTMENT',
  FIND_ROOM_WITH_ROOMMATES = 'FIND_ROOM_WITH_ROOMMATES',
  BOTH = 'BOTH',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  last_name?: string;
  phone?: string;
  city?: string;
  locality?: string;
  rental_goal?: RentalGoal;
  age: number;
  birth_date?: string;
  avatar_url: string;
  video_url?: string;
  interests: string[];
  noise_level: 'Bajo' | 'Medio' | 'Alto';
  compatibility: number;
  role: UserRole;
  bio?: string;
  lifestyle?: string[];
  commute_distance?: number; // in minutes
  is_banned?: boolean;
  is_profile_complete?: boolean;
  birth_country?: string;
  budget?: number; // Monthly budget for rent
  religion?: string;
  sexual_orientation?: string;
  is_verified?: boolean;
  veriff_status?: string | null;
  veriff_session_id?: string | null;
  veriff_reason?: string | null;
  verification_status?: 'none' | 'pending' | 'approved' | 'rejected';
  verification_type?: string | null;
  convivencia_quiz_completed?: boolean;
  convivencia_quiz_version?: string | null;
  convivencia_quiz_completed_at?: string | null;
  convivencia_persona?: Record<string, unknown> | null;
  onboarding_status?: 'pending' | 'in_progress' | 'completed';
  onboarding_step?: string | null;
  onboarding_updated_at?: string | null;
}

export type AmenityId = 
  | 'pool' | 'wifi' | 'airConditioning' | 'heating' | 'furnished' 
  | 'kitchen' | 'washingMachine' | 'parking' | 'elevator' | 'balcony' 
  | 'petsAllowed' | 'gym' | 'doorman';

export type PropertyFeatures = {
  [key in AmenityId]?: boolean;
};

export enum PropertyType {
  FLAT = 'Piso',
  APARTMENT = 'Apartamento',
  HOUSE = 'Casa',
  STUDIO = 'Estudio',
  ROOM = 'Habitación',
}

export interface Property {
  id: number;
  owner_id: string;
  title: string;
  address: string; // Street address
  city?: string;
  locality?: string;
  postal_code?: string;
  property_type: PropertyType;
  image_urls: string[];
  video_url?: string;
  price: number;
  visibility: 'Pública' | 'Privada';
  views: number;
  compatible_candidates: number;
  conditions?: string;
  features?: PropertyFeatures;
  available_from: string;
  lat: number;
  lng: number;
  status: 'approved' | 'pending' | 'rejected';
  bathrooms?: number;
}

export interface HostListing {
  id: number;
  host_id: string;
  title: string;
  description?: string;
  room_type: string;
  price: number;
  city?: string;
  locality?: string;
  address?: string;
  available_from?: string;
  amenities?: PropertyFeatures;
  conditions?: string;
  image_urls?: string[];
  visibility: 'Pública' | 'Privada';
  status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface OwnerStats {
    monthlyEarnings: { name: string; earnings: number }[];
    totalProperties: number;
    totalViews: number;
    totalCandidates: number;
}

export enum NotificationType {
  NEW_MATCH = 'NEW_MATCH',
  NEW_MESSAGE = 'NEW_MESSAGE',
  PROPERTY_INQUIRY = 'PROPERTY_INQUIRY',
  CANDIDATE_ALERT = 'CANDIDATE_ALERT',
  SAVED_SEARCH_MATCH = 'SAVED_SEARCH_MATCH',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
}

export interface Notification {
  id: number;
  user_id: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  metadata?: Record<string, unknown> | null;
  delivered_at: string;
  read_at?: string | null;
  created_at: string;
}

export interface SavedSearch {
  id: number;
  user_id: string;
  name: string;
  filters: {
    city?: string;
    locality?: string;
    keyword?: string;
    min_price?: number;
    max_price?: number;
    amenities?: AmenityId[];
    property_type?: PropertyType;
    bathrooms?: number;
  };
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image_url: string;
  content: string; 
  author: string;
  author_image_url: string;
  publish_date: string;
}

export type ConvivenciaQuizAnswer = {
  questionId: string;
  answerId: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
};

export type OnboardingStep = {
  id: string;
  title: string;
  description?: string;
  cta?: string;
  inputs?: Array<{
    name: string;
    label: string;
    placeholder?: string;
    type?: 'text' | 'textarea' | 'number' | 'select' | 'choice';
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
    helper?: string;
  }>;
};
