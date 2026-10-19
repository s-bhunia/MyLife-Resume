import { education, experience, profile, projects, skills, travel, work } from "@mylife/profile";

export interface Thought {
  action: string | null;
  reply: string;
}

interface Rule {
  test: RegExp;
  answer: () => Thought;
}

const list = (items: readonly string[]) => items.map((item) => `• ${item}`).join("\n");

const RULES: Rule[] = [
  {
    test: /\b(resume|résumé|cv)\b/,
    answer: () => ({ action: "OPEN_RESUME", reply: "Opening the résumé in a new tab." }),
  },
  {
    test: /\b(quick ?view|summary|recruiter|tl;?dr|one page)\b/,
    answer: () => ({ action: "OPEN_QUICK_VIEW", reply: "Taking you to the one-page quick view." }),
  },
  {
    test: /\b(livekit|pipecat|voice agent|speech[- ]to[- ]speech|s2s|realtime voice|real-time voice)\b/,
    answer: () => ({ action: "OPEN_SCROLL:voice_agent", reply: work[0].summary }),
  },
  {
    test: /\b(stt|tts|asr|speech recognition|text[- ]to[- ]speech|speech model)/,
    answer: () => ({ action: "OPEN_SCROLL:speech_models", reply: work[1].summary }),
  },
  {
    test: /\b(llm|language model|fine[- ]?tun|finetun|deploy)/,
    answer: () => ({ action: "OPEN_SCROLL:llm_training", reply: work[2].summary }),
  },
  {
    test: /\b(intern|experience|job|working on|current|role|company|day to day)/,
    answer: () => ({
      action: "NAVIGATE_WORK",
      reply: `${experience[0].role}.\n${list(experience[0].points)}`,
    }),
  },
  {
    test: /\b(skill|stack|tech|tool|framework)/,
    answer: () => ({
      action: "NAVIGATE_SKILLS",
      reply: `Core skills:\n${list(skills.map((s) => `${s.title}: ${s.items.slice(0, 3).join(", ")}`))}`,
    }),
  },
  {
    test: /\b(project|portfolio|built|build|made|github)/,
    answer: () => ({
      action: "NAVIGATE_WORK",
      reply: `Here's the work wall. Highlights:\n${list([...work, ...projects].map((p) => `${p.title}: ${p.tagline}`))}`,
    }),
  },
  {
    test: /\b(educat|college|university|degree|study|studies|b\.?tech|gpa|cgpa)/,
    answer: () => ({
      action: null,
      reply: education.map((e) => `${e.degree}, ${e.org} (${e.period}). ${e.note}.`).join("\n"),
    }),
  },
  {
    test: /\b(contact|e-?mail|mail|hire|hiring|reach|connect|linkedin)/,
    answer: () => ({
      action: "NAVIGATE_ABOUT",
      reply: `The fastest way is email: ${profile.email}. LinkedIn and GitHub tiles are next to the portrait.`,
    }),
  },
  {
    test: /\b(book|librar|read)/,
    answer: () => ({ action: "NAVIGATE_LIBRARY", reply: "The library. Pick any book from the shelf to flip through it." }),
  },
  {
    test: /\b(travel|globe|place|journey|trip|visit)/,
    answer: () => ({
      action: "NAVIGATE_JOURNEYS",
      reply: `Journeys so far: ${travel.destinations.map((d) => d.label).join(", ")}, all starting from ${travel.origin.label}.`,
    }),
  },
  {
    test: /\b(diya|lamp|soul|devotion|bhakti|spiritual|song|music)\b/,
    answer: () => ({ action: "OPEN_SOUL", reply: "Lighting the diya. Turn your sound on." }),
  },
  {
    test: /\b(desk|table|laptop|workspace|setup)\b/,
    answer: () => ({ action: "NAVIGATE_DESK", reply: "This is where the work happens: laptop, studio mic and a diya." }),
  },
  {
    test: /\b(time|clock)\b/,
    answer: () => ({ action: "NAVIGATE_TIME", reply: "The tube clock. Drag its knob to dim the glow." }),
  },
  {
    test: /\b(home|center|centre|start|back)\b/,
    answer: () => ({ action: "NAVIGATE_HOME", reply: "Back to the centre of the room." }),
  },
  {
    test: /\b(who|about|introduce|yourself|santanu|bhunia|him)\b/,
    answer: () => ({
      action: "NAVIGATE_ABOUT",
      reply: `${profile.name} is an ${profile.role} and research intern focused on ${profile.focus}. ${profile.bio}`,
    }),
  },
  {
    test: /^(hi|hello|hey|namaste|yo|hola)\b/,
    answer: () => ({
      action: null,
      reply: `Hi! I'm the voice of ${profile.firstName}'s mind. Ask who he is, what he's working on, or say "show projects".`,
    }),
  },
];

export function think(input: string): Thought | null {
  const text = input.toLowerCase().trim();
  for (const rule of RULES) if (rule.test.test(text)) return rule.answer();
  return null;
}

export const FALLBACK: Thought = {
  action: null,
  reply: `I didn't catch that one. Try "who is ${profile.firstName}?", "current work", "skills" or "résumé".`,
};

export const SUGGESTIONS = [
  `Who is ${profile.firstName}?`,
  "What is he working on?",
  "Show projects",
  "Skills",
  "Résumé",
];
