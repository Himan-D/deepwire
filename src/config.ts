export const siteConfig = {
  name: "DeepWire",
  description: "AI & DeepTech News Intelligence Platform",
  url: process.env.SITE_URL || "https://deepwire.ai",
  author: "DeepWire",
  twitter: "@deepwire",
};

export const categories = [
  { id: "ai", label: "AI", icon: "🤖" },
  { id: "agents", label: "Agents", icon: "⚡" },
  { id: "llms", label: "LLMs", icon: "🧠" },
  { id: "robotics", label: "Robotics", icon: "🦾" },
  { id: "startups", label: "Startups", icon: "🚀" },
  { id: "research", label: "Research", icon: "🔬" },
  { id: "security", label: "Security", icon: "🛡️" },
  { id: "cloud", label: "Cloud", icon: "☁️" },
  { id: "semiconductors", label: "Semiconductors", icon: "💻" },
  { id: "space", label: "Space", icon: "🛸" },
  { id: "quantum", label: "Quantum", icon: "⚛️" },
];

export const navigation = [
  { title: "Trending", url: "/trending" },
  { title: "AI", url: "/ai" },
  { title: "Research", url: "/research" },
  { title: "Startups", url: "/startups" },
  { title: "Security", url: "/security" },
  { title: "Space", url: "/space" },
  { title: "Semiconductors", url: "/semiconductors" },
  { title: "Robotics", url: "/robotics" },
  { title: "Graph", url: "/knowledge-graph" },
];
