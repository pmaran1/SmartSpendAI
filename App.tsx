
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Transaction, TimePeriod, AIInsight } from './types';
import { Icons, DEFAULT_CATEGORIES, CURRENCIES } from './constants';
import ExpenseForm from './components/ExpenseForm';
import Stats from './components/Stats';
import Charts from './components/Charts';
import TransactionList from './components/TransactionList';
import AIAssistant from './components/AIAssistant';
import DataManagement from './components/DataManagement';
import { getFinancialInsights } from './services/gemini';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('smartspend_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('smartspend_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    return localStorage.getItem('smartspend_currency') || 'USD';
  });

  const currency = useMemo(() => {
    return CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];
  }, [currencyCode]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'ai' | 'settings'>('dashboard');
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('smartspend_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('smartspend_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('smartspend_currency', currencyCode);
  }, [currencyCode]);

  const fetchInsights = useCallback(async () => {
    if (transactions.length < 5) return;
    setIsAiLoading(true);
    const insights = await getFinancialInsights(transactions);
    setAiInsights(insights);
    setIsAiLoading(false);
  }, [transactions]);

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleImport = (imported: Transaction[]) => {
    setTransactions(prev => [...imported, ...prev]);
  };

  const addCategory = (name: string) => {
    if (!name || categories.includes(name)) return;
    setCategories(prev => [...prev, name]);
  };

  const removeCategory = (name: string) => {
    setCategories(prev => prev.filter(c => c !== name));
  };

  const totals = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pl-64 transition-all duration-300 text-gray-900">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r bg-white p-6 md:flex shadow-sm z-20">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg">
            <Icons.Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SmartSpend AI</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Icons.Plus className="h-5 w-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${activeTab === 'transactions' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Icons.Database className="h-5 w-5" /> History
          </button>
          <button 
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${activeTab === 'ai' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Icons.Sparkles className="h-5 w-5" /> AI Coach
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Icons.Download className="h-5 w-5" /> Settings
          </button>
        </nav>

        <div className="mt-auto border-t pt-6">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
            <Icons.Currency className="h-4 w-4" />
            <span>Active: {currency.name} ({currency.symbol})</span>
          </div>
        </div>
      </aside>

      {/* Bottom Nav - Mobile */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t bg-white p-4 md:hidden shadow-lg">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}><Icons.Plus className="h-6 w-6" /></button>
        <button onClick={() => setActiveTab('transactions')} className={activeTab === 'transactions' ? 'text-blue-600' : 'text-gray-400'}><Icons.Database className="h-6 w-6" /></button>
        <button onClick={() => setActiveTab('ai')} className={activeTab === 'ai' ? 'text-blue-600' : 'text-gray-400'}><Icons.Sparkles className="h-6 w-6" /></button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-blue-600' : 'text-gray-400'}><Icons.Download className="h-6 w-6" /></button>
      </nav>

      {/* Main Content */}
      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">Financial Dashboard</h2>
                <p className="text-gray-500 text-sm">Real-time visualization of your spending habits.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={fetchInsights} className="flex items-center gap-2 rounded-xl border bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-all active:scale-95">
                  <Icons.Sparkles className={`h-4 w-4 text-blue-500 ${isAiLoading ? 'animate-spin' : ''}`} />
                  Refresh AI
                </button>
              </div>
            </header>

            <Stats totals={totals} currencySymbol={currency.symbol} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Visual Insights</h3>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                      <span className="h-2 w-2 rounded-full bg-blue-500"></span> Live Data
                    </div>
                  </div>
                  <Charts transactions={transactions} currencySymbol={currency.symbol} />
                </div>
                
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm overflow-hidden">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800">Latest Activity</h3>
                    <button onClick={() => setActiveTab('transactions')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
                  </div>
                  <TransactionList transactions={transactions.slice(0, 5)} onDelete={deleteTransaction} showShortList currencySymbol={currency.symbol} />
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h3 className="mb-6 text-lg font-bold text-gray-800">Quick Record</h3>
                  <ExpenseForm onAdd={addTransaction} categories={categories} currencySymbol={currency.symbol} />
                </div>
                
                <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-6 text-white shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Smart Coach Tip</h3>
                    <div className="rounded-full bg-white/20 p-2">
                      <Icons.Sparkles className="h-5 w-5" />
                    </div>
                  </div>
                  <p className="text-blue-50 text-sm leading-relaxed font-medium">
                    {aiInsights[0]?.description || "Our AI is waiting for more data to generate personalized savings strategies for you!"}
                  </p>
                  <div className="mt-4 flex h-1.5 w-full overflow-hidden rounded-full bg-white/20">
                    <div className="h-full bg-white transition-all duration-1000" style={{ width: transactions.length >= 5 ? '100%' : `${(transactions.length / 5) * 100}%` }}></div>
                  </div>
                  <p className="mt-2 text-[10px] uppercase tracking-wider font-bold opacity-70">
                    AI Analysis Readiness: {Math.min(transactions.length, 5)}/5 Recorded
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="animate-fadeIn">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">Full Transaction Audit</h2>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <TransactionList transactions={transactions} onDelete={deleteTransaction} currencySymbol={currency.symbol} />
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="animate-fadeIn">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">AI Financial Intelligence</h2>
            <AIAssistant insights={aiInsights} isLoading={isAiLoading} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fadeIn">
            <h2 className="mb-8 text-2xl font-bold tracking-tight">Global Configurations</h2>
            <DataManagement 
              transactions={transactions} 
              categories={categories}
              currencyCode={currencyCode}
              onImport={handleImport} 
              onRestore={(data) => setTransactions(data)}
              onAddCategory={addCategory}
              onRemoveCategory={removeCategory}
              onCurrencyChange={setCurrencyCode}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
