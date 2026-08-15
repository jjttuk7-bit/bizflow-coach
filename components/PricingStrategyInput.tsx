import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, TagIcon, SpinnerIcon } from './icons';

interface PricingStrategyInputProps {
    specialist: Specialist;
    onAnalyze: (data: { objective: string, cost: string, competition: string, customer: string }) => void;
    onBack: () => void;
    isLoading: boolean;
}

const PricingStrategyInput: React.FC<PricingStrategyInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [objective, setObjective] = useState('');
    const [cost, setCost] = useState('');
    const [competition, setCompetition] = useState('');
    const [customer, setCustomer] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (objective.trim() && cost.trim() && competition.trim() && customer.trim()) {
            onAnalyze({ objective, cost, competition, customer });
        }
    };

    const isFormIncomplete = !objective.trim() || !cost.trim() || !competition.trim() || !customer.trim();

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
                    데이터 기반 최적의 가격을 찾기 위해, 아래 정보를 자세히 입력해주세요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="objective" className="block text-lg font-medium text-gray-800">
                        [1단계] 가격으로 무엇을 얻고 싶으신가요?
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        우리 가게의 '얼굴'이 되는 가격, 어떤 목표를 이루고 싶으세요?
                    </p>
                    <input
                        id="objective"
                        type="text"
                        value={objective}
                        onChange={(e) => setObjective(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 더 많은 손님 확보, 가게 이미지 고급화, 높은 순이익 등"
                    />
                </div>
                 <div>
                    <label htmlFor="cost" className="block text-lg font-medium text-gray-800">
                        [2단계] 얼마에 만들어 얼마를 남기고 싶으신가요?
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        이 메뉴 하나를 만드는 데 얼마가 드나요? 가게 유지비와 원하는 순이익도 알려주세요.
                    </p>
                    <textarea
                        id="cost"
                        rows={3}
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 재료비 1,500원 / 월세+인건비 등 200만원 / 순이익은 30% 정도 남기고 싶어요."
                    />
                </div>
                 <div>
                    <label htmlFor="competition" className="block text-lg font-medium text-gray-800">
                        [2단계] 경쟁 가게는 어떤가요?
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        옆 가게는 얼마에 파나요? 우리 가게만의 특별한 점은 무엇인가요?
                    </p>
                    <textarea
                        id="competition"
                        rows={3}
                        value={competition}
                        onChange={(e) => setCompetition(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 옆집 A는 4,000원, B는 4,500원. 우리는 직접 로스팅한 유기농 원두를 쓰는 게 강점이에요."
                    />
                </div>
                 <div>
                    <label htmlFor="customer" className="block text-lg font-medium text-gray-800">
                        [2단계] 고객은 우리 가게를 어떻게 생각할까요?
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                       고객이 '이 정도는 내야지!' 하고 만족하며 지불할 만한 가격은 얼마일까요? 고객은 우리 제품/서비스의 어떤 점을 가장 좋아하나요?
                    </p>
                    <textarea
                        id="customer"
                        rows={3}
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예: 5,000원까지는 기분 좋게 낼 것 같아요. 건강한 유기농 재료를 쓴다는 점을 가장 큰 장점으로 생각해요."
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
                            <TagIcon className="w-5 h-5" />
                            최적 가격 전략 분석 요청
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default PricingStrategyInput;