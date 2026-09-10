import { Router, Request, Response } from 'express';
import { generateContentWithFallback } from '../gemini';
import { appState } from '../state';

export const assistantRouter = Router();

const REFUSAL_MESSAGE = "I am designed for this purpose only. I am PrepPilot's Career & Application Copilot, specialized exclusively in assisting you with job applications, campus placements, tech interviews, coding preparation, resumes, and our mock testing & proctored assessment features.";

// Patterns that are clearly outside career/application scope
const OFF_TOPIC_PATTERNS = [
  /\b(recipe|cook|bake|baking|ingredient|cuisine|pancake|cake|soup|pizza|pasta)\b/i,
  /\b(movie|cinema|netflix|actor|actress|hollywood|bollywood|plot of)\b/i,
  /\b(weather|forecast|rain today|temperature in)\b/i,
  /\b(joke|funny story|make me laugh|tell a joke)\b/i,
  /\b(poem|poetry|rhyme|haiku|write a song|lyrics)\b/i,
  /\b(horoscope|astrology|zodiac)\b/i,
  /\b(football match|cricket score|fifa|world cup winner|nba score)\b/i,
  /\b(dating advice|relationship advice|crush|flirt)\b/i,
  /\b(video game cheat|fortnite|minecraft|gta|playstation)\b/i,
  /\b(who won the war|presidential election|political party)\b/i
];

assistantRouter.post('/chat', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const trimmedMessage = message.trim();

  // Fast check: reject clearly unrelated queries immediately
  const isClearlyOffTopic = OFF_TOPIC_PATTERNS.some(p => p.test(trimmedMessage));
  if (isClearlyOffTopic) {
    return res.json({
      reply: REFUSAL_MESSAGE
    });
  }

  const user = appState.user;
  const oppSummary = appState.opportunities.map(o => `${o.company} (${o.title}, Deadline: ${o.deadline})`).join('; ');

  const systemContext = `You are PrepPilot AI, an elite career and job application copilot for university students and engineers.
Current Student Profile:
- Name: ${user.name}
- College: ${user.college}
- Degree/Branch: ${user.degree} in ${user.branch} (Graduating ${user.gradYear})
- Core Skills: ${user.skills.join(', ')}
- Interests: ${user.interests.join(', ')}
- Goal: ${user.careerGoals}
- Discovered Opportunities: ${oppSummary || 'No active opportunities yet, currently building foundational skills'}

STRICT DOMAIN SCOPE & MANDATORY REFUSAL RULE:
You are EXCLUSIVELY authorized to answer questions regarding:
1. Job, internship, and campus placement applications, deadlines, eligibility, and referral requests.
2. Technical interviews (DSA, System Design, OOP, DBMS, OS, Networking, Web/App/Cloud Engineering).
3. Behavioral and HR interview questions (STAR method, leadership principles, salary/offer negotiations).
4. Resumes, CVs, GitHub portfolios, LinkedIn profile optimization, and cold outreach to recruiters.
5. Career roadmaps, technical skill progression, and certification strategies.
6. PrepPilot platform features (proctored mock assessments, video mock interviews, application tracking, career calendar).

ABSOLUTE REFUSAL REQUIREMENT:
If the user's message is ANYWAY unrelated or outside of career preparation, job/internship applications, tech interviews, resumes, or PrepPilot features (for example: cooking/food recipes, movies, weather, jokes, creative fiction/poetry, sports scores, gaming, gossip, casual non-career chit-chat, politics, homework in non-computer science subjects, etc.):
You MUST NOT answer or entertain the question. You MUST reply with EXACTLY this string and nothing else:
"${REFUSAL_MESSAGE}"

Format allowed career responses with clear, concise, actionable bullet points, specific algorithmic tips, or structured interview advice.`;

  const conversationText = history.map((h: any) => `${h.role === 'user' ? 'Student' : 'PrepPilot'}: ${h.content}`).join('\n');
  const fullPrompt = `${systemContext}\n\n${conversationText}\nStudent: ${message}\nPrepPilot:`;

  const fallback = `Great question! Given your background in ${user.branch} and target graduation year (${user.gradYear}), here are 3 targeted suggestions:

1. **Prioritize High-Frequency Patterns**: Focus on Sliding Window, Two Pointers, and Breadth-First Search. These represent over 60% of questions in Google and Amazon online assessments.
2. **Structure with STAR**: For behavioral questions, always define Situation, Task, Action, and quantifiable Result.
3. **Practice with Real Timing**: Use our Proctored Mock Test and AI Video Interview features to simulate real interview pressure.

Would you like me to tailor a 2-week preparation schedule or review a specific data structure topic?`;

  try {
    const aiResponse = await generateContentWithFallback(fullPrompt, fallback);
    res.json({
      reply: aiResponse
    });
  } catch (err: any) {
    res.json({
      reply: fallback
    });
  }
});
