export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  ai: [
    "artificial intelligence", "machine learning", "deep learning", "neural network",
    "gpt", "llm", "openai", "anthropic", "claude", "chatgpt", "gemini", "transformer",
    "ai model", "ai system", "ai tool", "ai assistant", "ai agent", "language model",
    "foundation model", "diffusion model", "generative ai", "computer vision",
    "natural language processing", "nlp", "multimodal", "large language",
    "parameter model", "fine-tuning", "fine tuning", "pretrained", "reasoning",
    "mistral ai", "hugging face", "cohere", "llama", "deepseek",
  ],
  agents: [
    "ai agent", "autonomous agent", "agentic", "tool use", "function calling",
    "multi-agent", "agent framework", "agent platform", "orchestration agent",
    "ai teammate", "ai coworker", "ai employee", "digital agent", "software agent",
  ],
  llms: [
    "large language model", "llm", "foundation model", "language model",
    "gpt-4", "gpt-5", "claude 3", "claude 4", "llama 3", "llama 4", "mistral",
    "gemini", "gemma", "phi-", "olmo", "dbrx",
  ],
  robotics: [
    "robot", "robotics", "humanoid", "autonomous vehicle", "self-driving",
    "drone", "boston dynamics", "tesla bot", "optimus", "figure ai",
    "robotic", "automation robot", "factory robot", "robotaxi",
    "autonomous driving", "lidar",
  ],
  startups: [
    "startup", "funding", "series a", "series b", "series c", "series d",
    "venture capital", "vc ", "y combinator", "yc ", "seed round", "raise",
    "ipo", "valuation", "unicorn", "pre-seed", "seed funding",
    "venture-backed", "stealth startup", "emerging from stealth",
    "million", "billion", "fundraise", "raised",
  ],
  research: [
    "research", "paper", "arxiv", "study", "breakthrough", "scientists find",
    "researchers develop", "researchers create", "research team",
    "new study", "new research", "published in", "journal",
    "scientific", "laboratory", "lab", "experiment", "discovery",
  ],
  security: [
    "cybersecurity", "security", "hack", "breach", "ransomware",
    "vulnerability", "exploit", "malware", "phishing", "zero-day", "cve",
    "data leak", "data breach", "cyberattack", "cyber attack",
    "threat actor", "hacker", "cyber", "social engineering",
    "encryption", "authentication", "password", "backdoor",
  ],
  cloud: [
    "cloud", "aws", "azure", "gcp", "kubernetes", "k8s", "docker",
    "serverless", "infrastructure", "cloud computing", "cloud native",
    "devops", "sre", "platform engineering", "container",
    "microservice", "api gateway", "terraform",
  ],
  semiconductors: [
    "chip", "semiconductor", "processor", "gpu", "tpu", "nvidia",
    "amd", "intel", "tsmc", "transistor", "wafer", "foundry",
    "cpu", "architecture", "2nm", "3nm", "5nm", "7nm", "nanometer",
    "ai accelerator", "data center chip", "arm ", "risc-v",
  ],
  space: [
    "space", "nasa", "esa", "spacex", "starship", "rocket", "satellite",
    "launch", "orbit", "mars", "lunar", "astronaut", "spacecraft",
    "space station", "moon", "venus", "jupiter", "telescope",
    "space flight", "space exploration", "deep space",
  ],
  quantum: [
    "quantum", "qubit", "quantum computing", "quantum supremacy",
    "quantum error", "quantum processor", "quantum computer",
  ],
};

export const SOURCE_CATEGORY_HINTS: Record<string, string[]> = {
  "arXiv": ["research"],
  "arXiv AI": ["research"],
  "arXiv ML": ["research"],
  "Science Magazine": ["research"],
  "Krebs on Security": ["security"],
  "The Hacker News": ["security"],
  "Product Hunt": ["startups"],
  "SpaceNews": ["space"],
  "Space.com": ["space"],
  "NASA": ["space"],
  "NVIDIA Blog": ["semiconductors", "ai"],
  "TechCrunch": ["technology"],
  "Wired": ["technology"],
  "The Verge": ["technology"],
};

function extractKeywords(title: string, content: string): string {
  const text = `${title} ${content}`.toLowerCase();
  return text;
}

export function classifyArticle(title: string, content: string): string[] {
  const text = extractKeywords(title, content);
  const matched: string[] = [];

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      matched.push(category);
    }
  }

  return [...new Set(matched)];
}

export function getPrimaryCategory(
  title: string,
  content: string,
  source: string
): string {
  const keywords = classifyArticle(title, content);
  const sourceHint = SOURCE_CATEGORY_HINTS[source];

  if (keywords.length === 0 && sourceHint) {
    return sourceHint[0];
  }

  if (keywords.includes("research") && keywords.includes("ai")) {
    return "research";
  }

  if (keywords.includes("security")) return "security";
  if (keywords.includes("semiconductors")) return "semiconductors";
  if (keywords.includes("space")) return "space";
  if (keywords.includes("robotics")) return "robotics";
  if (keywords.includes("quantum")) return "research";
  if (keywords.includes("startups") && !keywords.includes("ai")) return "startups";
  if (keywords.includes("agents")) return "agents";
  if (keywords.includes("llms")) return "llms";
  if (keywords.includes("cloud")) return "cloud";
  if (keywords.includes("ai")) return "ai";

  if (sourceHint) return sourceHint[0];

  return "ai";
}

export const categoryMapping: Record<string, string> = {
  technology: "ai",
  ai: "ai",
  agents: "agents",
  llms: "llms",
  robotics: "robotics",
  startups: "startups",
  research: "research",
  security: "security",
  cloud: "cloud",
  semiconductors: "semiconductors",
  space: "space",
  quantum: "quantum",
};
