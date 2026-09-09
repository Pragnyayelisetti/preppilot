import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  RotateCcw,
  ArrowRight,
  BookOpen,
  Award,
  ChevronRight
} from 'lucide-react';

export const AiCareerAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: `Hello! I am your PrepPilot AI Career Copilot. I can help you prepare algorithmic study plans, refine your STAR behavioral stories, predict likely questions for specific employers, and optimize your technical preparation. How can I guide you today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const promptStarters = [
    'How should I structure a 2-week preparation for Google OA?',
    'Give me a strong STAR example for a technical challenge project',
    'What database indexing concepts are tested in round 2 interviews?',
    'How do I explain trade-offs between SQL and NoSQL in system design?'
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const newHistory = [...messages, { role: 'user' as const, content: query }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAssistant(query, newHistory);
      if (res?.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
      }
    } catch (err) {
      console.error('Failed querying AI assistant:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'I encountered an error connecting to the career model. Please try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-assistant-view" className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                PrepPilot AI Career Mentor
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trained on student placement roadmaps, algorithmic patterns, and interview rubrics.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content:
                  'Conversation reset. Ask any question about your career, internships, or interview strategy!'
              }
            ])
          }
          className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 text-xs flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs min-h-[420px] max-h-[550px] overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                m.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-indigo-100 text-indigo-800'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-tl-xs'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic p-3">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>PrepPilot AI is drafting structured career guidance...</span>
          </div>
        )}
      </div>

      {/* Prompt Starters */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Suggested Questions:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {promptStarters.map((ps, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(ps)}
              className="text-left text-xs bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:border-indigo-300 transition-colors flex items-center justify-between"
            >
              <span className="line-clamp-1">{ps}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for interview strategies, DSA topics, resume bullet advice..."
          className="flex-1 p-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
