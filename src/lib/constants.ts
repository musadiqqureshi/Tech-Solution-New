import {
  Code2,
  Globe,
  Smartphone,
  PenTool,
  Workflow,
  Bot,
} from "lucide-react";

export const COMPANY = {
  name: "Tech Solutions Pakistan",
  shortName: "Tech Solutions",
  domain: "tech-solutions.site",
  tagline: "Premium Digital Agency — Engineering Intelligent Solutions",
  email: "info@tech-solutions.site",
  phone: "+92 308 699 4758",
  location: "Lahore, Punjab, Pakistan",
};

// Bank account for SaaS subscription & invoice payments (manual transfer + proof upload).
export const BANK = {
  bankName: "Meezan Bank",
  accountTitle: "Tech Solutions Pakistan",
  accountNumber: "0123 4567 8901 2345",
  iban: "PK00 MEZN 0001 2345 6789 0123",
  branch: "Lahore, Punjab",
};

// SaaS plan prices (USD). Single source of truth for billing.
export const PLAN_PRICING: Record<"starter" | "professional" | "enterprise", number | null> = {
  starter: 14.99,
  professional: 98.99,
  enterprise: null, // custom / contact sales
};

export const CEO = {
  name: "Muhammad Mussaddiq Ahmed Qureshi",
  title: "Founder & CEO",
  role: "Senior Python Developer & Big Data Engineer",
  bio: "With 7+ years of IT experience and 5+ years dedicated to Big Data engineering, Mussaddiq founded Tech Solutions Pakistan to deliver enterprise-grade software, data, and AI solutions. Having personally delivered 400+ projects across Healthcare, Aviation, Finance, Hospitality, and Logistics, he leads a team that engineers for production from day one.",
  stats: [
    { value: "400+", label: "Projects Delivered" },
    { value: "7+", label: "Years Experience" },
    { value: "12+", label: "Industries Served" },
  ],
};

export const STATS = [
  { value: "400+", label: "Projects Delivered" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "12+", label: "Industries" },
  { value: "24/7", label: "Support" },
];

export const ROTATING_SERVICES = [
  "Software Development",
  "Web Development",
  "Mobile Applications",
  "AI Automation",
  "AI Agents & Chatbots",
  "Content & Research Writing",
];

export interface Service {
  icon: typeof Code2;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  overview: string;
  deliverables: string[];
  process: { step: string; detail: string }[];
  outcomes: { value: string; label: string }[];
  tech: string[];
}

export const SERVICES: Service[] = [
  {
    icon: Code2,
    slug: "software-development",
    title: "Software Development",
    tagline: "Enterprise software engineered for production from day one.",
    description:
      "Custom enterprise software, distributed systems, and high-performance APIs built with Python, Java, and modern frameworks.",
    features: ["REST & GraphQL APIs", "Microservices", "Big Data Pipelines"],
    overview:
      "We design and build custom enterprise software that scales — from distributed backends and high-throughput APIs to full data platforms. With 7+ years of engineering and 400+ delivered projects across healthcare, aviation, finance and logistics, we ship systems that are secure, observable, and built to last.",
    deliverables: [
      "Custom enterprise applications & internal tools",
      "REST & GraphQL APIs with auth, rate limiting and docs",
      "Microservices & event-driven architectures",
      "Big-data & streaming pipelines (Spark, Kafka, Airflow)",
      "Cloud deployment, CI/CD and monitoring",
    ],
    process: [
      { step: "Discovery", detail: "We map your requirements, constraints and success metrics." },
      { step: "Architecture", detail: "A scalable, secure design with clear milestones and a fixed proposal." },
      { step: "Build & iterate", detail: "Production-grade code shipped in reviewable increments." },
      { step: "Launch & support", detail: "Deployment, monitoring, and ongoing improvements." },
    ],
    outcomes: [
      { value: "400+", label: "Projects delivered" },
      { value: "99.2%", label: "Peak system reliability" },
      { value: "12+", label: "Industries served" },
    ],
    tech: ["Python", "Java", "FastAPI", "PostgreSQL", "Kafka", "Docker", "AWS"],
  },
  {
    icon: Globe,
    slug: "web-development",
    title: "Web Development",
    tagline: "Fast, SEO-optimized web platforms with premium design.",
    description:
      "Fast, responsive, SEO-optimized web platforms using Next.js, React, and TypeScript with premium design.",
    features: ["Next.js & React", "E-commerce", "Progressive Web Apps"],
    overview:
      "We craft high-performance web platforms that convert — marketing sites, dashboards, e-commerce and progressive web apps. Every build is responsive, accessible and SEO-ready, engineered on Next.js and TypeScript for speed and maintainability.",
    deliverables: [
      "Marketing sites & landing pages that convert",
      "Web apps & admin dashboards",
      "E-commerce & payment integration",
      "Progressive Web Apps (offline-capable)",
      "SEO, analytics and performance tuning",
    ],
    process: [
      { step: "Design", detail: "Wireframes and a polished UI aligned to your brand." },
      { step: "Build", detail: "Component-driven Next.js build with clean, reusable code." },
      { step: "Optimize", detail: "Core Web Vitals, SEO and accessibility passes." },
      { step: "Deploy", detail: "Global CDN deployment with analytics wired in." },
    ],
    outcomes: [
      { value: "40%", label: "Avg. conversion lift" },
      { value: "<1s", label: "Time-to-interactive" },
      { value: "100", label: "Lighthouse targets" },
    ],
    tech: ["Next.js", "React", "TypeScript", "Tailwind", "Vercel", "Stripe"],
  },
  {
    icon: Smartphone,
    slug: "mobile-applications",
    title: "Mobile Applications",
    tagline: "Native-quality mobile apps for iOS and Android.",
    description:
      "Native and cross-platform mobile apps with seamless UX, offline support, and cloud integration.",
    features: ["iOS & Android", "React Native", "Flutter"],
    overview:
      "We build mobile apps people love to use — cross-platform with React Native and Flutter, or fully native when it matters. Offline-first data, push notifications and cloud sync come standard, with a smooth path to the App Store and Play Store.",
    deliverables: [
      "iOS & Android apps (native or cross-platform)",
      "Offline-first sync & local storage",
      "Push notifications & deep linking",
      "In-app payments & subscriptions",
      "App Store / Play Store release & support",
    ],
    process: [
      { step: "Prototype", detail: "Clickable UX to validate flows early." },
      { step: "Develop", detail: "Cross-platform build with a shared, tested codebase." },
      { step: "Integrate", detail: "APIs, auth, payments and push notifications." },
      { step: "Ship", detail: "Store submission, review support and updates." },
    ],
    outcomes: [
      { value: "2×", label: "Faster with one codebase" },
      { value: "4.8★", label: "Typical store rating" },
      { value: "24/7", label: "Post-launch support" },
    ],
    tech: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
  },
  {
    icon: PenTool,
    slug: "content-research-writing",
    title: "Content & Research Writing",
    tagline: "Technical writing and research by domain experts.",
    description:
      "Technical documentation, research papers, and marketing copy crafted by domain experts.",
    features: ["Technical Docs", "Research Papers", "SEO Content"],
    overview:
      "Clear, credible writing that gets read — from developer documentation and research papers to SEO content and marketing copy. Our writers pair subject-matter depth with a sharp editorial standard, so every piece is accurate and compelling.",
    deliverables: [
      "Technical & API documentation",
      "Research papers & literature reviews",
      "SEO articles & blog content",
      "Whitepapers & case studies",
      "Product & marketing copy",
    ],
    process: [
      { step: "Brief", detail: "We align on audience, tone and goals." },
      { step: "Research", detail: "Sourced, fact-checked material." },
      { step: "Draft", detail: "Structured writing with a clear narrative." },
      { step: "Refine", detail: "Editing, SEO and final polish." },
    ],
    outcomes: [
      { value: "100%", label: "Original & sourced" },
      { value: "SEO", label: "Optimized by default" },
      { value: "48h", label: "Typical turnaround" },
    ],
    tech: ["Technical Docs", "SEO", "Research", "Editing"],
  },
  {
    icon: Workflow,
    slug: "ai-automation",
    title: "AI Automation",
    tagline: "Automate the busywork; scale your operations.",
    description:
      "Intelligent workflow automation that connects your tools, eliminates manual work, and scales operations.",
    features: ["Workflow Automation", "Data Pipelines", "Integrations"],
    overview:
      "We connect your tools and automate the repetitive work that slows teams down — data entry, reporting, approvals and hand-offs. The result is fewer errors, faster cycles and hours reclaimed every week.",
    deliverables: [
      "Workflow & process automation",
      "Tool & API integrations (CRM, ERP, Slack, email)",
      "Automated data pipelines & reporting",
      "Document & data extraction",
      "Custom internal automation tools",
    ],
    process: [
      { step: "Audit", detail: "We find the highest-ROI processes to automate." },
      { step: "Design", detail: "A resilient automation with clear guardrails." },
      { step: "Build", detail: "Integrations and pipelines wired to your stack." },
      { step: "Monitor", detail: "Alerting and tuning so it keeps running." },
    ],
    outcomes: [
      { value: "100s", label: "Hours saved / month" },
      { value: "90%", label: "Fewer manual errors" },
      { value: "24/7", label: "Runs without you" },
    ],
    tech: ["Python", "n8n", "Zapier", "Airflow", "APIs", "Webhooks"],
  },
  {
    icon: Bot,
    slug: "ai-agents-chatbots",
    title: "AI Agents & Chatbots",
    tagline: "Conversational AI that qualifies leads and serves customers 24/7.",
    description:
      "Conversational AI agents and chatbots that qualify leads and serve customers 24/7.",
    features: ["Lead Qualification", "Customer Support", "Site-trained"],
    overview:
      "We build AI agents and chatbots trained on your business — answering questions, qualifying leads and handling support around the clock. From website assistants to internal copilots, we ship agents that are helpful, on-brand and safe.",
    deliverables: [
      "Website chat assistants trained on your content",
      "Lead qualification & booking bots",
      "Customer-support agents with hand-off",
      "Internal knowledge copilots (RAG)",
      "Multi-channel deployment (web, WhatsApp, Slack)",
    ],
    process: [
      { step: "Train", detail: "We ground the agent in your content and policies." },
      { step: "Design", detail: "Conversation flows and safe fallbacks." },
      { step: "Integrate", detail: "Connect to your CRM, calendar and channels." },
      { step: "Improve", detail: "Analytics and continuous tuning." },
    ],
    outcomes: [
      { value: "80%", label: "Queries auto-handled" },
      { value: "24/7", label: "Always-on coverage" },
      { value: "<2s", label: "Response time" },
    ],
    tech: ["Claude", "RAG", "OpenRouter", "Vector DB", "Webhooks"],
  },
];

export const getService = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

export const PARTNERS = [
  "Microsoft",
  "AWS",
  "Google Cloud",
  "Vercel",
  "Supabase",
  "OpenAI",
  "Stripe",
  "Docker",
];

export const PORTFOLIO = [
  {
    title: "Big Data Pipeline",
    category: "Data Engineering",
    description:
      "Multi-terabyte real-time streaming pipeline processing millions of events per second with Spark & Kafka.",
    tags: ["Apache Spark", "Kafka", "Hadoop"],
  },
  {
    title: "AI Fraud Detection",
    category: "Machine Learning",
    description:
      "Real-time fraud detection system flagging anomalous transactions with 99.2% precision.",
    tags: ["TensorFlow", "Python", "Real-time ML"],
  },
  {
    title: "Hospital Management",
    category: "Healthcare",
    description:
      "End-to-end hospital management platform handling patients, scheduling, billing, and records.",
    tags: ["Next.js", "PostgreSQL", "HIPAA"],
  },
  {
    title: "Data Integration",
    category: "Enterprise ETL",
    description:
      "Unified data integration layer consolidating 20+ sources into a single warehouse via Airflow.",
    tags: ["Airflow", "ETL", "Snowflake"],
  },
  {
    title: "Cinema Booking",
    category: "Web Platform",
    description:
      "High-concurrency cinema booking system with live seat selection and integrated payments.",
    tags: ["React", "Redis", "Stripe"],
  },
  {
    title: "Air Ticketing",
    category: "Aviation",
    description:
      "Flight search and booking engine integrating multiple GDS providers with dynamic pricing.",
    tags: ["FastAPI", "GDS", "Microservices"],
  },
  {
    title: "Restaurant Management",
    category: "Hospitality",
    description:
      "POS, inventory, and online ordering suite for multi-branch restaurant chains.",
    tags: ["Flutter", "Node.js", "POS"],
  },
  {
    title: "Machine Learning Suite",
    category: "AI / ML",
    description:
      "Modular ML platform for training, deploying, and monitoring models in production.",
    tags: ["MLOps", "Docker", "Scikit-learn"],
  },
];

export const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "CTO, FinEdge",
    text: "Tech Solutions delivered our fraud detection system ahead of schedule. The engineering quality was exceptional.",
    rating: 5,
  },
  {
    name: "Ahmed Raza",
    role: "Founder, MediCare PK",
    text: "Our hospital management platform transformed operations. Truly enterprise-grade work.",
    rating: 5,
  },
  {
    name: "Jessica Tan",
    role: "Product Lead, SkyBook",
    text: "The air ticketing engine handles our peak loads flawlessly. Outstanding big data expertise.",
    rating: 5,
  },
  {
    name: "David Okoro",
    role: "CEO, DataFlow Inc",
    text: "They built our entire ETL infrastructure. Reliable, scalable, and beautifully documented.",
    rating: 5,
  },
  {
    name: "Fatima Noor",
    role: "Operations Director, DineHub",
    text: "The restaurant management suite streamlined all our branches. Support is top-notch.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "VP Engineering, StreamCo",
    text: "Their Kafka streaming architecture scaled effortlessly as we grew 10x. Highly recommended.",
    rating: 5,
  },
  {
    name: "Aisha Khan",
    role: "Marketing Head, ShopEase",
    text: "Beautiful, fast website that boosted our conversions by 40%. The aura design is stunning.",
    rating: 5,
  },
  {
    name: "Robert Hayes",
    role: "CIO, LogiTrack",
    text: "The AI automation saved us hundreds of hours monthly. A genuine partner in growth.",
    rating: 5,
  },
  {
    name: "Maria Garcia",
    role: "Founder, EduSmart",
    text: "Their AI chatbot handles 80% of our customer queries. Implementation was seamless.",
    rating: 5,
  },
  {
    name: "Omar Farooq",
    role: "Director, CineMax",
    text: "The cinema booking platform handled opening night with zero downtime. Brilliant work.",
    rating: 5,
  },
];

// Fallback experts shown when Supabase is not yet configured.
export const FALLBACK_EXPERTS = [
  {
    name: "Ali Hassan",
    role: "Senior Full-Stack Engineer",
    skills: ["Next.js", "Node.js", "PostgreSQL"],
  },
  {
    name: "Zainab Malik",
    role: "Data Engineer",
    skills: ["Spark", "Airflow", "Python"],
  },
  {
    name: "Bilal Ahmed",
    role: "AI / ML Engineer",
    skills: ["TensorFlow", "PyTorch", "MLOps"],
  },
  {
    name: "Hira Sheikh",
    role: "Mobile Lead",
    skills: ["Flutter", "React Native", "Swift"],
  },
];

export const NAV_LINKS = [
  { label: "Services", href: "/services" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "Internship", href: "/internship" },
  { label: "Team", href: "/#team" },
];
