import React from 'react';

export interface BusinessProfile {
  name: string;
  industry: string;
  product: string;
  employees: string;
}

export type BusinessStep = '상권분석' | '메뉴' | '가격' | '판매' | '재무';

export type BusinessData = {
  [key in BusinessStep]: string;
};

export interface Specialist {
    name: string;
    role: string;
    description:string;
    category: string;
    Icon: React.FC<{ className?: string }>;
    classes: {
        border: string;
        bg: string;
        text: string;
        nameText: string;
    };
    action: () => void | Promise<void>;
    greeting: string;
}

export interface DashboardMetrics {
  dailyCustomers: string;
  avgSpend: string;
  menuItems: string;
  monthlyRent: string;
}

// FIX: Update MessageAuthor to be a union of specific types for better type safety
// and to support the new MasterCoachChat component.
export type MessageAuthor = 'user' | 'system' | Specialist;


export interface ConversationMessage {
    author: MessageAuthor;
    text: string;
}

// New Types for Charting
export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string[] | string;
    borderColor?: string[] | string;
    borderWidth?: number;
}

export interface ChartData {
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    title: string;
    labels: string[];
    datasets: ChartDataset[];
}

export interface SalesAnalysisResult {
    report: string;
    charts: ChartData[];
}