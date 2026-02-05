
import React, { useState, useEffect } from 'react';
import { TransactionType } from '../types';

interface ExpenseFormProps {
  onAdd: (t: { date: string; amount: number; category: string; description: string; type: TransactionType }) => void;
  categories: string[];
  currencySymbol: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, categories, currencySymbol }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: categories[0] || 'Other',
    description: '',
    type: 'expense' as TransactionType
  });

  useEffect(() => {
    if (!categories.includes(formData.category)) {
      setFormData(prev => ({ ...prev, category: categories[0] || 'Other' }));
    }
  }, [categories, formData.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    onAdd({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    setFormData({
      ...formData,
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Expense
        </button>
        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${formData.type === 'income' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          Income
        </button>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount ({currencySymbol})</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">{currencySymbol}</span>
          <input
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</label>
          <select
            value={formData.category}
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            {categories.length === 0 && <option value="Other">Other</option>}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Description</label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="e.g. Weekly Groceries"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition"
      >
        Record Transaction
      </button>
    </form>
  );
};

export default ExpenseForm;
