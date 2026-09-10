import { Router, Request, Response } from 'express';
import { generateContentWithFallback } from '../gemini';
import { appState } from '../state';

export const assistantRouter = Router();

const REFUSAL_MESSAGE = "I am specialized to assist only with questions related to courses (programming, computer science, technical learning roadmaps, tutorials) and this website (PrepPilot features, mock assessments, video interviews, and opportunity tracking). For other topics, please consult external resources.";

// Fast keyword/pattern check for general unrelated topics
const UNRELATED_PATTERNS = [
  /\b(recipe|cook|bake|baking|ingredient|cuisine|pancake|cake|soup|pizza|pasta|food|restaurant)\b/i,
  /\b(movie|cinema|netflix|actor|actress|hollywood|bollywood|plot of|series|tv show)\b/i,
  /\b(weather|forecast|rain today|temperature in|climate)\b/i,
  /\b(joke|funny story|make me laugh|tell a joke|humor)\b/i,
  /\b(poem|poetry|rhyme|haiku|write a song|lyrics|fiction story)\b/i,
  /\b(horoscope|astrology|zodiac|fortune)\b/i,
  /\b(football match|cricket score|fifa|world cup|nba score|sports match|ipl)\b/i,
  /\b(dating advice|relationship advice|crush|flirt|girlfriend|boyfriend)\b/i,
  /\b(video game cheat|fortnite|minecraft|gta|playstation|xbox|pubg)\b/i,
  /\b(who won the war|presidential election|political party|prime minister|politics)\b/i,
  /\b(medical advice|diagnose illness|medicine dosage|symptoms of disease)\b/i
];

assistantRouter.post('/chat', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const trimmedMessage = message.trim();

  // Fast rejection of common off-topic categories
  const isClearlyOffTopic = UNRELATED_PATTERNS.some(p => p.test(trimmedMessage));
  if (isClearlyOffTopic) {
    return res.json({
      reply: REFUSAL_MESSAGE
    });
  }

  const user = appState.user;
  const oppSummary = appState.opportunities.map(o => `${o.company} (${o.title}, Deadline: ${o.deadline})`).join('; ');

  const systemContext = `You are PrepPilot Course & Website Copilot.
Current Student Profile:
- Name: ${user.name}
- Degree/Branch: ${user.degree} in ${user.branch} (Graduating ${user.gradYear})
- Skills: ${user.skills.join(', ')}
- Interests: ${user.interests.join(', ')}

STRICT SCOPE BOUNDARY (MANDATORY POLICY):
You are strictly restricted to answer ONLY questions related to:
1. COURSES & LEARNING:
   - Computer science, software engineering, and programming courses (DSA, System Design, Web/Cloud/Mobile Dev, DBMS, OS, Networks, AI/ML).
   - Course roadmaps, syllabus breakdowns, study resources, textbooks, practical modules, and certification recommendations.
   - Conceptual questions explaining topics found within academic and technical interview courses.
2. THIS WEBSITE (PREPPILOT PLATFORM):
   - How to use PrepPilot: Proctored Mock Assessments & exams (with strict 3-violation camera/mic rules).
   - AI Video Mock Interviews (video-call interface, speech answers, speech analytics).
   - Email Intelligence & Gmail Opportunity Sync (extracting hiring updates).
   - Application Tracking & Career Calendar.
   - Profile management and navigation across the site.

STRICT REFUSAL RULE:
If the question is NOT directly related to courses/technical study subjects or this website (e.g. food/cooking, cinema/entertainment, sports, relationships, politics, creative fiction, casual non-course chit-chat, medical questions):
You MUST reply with EXACTLY this refusal message and nothing else:
"${REFUSAL_MESSAGE}"

When answering permitted course or website queries, provide structured, clear, and actionable advice.`;

  const conversationText = history.map((h: any) => `${h.role === 'user' ? 'Student' : 'PrepPilot'}: ${h.content}`).join('\n');
  const fullPrompt = `${systemContext}\n\n${conversationText}\nStudent: ${message}\nPrepPilot:`;

  const fallback = `Here are key courses and website features available for you on PrepPilot:

1. **Recommended Courses**:
   - **Data Structures & Algorithms**: Master Arrays, Trees, Dynamic Programming, and Graph algorithms.
   - **System Design & Web Engineering**: High-level architecture, caching (Redis), databases (SQL vs NoSQL), and RESTful APIs.
   - **Core CS Fundamentals**: Operating Systems, Database Management Systems, and Computer Networks.

2. **PrepPilot Platform Features**:
   - **Proctored Mock Tests**: Take real-time timed assessments with strict camera, face, and audio proctoring.
   - **AI Video Mock Interviews**: Practice face-to-face simulated video interviews with adaptive AI questions and voice grammar analysis.
   - **Email Intelligence**: Connect your Gmail to auto-fetch campus and company opportunities directly into your dashboard.

Feel free to ask for a deeper breakdown of any course topic or how to use any part of the website!`;

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
