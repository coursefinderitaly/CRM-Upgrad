import React, { useEffect } from 'react';
import { AlertTriangle, Save, Trash2, X, RotateCcw } from 'lucide-react';

export interface UnsavedChangesModalProps {
  isOpen: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  onKeepEditing: () => void;
  studentName?: string;
  sectionName?: string;
  isSaving?: boolean;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onKeepEditing,
  studentName,
  sectionName,
  isSaving = false,
}) => {
  // Close on Escape -> keep editing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onKeepEditing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onKeepEditing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in select-none">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-md overflow-hidden animate-scale-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-modal-title"
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="unsaved-modal-title" className="text-base font-bold leading-tight">
                Unsaved Changes Detected
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {sectionName ? `${sectionName} modifications pending` : 'Student profile details modified'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onKeepEditing}
            disabled={isSaving}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Keep editing"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-3.5 text-xs text-slate-600">
          <p className="text-[13px] text-slate-800 leading-relaxed font-medium">
            You made changes to {studentName ? <strong className="text-blue-900">{studentName}'s</strong> : 'this student’s'}{' '}
            profile details, but haven't clicked <strong className="text-blue-600">Save</strong> yet.
          </p>
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-amber-900 flex items-start gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5 animate-pulse" />
            <p className="leading-snug">
              If you leave or close without saving, your unsaved edits will be discarded and the student profile will remain unchanged in the database.
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="bg-slate-50 px-5 py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-end gap-2">
          <button
            type="button"
            onClick={onKeepEditing}
            disabled={isSaving}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-all order-3 sm:order-1"
          >
            Keep Editing
          </button>

          <button
            type="button"
            onClick={onDiscard}
            disabled={isSaving}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl flex items-center justify-center gap-1.5 transition-all order-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Discard Changes</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm hover:shadow flex items-center justify-center gap-1.5 transition-all order-1 sm:order-3 disabled:opacity-60"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Saving to Database...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
