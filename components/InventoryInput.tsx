
import React, { useState } from 'react';
import { Specialist } from '../types';
import { ArrowLeftIcon, SparklesIcon, SpinnerIcon } from './icons';

interface InventoryInputProps {
    specialist: Specialist;
    onAnalyze: (data: { recipes: string; sales: string; currentStock: string; suppliers: string; }) => void;
    onBack: () => void;
    isLoading: boolean;
    initialData?: { recipes: string; sales: string; currentStock: string; suppliers: string; } | null;
}

const InventoryInput: React.FC<InventoryInputProps> = ({ specialist, onAnalyze, onBack, isLoading, initialData }) => {
    const [recipes, setRecipes] = useState(initialData?.recipes || '');
    const [sales, setSales] = useState(initialData?.sales || '');
    const [currentStock, setCurrentStock] = useState(initialData?.currentStock || '');
    const [suppliers, setSuppliers] = useState(initialData?.suppliers || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (recipes.trim() && sales.trim() && currentStock.trim()) {
            onAnalyze({ recipes, sales, currentStock, suppliers });
        }
    };

    const isFormIncomplete = !recipes.trim() || !sales.trim() || !currentStock.trim();

    return (
        <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg animate-fade-in space-y-6 relative">
             <button onClick={onBack} className="absolute top-6 left-6 text-gray-500 hover:text-gray-800 transition-colors">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div className="text-center">
                 <div className={`mx-auto mb-4 p-3 inline-block rounded-full ${specialist.classes.bg}`}>
                    <specialist.Icon className={`w-10 h-10 ${specialist.classes.text}`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                     AI 재고 관리 v2.0 (담당: {specialist.name})
                </h2>
                <p className="mt-2 text-gray-600">
                    사장님은 판매에만 집중하세요! 레시피와 판매량만 알려주시면, 재고 계산부터 발주 추천까지 알렉스가 알아서 해드릴게요.
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="recipes" className="block text-lg font-medium text-gray-800">
                        1. 메뉴별 레시피 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        판매하는 메뉴와 각 메뉴에 들어가는 재료의 양을 알려주세요. (최초 한 번만 입력)
                    </p>
                    <textarea
                        id="recipes"
                        rows={5}
                        value={recipes}
                        onChange={(e) => setRecipes(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예시)&#10;비건 소금빵: 밀가루 100g, 비건버터 15g, 소금 2g&#10;두부 크림빵: 밀가루 80g, 두부 50g, 비정제설탕 10g"
                    />
                </div>
                 <div>
                    <label htmlFor="sales" className="block text-lg font-medium text-gray-800">
                        2. 일일 판매량 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        오늘 판매하신 메뉴와 수량을 알려주세요.
                    </p>
                    <textarea
                        id="sales"
                        rows={3}
                        value={sales}
                        onChange={(e) => setSales(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예시)&#10;비건 소금빵: 35개&#10;두부 크림빵: 22개"
                    />
                </div>
                <div>
                    <label htmlFor="currentStock" className="block text-lg font-medium text-gray-800">
                        3. 현재 총 재고 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        가지고 계신 주요 재료의 총량과 유통기한을 알려주세요. (정확한 분석을 위해 필요해요)
                    </p>
                    <textarea
                        id="currentStock"
                        rows={5}
                        value={currentStock}
                        onChange={(e) => setCurrentStock(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예시)&#10;밀가루: 10kg&#10;비건버터: 2kg (유통기한: 2024-12-31)&#10;두부: 1kg (유통기한: 3일 남음)"
                    />
                </div>
                <div>
                    <label htmlFor="suppliers" className="block text-lg font-medium text-gray-800">
                        4. 주요 거래처 정보 (선택)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        거래처별 발주 리드타임, 최소 주문 단위(MOQ) 등을 알려주시면 더 정확한 발주 추천이 가능해요.
                    </p>
                    <textarea
                        id="suppliers"
                        rows={3}
                        value={suppliers}
                        onChange={(e) => setSuppliers(e.target.value)}
                        className="mt-1 block w-full p-3 bg-slate-50 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="예시)&#10;햇밀 제분소 (밀가루): 리드타임 2일, MOQ 20kg&#10;비건 유통 (버터, 두부): 리드타임 1일, MOQ 없음"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isFormIncomplete || isLoading}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <SpinnerIcon className="w-5 h-5 animate-spin" />
                            분석 중...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            AI 자동 재고 분석 요청
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default InventoryInput;
