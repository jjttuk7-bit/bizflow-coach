import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, MapPinIcon, SpinnerIcon } from './icons';

interface LocalMarketingInputProps {
    specialist: Specialist;
    onAnalyze: (data: { targetArea: string, targetCustomer: string, goal: string, budget: string }) => void;
    onBack: () => void;
    isLoading: boolean;
}

const LocalMarketingInput: React.FC<LocalMarketingInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [targetArea, setTargetArea] = useState('');
    const [targetCustomer, setTargetCustomer] = useState('');
    const [goal, setGoal] = useState('');
    const [budget, setBudget] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (targetArea.trim() && targetCustomer.trim() && goal.trim()) {
            onAnalyze({ targetArea, targetCustomer, goal, budget });
        }
    };

    const isFormIncomplete = !targetArea.trim() || !targetCustomer.trim() || !goal.trim();

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
                    우리 동네 1등 가게가 되기 위한 맞춤 홍보 전략! 아래 정보를 알려주시면, 저 폴이 바로 실행 가능한 액션 플랜을 짜드릴게요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="targetArea" className="block text-lg font-medium text-gray-800">
                        홍보 대상 지역
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        가장 집중하고 싶은 동네나 상권 이름을 알려주세요.
                    </p>
                    <input
                        id="targetArea"
                        type="text"
                        value={targetArea}
                        onChange={(e) => setTargetArea(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 서울시 마포구 연남동, 판교 테크노밸리 반경 1km"
                    />
                </div>
                <div>
                    <label htmlFor="targetCustomer" className="block text-lg font-medium text-gray-800">
                        핵심 타겟 고객
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        어떤 손님들이 우리 가게에 더 많이 왔으면 좋겠나요?
                    </p>
                    <textarea
                        id="targetCustomer"
                        rows={3}
                        value={targetCustomer}
                        onChange={(e) => setTargetCustomer(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 20대 후반 ~ 30대 초반의 직장인 여성, 어린 자녀와 함께 방문하는 30대 부모님"
                    />
                </div>
                 <div>
                    <label htmlFor="goal" className="block text-lg font-medium text-gray-800">
                        마케팅 목표
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        이번 홍보를 통해 가장 얻고 싶은 결과는 무엇인가요?
                    </p>
                    <input
                        id="goal"
                        type="text"
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 신규 고객 방문 20% 늘리기, 가게 인스타그램 팔로워 500명 달성, 신메뉴 알리기"
                    />
                </div>
                <div>
                    <label htmlFor="budget" className="block text-lg font-medium text-gray-800">
                        예상 월 예산 (선택)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        광고나 홍보에 사용할 수 있는 월 예산을 알려주시면, 더 현실적인 전략을 제안해 드려요.
                    </p>
                    <input
                        id="budget"
                        type="text"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 월 10만원, 월 50만원"
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
                            분석 중...
                        </>
                    ) : (
                        <>
                            <MapPinIcon className="w-5 h-5" />
                            AI 로컬 마케팅 전략 분석 요청
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default LocalMarketingInput;