import React, { useMemo } from 'react';
import { BusinessProfile, Specialist, DashboardMetrics } from '../types';
import { PencilIcon, ChatBubbleLeftRightIcon, UsersIcon, CurrencyWonIcon, ClipboardListIcon, BuildingStorefrontIcon } from './icons';

interface DashboardProps {
    businessProfile: BusinessProfile | null;
    dashboardMetrics: DashboardMetrics | null;
    specialists: Specialist[];
    onSelectSpecialist: (specialist: Specialist) => void;
    onEditProfile: () => void;
    onDirectChat: () => void;
}

const MetricCard: React.FC<{ title: string; value: string; Icon: React.FC<{ className?: string }> }> = ({ title, value, Icon }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-start space-x-4">
        <div className="bg-indigo-100 p-3 rounded-full">
            <Icon className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-xl font-bold text-gray-800">{value || '분석 중...'}</p>
        </div>
    </div>
);

const SpecialistCard: React.FC<{ specialist: Specialist, onSelect: (s: Specialist) => void }> = ({ specialist, onSelect }) => (
    <div className={`bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between border-t-4 ${specialist.classes.border} transition-transform hover:scale-105 hover:shadow-md`}>
        <div>
            <div className="flex items-center gap-4">
                <div className={`p-2 inline-block rounded-full ${specialist.classes.bg}`}>
                  <specialist.Icon className={`w-8 h-8 ${specialist.classes.text}`} />
                </div>
                <div>
                    <h3 className={`text-xl font-bold ${specialist.classes.nameText}`}>{specialist.name}</h3>
                    <p className="font-semibold text-gray-700 text-sm">{specialist.role}</p>
                </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 h-20">{specialist.description}</p>
        </div>
        <button
            onClick={() => onSelect(specialist)}
            className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
            상담 시작하기
        </button>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ businessProfile, dashboardMetrics, specialists, onSelectSpecialist, onEditProfile, onDirectChat }) => {
    
    const groupedSpecialists = useMemo(() => {
        return specialists.reduce((acc, specialist) => {
            const category = specialist.category || '기타';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(specialist);
            return acc;
        }, {} as Record<string, Specialist[]>);
    }, [specialists]);
    
    const categoryOrder = ['성장 & 전략', '운영 & 재무', '공간 전략 & VMD', '팀 & 법률'];

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
             <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                    <span className="text-indigo-600">{businessProfile?.name}</span>'s BizFlow Dashboard
                </h1>
                <p className="mt-2 text-gray-600">AI 드림팀이 사장님의 비즈니스 성장을 위해 함께합니다.</p>
            </header>

            <main className="space-y-12">
                {/* Section 1: At a Glance */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">한눈에 보는 우리 가게</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="일 평균 손님 수" value={dashboardMetrics?.dailyCustomers} Icon={UsersIcon} />
                        <MetricCard title="평균 객단가" value={dashboardMetrics?.avgSpend} Icon={CurrencyWonIcon} />
                        <MetricCard title="주요 메뉴/서비스" value={dashboardMetrics?.menuItems} Icon={ClipboardListIcon} />
                        <MetricCard title="월 임대료" value={dashboardMetrics?.monthlyRent} Icon={BuildingStorefrontIcon} />
                    </div>
                </section>
                
                {/* Section 2: AI Specialists by Category */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">AI 전문가 컨설팅</h2>
                     <div className="space-y-8">
                        {categoryOrder.map(category => (
                            groupedSpecialists[category] && (
                                <div key={category}>
                                    <h3 className="text-xl font-semibold text-gray-600 mb-4 border-l-4 border-indigo-500 pl-3">{category}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {groupedSpecialists[category].map((s, index) => (
                                           <SpecialistCard key={index} specialist={s} onSelect={onSelectSpecialist} />
                                        ))}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </section>
                
                {/* Section 3: Other Actions */}
                <section>
                     <h2 className="text-2xl font-bold text-gray-700 mb-4">기타 기능</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="p-6 rounded-lg bg-white shadow-sm flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <PencilIcon className="w-10 h-10 text-gray-500" />
                                <div>
                                     <h3 className="text-xl font-bold text-gray-800">우리 가게 정보 수정</h3>
                                     <p className="mt-1 text-sm text-gray-600">비즈니스에 변경사항이 생겼을 때 정보를 업데이트합니다.</p>
                                </div>
                             </div>
                             <button onClick={onEditProfile} className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 flex-shrink-0">
                                정보 수정하기
                             </button>
                         </div>
                         <div className="p-6 rounded-lg bg-white shadow-sm flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <ChatBubbleLeftRightIcon className="w-10 h-10 text-gray-500" />
                                <div>
                                     <h3 className="text-xl font-bold text-gray-800">AI 팀에게 무엇이든 물어보세요</h3>
                                     <p className="mt-1 text-sm text-gray-600">궁금한 점이나 고민을 자유롭게 질문하고 답변을 받습니다.</p>
                                </div>
                             </div>
                             <button onClick={onDirectChat} className="py-2 px-4 bg-white border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 flex-shrink-0">
                                자유롭게 질문하기
                             </button>
                         </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;