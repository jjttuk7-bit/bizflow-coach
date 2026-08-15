import { supabase } from '../lib/supabase';
import { BusinessProfile } from '../types';

/**
 * Supabase 데이터 접근 레이어.
 * 컴포넌트가 테이블 이름·컬럼명을 직접 알지 않도록 여기서만 다룬다.
 */

export interface StoredProfile {
  businessProfile: BusinessProfile | null;
  fullDescription: string | null;
}

export async function loadProfile(userId: string): Promise<StoredProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('business_profile, full_description')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[db.loadProfile]', error);
    throw new Error('프로필을 불러오지 못했습니다.');
  }
  if (!data) return null;

  return {
    businessProfile: (data.business_profile as BusinessProfile | null) ?? null,
    fullDescription: data.full_description ?? null,
  };
}

export async function saveProfile(
  userId: string,
  email: string | null,
  businessProfile: BusinessProfile,
  fullDescription: string,
): Promise<void> {
  // 가입 트리거가 행을 미리 만들지만, 트리거 이전에 만들어진 계정도 있을 수 있어
  // upsert로 처리한다.
  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      email,
      business_profile: businessProfile,
      full_description: fullDescription,
    },
    { onConflict: 'id' },
  );

  if (error) {
    console.error('[db.saveProfile]', error);
    throw new Error('프로필을 저장하지 못했습니다.');
  }
}
