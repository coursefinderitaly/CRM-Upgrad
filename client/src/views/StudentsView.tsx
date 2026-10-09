import React, { useEffect, useState } from 'react';
import { fetchStudents } from '../services/api';
import { UserCheck, GraduationCap, FileCheck, ArrowRight } from 'lucide-react';

export const StudentsView: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  useEffect(() => {
    fetchStudents()
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Enrolled Students Roster</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Active student records undergoing documentation, application & visa workflows
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
          {students.length} Enrolled
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {students.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-[8px] border border-[#e5edf5] p-3.5 shadow-crm-card space-y-2 hover:border-[#087cf5] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#087cf5] bg-blue-50 px-2 py-0.5 rounded">
                {s.studentId}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                {s.stage}
              </span>
            </div>

            <div>
              <div className="text-[14px] font-bold text-[#101d37]">{s.name}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{s.phone} • {s.email}</div>
            </div>

            <div className="p-2 bg-[#f8fafc] rounded text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Target Country:</span>
                <span className="font-semibold text-slate-800">{s.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Program:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[160px]">{s.course}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Target Intake:</span>
                <span className="font-semibold text-slate-800">{s.intake}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Enrolled: {new Date(s.enrolledDate).toLocaleDateString()}</span>
              <button
                onClick={() => setSelectedStudent(s)}
                className="text-[#087cf5] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Student Dossier Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#087cf5] border border-blue-200">
                  {selectedStudent.studentId}
                </span>
                <h3 className="text-base font-bold text-[#101d37] mt-1">{selectedStudent.name}</h3>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/70">
              <div>
                <span className="text-slate-400 block text-[10px]">Email</span>
                <span className="font-medium text-[#101d37] truncate block">{selectedStudent.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone</span>
                <span className="font-medium text-[#101d37]">{selectedStudent.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Destination</span>
                <span className="font-bold text-[#101d37]">{selectedStudent.country}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Target Intake</span>
                <span className="font-bold text-[#087cf5]">{selectedStudent.intake}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[10px]">Academic Program</span>
                <span className="font-semibold text-[#101d37]">{selectedStudent.course}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#101d37]">Document Verification Checklist</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {[
                  { name: 'Passport', status: 'Approved' },
                  { name: '10th Marksheet', status: 'Approved' },
                  { name: '12th Marksheet', status: 'Approved' },
                  { name: 'Graduation Degree', status: 'Approved' },
                  { name: 'IELTS / PTE Result', status: 'Approved' },
                  { name: 'SOP & Resume', status: 'Under Review' },
                  { name: 'Academic LORs', status: 'Pending' },
                  { name: 'Financial Proofs', status: 'Under Review' },
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[#334155] font-medium">{doc.name}</span>
                    <span
                      className={`text-[9.5px] px-1.5 py-0.5 rounded font-bold ${
                        doc.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : doc.status === 'Under Review'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <a
                href={`tel:${selectedStudent.phone.replace(/[^0-9+]/g, '')}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
              >
                Call Student
              </a>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

