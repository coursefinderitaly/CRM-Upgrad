import React, { useState, useRef } from 'react';
import { X, Check, Camera, Upload, Trash2, User } from 'lucide-react';
import { createLead } from '../../services/api';
import { Lead } from '../../types/crm';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newLead: Lead) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    avatarUrl: '',
    countryInterest: 'Italy',
    courseInterest: '',
    intake: 'Sept 2026',
    budget: '',
    universityType: 'Public',
    preferredCity: '',
    leadSource: 'Google Ads',
    notes: '',
    tenthPercentage: '',
    twelfthPercentage: '',
    graduationDegree: '',
    graduationCgpa: '',
    testType: 'IELTS',
    testOverallScore: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    studentName?: string;
    phone?: string;
    email?: string;
  }>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Profile image must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (!isOpen) return null;

  // Mobile: digits only, max 10 — alphabets/symbols never enter the field
  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digits });
    if (fieldErrors.phone) {
      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const validate = () => {
    const errs: { studentName?: string; phone?: string; email?: string } = {};
    const name = formData.studentName.trim();
    if (!name) {
      errs.studentName = 'Student name is required.';
    } else if (name.length < 2) {
      errs.studentName = 'Name must be at least 2 characters.';
    } else if (!/^[A-Za-z][A-Za-z\s.'-]*$/.test(name)) {
      errs.studentName = 'Name may only contain letters, spaces, dots and hyphens.';
    }
    // Indian 10-digit mobile starting with 6–9
    if (!formData.phone) {
      errs.phone = 'Mobile number is required.';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errs.phone = 'Enter a valid 10-digit mobile number starting with 6–9.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address (e.g. student@example.com).';
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError('Please fix the highlighted fields before saving.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const created = await createLead(formData);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-[15px] font-bold text-[#101d37]">Add New Lead</h2>
            <p className="text-[11px] text-[#52627a]">Capture student information and intake details</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748b] hover:text-[#101d37] hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Profile Picture Upload */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200/80 rounded-[8px]">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <div className="relative group">
              {formData.avatarUrl ? (
                <img
                  src={formData.avatarUrl}
                  alt="Avatar preview"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#087cf5] shadow-xs"
                />
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-300/60 transition-colors text-slate-500 hover:text-slate-700"
                >
                  <Camera className="w-5 h-5 mb-0.5 text-[#087cf5]" />
                  <span className="text-[9px] font-semibold">Upload</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#101d37] text-[12px]">Profile Picture</span>
                {formData.avatarUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="text-red-500 hover:text-red-600 text-[11px] font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#64748b]">
                Student photo for instant identification across all CRM portals.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium text-[#101d37] shadow-2xs transition-colors"
              >
                <Upload className="w-3 h-3 text-[#087cf5]" />
                {formData.avatarUrl ? 'Change Picture' : 'Select Photo (JPG / PNG)'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => {
                  setFormData({ ...formData, studentName: e.target.value });
                  if (fieldErrors.studentName) {
                    setFieldErrors((prev) => ({ ...prev, studentName: undefined }));
                  }
                }}
                placeholder="e.g. Rahul Sharma"
                maxLength={60}
                className={`w-full p-2 border rounded-[6px] outline-none focus:border-[#087cf5] ${
                  fieldErrors.studentName ? 'border-red-400 bg-red-50/40' : 'border-slate-200'
                }`}
              />
              {fieldErrors.studentName && (
                <p className="text-red-500 text-[11px] mt-1">{fieldErrors.studentName}</p>
              )}
            </div>
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                required
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                onPaste={(e) => {
                  e.preventDefault();
                  handlePhoneChange(e.clipboardData.getData('text'));
                }}
                placeholder="98765 43210"
                maxLength={10}
                autoComplete="tel"
                className={`w-full p-2 border rounded-[6px] outline-none focus:border-[#087cf5] ${
                  fieldErrors.phone ? 'border-red-400 bg-red-50/40' : 'border-slate-200'
                }`}
              />
              {fieldErrors.phone ? (
                <p className="text-red-500 text-[11px] mt-1">{fieldErrors.phone}</p>
              ) : (
                <p className="text-slate-400 text-[11px] mt-1">10 digits, numbers only.</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                placeholder="student@example.com"
                maxLength={100}
                className={`w-full p-2 border rounded-[6px] outline-none focus:border-[#087cf5] ${
                  fieldErrors.email ? 'border-red-400 bg-red-50/40' : 'border-slate-200'
                }`}
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-[11px] mt-1">{fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">
                Country Interest <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.countryInterest}
                onChange={(e) => setFormData({ ...formData, countryInterest: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5] bg-white"
              >
                <option value="Italy">🇮🇹 Italy</option>
                <option value="Germany">🇩🇪 Germany</option>
                <option value="Canada">🇨🇦 Canada</option>
                <option value="UK">🇬🇧 UK</option>
                <option value="Australia">🇦🇺 Australia</option>
                <option value="USA">🇺🇸 USA</option>
                <option value="France">🇫🇷 France</option>
                <option value="Ireland">🇮🇪 Ireland</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">Course Interest</label>
              <input
                type="text"
                value={formData.courseInterest}
                onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                placeholder="e.g. MSc Computer Science"
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">Target Intake</label>
              <input
                type="text"
                value={formData.intake}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                placeholder="e.g. Sept 2026"
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">Lead Source</label>
              <select
                value={formData.leadSource}
                onChange={(e) => setFormData({ ...formData, leadSource: e.target.value })}
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5] bg-white"
              >
                <option value="Google Ads">Google Ads</option>
                <option value="Website">Website</option>
                <option value="Instagram">Instagram</option>
                <option value="Justdial">Justdial</option>
                <option value="Referral">Referral</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">Budget</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="₹ 8,00,000 – 15,00,000"
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#101d37] block mb-1">Counsellor Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Initial background, student queries, goals..."
              className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-[6px] text-[#52627a] hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded-[6px] font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
