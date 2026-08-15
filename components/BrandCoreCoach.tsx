import React, { useState, useEffect, useRef } from 'react';
import { Specialist, BusinessProfile } from '../types';
import { getBrandCoreAssistance } from '../services/geminiService';
import { ArrowLeftIcon, PaperAirplaneIcon, SpinnerIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
    sender: 'user' | 'ai';
    text: string;
    isConfirmation?: boolean;
    coreValue?: string;
}

type CoachStage = 'opening' | 'defining' | 'refining' | 'strategizing' | 'done';

interface BrandCoreCoachProps {
    specialist: Specialist;
    onBack: () => void;
    businessProfile: BusinessProfile | null;
}

const BrandCoreCoach: React.FC<BrandCoreCoachProps> = ({ specialist, onBack, businessProfile }) => {
    const [stage, setStage] = useState<CoachStage>('opening');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [coreValue, setCoreValue] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial message
    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: `안녕하세요, ${businessProfile?.name || '사장'}님! 저는 브랜드 코어 전략가 **${specialist.name}**입니다. 로고, 네이밍, 패키징 디자인에 대해 이야기하기 전에, 사장님 비즈니스에 담긴 '이유(Why)'를 함께 찾아보고 싶습니다. 어떤 고민을 가지고 계신가요? 혹은 어떤 디자인 작업이 필요하신가요? 편하게 말씀해주세요.`
        }]);
    }, [businessProfile, specialist]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const addMessage = (sender: 'user' | 'ai', text: string, options: Partial<Message> = {}) => {
        setMessages(prev => [...prev, { sender, text, ...options }]);
    };

    const formatHistory = (lastUserInput: string) => {
        return messages.map(m => `${m.sender === 'user' ? '사장님' : '전략가'}: ${m.text}`).join('\n') + `\n사장님: ${lastUserInput}`;
    };

    const handleUserSubmit = async () => {
        if (!userInput.trim() || isLoading) return;

        addMessage('user', userInput);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            switch (stage) {
                case 'opening':
                    const initialQuestion = await getBrandCoreAssistance('initial_question', { topic: currentInput });
                    addMessage('ai', initialQuestion);
                    setStage('defining');
                    break;

                case 'defining':
                case 'refining':
                    const identityResponse = await getBrandCoreAssistance(stage === 'defining' ? 'define_identity' : 'refine_identity', { history: formatHistory(currentInput) });
                    const extractedValue = identityResponse.match(/'(.*?)'|"([^"]*)"/);
                    addMessage('ai', identityResponse, { isConfirmation: true, coreValue: extractedValue ? (extractedValue[1] || extractedValue[2]) : '핵심 가치' });
                    break;
            }
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
            addMessage('ai', `죄송합니다. 오류가 발생했어요: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmation = async (confirmed: boolean, value: string) => {
        if (isLoading) return;
        
        if (confirmed) {
            addMessage('user', '네, 아주 좋아요! 이 가치를 바탕으로 진행해주세요.');
            setCoreValue(value);
            setIsLoading(true);
            try {
                addMessage('ai', `훌륭합니다! **'${value}'** 라는 단단한 중심이 생겼네요. 이제 이 핵심 가치를 바탕으로 우리 가게의 미션과 비전, 그리고 구체적인 브랜드 전략까지 함께 설계해 드릴게요. 잠시만 기다려주세요!`);
                const strategy = await getBrandCoreAssistance('full_strategy_proposal', { coreValue: value, businessProfile });
                addMessage('ai', strategy);
                setStage('done');
            } catch (e) {
                 const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
                 addMessage('ai', `죄송합니다. 오류가 발생했어요: ${errorMsg}`);
            } finally {
                setIsLoading(false);
            }
        } else {
            addMessage('user', '음, 조금 다듬어볼까요?');
            addMessage('ai', '물론입니다, 사장님. 어떤 부분을 수정하면 사장님의 생각과 더 가까워질까요? 편하게 말씀해주세요.');
            setStage('refining');
        }
    }

    const isInputDisabled = isLoading || stage === 'done' || messages[messages.length-1]?.isConfirmation;

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
                         {msg.isConfirmation && msg.coreValue && stage !== 'done' && (
                            <div className="mt-3 flex justify-start pl-11 gap-2">
                                <button
                                    onClick={() => handleConfirmation(true, msg.coreValue ?? '')}
                                    className="px-4 py-2 text-sm bg-indigo-600 text-white font-semibold rounded-full hover:bg-indigo-700 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    네, 아주 좋아요!
                                </button>
                                <button 
                                    onClick={() => handleConfirmation(false, msg.coreValue ?? '')} 
                                    className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-100 disabled:opacity-50"
                                    disabled={isLoading}
                                >
                                    음, 조금 다듬어볼까요?
                                </button>
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
                                <span>잠시 생각 중입니다...</span>
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
                        placeholder={isInputDisabled ? "AI의 답변을 기다려주세요..." : "여기에 답변을 입력하세요..."}
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

export default BrandCoreCoach;