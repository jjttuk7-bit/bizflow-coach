import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from './icons';

interface CSCoachInputProps {
    specialist: Specialist;
    onAnalyze: (data: { review: string; context: string }) => void;
    onBack: () => void;
    isLoading: boolean;
}

const CSCoachInput: React.FC<CSCoachInputProps> = ({ specialist, onAnalyze, onBack, isLoading }) => {
    const [review, setReview] = useState('');
    const [context, setContext] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (review.trim()) {
            onAnalyze({ review, context });
        }
    };

    const isFormIncomplete = !review.trim();

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
                    마음 아픈 리뷰, 혼자 끙끙 앓지 마세요. 위기를 기회로 바꿀 전략을 함께 찾아 드릴게요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="review" className="block text-lg font-medium text-ink">
                        마음을 아프게 한 고객 리뷰
                    </label>
                    <p className="text-xs text-slate-ink mb-2">
                        대응하고 싶은 고객 리뷰 내용을 그대로 복사해서 붙여넣어 주세요.
                    </p>
                    <textarea
                        id="review"
                        rows={5}
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                        placeholder="예: 별점 1점 / 배달이 너무 늦게 왔고 빵은 다 식어있었어요. 다신 안 시켜요."
                    />
                </div>
                <div>
                    <label htmlFor="context" className="block text-lg font-medium text-ink">
                        당시 상황 설명 (선택 사항)
                    </label>
                    <p className="text-xs text-slate-ink mb-2">
                        혹시 그날따라 배달이 밀렸거나, 특별한 상황이 있었다면 알려주세요. 더 정확한 맞춤 해결책을 드릴 수 있어요.
                    </p>
                    <textarea
                        id="context"
                        rows={3}
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="mt-1 block w-full p-3 bg-paper border border-rule rounded-sm focus:outline-none focus:ring-ink focus:border-ink sm:text-sm"
                        placeholder="예: 비가 많이 와서 배달이 전체적으로 늦어졌어요. 고객에게 미리 안내를 못 드렸습니다."
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
                            솔루션 분석 중...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            AI 리뷰 대응 솔루션 받기
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CSCoachInput;
