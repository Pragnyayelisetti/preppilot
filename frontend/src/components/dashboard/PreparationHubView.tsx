import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  Layers,
  Sparkles,
  ArrowRight,
  Flame,
  Award,
  ChevronRight,
  Check
} from 'lucide-react';
import { DEMO_PREP_TASKS, DEMO_SKILLS, PrepTask } from './dashboardData';

export const PreparationHubView: React.FC = () => {
  const [tasks, setTasks] = useState<PrepTask[]>(DEMO_PREP_TASKS);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const filteredTasks = tasks.filter(
    (t) => activeCategory === 'All' || t.category === activeCategory
  );

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Sprint Roadmap Engine</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Targeted Preparation Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every practice problem is directly reverse-engineered from your upcoming deadlines. Prioritize your highest-yield skill gaps before technical interviews begin.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-white/10 shrink-0">
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Sprint Completion</div>
              <div className="text-2xl font-black text-emerald-400 mt-0.5">{progressPercent}%</div>
            </div>
            <div className="h-8 w-px bg-white/10"></div>
            <div className="text-center">
              <div className="text-xs text-slate-400 font-medium">Streak</div>
              <div className="text-2xl font-black text-amber-400 mt-0.5 flex items-center justify-center gap-1">
                <Flame className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>7d</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['All', 'DSA', 'OOP', 'SQL', 'DBMS'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
            }`}
          >
            {cat} Tasks
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => handleToggle(task.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
              task.completed
                ? 'bg-slate-950/40 border-white/5 opacity-70'
                : 'bg-slate-900/80 border-white/10 hover:border-indigo-500/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                  task.completed
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'border-white/20 bg-slate-900 hover:border-white/40'
                }`}
              >
                {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-indigo-300">
                    {task.category}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      task.completed ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400 font-mono">
                {task.estimatedMinutes} mins
              </span>
              <button
                className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white"
                title="Practice problem"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Core Modules */}
      <div className="pt-4">
        <h3 className="text-base font-bold text-white mb-4">Core Skill Modules to Master</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                High Priority
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">Live Coding & Trees (DSA)</h4>
            <p className="text-xs text-slate-400">
              Binary Search Trees, Lowest Common Ancestor, and DFS recursion patterns.
            </p>
            <div className="text-xs text-indigo-400 font-bold flex items-center gap-1">
              <span>Start 45-min Session</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 w-fit">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">DBMS Normalization (SQL)</h4>
            <p className="text-xs text-slate-400">
              Functional dependencies, 3NF vs BCNF decomposition, and Index B-Trees.
            </p>
            <div className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <span>Review Cheatsheet</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
            <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 w-fit">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">OOP Design Patterns</h4>
            <p className="text-xs text-slate-400">
              Factory, Singleton, and Observer design patterns with live code snippets.
            </p>
            <div className="text-xs text-violet-400 font-bold flex items-center gap-1">
              <span>Practice Coding</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
