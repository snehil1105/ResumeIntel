import { MasterResume } from '../types';

export const EMPTY_MASTER_RESUME: MasterResume = {
  id: "resume-empty",
  userId: "user-empty",
  personal_info: {
    full_name: "",
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: "",
    leetcode_url: ""
  },
  headline: "",
  educations: [],
  experiences: [],
  projects: [],
  skills: [],
  certifications: []
};

export const SNEHIL_MASTER_RESUME: MasterResume = {
  id: "resume-snehil-master",
  userId: "user-snehil",
  personal_info: {
    full_name: "SNEHIL TRIPATHI",
    email: "tripatics11@gmail.com",
    phone: "+91-7900609557",
    location: "Haldwani, Uttarakhand, India - 263139",
    linkedin_url: "https://linkedin.com/in/snehil-tripathi-38031131a",
    github_url: "https://github.com/snehil1105",
    portfolio_url: "https://snehil-portfolio-eosin.vercel.app/",
    leetcode_url: "https://leetcode.com/u/Snehiltripathi05/"
  },
  headline: "Software Engineer | Java, Spring Boot, Distributed Systems, AI",
  educations: [
    {
      id: "edu-1",
      institution_name: "Vellore Institute of Technology, Bhopal",
      degree: "B.Tech in Computer Science and Engineering",
      field_of_study: "Computer Science and Engineering",
      grade_or_gpa: "CGPA: 8.34/10",
      start_date: "September 2024",
      end_date: "June 2028",
      is_verified: true
    },
    {
      id: "edu-2",
      institution_name: "DAV Centenary Public School",
      degree: "Intermediate (12th Grade)",
      field_of_study: "Science & Mathematics",
      grade_or_gpa: "89.9%",
      start_date: "March 2023",
      end_date: "March 2023",
      is_verified: true
    },
    {
      id: "edu-3",
      institution_name: "DAV Centenary Public School",
      degree: "Matriculation (10th Grade)",
      field_of_study: "General",
      grade_or_gpa: "94.5%",
      start_date: "March 2021",
      end_date: "March 2021",
      is_verified: true
    }
  ],
  experiences: [],
  projects: [
    {
      id: "proj-1",
      title: "HookRelay",
      role: "Lead Developer",
      start_date: "June 2026",
      end_date: "June 2026",
      summary: "Webhook-as-a-Service platform in Java and Spring Boot with guaranteed at-least-once delivery.",
      technologies: ["Java", "Spring Boot", "PostgreSQL", "Redis Streams", "HMAC", "Docker"],
      bullet_points: [
        "Architected a Webhook-as-a-Service platform in Java and Spring Boot, enabling high-throughput event distribution to downstream services with guaranteed at-least-once delivery.",
        "Leveraged Redis Streams for asynchronous event ingestion and pub-sub fan-out, decoupling producers from consumers to ensure low latency and fault tolerance under high traffic loads.",
        "Implemented HMAC SHA-256 payload signing for secure signature verification, alongside automated retries with exponential backoff and a Dead-Letter Queue (DLQ) to handle delivery failures gracefully.",
        "Integrated HookRelay into an e-commerce checkout workflow, orchestrating real-time order confirmation, inventory, and payment event notifications to downstream analytics and fulfillment services."
      ],
      repo_url: "https://github.com/snehil1105/Webhook-proj.git",
      is_verified: true
    },
    {
      id: "proj-2",
      title: "AI Resume Ranker",
      role: "Full Stack AI Engineer",
      start_date: "May 2026",
      end_date: "May 2026",
      summary: "Full-stack web application that parses uploaded resumes and scores candidate fit against job descriptions using LLM-based semantic analysis.",
      technologies: ["Java", "Spring Boot", "React", "Groq API", "Apache PDFBox"],
      bullet_points: [
        "Built a full-stack web application that parses uploaded resumes and scores candidate fit against job descriptions using LLM-based semantic analysis.",
        "Integrated the Groq API for natural language processing and Apache PDFBox for automated text extraction from unstructured PDF files.",
        "Built a responsive React frontend for real-time resume upload, scoring, and feedback."
      ],
      repo_url: "https://github.com/snehil1105/AI-Resume-Ranker",
      is_verified: true
    },
    {
      id: "proj-3",
      title: "Vehicle Insurance Premium Calculator",
      role: "Backend Developer",
      start_date: "May 2026",
      end_date: "May 2026",
      summary: "Premium calculation engine that computes insurance quotes dynamically based on vehicle type, driver history, and coverage tier.",
      technologies: ["Java", "Spring Boot", "Thymeleaf", "Apache POI"],
      bullet_points: [
        "Built a premium calculation engine that computes insurance quotes dynamically based on vehicle type, driver history, and coverage tier.",
        "Automated Excel report generation using Apache POI to export detailed premium breakdowns.",
        "Built a server-rendered UI with Thymeleaf and handled input validation edge cases for a real-world use case."
      ],
      repo_url: "https://github.com/snehil1105/Insurance_Premium_Calculator",
      is_verified: true
    }
  ],
  skills: [
    { id: "s-1", category: "Programming Languages", skill_name: "Python", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-2", category: "Programming Languages", skill_name: "Java", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-3", category: "Programming Languages", skill_name: "C/C++", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-4", category: "Programming Languages", skill_name: "HTML", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-5", category: "Programming Languages", skill_name: "CSS", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-6", category: "Programming Languages", skill_name: "JavaScript", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-7", category: "Development Tools", skill_name: "VS Code", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-8", category: "Development Tools", skill_name: "IntelliJ IDEA", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-9", category: "Development Tools", skill_name: "Jupyter Notebook", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-10", category: "Development Tools", skill_name: "Google Colab", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-11", category: "Development Tools", skill_name: "Git", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-12", category: "Development Tools", skill_name: "Linux", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-13", category: "Technologies and Frameworks", skill_name: "Spring Boot", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-14", category: "Technologies and Frameworks", skill_name: "React.js", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-15", category: "Technologies and Frameworks", skill_name: "REST APIs", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-16", category: "Technologies and Frameworks", skill_name: "Redis", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-17", category: "Technologies and Frameworks", skill_name: "Docker", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-18", category: "Technologies and Frameworks", skill_name: "LangChain", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-19", category: "Technologies and Frameworks", skill_name: "OpenAI Agents SDK", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-20", category: "Technologies and Frameworks", skill_name: "OpenAI Responses API", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-21", category: "Technologies and Frameworks", skill_name: "Oracle AI Vector Search", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-22", category: "Technologies and Frameworks", skill_name: "Oracle AI Vector Search Flow", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-23", category: "Machine Learning & AI", skill_name: "NumPy", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-24", category: "Machine Learning & AI", skill_name: "Pandas", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-25", category: "Machine Learning & AI", skill_name: "Matplotlib", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-26", category: "Machine Learning & AI", skill_name: "Seaborn", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-27", category: "Databases", skill_name: "MySQL", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-28", category: "Databases", skill_name: "PostgreSQL", proficiency_level: "ADVANCED", is_verified: true },
    { id: "s-29", category: "Databases", skill_name: "MongoDB", proficiency_level: "ADVANCED", is_verified: true }
  ],
  coursework: [
    "Cloud Computing: IIT Kharagpur / NPTEL",
    "Agentic AI Certified Foundations Associate: Oracle University",
    "Marketing Analysis: IIT Kharagpur / NPTEL",
    "IBM AI Engineering Professional Certificate: Coursera",
    "Academic Coursework: Data Structures and Algorithms, Object Oriented Programming, Algorithms Analysis, Computer Networks, Operating Systems, Artificial Intelligence, Computer Architecture, Database Management Systems"
  ],
  involvements: [
    "Hackathon Participant: Built a browser-based game at VibeCode Arena, a competitive hackathon hosted on HackerEarth, within a fixed time constraint.",
    "DSA Practice: Actively solving Data Structures and Algorithms problems on LeetCode and Codeforces."
  ],
  section_order: ["education", "projects", "skills", "coursework", "involvement"],
  version_number: 1
};
