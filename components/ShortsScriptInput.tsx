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
        <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg animate-fade-in space-y-6 relative">
             <button onClick={onBack} className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="text-center">
                 <div className={`mx-auto mb-4 p-3 inline-block rounded-full ${specialist.classes.bg}`}>
                    <specialist.Icon className={`w-10 h-10 ${specialist.classes.text}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                     {`${specialist.role} ${specialist.name}`}
                </h2>
                <p className="mt-2 text-gray-600">
                    15초 안에 고객을 사로잡는 바이럴 쇼츠 영상 대본을 만들어 드려요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="productInfo" className="block text-lg font-medium text-gray-800">
                        영상으로 만들 제품/서비스
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        광고하고 싶은 제품이나 서비스의 특징, 장점, 타겟 고객 등을 자유롭게 적어주세요.
                    </p>
                    <textarea
                        id="productInfo"
                        rows={6}
                        value={productInfo}
                        onChange={(e) => setProductInfo(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 저희 가게 신메뉴 비건 당근 케이크예요. 동물성 재료 없이도 깊고 촉촉한 맛이 특징이고, 20-30대 여성분들이 좋아해요."
                    />
                </div>
                <div>
                    <label className="block text-lg font-medium text-gray-800">
                        광고 톤 선택
                    </label>
                    <fieldset className="mt-2">
                        <legend className="sr-only">Ad tone</legend>
                        <div className="space-y-2">
                            {toneOptions.map((option) => (
                                <label key={option.value} htmlFor={option.value} className={`relative flex items-start p-3 border rounded-lg cursor-pointer transition-all ${adTone === option.value ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                                    <div className="flex items-center h-5">
                                        <input
                                            id={option.value}
                                            name="ad-tone"
                                            type="radio"
                                            value={option.value}
                                            checked={adTone === option.value}
                                            onChange={() => setAdTone(option.value as AdTone)}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <p className="font-bold text-gray-900">{option.label}</p>
                                        <p className="text-gray-500">{option.description}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>
                <button
                    type="submit"
                    disabled={isFormIncomplete || isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
