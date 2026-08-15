

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
                    <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-xs font-medium">{msg.text}</span>
                </div>
            )
        }

        const isUser = msg.author === 'user';
        const authorSpecialist = isUser ? null : msg.author as Specialist;
        
        return (
             <div key={index} className={`flex items-end gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && typeof authorSpecialist === 'object' && authorSpecialist?.Icon && (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${authorSpecialist.classes.bg}`}>
                        <authorSpecialist.Icon className={`w-5 h-5 ${authorSpecialist.classes.text}`} />
                    </div>
                )}
                <div className={`max-w-md lg:max-w-lg p-3 rounded-2xl shadow-sm ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                   <MarkdownRenderer content={msg.text} />
                </div>
            </div>
        )
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
                {conversation.map(renderChatMessage)}
                 {isLoading && (
                     <div className="flex items-end gap-3 justify-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${specialist.classes.bg}`}>
                            <specialist.Icon className={`w-5 h-5 ${specialist.classes.text}`} />
                        </div>
                        <div className="max-w-md lg:max-w-lg p-3 rounded-2xl bg-white text-gray-800 rounded-bl-none shadow-sm">
                            <div className="flex items-center gap-2">
                                <SpinnerIcon className="w-5 h-5 animate-spin"/>
                                <span>고객의 마음을 읽고 있어요...</span>
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
                        onKeyPress={handleKeyPress}
                        placeholder={isLoading ? "AI의 답변을 기다려주세요..." : (placeholder || "질문을 입력하세요...")}
                        className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleUserSubmit}
                        disabled={!userInput.trim() || isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <PaperAirplaneIcon className="w-5 h-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CSCoachChat;
