
import React, { useState } from 'react';
import { Transaction } from '../types';
import { Icons, CURRENCIES } from '../constants';

interface DataManagementProps {
  transactions: Transaction[];
  categories: string[];
  currencyCode: string;
  onImport: (data: Transaction[]) => void;
  onRestore: (data: Transaction[]) => void;
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
  onCurrencyChange: (code: string) => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ 
  transactions, 
  categories,
  currencyCode,
  onImport, 
  onRestore,
  onAddCategory,
  onRemoveCategory,
  onCurrencyChange
}) => {
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
    const rows = transactions.map(t => [t.date, t.type, t.category, t.description, t.amount]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smartspend_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split("\n").slice(1);
        const imported: Transaction[] = rows.filter(row => row.trim()).map(row => {
          const [date, type, category, description, amount] = row.split(",");
          return {
            id: crypto.randomUUID(),
            date,
            type: type as any,
            category,
            description,
            amount: parseFloat(amount)
          };
        });
        onImport(imported);
        alert(`Successfully imported ${imported.length} transactions!`);
      } catch (err) {
        alert("Failed to parse CSV. Please ensure format is: Date, Type, Category, Description, Amount");
      }
    };
    reader.readAsText(file);
  };

  const backupToLocal = () => {
    const data = JSON.stringify(transactions);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `smartspend_backup_${new Date().getTime()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const restoreFromBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          onRestore(data);
          alert("Backup restored successfully!");
        }
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8">
      {/* Settings Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Currency Management */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Icons.Currency className="h-5 w-5 text-blue-600" /> Currency Settings
          </h3>
          <p className="text-gray-500 mb-6 text-sm">Select your primary currency for all calculations.</p>
          
          <div className="grid grid-cols-1 gap-3">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => onCurrencyChange(c.code)}
                className={`flex items-center justify-between rounded-xl border p-4 transition ${
                  currencyCode === c.code 
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white font-bold text-gray-900 shadow-sm border border-gray-100">
                    {c.symbol}
                  </span>
                  <div className="text-left">
                    <div className="font-bold text-sm">{c.name}</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">{c.code}</div>
                  </div>
                </div>
                {currencyCode === c.code && (
                  <div className="rounded-full bg-blue-600 p-1 text-white">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Category Management */}
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Icons.Tag className="h-5 w-5 text-blue-600" /> Spend Categories
          </h3>
          <p className="text-gray-500 mb-6 text-sm">Organize your expenses with custom labels.</p>
          
          <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="New category..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
            <button 
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2 font-bold text-white text-sm hover:bg-blue-700 transition"
            >
              Add
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat} className="group flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                {cat}
                <button 
                  onClick={() => onRemoveCategory(cat)}
                  className="text-gray-400 hover:text-rose-500 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Excel / CSV Export</h3>
          <p className="text-gray-500 mb-6 text-sm">Download your full history for external analysis.</p>
          
          <div className="space-y-4">
            <button 
              onClick={exportToCSV}
              className="flex w-full items-center justify-between rounded-xl border border-gray-100 p-4 text-left hover:bg-gray-50 transition"
            >
              <div>
                <div className="font-semibold text-gray-900">Download History</div>
                <div className="text-xs text-gray-400">Save as CSV compatible with Excel</div>
              </div>
              <Icons.Download className="h-6 w-6 text-blue-600" />
            </button>

            <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-4 text-left hover:bg-gray-50 transition">
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              <div>
                <div className="font-semibold text-gray-900">Upload CSV</div>
                <div className="text-xs text-gray-400">Batch import your transactions</div>
              </div>
              <Icons.Upload className="h-6 w-6 text-blue-600" />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cloud Backup</h3>
          <p className="text-gray-500 mb-6 text-sm">Securely store a complete system snapshot.</p>
          
          <div className="space-y-4">
            <button 
              onClick={backupToLocal}
              className="flex w-full items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-left hover:bg-blue-50 transition"
            >
              <div>
                <div className="font-semibold text-blue-900">System Backup</div>
                <div className="text-xs text-blue-700">Full JSON backup including categories</div>
              </div>
              <Icons.Database className="h-6 w-6 text-blue-600" />
            </button>

            <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-4 text-left hover:bg-gray-50 transition">
              <input type="file" accept=".json" onChange={restoreFromBackup} className="hidden" />
              <div>
                <div className="font-semibold text-gray-900">System Restore</div>
                <div className="text-xs text-gray-400">Recover from a JSON snapshot</div>
              </div>
              <div className="rounded-lg bg-gray-100 p-2 text-gray-500">
                <Icons.Database className="h-5 w-5" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
