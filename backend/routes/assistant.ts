import { Router, Request, Response } from 'express';
import { generateContentWithFallback } from '../gemini';
import { appState } from '../state';

export const assistantRouter = Router();

assistantRouter.post('/chat', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const user = appState.user;
  const oppSummary = appState.opportunities.map(o => `${o.company} (${o.title}, Deadline: ${o.deadline})`).join('; ');

  const systemContext = `You are PrepPilot AI, an elite career copilot and mentor for university students aiming for top-tier software engineering, AI/ML, and tech opportunities.
Current Student Profile:
- Name: ${user.name}
- College: ${user.college}
- Degree/Branch: ${user.degree} in ${user.branch} (Graduating ${user.gradYear})
- Core Skills: ${user.skills.join(', ')}
- Interests: ${user.interests.join(', ')}
- Goal: ${user.careerGoals}
- Discovered Opportunities: ${oppSummary || 'No active opportunities yet, currently building foundational skills'}

Be concise, supportive, actionable, and pragmatic. Format answers with clear bullet points, specific algorithmic tips, or structured STAR interview advice where appropriate.`;

  const conversationText = history.map((h: any) => `${h.role === 'user' ? 'Student' : 'PrepPilot'}: ${h.content}`).join('\n');
  const fullPrompt = `${systemContext}\n\n${conversationText}\nStudent: ${message}\nPrepPilot:`;

  const fallback = `Great question! Given your background in ${user.branch} and target graduation year (${user.gradYear}), here are 3 targeted suggestions:

1. **Prioritize High-Frequency Patterns**: Focus on Sliding Window, Two Pointers, and Breadth-First Search. These represent over 60% of questions in Google and Amazon online assessments.
2. **Structure with STAR**: For behavioral questions, always define Situation, Task, Action, and quantifiable Result.
3. **Practice with Real Timing**: Use our Mock Test and AI Interview features to simulate test pressure before real rounds.

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
