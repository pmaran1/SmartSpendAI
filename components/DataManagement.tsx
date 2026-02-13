
import React, { useState } from 'react';
import { Transaction } from '../types';
import { Icons, CURRENCIES } from '../constants';
import * as XLSX from 'xlsx';

interface DataManagementProps {
  transactions: Transaction[];
  categories: string[];
  currencyCode: string;
  onImport: (data: Transaction[]) => void;
  onRestore: (data: Transaction[]) => void;
  onAddCategory: (name: string) => void;
  onRemoveCategory: (name: string) => void;
  onCurrencyChange: (code: string) => void;
  customCurrencies: {code: string, symbol: string, name: string}[];
  onAddCustomCurrency: (currency: {code: string, symbol: string, name: string}) => void;
  onRemoveCustomCurrency: (code: string) => void;
  onBackupToDrive?: () => void;
  onRestoreFromDrive?: () => void;
  isDriveOperating?: boolean;
  notify?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ 
  transactions, 
  categories,
  currencyCode,
  onImport, 
  onRestore,
  onAddCategory,
  onRemoveCategory,
  onCurrencyChange,
  customCurrencies,
  onAddCustomCurrency,
  onRemoveCustomCurrency,
  onBackupToDrive,
  onRestoreFromDrive,
  isDriveOperating,
  notify
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [showCustomCurrencyForm, setShowCustomCurrencyForm] = useState(false);
  const [customCurrForm, setCustomCurrForm] = useState({ code: '', symbol: '', name: '' });

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  const handleAddCustomCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCurrForm.code && customCurrForm.symbol && customCurrForm.name) {
      onAddCustomCurrency({ ...customCurrForm, code: customCurrForm.code.toUpperCase() });
      setCustomCurrForm({ code: '', symbol: '', name: '' });
      setShowCustomCurrencyForm(false);
    }
  };

  const downloadTemplate = () => {
    const data = [['Date', 'Type', 'Category', 'Description', 'Amount'], [new Date().toISOString().split('T')[0], 'expense', 'Food & Dining', 'Sample Lunch', 15.00]];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "SmartSpend_Template.xlsx");
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      notify?.("No transactions to export.", 'info');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, `smartspend_export_${new Date().getTime()}.xlsx`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const jsonData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        if (jsonData.length === 0) {
          notify?.("The uploaded file appears to be empty.", 'error');
          return;
        }

        const mappedData = jsonData.map(row => ({
          ...row,
          id: row.id || crypto.randomUUID(),
          // Cast date explicitly to string to handle Excel's numeric date format
          date: String(row.Date || row.date || new Date().toISOString().split('T')[0]),
          type: (row.Type || row.type || 'expense').toLowerCase(),
          category: row.Category || row.category || 'Other',
          description: row.Description || row.description || 'Imported Transaction',
          amount: parseFloat(row.Amount || row.amount || 0)
        }));

        onImport(mappedData);
        
        // Reset input so the same file can be uploaded again if needed
        e.target.value = '';
      } catch (err) {
        console.error(err);
        notify?.("Failed to parse file. Please ensure you're using the correct template.", 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Google Drive Cloud Card */}
      <div className="rounded-2xl border border-indigo-100 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-indigo-50/20 to-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-indigo-100">
             <svg className="h-6 w-6 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.11 3H8.89L3 13.14L6.05 18.5H17.95L21 13.14L15.11 3ZM15.42 16.5H8.58L5.53 11.23L8.68 5.75H15.31L18.47 11.23L15.42 16.5Z" />
             </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Google Drive Cloud</h3>
            <p className="text-sm text-gray-500 font-medium">Safe, private backups on your own Drive.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={onBackupToDrive} 
            disabled={isDriveOperating}
            className="group flex items-center justify-between rounded-2xl bg-indigo-600 px-6 py-4 text-left text-white shadow-xl shadow-indigo-100 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            <div>
              <div className="font-bold">Backup to Drive</div>
              <div className="text-[10px] uppercase font-bold opacity-70">Sync current records</div>
            </div>
            {isDriveOperating ? <div className="animate-spin h-6 w-6 border-2 border-white/20 border-t-white rounded-full" /> : <Icons.Upload className="h-6 w-6 text-white" />}
          </button>

          <button 
            onClick={onRestoreFromDrive} 
            disabled={isDriveOperating}
            className="group flex items-center justify-between rounded-2xl border border-indigo-200 bg-white px-6 py-4 text-left shadow-sm transition hover:bg-indigo-50 active:scale-95 disabled:opacity-50"
          >
            <div className="text-indigo-900">
              <div className="font-bold">Restore from Drive</div>
              <div className="text-[10px] uppercase font-bold text-indigo-400">Download cloud snapshot</div>
            </div>
            {isDriveOperating ? <div className="animate-spin h-6 w-6 border-2 border-indigo-600/20 border-t-indigo-600 rounded-full" /> : <Icons.Download className="h-6 w-6 text-indigo-600" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Icons.Currency className="h-5 w-5 text-blue-600" /> Currency</h3>
            <button onClick={() => setShowCustomCurrencyForm(!showCustomCurrencyForm)} className="shrink-0 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
              {showCustomCurrencyForm ? 'Cancel' : 'Add Custom'}
            </button>
          </div>
          {showCustomCurrencyForm && (
            <form onSubmit={handleAddCustomCurrency} className="mb-6 space-y-3 bg-gray-50 p-4 rounded-xl border">
              <input type="text" placeholder="Code (e.g. BTC)" value={customCurrForm.code} onChange={e => setCustomCurrForm(p => ({ ...p, code: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input type="text" placeholder="Symbol (e.g. ₿)" value={customCurrForm.symbol} onChange={e => setCustomCurrForm(p => ({ ...p, symbol: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <input type="text" placeholder="Full Name" value={customCurrForm.name} onChange={e => setCustomCurrForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border px-3 py-2 text-sm" />
              <button type="submit" className="w-full rounded-lg bg-blue-600 py-2 text-xs font-bold text-white">Save</button>
            </form>
          )}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {[...CURRENCIES, ...customCurrencies].map((c) => (
              <button key={c.code} onClick={() => onCurrencyChange(c.code)} className={`flex w-full items-center justify-between rounded-xl border p-4 ${currencyCode === c.code ? 'border-blue-500 bg-blue-50 text-blue-700' : 'bg-white border-gray-100'}`}>
                <span className="font-bold">{c.name} ({c.symbol})</span>
                {currencyCode === c.code && <div className="h-2 w-2 rounded-full bg-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2"><Icons.Tag className="h-5 w-5 text-blue-600" /> Categories</h3>
          <form onSubmit={handleAddCategory} className="flex items-center gap-2 mb-6">
            <input type="text" placeholder="New category..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 min-w-0 h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm focus:border-blue-500" />
            <button type="submit" className="shrink-0 h-11 rounded-xl bg-blue-600 px-6 font-bold text-white text-sm whitespace-nowrap">Add</button>
          </form>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat} className="group flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700">
                {cat}
                <button onClick={() => onRemoveCategory(cat)} className="text-gray-400 hover:text-rose-500 transition-colors"><Icons.Plus className="h-3 w-3 rotate-45" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Import & Export</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={downloadTemplate} className="rounded-xl border border-blue-100 bg-blue-50/30 py-3 text-xs font-bold text-blue-900">Template</button>
              <button onClick={exportToCSV} className="rounded-xl border border-gray-100 bg-gray-50/30 py-3 text-xs font-bold text-gray-900">Export XLSX</button>
            </div>
            <label className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-blue-600 p-4 shadow-lg shadow-blue-100">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
              <div className="text-white font-bold">Bulk Upload</div>
              <Icons.Upload className="h-6 w-6 text-white shrink-0" />
            </label>
          </div>
        </div>
        <div className="rounded-2xl border bg-white p-6 sm:p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Local Snapshots</h3>
          <div className="space-y-4">
            <button onClick={() => { const d = JSON.stringify(transactions); const b = new Blob([d], {type:'application/json'}); const u = URL.createObjectURL(b); const l = document.createElement("a"); l.href = u; l.download = "backup.json"; l.click(); }} className="flex w-full items-center justify-between rounded-xl border p-4 text-left hover:bg-gray-50">
              <div className="font-bold text-gray-900">JSON Export</div>
              <Icons.Database className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
