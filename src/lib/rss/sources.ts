export interface RSSSource {
  name: string;
  feedUrl: string;
  url: string;
  category: string;
  authority: number;
}

export const defaultSources: RSSSource[] = [
  // AI Companies
  { name: "OpenAI", feedUrl: "https://openai.com/news/rss.xml", url: "https://openai.com/news", category: "ai", authority: 10 },
  { name: "Google AI", feedUrl: "https://blog.google/technology/ai/rss/", url: "https://blog.google/technology/ai/", category: "ai", authority: 9 },
  { name: "DeepMind", feedUrl: "https://deepmind.google/blog/rss.xml", url: "https://deepmind.google", category: "ai", authority: 9 },
  { name: "Hugging Face", feedUrl: "https://huggingface.co/blog/feed.xml", url: "https://huggingface.co/blog", category: "ai", authority: 8 },

  // Technology News
  { name: "TechCrunch", feedUrl: "https://techcrunch.com/feed/", url: "https://techcrunch.com", category: "technology", authority: 8 },
  { name: "The Verge", feedUrl: "https://www.theverge.com/rss/index.xml", url: "https://www.theverge.com", category: "technology", authority: 7 },
  { name: "VentureBeat", feedUrl: "https://venturebeat.com/feed/", url: "https://venturebeat.com", category: "technology", authority: 7 },
  { name: "Wired", feedUrl: "https://www.wired.com/feed/rss", url: "https://www.wired.com", category: "technology", authority: 8 },
  { name: "Ars Technica", feedUrl: "https://feeds.arstechnica.com/arstechnica/index", url: "https://arstechnica.com", category: "technology", authority: 8 },
  { name: "MIT Technology Review", feedUrl: "https://www.technologyreview.com/feed/", url: "https://www.technologyreview.com", category: "technology", authority: 9 },
  { name: "Hacker News", feedUrl: "https://hnrss.org/frontpage", url: "https://news.ycombinator.com", category: "technology", authority: 7 },
  { name: "CNET", feedUrl: "https://www.cnet.com/rss/news/", url: "https://www.cnet.com", category: "technology", authority: 6 },
  { name: "ZDNet", feedUrl: "https://www.zdnet.com/news/rss.xml", url: "https://www.zdnet.com", category: "technology", authority: 6 },
  { name: "Engadget", feedUrl: "https://www.engadget.com/rss.xml", url: "https://www.engadget.com", category: "technology", authority: 6 },

  // AI & ML News
  { name: "Import AI", feedUrl: "https://jack-clark.net/feed/", url: "https://jack-clark.net", category: "ai", authority: 7 },
  { name: "Unite AI", feedUrl: "https://www.unite.ai/feed/", url: "https://www.unite.ai", category: "ai", authority: 5 },
  { name: "MarkTechPost", feedUrl: "https://www.marktechpost.com/feed/", url: "https://www.marktechpost.com", category: "ai", authority: 5 },
  { name: "Last Week in AI", feedUrl: "https://lastweekin.ai/feed", url: "https://lastweekin.ai", category: "ai", authority: 6 },
  { name: "AI News", feedUrl: "https://www.artificialintelligence-news.com/rss", url: "https://www.artificialintelligence-news.com", category: "ai", authority: 5 },
  { name: "Analytics Vidhya", feedUrl: "https://www.analyticsvidhya.com/blog/feed", url: "https://www.analyticsvidhya.com", category: "ai", authority: 5 },
  { name: "Medium AI", feedUrl: "https://medium.com/feed/tag/artificial-intelligence", url: "https://medium.com/tag/artificial-intelligence", category: "ai", authority: 5 },
  { name: "Medium Deep Learning", feedUrl: "https://medium.com/feed/tag/deep-learning", url: "https://medium.com/tag/deep-learning", category: "ai", authority: 5 },
  { name: "VentureBeat AI", feedUrl: "https://venturebeat.com/category/ai/feed/", url: "https://venturebeat.com/category/ai/", category: "ai", authority: 7 },
  { name: "Ars Technica AI", feedUrl: "https://arstechnica.com/tag/ai/feed/", url: "https://arstechnica.com/tag/ai/", category: "ai", authority: 7 },
  { name: "Towards Data Science", feedUrl: "https://towardsdatascience.com/feed", url: "https://towardsdatascience.com", category: "ai", authority: 5 },
  { name: "Latent Space", feedUrl: "https://www.latent.space/feed", url: "https://www.latent.space", category: "ai", authority: 6 },
  { name: "Interconnects", feedUrl: "https://www.interconnects.ai/feed", url: "https://www.interconnects.ai", category: "ai", authority: 6 },

  // Research
  { name: "arXiv AI", feedUrl: "https://rss.arxiv.org/rss/cs.AI", url: "https://arxiv.org/list/cs.AI/recent", category: "research", authority: 9 },
  { name: "arXiv ML", feedUrl: "https://rss.arxiv.org/rss/cs.LG", url: "https://arxiv.org/list/cs.LG/recent", category: "research", authority: 9 },
  { name: "arXiv Robotics", feedUrl: "https://rss.arxiv.org/rss/cs.RO", url: "https://arxiv.org/list/cs.RO/recent", category: "research", authority: 8 },
  { name: "arXiv Computer Vision", feedUrl: "https://rss.arxiv.org/rss/cs.CV", url: "https://arxiv.org/list/cs.CV/recent", category: "research", authority: 8 },
  { name: "arXiv Computation", feedUrl: "https://rss.arxiv.org/rss/cs.CL", url: "https://arxiv.org/list/cs.CL/recent", category: "research", authority: 8 },
  { name: "arXiv Stats ML", feedUrl: "https://rss.arxiv.org/rss/stat.ML", url: "https://arxiv.org/list/stat.ML/recent", category: "research", authority: 8 },
  { name: "Nature AI", feedUrl: "https://www.nature.com/subjects/artificial-intelligence.rss", url: "https://www.nature.com/subjects/artificial-intelligence", category: "research", authority: 10 },
  { name: "Google Research", feedUrl: "https://blog.research.google/feeds/posts/default", url: "https://blog.research.google", category: "research", authority: 9 },
  { name: "Gwern", feedUrl: "https://gwern.net/index.xml", url: "https://gwern.net", category: "research", authority: 8 },
  { name: "LessWrong", feedUrl: "https://www.lesswrong.com/feed", url: "https://www.lesswrong.com", category: "research", authority: 7 },

  // Cybersecurity
  { name: "Krebs on Security", feedUrl: "https://krebsonsecurity.com/feed/", url: "https://krebsonsecurity.com", category: "security", authority: 9 },
  { name: "The Hacker News", feedUrl: "https://thehackernews.com/feeds/posts/default", url: "https://thehackernews.com", category: "security", authority: 7 },
  { name: "Schneier on Security", feedUrl: "https://www.schneier.com/feed/atom/", url: "https://www.schneier.com", category: "security", authority: 8 },
  { name: "Threatpost", feedUrl: "https://threatpost.com/feed", url: "https://threatpost.com", category: "security", authority: 6 },

  // Startups

  { name: "TechCrunch Startups", feedUrl: "https://techcrunch.com/category/startups/feed/", url: "https://techcrunch.com/category/startups/", category: "startups", authority: 7 },
  { name: "SaaStr", feedUrl: "https://www.saastr.com/feed/", url: "https://www.saastr.com", category: "startups", authority: 6 },

  // Space
  { name: "SpaceNews", feedUrl: "https://spacenews.com/feed/", url: "https://spacenews.com", category: "space", authority: 7 },
  { name: "Space.com", feedUrl: "https://www.space.com/feeds.xml", url: "https://www.space.com", category: "space", authority: 7 },
  { name: "NASA", feedUrl: "https://www.nasa.gov/news-release/feed/", url: "https://www.nasa.gov", category: "space", authority: 9 },
  { name: "ESA", feedUrl: "https://www.esa.int/rssfeed/ESA_Top_Stories", url: "https://www.esa.int", category: "space", authority: 8 },
  { name: "SpaceX", feedUrl: "https://www.spacex.com/feed.xml", url: "https://www.spacex.com", category: "space", authority: 8 },

  // Semiconductors
  { name: "NVIDIA Blog", feedUrl: "https://blogs.nvidia.com/feed/", url: "https://blogs.nvidia.com", category: "semiconductors", authority: 9 },
  { name: "Tom's Hardware", feedUrl: "https://www.tomshardware.com/feeds/all", url: "https://www.tomshardware.com", category: "semiconductors", authority: 6 },
  { name: "SemiAnalysis", feedUrl: "https://www.semianalysis.com/feed", url: "https://www.semianalysis.com", category: "semiconductors", authority: 8 },
  { name: "EE Times", feedUrl: "https://www.eetimes.com/feed", url: "https://www.eetimes.com", category: "semiconductors", authority: 7 },

  // Robotics
  { name: "IEEE Spectrum Robotics", feedUrl: "https://spectrum.ieee.org/feeds/robotics.rss", url: "https://spectrum.ieee.org/robotics", category: "robotics", authority: 8 },
  { name: "Robot Report", feedUrl: "https://www.therobotreport.com/feed/", url: "https://www.therobotreport.com", category: "robotics", authority: 6 },
  { name: "Robohub", feedUrl: "https://robohub.org/feed/", url: "https://robohub.org", category: "robotics", authority: 6 },
  { name: "Robotics 24/7", feedUrl: "https://www.robotics247.com/feed", url: "https://www.robotics247.com", category: "robotics", authority: 5 },

  // Cloud / Infrastructure
  { name: "AWS Blog", feedUrl: "https://aws.amazon.com/blogs/aws/feed/", url: "https://aws.amazon.com/blogs/aws/", category: "cloud", authority: 8 },
  { name: "Azure Blog", feedUrl: "https://azure.microsoft.com/blog/feed/", url: "https://azure.microsoft.com/blog", category: "cloud", authority: 7 },
  { name: "Google Cloud", feedUrl: "https://cloud.google.com/blog/feeds/ai-machine-learning", url: "https://cloud.google.com/blog/ai-machine-learning", category: "cloud", authority: 7 },
  { name: "Heroku Blog", feedUrl: "https://blog.heroku.com/feed", url: "https://blog.heroku.com", category: "cloud", authority: 5 },
  { name: "MongoDB Blog", feedUrl: "https://www.mongodb.com/blog/rss", url: "https://www.mongodb.com/blog", category: "cloud", authority: 6 },

  // Developer / Engineering Blogs
  { name: "GitHub Blog", feedUrl: "https://github.blog/feed", url: "https://github.blog", category: "cloud", authority: 8 },
  { name: "Google Developers", feedUrl: "https://developers.googleblog.com/feeds/posts/default", url: "https://developers.googleblog.com", category: "technology", authority: 7 },
  { name: "Stack Overflow Blog", feedUrl: "https://stackoverflow.blog/feed", url: "https://stackoverflow.blog", category: "technology", authority: 7 },
  { name: "Netflix Tech", feedUrl: "https://netflixtechblog.com/feed", url: "https://netflixtechblog.com", category: "technology", authority: 7 },
  { name: "Meta Engineering", feedUrl: "https://engineering.fb.com/feed", url: "https://engineering.fb.com", category: "technology", authority: 7 },
  { name: "Slack Engineering", feedUrl: "https://slack.engineering/feed", url: "https://slack.engineering", category: "technology", authority: 6 },
  { name: "Elastic Blog", feedUrl: "https://www.elastic.co/blog/feed", url: "https://www.elastic.co/blog", category: "cloud", authority: 5 },

  // Technology News
  { name: "The Register", feedUrl: "https://www.theregister.com/headlines.rss", url: "https://www.theregister.com", category: "technology", authority: 7 },
  { name: "SiliconAngle", feedUrl: "https://siliconangle.com/feed", url: "https://siliconangle.com", category: "technology", authority: 6 },
  { name: "Amazon AI", feedUrl: "https://www.aboutamazon.com/news/tag/artificial-intelligence/rss", url: "https://www.aboutamazon.com/news/tag/artificial-intelligence", category: "ai", authority: 7 },
  { name: "O'Reilly Radar", feedUrl: "https://feeds.feedburner.com/oreilly/radar/atom", url: "https://www.oreilly.com/radar", category: "technology", authority: 7 },
  { name: "Search Engine Journal", feedUrl: "https://www.searchenginejournal.com/feed", url: "https://www.searchenginejournal.com", category: "technology", authority: 5 },

  // Tech Strategy / Analysis
  { name: "Stratechery", feedUrl: "https://stratechery.com/feed", url: "https://stratechery.com", category: "technology", authority: 9 },
  { name: "Astral Codex Ten", feedUrl: "https://www.astralcodexten.com/feed", url: "https://www.astralcodexten.com", category: "research", authority: 7 },

  // Business / Finance
  { name: "Bloomberg Tech", feedUrl: "https://feeds.bloomberg.com/markets/news.rss", url: "https://www.bloomberg.com/technology", category: "technology", authority: 8 },


  // Twitter / X via Nitter
  { name: "Sam Altman", feedUrl: "https://nitter.net/sama/rss", url: "https://x.com/sama", category: "ai", authority: 9 },
  { name: "Yann LeCun", feedUrl: "https://nitter.net/ylecun/rss", url: "https://x.com/ylecun", category: "ai", authority: 9 },
  { name: "Andrew Ng", feedUrl: "https://nitter.net/AndrewYNg/rss", url: "https://x.com/AndrewYNg", category: "ai", authority: 9 },
  { name: "Kareem Carr", feedUrl: "https://nitter.net/kareem_carr/rss", url: "https://x.com/kareem_carr", category: "ai", authority: 7 },
  { name: "Elon Musk", feedUrl: "https://nitter.net/elonmusk/rss", url: "https://x.com/elonmusk", category: "technology", authority: 8 },
  { name: "Demis Hassabis", feedUrl: "https://nitter.net/demishassabis/rss", url: "https://x.com/demishassabis", category: "ai", authority: 8 },
  { name: "Mira Murati", feedUrl: "https://nitter.net/miramurati/rss", url: "https://x.com/miramurati", category: "ai", authority: 9 },
  { name: "GitHub", feedUrl: "https://nitter.net/github/rss", url: "https://x.com/github", category: "cloud", authority: 7 },
  { name: "OpenAI @X", feedUrl: "https://nitter.net/OpenAI/rss", url: "https://x.com/OpenAI", category: "ai", authority: 10 },
  { name: "Anthropic @X", feedUrl: "https://nitter.net/AnthropicAI/rss", url: "https://x.com/AnthropicAI", category: "ai", authority: 9 },
  { name: "Google DeepMind", feedUrl: "https://nitter.net/GoogleDeepMind/rss", url: "https://x.com/GoogleDeepMind", category: "ai", authority: 8 },
  { name: "Andrej Karpathy", feedUrl: "https://nitter.net/karpathy/rss", url: "https://x.com/karpathy", category: "ai", authority: 9 },
  { name: "Jim Fan", feedUrl: "https://nitter.net/drjimfan/rss", url: "https://x.com/drjimfan", category: "ai", authority: 7 },
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
