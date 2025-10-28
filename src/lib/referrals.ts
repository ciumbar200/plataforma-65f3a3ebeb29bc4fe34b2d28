import { supabase } from './supabaseClient';

export async function ensureReferralCode(userId: string): Promise<{ code?: string; error?: string }> {
  const { data, error } = await supabase.rpc('ensure_referral_link', { uid: userId });
  if (error) return { error: error.message };
  return { code: data as string };
}

export async function fetchMyReferrals(userId: string) {
  const { data, error } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false });
  if (error) return { error: error.message };
  return { data };
}

export async function attributeReferral(code: string, email?: string) {
  const { data, error } = await supabase.rpc('attribute_referral', { p_code: code, p_email: email ?? null });
  if (error) return { error: error.message };
  return { data };
}
