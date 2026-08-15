import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from './icons';

interface ECommerceCoachInputProps {
    specialist: Specialist;
    onAnalyze: (data: { productInfo: string; }) => void;
    onBack: () => void;
    isLoading: boolean;
}

const ECommerceCoachInput: React.FC<ECommerceCoachInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [productInfo, setProductInfo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (productInfo.trim()) {
            onAnalyze({ productInfo });
        }
    };

    const isFormIncomplete = !productInfo.trim();

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-linen rounded-sm animate-fade-in space-y-6 relative border border-rule">
             <button onClick={onBack} className="absolute top-6 left-6 text-slate-ink hover:text-ink transition-colors">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="text-center">
                 <div className={`mx-auto mb-4 p-3 inline-block rounded-full ${specialist.classes.bg}`}>
                    <specialist.Icon className={`w-10 h-10 ${specialist.classes.text}`} />
                </div>
                <h2 className="text-2xl font-bold text-ink">
                     {`${specialist.role} ${specialist.name}`}
                </h2>
                <p className="mt-2 text-carbon">
                    온라인 판매 성공의 첫 걸음, 상품 상세페이지와 광고 전략을 설계해 드립니다.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="productInfo" className="block text-lg font-medium text-ink">
                        온라인에서 판매할 상품 정보
                    </label>
                    <p className="text-xs text-slate-ink mb-2">
                        판매하려는 상품의 이름, 특징, 장점, 주요 고객층, 가격대 등을 자세히 알려주세요.
                    </p>
                    <textarea
                        id="productInfo"
                        rows={8}
                        value={productInfo}
                        onChange={(e) => setProductInfo(e.target.value)}
                        className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                        placeholder="예: 상품명: '성수 베이크' 비건 소금빵 (냉동 생지) / 특징: 100% 식물성 재료, 쫄깃하고 담백한 맛 / 타겟 고객: 20-30대 여성, 비건, 건강에 관심 많은 사람 / 가격: 5개입 1세트 15,000원"
                    />
                </div>
                
                <button
                    type="submit"
                    disabled={isFormIncomplete || isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-sm text-base font-medium text-paper bg-ink hover:bg-carbon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:bg-rule-strong disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            전략 수립 중...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            AI 온라인 판매 전략 받기
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ECommerceCoachInput;
