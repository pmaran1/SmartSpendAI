
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: string[];
  currencySymbol: string;
  onClose: () => void;
  onSave: (updated: Transaction) => void;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ 
  transaction, 
  categories, 
  currencySymbol, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Transaction>({ ...transaction });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">
        <div className="p-6 border-b bg-gray-50/50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Modify Transaction</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${formData.type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${formData.type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Amount ({currencySymbol})</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-300">{currencySymbol}</span>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={e => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 pl-10 pr-4 py-3 text-lg font-bold focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Rent"
              className="w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-gray-200 py-3.5 font-bold text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-blue-600 py-3.5 font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTransactionModal;
