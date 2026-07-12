export const navLinks = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#experience-education", label: "Experience" },
  { href: "#services", label: "Services" },
  { href: "#projects", label: "Projects" },
  { href: "#ai-agents", label: "Agents" },
  { href: "#blogs", label: "Blogs" },
  { href: "#endorsements", label: "Endorsements" },
  { href: "#contact", label: "Contact" },
];

export const services = [
  {
    id: "1",
    icon: "code",
    title: "Full-Stack Application Development",
    description: "End-to-end delivery of scalable web applications — from requirements and system design to development, testing, and production deployment. Backend APIs with FastAPI, Flask, and .NET; responsive frontends with React, Next.js, Angular, and TypeScript.",
    techStack: ["FastAPI", "Flask", ".NET", "React", "Next.js", "Angular", "TypeScript"]
  },
  {
    id: "2",
    icon: "cloud",
    title: "Cloud Infrastructure & DevOps",
    description: "Designing and managing the infrastructure that runs applications in production on AWS and Azure — networking, deployment pipelines, and monitoring set up to keep systems highly available as they scale.",
    techStack: ["AWS", "Azure", "Terraform", "Docker", "CI/CD"]
  },
  {
    id: "3",
    icon: "shield",
    title: "Security & Production Reliability",
    description: "Securing service-to-service communication, implementing authentication mechanisms, and instrumenting systems with monitoring for operational visibility — so applications stay stable and secure in production.",
    techStack: ["Auth", "Networking", "Monitoring", "IAM"]
  },
  {
    id: "4",
    icon: "ai",
    title: "AI Integration & Automation",
    description: "Integrating AI into products — chatbots, RAG-based document assistants, and AI data extraction — built with LangChain and LangGraph, connecting to both local (Ollama) and cloud LLM providers.",
    techStack: ["LangChain", "LangGraph", "Ollama", "LLM Integration"]
  }
];

export const heroData = {
  greeting: "Hello, I'm",
  name: "Chandrasekhar",
  title: "AI Engineer & Full-Stack Developer",
  description: "I build intelligent, production-ready systems by combining modern full-stack development with cutting-edge AI."
};

export const aboutData = {
  bio: [
    "I'm a software developer experienced in building complete application solutions from development to deployment. I currently work as an Associate Engineer at YottaFlex AI Technologies Inc, where I contribute to building scalable, reliable systems for real-world business needs — from understanding requirements and designing components to developing, testing, and deploying features in production.",
    "On the backend, I design APIs and application logic with Python (FastAPI, Flask) and .NET; on the frontend, I build responsive applications with React, Next.js, Angular, TypeScript, and Tailwind CSS. Beyond development, I set up and manage cloud infrastructure on AWS and Azure — configuring networking, security, deployment pipelines, and monitoring — and build AI features like chatbots, RAG-based assistants, and document data extraction with LangChain and LangGraph, switching seamlessly between local (Ollama) and cloud LLM providers such as OpenAI."
  ],
  experienceYears: 2,
  projectsCompleted: 4,
  infraBuilt: 1,
  happyClients: 5
};

export const experience = [
  {
    id: "1",
    role: "Associate Engineer",
    company: "YottaFlex AI Technologies Inc",
    duration: "Dec 2024 - Present",
    description: "Building scalable, reliable systems end-to-end — from requirements and component design to development, testing, and production deployment. Design APIs and application logic with FastAPI and Flask, build responsive frontends with React, Angular, and Tailwind CSS, and develop B2B integrations in .NET connecting partner systems and third-party services. Provision and manage AWS infrastructure as code with Terraform — ECS behind an internal ALB, exposed via API Gateway with VPC Link — and integrated a third-party SaaS e-signature platform for digital document signing with secure webhooks tracking signature events."
  },
  {
    id: "2",
    role: "Junior Engineer",
    company: "YottaFlex AI Technologies Inc",
    duration: "Jul 2024 - Dec 2024",
    description: "Developed backend services and REST APIs with Python (Flask), and built frontend features with React, Angular, and TypeScript. Worked with PostgreSQL and MySQL, contributed to AWS-hosted deployments, and wrote automated tests with Selenium."
  }
];

type Education = {
  id: string;
  degree: string;
  institution: string;
  duration: string;
  detail?: string;
  skills?: string[];
};

export const education: Education[] = [
  {
    id: "1",
    degree: "Java Full-Stack Development Training",
    institution: "JSpiders",
    duration: "2023 - Jul 2024",
    skills: ["Core Java", "Spring", "Spring Boot", "Spring MVC", "Hibernate", "SQL", "JavaScript", "Bootstrap"]
  },
  {
    id: "2",
    degree: "Bachelor of Technology",
    institution: "R.V.R. & J.C. College of Engineering",
    duration: "2019 - 2023",
    detail: "CGPA: 8.55"
  },
  {
    id: "3",
    degree: "Intermediate",
    institution: "Sri Pratibha Junior College",
    duration: "2017 - 2019",
    detail: "CGPA: 9.71"
  },
  {
    id: "4",
    degree: "SSC",
    institution: "St. Joseph Eng Medium School",
    duration: "2016 - 2017",
    detail: "CGPA: 9.00"
  }
];

export const skills = [
  { name: "Python", category: "AI" },
  { name: "PyTorch", category: "AI" },
  { name: "LangChain", category: "AI" },
  { name: "LangGraph", category: "AI" },
  { name: "RAG", category: "AI" },
  { name: "Embeddings", category: "AI" },
  { name: "LLM Eval", category: "AI" },
  { name: "Ollama", category: "AI" },
  { name: "LLaMA", category: "AI" },
  { name: "Hugging Face", category: "AI" },
  { name: "Python", category: "Backend" },
  { name: "Flask", category: "Backend" },
  { name: "FastAPI", category: "Backend" },
  { name: "REST APIs", category: "Backend" },
  { name: "Java", category: "Backend" },
  { name: ".NET", category: "Backend" },
  { name: "PostgreSQL", category: "Database" },
  { name: "MySQL", category: "Database" },
  { name: "SQL Server", category: "Database" },
  { name: "React", category: "Frontend" },
  { name: "Next.js", category: "Frontend" },
  { name: "TypeScript", category: "Frontend" },
  { name: "JavaScript", category: "Frontend" },
  { name: "Angular", category: "Frontend" },
  { name: "Zustand", category: "Frontend" },
  { name: "Redux", category: "Frontend" },
  { name: "Tailwind CSS", category: "Frontend" },
  { name: "Bootstrap", category: "Frontend" },
  { name: "HTML", category: "Frontend" },
  { name: "CSS", category: "Frontend" },
  { name: "AWS", category: "Cloud" },
  { name: "Azure", category: "Cloud" },
  { name: "Terraform", category: "Cloud" },
  { name: "Docker", category: "Cloud" },
  { name: "Kubernetes", category: "Cloud" },
  { name: "Jenkins", category: "Cloud" },
  { name: "CI/CD", category: "Cloud" },
  { name: "Linux", category: "Cloud" },
  { name: "Networking", category: "Cloud" },
  { name: "GitHub Actions", category: "Cloud" },
  { name: "Git", category: "Tools" },
  { name: "GitHub", category: "Tools" },
  { name: "Figma", category: "Tools" },
  { name: "Postman", category: "Tools" },
  { name: "VS Code", category: "Tools" },
  { name: "Selenium", category: "Testing" },
  { name: "Playwright", category: "Testing" },
  { name: "TestNG", category: "Testing" },
  { name: "Manual Testing", category: "Testing" }
];

type Project = {
  id: string;
  title: string;
  role?: string;
  description: string;
  techStack: string[];
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
};

export const projects: Project[] = [
  {
    id: "1",
    title: "Equivesto",
    role: "Full-Stack Developer & Infra",
    description: "An investor management and onboarding platform with KYC/AML compliance (identity verification, watchlist/PEP screening), portfolio tracking, and external client integrations with the Zoho SaaS suite, including Zoho Sign e-signatures with secure webhooks. Built the end-to-end transaction flow with dynamically customizable investment limits; runs on Azure (App Service, Azure SQL, Key Vault, Application Insights).",
    techStack: ["Angular", ".NET", "Azure", "Zoho", "SQL Server", "KYC/AML"],
    featured: true,
    liveUrl: "https://equivesto-issuercrm-webapp-dev.azurewebsites.net/"
  },
  {
    id: "2",
    title: "Lumino",
    role: "Full-Stack Developer & Infra",
    description: "An agentic AI strategy platform for nonprofit and for-profit organizations, guiding market intelligence, strategic planning, and change management. Extracts data from US public tax filings with AWS Textract into a normalized relational store, turns organizational ambitions into phased roadmaps of milestones, goals, and projects with OpenAI-powered progress insights, and is fully customizable from reusable building blocks; also architected the underlying AWS infrastructure with Terraform.",
    techStack: ["Python", "FastAPI", "React", "OpenAI", "AWS", "Terraform", "Textract"],
    featured: true,
    liveUrl: "https://www.luminoinsight.com/"
  },
  {
    id: "3",
    title: "Aeon",
    role: "Full-Stack Developer & Testing",
    description: "A multi-tenant loan case management platform that automates credit memo processing with AI-powered data extraction, OCR, and an embeddings-based assistant, supporting role-based workflows for admins, attorneys, processors, and reviewers across banks. Built React screens and Flask REST APIs across the stack, and implemented the automated testing framework from scratch with Selenium and TestNG for regression coverage of critical flows.",
    techStack: ["React", "RAG","Python", "Flask", "PostgreSQL", "AWS"],
    featured: true,
    liveUrl: "https://aeonlegaltech.com/"
  },
  // {
  //   id: "4",
  //   title: "LearnHub",
  //   role: "Solo Developer",
  //   description: "A full-featured e-learning platform where instructors build and publish courses, and learners enroll, track progress, and complete assessments. Includes course/module management, quizzes, progress dashboards, and role-based access for instructors and students — designed, built, and shipped solo end-to-end.",
  //   techStack: ["Python", "Angular", "REST APIs", "AWS"],
  //   featured: false
  // },
];

type AIAgent = {
  id: string;
  name: string;
  status: string;
  purpose: string;
  techStack: string[];
  features: string[];
  githubUrl?: string;
  demoUrl?: string;
};

export const aiAgents: AIAgent[] = [
  {
    id: "1",
    name: "Agent Finance System",
    status: "Completed",
    purpose: "An AI agent that detects anomalies in financial transactions, built on a 5-node LangGraph pipeline (retrieve → process → analyze → verify → report). Exposes a FastAPI REST API with health/readiness endpoints, persists agent state via SQLAlchemy/PostgreSQL, and switches between local (Ollama) and cloud (OpenAI) LLM providers through environment-based configuration.",
    techStack: ["Python", "FastAPI", "LangGraph", "PostgreSQL", "Ollama"],
    features: [
      "5-Node Agent Pipeline",
      "Transaction Anomaly Detection",
      "Local & Cloud LLM Support (Ollama/OpenAI)",
      "REST API with Health & Readiness Checks",
      "Configurable LLM Provider via Environment Settings"
    ]
  },
  {
    id: "2",
    name: "Smart Product Purchase Advisor Agent",
    status: "Completed",
    purpose: "An AI shopping agent that scrapes 8 e-commerce platforms (Amazon, Flipkart, Croma, Reliance Digital, Vijay Sales, Snapdeal, eBay, Bajaj Electronics) in parallel using Playwright, then runs the results through a LangGraph pipeline that compares price, shipping, seller rating, and coupons, cross-checks findings with a 3-layer tool-to-agent verification flow, and tracks price history to recommend the best overall deal via a FastAPI REST API.",
    techStack: ["Python", "FastAPI", "LangGraph", "LangChain", "Playwright"],
    features: [
      "Multi-Platform Price Scraping (8+ Sites)",
      "Coupon Discovery & Deal Ranking",
      "Shipping Cost & Seller Rating Comparison",
      "Price History Tracking & Trend Analysis",
      "3-Layer Verification (Tool → Agent → End-to-End)"
    ]
  }
];

export const writing = [
  {
    id: "1",
    title: "Terraform State Locking Explained with Real-World Scenarios: From DynamoDB to Lockfiles and Force Unlock",
    excerpt: "Terraform's state file is its single source of truth, so when multiple engineers or CI pipelines run terraform apply at the same time, unlocked writes can corrupt state and cause resources to be destroyed or recreated unexpectedly. This piece walks through why state locking is mandatory, compares DynamoDB-based locking (production-grade, but requires provisioning a table and IAM permissions) against the newer lightweight use_lockfile = true approach, and covers how to safely recover from a stale lock using terraform force-unlock without reintroducing concurrency issues.",
    tags: ["Terraform", "AWS", "DevOps"],
    date: "Jan 25, 2026",
    readTime: "6 min",
    url: "https://medium.com/@mukkuchandrasekharreddy2001/terraform-state-locking-explained-with-real-world-scenarios-from-dynamodb-to-lockfiles-and-force-99d3814d8c8b?sharedUserId=mukkuchandrasekharreddy2001"
  },
  {
    id: "2",
    title: "Securely Exposing Private ECS Services Using API Gateway, VPC Link, and an Internal ALB",
    excerpt: "Keeping an ECS backend fully private while still exposing its APIs to external users is a common but non-trivial networking problem. This article breaks down how API Gateway, VPC Link, and AWS-managed Elastic Network Interfaces create a private path into an internal Application Load Balancer, so ECS services never leave the VPC, and shows how custom header validation at the ALB listener adds a defense-in-depth check that rejects any traffic not originating from API Gateway.",
    tags: ["AWS", "Amazon ECS", "API Gateway", "AWS Networking", "Amazon VPC Link"],
    date: "Jun 11, 2026",
    readTime: "6 min",
    url: "https://medium.com/@mukkuchandrasekharreddy2001/securely-exposing-private-ecs-services-using-api-gateway-vpc-link-and-an-internal-alb-865fe9fcf3e6?sharedUserId=mukkuchandrasekharreddy2001"
  },
  {
    id: "3",
    title: "ECS Container Health Checks: ALB vs Container-Level Health Checks",
    excerpt: "ECS, ECR, task definitions, and containers all play a part in keeping a containerized application healthy, but ALB health checks and container-level health checks solve very different problems. This guide explains how ALB checks control traffic routing — stopping requests to unready containers without restarting them — while container-level checks monitor the application itself and trigger automatic restarts, and walks through real-world scenarios like blue/green deployments where combining both creates a self-healing system.",
    tags: ["AWS ECS", "AWS", "ECR", "AWS ECR"],
    date: "Feb 8, 2026",
    readTime: "5 min",
    url: "https://medium.com/@mukkuchandrasekharreddy2001/ecs-container-health-checks-alb-vs-container-level-health-checks-de90a80c1f84?sharedUserId=mukkuchandrasekharreddy2001"
  }
];

export const socialLinks = [
  { name: "GitHub", url: "https://github.com/MChandrashekarReddy", icon: "github" },
  { name: "LinkedIn", url: "https://mchandrashekarreddy.github.io/portfolio/", icon: "linkedin" },
  { name: "Email", url: "mailto:mukkuchandrasekharreddy2001@gmail.com", icon: "email" },
  { name: "Medium", url: "https://medium.com/@mukkuchandrasekharreddy2001", icon: "medium" },
];

export const endorsements = [
  {
    id: "1",
    name: "Osman Syed",
    title: "Associate Software Engineer - L2",
    photo: "/osman.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/osman-syed9",
    quote: "He is technically skilled, highly dependable, and approaches every challenge with a problem-solving mindset. As a dedicated team player, he collaborates effectively, supports his colleagues, and always contributes positively to the team's success."
  },
  {
    id: "2",
    name: "Pavan Puli",
    title: "Junior Lead",
    photo: "/Pavan.jpeg",
    linkedinUrl: "https://www.linkedin.com/in/pavan-puli",
    quote: "It has been a pleasure working with Chandra Sekhar. He is a passionate and highly motivated software engineer who consistently demonstrates strong technical expertise and a genuine commitment to excellence."
  }
];

export const contactData = {
  location: "Hyderabad, India",
  locationLat: 17.463988,
  locationLng: 78.36494,
  phone: "+91 9494485010",
  email: "mukkuchandrasekharreddy2001@gmail.com",
};
