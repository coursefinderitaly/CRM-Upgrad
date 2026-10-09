import React, { useEffect, useState } from 'react';
import { fetchDocuments, updateDocumentStatus } from '../services/api';
import { DocumentItem } from '../types/crm';
import { FileText, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export const DocumentationView: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = () => {
    fetchDocuments()
      .then(setDocuments)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDocumentStatus(id, newStatus);
      loadDocs();
    } catch (err: any) {
      console.error('Failed to update document status:', err);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-[#101d37]">Documentation Verification Portal</h1>
          <p className="text-[11.5px] text-[#52627a]">
            Student credentials, academic transcripts, SOPs, LORs, and passport verifications
          </p>
        </div>
        <div className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
          {documents.length} Required Documents
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#f8fafc] border-b border-[#e5edf5] text-[#52627a] font-bold uppercase text-[11px]">
              <th className="px-3 py-2.5">Document Name</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5">Student Lead</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Verification Notes</th>
              <th className="px-3 py-2.5 text-center">Review Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((doc: any) => (
              <tr key={doc.id} className="hover:bg-slate-50">
                <td className="px-3 py-2.5 font-bold text-[#101d37] flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>{doc.name}</span>
                </td>
                <td className="px-3 py-2.5 text-slate-600">{doc.category}</td>
                <td className="px-3 py-2.5 font-medium text-slate-800">
                  {doc.lead?.studentName || 'Rahul Sharma'}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10.5px] font-semibold ${
                      doc.status === 'Approved' || doc.status === 'Received'
                        ? 'bg-emerald-100 text-emerald-800'
                        : doc.status === 'Under Verification'
                        ? 'bg-amber-100 text-amber-800'
                        : doc.status === 'Requested'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-slate-500 italic max-w-xs truncate">
                  {doc.notes || 'Awaiting officer sign-off'}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleStatusChange(doc.id, 'Approved')}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(doc.id, 'Under Verification')}
                      className="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[11px] font-semibold"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleStatusChange(doc.id, 'Rejected')}
                      className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[11px] font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
