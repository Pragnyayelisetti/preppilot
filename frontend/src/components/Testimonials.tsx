import React from 'react';
import { Star, Quote, Award, Sparkles } from 'lucide-react';

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Rohan Sharma',
      role: 'Incoming SWE Intern @ Google',
      university: 'IIT Delhi, Class of 2026',
      quote:
        'PrepPilot diagnosed my Graph Theory deficiency in 2 minutes. The 30-day preparation sprint gave me the exact LeetCode mediums and system design concepts that came up in my Google technical round.',
      outcome: 'Offer Landed • Google STEP',
      rating: 5,
    },
    {
      name: 'Elena Rostova',
      role: 'HackMIT 2024 Track Winner ($10K)',
      university: 'UC Berkeley, EECS',
      quote:
        'Finding hackathons is easy, but PrepPilot told us exactly which sponsors were looking for Account Abstraction and ZK proofs. We tailored our project to the bounty criteria and took first place.',
      outcome: '$10,000 Bounty Prize',
      rating: 5,
    },
    {
      name: 'Ananya Deshmukh',
      role: 'Generation Google Scholar & Microsoft Intern',
      university: 'NIT Trichy, Information Technology',
      quote:
        'I almost did not apply because I thought my CGPA was borderline. PrepPilot verified my eligibility and coached me through the essay structure using past winning templates.',
      outcome: '$2,500 Scholarship + Microsoft SDE',
      rating: 5,
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Award className="w-3.5 h-3.5" />
            Student Proven Outcomes
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Backed by students who landed their dream offers
          </h2>
          <p className="mt-3 text-base text-slate-300">
            From tier-1 tech internships to international hackathon bounties, see how student leaders prepare with PrepPilot.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-7 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-indigo-500/30 transition-all duration-300 shadow-xl backdrop-blur-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    {t.outcome}
                  </span>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-white text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{t.name}</div>
                  <div className="text-xs text-indigo-300 font-medium">{t.role}</div>
                  <div className="text-[11px] text-slate-400">{t.university}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
