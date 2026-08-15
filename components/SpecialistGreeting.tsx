import React from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon } from './icons';

interface SpecialistGreetingProps {
    specialist: Specialist;
    onProceed: () => void;
    onBack: () => void;
}

const SpecialistGreeting: React.FC<SpecialistGreetingProps> = ({ specialist, onProceed, onBack }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-linen rounded-sm text-center animate-fade-in space-y-6 relative border border-rule">
            <button onClick={onBack} className="absolute top-6 left-6 text-slate-ink hover:text-ink transition-colors">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className={`mx-auto p-4 inline-block rounded-full ${specialist.classes.bg}`}>
                <specialist.Icon className={`w-12 h-12 ${specialist.classes.text}`} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-ink">
                    {specialist.role} <span className={`${specialist.classes.nameText} font-bold`}>{specialist.name}</span>
                </h2>
            </div>
            <p className="text-lg text-carbon leading-relaxed max-w-prose mx-auto">
                "{specialist.greeting}"
            </p>
            <div className="pt-4">
                <button
                    onClick={onProceed}
                    className={`w-full sm:w-auto px-8 py-3 border border-transparent rounded-sm text-base font-medium text-paper bg-ink hover:bg-carbon focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ink transition-transform`}
                >
                    네, 시작할게요!
                </button>
            </div>
        </div>
    );
};

export default SpecialistGreeting;
