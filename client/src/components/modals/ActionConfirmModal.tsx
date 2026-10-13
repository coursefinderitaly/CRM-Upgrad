import React, { useEffect } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  X,
  User,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  studentName?: string;
  studentId?: string;
  studentAvatar?: string;
  country?: string;
  currentStageName?: string;
  targetStageName?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  studentName,
  studentId,
  studentAvatar,
  country,
  currentStageName,
  targetStageName,
  description,
  confirmLabel = 'Yes, Forward to Next Stage',
  cancelLabel = 'Cancel',
  variant = 'primary',
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          iconBg: 'bg-emerald-100',
          confirmBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          borderAccent: 'border-emerald-200',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          iconBg: 'bg-amber-100',
          confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
          borderAccent: 'border-amber-200',
        };
      case 'danger':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-rose-600" />,
          iconBg: 'bg-rose-100',
          confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white',
          borderAccent: 'border-rose-200',
        };
      case 'primary':
      default:
        return {
          icon: <ArrowRight className="w-5 h-5 text-[#087cf5]" />,
          iconBg: 'bg-blue-100',
          confirmBtn: 'bg-[#087cf5] hover:bg-[#006ee6] text-white',
          borderAccent: 'border-blue-200',
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[12px] shadow-2xl border border-[#e2e8f0] w-full max-w-[440px] overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#f1f5f9] flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${vStyles.iconBg} flex items-center justify-center shrink-0`}>
              {vStyles.icon}
            </div>
            <div>
              <h3 className="text-[14.5px] font-bold text-[#101d37] leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-[#64748b] leading-tight mt-0.5">
                Confirmation required to prevent accidental updates
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-[#64748b] hover:text-[#101d37] hover:bg-slate-200/60 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5">
          {/* Student Mini Badge */}
          {studentName && (
            <div className="flex items-center gap-3 p-2.5 rounded-[8px] bg-slate-50 border border-slate-200">
              <img
                src={studentAvatar || '/avatars/row_rahul.png'}
                alt={studentName}
                className="w-9 h-9 rounded-full object-cover border border-slate-300 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[13px] text-[#101d37] truncate">{studentName}</span>
                  {country && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 font-medium shrink-0">
                      {country}
                    </span>
                  )}
                </div>
                {studentId && (
                  <div className="text-[11px] text-[#64748b] font-mono mt-0.5">
                    ID: {studentId}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stage Movement Path (if both stages provided) */}
          {currentStageName && targetStageName && (
            <div className="p-2.5 rounded-[8px] bg-blue-50/60 border border-blue-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#087cf5] block">
                Workflow Movement
              </span>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-[#101d37]">
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px]">
                  {currentStageName}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#087cf5] shrink-0" />
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-[11px] font-bold">
                  {targetStageName}
                </span>
              </div>
            </div>
          )}

          {/* Plain English Explanation */}
          <div className="text-[12px] text-slate-600 leading-relaxed">
            {description ||
              (targetStageName
                ? `Are you sure you want to forward this student to "${targetStageName}"? The student profile will now advance to the next step for processing.`
                : 'Are you sure you want to proceed with this update?')}
          </div>

          <div className="p-2 rounded bg-amber-50/70 border border-amber-200/70 text-[10.5px] text-amber-800 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
            <span>You can review or update this student's records at any time.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-[#f1f5f9] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-[6px] border border-[#cbd5e1] hover:bg-white text-slate-700 font-semibold text-[12px] transition-colors shadow-2xs"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 rounded-[6px] font-bold text-[12px] shadow-xs transition-colors flex items-center gap-1.5 ${vStyles.confirmBtn}`}
          >
            <span>{confirmLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
