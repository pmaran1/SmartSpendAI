
import React, { useState, useRef, useEffect } from 'react';
import { AIInsight, Transaction, ChatMessage } from '../types';
import { Icons } from '../constants';

interface AIAssistantProps {
  insights: AIInsight[];
  isLoading: boolean;
  transactions: Transaction[];
  onAsk: (query: string) => Promise<string>;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ insights, isLoading, transactions, onAsk }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [query, setQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isChatLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setIsChatLoading(true);

    const response = await onAsk(query);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsChatLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Insights Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-400 animate-pulse">AI is contemplating your wealth...</div>
        ) : (
          insights.map((insight, idx) => (
            <div key={idx} className="rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
              <div className="mb-4 flex items-start justify-between">
                <div className={`rounded-xl p-3 ${
                  insight.type === 'saving' ? 'bg-emerald-50 text-emerald-600' :
                  insight.type === 'alert' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Icons.Sparkles className="h-6 w-6" />
                </div>
                <span className="rounded-full px-2 py-1 text-[10px] font-bold uppercase bg-blue-100 text-blue-700">{insight.impact}</span>
              </div>
              <h4 className="text-lg font-bold">{insight.title}</h4>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{insight.description}</p>
            </div>
          ))
        )}
      </div>

      {/* Financial Chatbox */}
      <div className="rounded-2xl border bg-white shadow-xl flex flex-col h-[500px] overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icons.Message className="h-6 w-6" />
            <span className="font-bold">Financial Sidekick Chat</span>
          </div>
          <span className="text-[10px] bg-blue-500 px-2 py-1 rounded font-bold uppercase tracking-widest">Powered by Gemini</span>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8">
              <Icons.Sparkles className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">"How much did I spend at Starbucks?"<br/>"What's my biggest expense category?"</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border text-gray-700 rounded-tl-none shadow-sm'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isChatLoading && <div className="text-xs text-gray-400 italic px-2">Sidekick is thinking...</div>}
        </div>

        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
          <input 
            type="text" 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about your spending..."
            className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button type="submit" disabled={isChatLoading} className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 active:scale-95 transition">
            <svg className="h-5 w-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
