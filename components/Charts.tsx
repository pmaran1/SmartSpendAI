
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Transaction, TimePeriod } from '../types';
import { COLORS } from '../constants';

interface ChartsProps {
  transactions: Transaction[];
  currencySymbol: string;
}

const Charts: React.FC<ChartsProps> = ({ transactions, currencySymbol }) => {
  const [view, setView] = useState<'trends' | 'categories' | 'comparison'>('trends');
  const [period, setPeriod] = useState<TimePeriod>('month');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tDate >= weekAgo;
      } else if (period === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        return tDate >= monthAgo;
      } else {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        return tDate >= yearAgo;
      }
    });
  }, [transactions, period]);

  const dailyData = useMemo(() => {
    const dailyMap = new Map();
    const sorted = [...filteredTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(t => {
      const d = t.date;
      const current = dailyMap.get(d) || { date: d, expense: 0, income: 0 };
      if (t.type === 'expense') current.expense += t.amount;
      else current.income += t.amount;
      dailyMap.set(d, current);
    });

    return Array.from(dailyMap.values());
  }, [filteredTransactions]);

  const categoryData = useMemo(() => {
    const catMap = new Map();
    filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    });

    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const comparisonData = useMemo(() => {
    const monthlyMap = new Map();
    transactions.forEach(t => {
      const d = new Date(t.date);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const current = monthlyMap.get(monthKey) || { month: monthKey, expense: 0, income: 0 };
      if (t.type === 'expense') current.expense += t.amount;
      else current.income += t.amount;
      monthlyMap.set(monthKey, current);
    });

    return Array.from(monthlyMap.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-gray-400 italic">
        <svg className="mb-2 h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p>Start recording to see analytics</p>
      </div>
    );
  }

  const renderActiveChart = () => {
    switch (view) {
      case 'trends':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, '']}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area name="Spending" type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
              <Area name="Income" type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'categories':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${currencySymbol}${value.toFixed(2)}`} />
              <Legend layout="vertical" align="right" verticalAlign="middle" />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${currencySymbol}${value.toFixed(2)}`, '']}
              />
              <Legend verticalAlign="top" height={36} iconType="rect" />
              <Bar name="Income" dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar name="Expenses" dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button 
            onClick={() => setView('trends')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${view === 'trends' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Trends
          </button>
          <button 
            onClick={() => setView('categories')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${view === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Categories
          </button>
          <button 
            onClick={() => setView('comparison')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${view === 'comparison' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Monthly
          </button>
        </div>

        {view !== 'comparison' && (
          <div className="flex gap-1 border rounded-lg p-0.5 bg-white">
            {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded ${period === p ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-72 w-full animate-fadeIn">
        {renderActiveChart()}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t pt-4">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total Filtered Spend</p>
          <p className="text-xl font-bold text-rose-600">
            {currencySymbol}{filteredTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
        </div>
        <div className="text-center border-l">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Avg. Per Entry</p>
          <p className="text-xl font-bold text-gray-800">
            {currencySymbol}{(filteredTransactions.length ? (filteredTransactions.reduce((a, b) => a + b.amount, 0) / filteredTransactions.length) : 0).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Charts;
