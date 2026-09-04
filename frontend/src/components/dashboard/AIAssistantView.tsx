import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  Code2,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export const AIAssistantView: React.FC<{ userName: string }> = ({ userName }) => {
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    {
      sender: 'bot',
      text: `Hello ${userName.split(' ')[0]}! I'm your PrepPilot Career Copilot 🎯\n\nI have analyzed your resume, skills matrix, and your 4 active opportunities. TechNova is your most urgent deadline (5 days away). What would you like to prepare right now?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'What should I prepare today?',
    'Which opportunity should I prioritize?',
    'What are my biggest skill gaps?',
    'Give me 3 DBMS Normalization interview questions',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    setTimeout(() => {
      let reply = '';
      if (query.toLowerCase().includes('today') || query.toLowerCase().includes('prepare')) {
        reply = `🎯 Recommended Sprint for Today:\n\n1. Review OOP Principles (Polymorphism vs Inheritance) - 30 mins\n2. Solve 5 Array / Sliding Window problems on LeetCode - 45 mins\n3. Practice DBMS 3NF vs BCNF decompositions - 35 mins\n\nCompleting this will raise your TechNova interview match probability from 82% to 89%!`;
      } else if (query.toLowerCase().includes('prioritize')) {
        reply = `⭐ Priority Ranking:\n\n1. TechNova Software Engineer Interview (5 days) - HIGH PRIORITY\n2. ETHGlobal Singapore Hackathon (8 days) - MEDIUM PRIORITY\n3. Apex Analytics Assessment (12 days) - NORMAL PRIORITY\n4. Microsoft Placement Drive (21 days) - BACKGROUND RADAR`;
      } else if (query.toLowerCase().includes('gap') || query.toLowerCase().includes('skill')) {
        reply = `📊 Skill Gap Breakdown:\n\n• System Design: 40% (Needs Improvement - focus on Caching & Rate Limiters)\n• DBMS: 70% (Focus on Indexing & Normalization)\n• DSA: 80% (Strong - keep practicing Graph Mediums)\n• OOP: 90% (Very Strong - ready for interviews)`;
      } else if (query.toLowerCase().includes('dbms') || query.toLowerCase().includes('normalization') || query.toLowerCase().includes('questions')) {
        reply = `💡 TechNova Target Questions (DBMS):\n\n1. What is the fundamental difference between 3NF and BCNF? When can a 3NF relation violate BCNF?\n2. Explain write-ahead logging (WAL) and how ACID durability is guaranteed during system crashes.\n3. How do Clustered vs Non-Clustered B-Tree indexes impact search speed vs insertion overhead?`;
      } else {
        reply = `I have logged your question: "${query}". Based on your CS degree profile and TechNova interview timeline, keep focusing on core data structures, DBMS query tuning, and clean OOP architecture. Let me know if you want a mock problem or concept summary!`;
      }

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-violet-950/30 border border-violet-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Career Copilot</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">PrepPilot Assistant</h2>
          <p className="text-xs text-slate-300">
            Real-time preparation guidance, technical interview questions, and priority analysis.
          </p>
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {samplePrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 hover:text-white transition-all shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>{p}</span>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl p-4 sm:p-6 flex flex-col justify-between h-[520px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((m, idx) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isBot ? 'items-start' : 'items-end justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 text-white shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow ${
                    isBot
                      ? 'bg-slate-950/80 border border-white/10 text-slate-200 rounded-tl-sm'
                      : 'bg-indigo-600 text-white rounded-tr-sm'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 animate-spin">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 text-xs text-slate-400 animate-pulse">
                PrepPilot is analyzing your interview criteria...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about today's tasks, interview questions, or skill gaps..."
            className="flex-1 bg-slate-950 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
