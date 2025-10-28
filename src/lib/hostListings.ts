import { supabase } from './supabaseClient';
import { HostListing, PropertyFeatures } from '../types';

export type HostListingInput = {
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
    visibility?: 'Pública' | 'Privada';
    status?: 'pending' | 'approved' | 'rejected';
};

export const fetchAllHostListings = async () => {
    return supabase.from('host_listings').select('*').order('created_at', { ascending: false });
};

export const fetchHostListingsByHost = async (hostId: string) => {
    return supabase
        .from('host_listings')
        .select('*')
        .eq('host_id', hostId)
        .order('created_at', { ascending: false });
};

export const createHostListing = async (hostId: string, payload: HostListingInput) => {
    const { data, error } = await supabase
        .from('host_listings')
        .insert({
            host_id: hostId,
            ...payload,
        })
        .select()
        .single();

    return { data: data as HostListing | null, error };
};

export const updateHostListing = async (listingId: number, payload: Partial<HostListingInput>) => {
    const { data, error } = await supabase
        .from('host_listings')
        .update({
            ...payload,
            updated_at: new Date().toISOString(),
        })
        .eq('id', listingId)
        .select()
        .single();

    return { data: data as HostListing | null, error };
};

export const deleteHostListing = async (listingId: number) => {
    return supabase.from('host_listings').delete().eq('id', listingId);
};
