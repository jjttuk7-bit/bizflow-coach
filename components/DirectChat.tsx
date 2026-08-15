import React, { useState, useRef, useEffect } from 'react';
import { BusinessProfile } from '../types';
import { ArrowLeftIcon, PaperAirplaneIcon, SpinnerIcon, UserGroupIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

interface DirectChatProps {
    profile: BusinessProfile | null;
    onQuery: (question: string) => void;
    onBack: () => void;
    isLoading: boolean;
    error: string | null;
    result: string | null;
}

const DirectChat: React.FC<DirectChatProps> = ({ profile, onQuery, onBack, isLoading, error, result }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: `안녕하세요, ${profile?.name} 사장님! 저는 AI 비즈니스 파트너 팀입니다. 무엇이든 물어보세요.` }
    ]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (result) {
            setMessages(prev => [...prev, { sender: 'ai', text: result }]);
        }
    }, [result]);

    useEffect(() => {
        if (error) {
             setMessages(prev => [...prev, { sender: 'ai', text: `오류가 발생했습니다: ${error}` }]);
        }
    }, [error]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            setMessages(prev => [...prev, { sender: 'user', text: input }]);
            onQuery(input);
            setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto bg-linen rounded-sm flex flex-col h-[80vh] animate-fade-in border border-rule">
            <header className="flex items-center p-4 border-b border-rule relative">
                <button onClick={onBack} className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-ink hover:text-ink">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-center w-full">
                    <h2 className="text-xl font-bold text-ink">AI 팀에게 무엇이든 물어보세요</h2>
                    <p className="text-sm text-slate-ink">{profile?.name}</p>
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-paper">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && (
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ink flex items-center justify-center text-paper">
                                <UserGroupIcon className="w-5 h-5" />
                            </div>
                        )}
                        <div className={`max-w-md lg:max-w-lg p-3 rounded-sm ${msg.sender === 'user' ? 'bg-ink text-paper rounded-br-none' : 'bg-rule text-ink rounded-bl-none'}`}>
                           <MarkdownRenderer content={msg.text} />
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-ink flex items-center justify-center text-paper">
                            <UserGroupIcon className="w-5 h-5" />
                        </div>
                        <div className="max-w-md lg:max-w-lg p-3 rounded-sm bg-rule text-ink rounded-bl-none">
                            <div className="flex items-center gap-2">
                                <SpinnerIcon className="w-5 h-5 animate-spin"/>
                                <span>AI가 답변을 생각 중입니다...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </main>

            <footer className="p-4 border-t border-rule bg-linen">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="여기에 질문을 입력하세요..."
                        className="w-full p-3 pr-12 border border-rule rounded-sm focus:ring-ink focus:border-ink resize-none"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink text-paper hover:bg-carbon disabled:bg-rule-strong disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default DirectChat;
