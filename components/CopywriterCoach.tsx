
import React, { useState, useEffect, useRef } from 'react';
import { Specialist, BusinessProfile } from '../types';
import { getCopywritingAssistance } from '../services/coachApi';
import { ArrowLeftIcon, PaperAirplaneIcon, PencilIcon, SparklesIcon, SpinnerIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

type Drafts = { draftA: string; draftB: string; draftC: string };

interface Message {
    sender: 'user' | 'ai';
    text: string;
    isDraft?: boolean;
    drafts?: Drafts;
}

type CoachStage = 'topic' | 'opening' | 'sensing' | 'drafting' | 'refining' | 'done';

interface CopywriterCoachProps {
    specialist: Specialist;
    onBack: () => void;
    businessProfile: BusinessProfile | null;
}

const CopywriterCoach: React.FC<CopywriterCoachProps> = ({ specialist, onBack, businessProfile }) => {
    const [stage, setStage] = useState<CoachStage>('topic');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [topic, setTopic] = useState('');
    const [selectedDraft, setSelectedDraft] = useState<{ key: string, text: string } | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial message
    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: `안녕하세요, ${businessProfile?.name || '사장'}님! 저는 ${specialist.name}입니다. 가게의 숨은 이야기를 찾아 고객의 마음에 가닿는 언어로 바꾸어 드릴게요. 어떤 글에 영혼을 불어넣어 볼까요?`
        }]);
    }, [businessProfile, specialist]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const addMessage = (sender: 'user' | 'ai', text: string, options: Partial<Message> = {}) => {
        setMessages(prev => [...prev, { sender, text, ...options }]);
    };

    const handleUserSubmit = async () => {
        if (!userInput.trim() || isLoading) return;

        addMessage('user', userInput);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            switch (stage) {
                case 'topic':
                    setTopic(currentInput);
                    const initialQuestion = await getCopywritingAssistance('initial_question', { topic: currentInput });
                    addMessage('ai', initialQuestion);
                    setStage('opening');
                    break;

                case 'opening':
                    const sensoryQuestion = await getCopywritingAssistance('sensory_question', { history: formatHistory(currentInput) });
                    addMessage('ai', sensoryQuestion);
                    setStage('sensing');
                    break;
                
                case 'sensing':
                    addMessage('ai', '사장님의 소중한 이야기를 바탕으로, 가게의 영혼을 담은 3가지 시안을 제안해 드릴게요. 잠시만 기다려주세요!');
                    const drafts = await getCopywritingAssistance('drafting', { history: formatHistory(currentInput) });
                    addMessage('ai', '마음에 드는 시안을 선택해주세요. 함께 더 발전시켜봐요!', { isDraft: true, drafts });
                    setStage('drafting');
                    break;

                case 'refining':
                    if (selectedDraft) {
                        const finalCopy = await getCopywritingAssistance('finalize', { draft: selectedDraft.text, feedback: currentInput });
                        addMessage('ai', `**[최종 완성본]**\n\n${finalCopy}`);
                        addMessage('ai', `이 카피가 사장님의 비즈니스에 좋은 기운을 불어넣길 바랍니다! 또 다른 글이 필요하시면 언제든 다시 찾아주세요.`);
                        setStage('done');
                    }
                    break;
            }
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
            addMessage('ai', `죄송합니다. 오류가 발생했어요: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const formatHistory = (lastUserInput: string) => {
        return messages.map(m => `${m.sender === 'user' ? '사장님' : '카피라이터'}: ${m.text}`).join('\n') + `\n사장님: ${lastUserInput}`;
    };

    const handleDraftSelect = async (key: 'draftA' | 'draftB' | 'draftC', text: string) => {
        if (isLoading) return;
        setIsLoading(true);
        setSelectedDraft({ key, text });
        addMessage('user', `[${key.replace('draft', '')}안]으로 진행하고 싶어요.`);
        try {
            const refiningQuestion = await getCopywritingAssistance('refining_question', { draft: text });
            addMessage('ai', refiningQuestion);
            setStage('refining');
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
            addMessage('ai', `죄송합니다. 오류가 발생했어요: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

    const isInputDisabled = isLoading || stage === 'drafting' || stage === 'done';

    return (
        <div className="w-full max-w-3xl mx-auto bg-linen rounded-sm flex flex-col h-[80vh] animate-fade-in border border-rule">
            <header className="flex items-center p-4 border-b border-rule relative">
                <button onClick={onBack} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-ink hover:text-ink">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-center w-full flex items-center justify-center gap-3">
                     <div className={`p-2 inline-block rounded-full ${specialist.classes.bg}`}>
                        <specialist.Icon className={`w-6 h-6 ${specialist.classes.text}`} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-ink">{specialist.name}</h2>
                        <p className="text-sm text-slate-ink">{specialist.role}</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-paper">
                {messages.map((msg, index) => (
                    <div key={index}>
                        <div className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && (
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${specialist.classes.bg}`}>
                                    <PencilIcon className={`w-5 h-5 ${specialist.classes.text}`} />
                                </div>
                            )}
                            <div className={`max-w-md lg:max-w-lg p-3 rounded-sm ${msg.sender === 'user' ? 'bg-ink text-paper rounded-br-none' : 'bg-linen text-ink rounded-bl-none'}`}>
                               <MarkdownRenderer content={msg.text} />
                            </div>
                        </div>
                        {msg.isDraft && msg.drafts && (
                            <div className="mt-4 space-y-3">
                                {/* Fix: Explicitly cast `text` to string to resolve TypeScript error from `Object.entries`. */}
                                {Object.entries(msg.drafts).map(([key, text]) => (
                                    <div key={key} className="p-4 bg-linen rounded-sm border border-rule">
                                        <h4 className="font-bold text-carbon mb-2">
                                            {key === 'draftA' && 'A안 (감성 한 스푼)'}
                                            {key === 'draftB' && 'B안 (재치 한 조각)'}
                                            {key === 'draftC' && 'C안 (진심 한 그릇)'}
                                        </h4>
                                        <p className="text-carbon whitespace-pre-wrap">{text as string}</p>
                                        <button 
                                            onClick={() => handleDraftSelect(key as 'draftA' | 'draftB' | 'draftC', text as string)} 
                                            className="mt-3 px-3 py-1 text-sm bg-parchment text-carbon font-semibold rounded-full hover:bg-rule disabled:opacity-50"
                                            disabled={isLoading || stage !== 'drafting'}
                                        >
                                            이 시안으로 선택하기
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${specialist.classes.bg}`}>
                            <PencilIcon className={`w-5 h-5 ${specialist.classes.text}`} />
                        </div>
                        <div className="max-w-md lg:max-w-lg p-3 rounded-sm bg-linen text-ink rounded-bl-none border border-rule">
                            <div className="flex items-center gap-2">
                                <SpinnerIcon className="w-5 h-5 animate-spin"/>
                                <span>생각 중...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>
            
            <footer className="p-4 border-t border-rule bg-linen">
                 <div className="relative">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUserSubmit()}
                        placeholder={isInputDisabled ? "AI의 답변을 기다려주세요..." : "여기에 답변을 입력하세요..."}
                        className="w-full p-3 pr-12 border border-rule rounded-sm focus:ring-ink focus:border-ink"
                        disabled={isInputDisabled}
                    />
                    <button
                        onClick={handleUserSubmit}
                        disabled={!userInput.trim() || isInputDisabled}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink text-paper hover:bg-carbon disabled:bg-rule-strong disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CopywriterCoach;
