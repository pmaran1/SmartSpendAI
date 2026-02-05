
import React from 'react';
import { AIInsight } from '../types';
import { Icons } from '../constants';

interface AIAssistantProps {
  insights: AIInsight[];
  isLoading: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ insights, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-500 font-medium">Gemini is analyzing your spending patterns...</p>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Icons.Sparkles className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Not enough data</h3>
        <p className="mt-2 text-gray-500">Record at least 5 transactions to unlock AI-powered financial coaching.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {insights.map((insight, idx) => (
        <div key={idx} className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
          <div className="mb-4 flex items-start justify-between">
            <div className={`rounded-xl p-3 ${
              insight.type === 'saving' ? 'bg-emerald-50 text-emerald-600' :
              insight.type === 'alert' ? 'bg-rose-50 text-rose-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {insight.type === 'saving' ? <Icons.TrendingDown className="h-6 w-6" /> :
               insight.type === 'alert' ? <Icons.TrendingUp className="h-6 w-6" /> :
               <Icons.Sparkles className="h-6 w-6" />}
            </div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
              insight.impact === 'high' ? 'bg-rose-100 text-rose-700' :
              insight.impact === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {insight.impact} Impact
            </span>
          </div>
          <h4 className="text-lg font-bold text-gray-900">{insight.title}</h4>
          <p className="mt-2 flex-1 text-sm text-gray-600 leading-relaxed">{insight.description}</p>
          <div className="mt-6">
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">Learn more &rarr;</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIAssistant;
