export interface LearnLesson {
  id: string;
  slug: string;
  title: string;
  order: number;
  readTime: string;
  content: string;
}

export interface LearnModule {
  id: string;
  slug: string;
  title: string;
  order: number;
  lessons: LearnLesson[];
}

export interface LearnTrack {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string[];
  modules: LearnModule[];
}

export const GENAI_FOUNDATIONS_TRACK: LearnTrack = {
  id: "genai-foundations",
  slug: "genai-foundations",
  title: "Foundations of GenAI & LLMs",
  description: "Master Artificial Intelligence, Deep Learning, and Transformer Architectures with interactive reading, code walkthroughs, and conceptual blueprints.",
  category: ["GenAI", "LLMs", "Deep Learning"],
  modules: [
    {
      id: "module-1-1",
      slug: "session-1-ai-dl-essentials",
      title: "1.1 AI & Deep Learning Essentials",
      order: 1,
      lessons: [
        {
          id: "1-1-1",
          slug: "what-is-ai",
          title: "1.1.1 What is Artificial Intelligence (AI)",
          order: 1,
          readTime: "6m",
          content: `Artificial Intelligence (AI) is the field of building machines that can do tasks that usually need human intelligence — like reading, deciding, or planning. Researchers started AI to ask a simple question: can a machine act smart enough to be useful?

AI is about goal-directed behavior, not about making a machine "feel" human.
Early AI used hand-written rules; modern AI often learns from data.
The Turing Test checks if a machine can chat well enough to fool a human judge.
Generative AI (GenAI) is one branch of AI that creates new content — not the whole field.

## Intuition
Picture two interns for customer support. One gets a thick binder of if-then rules: "If the user says refund and the order is under 30 days, approve it." The other watches thousands of past tickets and picks up patterns. Both can look smart. The first is classical, rule-based AI. The second is data-driven AI (machine learning). AI includes both — and mixes of the two.

A helpful mental model: treat the system as a rational agent. An agent gets observations, picks actions, and is judged by how well those actions reach a goal. You do not need the agent to "think like a human." A warehouse robot that docks correctly is intelligent for its job, even if it would fail a dinner-party chat test.

### Key idea
> **AI is goal-directed behavior under uncertainty — not magic consciousness, and not only chatbots.**

## How it works
### What AI means
Artificial Intelligence is the science and engineering of systems that handle tasks like perception, language, planning, prediction, and decision-making. "Intelligence" here means task success — not a claim about feelings or consciousness.

### Four classic ways to frame AI
| Plain-English idea | When to use it |
| :--- | :--- |
| **Think humanly** — model human cognition | Studying how minds work |
| **Act humanly** — behave like a person (Turing-style) | Conversational benchmarks |
| **Think rationally** — formal logic and sound inference | Symbolic reasoning systems |
| **Act rationally** — pick actions that maximize success | Most production systems |

Most real systems aim at acting rationally: minimize error, maximize reward, meet service targets.

### Classical AI (GOFAI)
Early AI encoded knowledge as symbols and rules: logic programs, expert systems, and search over game trees. Example: MYCIN, a medical expert system, used rules like "if symptoms match a pattern, suggest a likely diagnosis." That worked for crisp, well-defined domains and struggled when the world was noisy or high-dimensional (vision, speech, open-ended language).

## In code
\`\`\`python
# Hardcoded rules: behavior is whatever we wrote.
def is_spam_rules(subject: str) -> bool:
    banned = ("free money", "wire now", "lottery winner")
    s = subject.lower()
    return any(phrase in s for phrase in banned)

# Learning from examples: store labeled subjects, classify by nearest match.
def is_spam_learned(subject: str, memory: list[tuple[str, bool]]) -> bool:
    s = set(subject.lower().split())
    best_overlap, label = -1, False
    for text, is_spam in memory:
        overlap = len(s & set(text.lower().split()))
        if overlap > best_overlap:
            best_overlap, label = overlap, is_spam
    return label
\`\`\`

## What goes wrong
- **Vendor inflation** — Calling basic lookup tables "AI" creates misplaced expectations.
- **Rule explosion** — Trying to maintain thousands of hand-crafted heuristics becomes unmaintainable.

## One-line summary
AI is the overarching discipline of engineering machines to solve complex, goal-directed tasks effectively.

## Key terms
- **Artificial Intelligence (AI)** — Machine systems capable of performing reasoning, planning, or prediction tasks.
- **Turing Test** — A behavioral benchmark measuring whether a machine can converse indistinguishably from a human.
- **Rational Agent** — An entity that acts to achieve the best expected outcome based on its inputs.`,
        },
        {
          id: "1-1-2",
          slug: "what-is-machine-learning",
          title: "1.1.2 What is Machine Learning (ML)",
          order: 2,
          readTime: "6m",
          content: `Machine Learning (ML) is the subset of AI where systems learn statistical patterns directly from data rather than relying exclusively on hand-coded rules.

## Intuition
Instead of manually programming thousands of edge cases for loan approvals, an ML algorithm inspects 50,000 historical loan outcomes and discovers the non-linear relationship between income, credit score, and default probability.

### Key idea
> **In traditional software: Rules + Data = Answers. In Machine Learning: Data + Answers = Rules (Models).**

## How it works
### The Three Core Paradigms
1. **Supervised Learning**: Model learns from labeled input-output pairs $(X \\to Y)$ like regression and classification.
2. **Unsupervised Learning**: Model discovers latent patterns and clusters without ground-truth labels $(X)$.
3. **Reinforcement Learning**: Agent learns through trial and error by interacting with an environment to maximize cumulative reward.

## In code
\`\`\`python
import numpy as np

def train_linear_regression(X: np.ndarray, y: np.ndarray, lr=0.01, epochs=1000):
    w, b = 0.0, 0.0
    n = len(X)
    for _ in range(epochs):
        y_pred = w * X + b
        dw = (-2 / n) * np.sum(X * (y - y_pred))
        db = (-2 / n) * np.sum(y - y_pred)
        w -= lr * dw
        b -= lr * db
    return w, b
\`\`\`

## What goes wrong
- **Data Distribution Drift**: Models trained on 2020 data degrade when consumer behavior shifts in 2026.
- **Spurious Correlations**: Model learns accidental patterns in training data that fail in production.

## One-line summary
Machine Learning turns historical examples into predictive mathematical functions without requiring explicit manual logic.

## Key terms
- **Features ($X$)**: The input variables or attributes fed into the model.
- **Labels ($y$)**: The target variable the model attempts to predict.
- **Loss Function**: Mathematical measure of the discrepancy between prediction and ground truth.`,
        },
        {
          id: "1-1-3",
          slug: "what-is-deep-learning",
          title: "1.1.3 What is Deep Learning",
          order: 3,
          readTime: "6m",
          content: `Deep Learning (DL) is a subfield of Machine Learning based on Artificial Neural Networks with multiple hierarchical layers capable of automated feature representation learning.

## Intuition
In classical ML, an engineer must manually extract edges, textures, or word frequency counts. In Deep Learning, the network automatically learns raw pixel $\\to$ edges $\\to$ textures $\\to$ object parts $\\to$ semantic concepts through stacked mathematical transformations.

### Key idea
> **Deep Learning eliminates manual feature engineering by learning hierarchical representations directly from raw perceptual data.**

## How it works
- **Neurons & Weights**: Each layer applies affine transformations $z = Wx + b$ followed by non-linear activations.
- **Backpropagation**: Calculates gradients of the loss with respect to every weight using the calculus chain rule.
- **Hierarchical Feature Maps**: Early layers capture primitive patterns; deeper layers capture abstract semantic structures.

## In code
\`\`\`python
import torch
import torch.nn as nn

class DeepClassifier(nn.Module):
    def __init__(self, input_dim: int, hidden_dim: int, num_classes: int):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)
\`\`\`

## What goes wrong
- **Gradient Vanishing/Exploding**: Gradients can shrink to 0 or explode to infinity across deep stacks without proper normalization and residual skips.
- **Data & Compute Hunger**: Deep nets require massive datasets and GPUs to generalize effectively.

## One-line summary
Deep Learning replaces hand-crafted features with stacked neural transformations that learn abstract representations directly from raw inputs.

## Key terms
- **Backpropagation**: The fundamental algorithm for calculating weight gradients in neural networks.
- **Activation Function**: Non-linear function (e.g. ReLU, GELU) allowing networks to model non-linear boundaries.
- **Representation Learning**: Automatic feature extraction by deep architectures.`,
        },
        {
          id: "1-1-4",
          slug: "what-is-generative-ai",
          title: "1.1.4 What is Generative AI (Gen AI)",
          order: 4,
          readTime: "6m",
          content: `Generative AI refers to systems and architectures designed to generate novel artifacts—such as natural language text, images, synthetic audio, and executable code—by modeling probability distributions over training tokens.

## Intuition
Discriminative models ask: *"Is this picture a cat or a dog?"*
Generative models ask: *"Given the prompt 'a fluffy golden retriever in space', synthesize realistic pixels that match this distribution."*

### Key idea
> **Generative models learn joint probability distributions $P(X)$ or conditional distributions $P(X|Y)$ to sample entirely new data instances.**

## How it works
- **Autoregressive Language Models**: Predict the next token probability $P(w_t \\mid w_1, \\dots, w_{t-1})$ iteratively.
- **Diffusion Models**: Gradually remove Gaussian noise from a corrupted latent space to reconstruct high-fidelity images.
- **Latent Space Sampling**: Generative models map discrete data into continuous manifold spaces where interpolation and novel sampling occur.

## In code
\`\`\`python
import torch
import torch.nn.functional as F

def sample_next_token(logits: torch.Tensor, temperature: float = 0.7, top_k: int = 50) -> int:
    scaled_logits = logits / max(temperature, 1e-5)
    top_k_logits, top_k_indices = torch.topk(scaled_logits, top_k)
    probs = F.softmax(top_k_logits, dim=-1)
    sampled_index = torch.multinomial(probs, num_samples=1)
    return top_k_indices[sampled_index].item()
\`\`\`

## What goes wrong
- **Hallucinations**: Generative models produce convincing, syntactically fluent assertions that are factually fabricated.
- **Mode Collapse**: Models may fixate on a narrow subset of the data distribution, generating repetitive outputs.

## One-line summary
Generative AI samples novel synthetic media and language by learning to model the statistical distribution of vast real-world datasets.

## Key terms
- **Autoregression**: Generating sequences step-by-step where each output is conditioned on previous tokens.
- **Temperature**: Hyperparameter scaling the sharpness or entropy of token probability distributions.
- **Hallucination**: Confident generation of ungrounded or false statements.`,
        },
        {
          id: "1-1-5",
          slug: "ai-ml-deep-learning-genai",
          title: "1.1.5 AI vs ML vs Deep Learning vs Gen AI",
          order: 5,
          readTime: "8m",
          content: `A clear taxonomy separates the overarching field of AI, data-driven ML, multi-layered Deep Learning, and the creative capabilities of Generative AI.

## Intuition
Think of nested concentric categories:
- **AI** is the entire university campus (all intelligent computation).
- **ML** is the engineering department (learning patterns from historical data).
- **Deep Learning** is the specialized robotics lab inside engineering (multi-layer neural representations).
- **Generative AI** is a specialized capability cutting across deep neural networks to produce new content rather than simple classifications.

### Key idea
> **Accurate nesting: AI includes ML, which includes DL. GenAI is an application style that predominantly rides on DL representations.**

## How it works
### The Decision Checklist
1. *Is there goal-directed computational behavior?* $\\to$ **AI**
2. *Do model parameters adjust by inspecting data examples?* $\\to$ **ML**
3. *Are representations learned through layered artificial neural networks?* $\\to$ **Deep Learning**
4. *Does the system synthesize new text, code, audio, or visual content?* $\\to$ **Generative AI**

## In code
\`\`\`python
def classify_ai_stack(learns_from_data: bool, uses_deep_net: bool, creates_content: bool) -> str:
    tags = ["AI"]
    if learns_from_data:
        tags.append("ML")
    if uses_deep_net:
        tags.append("Deep Learning")
    if creates_content:
        tags.append("Generative AI")
    return " -> ".join(tags)

print(classify_ai_stack(False, False, False)) # AI (e.g. A* Pathfinding)
print(classify_ai_stack(True, False, False))  # AI -> ML (e.g. XGBoost)
print(classify_ai_stack(True, True, False))   # AI -> ML -> Deep Learning (e.g. ResNet)
print(classify_ai_stack(True, True, True))    # AI -> ML -> Deep Learning -> Generative AI (e.g. GPT-4)
\`\`\`

## One-line summary
AI is the discipline; ML is the data-driven paradigm; Deep Learning is the neural architecture; Generative AI is the content synthesis capability.

## Key terms
- **Discriminative vs Generative**: Discriminative models compute $P(Y|X)$ (class boundaries); generative models compute $P(X, Y)$ or $P(X)$ (data distributions).
- **Symbolic AI**: Rule-based systems operating on explicit human-defined logic symbols.`,
        },
        {
          id: "1-1-6",
          slug: "word-representations-one-hot-and-embeddings",
          title: "1.1.6 Word Representations — One-Hot and Embeddings",
          order: 6,
          readTime: "5m",
          content: `Computers cannot directly compute on raw words or characters. To process natural language, strings must be mapped into numerical vectors.

## Intuition
A one-hot vector gives every word in a vocabulary its own independent dimension. Dense embeddings map words into a compact continuous space where geometrically close vectors share semantic meaning.

### Key idea
> **Dense embeddings compress sparse lexical tokens into continuous metric spaces where cosine similarity reflects semantic relatedness.**

## In code
\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F

vocab_size = 10000
embed_dim = 128
embedding_layer = nn.Embedding(num_embeddings=vocab_size, embedding_dim=embed_dim)

input_tokens = torch.tensor([42, 108, 991, 14, 42, 3502])
dense_vectors = embedding_layer(input_tokens)
print("Output shape:", dense_vectors.shape) # [6, 128]
\`\`\`

## Key terms
- **One-Hot Vector**: Sparse representation with a single non-zero entry.
- **Embedding Space**: Continuous vector space where distances correspond to semantic relationships.`,
        },
        {
          id: "1-1-7",
          slug: "artificial-neuron-and-perceptron",
          title: "1.1.7 Artificial Neuron and Perceptron",
          order: 7,
          readTime: "6m",
          content: `The Artificial Neuron (or Perceptron) is the fundamental atomic building block of modern neural network architectures.

## Intuition
An artificial neuron computes a linear combination of inputs followed by a non-linear activation threshold:
$$z = \\sum_{i=1}^{n} w_i x_i + b = \\mathbf{w}^T \\mathbf{x} + b$$
$$y = \\sigma(z)$$

## Key terms
- **Weights ($w$)**: Strengths of connections between input signals and the neuron.
- **Bias ($b$)**: Trainable scalar allowing the activation threshold to shift.`,
        },
        {
          id: "1-1-8",
          slug: "activation-functions-and-mlp",
          title: "1.1.8 Activation Functions and MLP",
          order: 8,
          readTime: "6m",
          content: `Without non-linear activation functions, stacking a hundred neural network layers collapses into a single linear regression.

### Key idea
> **Non-linear activations allow Multi-Layer Perceptrons (MLPs) to act as Universal Function Approximators.**

## Key terms
- **ReLU**: $\\max(0, z)$ — fast computation.
- **GELU**: Smooth probabilistic activation standard in modern LLMs.`,
        },
        {
          id: "1-1-9",
          slug: "overfitting-underfitting-bias-variance",
          title: "1.1.9 Overfitting, Underfitting, and Bias-Variance Tradeoff",
          order: 9,
          readTime: "6m",
          content: `The ultimate objective of training any machine learning model is generalization to unseen real-world data, not memorizing the training set.

### Key idea
> **Total Expected Error = $\\text{Bias}^2 + \\text{Variance} + \\text{Irreducible Noise}$.**

## Key terms
- **Bias**: Error introduced by an overly simple model.
- **Variance**: Error introduced by excessive sensitivity to training noise.`,
        },
        {
          id: "1-1-10",
          slug: "regularization-techniques",
          title: "1.1.10 Regularization Techniques",
          order: 10,
          readTime: "6m",
          content: `Regularization is the set of techniques used to constrain model complexity and prevent overfitting without destroying representational capacity.

## How it works
1. **L2 Weight Decay**: Adds $\\lambda \\sum w_i^2$ to the loss.
2. **Dropout**: Randomly zeroes out activations during training.
3. **Early Stopping**: Halts optimization once validation loss stops improving.`,
        },
      ],
    },
    {
      id: "module-1-2",
      slug: "session-2-dl-essentials",
      title: "1.2 Deep Learning Essentials",
      order: 2,
      lessons: [
        {
          id: "1-2-1",
          slug: "loss-functions",
          title: "1.2.1 Loss Functions — MSE, BCE, and Cross-Entropy",
          order: 1,
          readTime: "6m",
          content: `A loss function quantifies how far a model's prediction is from ground truth, serving as the compass for gradient descent.

## How it works
1. **MSE** (Regression): $\\mathcal{L} = \\frac{1}{N} \\sum (y_i - \\hat{y}_i)^2$
2. **Cross-Entropy** (Classification / LLMs): $\\mathcal{L} = -\\sum y_c \\log(\\hat{y}_c)$`,
        },
        {
          id: "1-2-2",
          slug: "softmax-and-probabilities",
          title: "1.2.2 Softmax and Probabilities",
          order: 2,
          readTime: "6m",
          content: `Neural networks naturally output unbounded logits. The Softmax function transforms these scores into a valid probability distribution summing to 1.0.`,
        },
        {
          id: "1-2-3",
          slug: "backpropagation-and-gradient-descent",
          title: "1.2.3 Backpropagation and Gradient Descent",
          order: 3,
          readTime: "6m",
          content: `Backpropagation computes the exact derivative of the loss with respect to every single parameter using the calculus chain rule, enabling Gradient Descent updates.`,
        },
        {
          id: "1-2-4",
          slug: "training-loop-learning-rate-epochs",
          title: "1.2.4 The Training Loop — Learning Rate and Epochs",
          order: 4,
          readTime: "6m",
          content: `The training loop orchestrates batch data loading, forward propagation, loss evaluation, backprop gradient computation, and optimizer updates across epochs.`,
        },
        {
          id: "1-2-5",
          slug: "convolutional-neural-networks",
          title: "1.2.5 Convolutional Neural Networks",
          order: 5,
          readTime: "6m",
          content: `CNNs exploit spatial translation invariance and local receptive fields by sliding parameter-shared convolutional filters over 2D feature maps.`,
        },
        {
          id: "1-2-6",
          slug: "rnns-and-lstms",
          title: "1.2.6 RNNs and LSTMs",
          order: 6,
          readTime: "8m",
          content: `RNNs and LSTMs maintain sequential memory through recursive hidden state updates, but suffer from sequential training bottlenecks on GPUs.`,
        },
      ],
    },
    {
      id: "module-1-3",
      slug: "transformers",
      title: "1.3 The Transformer Architecture",
      order: 3,
      lessons: [
        {
          id: "1-3-1",
          slug: "seq2seq-bottleneck-and-bahdanau",
          title: "1.3.1 Seq2Seq Bottleneck and Bahdanau Attention",
          order: 1,
          readTime: "6m",
          content: `Attention allows decoders to dynamically attend to all encoder hidden states rather than relying on a single compressed context vector.`,
        },
        {
          id: "1-3-2",
          slug: "why-transformers",
          title: "1.3.2 Why Transformers Replaced RNNs",
          order: 2,
          readTime: "6m",
          content: `Transformers replace sequential recurrence with non-sequential parallel Self-Attention, enabling massive compute scaling on modern hardware.`,
        },
        {
          id: "1-3-3",
          slug: "self-attention-qkv",
          title: "1.3.3 Self-Attention: Queries, Keys, and Values",
          order: 3,
          readTime: "6m",
          content: `Scaled Dot-Product Attention:
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$`,
        },
        {
          id: "1-3-4",
          slug: "positional-encoding-and-mha",
          title: "1.3.4 Positional Encoding and Multi-Head Attention",
          order: 4,
          readTime: "6m",
          content: `Positional encodings restore sequence order awareness, while Multi-Head Attention allows attending to multiple distinct relational subspaces simultaneously.`,
        },
        {
          id: "1-3-5",
          slug: "decoder-masking-cross-attention",
          title: "1.3.5 Causal Masking and Cross-Attention",
          order: 5,
          readTime: "6m",
          content: `Causal Masking zeroes out attention from current tokens to future positions ($t' > t$), preserving strict autoregressive validity.`,
        },
        {
          id: "1-3-6",
          slug: "autoregressive-decoding",
          title: "1.3.6 Autoregressive Decoding and Sampling",
          order: 6,
          readTime: "6m",
          content: `Autoregressive decoding generates text by iteratively predicting and sampling one token at a time using Top-P, Temperature scaling, and KV caching.`,
        },
      ],
    },
  ],
};

export const AGENTIC_AI_TRACK: LearnTrack = {
  id: "agentic-ai",
  slug: "agentic-ai",
  title: "Agentic AI & Autonomous Systems",
  description: "Learn how to build, evaluate, and scale autonomous AI agents, tool-calling loops, reflection patterns, and multi-agent workflows.",
  category: ["AI", "Autonomous Agents", "Engineering"],
  modules: [
    {
      id: "agent-mod-1",
      slug: "agent-foundations",
      title: "1.1 Agent Architecture & Reasoning Loops",
      order: 1,
      lessons: [
        {
          id: "agent-1-1",
          slug: "what-is-an-agent",
          title: "1.1.1 What is an AI Agent",
          order: 1,
          readTime: "5m",
          content: `# What is an AI Agent?

An **AI Agent** is an autonomous software entity powered by an LLM that perceives its environment through tools, maintains internal state/memory, reasons through multi-step plans, and executes actions to accomplish specific goals.

## Intuition
Unlike standard chatbots that only reply with text, an agent has "hands" (APIs, code interpreters, browser tools) and a loop:
\`\`\`
Observation -> Thought -> Action -> Environment Feedback -> Reflection
\`\`\`

## Key Characteristics
- **Tool Use**: Executes function calls (database queries, web requests, search).
- **Reasoning**: Breaks complex ambiguous tasks into structured sub-goals (ReAct, Chain of Thought).
- **Memory**: Short-term conversational context + Long-term vector/episodic memory.
- **Autonomy**: Continues iterating until the goal is achieved or a stopping condition is met.`,
        },
        {
          id: "agent-1-2",
          slug: "react-framework",
          title: "1.1.2 The ReAct Pattern (Reasoning + Acting)",
          order: 2,
          readTime: "6m",
          content: `# The ReAct Framework

**ReAct** (Reasoning and Acting) synergizes reasoning traces with task-specific actions to create robust decision-making loops.

## Intuition
When humans solve difficult problems, they do not just execute blindly; they talk to themselves ("I need to find the latest revenue numbers. Let me first query the 2024 financial statement..."). ReAct mimics this inner monologue before every tool call.

## The ReAct Loop
1. **Thought**: "I need to look up current stock price for NVDA."
2. **Action**: \`call_api(ticker="NVDA")\`
3. **Observation**: \`{"price": 125.40, "change": "+3.2%"}\`
4. **Thought**: "The current price is 125.40. I can now answer the user."
5. **Final Answer**: "NVIDIA is currently trading at \$125.40 (+3.2%)."`,
        },
      ],
    },
  ],
};

export const PRODUCT_MGMT_TRACK: LearnTrack = {
  id: "product-management",
  slug: "product-management",
  title: "Product Management & AI Strategy",
  description: "Master product discovery, customer interview synthesis, PRD execution, AI feature scoping, and metrics instrumentation.",
  category: ["Product", "Strategy", "Leadership"],
  modules: [
    {
      id: "pm-mod-1",
      slug: "product-discovery",
      title: "1.1 Modern Product Discovery",
      order: 1,
      lessons: [
        {
          id: "pm-1-1",
          slug: "problem-framing",
          title: "1.1.1 Problem Framing & Opportunity Trees",
          order: 1,
          readTime: "5m",
          content: `# Problem Framing & Opportunity Solution Trees

Great product management begins with clear, evidence-backed problem statements rather than jumping directly to solutions.

## The Problem Statement Canvas
A rigorous problem statement articulates:
1. **Who** is experiencing the pain (target persona).
2. **What** is the quantified friction or bottleneck.
3. **Why** existing alternatives fail.
4. **What** is the business outcome if solved.

## Opportunity Solution Trees
Created by Teresa Torres, Opportunity Solution Trees structure discovery:
- **Desired Outcome** (e.g., Increase 30-day retention by 15%)
  - **Opportunity / Pain point** (e.g., Users don't understand how to setup integrations)
    - **Solution hypothesis A** (Interactive setup wizard)
    - **Solution hypothesis B** (1-click prebuilt templates)`,
        },
      ],
    },
  ],
};

export const LEARN_TRACKS: LearnTrack[] = [
  GENAI_FOUNDATIONS_TRACK,
  AGENTIC_AI_TRACK,
  PRODUCT_MGMT_TRACK,
];
