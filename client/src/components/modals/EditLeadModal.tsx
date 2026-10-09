import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { updateLead } from '../../services/api';
import { Lead } from '../../types/crm';

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSuccess: (updated: Lead) => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  isOpen,
  onClose,
  lead,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lead) {
      setFormData({
        studentName: lead.studentName,
        phone: lead.phone,
        email: lead.email,
        dob: lead.dob || '12 May 2000',
        address: lead.address || 'Indore, Madhya Pradesh',
        nationality: lead.nationality || 'Indian',
        countryInterest: lead.countryInterest,
        courseInterest: lead.courseInterest,
        intake: lead.intake || 'Sept 2026',
        budget: lead.budget || '€ 8,000 – 15,000',
        universityType: lead.universityType || 'Public / Private',
        preferredCity: lead.preferredCity || 'Rome / Milan',
        status: lead.status,
      });
    }
  }, [lead]);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await updateLead(lead.id, formData);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-5 py-2 font-medium">
            {error}
          </div>
        )}
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-slate-50/60">
          <div>
            <h2 className="text-[15px] font-bold text-[#101d37]">Edit Student & Preferences</h2>
            <p className="text-[11px] text-[#52627a]">Update records for {lead.studentName} ({lead.leadId})</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          <div className="font-bold text-[13px] text-[#101d37] border-b pb-1">Personal Details</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Name</label>
              <input
                type="text"
                value={formData.studentName || ''}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Mobile</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">DOB</label>
              <input
                type="text"
                value={formData.dob || ''}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Nationality</label>
              <input
                type="text"
                value={formData.nationality || ''}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="font-bold text-[13px] text-[#101d37] border-b pb-1 pt-2">Study Preference</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Country</label>
              <input
                type="text"
                value={formData.countryInterest || ''}
                onChange={(e) => setFormData({ ...formData, countryInterest: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Course</label>
              <input
                type="text"
                value={formData.courseInterest || ''}
                onChange={(e) => setFormData({ ...formData, courseInterest: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Intake</label>
              <input
                type="text"
                value={formData.intake || ''}
                onChange={(e) => setFormData({ ...formData, intake: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Budget</label>
              <input
                type="text"
                value={formData.budget || ''}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">University Type</label>
              <input
                type="text"
                value={formData.universityType || ''}
                onChange={(e) => setFormData({ ...formData, universityType: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Preferred City</label>
              <input
                type="text"
                value={formData.preferredCity || ''}
                onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-[#52627a] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded font-semibold"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
