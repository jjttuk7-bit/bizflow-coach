import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from './icons';

interface SalesAnalysisInputProps {
    specialist: Specialist;
    onAnalyze: (salesData: string) => void;
    onBack: () => void;
    isLoading: boolean;
}

const SalesAnalysisInput: React.FC<SalesAnalysisInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [salesData, setSalesData] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (salesData.trim()) {
            onAnalyze(salesData);
        }
    };

    const isFormIncomplete = !salesData.trim();

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
                    매출 데이터 속에 숨어있는 성장 기회를 찾아드릴게요. 아래에 매출 데이터를 입력해주세요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="salesData" className="block text-lg font-medium text-gray-800">
                        매출 데이터 입력
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        일별, 주별, 월별 매출 데이터를 자유롭게 붙여넣어 주세요. 메뉴별 판매량, 시간대별 정보가 포함되면 더 정확한 분석이 가능해요.
                    </p>
                    <textarea
                        id="salesData"
                        rows={10}
                        value={salesData}
                        onChange={(e) => setSalesData(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예시)
- 7월 1주차 매출: 1,500,000원
- 비건 소금빵: 200개 판매
- 두부 크림빵: 150개 판매
- 주말 오후 2-4시에 손님이 가장 많음"
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
                            <SparklesIcon className="w-5 h-5" />
                            AI 매출 분석 리포트 받기
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SalesAnalysisInput;
