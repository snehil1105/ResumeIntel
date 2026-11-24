import React, { useState } from 'react';
import { Check, X, Edit3, HelpCircle, ArrowRight, ShieldCheck, Bookmark, Sparkles } from 'lucide-react';
import { ChangeProposal } from '../types';

interface ProposalApprovalCardProps {
  proposal: ChangeProposal;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onSaveForLater: (id: string) => void;
  onAnswerQuestion?: (id: string, answer: string) => void;
}

export const ProposalApprovalCard: React.FC<ProposalApprovalCardProps> = ({
  proposal,
  onApprove,
  onReject,
  onEdit,
  onSaveForLater,
  onAnswerQuestion
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(proposal.proposed_content);
  const [candidateAnswer, setCandidateAnswer] = useState(proposal.user_verification_answer || '');

  const getStatusBadge = () => {
    switch (proposal.approval_status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">Rejected</span>;
      case 'EDITED':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">Customized</span>;
      case 'SAVED_FOR_LATER':
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">Saved</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-700 text-slate-300">Pending Review</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 hover:border-slate-700 transition-all shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {proposal.section_type.replace('_', ' ')}
          </span>
          <span className="text-xs text-slate-400">
            Confidence: <strong className="text-slate-200">{(proposal.confidence_level * 100).toFixed(0)}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Verification Question Prompt (if applicable) */}
      {proposal.verification_question && (
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-amber-300">Candidate Verification Required:</span>
              <p className="text-slate-300 mt-0.5">{proposal.verification_question}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="e.g., Yes, I implemented Docker Compose with Redis & Postgres..."
              value={candidateAnswer}
              onChange={(e) => setCandidateAnswer(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={() => onAnswerQuestion && onAnswerQuestion(proposal.id, candidateAnswer)}
              className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-semibold text-xs hover:bg-amber-400 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* Content Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Original Content */}
        <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Original Master Content</span>
            <span className="text-[10px] text-slate-500">Unchanged</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-mono bg-slate-900/50 p-2 rounded">
            {proposal.original_content}
          </p>
        </div>

        {/* Proposed Content */}
        <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-blue-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Tailored Recommendation
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Factual Verified
            </span>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-blue-500 rounded p-2 text-xs text-slate-100 focus:outline-none font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onEdit(proposal.id, editedText);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 rounded bg-blue-600 text-xs text-white font-medium hover:bg-blue-500"
                >
                  Save Edit
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-blue-100 leading-relaxed font-mono bg-blue-900/20 p-2 rounded border border-blue-500/20">
              {proposal.user_edited_content || proposal.proposed_content}
            </p>
          )}
        </div>
      </div>

      {/* Justification & Evidence Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
        <div>
          <strong className="text-slate-300 block mb-0.5">Why This Change:</strong>
          <span>{proposal.justification_why}</span>
        </div>
        <div>
          <strong className="text-slate-300 block mb-0.5">Supporting JD Requirement:</strong>
          <span className="text-blue-300">{proposal.supporting_jd_requirement}</span>
        </div>
        <div>
          <strong className="text-slate-300 block mb-0.5">Expected Impact:</strong>
          <span className="text-emerald-300">{proposal.expected_benefit}</span>
        </div>
      </div>

      {/* Human-in-the-Loop Actions */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <button
          onClick={() => onSaveForLater(proposal.id)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <Bookmark className="w-3.5 h-3.5" />
          Save for later
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            Edit Manually
          </button>

          <button
            onClick={() => onReject(proposal.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reject
          </button>

          <button
            onClick={() => onApprove(proposal.id)}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm shadow-emerald-600/30"
          >
            <Check className="w-3.5 h-3.5" />
            Approve Change
          </button>
        </div>
      </div>
    </div>
  );
};
