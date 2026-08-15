

import React, { useState, useEffect, useRef } from 'react';
import { Specialist, ConversationMessage } from '../types';
import { ArrowLeftIcon, PaperAirplaneIcon, SpinnerIcon } from './icons';
import MarkdownRenderer from './MarkdownRenderer';

interface CSCoachChatProps {
    specialist: Specialist;
    onBack: () => void;
    conversation: ConversationMessage[];
    onQuery: (query: string) => void;
    isLoading: boolean;
    placeholder?: string;
}

const CSCoachChat: React.FC<CSCoachChatProps> = ({ specialist, onBack, conversation, onQuery, isLoading, placeholder }) => {
    const [userInput, setUserInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isLoading]);

    const handleUserSubmit = async () => {
        if (!userInput.trim() || isLoading) return;
        onQuery(userInput);
        setUserInput('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleUserSubmit();
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
        const authorSpecialist = isUser ? null : msg.author as Specialist;
        
        return (
             <div key={index} className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && typeof authorSpecialist === 'object' && authorSpecialist?.Icon && (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${authorSpecialist.classes.bg}`}>
                        <authorSpecialist.Icon className={`w-5 h-5 ${authorSpecialist.classes.text}`} />
                    </div>
                )}
                <div className={`max-w-md lg:max-w-lg p-3 rounded-sm ${isUser ? 'bg-ink text-paper rounded-br-none' : 'bg-linen text-ink rounded-bl-none'}`}>
                   <MarkdownRenderer content={msg.text} />
                </div>
            </div>
        )
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
                {conversation.map(renderChatMessage)}
                 {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-paper ${specialist.classes.bg}`}>
                            <specialist.Icon className={`w-5 h-5 ${specialist.classes.text}`} />
                        </div>
                        <div className="max-w-md lg:max-w-lg p-3 rounded-sm bg-linen text-ink rounded-bl-none border border-rule">
                            <div className="flex items-center gap-2">
                                <SpinnerIcon className="w-5 h-5 animate-spin"/>
                                <span>고객의 마음을 읽고 있어요...</span>
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
                        onKeyPress={handleKeyPress}
                        placeholder={isLoading ? "AI의 답변을 기다려주세요..." : (placeholder || "질문을 입력하세요...")}
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

export default CSCoachChat;
