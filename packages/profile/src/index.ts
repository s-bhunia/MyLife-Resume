export interface Social {
  id: "linkedin" | "github" | "youtube" | "medium" | "discord" | "email";
  label: string;
  handle: string;
  url: string;
  icon: string;
}

export interface Showcase {
  id: string;
  symbol: string;
  title: string;
  tagline: string;
  kind: "work" | "project";
  stack: string[];
  summary: string;
  link?: string;
  code?: string;
}

export interface SkillGroup {
  id: string;
  symbol: string;
  title: string;
  tagline: string;
  items: string[];
}

export interface Experience {
  role: string;
  org: string;
  period: string;
  points: string[];
}

export interface Education {
  degree: string;
  org: string;
  period: string;
  note: string;
}

export const profile = {
  name: "Santanu Bhunia",
  firstName: "Santanu",
  initials: "SB",
  role: "AI/ML Engineer",
  focus: "Speech AI · LLMs · Real-time Voice Agents",
  headline:
    "I train speech and language models, stack them into real-time voice agents, and ship them to production.",
  location: "Barrackpore, West Bengal, India",
  email: "santanubhunia9836@gmail.com",
  resumeUrl: "/loader/Resume_S_Bhunia.pdf",
  portrait: "/portrait/formal_cutout.webp",
  status: "Open to AI/ML engineering roles and research collaborations",
  bio: "He trains and fine-tunes speech-to-text, language and text-to-speech models, stacks them into real-time voice agents on LiveKit and Pipecat, and ships them to production.",
  about: [
    "I'm an AI/ML engineer and research intern working on the full speech stack: speech-to-text, large language models and text-to-speech, trained, fine-tuned and wired together into voices that answer in real time.",
    "My days go into cutting latency out of every hop between a user's voice and the model's reply, and into turning research checkpoints into production services that stay observable and reliable.",
    "This house is a map of my mind: the work I'm proud of, the skills I keep sharpening, the books I read, the places I've been and the quiet corner I return to.",
  ],
} as const;

export const experience: Experience[] = [
  {
    role: "AI/ML Engineer & Research Intern",
    org: "",
    period: "Present",
    points: [
      "Train and fine-tune speech-to-text, text-to-speech and large language models for production voice products.",
      "Stack STT → LLM → TTS into end-to-end speech-to-speech pipelines on LiveKit and Pipecat.",
      "Profile and cut end-to-end latency across streaming inference, model serving and orchestration.",
      "Deploy models to production behind Docker, Redis and Celery, monitored with Grafana.",
    ],
  },
];

export const education: Education[] = [
  {
    degree: "B.Tech, Computer Science & Engineering",
    org: "Swami Vivekananda University",
    period: "2023 – 2027",
    note: "YGPA 8.86 (year 1) · 8.76 (year 2)",
  },
];

export const socials: Social[] = [
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "in/s-bhunia",
    url: "https://www.linkedin.com/in/s-bhunia/",
    icon: "/loader/linkedin.svg",
  },
  {
    id: "github",
    label: "GitHub",
    handle: "s-bhunia",
    url: "https://github.com/s-bhunia",
    icon: "/loader/github.svg",
  },
  {
    id: "youtube",
    label: "YouTube",
    handle: "@InitToInfinity",
    url: "https://www.youtube.com/@InitToInfinity",
    icon: "/loader/youtube.svg",
  },
  {
    id: "medium",
    label: "Medium",
    handle: "@santanubhunia9836",
    url: "https://medium.com/@santanubhunia9836",
    icon: "/loader/medium.svg",
  },
  {
    id: "discord",
    label: "Discord",
    handle: "Community",
    url: "https://discord.gg/CtJcquwaK7",
    icon: "/loader/discord.svg",
  },
];

export const work: Showcase[] = [
  {
    id: "voice_agent",
    symbol: "🎙️",
    title: "Real-time Voice Agent",
    tagline: "STT → LLM → TTS",
    kind: "work",
    stack: ["LiveKit", "Pipecat", "Streaming STT", "LLM", "TTS"],
    summary:
      "End-to-end speech-to-speech pipeline that listens, thinks and talks back with conversational latency.",
  },
  {
    id: "speech_models",
    symbol: "🗣️",
    title: "Speech Model Training",
    tagline: "STT · TTS",
    kind: "work",
    stack: ["Deep Learning", "STT", "TTS", "Fine-tuning"],
    summary:
      "Training and fine-tuning speech recognition and synthesis models for production voice products.",
  },
  {
    id: "llm_training",
    symbol: "🧠",
    title: "LLM Fine-tuning & Serving",
    tagline: "Train · Optimise · Deploy",
    kind: "work",
    stack: ["LLMs", "Fine-tuning", "Docker", "Redis", "Celery", "Grafana"],
    summary:
      "Fine-tuned language models deployed as low-latency, observable production services.",
  },
];

export const projects: Showcase[] = [
  {
    id: "Link Saver",
    symbol: "🔗",
    title: "AI-LinkMind",
    tagline: "LLM link organiser",
    kind: "project",
    stack: ["React", "Kotlin", "Node.js", "Gemini"],
    summary:
      "Web and Android app that saves links and categorises them automatically with an LLM.",
    link: "https://ai-link-sever.vercel.app/",
    code: "https://github.com/s-bhunia/AI-LinkMind",
  },
  {
    id: "MQCMaker",
    symbol: "📝",
    title: "MCQMaker",
    tagline: "LLM quiz generator",
    kind: "project",
    stack: ["React", "TypeScript", "Node.js", "Gemini"],
    summary:
      "Generates topic-focused multiple-choice question sets from any topic or pasted text.",
    link: "https://mcq-maker-hazel.vercel.app/",
  },
  {
    id: "insurance_premium_prediction_model",
    symbol: "📊",
    title: "Insurance Premium ML",
    tagline: "End-to-end ML system",
    kind: "project",
    stack: ["Scikit-learn", "Pandas", "FastAPI", "React"],
    summary:
      "Predicts insurance premiums from user details and serves predictions over a FastAPI backend.",
    link: "https://insurance-premium-prediction-model.vercel.app/",
    code: "https://github.com/s-bhunia/insurance_premium_prediction_model",
  },
  {
    id: "SupplyLink",
    symbol: "🚚",
    title: "SupplyLink",
    tagline: "Supply-chain platform",
    kind: "project",
    stack: ["React", "Django", "PostgreSQL"],
    summary:
      "Connects unregulated vendors with premium sellers and tracks supply-chain operations.",
    link: "https://supplylink.vercel.app/",
    code: "https://github.com/s-bhunia/supplylink",
  },
];

export const archive: Showcase[] = [
  {
    id: "BiteLO",
    symbol: "🍔",
    title: "BiteLO",
    tagline: "Food ordering",
    kind: "project",
    stack: ["React", "Node.js", "MongoDB"],
    summary: "Full-stack food ordering platform, my first deep dive into web development.",
    link: "https://bite-lo.vercel.app/",
  },
  {
    id: "converter-hub",
    symbol: "🧰",
    title: "Converter-Hub",
    tagline: "Batch file tools",
    kind: "project",
    stack: ["Python", "Pillow", "Tkinter"],
    summary: "Desktop toolkit for batch image resizing, file conversion and PDF editing.",
    code: "https://github.com/s-bhunia/converter-hub",
  },
];

export const skills: SkillGroup[] = [
  {
    id: "speech_ai",
    symbol: "🎧",
    title: "Speech AI",
    tagline: "STT · TTS · S2S",
    items: ["Speech-to-Text", "Text-to-Speech", "Speech-to-Speech pipelines", "Streaming inference"],
  },
  {
    id: "llms",
    symbol: "💬",
    title: "LLMs",
    tagline: "Train · Fine-tune",
    items: ["LLM training", "Fine-tuning", "Model serving", "Prompt & RAG design"],
  },
  {
    id: "deep_learning",
    symbol: "🔬",
    title: "Deep Learning",
    tagline: "Models & techniques",
    items: ["PyTorch", "Hugging Face", "TensorFlow", "Neural architectures"],
  },
  {
    id: "voice_infra",
    symbol: "📡",
    title: "Voice Agents",
    tagline: "LiveKit · Pipecat",
    items: ["LiveKit", "Pipecat", "WebRTC", "Latency optimisation"],
  },
  {
    id: "mlops",
    symbol: "🐳",
    title: "MLOps",
    tagline: "Docker · Redis · Celery",
    items: ["Docker", "Redis", "Celery", "Production deployment"],
  },
  {
    id: "observability",
    symbol: "📈",
    title: "Cloud & Monitoring",
    tagline: "GCP · Grafana",
    items: ["Google Cloud", "Grafana", "Metrics & alerting"],
  },
  {
    id: "backend",
    symbol: "🐍",
    title: "Python Backend",
    tagline: "FastAPI · SQL",
    items: ["Python", "FastAPI", "SQL / PostgreSQL", "Scikit-learn"],
  },
];

export const travel = {
  origin: { lat: 22.7656, lon: 88.3773, label: "Barrackpore" },
  destinations: [
    { lat: 30.7352, lon: 79.0669, label: "Kedarnath" },
    { lat: 26.7956, lon: 82.1943, label: "Ayodhya" },
    { lat: 27.0863, lon: 88.6615, label: "Lava" },
    { lat: 19.8135, lon: 85.8312, label: "Puri" },
    { lat: 24.6333, lon: 87.85, label: "Pakur" },
  ],
};

export const bootLines = [
  "initialising neural pathways",
  "loading speech models",
  "warming up the language model",
  "syncing memories",
  "mind online",
];
