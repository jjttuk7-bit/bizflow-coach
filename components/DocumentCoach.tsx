import React, { useState, useMemo } from 'react';
import { Specialist } from '../types';
import { getDocumentDraft } from '../services/coachApi';
import { ArrowLeftIcon, SpinnerIcon, SparklesIcon, ArrowPathIcon } from './icons';

interface DocumentCoachProps {
    specialist: Specialist;
    onBack: () => void;
}

type CoachStage = 'recognizing' | 'collecting' | 'drafting' | 'verifying' | 'done';

const CONTRACT_FIELDS: Record<string, string[]> = {
    '임대차계약서': ['임대인 이름', '임차인 이름', '부동산 주소', '임대기간', '보증금', '월세'],
    '프리랜서 계약서': ['클라이언트 이름', '프리랜서 이름', '계약 기간', '업무 범위', '보수 및 지급일'],
    '도급계약서': ['도급인 이름', '수급인 이름', '계약 목적물', '계약 기간', '대가 및 지급 방법'],
    'NDA': ['정보 제공자', '정보 수령자', '비밀정보의 정의', '비밀유지 의무 기간', '관할 법원'],
    '용역계약서': ['위탁자 이름', '수탁자 이름', '용역의 내용', '용역 기간', '보수 및 지급 시기'],
};

const DocumentCoach: React.FC<DocumentCoachProps> = ({ specialist, onBack }) => {
    const [stage, setStage] = useState<CoachStage>('recognizing');
    const [contractType, setContractType] = useState('');
    const [userInput, setUserInput] = useState('');
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [draft, setDraft] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const requiredFields = useMemo(() => CONTRACT_FIELDS[contractType] || [], [contractType]);

    const handleTypeRecognition = () => {
        const normalizedInput = userInput.trim();
        if (Object.keys(CONTRACT_FIELDS).includes(normalizedInput)) {
            setContractType(normalizedInput);
            setStage('collecting');
            setError(null);
            setUserInput('');
            // Initialize formData with empty strings for required fields
            const initialData = CONTRACT_FIELDS[normalizedInput].reduce((acc, field) => ({ ...acc, [field]: '' }), {});
            setFormData(initialData);
        } else if (normalizedInput.includes('계약서')) {
             setError(`'${normalizedInput}'는 아직 지원하지 않는 계약서 유형입니다. 아래 예시 중에서 선택해주세요.`);
        } else {
             setError('현재 버전에서는 계약서 문서만 작성 가능합니다.');
        }
    };
    
    const handleDataCollection = async () => {
        const missingFields = requiredFields.filter(field => !formData[field]?.trim());
        if (missingFields.length > 0) {
            setError(`입력하신 정보가 부족합니다. 아래 항목을 모두 입력해주세요: ${missingFields.join(', ')}`);
            return;
        }
        setError(null);
        setIsLoading(true);
        setStage('drafting');
        try {
            const result = await getDocumentDraft(contractType, formData);
            setDraft(result);
            setStage('verifying');
        } catch (e) {
            setError(e instanceof Error ? e.message : 'An unknown error occurred.');
            setStage('collecting'); // Go back to data collection on error
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestart = () => {
        setStage('recognizing');
        setContractType('');
        setUserInput('');
        setFormData({});
        setDraft('');
        setError(null);
    }
    
    const renderRecognizing = () => (
        <>
            <p className="text-carbon">어떤 계약서를 작성하고 싶으신가요? 아래 예시를 참고하여 입력창에 작성하려는 계약서명을 입력하시면 작성이 시작됩니다.</p>
            <div className="p-4 bg-parchment rounded-sm text-sm text-carbon">
                <strong>예시:</strong> {Object.keys(CONTRACT_FIELDS).join(', ')}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleTypeRecognition()}
                    className="flex-grow p-2 border border-rule rounded-sm"
                    placeholder="예: 임대차계약서"
                />
                <button onClick={handleTypeRecognition} className="px-4 py-2 bg-ink text-paper rounded-sm hover:bg-carbon">확인</button>
            </div>
        </>
    );

    const renderCollecting = () => (
        <>
            <p className="text-carbon">좋습니다. <strong className="text-ink">{contractType}</strong> 작성을 위해 아래 필수 정보를 입력해주세요. 모두 입력되어야 초안을 작성할 수 있습니다.</p>
            <div className="space-y-3">
                {requiredFields.map(field => (
                    <div key={field}>
                        <label className="font-semibold text-carbon">{field}</label>
                        <input
                            type="text"
                            value={formData[field] || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
                            className="w-full mt-1 p-2 border border-rule rounded-sm bg-paper"
                        />
                    </div>
                ))}
            </div>
             <button onClick={handleDataCollection} disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-ink text-paper rounded-sm hover:bg-carbon disabled:bg-rule-strong">
                {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <SparklesIcon className="w-5 h-5" />}
                초안 작성하기
            </button>
        </>
    );
    
    const renderDrafting = () => (
        <div className="flex flex-col items-center justify-center text-center h-48">
            <SpinnerIcon className="w-12 h-12 text-ink animate-spin" />
            <p className="mt-4 text-lg text-carbon">입력하신 정보를 바탕으로 AI가 초안을 작성하고 있습니다...</p>
        </div>
    );
    
    const renderVerifying = () => (
        <>
            <p className="text-carbon">초안이 생성되었습니다. 내용을 확인하시고, 수정이 필요하면 '수정하기'를, 문제가 없다면 '완료 및 저장'을 눌러주세요.</p>
            <textarea
                readOnly
                value={draft}
                rows={15}
                className="w-full p-3 bg-parchment border border-rule rounded-sm font-mono text-sm"
            />
            <div className="flex justify-end gap-4">
                <button onClick={() => setStage('collecting')} className="px-4 py-2 bg-rule text-ink rounded-sm hover:bg-rule">수정하기</button>
                <button onClick={() => setStage('done')} className="px-4 py-2 bg-ink text-paper rounded-sm hover:bg-carbon">완료 및 저장</button>
            </div>
        </>
    );

    const renderDone = () => (
        <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-green-600">문서가 완성되었습니다!</h3>
            <p className="text-carbon">아래 텍스트를 복사하여 사용하세요. 중요한 계약은 서명 전 반드시 전문가의 검토를 받으시는 것을 권장합니다.</p>
            <textarea
                readOnly
                value={draft}
                rows={15}
                className="w-full p-3 bg-parchment border border-rule rounded-sm font-mono text-sm"
            />
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                <p><strong>⚠️ 중요:</strong> 이 문서는 AI가 생성한 초안으로 법적 효력을 보장하지 않습니다. 최종 서명 전 반드시 법률 전문가의 검토를 받으세요.</p>
            </div>
             <button onClick={handleRestart} className="w-full flex justify-center items-center gap-2 py-2 px-4 bg-ink text-paper rounded-sm hover:bg-carbon">
                <ArrowPathIcon className="w-5 h-5" />
                새로운 문서 작성하기
            </button>
        </div>
    );


    const renderContent = () => {
        switch(stage) {
            case 'recognizing': return renderRecognizing();
            case 'collecting': return renderCollecting();
            case 'drafting': return renderDrafting();
            case 'verifying': return renderVerifying();
            case 'done': return renderDone();
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto my-8 p-8 bg-linen rounded-sm animate-fade-in space-y-6 relative border border-rule">
             <button onClick={onBack} className="absolute top-6 left-6 text-slate-ink hover:text-ink transition-colors z-10">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <header className="text-center">
                 <div className={`mx-auto mb-4 p-3 inline-block rounded-full ${specialist.classes.bg}`}>
                    <specialist.Icon className={`w-10 h-10 ${specialist.classes.text}`} />
                </div>
                <h2 className="text-2xl font-bold text-ink">{specialist.name}</h2>
                <p className="text-md text-carbon">{specialist.role}</p>
            </header>
            
            <div className="border-t border-rule pt-6 space-y-4">
                {error && <div className="p-3 bg-red-100 text-red-700 rounded-sm text-sm">{error}</div>}
                {renderContent()}
            </div>
        </div>
    );
};

export default DocumentCoach;