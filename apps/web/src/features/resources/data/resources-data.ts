import type { ResourceCategory, ResourceNote } from "../types/resource.types";

export const ROOT_DRIVE_FOLDER_ID = "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP";
export const ROOT_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${ROOT_DRIVE_FOLDER_ID}`;

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: "programming-data",
    label: "Programming & Data Science",
    description: "Core programming, data structures, relational databases, git workflows & data science fundamentals.",
    iconName: "Code2",
    folderName: "Programming & Data Science",
    colorScheme: {
      bg: "bg-blue-500/10 text-blue-500",
      text: "text-blue-500",
      border: "border-blue-500/30",
      badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    },
  },
  {
    id: "ai-ml",
    label: "AI & Machine Learning Foundations",
    description: "Artificial intelligence principles, deep neural networks, mathematical loss functions & NLP basics.",
    iconName: "Cpu",
    folderName: "AI & Machine Learning",
    colorScheme: {
      bg: "bg-emerald-500/10 text-emerald-500",
      text: "text-emerald-500",
      border: "border-emerald-500/30",
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    },
  },
  {
    id: "genai",
    label: "Generative AI & LLMs",
    description: "Large Language Models, LangChain orchestration, RAG pipelines, Vector Databases & MCP protocols.",
    iconName: "Sparkles",
    folderName: "Generative AI",
    colorScheme: {
      bg: "bg-purple-500/10 text-purple-500",
      text: "text-purple-500",
      border: "border-purple-500/30",
      badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    },
  },
  {
    id: "agents",
    label: "AI Agents & Agentic Workflows",
    description: "Autonomous agent architectures, ReAct reasoning patterns, tool execution & multi-agent systems.",
    iconName: "Zap",
    folderName: "AI Agents",
    colorScheme: {
      bg: "bg-amber-500/10 text-amber-500",
      text: "text-amber-500",
      border: "border-amber-500/30",
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    },
  },
  {
    id: "system-design",
    label: "System Design & Architecture",
    description: "High-level distributed system design, caching layers, microservices, throughput & latency scaling.",
    iconName: "Server",
    folderName: "System Design",
    colorScheme: {
      bg: "bg-rose-500/10 text-rose-500",
      text: "text-rose-500",
      border: "border-rose-500/30",
      badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    },
  },
  {
    id: "interview",
    label: "Interview Preparation & Practice",
    description: "Agentic AI engineer interview questions, system design walkthroughs & technical hiring cheat sheets.",
    iconName: "GraduationCap",
    folderName: "Interview Preparation",
    colorScheme: {
      bg: "bg-indigo-500/10 text-indigo-500",
      text: "text-indigo-500",
      border: "border-indigo-500/30",
      badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    },
  },
];

export const TECHNICAL_NOTES: ResourceNote[] = [
  // 1. Programming & Data Science
  {
    id: "python-basics",
    title: "Python Programming Fundamentals",
    categoryId: "programming-data",
    driveFileId: "17prW-gXyoWNOYalSvzE1EmvWBFztRPMp",
    driveUrl: "https://drive.google.com/file/d/17prW-gXyoWNOYalSvzE1EmvWBFztRPMp/view?usp=drive_link",
    description: "Core syntax, data types, control flow, functions, OOP concepts, generators, and Pythonic best practices.",
    tags: ["Python", "Syntax", "OOP", "Basics"],
    isHandwritten: true,
  },
  {
    id: "dsa",
    title: "Data Structures & Algorithms (DSA)",
    categoryId: "programming-data",
    driveFileId: "1PjI3ca_fj4ONiH80EpHMLjLc7QKvbsSu",
    driveUrl: "https://drive.google.com/file/d/1PjI3ca_fj4ONiH80EpHMLjLc7QKvbsSu/view?usp=drive_link",
    description: "Arrays, linked lists, trees, graphs, sorting, two pointers, sliding window, and dynamic programming.",
    tags: ["DSA", "Algorithms", "Data Structures", "Coding"],
    isHandwritten: true,
  },
  {
    id: "data-science",
    title: "Data Science & Analytics Foundations",
    categoryId: "programming-data",
    driveFileId: "1ulWAIFwz5LrRuoTrM9IbFOVJ_vNKBFmE",
    driveUrl: "https://drive.google.com/file/d/1ulWAIFwz5LrRuoTrM9IbFOVJ_vNKBFmE/view?usp=drive_link",
    description: "Exploratory data analysis, statistical methods, hypothesis testing, NumPy, and Pandas manipulation.",
    tags: ["Data Science", "Pandas", "NumPy", "Statistics"],
    isHandwritten: true,
  },
  {
    id: "mysql",
    title: "MySQL & Relational Database Design",
    categoryId: "programming-data",
    driveFileId: "1yiQrK9_QsDhu7mEEu12DIm4sN2tR0sn9",
    driveUrl: "https://drive.google.com/file/d/1yiQrK9_QsDhu7mEEu12DIm4sN2tR0sn9/view?usp=drive_link",
    description: "SQL queries, relational schema design, primary/foreign keys, joins, indexing, and normalization rules.",
    tags: ["SQL", "MySQL", "Databases", "Schema"],
    isHandwritten: true,
  },
  {
    id: "git",
    title: "Git & Version Control Essentials",
    categoryId: "programming-data",
    driveFileId: "1US23299hWzm8zFrkiIctV_detLx6ZZVE",
    driveUrl: "https://drive.google.com/file/d/1US23299hWzm8zFrkiIctV_detLx6ZZVE/view?usp=drive_link",
    description: "Commit graphs, branching workflows, merging, rebasing, stash, conflict resolution, and remote collaboration.",
    tags: ["Git", "GitHub", "Version Control", "CLI"],
    isHandwritten: true,
  },

  // 2. AI & Machine Learning Foundations
  {
    id: "artificial-intelligence",
    title: "Artificial Intelligence (AI) Principles",
    categoryId: "ai-ml",
    driveFileId: "18ntVX9nM8Xo1YTYK_lqjPDVMSS2v8rJj",
    driveUrl: "https://drive.google.com/file/d/18ntVX9nM8Xo1YTYK_lqjPDVMSS2v8rJj/view?usp=drive_link",
    description: "Heuristic search, state spaces, constraint satisfaction, decision theory, and foundation AI paradigms.",
    tags: ["AI", "Heuristics", "Search", "Foundations"],
    isHandwritten: true,
  },
  {
    id: "deep-learning",
    title: "Deep Learning & Neural Networks",
    categoryId: "ai-ml",
    driveFileId: "1DvqoGaGLxz_kfrIJ4iPyWWYaSZnnCnEv",
    driveUrl: "https://drive.google.com/file/d/1DvqoGaGLxz_kfrIJ4iPyWWYaSZnnCnEv/view?usp=drive_link",
    description: "Perceptrons, multi-layer networks, backpropagation calculus, activation functions, loss curves, and optimization.",
    tags: ["Deep Learning", "Neural Networks", "Backprop", "PyTorch"],
    isHandwritten: true,
  },
  {
    id: "generative-ai-foundations",
    title: "Foundations of Generative AI",
    categoryId: "ai-ml",
    driveFileId: "15jOyIdZTarKHJUQPXpB2g5U_0MXIuKOe",
    driveUrl: "https://drive.google.com/file/d/15jOyIdZTarKHJUQPXpB2g5U_0MXIuKOe/view?usp=drive_link",
    description: "Generative modeling principles, latent spaces, autoencoders, GANs, and generative representations.",
    tags: ["GenAI", "Latent Space", "Generative Models"],
    isHandwritten: true,
  },
  {
    id: "nlp",
    title: "Natural Language Processing (NLP)",
    categoryId: "ai-ml",
    driveFileId: "1yuYUnDH9fvt_9cctnR7rvfX98ltNNuJW",
    driveUrl: "https://drive.google.com/file/d/1yuYUnDH9fvt_9cctnR7rvfX98ltNNuJW/view?usp=drive_link",
    description: "Tokenization, text preprocessing, Bag-of-Words, TF-IDF, Word2Vec embeddings, and language modeling.",
    tags: ["NLP", "Tokenization", "Embeddings", "Text"],
    isHandwritten: true,
  },
  {
    id: "transformers",
    title: "Transformer Architecture & Self-Attention",
    categoryId: "ai-ml",
    driveFileId: "12kRa064jYKx8tLSo_XH2zU_WaXNLgrDL",
    driveUrl: "https://drive.google.com/file/d/12kRa064jYKx8tLSo_XH2zU_WaXNLgrDL/view?usp=drive_link",
    description: "Scaled Dot-Product Attention, Multi-Head Attention, query-key-value vectors, positional encodings, and layers.",
    tags: ["Transformers", "Attention", "Encoders", "Decoders"],
    isHandwritten: true,
  },

  // 3. Generative AI & LLMs
  {
    id: "llms",
    title: "Large Language Models (LLMs) Core Concepts",
    categoryId: "genai",
    driveFileId: "1yjRSWKotvy_BnIIYRU7AE0jPBvBm2OTo",
    driveUrl: "https://drive.google.com/file/d/1yjRSWKotvy_BnIIYRU7AE0jPBvBm2OTo/view?usp=drive_link",
    description: "Pre-training objectives, autoregressive generation, temperature/top-p decoding, fine-tuning, and alignment.",
    tags: ["LLMs", "Pretraining", "Decoding", "Fine-Tuning"],
    isHandwritten: true,
  },
  {
    id: "langchain",
    title: "LangChain Framework & Orchestration",
    categoryId: "genai",
    driveFileId: "1j4joKfLMBIyJ4PHde_AUKY-Eo_SevLOy",
    driveUrl: "https://drive.google.com/file/d/1j4joKfLMBIyJ4PHde_AUKY-Eo_SevLOy/view?usp=drive_link",
    description: "Prompt templates, LLM chains, output parsers, memory components, agents, and external tool bindings.",
    tags: ["LangChain", "Chains", "Prompting", "Framework"],
    isHandwritten: true,
  },
  {
    id: "rag",
    title: "Retrieval-Augmented Generation (RAG) Architecture",
    categoryId: "genai",
    driveFileId: "1-unuj3xPYcAdlDg4MYDJ350LDwV2NJGZ",
    driveUrl: "https://drive.google.com/file/d/1-unuj3xPYcAdlDg4MYDJ350LDwV2NJGZ/view?usp=drive_link",
    description: "Document ingestion, chunking strategies, semantic retrieval, context window management, and reranking.",
    tags: ["RAG", "Chunking", "Retrieval", "Context"],
    isHandwritten: true,
  },
  {
    id: "rag-vector-db",
    title: "RAG & Vector Database Engineering",
    categoryId: "genai",
    driveFileId: "1OGXetXga6i-PvdR0TIefrKFWbP4iVPfN",
    driveUrl: "https://drive.google.com/file/d/1OGXetXga6i-PvdR0TIefrKFWbP4iVPfN/view?usp=drive_link",
    description: "Vector embeddings, cosine similarity, HNSW indexing, inverted indexes, hybrid search, and vector stores.",
    tags: ["Vector DB", "Embeddings", "HNSW", "Search"],
    isHandwritten: true,
  },
  {
    id: "mcp",
    title: "Model Context Protocol (MCP)",
    categoryId: "genai",
    driveFileId: "1m1vAj6KwKP4-iE5al-gt_0hxr3Z06Noe",
    driveUrl: "https://drive.google.com/file/d/1m1vAj6KwKP4-iE5al-gt_0hxr3Z06Noe/view?usp=drive_link",
    description: "Anthropic Model Context Protocol specification: server-client tools, resource exposure, and dynamic context.",
    tags: ["MCP", "Context Protocol", "Tools", "Integration"],
    isHandwritten: true,
  },
  {
    id: "ml-foundations-genai",
    title: "Machine Learning Foundations for GenAI",
    categoryId: "genai",
    driveFileId: "1M8WDPsaaJc2nfEvUkEKYgGCmPMUXyN0i",
    driveUrl: "https://drive.google.com/file/d/1M8WDPsaaJc2nfEvUkEKYgGCmPMUXyN0i/view?usp=drive_link",
    description: "Core ML concepts underpinning generative models: probability distributions, loss formulations, and gradient updates.",
    tags: ["ML", "Probability", "Distributions", "Foundations"],
    isHandwritten: true,
  },

  // 4. AI Agents & Agentic Workflows
  {
    id: "ai-agents",
    title: "Autonomous AI Agents & Agentic Workflows",
    categoryId: "agents",
    driveFileId: "1F__VmYpFohiCCNqRpgdjg7PmnWGn6Hyb",
    driveUrl: "https://drive.google.com/file/d/1F__VmYpFohiCCNqRpgdjg7PmnWGn6Hyb/view?usp=drive_link",
    description: "ReAct reasoning loops, autonomous planning, scratchpad memories, tool selection, reflection, and multi-agent coordination.",
    tags: ["AI Agents", "ReAct", "Planning", "Tool Calling"],
    isHandwritten: true,
  },

  // 5. System Design & Architecture
  {
    id: "system-design",
    title: "High-Level System Design & Scalability",
    categoryId: "system-design",
    driveFileId: "1hnCJA1sbqzpKZmg2BGNAX6Pq3u_nOPgm",
    driveUrl: "https://drive.google.com/file/d/1hnCJA1sbqzpKZmg2BGNAX6Pq3u_nOPgm/view?usp=drive_link",
    description: "Distributed architectures, microservices, load balancers, caching (Redis), CDNs, database sharding, and fault tolerance.",
    tags: ["System Design", "Scalability", "Microservices", "Caching"],
    isHandwritten: true,
  },

  // 6. Interview Preparation & Practice
  {
    id: "agentic-ai-interview-p1",
    title: "Agentic AI Engineer Interview Guide (Part 1)",
    categoryId: "interview",
    driveFileId: "1M1lUQibvrll_f2rA9XGgUDP0EvlRNxHn",
    driveUrl: "https://drive.google.com/file/d/1M1lUQibvrll_f2rA9XGgUDP0EvlRNxHn/view?usp=drive_link",
    description: "Core technical questions, agent loop implementation rounds, tool calling contracts, and prompt evaluation challenges.",
    tags: ["Interview", "Agentic AI", "Coding Rounds", "Hiring"],
    isHandwritten: true,
  },
  {
    id: "agentic-ai-interview-p2",
    title: "Agentic AI Engineer Interview Guide (Part 2)",
    categoryId: "interview",
    driveFileId: "1lNIcVsDmR4BHp1GnAqNX5faf3VKHhDeb",
    driveUrl: "https://drive.google.com/file/d/1lNIcVsDmR4BHp1GnAqNX5faf3VKHhDeb/view?usp=drive_link",
    description: "Architectural system design interviews, handling agent hallucination/loops, latency optimization, and case studies.",
    tags: ["Interview", "System Design", "Evaluation", "Case Studies"],
    isHandwritten: true,
  },
];

export const DEFAULT_TECHNICAL_NOTES = TECHNICAL_NOTES;

export function extractDriveInfo(input: string): {
  id: string;
  isFolder: boolean;
  embedUrl: string;
  previewUrl: string;
  directUrl: string;
} {
  const trimmed = input.trim();
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) {
    const id = folderMatch[1];
    return {
      id,
      isFolder: true,
      embedUrl: `https://drive.google.com/embeddedfolderview?id=${id}#list`,
      previewUrl: `https://drive.google.com/drive/folders/${id}`,
      directUrl: `https://drive.google.com/drive/folders/${id}`,
    };
  }

  let id = trimmed;
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    id = fileMatch[1];
  } else {
    const paramMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (paramMatch) {
      id = paramMatch[1];
    }
  }

  id = id.split("/")[0].split("?")[0];
  return {
    id,
    isFolder: false,
    embedUrl: `https://drive.google.com/file/d/${id}/preview`,
    previewUrl: `https://drive.google.com/file/d/${id}/view`,
    directUrl: `https://drive.google.com/file/d/${id}/view`,
  };
}
