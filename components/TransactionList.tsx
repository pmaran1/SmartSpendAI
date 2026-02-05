
import React from 'react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  showShortList?: boolean;
  currencySymbol: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, showShortList, currencySymbol }) => {
  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p>No transactions yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <th className="px-6 py-4">Date</th>
            <th className="px-6 py-4">Category</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4 text-right">Amount</th>
            {!showShortList && <th className="px-6 py-4 text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {transactions.map((t) => (
            <tr key={t.id} className="group hover:bg-gray-50 transition">
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{t.date}</td>
              <td className="whitespace-nowrap px-6 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                  {t.category}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{t.description}</td>
              <td className={`whitespace-nowrap px-6 py-4 text-right text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
              </td>
              {!showShortList && (
                <td className="whitespace-nowrap px-6 py-4 text-center">
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="text-gray-400 hover:text-rose-500 transition p-2 hover:bg-rose-50 rounded-lg"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
