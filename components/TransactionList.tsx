
import React from 'react';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
  showShortList?: boolean;
  currencySymbol: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, showShortList, currencySymbol }) => {
  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        <p>No transactions yet.</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const date = new Date(year, month, day);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left min-w-[600px] border-collapse">
        <thead>
          <tr className="border-b bg-gray-50 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
            <th className="px-4 sm:px-6 py-4">Date</th>
            <th className="px-4 sm:px-6 py-4">Category</th>
            <th className="px-4 sm:px-6 py-4">Description</th>
            <th className="px-4 sm:px-6 py-4 text-right">Amount</th>
            {!showShortList && <th className="px-4 sm:px-6 py-4 text-center">Action</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {transactions.map((t) => (
            <tr key={t.id} className="group hover:bg-gray-50 transition">
              <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-sm text-gray-600 font-medium">
                {formatDate(t.date)}
              </td>
              <td className="whitespace-nowrap px-4 sm:px-6 py-4">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] sm:text-xs font-bold ${t.type === 'income' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                  {t.category}
                </span>
              </td>
              <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 font-semibold max-w-[150px] sm:max-w-xs truncate">
                <div className="flex items-center gap-1.5">
                  {t.description}
                  {t.isRecurring && (
                    /* Fix: moved title attribute to a child <title> element to resolve TypeScript SVGProps error */
                    <svg className="h-3 w-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <title>Recurring Autopilot</title>
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </div>
              </td>
              <td className={`whitespace-nowrap px-4 sm:px-6 py-4 text-right text-sm font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {t.type === 'income' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
              </td>
              {!showShortList && (
                <td className="whitespace-nowrap px-4 sm:px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {onEdit && (
                      <button 
                        onClick={() => onEdit(t)}
                        className="text-gray-300 hover:text-blue-500 transition p-2 hover:bg-blue-50 rounded-lg"
                        aria-label="Edit transaction"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    )}
                    <button 
                      onClick={() => onDelete(t.id)}
                      className="text-gray-300 hover:text-rose-500 transition p-2 hover:bg-rose-50 rounded-lg"
                      aria-label="Delete transaction"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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
