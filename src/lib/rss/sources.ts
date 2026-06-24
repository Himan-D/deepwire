export interface RSSSource {
  name: string;
  feedUrl: string;
  url: string;
  category: string;
  authority: number;
}

export const defaultSources: RSSSource[] = [
  // AI
  { name: "OpenAI", feedUrl: "https://openai.com/news/rss.xml", url: "https://openai.com/news", category: "ai", authority: 10 },
  { name: "Hugging Face", feedUrl: "https://huggingface.co/blog/feed.xml", url: "https://huggingface.co/blog", category: "ai", authority: 8 },

  // Technology
  { name: "TechCrunch", feedUrl: "https://techcrunch.com/feed/", url: "https://techcrunch.com", category: "technology", authority: 8 },
  { name: "The Verge", feedUrl: "https://www.theverge.com/rss/index.xml", url: "https://www.theverge.com", category: "technology", authority: 7 },
  { name: "VentureBeat", feedUrl: "https://venturebeat.com/feed", url: "https://venturebeat.com", category: "technology", authority: 7 },
  { name: "Wired", feedUrl: "https://www.wired.com/feed/rss", url: "https://www.wired.com", category: "technology", authority: 8 },
  { name: "Ars Technica", feedUrl: "https://feeds.arstechnica.com/arstechnica/index", url: "https://arstechnica.com", category: "technology", authority: 8 },
  { name: "MIT Technology Review", feedUrl: "https://www.technologyreview.com/feed/", url: "https://www.technologyreview.com", category: "technology", authority: 9 },
  { name: "Hacker News", feedUrl: "https://hnrss.org/frontpage", url: "https://news.ycombinator.com", category: "technology", authority: 7 },

  // Research
  { name: "arXiv AI", feedUrl: "https://rss.arxiv.org/rss/cs.AI", url: "https://arxiv.org/list/cs.AI/recent", category: "research", authority: 9 },
  { name: "arXiv ML", feedUrl: "https://rss.arxiv.org/rss/cs.LG", url: "https://arxiv.org/list/cs.LG/recent", category: "research", authority: 9 },
  { name: "Science Magazine", feedUrl: "https://www.science.org/action/showFeed?type=etoc&feed=rss", url: "https://www.science.org", category: "research", authority: 10 },

  // Cybersecurity
  { name: "Krebs on Security", feedUrl: "https://krebsonsecurity.com/feed/", url: "https://krebsonsecurity.com", category: "security", authority: 9 },
  { name: "The Hacker News", feedUrl: "https://thehackernews.com/feeds/posts/default", url: "https://thehackernews.com", category: "security", authority: 7 },

  // Startups
  { name: "Product Hunt", feedUrl: "https://www.producthunt.com/feed", url: "https://www.producthunt.com", category: "startups", authority: 6 },

  // Space
  { name: "SpaceNews", feedUrl: "https://spacenews.com/feed/", url: "https://spacenews.com", category: "space", authority: 7 },
  { name: "Space.com", feedUrl: "https://www.space.com/feeds.xml", url: "https://www.space.com", category: "space", authority: 7 },
  { name: "NASA", feedUrl: "https://www.nasa.gov/news-release/feed/", url: "https://www.nasa.gov", category: "space", authority: 9 },

  // Semiconductors
  { name: "NVIDIA Blog", feedUrl: "https://blogs.nvidia.com/feed/", url: "https://blogs.nvidia.com", category: "semiconductors", authority: 9 },
];

export const categoryMapping: Record<string, string> = {
  "ai": "ai",
  "agents": "agents",
  "llm": "llms",
  "research": "research",
  "security": "security",
  "cybersecurity": "security",
  "startup": "startups",
  "startups": "startups",
  "space": "space",
  "semiconductor": "semiconductors",
  "semiconductors": "semiconductors",
  "chip": "semiconductors",
  "robot": "robotics",
  "robotics": "robotics",
  "cloud": "cloud",
  "quantum": "quantum",
};
