import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { SparklesIcon, PencilIcon } from './icons';
import { UPDATED_BAKERY_DESCRIPTION } from '../constants';

interface BusinessProfileSetupProps {
  onSave: (description: string) => void;
  initialDescription?: string;
  /**
   * 분석이 실패하면 App이 이 화면으로 되돌린다. 그때 이유를 여기서 보여주지 않으면
   * 사용자에게는 "버튼을 눌러도 아무 일이 없는" 것으로만 보인다.
   */
  error?: string | null;
}

const BusinessProfileSetup: React.FC<BusinessProfileSetupProps> = ({ onSave, initialDescription, error }) => {
  const [description, setDescription] = useState(initialDescription || '');

  useEffect(() => {
    // Sync state with prop changes, this is crucial for the "Edit" flow
    if (initialDescription) {
      setDescription(initialDescription);
    }
  }, [initialDescription]);

  const isEditMode = !!initialDescription;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSave(description);
    }
  };
  
  const isFormIncomplete = !description.trim();

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-linen rounded-sm space-y-6 animate-fade-in border border-rule">
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border-l-2 border-red-500 bg-red-50/60 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">분석을 완료하지 못했습니다.</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-bold text-ink">
            {isEditMode ? '우리 가게 정보 업데이트' : 'AI 비즈니스 파트너, BizFlow Coach'}
        </h2>
        <p className="mt-2 text-carbon">
          {isEditMode 
            ? '변경된 비즈니스 정보를 수정해주세요. AI 팀원들이 업데이트된 내용을 즉시 학습합니다.' 
            : '안녕하세요 사장님! BizFlow Coach를 시작하기 위해, 당신의 비즈니스에 대해 자유롭게 알려주세요.'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-lg font-medium text-ink">
            나의 비즈니스 이야기
          </label>
           <p className="text-xs text-slate-ink mb-2">
             {isEditMode 
                ? '직원 수, 메뉴, 가격 등 변경된 부분을 중심으로 수정해주세요.'
                : '가게 이름, 업종, 주요 메뉴나 제품, 직원 수 등을 포함해서 자유롭게 작성해주세요. 자세할수록 AI의 코칭이 정확해집니다!'}
          </p>

          {isEditMode && (
            <div className="my-3 p-3 bg-yellow-50 border border-yellow-300 rounded-sm text-sm text-yellow-800">
                <p>
                    <strong>테스트 시나리오:</strong> 아래 버튼을 눌러 직원이 1명 늘고, 일부 메뉴 가격이 인상된 상황을 시뮬레이션 해보세요.
                </p>
                <button
                    type="button"
                    onClick={() => setDescription(UPDATED_BAKERY_DESCRIPTION)}
                    className="mt-2 px-3 py-1 bg-yellow-400 text-yellow-900 font-semibold rounded-sm hover:bg-yellow-500 text-xs"
                >
                    수정된 정보 불러오기
                </button>
            </div>
          )}

          <textarea
            id="description"
            rows={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
            placeholder="예시)
저는 목동역 근처에서 작은 1인 카페를 운영하고 있습니다. 가게 이름은 '목동역 1인 카페'이고, 주로 커피와 직접 구운 쿠키를 팔고 있어요. 저 혼자 모든 것을 담당하고 있답니다."
          />
        </div>
        <button
          type="submit"
          disabled={isFormIncomplete}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-sm text-base font-medium text-paper bg-ink hover:bg-carbon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:bg-rule-strong disabled:cursor-not-allowed"
        >
          {isEditMode ? <PencilIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
          {isEditMode ? 'AI 프로필 업데이트하기' : 'AI 프로필 분석 및 시작하기'}
        </button>
      </form>
    </div>
  );
};

export default BusinessProfileSetup;