

export enum UserRole {
  INQUILINO = 'INQUILINO',
  PROPIETARIO = 'PROPIETARIO',
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
  message: string;
  timestamp: string;
  read: boolean;
  related_entity_id?: number;
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