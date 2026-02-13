
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Transaction, AIInsight, Budget, RecurringTransaction, Frequency, UserProfile, LoginMethod } from './types';
import { Icons, DEFAULT_CATEGORIES, CURRENCIES, GOOGLE_CLIENT_ID } from './constants';
import ExpenseForm from './components/ExpenseForm';
import Stats from './components/Stats';
import Charts from './components/Charts';
import TransactionList from './components/TransactionList';
import AIAssistant from './components/AIAssistant';
import DataManagement from './components/DataManagement';
import BudgetManager from './components/BudgetManager';
import EditTransactionModal from './components/EditTransactionModal';
import { parseTransaction, parseReceipt, getChatResponse } from './services/gemini';

declare const google: any;

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
}

const App: React.FC = () => {
  const safeParse = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem('smartspend_user_v2');
      if (!saved || saved === 'undefined' || saved === 'null') return defaultValue;
      return JSON.parse(saved);
    } catch (e) {
      console.error(`Failed to parse ${key}`, e);
      return defaultValue;
    }
  };

  const createDefaultUser = (): UserProfile => ({
    id: 'local-user',
    name: 'Smart User',
    email: 'hello@smartspend.ai',
    picture: "https://ui-avatars.com/api/?name=Smart+User&background=3b82f6&color=fff",
    isGuest: true,
    loginMethod: 'guest',
    joinDate: new Date().toISOString(),
    savingsGoal: 500,
    streak: 1,
    level: 1
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('smartspend_user_v2');
    if (saved && saved !== 'undefined' && saved !== 'null') {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return createDefaultUser();
      }
    }
    return createDefaultUser();
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('smartspend_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem('smartspend_budgets');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [recurringRules, setRecurringRules] = useState<RecurringTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('smartspend_recurring_rules');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smartspend_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });
  const [currencyCode, setCurrencyCode] = useState<string>(() => localStorage.getItem('smartspend_currency') || 'USD');
  const [customCurrencies, setCustomCurrencies] = useState<{code: string, symbol: string, name: string}[]>(() => {
    try {
      const saved = localStorage.getItem('smartspend_custom_currencies');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [notification, setNotification] = useState<Notification | null>(null);
  const [isDriveOperating, setIsDriveOperating] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [magicInput, setMagicInput] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  const currency = useMemo(() => {
    const allCurrencies = [...CURRENCIES, ...customCurrencies];
    return allCurrencies.find(c => c.code === currencyCode) || allCurrencies[0];
  }, [currencyCode, customCurrencies]);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'ai' | 'settings'>('dashboard');
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const notify = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
  }, []);

  useEffect(() => {
    localStorage.setItem('smartspend_transactions', JSON.stringify(transactions));
    localStorage.setItem('smartspend_budgets', JSON.stringify(budgets));
    localStorage.setItem('smartspend_recurring_rules', JSON.stringify(recurringRules));
    localStorage.setItem('smartspend_categories', JSON.stringify(categories));
    localStorage.setItem('smartspend_currency', currencyCode);
    localStorage.setItem('smartspend_custom_currencies', JSON.stringify(customCurrencies));
    localStorage.setItem('smartspend_user_v2', JSON.stringify(user));
  }, [transactions, budgets, recurringRules, categories, currencyCode, customCurrencies, user]);

  useEffect(() => {
    if (!user || transactions.length === 0) return;
    const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    const lastDate = sorted[0].date;
    const today = new Date().toISOString().split('T')[0];
    
    if (lastDate === today && user.streak === 0) {
      setUser(prev => ({ ...prev, streak: prev.streak + 1 }));
    }
  }, [transactions, user.id]);

  const addTransaction = (t: Omit<Transaction, 'id'> & { frequency?: Frequency }) => {
    const id = crypto.randomUUID();
    const normalizedDate = String(t.date || new Date().toISOString().split('T')[0]);
    const newTransaction: Transaction = { 
      id, 
      date: normalizedDate, 
      amount: t.amount, 
      category: t.category, 
      description: t.description, 
      type: t.type, 
      isRecurring: t.frequency && t.frequency !== 'none' 
    };
    setTransactions(prev => [newTransaction, ...prev]);
    notify(`Added: ${currency.symbol}${t.amount}`, 'success');
  };

  const totals = useMemo(() => {
    return transactions.reduce((acc, t) => {
      if (t.type === 'income') acc.income += t.amount;
      else acc.expenses += t.amount;
      acc.balance = acc.income - acc.expenses;
      return acc;
    }, { income: 0, expenses: 0, balance: 0 });
  }, [transactions]);

  const handleReceiptScanning = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsMagicLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = (reader.result as string).split(',')[1];
        const result = await parseReceipt(base64, categories);
        if (result && result.amount) {
          addTransaction({ 
            amount: result.amount, category: result.category || 'Other', 
            description: result.description || 'Receipt Scan', type: 'expense', 
            date: result.date || new Date().toISOString().split('T')[0], frequency: 'none' 
          });
        }
      } catch (err) {
        notify("Vision failed", "error");
      } finally {
        setIsMagicLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => setMagicInput(event.results[0][0].transcript);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleMagicAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!magicInput.trim()) return;
    setIsMagicLoading(true);
    const result = await parseTransaction(magicInput, categories);
    setIsMagicLoading(false);
    if (result && result.amount) {
      addTransaction({ ...result as any, frequency: 'none' });
      setMagicInput('');
    } else {
      notify("AI didn't catch that", 'error');
    }
  };

  const userLevel = Math.floor(transactions.length / 10) + 1;

  return (
    <div className="min-h-screen bg-[#fcfdfe] pb-24 md:pb-0 md:pl-64 transition-all duration-300 text-gray-900">
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] w-[90%] max-w-sm animate-fadeIn">
          <div className="flex items-center justify-between gap-3 p-4 rounded-3xl border shadow-2xl backdrop-blur-xl bg-blue-600/95 text-white border-blue-500">
             <p className="text-sm font-bold">{notification.message}</p>
             <button onClick={() => setNotification(null)} className="p-1 hover:bg-black/10 rounded-full"><Icons.Plus className="h-5 w-5 rotate-45" /></button>
          </div>
        </div>
      )}

      {/* Mobile Top Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-white/70 backdrop-blur-xl px-5 py-3 md:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-100">
            <Icons.Wallet className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-gray-900">SmartSpend</h1>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col border-r border-gray-100 bg-white p-6 md:flex shadow-sm z-20">
        <div className="mb-10 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[1.25rem] bg-blue-600 text-white shadow-xl shadow-blue-100"><Icons.Wallet className="h-7 w-7" /></div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">SmartSpend</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-3">
          {[
            { id: 'dashboard', icon: Icons.Plus, label: 'Overview' },
            { id: 'history', icon: Icons.Database, label: 'History' },
            { id: 'ai', icon: Icons.Message, label: 'AI Mentor' },
            { id: 'settings', icon: Icons.Download, label: 'Settings' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-4 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 scale-105' : 'text-gray-500 hover:bg-gray-50'}`}>
              <tab.icon className="h-5 w-5" /> {tab.label}
            </button>
          ))}
        </nav>
        {/* User profile and Reset App menu item removed from sidebar */}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-100 bg-white/80 backdrop-blur-2xl p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)]">
        {[
          { id: 'dashboard', icon: Icons.Plus, label: 'Home' },
          { id: 'history', icon: Icons.Database, label: 'History' },
          { id: 'ai', icon: Icons.Message, label: 'AI' },
          { id: 'settings', icon: Icons.Download, label: 'Config' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex flex-col items-center gap-1.5 p-2 transition-all ${activeTab === tab.id ? 'text-blue-600 scale-110' : 'text-gray-400'}`}
          >
            <tab.icon className="h-6 w-6" />
            <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
          </button>
        ))}
      </nav>

      <main className="p-4 pb-32 md:p-12 max-w-7xl mx-auto space-y-12 animate-fadeIn">
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
               <div>
                 <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Financial Pulse</h2>
                 <p className="text-gray-500 font-bold mt-1">Your economy is looking {totals.balance > 0 ? 'solid' : 'tight'}.</p>
               </div>
               <div className="flex gap-4">
                 <div className="bg-blue-50 p-4 rounded-3xl text-center min-w-[140px]">
                    <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Savings Goal</div>
                    <div className="text-xl font-black text-blue-700">{currency.symbol}{user.savingsGoal}</div>
                    <div className="w-full h-1.5 bg-blue-200 rounded-full mt-2 overflow-hidden">
                       <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Math.min((totals.balance / user.savingsGoal) * 100, 100)}%` }}></div>
                    </div>
                 </div>
               </div>
            </div>

            <div className="w-full">
              <form onSubmit={handleMagicAdd} className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white p-3 sm:pl-6 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 ai-glow">
                <div className="flex items-center flex-1">
                  <Icons.Sparkles className={`h-6 w-6 ${isMagicLoading ? 'text-amber-500 animate-spin' : 'text-blue-600'} shrink-0 mr-4`} />
                  <input type="text" value={magicInput} onChange={(e) => setMagicInput(e.target.value)} placeholder={isListening ? "Listening..." : "Tell me what you bought today..."} className="flex-1 min-w-0 py-3 text-base font-semibold focus:outline-none bg-transparent" />
                </div>
                <div className="flex gap-2 pr-2">
                  <button type="button" onClick={() => receiptInputRef.current?.click()} className="p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-blue-600"><Icons.Camera className="h-6 w-6" /></button>
                  <input type="file" ref={receiptInputRef} onChange={handleReceiptScanning} accept="image/*" className="hidden" />
                  <button type="button" onClick={toggleVoiceInput} className={`p-3 rounded-2xl ${isListening ? 'bg-rose-100 text-rose-600' : 'bg-gray-50 text-gray-400'}`}><Icons.Microphone className="h-6 w-6" /></button>
                  <button type="submit" disabled={!magicInput.trim()} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg disabled:opacity-50">ADD</button>
                </div>
              </form>
            </div>

            <Stats totals={totals} currencySymbol={currency.symbol} />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-8">
                 <Charts transactions={transactions} currencySymbol={currency.symbol} />
                 <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm">
                   <h3 className="text-xl font-black mb-6">Recent Daily Spend</h3>
                   <TransactionList transactions={transactions.slice(0, 5)} onDelete={id => setTransactions(prev => prev.filter(x => x.id !== id))} currencySymbol={currency.symbol} />
                 </div>
               </div>
               <div className="rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-sm h-fit">
                 <h3 className="mb-6 text-xl font-black">Quick Record</h3>
                 <ExpenseForm onAdd={addTransaction} categories={categories} currencySymbol={currency.symbol} />
               </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-black text-gray-900">Audit Ledger</h2>
            <TransactionList transactions={transactions} onDelete={id => setTransactions(prev => prev.filter(x => x.id !== id))} onEdit={setEditingTransaction} currencySymbol={currency.symbol} />
          </div>
        )}

        {activeTab === 'ai' && (
          <AIAssistant insights={aiInsights} isLoading={isAiLoading} transactions={transactions} onAsk={async (q) => {
            const resp = await getChatResponse(q, transactions, categories);
            return resp.text || "Thinking...";
          }} />
        )}

        {activeTab === 'settings' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DataManagement 
                  transactions={transactions} categories={categories} currencyCode={currencyCode} 
                  onImport={setTransactions} onRestore={setTransactions} 
                  onAddCategory={c => setCategories(p => [...p, c])} 
                  onRemoveCategory={c => setCategories(p => p.filter(x => x !== c))} 
                  onCurrencyChange={setCurrencyCode} customCurrencies={customCurrencies} 
                  onAddCustomCurrency={c => setCustomCurrencies(p => [...p, c])} 
                  onRemoveCustomCurrency={c => setCustomCurrencies(p => p.filter(x => x.code !== c))} 
                  onBackupToDrive={() => {}} onRestoreFromDrive={() => {}} isDriveOperating={isDriveOperating} notify={notify}
                />
              <div className="space-y-8">
                <div className="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm">
                   <h3 className="text-xl font-black mb-6">Budget Limits</h3>
                   <BudgetManager budgets={budgets} categories={categories} currencySymbol={currency.symbol} onSetBudget={(c, l) => setBudgets(p => [...p.filter(b => b.category !== c), {category: c, limit: l}])} onRemoveBudget={c => setBudgets(p => p.filter(b => b.category !== c))} />
                </div>
                {/* Simplified Settings: Savings Goal setter added here since profile management was removed */}
                <div className="rounded-[2.5rem] bg-white border border-gray-100 p-8 shadow-sm">
                   <h3 className="text-xl font-black mb-6">Savings Goal</h3>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Monthly Target</label>
                        <input 
                          type="number" 
                          value={user.savingsGoal} 
                          onChange={e => setUser(p => ({...p, savingsGoal: parseInt(e.target.value) || 0}))} 
                          className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-bold border-none" 
                        />
                      </div>
                      <p className="text-xs text-gray-400 font-medium italic">Adjust your monthly goal to track progress on the dashboard.</p>
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {editingTransaction && (
        <EditTransactionModal transaction={editingTransaction} categories={categories} currencySymbol={currency.symbol} onClose={() => setEditingTransaction(null)} onSave={t => setTransactions(p => p.map(x => x.id === t.id ? t : x))} />
      )}
    </div>
  );
};

export default App;
