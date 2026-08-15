import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

/**
 * 실제 앱에 존재하는 23명의 코치. App.tsx의 specialists 배열에서 가져온 것으로,
 * 지어낸 기능 목록보다 이 라인업 자체가 가장 강력한 설명이다.
 * 코치를 추가·변경하면 이 목록도 함께 갱신한다.
 */
const ROSTER: { category: string; members: { name: string; role: string }[] }[] = [
  {
    category: '성장 & 전략',
    members: [
      { name: '창업 멘토 이든', role: 'F&B 창업 멘토' },
      { name: '셰프 마스터 준', role: '메뉴 개발 컨설턴트' },
      { name: '음료 마스터 린', role: '음료 & 디저트 페어링' },
      { name: '마스터 코치 소피아', role: '만능 해결사 & 심리 상담' },
      { name: '전략 기획 아키텍트', role: '사업 기획서 & 제안서' },
      { name: '컨설턴트 브랜든', role: '브랜드 코어 전략가' },
      { name: '로컬 마케터 폴', role: '지역 기반 홍보' },
      { name: '크리에이터 켈리', role: '바이럴 숏폼 디렉터' },
      { name: '전략가 데이빗', role: '로컬 경쟁 전략가' },
      { name: '코치 라이언', role: '스마트스토어 / 이커머스' },
      { name: '마케터 제인', role: '디지털 마케팅' },
      { name: '혁신가 레오', role: '비즈니스 아이디어 플래너' },
      { name: '카피라이터 윤슬', role: '가게의 문장을 쓰는 사람' },
    ],
  },
  {
    category: '운영 & 재무',
    members: [
      { name: '데이터 분석가 앤', role: '매출 데이터 분석' },
      { name: 'CS 코치 클레어', role: '단골 관리 & 리뷰 대응' },
      { name: '가격 설계자 필립', role: '데이터 기반 가격 전략' },
      { name: '매니저 알렉스', role: '재고 관리' },
      { name: '코치 로이', role: '수익 관리' },
      { name: '절세 코치 김계산', role: '세금 신고 & 절세' },
    ],
  },
  {
    category: '팀 & 법률',
    members: [
      { name: '계약/노무 코치 솔로몬', role: '계약 · 노무 리스크' },
      { name: '문서 작성 코치 유케이', role: '계약서 초안 작성' },
      { name: '인사 코치 헤일리', role: '채용 · 면접 · 갈등 관리' },
    ],
  },
  {
    category: '공간 전략 & VMD',
    members: [{ name: '공간 디렉터 노아', role: '매장 동선 & 진열' }],
  },
];

const STEPS = [
  {
    n: '01',
    title: '가게 이야기를 들려주세요',
    body: '위치, 메뉴, 임대료, 하루 손님 수 — 아는 만큼만 적으면 됩니다. AI가 흩어진 정보를 정리해 우리 가게 프로필을 만듭니다.',
  },
  {
    n: '02',
    title: '필요한 전문가를 고르세요',
    body: '기능 목록이 아니라 사람을 고릅니다. 재고가 고민이면 매니저 알렉스에게, 손님이 안 오면 로컬 마케터 폴에게.',
  },
  {
    n: '03',
    title: '내일 할 일을 받으세요',
    body: '일반론이 아니라 우리 가게 숫자에 맞춘 실행 계획을 드립니다. 이어서 궁금한 걸 계속 물어볼 수도 있습니다.',
  },
];

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const totalCoaches = ROSTER.reduce((n, g) => n + g.members.length, 0);

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-marker selection:text-ink">
      {/* ── 네비게이션 ─────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-paper/90 backdrop-blur-sm border-b border-rule">
        <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-lg font-bold tracking-tight">BizFlow</span>
            <span className="hidden sm:inline text-[11px] uppercase tracking-[0.18em] text-slate-ink">
              Business Coach
            </span>
          </div>
          <button
            onClick={onStart}
            className="text-sm font-semibold border-b-2 border-ink pb-0.5 hover:border-marker-deep transition-colors"
          >
            시작하기
          </button>
        </div>
      </nav>

      {/* ── 히어로 ─────────────────────────────────── */}
      <header className="mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-8">
            소상공인 · 스타트업을 위한 AI 비즈니스 코칭
          </p>

          <h1 className="text-[2.6rem] leading-[1.18] sm:text-6xl sm:leading-[1.12] lg:text-[4.5rem] lg:leading-[1.08] font-bold tracking-[-0.02em] max-w-4xl">
            혼자 고민하던 일을,
            <br />
            <span className="marker">{totalCoaches}명의 전문가</span>와
            <br />
            나눠서 풀어보세요.
          </h1>

          <p className="mt-9 max-w-xl text-lg leading-[1.75] text-carbon">
            재고가 남고, 손님이 줄고, 세금 신고는 다가오는데 물어볼 데가 없을 때.
            BizFlow는 각 분야를 맡은 AI 코치들이 우리 가게 숫자를 놓고
            <strong className="font-semibold"> 지금 당장 할 수 있는 것</strong>을 짚어드립니다.
          </p>

          <div className="mt-11 flex flex-col sm:flex-row sm:items-center gap-5">
            <button
              onClick={onStart}
              className="group inline-flex items-center justify-center gap-2.5 bg-ink text-paper px-8 py-4 text-base font-semibold rounded-sm hover:bg-carbon transition-colors"
            >
              무료로 진단받기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <p className="text-sm text-slate-ink">
              가입 즉시 우리 가게 종합 진단 리포트를 받습니다.
            </p>
          </div>
        </motion.div>

        {/* 히어로 하단 지표 — 전부 앱에 실재하는 수치만 쓴다 */}
        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 border-t border-rule"
        >
          {[
            { k: totalCoaches.toString(), v: '명의 AI 전문가' },
            { k: '4', v: '개 전문 영역' },
            { k: '24', v: '시간 상담 가능' },
            { k: '0', v: '원 · 진단 비용' },
          ].map((s) => (
            <div key={s.v} className="py-7 pr-6 border-b border-rule md:border-b-0">
              <dt className="font-serif-num text-4xl md:text-5xl font-normal tracking-tight">
                {s.k}
              </dt>
              <dd className="mt-1.5 text-sm text-slate-ink">{s.v}</dd>
            </div>
          ))}
        </motion.dl>
      </header>

      {/* ── 전문가 라인업 (핵심 섹션) ────────────────── */}
      <section className="bg-parchment border-y border-rule">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <div className="max-w-2xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">
              The Lineup
            </p>
            <h2 className="text-3xl md:text-[2.6rem] leading-[1.25] font-bold tracking-[-0.015em]">
              기능을 고르지 않습니다.
              <br />
              <span className="marker">사람을 고릅니다.</span>
            </h2>
            <p className="mt-6 text-base leading-[1.8] text-carbon">
              각 코치는 자기 분야의 지식 베이스와 판단 기준을 따로 가지고 있습니다.
              한 명에게 물었는데 다른 전문가가 필요하면, 코치가 직접 동료에게 넘겨줍니다.
            </p>
          </div>

          <div className="mt-16 space-y-12">
            {ROSTER.map((group) => (
              <div key={group.category}>
                <div className="flex items-baseline gap-4 pb-3 border-b border-rule-strong">
                  <h3 className="text-base font-bold tracking-tight">{group.category}</h3>
                  <span className="font-serif-num text-sm text-slate-ink">
                    {String(group.members.length).padStart(2, '0')}
                  </span>
                </div>
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3">
                  {group.members.map((m) => (
                    <li
                      key={m.name}
                      className="py-4 pr-6 border-b border-rule flex flex-col gap-0.5"
                    >
                      <span className="font-semibold tracking-tight">{m.name}</span>
                      <span className="text-sm text-slate-ink">{m.role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 이용 방법 ──────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-28">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">How it works</p>
        <h2 className="text-3xl md:text-[2.6rem] leading-[1.25] font-bold tracking-[-0.015em] max-w-2xl">
          세 단계면 충분합니다.
        </h2>

        <div className="mt-16 grid md:grid-cols-3 gap-x-10 gap-y-12">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t-2 border-ink pt-6">
              <span className="font-serif-num text-5xl leading-none">{s.n}</span>
              <h3 className="mt-6 text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-3 text-[15px] leading-[1.8] text-carbon">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 상담 예시 ──────────────────────────────── */}
      <section className="bg-parchment border-y border-rule">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28 grid lg:grid-cols-2 gap-14 items-start">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-ink mb-5">
              A sample session
            </p>
            <h2 className="text-3xl md:text-[2.6rem] leading-[1.25] font-bold tracking-[-0.015em]">
              막연한 조언 대신,
              <br />
              <span className="marker">우리 가게 숫자</span>로.
            </h2>
            <p className="mt-6 text-base leading-[1.8] text-carbon max-w-lg">
              "SNS를 열심히 하세요" 같은 말은 하지 않습니다. 입력한 임대료·객단가·손님 수를
              근거로 무엇을 얼마나 바꿔야 하는지까지 계산해 드립니다.
            </p>
          </div>

          {/* 실제 답변 형식(아코디언 섹션)을 그대로 보여주는 예시 카드 */}
          <div className="bg-linen border border-rule rounded-sm">
            <div className="px-6 py-4 border-b border-rule flex items-baseline justify-between gap-4">
              <span className="font-semibold tracking-tight">로컬 마케터 폴</span>
              <span className="text-xs text-slate-ink">지역 기반 홍보 전문가</span>
            </div>
            <div className="px-6 py-6 space-y-5 text-[15px] leading-[1.8]">
              <p className="text-slate-ink text-sm">
                성수동 15평 비건 베이커리 · 평일 30명 / 주말 50명 · 월세 180만 원
              </p>
              <div>
                <p className="font-semibold mb-1.5">1. 우리 가게 포지셔닝</p>
                <p className="text-carbon">
                  "카페거리 안쪽, 혼자 조용히 앉을 수 있는 비건 빵집"으로 좁히세요.
                  성수역 유동인구 전체가 아니라 반경 1km 직장인이 타깃입니다.
                </p>
              </div>
              <div>
                <p className="font-semibold mb-1.5">2. 이번 달에 할 일</p>
                <p className="text-carbon">
                  네이버 플레이스 사진 8장 교체 + 평일 11–14시 픽업 할인.
                  평일 손님이 30 → 38명이 되면 월 매출은 약 190만 원 늘어납니다.
                </p>
              </div>
              <p className="text-xs text-slate-ink pt-2 border-t border-rule">
                실제 답변 형식을 요약한 예시입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 마무리 CTA ─────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-center">
        <h2 className="text-3xl md:text-5xl leading-[1.2] font-bold tracking-[-0.02em] max-w-3xl mx-auto">
          오늘 저녁, 가게 문을 닫고
          <br />
          <span className="marker">가장 먼저 할 일</span> 하나를 정해보세요.
        </h2>
        <button
          onClick={onStart}
          className="group mt-11 inline-flex items-center gap-2.5 bg-ink text-paper px-9 py-4 text-base font-semibold rounded-sm hover:bg-carbon transition-colors"
        >
          무료로 진단받기
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </section>

      {/* ── 푸터 ───────────────────────────────────── */}
      <footer className="border-t border-rule">
        <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-slate-ink">
          <span className="font-semibold text-ink tracking-tight">BizFlow Coach</span>
          <span>© 2026 BizFlow. AXIS Cognitive OS Module.</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
