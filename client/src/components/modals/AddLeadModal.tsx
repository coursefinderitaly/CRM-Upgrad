import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    studentName: '',
    phone: '',
    email: '',
    countryInterest: 'Italy',
    courseInterest: '',
    intake: 'Sept 2026',
    budget: '€ 8,000 – 15,000',
    universityType: 'Public / Private',
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentName || !formData.phone || !formData.email) {
      setError('Please fill in Student Name, Mobile Number, and Email.');
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
          {error && (
            <div className="p-2.5 rounded bg-red-50 border border-red-200 text-red-600 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">
                Student Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#101d37] block mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
              />
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="student@example.com"
                className="w-full p-2 border border-slate-200 rounded-[6px] outline-none focus:border-[#087cf5]"
              />
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
                placeholder="€ 8,000 – 15,000"
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
