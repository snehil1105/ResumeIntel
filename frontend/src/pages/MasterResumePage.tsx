import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Save, 
  CheckCircle, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  Edit2,
  RefreshCw
} from 'lucide-react';
import { MasterResume } from '../types';
import { ProtectedBadge } from '../components/ProtectedBadge';
import { SNEHIL_MASTER_RESUME, EMPTY_MASTER_RESUME } from '../utils/defaultResume';

interface MasterResumePageProps {
  masterResume: MasterResume | null;
  onUpdateResume: (resume: MasterResume) => void;
}

export const MasterResumePage: React.FC<MasterResumePageProps> = ({
  masterResume,
  onUpdateResume
}) => {
  const [resume, setResume] = useState<MasterResume>(() => {
    return masterResume || EMPTY_MASTER_RESUME;
  });

  useEffect(() => {
    if (masterResume) {
      setResume(masterResume);
    } else {
      setResume(EMPTY_MASTER_RESUME);
    }
  }, [masterResume]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onUpdateResume(resume);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-[#E7E7F0] rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#121224] tracking-tight">Master Profile Credentials</h2>
            <ProtectedBadge label="Single Source of Truth" />
          </div>
          <p className="text-xs text-[#474D6A] mt-1 max-w-2xl leading-relaxed font-normal">
            Your verified Master Profile is synchronized directly from your resume upload on the home page. When tailoring your resume, our system strictly draws from these credentials and will never fabricate unverified facts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F8F9FA] border border-[#E7E7F0] text-xs font-medium text-[#474D6A]">
            <RefreshCw className="w-3.5 h-3.5 text-[#2B59C3]" />
            Synced from Home
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#2B59C3] hover:bg-[#22489F] text-xs font-semibold text-white transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Master profile updated successfully. Tailored resumes will now use your updated credentials.</span>
        </div>
      )}

      {/* 1. Personal Identity Block */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Personal Contact Credentials</h3>
          </div>
          <span className="text-[11px] text-slate-500">Editable by Candidate</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              value={resume.personal_info.full_name}
              onChange={(e) => setResume({
                ...resume,
                personal_info: { ...resume.personal_info, full_name: e.target.value }
              })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded px-3 py-2 font-bold focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={resume.personal_info.email}
              onChange={(e) => setResume({
                ...resume,
                personal_info: { ...resume.personal_info, email: e.target.value }
              })}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={resume.personal_info.phone || ''}
              onChange={(e) => setResume({
                ...resume,
                personal_info: { ...resume.personal_info, phone: e.target.value }
              })}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Location
            </label>
            <input
              type="text"
              value={resume.personal_info.location || ''}
              onChange={(e) => setResume({
                ...resume,
                personal_info: { ...resume.personal_info, location: e.target.value }
              })}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              LinkedIn URL
            </label>
            <input
              type="text"
              value={resume.personal_info.linkedin_url || ''}
              onChange={(e) => setResume({
                ...resume,
                personal_info: { ...resume.personal_info, linkedin_url: e.target.value }
              })}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              GitHub URL
            </label>
            <input
              type="text"
              value={resume.personal_info.github_url || ''}
              onChange={(e) => setResume({
                ...resume,
                personal_info: { ...resume.personal_info, github_url: e.target.value }
              })}
              className="w-full bg-white border border-slate-200 text-slate-800 rounded px-3 py-2 focus:outline-none focus:border-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* 2. Education */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Education Record</h3>
          </div>
          <ProtectedBadge label="Protected &amp; Immutable" />
        </div>

        <div className="space-y-3">
          {resume.educations.map((edu, idx) => (
            <div key={idx} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={edu.institution_name}
                  onChange={(e) => {
                    const updated = [...resume.educations];
                    updated[idx].institution_name = e.target.value;
                    setResume({ ...resume, educations: updated });
                  }}
                  className="bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-900 text-xs w-2/3 shadow-sm"
                />
                <span className="text-slate-500 font-medium">{edu.start_date} – {edu.end_date}</span>
              </div>
              <p className="text-slate-600">{edu.degree} in {edu.field_of_study} {edu.grade_or_gpa && `| GPA: ${edu.grade_or_gpa}`}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Verified Projects */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Verified Projects</h3>
          </div>
          <span className="text-xs text-slate-500">Includes verified repo links</span>
        </div>

        <div className="space-y-4">
          {resume.projects.map((proj, pIdx) => (
            <div key={pIdx} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <input
                  type="text"
                  value={proj.title}
                  onChange={(e) => {
                    const updatedProjects = [...resume.projects];
                    updatedProjects[pIdx].title = e.target.value;
                    setResume({ ...resume, projects: updatedProjects });
                  }}
                  className="bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-900 text-xs shadow-sm"
                />
                <span className="text-slate-500 text-[11px] font-medium">{proj.technologies.join(', ')}</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                {proj.bullet_points.map((b, bIdx) => (
                  <li key={bIdx}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Verified Skills */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Verified Technical Skills ({resume.skills.length})</h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {resume.skills.map((s, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs shadow-sm">
              <span className="font-semibold text-slate-800">{s.skill_name}</span>
              <span className="text-[10px] text-slate-500">({s.category})</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Coursework */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Coursework &amp; Certifications</h3>
          </div>
        </div>
        <div className="space-y-2 text-xs text-slate-700">
          {(resume.coursework || [
            "Cloud Computing: IIT Kharagpur / NPTEL",
            "Agentic AI Certified Foundations Associate: Oracle University",
            "Marketing Analysis: IIT Kharagpur / NPTEL",
            "IBM AI Engineering Professional Certificate: Coursera",
            "Academic Coursework: Data Structures and Algorithms, Object Oriented Programming, Algorithms Analysis, Computer Networks, Operating Systems, Artificial Intelligence, Computer Architecture, Database Management Systems"
          ]).map((cw, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200">
              {cw}
            </div>
          ))}
        </div>
      </div>

      {/* 6. Involvement */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Involvement &amp; Extracurriculars</h3>
          </div>
        </div>
        <div className="space-y-2 text-xs text-slate-700">
          {(resume.involvements || [
            "Hackathon Participant: Built a browser-based game at VibeCode Arena, a competitive hackathon hosted on HackerEarth, within a fixed time constraint.",
            "DSA Practice: Actively solving Data Structures and Algorithms problems on LeetCode and Codeforces."
          ]).map((inv, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-50 border border-slate-200">
              {inv}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
