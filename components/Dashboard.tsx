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

// 지표는 대시보드 진입 후 비동기로 채워지므로 value는 로딩 중 undefined일 수 있다.
// AI는 "30명 (평일), 50명 (주말)"처럼 한 줄에 안 들어가는 값을 돌려준다.
// 잘라내면 정작 필요한 숫자가 사라지므로 줄바꿈을 허용하고 길이에 따라 크기를 낮춘다.
const MetricCard: React.FC<{ title: string; value?: string; Icon: React.FC<{ className?: string }> }> = ({ title, value, Icon }) => {
    const long = (value?.length ?? 0) > 12;
    return (
        <div className="bg-linen border border-rule rounded-sm p-5 flex items-start gap-4">
            <Icon className="w-5 h-5 text-slate-ink shrink-0 mt-1" />
            <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-ink">{title}</p>
                <p
                    title={value}
                    className={`mt-1.5 font-bold tracking-tight text-ink break-keep leading-snug ${long ? 'text-lg' : 'text-2xl'}`}
                >
                    {value || <span className="text-slate-ink font-normal text-lg">분석 중…</span>}
                </p>
            </div>
        </div>
    );
};

// 코치별 색상은 상단 굵은 선 하나로만 쓴다. 카드 전체를 물들이면
// 23장이 깔렸을 때 시각적 소음이 되고, 얇은 괘선 위의 색 띠가 더 잘 읽힌다.
const SpecialistCard: React.FC<{ specialist: Specialist, onSelect: (s: Specialist) => void }> = ({ specialist, onSelect }) => (
    <button
        onClick={() => onSelect(specialist)}
        className="group text-left bg-linen border border-rule rounded-sm p-6 pt-0 flex flex-col justify-between hover:bg-parchment transition-colors focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper"
    >
        {/*
          코치 색 띠는 전용 요소로 그린다. 카드 자체에 코치의 border 클래스를 얹으면
          border-rule과 같은 border-color 유틸끼리 충돌해 어느 쪽이 이길지 클래스
          나열 순서로 정해지지 않는다(생성된 CSS 순서가 결정한다).
        */}
        <span aria-hidden className={`block -mx-6 mb-6 border-t-[3px] ${specialist.classes.border}`} />
        <div>
            <div className="flex items-start gap-3.5">
                <span className={`p-2 inline-flex rounded-full shrink-0 ${specialist.classes.bg}`}>
                    <specialist.Icon className={`w-6 h-6 ${specialist.classes.text}`} />
                </span>
                <span className="min-w-0">
                    <span className="block text-lg font-bold tracking-tight text-ink">{specialist.name}</span>
                    <span className="block text-sm text-slate-ink mt-0.5">{specialist.role}</span>
                </span>
            </div>
            <p className="mt-4 text-sm leading-[1.75] text-carbon">{specialist.description}</p>
        </div>
        <span className="mt-6 pt-4 border-t border-rule inline-flex items-center gap-1.5 text-sm font-semibold text-ink">
            상담 시작하기
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
    </button>
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
        <div className="w-full max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12 font-sans">
             <header className="pb-8 border-b border-rule">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-4">Dashboard</p>
                <h1 className="text-3xl md:text-[2.6rem] leading-[1.2] font-bold tracking-[-0.02em] text-ink">
                    <span className="marker">{businessProfile?.name || '우리 가게'}</span> 사장님,
                    <br className="hidden sm:block" /> 오늘은 무엇을 상의할까요?
                </h1>
                <p className="mt-4 text-carbon">
                    분야를 맡은 AI 코치들이 우리 가게 숫자를 놓고 함께 봅니다.
                </p>
            </header>

            <main className="space-y-14 mt-12">
                {/* Section 1: At a Glance */}
                <section>
                    <h2 className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">한눈에 보는 우리 가게</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="일 평균 손님 수" value={dashboardMetrics?.dailyCustomers} Icon={UsersIcon} />
                        <MetricCard title="평균 객단가" value={dashboardMetrics?.avgSpend} Icon={CurrencyWonIcon} />
                        <MetricCard title="주요 메뉴/서비스" value={dashboardMetrics?.menuItems} Icon={ClipboardListIcon} />
                        <MetricCard title="월 임대료" value={dashboardMetrics?.monthlyRent} Icon={BuildingStorefrontIcon} />
                    </div>
                </section>
                
                {/* Section 2: AI Specialists by Category */}
                <section>
                    <h2 className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">AI 전문가 컨설팅</h2>
                     <div className="space-y-10">
                        {categoryOrder.map(category => (
                            groupedSpecialists[category] && (
                                <div key={category}>
                                    <div className="flex items-baseline gap-4 pb-3 mb-5 border-b border-rule-strong">
                                        <h3 className="text-lg font-bold tracking-tight text-ink">{category}</h3>
                                        <span className="font-serif-num text-sm text-slate-ink">
                                            {String(groupedSpecialists[category].length).padStart(2, '0')}
                                        </span>
                                    </div>
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
                     <h2 className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">기타 기능</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {[
                           { Icon: PencilIcon, title: '우리 가게 정보 수정', desc: '비즈니스에 변경사항이 생겼을 때 정보를 업데이트합니다.', cta: '정보 수정하기', onClick: onEditProfile },
                           { Icon: ChatBubbleLeftRightIcon, title: 'AI 팀에게 무엇이든 물어보세요', desc: '궁금한 점이나 고민을 자유롭게 질문하고 답변을 받습니다.', cta: '자유롭게 질문하기', onClick: onDirectChat },
                         ].map((a) => (
                           <div key={a.title} className="bg-linen border border-rule rounded-sm p-6 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
                             <div className="flex items-start gap-4">
                                <a.Icon className="w-6 h-6 text-slate-ink shrink-0 mt-0.5" />
                                <div>
                                     <h3 className="text-base font-bold tracking-tight text-ink">{a.title}</h3>
                                     <p className="mt-1 text-sm leading-relaxed text-carbon">{a.desc}</p>
                                </div>
                             </div>
                             <button
                               onClick={a.onClick}
                               className="shrink-0 py-2.5 px-4 border border-ink rounded-sm text-sm font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
                             >
                                {a.cta}
                             </button>
                           </div>
                         ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;