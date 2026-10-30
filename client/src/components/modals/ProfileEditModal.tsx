import React, { useEffect, useState } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export type ProfileEditFieldType = 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select';

export interface ProfileEditField {
  key: string;
  label: string;
  type?: ProfileEditFieldType;
  options?: string[];
  placeholder?: string;
  fullWidth?: boolean;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  studentName?: string;
  fields: ProfileEditField[];
  initialValues: Record<string, any>;
  onClose: () => void;
  onSave: (values: Record<string, any>) => Promise<void>;
}

const toInputValue = (value: any): string => {
  if (value === undefined || value === null) return '';
  return String(value);
};

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  title,
  subtitle,
  studentName,
  fields,
  initialValues,
  onClose,
  onSave,
}) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const next: Record<string, string> = {};
    fields.forEach((field) => {
      next[field.key] = toInputValue(initialValues?.[field.key]);
    });
    setValues(next);
    setError(null);
    setSaving(false);
  }, [isOpen, fields, initialValues]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, any> = {};
      Object.entries(values).forEach(([key, value]) => {
        payload[key] = value === '' ? null : value;
      });
      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Could not save changes to the student SQLite database.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-blue-50/70 shrink-0">
          <div>
            <h2 className="text-[14.5px] font-bold text-[#101d37]">{title}</h2>
            <p className="text-[11px] text-[#52627a]">
              {subtitle || 'Changes are saved directly into the student profile SQLite tables.'}
              {studentName ? ` · ${studentName}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#64748b] hover:bg-slate-200/60"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-5 py-2 font-medium">
            {error}
          </div>
        )}

        <div className="p-5 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {fields.map((field) => (
            <div
              key={field.key}
              className={field.fullWidth || field.type === 'textarea' ? 'sm:col-span-2' : ''}
            >
              <label className="font-semibold text-[#101d37] block mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  rows={3}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-[#087cf5]"
                />
              ) : field.type === 'select' ? (
                <select
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-[#087cf5] bg-white"
                >
                  <option value="">— Select —</option>
                  {(field.options || []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={values[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-[#087cf5]"
                />
              )}
            </div>
          ))}
        </div>

        <div className="px-5 py-3 border-t border-[#e5edf5] flex items-center justify-between gap-2 shrink-0 bg-slate-50">
          <span className="text-[10.5px] text-[#64748b]">
            Writes to <strong>student_profile/&lt;student&gt;/&lt;student&gt;.db</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded text-[#52627a] hover:bg-white font-medium text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#087cf5] hover:bg-[#076ed9] text-white rounded font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 text-xs"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{saving ? 'Saving...' : 'Save to SQLite'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
