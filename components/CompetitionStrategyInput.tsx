import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, MapPinIcon, SpinnerIcon } from './icons';

interface CompetitionStrategyInputProps {
    specialist: Specialist;
    onAnalyze: (data: { ourStore: string, competitorStore: string, areaInfo: string }) => void;
    onBack: () => void;
    isLoading: boolean;
}

const CompetitionStrategyInput: React.FC<CompetitionStrategyInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [ourStore, setOurStore] = useState('');
    const [competitorStore, setCompetitorStore] = useState('');
    const [areaInfo, setAreaInfo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (ourStore.trim() && competitorStore.trim() && areaInfo.trim()) {
            onAnalyze({ ourStore, competitorStore, areaInfo });
        }
    };

    const isFormIncomplete = !ourStore.trim() || !competitorStore.trim() || !areaInfo.trim();

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
                    로컬 상권에서 승리하기 위해, 우리 가게와 경쟁사, 상권 정보를 입력해주세요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="ourStore" className="block text-lg font-medium text-ink">
                        우리 가게 정보 (업소 A)
                    </label>
                    <p className="text-xs text-slate-ink mb-2">
                        업종, 주메뉴, 평균 가격, 수용 인원, 고객 리뷰 요약 등을 자세히 적어주세요.
                    </p>
                    <textarea
                        id="ourStore"
                        rows={5}
                        value={ourStore}
                        onChange={(e) => setOurStore(e.target.value)}
                        className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                        placeholder="우리 가게의 상세 정보를 입력해주세요..."
                    />
                </div>
                <div>
                    <label htmlFor="competitorStore" className="block text-lg font-medium text-ink">
                        경쟁 가게 정보 (업소 B)
                    </label>
                    <p className="text-xs text-slate-ink mb-2">
                        분석하고 싶은 경쟁사의 업종, 주메뉴, 가격, 고객 반응 등을 아는 대로 적어주세요.
                    </p>
                    <textarea
                        id="competitorStore"
                        rows={5}
                        value={competitorStore}
                        onChange={(e) => setCompetitorStore(e.target.value)}
                        className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                        placeholder="경쟁 가게의 정보를 입력해주세요..."
                    />
                </div>
                <div>
                    <label htmlFor="areaInfo" className="block text-lg font-medium text-ink">
                        상권 정보
                    </label>
                    <p className="text-xs text-slate-ink mb-2">
                        가게가 위치한 상권의 특징, 유동인구 패턴, 주요 고객 연령대, 수요가 많은 시간대 등을 적어주세요.
                    </p>
                    <textarea
                        id="areaInfo"
                        rows={5}
                        value={areaInfo}
                        onChange={(e) => setAreaInfo(e.target.value)}
                        className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                        placeholder="상권의 특징을 입력해주세요..."
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
                            분석 중...
                        </>
                    ) : (
                        <>
                            <MapPinIcon className="w-5 h-5" />
                            로컬 승리 공식 분석 요청
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CompetitionStrategyInput;
