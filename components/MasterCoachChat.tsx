import React, { useState, useEffect, useRef } from 'react';
import { Specialist, BusinessProfile, BusinessData } from '../types';
import { getMasterCoachAnswer } from '../services/coachApi';
import { ArrowLeftIcon, PaperAirplaneIcon, SpinnerIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

interface MasterCoachChatProps {
    specialist: Specialist;
    onBack: () => void;
    businessProfile: BusinessProfile;
    businessData: BusinessData;
}

const MasterCoachChat: React.FC<MasterCoachChatProps> = ({ specialist, onBack, businessProfile, businessData }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial message from Sophia
    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: specialist.greeting,
        }]);
    }, [specialist.greeting]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const addMessage = (sender: 'user' | 'ai', text: string) => {
        setMessages(prev => [...prev, { sender, text }]);
    };
    
    // Formats the conversation history for the AI prompt
    const formatHistory = (lastUserInput: string) => {
        const fullConversation = [...messages, { sender: 'user', text: lastUserInput }];
        return fullConversation.map(m => {
            const prefix = m.sender === 'user' ? '사장님' : '소피아';
            return `${prefix}: ${m.text}`;
        }).join('\n');
    };

    const handleUserSubmit = async () => {
        if (!userInput.trim() || isLoading) return;

        const currentInput = userInput;
        addMessage('user', currentInput);
        setUserInput('');
        setIsLoading(true);

        try {
            const history = formatHistory(currentInput);
            const aiResponse = await getMasterCoachAnswer(businessProfile, businessData, history);
            addMessage('ai', aiResponse);
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : '알 수 없는 오류가 발생했습니다.';
            addMessage('ai', `죄송합니다. 상담 중 오류가 발생했습니다: ${errorMsg}`);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${specialist.classes.bg}`}>
                                <specialist.Icon className={`w-5 h-5 ${specialist.classes.text}`} />
                            </div>
                        )}
                        <div className={`max-w-md lg:max-w-lg p-3 rounded-sm ${msg.sender === 'user' ? 'bg-ink text-paper rounded-br-none' : 'bg-linen text-ink rounded-bl-none'}`}>
                           <MarkdownRenderer content={msg.text} />
                        </div>
                    </div>
                ))}
                 {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${specialist.classes.bg}`}>
                            <specialist.Icon className={`w-5 h-5 ${specialist.classes.text}`} />
                        </div>
                        <div className="max-w-md lg:max-w-lg p-3 rounded-sm bg-linen text-ink rounded-bl-none border border-rule">
                            <div className="flex items-center gap-2">
                                <SpinnerIcon className="w-5 h-5 animate-spin"/>
                                <span>귀 기울여 듣고 있어요...</span>
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
                        placeholder={isLoading ? "AI의 답변을 기다려주세요..." : "어떤 고민이든 편하게 말씀해주세요..."}
                        className="w-full p-3 pr-12 border border-rule rounded-sm focus:ring-ink focus:border-ink"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleUserSubmit}
                        disabled={!userInput.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink text-paper hover:bg-carbon disabled:bg-rule-strong disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default MasterCoachChat;