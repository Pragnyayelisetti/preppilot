import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Plus
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

const COMMON_SKILLS = [
  'Data Structures & Algorithms',
  'Java',
  'Python',
  'C++',
  'JavaScript / TypeScript',
  'React',
  'Node.js',
  'SQL / PostgreSQL',
  'System Design',
  'Object-Oriented Programming',
  'DBMS',
  'Computer Networks',
  'Operating Systems',
  'Machine Learning',
  'Docker & Cloud',
  'Git / GitHub'
];

const COMMON_INTERESTS = [
  'Software Development',
  'Backend Systems',
  'Full Stack Engineering',
  'Machine Learning & AI',
  'Cloud & DevOps',
  'Mobile App Development',
  'Cybersecurity',
  'Competitive Programming'
];

const COMMON_ROLES = [
  'Software Development Engineer',
  'Backend Engineer',
  'Frontend Engineer',
  'Full Stack Engineer',
  'AI/ML Engineer',
  'Data Engineer',
  'Cloud/DevOps Engineer',
  'QA / SDET'
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { user, updateProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [college, setCollege] = useState(user?.college || 'Stanford University');
  const [degree, setDegree] = useState(user?.degree || 'B.Tech / B.S.');
  const [branch, setBranch] = useState(user?.branch || 'Computer Science & Engineering');
  const [gradYear, setGradYear] = useState(user?.gradYear || '2027');
  const [skills, setSkills] = useState<string[]>(user?.skills || ['Data Structures & Algorithms', 'Python', 'Java', 'React']);
  const [customSkill, setCustomSkill] = useState('');
  const [interests, setInterests] = useState<string[]>(user?.interests || ['Software Development', 'Backend Systems']);
  const [preferredRoles, setPreferredRoles] = useState<string[]>(user?.preferredRoles || []);
  const [careerGoals, setCareerGoals] = useState(user?.careerGoals || 'Crack Tier-1 Software Engineering Internships and Full-Time Roles');

  const toggleSkill = (s: string) => {
    setSkills(prev =>
      prev.includes(s) ? prev.filter(item => item !== s) : [...prev, s]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const toggleInterest = (i: string) => {
    setInterests(prev =>
      prev.includes(i) ? prev.filter(item => item !== i) : [...prev, i]
    );
  };

  const toggleRole = (r: string) => {
    setPreferredRoles(prev =>
      prev.includes(r) ? prev.filter(item => item !== r) : [...prev, r]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await updateProfile({
        college,
        degree,
        branch,
        gradYear,
        skills,
        interests,
        preferredRoles,
        careerGoals,
        isOnboarded: true
      });
      onComplete();
    } catch (err) {
      console.error('Failed completing onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6 animate-fade-in my-6">
      {/* Progress Stepper */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
              Step {step} of 3
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {step === 1 ? 'Education & College' : step === 2 ? 'Technical Skills' : 'Career Focus'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            {step === 1 && 'Where are you currently studying?'}
            {step === 2 && 'What is your current technical stack?'}
            {step === 3 && 'What are your target career outcomes?'}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s === step
                  ? 'w-8 bg-indigo-600'
                  : s < step
                  ? 'w-4 bg-emerald-500'
                  : 'w-4 bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Academic & College */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              College / University
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. University of California, Berkeley / IIT Delhi"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Degree Program
              </label>
              <select
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="B.Tech / B.S.">B.Tech / B.S. (Bachelor of Science)</option>
                <option value="M.Tech / M.S.">M.Tech / M.S. (Master of Science)</option>
                <option value="BCA / MCA">BCA / MCA</option>
                <option value="Other Degree">Other STEM Degree</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Graduation Year
              </label>
              <select
                value={gradYear}
                onChange={(e) => setGradYear(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="2025">2025 (Immediate Hiring)</option>
                <option value="2026">2026 (Final Year)</option>
                <option value="2027">2027 (Pre-Final Year Internships)</option>
                <option value="2028">2028 (Undergraduate Foundation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Major / Specialization Branch
            </label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="e.g. Computer Science and Engineering, Information Technology, AI"
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>
        </div>
      )}

      {/* Step 2: Skills */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Select the technologies you have studied or coded in. PrepPilot uses this to calculate match confidence.
          </p>

          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.map(sk => {
              const isSelected = skills.includes(sk);
              return (
                <button
                  key={sk}
                  type="button"
                  onClick={() => toggleSkill(sk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{sk}</span>
                </button>
              );
            })}
          </div>

          {/* Add custom skill */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkill())}
              placeholder="Add another skill (e.g. Rust, PyTorch, GraphQL)..."
              className="flex-1 p-2 text-xs rounded-xl border border-slate-300 bg-white"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Career Goals & Outcomes */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Target Domains & Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_INTERESTS.map(int => {
                const isSelected = interests.includes(int);
                return (
                  <button
                    key={int}
                    type="button"
                    onClick={() => toggleInterest(int)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{int}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
              Preferred Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_ROLES.map(role => {
                const isSelected = preferredRoles.includes(role);
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Primary Career Objective
            </label>
            <textarea
              rows={3}
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="e.g. Crack Google or Amazon SDE internship, build distributed systems, publish open source projects..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white leading-relaxed"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <span>
              All set! Your profile will be used to benchmark incoming recruitment emails and generate tailored roadmaps.
            </span>
          </div>
        </div>
      )}

      {/* Step Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <span>{loading ? 'Finalizing Profile...' : 'Complete & Launch Copilot'}</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
