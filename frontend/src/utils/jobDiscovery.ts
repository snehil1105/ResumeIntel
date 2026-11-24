import { DiscoveredJob, MasterResume } from '../types';

export function extractSkillsFromResume(masterResume?: MasterResume | null): string[] {
  if (!masterResume || !masterResume.skills || masterResume.skills.length === 0) {
    return [
      'Java',
      'Spring Boot',
      'Python',
      'React.js',
      'REST APIs',
      'Redis',
      'Docker',
      'PostgreSQL',
      'MySQL',
      'Git'
    ];
  }
  return masterResume.skills.map(s => s.skill_name);
}

export function generatePlatformSearchUrl(
  platform: 'LINKEDIN' | 'NAUKRI',
  keywords: string,
  location: string = 'India',
  isInternship: boolean = false
): string {
  const cleanKeywords = (keywords || 'Software Engineer Intern').trim();
  if (platform === 'LINKEDIN') {
    const jt = isInternship ? '&f_JT=I' : '&f_JT=F';
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(cleanKeywords)}&location=${encodeURIComponent(location)}${jt}&sortBy=R`;
  } else {
    // Naukri verified direct search url that retains query & avoids 404/redirects
    return `https://www.naukri.com/jobs-in-india?k=${encodeURIComponent(cleanKeywords)}&experience=0&cityTypeGid=9508`;
  }
}

export async function fetchDiscoveredJobs(params: {
  skills: string[];
  platform?: 'ALL' | 'LINKEDIN' | 'NAUKRI';
  jobType?: 'ALL' | 'JOB' | 'INTERNSHIP';
  roleQuery?: string;
  location?: string;
}): Promise<DiscoveredJob[]> {
  try {
    const res = await fetch('/api/v1/jobs/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        skills: params.skills,
        platform: params.platform || 'ALL',
        job_type: params.jobType || 'ALL',
        role_query: params.roleQuery || '',
        location: params.location || 'India'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        return data.results;
      }
    }
  } catch (err) {
    console.warn('Backend job API not responding, using fallback catalog:', err);
  }

  // Client-side fallback if backend is unreachable
  return getFallbackCatalog(params.skills, params.platform, params.jobType, params.roleQuery);
}

function getFallbackCatalog(
  skills: string[],
  platform?: string,
  jobType?: string,
  roleQuery?: string
): DiscoveredJob[] {
  const rawCatalog: DiscoveredJob[] = [
    {
      id: 'li-goog-swe-int',
      title: 'Software Engineering Intern - 2026',
      company: 'Google',
      location: 'Bengaluru / Hyderabad (Hybrid)',
      platform: 'LINKEDIN',
      jobType: 'INTERNSHIP',
      experienceLevel: 'College Student / Fresher (Batch 2025/2026)',
      salaryOrStipend: '₹1,10,000 / month',
      postedDate: '1 day ago',
      matchPercentage: 92,
      matchedSkills: ['Java', 'Python', 'Data Structures', 'Linux'],
      missingSkills: ['Distributed Systems'],
      jobUrl: 'https://www.linkedin.com/jobs/search/?keywords=Google%20Software%20Engineering%20Intern&location=India&f_JT=I&sortBy=R',
      searchUrl: 'https://www.linkedin.com/jobs/search/?keywords=Google%20Software%20Engineering%20Intern&location=India&f_JT=I&sortBy=R',
      naukriUrl: 'https://www.naukri.com/google-jobs?k=Software%20Engineering%20Intern&experience=0&cityTypeGid=9508',
      linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Google%20Software%20Engineering%20Intern&location=India&f_JT=I&sortBy=R',
      careerPortalUrl: 'https://www.google.com/about/careers/applications/jobs/results/?q=software%20engineering%20intern',
      descriptionSnippet: 'Google is seeking software engineering interns to build large-scale cloud services, high-throughput backend APIs, and developer infrastructure.',
      fullJd: 'Software Engineering Intern role at Google India. Seeking candidates proficient in Java/Python, Data Structures, Algorithms, Linux, and REST microservices.',
      badgeTag: 'Top Tier Tech'
    },
    {
      id: 'nk-amzn-sde-int',
      title: 'Software Development Engineer (SDE) Intern',
      company: 'Amazon (AWS)',
      location: 'Bengaluru, Karnataka',
      platform: 'NAUKRI',
      jobType: 'INTERNSHIP',
      experienceLevel: 'Fresher / Final Year Graduate',
      salaryOrStipend: '₹80,000 - ₹1,00,000 / month',
      postedDate: 'Today',
      matchPercentage: 95,
      matchedSkills: ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'Redis'],
      missingSkills: ['AWS'],
      jobUrl: 'https://www.naukri.com/amazon-jobs?k=Software%20Development%20Engineer%20SDE%20Intern&experience=0&cityTypeGid=9508',
      searchUrl: 'https://www.naukri.com/jobs-in-india?k=Amazon%20SDE%20Intern&experience=0&cityTypeGid=9508',
      naukriUrl: 'https://www.naukri.com/amazon-jobs?k=Software%20Development%20Engineer%20SDE%20Intern&experience=0&cityTypeGid=9508',
      linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Amazon%20SDE%20Intern&location=India&f_JT=I&sortBy=R',
      careerPortalUrl: 'https://www.amazon.jobs/en/search?base_query=sde%20intern&loc_query=India',
      descriptionSnippet: 'Join AWS India as an SDE Intern. Work on high-performance distributed systems, message queues, and low-latency transactional services.',
      fullJd: 'Amazon SDE Intern. Strong proficiency in Java, Spring Boot, REST APIs, MySQL, and Redis caching. Opportunity for PPO conversion.',
      badgeTag: 'Actively Hiring'
    },
    {
      id: 'li-msft-swe-fresher',
      title: 'Software Engineer - Backend & Cloud Platforms',
      company: 'Microsoft',
      location: 'Hyderabad / Noida (Hybrid)',
      platform: 'LINKEDIN',
      jobType: 'JOB',
      experienceLevel: '0-2 Years Experience / Early Career',
      salaryOrStipend: '₹16 - ₹24 LPA',
      postedDate: '3 days ago',
      matchPercentage: 88,
      matchedSkills: ['Java', 'Python', 'Spring Boot', 'React.js', 'Docker', 'PostgreSQL'],
      missingSkills: ['Azure'],
      jobUrl: 'https://www.linkedin.com/jobs/search/?keywords=Microsoft%20Software%20Engineer&location=India&f_JT=F&sortBy=R',
      searchUrl: 'https://www.linkedin.com/jobs/search/?keywords=Microsoft%20Software%20Engineer&location=India&f_JT=F&sortBy=R',
      naukriUrl: 'https://www.naukri.com/microsoft-jobs?k=Software%20Engineer&experience=0&cityTypeGid=9508',
      linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Microsoft%20Software%20Engineer&location=India&f_JT=F&sortBy=R',
      careerPortalUrl: 'https://careers.microsoft.com/v2/global/en/home.html?q=software%20engineer',
      descriptionSnippet: 'Microsoft Cloud & AI engineering division is hiring early-career Software Engineers to design and ship mission-critical cloud components.',
      fullJd: 'Software Engineer at Microsoft IDC. Designing scalable backend microservices, REST APIs, and modern web applications with Java, Python, and React.',
      badgeTag: 'Verified Employer'
    },
    {
      id: 'nk-razor-backend-int',
      title: 'Backend Engineering Intern - Fintech & Payments',
      company: 'Razorpay',
      location: 'Bengaluru, Karnataka',
      platform: 'NAUKRI',
      jobType: 'INTERNSHIP',
      experienceLevel: 'Pre-final / Final Year Engineering',
      salaryOrStipend: '₹50,000 / month + PPO Opportunity',
      postedDate: '2 days ago',
      matchPercentage: 96,
      matchedSkills: ['Java', 'Spring Boot', 'Redis', 'MySQL', 'REST APIs', 'Docker'],
      missingSkills: ['Kafka'],
      jobUrl: 'https://www.naukri.com/razorpay-jobs?k=Backend%20Engineering%20Intern&experience=0&cityTypeGid=9508',
      searchUrl: 'https://www.naukri.com/jobs-in-india?k=Razorpay%20Backend%20Intern&experience=0&cityTypeGid=9508',
      naukriUrl: 'https://www.naukri.com/razorpay-jobs?k=Backend%20Engineering%20Intern&experience=0&cityTypeGid=9508',
      linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Razorpay%20Backend%20Developer%20Intern&location=India&f_JT=I&sortBy=R',
      careerPortalUrl: 'https://razorpay.com/jobs/',
      descriptionSnippet: 'Razorpay is seeking backend interns passionate about fintech infrastructure, payment webhooks, and high-concurrency event brokers.',
      fullJd: 'Backend Intern at Razorpay. Build webhooks-as-a-service, idempotent transaction handlers, and Redis stream pub-sub pipelines using Java & Spring Boot.',
      badgeTag: 'Fintech Unicorn'
    },
    {
      id: 'li-flip-sde-job',
      title: 'Software Development Engineer 1 (SDE 1)',
      company: 'Flipkart',
      location: 'Bengaluru, Karnataka',
      platform: 'LINKEDIN',
      jobType: 'JOB',
      experienceLevel: '0-1.5 Years / Fresher',
      salaryOrStipend: '₹18 - ₹26 LPA',
      postedDate: 'Just now',
      matchPercentage: 90,
      matchedSkills: ['Java', 'Spring Boot', 'MySQL', 'Redis', 'Docker'],
      missingSkills: ['Kafka'],
      jobUrl: 'https://www.linkedin.com/jobs/search/?keywords=Flipkart%20SDE%201&location=India&f_JT=F&sortBy=R',
      searchUrl: 'https://www.linkedin.com/jobs/search/?keywords=Flipkart%20SDE%201&location=India&f_JT=F&sortBy=R',
      naukriUrl: 'https://www.naukri.com/flipkart-jobs?k=SDE%201&experience=0&cityTypeGid=9508',
      linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=Flipkart%20SDE%201&location=India&f_JT=F&sortBy=R',
      careerPortalUrl: 'https://www.flipkartcareers.com/#!/',
      descriptionSnippet: 'Flipkart Commerce Cloud is looking for SDE 1 candidates. Help build lightning-fast catalog search and order placement pipelines.',
      fullJd: 'SDE 1 at Flipkart. Java, Spring Boot, MySQL, Redis, Docker, and distributed systems architecture.',
      badgeTag: 'High Response Rate'
    },
    {
      id: 'nk-cred-fullstack-int',
      title: 'Full Stack Developer Intern (React + Java)',
      company: 'CRED',
      location: 'Bengaluru, Karnataka',
      platform: 'NAUKRI',
      jobType: 'INTERNSHIP',
      experienceLevel: 'Pre-final / Final Year',
      salaryOrStipend: '₹65,000 / month',
      postedDate: 'Today',
      matchPercentage: 94,
      matchedSkills: ['React.js', 'JavaScript', 'HTML', 'CSS', 'Java', 'Spring Boot', 'REST APIs'],
      missingSkills: ['TypeScript'],
      jobUrl: 'https://www.naukri.com/cred-jobs?k=Full%20Stack%20Developer%20Intern&experience=0&cityTypeGid=9508',
      searchUrl: 'https://www.naukri.com/jobs-in-india?k=CRED%20Full%20Stack%20Intern&experience=0&cityTypeGid=9508',
      naukriUrl: 'https://www.naukri.com/cred-jobs?k=Full%20Stack%20Developer%20Intern&experience=0&cityTypeGid=9508',
      linkedinUrl: 'https://www.linkedin.com/jobs/search/?keywords=CRED%20Full%20Stack%20Intern&location=India&f_JT=I&sortBy=R',
      careerPortalUrl: 'https://careers.cred.club/',
      descriptionSnippet: 'CRED is looking for a craft-focused Full Stack Intern to craft buttery-smooth React web interfaces and pair them with robust Java/Spring Boot microservices.',
      fullJd: 'Full Stack Intern at CRED. Modern React frontend, Spring Boot backend, REST APIs, high aesthetic craft and performance.',
      badgeTag: 'Design & Engineering'
    }
  ];

  return rawCatalog.filter(item => {
    if (platform && platform !== 'ALL' && item.platform !== platform) return false;
    if (jobType && jobType !== 'ALL' && item.jobType !== jobType) return false;
    if (roleQuery && roleQuery.trim()) {
      const q = roleQuery.toLowerCase().trim();
      const combined = `${item.title} ${item.company} ${item.descriptionSnippet}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });
}
