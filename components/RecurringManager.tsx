
import React from 'react';
import { RecurringTransaction } from '../types';
import { Icons } from '../constants';

interface RecurringManagerProps {
  recurringRules: RecurringTransaction[];
  onDelete: (id: string) => void;
  currencySymbol: string;
}

const RecurringManager: React.FC<RecurringManagerProps> = ({ recurringRules, onDelete, currencySymbol }) => {
  if (recurringRules.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-300 mb-3">
          <Icons.Sparkles className="h-6 w-6" />
        </div>
        <p className="text-sm text-gray-400 italic">No recurring rules set yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {recurringRules.map(rule => (
        <div key={rule.id} className="group relative flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 transition-all">
          <div className="flex items-center gap-4">
            <div className={`h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400`}>
              <Icons.Tag className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900 leading-tight flex items-center gap-2">
                {rule.description}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase bg-gray-100 text-gray-500`}>
                  {rule.frequency}
                </span>
              </div>
              <div className="text-[11px] font-bold text-gray-400 mt-0.5">
                {currencySymbol}{rule.amount.toLocaleString()} • {rule.category}
              </div>
            </div>
          </div>
          <button 
            onClick={() => onDelete(rule.id)}
            className="p-2 text-gray-300 hover:text-rose-500 transition-all"
          >
            <Icons.Plus className="h-5 w-5 rotate-45" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default RecurringManager;
