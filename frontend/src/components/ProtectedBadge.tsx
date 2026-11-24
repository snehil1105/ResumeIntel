import React from 'react';
import { Lock } from 'lucide-react';

interface ProtectedBadgeProps {
  label?: string;
  tooltip?: string;
}

export const ProtectedBadge: React.FC<ProtectedBadgeProps> = ({ 
  label = "Protected Field", 
  tooltip = "Protected Master Resume credential. Cannot be fabricated or altered." 
}) => {
  return (
    <span 
      title={tooltip}
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 cursor-help transition-colors"
    >
      <Lock className="w-3 h-3 text-slate-500" />
      {label}
    </span>
  );
};
