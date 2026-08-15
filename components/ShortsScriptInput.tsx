import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, VideoCameraIcon, SpinnerIcon } from './icons';

type AdTone = '트렌디' | '도발적' | '클래식';

interface ShortsScriptInputProps {
    specialist: Specialist;
    onAnalyze: (data: { productInfo: string, adTone: AdTone }) => void;
    onBack: () => void;
    isLoading: boolean;
}

const ShortsScriptInput: React.FC<ShortsScriptInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [productInfo, setProductInfo] = useState('');
    const [adTone, setAdTone] = useState<AdTone>('트렌디');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (productInfo.trim()) {
            onAnalyze({ productInfo, adTone });
        }
    };

    const isFormIncomplete = !productInfo.trim();

    const toneOptions: { value: AdTone; label: string; description: string }[] = [
        { value: '트렌디', label: '🚀 트렌디', description: '요즘 유행하는 밈과 빠른 템포를 활용해요.' },
        { value: '도발적', label: '🔥 도발적', description: '강렬한 질문과 파격적인 영상미로 시선을 끌어요.' },
        { value: '클래식', label: '🎬 클래식', description: '제품의 가치를 감성적인 스토리텔링으로 전달해요.' },
    ];

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
                    15초 안에 고객을 사로잡는 바이럴 쇼츠 영상 대본을 만들어 드려요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="productInfo" className="block text-lg font-medium text-ink">
                        영상으로 만들 제품/서비스
                    </label>
                    <p className="text-xs text-slate-ink mb-2">
                        광고하고 싶은 제품이나 서비스의 특징, 장점, 타겟 고객 등을 자유롭게 적어주세요.
                    </p>
                    <textarea
                        id="productInfo"
                        rows={6}
                        value={productInfo}
                        onChange={(e) => setProductInfo(e.target.value)}
                        className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                        placeholder="예: 저희 가게 신메뉴 비건 당근 케이크예요. 동물성 재료 없이도 깊고 촉촉한 맛이 특징이고, 20-30대 여성분들이 좋아해요."
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium text-ink">
                        광고 톤 선택
                    </label>
                    <fieldset className="mt-2">
                        <legend className="sr-only">Ad tone</legend>
                        <div className="space-y-2">
                            {toneOptions.map((option) => (
                                <label key={option.value} htmlFor={option.value} className={`relative flex items-start p-3 border rounded-sm cursor-pointer transition-all ${adTone === option.value ? 'bg-parchment border-rule-strong ring-2 ring-rule' : 'border-rule bg-linen hover:bg-parchment'}`}>
                                    <div className="flex items-center h-5">
                                        <input
                                            id={option.value}
                                            name="ad-tone"
                                            type="radio"
                                            value={option.value}
                                            checked={adTone === option.value}
                                            onChange={() => setAdTone(option.value as AdTone)}
                                            className="focus:ring-ink h-4 w-4 text-ink border-rule"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <p className="font-bold text-ink">{option.label}</p>
                                        <p className="text-slate-ink">{option.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>
                <button
                    type="submit"
                    disabled={isFormIncomplete || isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-sm text-base font-medium text-paper bg-ink hover:bg-carbon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:bg-rule-strong disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            대본 생성 중...
                        </>
                    ) : (
                        <>
                            <VideoCameraIcon className="w-5 h-5" />
                            AI 쇼츠 대본 생성하기
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ShortsScriptInput;
