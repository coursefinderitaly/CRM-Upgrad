import React, { useState, useEffect, useRef } from 'react';
import { X, Save, AlertTriangle, Camera, Upload, Trash2, User } from 'lucide-react';
import { updateLead } from '../../services/api';
import { Lead } from '../../types/crm';
import { useAuth } from '../../context/AuthContext';
import { UnsavedChangesModal } from './UnsavedChangesModal';

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
  const { user, activePortal } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<any>({});
  const [initialData, setInitialData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  useEffect(() => {
    if (lead) {
      const initial = {
        studentName: lead.studentName || '',
        phone: lead.phone || '',
        email: lead.email || '',
        avatarUrl: lead.avatarUrl || '',
        dob: lead.dob || '',
        address: lead.address || '',
        nationality: lead.nationality || '',
        countryInterest: lead.countryInterest || '',
        courseInterest: lead.courseInterest || '',
        intake: lead.intake || '',
        budget: lead.budget || '',
        universityType: lead.universityType || '',
        preferredCity: lead.preferredCity || '',
        status: lead.status || 'New Lead',
        tenthPercentage: lead.tenthPercentage || '',
        twelfthPercentage: lead.twelfthPercentage || '',
        graduationDegree: lead.graduationDegree || '',
        graduationCgpa: lead.graduationCgpa || '',
        testType: lead.testType || '',
        testOverallScore: lead.testOverallScore || '',
        testDate: lead.testDate || '',
        testScoresDetails: lead.testScoresDetails || '',
        testResultStatus: lead.testResultStatus || '',
      };
      setFormData(initial);
      setInitialData(initial);
      setShowUnsavedPrompt(false);
    }
  }, [lead, isOpen]);

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
        setFormData((prev: any) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const removeAvatar = () => {
    setFormData((prev: any) => ({ ...prev, avatarUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Check if any fields were modified
  const isDirty = React.useMemo(() => {
    if (!initialData || !formData) return false;
    return Object.keys(initialData).some((key) => formData[key] !== initialData[key]);
  }, [formData, initialData]);

  if (!isOpen || !lead) return null;

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  const executeSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        _actor: {
          name: user?.name || 'Staff Operator',
          email: user?.email || null,
          role: activePortal?.role || 'counsellor',
          portal: activePortal?.title || 'Counsellor Portal',
        },
        _portal: activePortal?.title || 'Counsellor Portal',
      };
      const res = await updateLead(lead.id, payload);
      onSuccess(res);
      setShowUnsavedPrompt(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating lead');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeSave();
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
          <button onClick={handleAttemptClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Profile Picture Upload & Edit */}
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
                  alt={formData.studentName || 'Student avatar'}
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
                Update student photo across all portals and folder records.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium text-[#101d37] shadow-2xs transition-colors"
              >
                <Upload className="w-3 h-3 text-[#087cf5]" />
                {formData.avatarUrl ? 'Change Picture' : 'Upload Picture'}
              </button>
            </div>
          </div>

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

          <div className="font-bold text-[13px] text-[#101d37] border-b pb-1 pt-2">Academic Information</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">10th Percentage</label>
              <input
                type="text"
                placeholder="e.g. 85.5%"
                value={formData.tenthPercentage || ''}
                onChange={(e) => setFormData({ ...formData, tenthPercentage: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">12th Percentage</label>
              <input
                type="text"
                placeholder="e.g. 82.0%"
                value={formData.twelfthPercentage || ''}
                onChange={(e) => setFormData({ ...formData, twelfthPercentage: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Undergraduate Degree</label>
              <input
                type="text"
                placeholder="e.g. B.Tech Computer Science"
                value={formData.graduationDegree || ''}
                onChange={(e) => setFormData({ ...formData, graduationDegree: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Undergraduate CGPA / Score</label>
              <input
                type="text"
                placeholder="e.g. 8.1 CGPA"
                value={formData.graduationCgpa || ''}
                onChange={(e) => setFormData({ ...formData, graduationCgpa: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="font-bold text-[13px] text-[#101d37] border-b pb-1 pt-2">English Test Scores & Proficiency</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1">Test Type</label>
              <select
                value={formData.testType || 'IELTS'}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="IELTS">IELTS Academic</option>
                <option value="TOEFL">TOEFL iBT</option>
                <option value="PTE">PTE Academic</option>
                <option value="Duolingo">Duolingo English Test</option>
                <option value="MOI">Medium of Instruction (MOI Waiver)</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1">Overall Band / Score</label>
              <input
                type="text"
                placeholder="e.g. 7.5"
                value={formData.testOverallScore || ''}
                onChange={(e) => setFormData({ ...formData, testOverallScore: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Exam Date</label>
              <input
                type="text"
                placeholder="e.g. 15 Jan 2025"
                value={formData.testDate || ''}
                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="font-semibold block mb-1">Result Status</label>
              <select
                value={formData.testResultStatus || 'Passed'}
                onChange={(e) => setFormData({ ...formData, testResultStatus: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="Passed">Passed / Qualified</option>
                <option value="In Prep">In Preparation</option>
                <option value="Scheduled">Exam Booked / Scheduled</option>
                <option value="Awaiting Results">Awaiting Results</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="font-semibold block mb-1">Sub-band Scores Breakdown</label>
              <input
                type="text"
                placeholder="e.g. Listening: 8.0, Reading: 7.5, Writing: 7.0, Speaking: 7.5"
                value={formData.testScoresDetails || ''}
                onChange={(e) => setFormData({ ...formData, testScoresDetails: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              {isDirty ? (
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved changes
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">All changes saved</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAttemptClose}
                className="px-4 py-2 border rounded text-[#52627a] hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#087cf5] hover:bg-[#006ee6] text-white rounded font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>

        <UnsavedChangesModal
          isOpen={showUnsavedPrompt}
          studentName={lead.studentName}
          isSaving={loading}
          onSave={executeSave}
          onDiscard={() => {
            setShowUnsavedPrompt(false);
            onClose();
          }}
          onKeepEditing={() => setShowUnsavedPrompt(false)}
        />
      </div>
    </div>
  );
};
