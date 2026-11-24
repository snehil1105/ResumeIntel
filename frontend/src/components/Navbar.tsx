import React, { useState, useRef, useEffect } from 'react';
import { Menu, FileText, CheckCircle2, ChevronRight, Building2, Briefcase, User, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentTab?: string;
  onSelectTab?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab = 'generator', onSelectTab }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'generator', label: 'Tailor Resume', icon: FileText, desc: 'Targeted resume customization' },
    { id: 'company_intelligence', label: 'Company Research', icon: Building2, desc: 'Tech stack & interview rounds' },
    { id: 'applications', label: 'Opportunities', icon: Briefcase, desc: 'Tracked applications & discovery' },
    { id: 'master_resume', label: 'Master Profile', icon: User, desc: 'Single source of verified truth' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E7E7F0] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: ResumeIntel Logo & Desktop Navigation */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <div 
            onClick={() => onSelectTab && onSelectTab('generator')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer select-none"
          >
            {/* Circular Logo Badge */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2B59C3] flex items-center justify-center text-white shadow-sm shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="flex items-baseline">
              <span className="text-base sm:text-[20px] font-black tracking-tight text-[#2B59C3]">
                ResumeIntel
              </span>
              <span className="text-xs sm:text-[17px] font-medium text-[#121224] ml-1 tracking-tight">
                Studio
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links (Cleanly hidden on mobile & tablets, accessible via Workspace menu) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab && onSelectTab(link.id)}
                  className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'text-[#2B59C3] font-bold border-b-2 border-[#2B59C3] rounded-b-none'
                      : 'text-[#474D6A] hover:text-[#121224]'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Workspace Options Three-Line Menu Bar */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 sm:gap-2 py-1 sm:py-1.5 px-2.5 sm:px-3 rounded-full border border-[#D3D8E2] bg-white hover:border-[#2B59C3] hover:shadow-sm cursor-pointer transition-all"
            title="Workspace Options"
          >
            <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#474D6A]" />
            <span className="text-xs font-semibold text-[#121224] hidden sm:inline">Workspace</span>
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#2B59C3] text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center shrink-0">
              R
            </div>
          </button>

          {/* Three-Line Menu Options Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white border border-[#E7E7F0] rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#8292B0] border-b border-[#E7E7F0] mb-1.5 flex items-center justify-between">
                <span>Workspace Options</span>
                <span className="text-[10px] bg-[#F2F5FB] text-[#2B59C3] px-2 py-0.5 rounded-full font-semibold">Active</span>
              </div>
              
              <div className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab && onSelectTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 text-xs rounded-xl transition-all ${
                        isActive
                          ? 'bg-[#F2F5FB] text-[#2B59C3] font-bold'
                          : 'text-[#121224] hover:bg-[#F8F9FA]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-[#2B59C3] text-white' : 'bg-[#F8F9FA] text-[#717B9E]'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-xs leading-tight">{item.label}</div>
                          <div className="text-[10px] text-[#717B9E] font-normal leading-tight mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      {isActive && <CheckCircle2 className="w-4 h-4 text-[#2B59C3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
