import React from 'react';
import {
  User,
  GraduationCap,
  Target,
  Code2,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Award
} from 'lucide-react';

interface StudentProfileViewProps {
  user: {
    name: string;
    email: string;
    degree?: string;
    university?: string;
    branch?: string;
    graduationYear?: string;
    currentYear?: string;
    semester?: string;
    careerGoal?: string;
    skills?: string[];
    preferredOpportunities?: string[];
    preferredRoles?: string[];
    cgpa?: string;
  };
}

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ user }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-600/30">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black text-white">{user.name}</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Verified Candidate
            </span>
          </div>

          <p className="text-xs text-slate-400">{user.email}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-300">
            <span>{user.university || 'University Institute of Technology'}</span>
            <span>•</span>
            <span className="text-indigo-400 font-semibold">{user.degree || 'B.Tech'}</span>
            {user.branch && (
              <>
                <span>•</span>
                <span>{user.branch}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Academic Standing</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Current Standing:</span>
              <span className="font-bold text-white">
                {user.currentYear || '3rd Year'} • {user.semester || 'Semester 6'}
              </span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Graduation Batch:</span>
              <span className="font-bold text-indigo-400">{user.graduationYear || '2026'}</span>
            </div>

            <div className="flex justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
              <span className="text-slate-400">Primary Career Goal:</span>
              <span className="font-bold text-emerald-400">{user.careerGoal || 'Software Development'}</span>
            </div>
          </div>
        </div>

        {/* Opportunity Preferences */}
        <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span>Opportunity Targets</span>
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-slate-400 block mb-1.5">Monitored Opportunity Types:</span>
              <div className="flex flex-wrap gap-1.5">
                {(user.preferredOpportunities || ['Internships', 'Placements', 'Hackathons']).map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1.5">Target Roles:</span>
              <div className="flex flex-wrap gap-1.5">
                {(user.preferredRoles || ['SDE Intern', 'Frontend Engineer', 'Backend Engineer']).map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Skills Matrix */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Code2 className="w-4 h-4 text-violet-400" />
          <span>Active Technical Skills Matrix</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          {(user.skills || ['Python', 'Java', 'C++', 'JavaScript', 'React', 'SQL', 'DBMS', 'OOP', 'DSA']).map(
            (sk) => (
              <span
                key={sk}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-medium text-slate-200"
              >
                {sk}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
};
