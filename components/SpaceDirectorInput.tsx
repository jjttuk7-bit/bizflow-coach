import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, CubeTransparentIcon, SpinnerIcon } from './icons';

interface SpaceDirectorInputProps {
    specialist: Specialist;
    onAnalyze: (data: { storeSize: string; storeLayout: string; goals: string; }) => void;
    onBack: () => void;
    isLoading: boolean;
}

const SpaceDirectorInput: React.FC<SpaceDirectorInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [storeSize, setStoreSize] = useState('');
    const [storeLayout, setStoreLayout] = useState('');
    const [goals, setGoals] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (storeSize.trim() && storeLayout.trim() && goals.trim()) {
            onAnalyze({ storeSize, storeLayout, goals });
        }
    };

    const isFormIncomplete = !storeSize.trim() || !storeLayout.trim() || !goals.trim();

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
                    고객의 발길을 이끌고 지갑을 열게 만드는 공간을 함께 설계해봐요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="storeSize" className="block text-lg font-medium text-gray-800">
                        매장 평수와 형태
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        매장의 전체 평수와, 정사각형인지 직사각형인지 등 형태를 알려주세요.
                    </p>
                     <input
                        id="storeSize"
                        type="text"
                        value={storeSize}
                        onChange={(e) => setStoreSize(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 15평, 세로로 긴 직사각형 형태"
                    />
                </div>
                <div>
                    <label htmlFor="storeLayout" className="block text-lg font-medium text-gray-800">
                        현재 매장 구조
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        출입문, 계산대, 테이블, 주방 등의 현재 위치를 간단한 그림 그리듯 설명해주세요.
                    </p>
                    <textarea
                        id="storeLayout"
                        rows={5}
                        value={storeLayout}
                        onChange={(e) => setStoreLayout(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 출입문은 오른쪽에 있고, 들어오자마자 정면에 계산대가 있어요. 왼쪽 벽으로 테이블 4개가 일렬로 붙어있습니다."
                    />
                </div>
                 <div>
                    <label htmlFor="goals" className="block text-lg font-medium text-gray-800">
                        공간을 통해 이루고 싶은 목표
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        동선 개선, 특정 메뉴 강조, 편안한 분위기 연출 등 공간을 통해 얻고 싶은 것을 알려주세요.
                    </p>
                    <textarea
                        id="goals"
                        rows={3}
                        value={goals}
                        onChange={(e) => setGoals(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 손님들이 좀 더 편안하게 머물다 갔으면 좋겠어요. 그리고 새로 나온 케이크 메뉴가 잘 보였으면 합니다."
                    />
                </div>
                <button
                    type="submit"
                    disabled={isFormIncomplete || isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            공간 분석 중...
                        </>
                    ) : (
                        <>
                            <CubeTransparentIcon className="w-5 h-5" />
                            AI 공간 전략 컨설팅 받기
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SpaceDirectorInput;
