import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { sendWhatsApp } from '../../services/api';
import { Lead } from '../../types/crm';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: Lead | null;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  lead,
}) => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lead) {
      setPhone(lead.phone);
      setMessage(
        `Hi ${lead.studentName}! Neha from Study Abroad CRM here. Just following up regarding your study abroad options for ${lead.countryInterest || 'university admissions'}. Let me know if you are free for a quick chat today!`
      );
    } else {
      setPhone('');
      setMessage('Hello! This is Neha from Study Abroad CRM. How can I help you today?');
    }
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendWhatsApp({
        leadId: lead?.id,
        phone,
        message,
      });

      // Also trigger standard web whatsapp URL for real interaction
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch WhatsApp message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-[10px] shadow-2xl border border-[#e5edf5] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 text-xs px-5 py-2 font-medium">
            {error}
          </div>
        )}
        <div className="px-5 py-3.5 border-b border-[#e5edf5] flex items-center justify-between bg-emerald-50/60">

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 fill-[#10b981]" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
            </svg>
            <h2 className="text-[14.5px] font-bold text-[#101d37]">WhatsApp Direct</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded text-[#64748b] hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSend} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="font-semibold block mb-1">Recipient Mobile Number</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Message Content</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2 border rounded outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-[#52627a] hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white rounded font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Open & Send WhatsApp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
