
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Transaction, TimePeriod } from '../types';
// Fixed: Added Icons to the imported constants
import { COLORS, Icons } from '../constants';

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
      if (isNaN(tDate.getTime())) return false;
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
      const d = String(t.date);
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
      if (isNaN(d.getTime())) return;
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

  const formatChartDate = (val: any) => {
    if (!val) return '';
    const dateStr = String(val);

    if (view === 'comparison') {
      const parts = dateStr.split('-');
      if (parts.length < 2) return dateStr;
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1);
      return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    }
    
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return isNaN(date.getTime()) ? dateStr : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (transactions.length === 0) {
    return (
      <div className="flex h-72 flex-col items-center justify-center text-gray-400 font-bold bg-white rounded-[2rem] border border-gray-100 shadow-sm">
        <div className="bg-gray-50 p-6 rounded-full mb-4">
           <Icons.Wallet className="h-10 w-10 opacity-20" />
        </div>
        <p>Your financial story starts here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex bg-gray-50 p-1.5 rounded-2xl w-fit">
          {[
            { id: 'trends', label: 'Cash Flow' },
            { id: 'categories', label: 'Categories' },
            { id: 'comparison', label: 'Monthly' }
          ].map(v => (
            <button 
              key={v.id}
              onClick={() => setView(v.id as any)}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${view === v.id ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {view !== 'comparison' && (
          <div className="flex gap-1 border border-gray-100 rounded-xl p-1 bg-white">
            {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-1.5 text-[10px] uppercase tracking-widest font-black rounded-lg transition-colors ${period === p ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-72 w-full animate-fadeIn">
        <ResponsiveContainer width="100%" height="100%">
          {view === 'trends' ? (
            <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="date" type="category" fontSize={10} fontWeight="bold" tickMargin={10} axisLine={false} tickLine={false} tickFormatter={formatChartDate} />
              <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                labelFormatter={formatChartDate}
              />
              <Legend verticalAlign="top" height={40} iconType="circle" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
              <Area name="Out" type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExp)" strokeWidth={4} isAnimationActive={true} animationDuration={1000} />
              <Area name="In" type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorInc)" strokeWidth={4} isAnimationActive={true} animationDuration={1000} />
            </AreaChart>
          ) : view === 'categories' ? (
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                nameKey="name"
                isAnimationActive={true}
                animationDuration={800}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, 'Total']} 
              />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontWeight: 'bold', fontSize: '10px', paddingTop: '20px' }} />
            </PieChart>
          ) : (
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" type="category" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={formatChartDate} />
              <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={(val) => `${currencySymbol}${val}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                formatter={(value: number) => [`${currencySymbol}${value.toLocaleString()}`, '']}
                labelFormatter={formatChartDate}
              />
              <Legend verticalAlign="top" height={40} iconType="rect" wrapperStyle={{ fontWeight: 'bold', fontSize: '12px' }} />
              <Bar name="Income" dataKey="income" fill="#10b981" radius={[10, 10, 0, 0]} isAnimationActive={true} animationDuration={1000} />
              <Bar name="Expenses" dataKey="expense" fill="#ef4444" radius={[10, 10, 0, 0]} isAnimationActive={true} animationDuration={1000} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
