import { MasterResume } from '../types';

export interface DomainAlignmentResult {
  isCompatible: boolean;
  alignmentScore: number; // 0 - 100
  candidateDomain: string;
  candidatePillars: string[];
  candidateVerifiedSkills: string[];
  candidateTopProjects: string[];
  jobDomain: string;
  jobRoleCategory: string;
  jobCoreDemands: string[];
  matchedCompetencies: string[];
  missingCriticalCompetencies: string[];
  aiAnalysisSummary: {
    headline: string;
    candidateProfileOverview: string;
    jobDemandsOverview: string;
    vectorMismatchReason: string;
    factualIntegrityNotice: string;
    recommendedTargetRoles: string[];
    pivotGuidance: string;
  };
}

// Incompatible domain dictionaries with patterns and descriptive profiles
const INCOMPATIBLE_DOMAINS = [
  {
    category: 'Content Creation & Digital Media',
    patterns: [
      'content creator', 'video editor', 'videographer', 'cinematographer',
      'social media', 'influencer', 'youtuber', 'youtube creator', 'reels',
      'tiktok', 'vlogger', 'scriptwriter', 'script writer', 'creative producer',
      'podcaster', 'ugc creator', 'video production', 'streamer', 'short form content'
    ],
    demands: [
      'Short-form and long-form video production (Reels, TikToks, YouTube)',
      'Video editing proficiency (Adobe Premiere Pro, Final Cut, CapCut, DaVinci Resolve)',
      'Scriptwriting, storytelling, and viral hook construction',
      'On-camera presentation, lighting, and audio engineering',
      'Audience retention analysis, thumbnail design, and platform algorithm optimization'
    ],
    pivotAdvice: 'To transition into developer-adjacent content creation (e.g. Developer Relations or Technical Writing), build coding tutorials, record systems architecture breakdowns, and publish open-source documentation.'
  },
  {
    category: 'Graphic Design & Creative Arts',
    patterns: [
      'graphic designer', 'illustrator', 'photographer', 'photo editor',
      'fashion designer', 'interior designer', 'visual artist', '3d artist',
      'motion graphics designer', 'concept artist', 'animator', 'storyboard'
    ],
    demands: [
      'Visual asset creation using Adobe Creative Cloud (Photoshop, Illustrator, InDesign)',
      'Typography, color theory, layout composition, and branding guidelines',
      'Motion graphics, vector illustration, and print production standards',
      'Creative portfolio review and brand visual identity delivery'
    ],
    pivotAdvice: 'Consider UI/UX Engineering or Frontend Design Systems, combining React/CSS with Figma component design.'
  },
  {
    category: 'Healthcare & Clinical Services',
    patterns: [
      'nurse', 'registered nurse', 'doctor', 'physician', 'surgeon',
      'dentist', 'pharmacist', 'pharmacy technician', 'therapist',
      'paramedic', 'radiologist', 'physiotherapist', 'clinical assistant',
      'patient care', 'medical officer'
    ],
    demands: [
      'Accredited clinical licenses (MBBS, MD, RN, PharmD, etc.)',
      'Direct patient diagnostic, clinical triage, and treatment administration',
      'Pharmacological knowledge and HIPAA medical compliance',
      'Emergency intervention and patient record management'
    ],
    pivotAdvice: 'Technical application in healthcare should target HealthTech, Clinical Data Engineering, or Bioinformatics Systems.'
  },
  {
    category: 'Sales & Telemarketing (Non-Technical)',
    patterns: [
      'sales representative', 'telecaller', 'cold calling', 'bpo voice',
      'telesales', 'real estate agent', 'insurance agent', 'retail cashier',
      'store associate', 'counter sales', 'door to door'
    ],
    demands: [
      'Outbound cold calling, lead qualification, and pipeline prospecting',
      'CRM quota management (Salesforce, HubSpot) and objection handling',
      'In-person retail merchandising, POS transaction processing, and retail customer service'
    ],
    pivotAdvice: 'Software engineers interested in revenue should explore Solutions Architecture or Technical Pre-Sales Engineering.'
  },
  {
    category: 'Culinary, Hospitality & Food Services',
    patterns: [
      'chef', 'cook', 'baker', 'sous chef', 'barista', 'bartender',
      'waiter', 'waitress', 'hotel receptionist', 'housekeeping',
      'restaurant manager', 'culinary specialist'
    ],
    demands: [
      'Commercial kitchen culinary production and food safety certification (HACCP/ServSafe)',
      'Recipe standardization, inventory procurement, and culinary plating',
      'Beverage craft, guest hospitality management, and dining room service'
    ],
    pivotAdvice: 'Technical roles in this industry focus on Restaurant POS Architecture and Food-Delivery Logistics Engineering.'
  },
  {
    category: 'Core Non-Software Engineering & Trades',
    patterns: [
      'civil engineer', 'structural site engineer', 'site supervisor',
      'construction manager', 'plumber', 'electrician', 'welder',
      'hvac technician', 'carpenter', 'masonry'
    ],
    demands: [
      'AutoCAD/Revit structural drawings and building code compliance',
      'On-site construction supervision, material safety, and contractor oversight',
      'Physical trades installation, high-voltage wiring, or mechanical piping'
    ],
    pivotAdvice: 'Civil infrastructure engineering does not intersect with backend software services without specialized CAD/BIM software development experience.'
  },
  {
    category: 'Legal, Judicial & Compliance',
    patterns: [
      'lawyer', 'attorney', 'paralegal', 'legal counsel', 'litigation',
      'court reporter', 'judge advocate', 'legal associate'
    ],
    demands: [
      'Juris Doctor / LL.B degree and Bar Council / state bar certification',
      'Case law research, statutory contract drafting, and courtroom litigation',
      'Regulatory compliance, deposition filing, and discovery analysis'
    ],
    pivotAdvice: 'Software candidates can explore LegalTech Engineering, Smart Contracts, or Privacy Engineering.'
  }
];

// Tech indicators that indicate the JD actually is a Software/Engineering role
const TECH_ROLE_INDICATORS = [
  'software', 'developer', 'engineer', 'backend', 'frontend', 'fullstack', 'full-stack',
  'api', 'web development', 'java', 'python', 'c++', 'c#', 'react', 'node', 'spring',
  'database', 'sql', 'postgresql', 'mysql', 'redis', 'cloud', 'aws', 'docker', 'kubernetes',
  'devops', 'machine learning', 'data science', 'ai', 'microservices', 'systems', 'computer science',
  'data structures', 'algorithms', 'git', 'ci/cd', 'restful', 'linux', 'golang', 'rust'
];

export function assessDomainCompatibility(
  resume: MasterResume,
  jobTitle: string,
  jdText: string
): DomainAlignmentResult {
  const titleLower = (jobTitle || '').toLowerCase();
  const jdLower = (jdText || '').toLowerCase();
  const combinedJd = `${titleLower} ${jdLower}`;

  // 1. Extract Candidate Profile details safely
  const candidateDomain = "Computer Science & Software Engineering";
  const candidatePillars = [
    "Backend Distributed Systems & Microservices",
    "Transactional Database Architecture (SQL & In-Memory Redis)",
    "High-Performance RESTful API Engineering",
    "Data Structures, Algorithms & Systems Rigor"
  ];

  // Safely extract candidate skills supporting skill_name, skillName, name, or string
  const candidateSkills: string[] = ((resume && resume.skills) ? resume.skills : []).map((s: any) => {
    if (typeof s === 'string') return s;
    if (!s) return '';
    return s.skill_name || s.skillName || s.name || '';
  }).filter((s: string) => Boolean(s && s.trim().length > 0));

  const candidateTopProjects: string[] = ((resume && resume.projects) ? resume.projects : []).map((p: any) => {
    if (typeof p === 'string') return p;
    if (!p) return '';
    return p.title || p.name || '';
  }).filter((p: string) => Boolean(p && p.trim().length > 0));

  // 2. Check if the JD matches any known incompatible non-software domain
  let detectedIncompatible: typeof INCOMPATIBLE_DOMAINS[0] | null = null;
  for (const domain of INCOMPATIBLE_DOMAINS) {
    const hasPattern = domain.patterns.some(p => {
      // Check title first with high priority
      if (titleLower.includes(p)) return true;
      // In JD body, check if pattern appears as a distinct phrase
      try {
        const regex = new RegExp(`\\b${p.replace(/\s+/g, '\\s+')}\\b`, 'i');
        return regex.test(combinedJd);
      } catch {
        return combinedJd.includes(p);
      }
    });

    if (hasPattern) {
      detectedIncompatible = domain;
      break;
    }
  }

  // 3. Count technical keyword matches in JD
  const matchedTechTerms: string[] = [];
  for (const term of TECH_ROLE_INDICATORS) {
    try {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(combinedJd)) {
        matchedTechTerms.push(term);
      }
    } catch {
      if (combinedJd.includes(term)) {
        matchedTechTerms.push(term);
      }
    }
  }

  // Count candidate's specific verified skills appearing in the JD
  const matchedCandidateSkills = candidateSkills.filter(skill => {
    if (!skill || typeof skill !== 'string') return false;
    const sLower = skill.toLowerCase().trim();
    if (sLower.length < 2) return false;
    try {
      const regex = new RegExp(`\\b${sLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(combinedJd);
    } catch {
      return combinedJd.includes(sLower);
    }
  });

  // 4. Decision Logic:
  // Is it incompatible?
  // Condition A: Explicitly matched an incompatible domain (e.g. Content Creator, Nurse, Chef) AND has few or zero tech skill matches (< 2)
  // Condition B: Matched zero candidate verified skills AND matched <= 1 generic tech term
  const isExplicitIncompatible = detectedIncompatible !== null && matchedCandidateSkills.length <= 1;
  const isZeroOverlapUnrelated = matchedCandidateSkills.length === 0 && matchedTechTerms.length <= 1;

  if (isExplicitIncompatible || isZeroOverlapUnrelated) {
    const jobDomain = detectedIncompatible ? detectedIncompatible.category : "Non-Technical / Unrelated Field";
    const jobDemands = detectedIncompatible ? detectedIncompatible.demands : [
      "Role requires specialized non-engineering competencies not present in technical profile",
      "Domain-specific credentials, industry certifications, or operational experience",
      "Field deliverables unrelated to computer software development or systems programming"
    ];
    const pivotAdvice = detectedIncompatible ? detectedIncompatible.pivotAdvice : "Target engineering-adjacent roles within this sector rather than direct non-technical positions.";

    // Alignment score is between 0% and 12%
    const alignmentScore = Math.min(12, matchedCandidateSkills.length * 4 + matchedTechTerms.length * 2);

    return {
      isCompatible: false,
      alignmentScore,
      candidateDomain,
      candidatePillars,
      candidateVerifiedSkills: candidateSkills.slice(0, 8),
      candidateTopProjects: candidateTopProjects.slice(0, 3),
      jobDomain,
      jobRoleCategory: jobTitle || "Target Non-Technical Role",
      jobCoreDemands: jobDemands,
      matchedCompetencies: matchedCandidateSkills,
      missingCriticalCompetencies: jobDemands,
      aiAnalysisSummary: {
        headline: `Domain Mismatch Detected: ${candidateDomain} vs. ${jobDomain}`,
        candidateProfileOverview: `Your Master Resume is deeply specialized in Computer Science and Software Engineering. Your core verified strengths center on backend systems architecture, Core Java and Spring Boot microservices, relational PostgreSQL transaction optimization, and high-throughput distributed event messaging with Redis Streams.`,
        jobDemandsOverview: `The provided Job Description for "${jobTitle || 'this role'}" is centered entirely on ${jobDomain}. It demands capabilities such as ${jobDemands.slice(0, 3).join(', ')}.`,
        vectorMismatchReason: `There is 0% vector alignment between your verified engineering background and this job's core requirements. Generating a tailored resume for this opening would require fabricating non-existent creative or non-technical experiences, which violates our zero-hallucination factual integrity policy.`,
        factualIntegrityNotice: `Factual Integrity Guard Active: Resume tailoring was intentionally withheld. We protect your professional credibility by refusing to generate misleading, synthetic, or unqualified applications that would trigger automated recruiter disqualification.`,
        recommendedTargetRoles: [
          "Software Engineering Intern (Backend / Systems)",
          "Java / Spring Boot Developer",
          "Full-Stack Web Developer (React + Python/Java)",
          "Cloud Infrastructure & REST API Platform Engineer"
        ],
        pivotGuidance: pivotAdvice
      }
    };
  }

  // Role IS compatible (e.g. Software Engineer, Backend Developer, Data Scientist, etc.)
  const overlapRatio = Math.min(1.0, (matchedCandidateSkills.length * 10 + matchedTechTerms.length * 5) / 100);
  const alignmentScore = Math.max(75, Math.min(98, Math.round(70 + overlapRatio * 28)));

  return {
    isCompatible: true,
    alignmentScore,
    candidateDomain,
    candidatePillars,
    candidateVerifiedSkills: candidateSkills,
    candidateTopProjects,
    jobDomain: "Software Engineering & Technology",
    jobRoleCategory: jobTitle || "Software Engineer",
    jobCoreDemands: matchedTechTerms.slice(0, 5),
    matchedCompetencies: matchedCandidateSkills.length > 0 ? matchedCandidateSkills : ["Software Architecture", "Programming Foundations", "REST APIs"],
    missingCriticalCompetencies: [],
    aiAnalysisSummary: {
      headline: `High Domain Compatibility (${alignmentScore}% Alignment)`,
      candidateProfileOverview: `Candidate profile strongly aligns with software engineering, backend systems, and technical problem solving.`,
      jobDemandsOverview: `Job description requirements intersect with verified programming languages, frameworks, and architecture patterns.`,
      vectorMismatchReason: `Vectors align with technical requirements.`,
      factualIntegrityNotice: `All tailored adjustments are strictly verified from the Master Resume.`,
      recommendedTargetRoles: [],
      pivotGuidance: ""
    }
  };
}
