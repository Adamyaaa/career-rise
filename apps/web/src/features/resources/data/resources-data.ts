import type { ResourceCategory, ResourceNote, ResourceCategoryId } from "../types/resource.types";

export const ROOT_DRIVE_FOLDER_ID = "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP";
export const ROOT_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${ROOT_DRIVE_FOLDER_ID}`;

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: "01-programming",
    numberPrefix: "01",
    label: "Programming & Core CS",
    folderName: "01-Programming-and-DSA",
    description: "Data Structures, Algorithms, Python internals, OOP & CS Fundamentals for coding rounds.",
    colorScheme: {
      bg: "bg-blue-500/10 text-blue-500",
      text: "text-blue-500",
      border: "border-blue-500/30",
      badge: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    },
  },
  {
    id: "02-ai-ml",
    numberPrefix: "02",
    label: "AI & Machine Learning",
    folderName: "02-AI-and-Machine-Learning",
    description: "Core ML algorithms, loss functions, optimization, gradient descent & statistical foundations.",
    colorScheme: {
      bg: "bg-emerald-500/10 text-emerald-500",
      text: "text-emerald-500",
      border: "border-emerald-500/30",
      badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    },
  },
  {
    id: "03-genai",
    numberPrefix: "03",
    label: "Generative AI",
    folderName: "03-Generative-AI",
    description: "Transformers, Self-Attention, Tokenization, LLMs, LoRA fine-tuning, embeddings & RAG architecture.",
    colorScheme: {
      bg: "bg-purple-500/10 text-purple-500",
      text: "text-purple-500",
      border: "border-purple-500/30",
      badge: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    },
  },
  {
    id: "04-agents",
    numberPrefix: "04",
    label: "AI Agents & Workflows",
    folderName: "04-AI-Agents-and-Workflows",
    description: "ReAct patterns, planning, tool usage, multi-agent orchestrations, memory systems & MCP protocols.",
    colorScheme: {
      bg: "bg-amber-500/10 text-amber-500",
      text: "text-amber-500",
      border: "border-amber-500/30",
      badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    },
  },
  {
    id: "05-system-design",
    numberPrefix: "05",
    label: "AI System Design",
    folderName: "05-AI-System-Design",
    description: "vLLM, KV caching, model serving, vector DB indexing, latency vs throughput trade-offs & scale.",
    colorScheme: {
      bg: "bg-rose-500/10 text-rose-500",
      text: "text-rose-500",
      border: "border-rose-500/30",
      badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    },
  },
  {
    id: "06-interview",
    numberPrefix: "06",
    label: "Interview Prep & Cheatsheets",
    folderName: "06-Interview-Preparation",
    description: "High-yield interview question frameworks, formula sheets, trade-off comparisons & interview blueprints.",
    colorScheme: {
      bg: "bg-indigo-500/10 text-indigo-500",
      text: "text-indigo-500",
      border: "border-indigo-500/30",
      badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
    },
  },
];

// Initial starter catalog of notes mapping to your Google Drive folders.
// You can replace these with your actual Drive File IDs or add custom notes through the UI.
export const DEFAULT_TECHNICAL_NOTES: ResourceNote[] = [
  {
    id: "prog-core-dsa",
    title: "Data Structures & Algorithmic Patterns Cheat Sheet",
    categoryId: "01-programming",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "Handwritten diagrams of sliding window, two pointers, graphs, dynamic programming tables, and complexity matrix.",
    tags: ["DSA", "Pointers", "Complexity", "Algorithms"],
    isHandwritten: true,
    pageCount: "12 pages",
    relevance: "core_fundamentals",
  },
  {
    id: "prog-python-internals",
    title: "Python Internals & Concurrency Essentials",
    categoryId: "01-programming",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "Deep dive into GIL, memory management, garbage collection, async/await event loop, and generators.",
    tags: ["Python", "Concurrency", "GIL", "Memory"],
    isHandwritten: true,
    pageCount: "8 pages",
    relevance: "cohort_and_interviews",
  },
  {
    id: "ai-math-optimization",
    title: "Machine Learning Math & Optimization Blueprints",
    categoryId: "02-ai-ml",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "Handwritten step-by-step calculus, matrix derivatives, cross-entropy loss, Adam optimizer, and backpropagation derivations.",
    tags: ["Backprop", "Calculus", "Loss Functions", "Optimizers"],
    isHandwritten: true,
    pageCount: "15 pages",
    relevance: "cohort_and_interviews",
  },
  {
    id: "genai-transformer-arch",
    title: "Transformer Architecture & Attention Mechanisms",
    categoryId: "03-genai",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "Visual breakdown of Scaled Dot-Product Attention, Multi-Head Attention, RoPE positional encoding, and encoder-decoder stacks.",
    tags: ["Transformers", "Attention", "LLMs", "RoPE"],
    isHandwritten: true,
    pageCount: "18 pages",
    relevance: "cohort_and_interviews",
  },
  {
    id: "genai-rag-blueprints",
    title: "Production RAG Architecture & Vector Indexing",
    categoryId: "03-genai",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "Handwritten architecture diagrams: Chunking strategies, hybrid search (dense + sparse), reranking, and hallucination reduction.",
    tags: ["RAG", "Vector Search", "Chunking", "Embeddings"],
    isHandwritten: true,
    pageCount: "10 pages",
    relevance: "cohort_and_interviews",
  },
  {
    id: "agent-react-framework",
    title: "AI Agent Design Patterns & Memory Architectures",
    categoryId: "04-agents",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "Step-by-step illustrations of ReAct loop, tool-calling contracts, scratchpad memory, and multi-agent consensus protocols.",
    tags: ["Agents", "ReAct", "Tool Use", "Workflows"],
    isHandwritten: true,
    pageCount: "14 pages",
    relevance: "cohort_and_interviews",
  },
  {
    id: "system-design-inference-serving",
    title: "High-Throughput LLM Serving & KV Cache Optimization",
    categoryId: "05-system-design",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "Calculations and memory breakdowns for PagedAttention (vLLM), continuous batching, tensor parallelism, and TTFT vs ITL metrics.",
    tags: ["System Design", "vLLM", "KV Cache", "Latency"],
    isHandwritten: true,
    pageCount: "16 pages",
    relevance: "interviews_only",
  },
  {
    id: "interview-genai-frameworks",
    title: "GenAI & Applied ML Technical Interview Playbook",
    categoryId: "06-interview",
    driveFileId: "1TeP9ugXJ8Qc5YkFhevhnByGimLsmTFhP",
    description: "High-yield interview cheat sheets: 50 most asked ML/GenAI questions, system design interview templates, and coding round checklists.",
    tags: ["Interviews", "Cheatsheet", "Question Bank", "Placement"],
    isHandwritten: true,
    pageCount: "22 pages",
    relevance: "interviews_only",
  },
];

/**
 * Extracts Google Drive ID and formats embed/preview URLs from any input format
 * (full share URL, /file/d/ link, folder link, or raw ID).
 */
export function extractDriveInfo(input: string): {
  id: string;
  isFolder: boolean;
  embedUrl: string;
  previewUrl: string;
  directUrl: string;
} {
  const trimmed = input.trim();

  // Folder match: /folders/ID
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

  // File match: /file/d/ID or ?id=ID or raw ID
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

  // Sanitize trailing slashes or parameters
  id = id.split("/")[0].split("?")[0];

  return {
    id,
    isFolder: false,
    embedUrl: `https://drive.google.com/file/d/${id}/preview`,
    previewUrl: `https://drive.google.com/file/d/${id}/view`,
    directUrl: `https://drive.google.com/file/d/${id}/view`,
  };
}
