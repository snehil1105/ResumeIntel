import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SimpleGeneratorPage } from './pages/SimpleGeneratorPage';
import { MasterResumePage } from './pages/MasterResumePage';
import { CompanyIntelligencePage } from './pages/CompanyIntelligencePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { MasterResume, JobApplication, CompanyResearchReport } from './types';
import { api } from './services/api';
import { SNEHIL_MASTER_RESUME } from './utils/defaultResume';
import { getOrResearchCompany } from './utils/companyResearch';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('generator');
  const [masterResume, setMasterResume] = useState<MasterResume | null>(null);
  const [hasUploadedResume, setHasUploadedResume] = useState<boolean>(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);

  // Shared Target Job & Company Intelligence State (starts clean and stateless)
  const [targetCompany, setTargetCompany] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('');
  const [targetJdText, setTargetJdText] = useState<string>('');
  const [companyReport, setCompanyReport] = useState<CompanyResearchReport | null>(null);

  // Debounced Agent 3 research when target company changes (avoids spamming while user types)
  useEffect(() => {
    if (!targetCompany || targetCompany.trim().length < 2) return;
    const timer = setTimeout(() => {
      getOrResearchCompany(targetCompany, targetRole).then(report => {
        if (report) setCompanyReport(report);
      });
    }, 600);
    return () => clearTimeout(timer);
  }, [targetCompany]);

  // Clean memory on boot: remove all lingering browser storage so every fresh visit/reload is 100% clean
  useEffect(() => {
    try {
      localStorage.removeItem('resumeintel_has_uploaded');
      localStorage.removeItem('resumeintel_master_profile');
      localStorage.removeItem('resumeintel_master_resume');
      localStorage.removeItem('resumeintel_master_resume_v3');
      localStorage.removeItem('resumeintel_master_resume_v4');
      localStorage.removeItem('resumeintel_target_company');
      localStorage.removeItem('resumeintel_target_role');
      localStorage.removeItem('resumeintel_target_jd');
    } catch {}

    api.getMasterResume().then(res => {
      if (res && res.personal_info?.full_name) {
        setMasterResume(res);
        setHasUploadedResume(true);
      }
    });

    api.getApplications().then(apps => {
      if (apps) setApplications(apps);
    });
  }, []);

  const handleUpdateMasterResume = (updated: MasterResume) => {
    setMasterResume(updated);
    setHasUploadedResume(true);
    api.updateMasterResume(updated);
  };

  const handleSaveToApplications = (company: string, role: string, score: number) => {
    setApplications(prev => [
      {
        id: `app-${Date.now()}`,
        companyName: company,
        jobTitle: role,
        status: 'RESUME_READY',
        applicationDate: new Date().toISOString().split('T')[0],
        notes: `AI-customized resume generated with ATS score ${score}/100.`
      },
      ...prev
    ]);
  };

  const handleUpdateApplicationStatus = (id: string, newStatus: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as any } : a));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#121224] flex flex-col font-sans overflow-x-hidden w-full max-w-full">
      {/* 1. Header with ResumeIntel branding & workspace menu */}
      <Navbar 
        currentTab={currentTab} 
        onSelectTab={setCurrentTab} 
      />

      {/* 2. Main Dashboard 2-Column Responsive Layout */}
      <div className="max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 flex flex-col lg:flex-row items-start gap-4 sm:gap-6 w-full flex-1">
        {/* Left Column: Candidate Card & Quick Metrics */}
        <Sidebar 
          currentTab={currentTab} 
          onSelectTab={setCurrentTab} 
          masterResume={masterResume}
          hasUploadedResume={hasUploadedResume}
        />

        {/* Right Column: Main Interactive Content Area */}
        <main className="flex-1 min-w-0 w-full space-y-6">
          {currentTab === 'generator' && (
            <SimpleGeneratorPage
              currentMasterResume={masterResume}
              onUpdateMasterResume={handleUpdateMasterResume}
              onSaveToApplications={handleSaveToApplications}
              companyName={targetCompany}
              jobTitle={targetRole}
              jdText={targetJdText}
              onChangeCompany={(c) => setTargetCompany(c)}
              onChangeJobTitle={(r) => setTargetRole(r)}
              onChangeJdText={(j) => setTargetJdText(j)}
            />
          )}

          {currentTab === 'company_intelligence' && (
            <CompanyIntelligencePage
              companyName={targetCompany}
              jobTitle={targetRole}
              researchReport={companyReport}
              onSelectCompany={(c) => setTargetCompany(c)}
            />
          )}

          {currentTab === 'master_resume' && (
            <MasterResumePage
              masterResume={masterResume}
              onUpdateResume={handleUpdateMasterResume}
            />
          )}

          {currentTab === 'applications' && (
            <ApplicationsPage
              applications={applications}
              onUpdateStatus={handleUpdateApplicationStatus}
              onNavigate={setCurrentTab}
              masterResume={masterResume}
              onAddApplication={(app) => {
                setApplications(prev => [app, ...prev]);
              }}
              onTailorForJob={(company, role, jdText) => {
                setTargetCompany(company);
                setTargetRole(role);
                setTargetJdText(jdText);
                try {
                  localStorage.setItem('resumeintel_target_company', company);
                  localStorage.setItem('resumeintel_target_role', role);
                  localStorage.setItem('resumeintel_target_jd', jdText);
                } catch {}
                setCurrentTab('generator');
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
