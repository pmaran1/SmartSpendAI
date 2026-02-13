
import React from 'react';
import { Icons } from '../constants';

interface StatsProps {
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  currencySymbol: string;
}

const Stats: React.FC<StatsProps> = ({ totals, currencySymbol }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Total Expenses Tile (Now First) */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Total Expenses</span>
          <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
            <Icons.TrendingDown className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-600">-{currencySymbol}{totals.expenses.toLocaleString()}</div>
        <div className="mt-2 text-sm text-gray-400">Total outflows recorded</div>
      </div>

      {/* Total Income Tile */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Total Income</span>
          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
            <Icons.TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-emerald-600">+{currencySymbol}{totals.income.toLocaleString()}</div>
        <div className="mt-2 text-sm text-gray-400">Total inflows recorded</div>
      </div>

      {/* Total Balance Tile (Now Third) */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-500">Total Balance</span>
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Icons.Wallet className="h-5 w-5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{currencySymbol}{totals.balance.toLocaleString()}</div>
        <div className="mt-2 text-sm text-gray-400">Current available funds</div>
      </div>
    </div>
  );
};

export default Stats;
