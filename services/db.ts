import { supabase } from '../lib/supabase';
import { BusinessProfile } from '../types';

/**
 * Supabase 데이터 접근 레이어.
 * 컴포넌트가 테이블 이름·컬럼명을 직접 알지 않도록 여기서만 다룬다.
 */

/**
 * Supabase 오류를 원인이 드러나는 문장으로 바꾼다.
 * "불러오지 못했습니다"만 보여주면 스키마 미적용인지 권한 문제인지 구분할 수 없다.
 */
function describeDbError(error: { code?: string; message?: string }, fallback: string): string {
  const code = error.code ?? '';
  const msg = (error.message ?? '').toLowerCase();

  // 42P01: 테이블 없음 / PGRST205: PostgREST 스키마 캐시에 테이블 없음
  if (code === '42P01' || code === 'PGRST205' || msg.includes('does not exist') || msg.includes('could not find the table')) {
    return '데이터베이스 테이블이 아직 만들어지지 않았습니다. Supabase SQL Editor에서 supabase/schema.sql을 실행해주세요.';
  }
  // 42501: RLS 등 권한 거부
  if (code === '42501' || msg.includes('permission denied') || msg.includes('row-level security')) {
    return '데이터 접근 권한이 없습니다. supabase/schema.sql의 RLS 정책이 적용되었는지 확인해주세요.';
  }
  return fallback;
}

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
    throw new Error(describeDbError(error, '프로필을 불러오지 못했습니다.'));
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
    throw new Error(describeDbError(error, '프로필을 저장하지 못했습니다.'));
  }
}
