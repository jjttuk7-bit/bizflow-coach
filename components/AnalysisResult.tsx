import React, { useState, useEffect, useRef } from 'react';
import { Specialist, ConversationMessage, ChartData } from '../types';
import { ArrowLeftIcon, SpinnerIcon, SparklesIcon, PaperAirplaneIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';
import SalesChart from './SalesChart';

interface AnalysisResultProps {
    specialist: Specialist;
    result: string | null;
    isLoading: boolean;
    error: string | null;
    onBack: () => void;
    continueButtonText?: string;
    showSimulateButton?: boolean;
    onSimulate?: () => void;
    showProfitGoalInput?: boolean;
    onProfitGoalSubmit?: (goal: string) => void;
    charts?: ChartData[] | null;
    conversation: ConversationMessage[];
    onFollowUpQuery?: (query: string) => void;
    isFollowUpLoading?: boolean;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ 
    specialist, 
    result, 
    isLoading, 
    error, 
    onBack, 
    continueButtonText, 
    showSimulateButton, 
    onSimulate,
    showProfitGoalInput,
    onProfitGoalSubmit,
    charts,
    conversation,
    onFollowUpQuery,
    isFollowUpLoading
}) => {
    const [goal, setGoal] = useState('');
    const [followUpInput, setFollowUpInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (conversation && conversation.length > 0) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [conversation, isFollowUpLoading]);

    const handleGoalSubmit = () => {
        if (onProfitGoalSubmit && goal.trim()) {
            onProfitGoalSubmit(goal.trim());
            setGoal('');
        }
    };
    
    const handleFollowUpSend = () => {
        if (followUpInput.trim() && onFollowUpQuery && !isFollowUpLoading) {
            onFollowUpQuery(followUpInput);
            setFollowUpInput('');
        }
    };

    const handleFollowUpKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFollowUpSend();
        }
    };

    const renderChatMessage = (msg: ConversationMessage, index: number) => {
        if (msg.author === 'system') {
            return (
                <div key={index} className="text-center my-4">
                    <span className="px-3 py-1 bg-rule text-carbon rounded-full text-xs font-medium">{msg.text}</span>
                </div>
            )
        }

        const isUser = msg.author === 'user';
        
        return (
             <div key={index} className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {/* FIX: Use a type guard to ensure msg.author is a Specialist object before accessing its properties. */}
                {!isUser && typeof msg.author === 'object' && msg.author && (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${msg.author.classes.bg}`}>
                        <msg.author.Icon className={`w-5 h-5 ${msg.author.classes.text}`} />
                    </div>
                )}
                <div className={`max-w-md lg:max-w-lg p-3 rounded-sm ${isUser ? 'bg-ink text-paper rounded-br-none' : 'bg-linen text-ink rounded-bl-none'}`}>
                   <MarkdownRenderer content={msg.text} />
                </div>
            </div>
        )
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-8 bg-linen rounded-sm animate-fade-in space-y-6 relative border border-rule">
            <button onClick={onBack} className="absolute top-6 left-6 text-slate-ink hover:text-ink transition-colors z-10">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
                 <div className={`mx-auto mb-4 p-3 inline-block rounded-full ${specialist.classes.bg}`}>
                    <specialist.Icon className={`w-10 h-10 ${specialist.classes.text}`} />
                </div>
                <h2 className={`text-2xl font-bold ${specialist.classes.nameText}`}>{specialist.name}</h2>
                <p className="text-md text-carbon">{specialist.role}</p>
            </div>

            {charts && charts.length > 0 && (
                <div className="space-y-6 p-4 border border-rule rounded-sm bg-paper">
                    {charts.map((chart, index) => (
                        <div key={index} className="max-w-full mx-auto">
                           <SalesChart chartData={chart} />
                        </div>
                    ))}
                </div>
            )}

            <div className="p-6 bg-paper rounded-sm min-h-[300px] overflow-y-auto max-h-[60vh]">
                {isLoading && conversation.length === 0 && (
                     <div className="flex flex-col items-center justify-center h-full">
                        <SpinnerIcon className="w-12 h-12 animate-spin text-ink" />
                        <p className="mt-4 text-lg text-carbon">AI가 분석 중입니다...</p>
                    </div>
                )}
                {error && (
                    <div className="text-center text-red-600 bg-red-100 p-4 rounded-sm">
                        <p className="font-semibold">오류 발생</p>
                        <p>{error}</p>
                    </div>
                )}
                
                {conversation && conversation.length > 0 ? (
                    <div className="space-y-6">
                       {conversation.map(renderChatMessage)}

                       {isFollowUpLoading && (
                           <div className="flex items-end gap-3 justify-start">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${specialist.classes.bg}`}>
                                  <specialist.Icon className={`w-5 h-5 ${specialist.classes.text}`} />
                              </div>
                              <div className="max-w-md lg:max-w-lg p-3 rounded-sm bg-linen text-ink rounded-bl-none border border-rule">
                                  <div className="flex items-center gap-2">
                                      <SpinnerIcon className="w-5 h-5 animate-spin"/>
                                      <span>답변을 생각 중입니다...</span>
                                  </div>
                              </div>
                          </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>
                ) : (
                    result && <MarkdownRenderer content={result} />
                )}
            </div>
            
            {onFollowUpQuery && !isLoading && (result || (conversation && conversation.length > 0)) && (
                <div className="mt-4 pt-4 border-t border-rule">
                    <label className="block text-md font-bold text-carbon mb-2">이 리포트에 대해 추가 질문하기</label>
                    <div className="relative">
                        <textarea
                            value={followUpInput}
                            onChange={(e) => setFollowUpInput(e.target.value)}
                            onKeyPress={handleFollowUpKeyPress}
                            placeholder={`'${specialist.name}'에게 질문하기... (다른 전문가에게 업무 요청도 가능해요!)`}
                            className="w-full p-3 pr-12 border border-rule rounded-sm focus:ring-ink focus:border-ink resize-none bg-linen"
                            rows={1}
                            disabled={isFollowUpLoading}
                        />
                        <button
                            onClick={handleFollowUpSend}
                            disabled={!followUpInput.trim() || isFollowUpLoading}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink text-paper hover:bg-carbon disabled:bg-rule-strong disabled:cursor-not-allowed"
                            aria-label="Send message"
                        >
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}


            {showProfitGoalInput && onProfitGoalSubmit && (
                 <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-sm flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-grow">
                        <label htmlFor="profit-goal" className="block text-sm font-bold text-yellow-800">월 순수익 목표 금액을 알려주시면, AI 코치 '로이'가 목표 달성 플랜을 제안해 드려요.</label>
                        <input
                            type="text"
                            id="profit-goal"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="mt-1 block w-full p-2 bg-linen border border-yellow-300 rounded-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
                            placeholder="예: 500만원"
                        />
                    </div>
                    <button 
                        onClick={handleGoalSubmit} 
                        disabled={!goal.trim() || isLoading}
                        className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-paper font-semibold rounded-sm hover:bg-yellow-600 disabled:bg-rule-strong"
                    >
                         {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                         목표 달성 플랜 받기
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4">
                {showSimulateButton && onSimulate && (
                    <button
                        onClick={onSimulate}
                        className="w-full sm:w-auto px-6 py-2 border border-ink text-ink font-semibold rounded-sm hover:bg-parchment"
                    >
                        3일 후 재고 상황 시뮬레이션하기
                    </button>
                )}
                <button
                    onClick={onBack}
                    className="w-full sm:w-auto px-6 py-2 bg-ink text-paper font-semibold rounded-sm hover:bg-carbon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink"
                >
                    {continueButtonText || '대시보드로 돌아가기'}
                </button>
            </div>
        </div>
    );
};

export default AnalysisResult;