import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Target, Users, Zap, ArrowRight, BarChart3, ShieldCheck, Globe } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Biz Flow</span>
          </div>
          <button 
            onClick={onStart}
            className="px-5 py-2 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
          >
            시작하기
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              AI 기반 비즈니스 워크플로우 어시스턴트
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-slate-900 mb-8">
              당신의 비즈니스를 <br />
              <span className="text-indigo-600">지능적으로</span> 흐르게 하세요.
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl">
              Biz Flow는 소상공인과 스타트업을 위한 차세대 AI 코칭 플랫폼입니다. 
              상권 분석부터 마케팅, 재고 관리까지 전문가 수준의 인사이트를 즉시 경험하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-100"
              >
                무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                서비스 소개서 보기
              </button>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-gradient-to-tr from-indigo-100 to-white rounded-[40px] border border-indigo-50 shadow-2xl flex items-center justify-center overflow-hidden">
               <img 
                src="https://picsum.photos/seed/business/800/800" 
                alt="Business Dashboard" 
                className="w-4/5 h-4/5 object-cover rounded-2xl shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
                referrerPolicy="no-referrer"
               />
            </div>
            {/* Floating Cards */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">월 매출 성장률</p>
                  <p className="text-lg font-bold text-slate-900">+24.5%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">비즈니스 성공을 위한 올인원 솔루션</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">각 분야의 AI 전문가들이 당신의 비즈니스를 24시간 지원합니다.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Rocket, title: "전략적 기획", desc: "AI가 당신의 사업 아이템을 분석하고 최적의 성장 전략을 제안합니다." },
              { icon: Target, title: "정밀한 타겟팅", desc: "상권 데이터와 고객 행동을 분석하여 마케팅 효율을 극대화합니다." },
              { icon: Users, title: "고객 관리 코칭", desc: "CS 전문가 AI가 고객 응대와 관계 유지 전략을 밀착 가이드합니다." },
              { icon: BarChart3, title: "데이터 대시보드", desc: "복잡한 지표를 한눈에 파악할 수 있는 직관적인 대시보드를 제공합니다." },
              { icon: ShieldCheck, title: "법률 및 세무 가이드", desc: "비즈니스 운영에 필수적인 법률과 세무 지식을 쉽게 설명해드립니다." },
              { icon: Globe, title: "이커머스 확장", desc: "오프라인 매장에서 온라인 마켓까지 사업 영역 확장을 지원합니다." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>© 2026 Biz Flow. All rights reserved. AXIS Cognitive OS Module.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
