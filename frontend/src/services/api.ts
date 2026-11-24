import { MasterResume, JobAnalysisReport, CompanyResearchReport, CandidateMatchReport, SkillGapReport, ChangeProposal, ATSReport, JobApplication } from '../types';
import { SNEHIL_MASTER_RESUME } from '../utils/defaultResume';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('resumeintel_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data.data;
  },

  async register(fullName: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data.data;
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    const data = await res.json();
    return data.data;
  },

  // Master Resume
  async getMasterResume(): Promise<MasterResume | null> {
    // In-memory / stateless mode: start clean with no previous user resume
    try {
      const res = await fetch(`${API_BASE}/resumes/master`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.personal_info?.full_name) {
          return json.data;
        }
      }
    } catch (e) {
      // Backend not reached or running statelessly
    }
    return null;
  },

  async updateMasterResume(resume: MasterResume): Promise<MasterResume> {
    try {
      const res = await fetch(`${API_BASE}/resumes/master`, {
        method: 'PUT',
        headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify(resume)
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend update failed, using in-memory state');
    }
    return resume;
  },

  // Job Analysis & Workflow
  async startJobAnalysis(payload: {
    companyName: string;
    jobTitle: string;
    rawJdText: string;
    jobUrl?: string;
    location?: string;
    seniorityLevel?: string;
  }) {
    const res = await fetch(`${API_BASE}/jobs/analyze`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Job analysis failed');
    return json.data;
  },

  // Applications
  async getApplications(): Promise<JobApplication[]> {
    try {
      const res = await fetch(`${API_BASE}/applications`, {
        headers: getAuthHeader()
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch (e) {
      console.warn('Backend not reached, using initial sample applications');
    }
    return [
      {
        id: "app-1",
        companyName: "Google",
        jobTitle: "Software Engineering Intern - Backend",
        status: "INTERVIEW",
        applicationDate: "2026-11-10",
        followUpDate: "2026-11-20",
        notes: "Technical interview scheduled with systems engineering team."
      },
      {
        id: "app-2",
        companyName: "Microsoft",
        jobTitle: "Cloud & AI Software Engineer Intern",
        status: "RESUME_READY",
        applicationDate: "2026-11-15",
        notes: "Customized resume approved. Ready for portal submission."
      },
      {
        id: "app-3",
        companyName: "Amazon",
        jobTitle: "Software Development Engineer Intern (AWS)",
        status: "RESEARCHING",
        applicationDate: "2026-11-17",
        notes: "Company intelligence gathered; investigating distributed services questions."
      }
    ];
  },

  async updateApplicationStatus(id: string, status: string, notes?: string) {
    const res = await fetch(`${API_BASE}/applications/${id}/status`, {
      method: 'PATCH',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes })
    });
    return res.json();
  },

  async searchDiscoveredJobs(params: {
    skills: string[];
    platform?: 'ALL' | 'LINKEDIN' | 'NAUKRI';
    jobType?: 'ALL' | 'JOB' | 'INTERNSHIP';
    roleQuery?: string;
    location?: string;
  }) {
    const res = await fetch('/api/v1/jobs/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        skills: params.skills,
        platform: params.platform || 'ALL',
        job_type: params.jobType || 'ALL',
        role_query: params.roleQuery || '',
        location: params.location || 'India'
      })
    });
    if (!res.ok) throw new Error('Job search failed');
    return res.json();
  }
};
