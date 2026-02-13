
import React, { useState } from 'react';
import { Budget } from '../types';
import { Icons } from '../constants';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: string[];
  currencySymbol: string;
  onSetBudget: (category: string, limit: number) => void;
  onRemoveBudget: (category: string) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ 
  budgets, 
  categories, 
  currencySymbol, 
  onSetBudget, 
  onRemoveBudget 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');
  const [limit, setLimit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !limit) return;
    onSetBudget(selectedCategory, parseFloat(limit));
    setLimit('');
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Limit ({currencySymbol})</label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={!limit}
          className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition"
        >
          Set Budget Limit
        </button>
      </form>

      <div className="space-y-3">
        {budgets.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm italic">
            No active budgets. Set one above!
          </div>
        ) : (
          budgets.map(b => (
            <div key={b.category} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white group hover:border-blue-100 transition">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icons.Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{b.category}</div>
                  <div className="text-xs font-medium text-gray-500">Limit: {currencySymbol}{b.limit.toLocaleString()}</div>
                </div>
              </div>
              <button
                onClick={() => onRemoveBudget(b.category)}
                className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Icons.Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BudgetManager;
