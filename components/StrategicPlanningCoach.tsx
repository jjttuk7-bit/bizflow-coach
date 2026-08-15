import React, { useState, useEffect, useRef } from 'react';
import { Specialist, BusinessProfile } from '../types';
import { getArchitectAssistance } from '../services/coachApi';
import { ArrowLeftIcon, PaperAirplaneIcon, SpinnerIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
    sender: 'user' | 'ai';
    text: string;
    isStrategyChoice?: boolean;
}

type CoachStage = 'initial' | 'positioning' | 'structuring' | 'refining' | 'done';

interface StrategicPlanningCoachProps {
    specialist: Specialist;
    onBack: () => void;
    businessProfile: BusinessProfile | null;
}

const StrategicPlanningCoach: React.FC<StrategicPlanningCoachProps> = ({ specialist, onBack, businessProfile }) => {
    const [stage, setStage] = useState<CoachStage>('initial');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: `안녕하세요, ${businessProfile?.name || '사장'}님! 저는 **${specialist.name}**입니다. 사장님의 위대한 아이디어를 세상을 설득할 강력한 문서로 함께 만들어가겠습니다. 어떤 아이디어를 기획하고 싶으신가요? (예: 신규 투자 유치를 위한 사업계획서, 대기업 납품을 위한 제품 제안서 등)`
        }]);
    }, [businessProfile, specialist]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const addMessage = (sender: 'user' | 'ai', text: string, options: Partial<Message> = {}) => {
        setMessages(prev => [...prev, { sender, text, ...options }]);
    };

    const formatHistory = (lastUserInput: string) => {
        return messages.map(m => `${m.sender === 'user' ? '사장님' : '아키텍트'}: ${m.text}`).join('\n') + `\n사장님: ${lastUserInput}`;
    };

    const handleUserSubmit = async () => {
        if (!userInput.trim() || isLoading) return;

        const currentInput = userInput;
        addMessage('user', currentInput);
        setUserInput('');
        setIsLoading(true);

        try {
            const history = formatHistory(currentInput);
            let response: string;
            switch (stage) {
                case 'initial':
                    response = await getArchitectAssistance('initial_questions', { topic: currentInput });
                    addMessage('ai', response);
                    setStage('positioning');
                    break;

                case 'positioning':
                    response = await getArchitectAssistance('positioning_choice', { history });
                    addMessage('ai', response, { isStrategyChoice: true });
                    // Stage will be updated by handleStrategySelect
                    break;
                
                case 'structuring':
                case 'refining':
                    response = await getArchitectAssistance('refinement', { history });
                    addMessage('ai', response);
                    addMessage('ai', "이 제안에 대해 어떻게 생각하시나요? 내용을 더 발전시키거나, 다음 단계로 넘어가기 위한 추가 정보를 알려주세요.");
                    setStage('refining');
                    break;
            }
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
            addMessage('ai', `죄송합니다. 오류가 발생했어요: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStrategySelect = async (strategy: string) => {
        if (isLoading) return;

        addMessage('user', `[${strategy}]으로 진행하고 싶습니다.`);
        setIsLoading(true);

        try {
            const history = formatHistory(`[${strategy}]으로 진행하고 싶습니다.`);
            const response = await getArchitectAssistance('structure_development', { history, strategy });
            addMessage('ai', response);
            setStage('structuring');
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
            addMessage('ai', `죄송합니다. 오류가 발생했어요: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isInputDisabled = isLoading || stage === 'done' || messages[messages.length-1]?.isStrategyChoice;
    
    const parseStrategies = (text: string): { title: string, description: string }[] => {
        const matches = [...text.matchAll(/\[(\d\.\s[^\]]+)\]:\s"([^"]+)"/g)];
        return matches.map(match => ({
            title: match[1],
            description: match[2]
        }));
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl flex flex-col h-[80vh] animate-fade-in">
            <header className="flex items-center p-4 border-b border-gray-200 relative">
                <button onClick={onBack} className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 hover:text-gray-800">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-center w-full flex items-center justify-center gap-3">
                     <div className={`p-2 inline-block rounded-full ${specialist.classes.bg}`}>
                        <specialist.Icon className={`w-6 h-6 ${specialist.classes.text}`} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{specialist.name}</h2>
                        <p className="text-sm text-gray-500">{specialist.role}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <div className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${specialist.classes.bg}`}>
                                    <specialist.Icon className={`w-5 h-5 ${specialist.classes.text}`} />
                                </div>
                            )}
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                               <MarkdownRenderer content={msg.text} />
                            </div>
                        </div>
                        {msg.isStrategyChoice && (
                            <div className="mt-4 pl-11 space-y-3">
                                {parseStrategies(msg.text).map((strategy, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleStrategySelect(strategy.title)}
                                        disabled={isLoading}
                                        className="w-full text-left p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <h4 className="font-bold text-indigo-700">{strategy.title}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${specialist.classes.bg}`}>
                            <specialist.Icon className={`w-5 h-5 ${specialist.classes.text}`} />
                        </div>
                        <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-sm">
                            <div className="flex items-center gap-2">
                                <SpinnerIcon className="w-5 h-5 animate-spin"/>
                                <span>전략을 설계 중입니다...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>
            
            <footer className="p-4 border-t border-gray-200 bg-white">
                 <div className="relative">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUserSubmit()}
                        placeholder={isInputDisabled ? "AI의 답변 또는 선택을 기다려주세요..." : "여기에 답변을 입력하세요..."}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isInputDisabled}
                    />
                    <button
                        onClick={handleUserSubmit}
                        disabled={!userInput.trim() || isInputDisabled}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default StrategicPlanningCoach;