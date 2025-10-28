import { supabase } from '../../lib/supabase';

export async function ensureAffiliateCode(): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_or_get_affiliate');
  if (error || !data) return null;
  if (Array.isArray(data)) {
    return (data[0] as { code?: string } | undefined)?.code ?? null;
  }
  return (data as { code?: string }).code ?? null;
}

export async function attachReferralOnSignup(userId: string) {
  const ref = localStorage.getItem('moon_ref') || null;
  if (!ref) return;
  await supabase.rpc('attach_referral_if_first', {
    p_referred_auth_user_id: userId,
    p_ref_code: ref,
  });
}

export async function getMyKpis() {
  const { data } = await supabase.from('aff.v_affiliate_kpis').select('*').single();
  return data || null;
}

export async function getMyAffiliateCode() {
  const { data } = await supabase.from('aff.v_my_affiliate').select('*').single();
  return data?.code || null;
}

export async function getMyMonthlyHistory() {
  const { data } = await supabase.from('aff.v_affiliate_commissions_by_month').select('*');
  return data || [];
}
