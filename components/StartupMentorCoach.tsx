import React, { useState } from 'react';
import { Specialist } from '../types';
import { getStartupMentoring } from '../services/coachApi';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface StartupMentorCoachProps {
    specialist: Specialist;
    onBack: () => void;
    specialists: Specialist[]; // For collaboration recommendations
}

const StartupMentorCoach: React.FC<StartupMentorCoachProps> = ({ specialist, onBack, specialists }) => {
    const [stage, setStage] = useState<'input' | 'analyzing' | 'result'>('input');
    const [businessPlan, setBusinessPlan] = useState('');
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMentoringRequest = async () => {
        if (!businessPlan.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setStage('analyzing');
        
        try {
            const result = await getStartupMentoring(businessPlan, specialists);
            setAnalysisResult(result);
            setStage('result');
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(errorMessage);
            setStage('input');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRestart = () => {
        setStage('input');
        setAnalysisResult(null);
        setError(null);
    };

    const renderInputStage = () => (
        <div className="space-y-4">
            <p className="text-carbon text-center">
                아, F&B(푸드 앤 비버리지) 창업이라니! 재미있지만 리스크도 큰 분야죠. <br/>
                사장님의 성공적인 창업을 위해, 구상 중인 사업 계획을 아래에 자유롭게 작성해주세요.
            </p>
            <textarea
                id="businessPlan"
                rows={10}
                value={businessPlan}
                onChange={(e) => setBusinessPlan(e.target.value)}
                className="block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                placeholder="예시) 서울 연남동에 10평 규모의 디저트 카페를 열고 싶어요. 주 메뉴는 직접 개발한 크림 브륄레 도넛이고, 타겟 고객은 20대 여성입니다. 인테리어는 아기자기하게 꾸미고, 인스타그램 마케팅에 집중할 계획입니다..."
                disabled={isLoading}
            />
            {error && <div className="p-3 bg-red-100 text-red-700 rounded-sm text-sm">{error}</div>}
            <button
                onClick={handleMentoringRequest}
                disabled={!businessPlan.trim() || isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-sm text-base font-medium text-paper bg-ink hover:bg-carbon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink disabled:bg-rule-strong disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <>
                        <SpinnerIcon className="w-5 h-5 animate-spin" />
                        분석 중...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="w-5 h-5" />
                        AI 맞춤 멘토링 받기
                    </>
                )}
            </button>
        </div>
    );

    const renderAnalyzingStage = () => (
        <div className="flex flex-col items-center justify-center text-center h-48">
            <SpinnerIcon className="w-12 h-12 text-ink animate-spin" />
            <p className="mt-4 text-lg text-carbon">이든 멘토가 사장님의 사업 계획을 꼼꼼히 분석하고 있습니다...</p>
            <p className="text-sm text-slate-ink">잠시만 기다려주세요.</p>
        </div>
    );

    const renderResultStage = () => (
        <div className="space-y-6">
            <div className="p-4 bg-parchment border border-rule rounded-sm">
                <h3 className="text-lg font-bold text-carbon">사장님의 사업 계획을 위한 맞춤 멘토링</h3>
                <p className="mt-1 text-sm text-carbon">아래 10가지 핵심 원칙에 따라 사장님의 아이디어를 분석하고 조언을 정리했습니다. 각 항목을 눌러 확인해보세요.</p>
            </div>
            {analysisResult && <MarkdownRenderer content={analysisResult} />}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4">
                <button
                    onClick={handleRestart}
                    className="w-full sm:w-auto px-6 py-2 border border-ink text-ink font-semibold rounded-sm hover:bg-parchment"
                >
                    다른 계획으로 다시 분석하기
                </button>
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-6 py-2 bg-ink text-paper font-semibold rounded-sm hover:bg-carbon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink"
                >
                    대시보드로 돌아가기
                </button>
            </div>
        </div>
    );
    
    return (
        <div className="w-full max-w-4xl mx-auto p-8 bg-linen rounded-sm animate-fade-in space-y-6 relative border border-rule">
            <button onClick={onBack} className="absolute top-6 left-6 text-slate-ink hover:text-ink transition-colors z-10">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <header className="text-center">
                 <div className={`mx-auto mb-4 p-3 inline-block rounded-full ${specialist.classes.bg}`}>
                    <specialist.Icon className={`w-10 h-10 ${specialist.classes.text}`} />
                </div>
                <h2 className={`text-2xl font-bold ${specialist.classes.nameText}`}>{specialist.name}</h2>
                <p className="text-md text-carbon">{specialist.role}</p>
            </header>
            
            <div className="border-t pt-6">
                {stage === 'input' && renderInputStage()}
                {stage === 'analyzing' && renderAnalyzingStage()}
                {stage === 'result' && renderResultStage()}
            </div>
        </div>
    );
};

export default StartupMentorCoach;
