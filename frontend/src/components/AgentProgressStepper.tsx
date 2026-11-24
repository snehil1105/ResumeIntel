import React from 'react';
import { CheckCircle2, Circle, Clock, PauseCircle, AlertTriangle } from 'lucide-react';

export interface AgentStep {
  name: string;
  role: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'WAITING_APPROVAL' | 'FAILED';
  executionTimeMs?: number;
  summary?: string;
}

interface AgentProgressStepperProps {
  steps: AgentStep[];
}

export const AgentProgressStepper: React.FC<AgentProgressStepperProps> = ({ steps }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">LangGraph Multi-Agent Orchestration</h3>
          <p className="text-xs text-slate-400">9 Specialized Agents executing structured intelligence tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs font-medium text-slate-300">Active Workflow</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((step, idx) => {
          let statusColor = "border-slate-800 bg-slate-800/30 text-slate-400";
          let Icon = Circle;

          if (step.status === 'COMPLETED') {
            statusColor = "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
            Icon = CheckCircle2;
          } else if (step.status === 'RUNNING') {
            statusColor = "border-blue-500/40 bg-blue-500/10 text-blue-400 animate-pulse";
            Icon = Clock;
          } else if (step.status === 'WAITING_APPROVAL') {
            statusColor = "border-amber-500/40 bg-amber-500/10 text-amber-400";
            Icon = PauseCircle;
          } else if (step.status === 'FAILED') {
            statusColor = "border-rose-500/40 bg-rose-500/10 text-rose-400";
            Icon = AlertTriangle;
          }

          return (
            <div 
              key={idx}
              className={`p-3 rounded-lg border transition-all flex flex-col justify-between ${statusColor}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase opacity-75">
                    Agent {idx + 1}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-200 mt-0.5">{step.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.role}</p>
                </div>
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              </div>

              {step.summary && (
                <div className="mt-2 pt-2 border-t border-slate-700/40 text-[10px] text-slate-300">
                  {step.summary}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
