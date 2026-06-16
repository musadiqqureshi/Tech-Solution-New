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

export const SERVICES = [
  {
    icon: Code2,
    title: "Software Development",
    description:
      "Custom enterprise software, distributed systems, and high-performance APIs built with Python, Java, and modern frameworks.",
    features: ["REST & GraphQL APIs", "Microservices", "Big Data Pipelines"],
  },
  {
    icon: Globe,
    title: "Web Development",
    description:
      "Fast, responsive, SEO-optimized web platforms using Next.js, React, and TypeScript with premium design.",
    features: ["Next.js & React", "E-commerce", "Progressive Web Apps"],
  },
  {
    icon: Smartphone,
    title: "Mobile Applications",
    description:
      "Native and cross-platform mobile apps with seamless UX, offline support, and cloud integration.",
    features: ["iOS & Android", "React Native", "Flutter"],
  },
  {
    icon: PenTool,
    title: "Content & Research Writing",
    description:
      "Technical documentation, research papers, and marketing copy crafted by domain experts.",
    features: ["Technical Docs", "Research Papers", "SEO Content"],
  },
  {
    icon: Workflow,
    title: "AI Automation",
    description:
      "Intelligent workflow automation that connects your tools, eliminates manual work, and scales operations.",
    features: ["Workflow Automation", "Data Pipelines", "Integrations"],
  },
  {
    icon: Bot,
    title: "AI Agents & Chatbots",
    description:
      "Conversational AI agents and chatbots powered by Gemini that qualify leads and serve customers 24/7.",
    features: ["Lead Qualification", "Customer Support", "Gemini-powered"],
  },
];

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
  { label: "Services", href: "/#services" },
  { label: "Portfolio", href: "/#portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "Team", href: "/#team" },
  { label: "Contact", href: "/#contact" },
];
