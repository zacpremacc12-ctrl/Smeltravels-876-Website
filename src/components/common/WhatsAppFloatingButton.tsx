import React, { useState } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const { settings } = useApp();
  const [isOpenTooltip, setIsOpenTooltip] = useState(false);

  if (!settings.whatsappNumber) return null;

  const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const encodedMsg = encodeURIComponent(settings.whatsappMessageTemplate || 'Hi SMELTRAVELS876! I would like more information on your group travel packages.');
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMsg}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Mini Popover */}
      {isOpenTooltip && (
        <div className="mb-3 bg-white rounded-2xl p-4 shadow-2xl border border-neutral-200 text-neutral-800 w-72 animate-in slide-in-from-bottom-2 duration-200 relative">
          <button
            onClick={() => setIsOpenTooltip(false)}
            className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Travel Advisor Online
            </span>
          </div>
          <h4 className="text-sm font-bold font-['Outfit',sans-serif] text-[#2E0249]">
            Chat with SMELTRAVELS876
          </h4>
          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
            Need quick answers about our Panama 2026 trip or 2027 packages? Message us directly on WhatsApp!
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block text-center bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition-colors"
          >
            Start WhatsApp Chat
          </a>
        </div>
      )}

      {/* Button */}
      <div className="flex items-center gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs sm:text-sm py-3 px-4 sm:px-5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
          title="Chat with SMELTRAVELS876 on WhatsApp"
          id="floating-whatsapp-btn"
        >
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="hidden sm:inline">Message SMELTRAVELS876</span>
          <span className="sm:hidden">Chat</span>
        </a>

        <button
          onClick={() => setIsOpenTooltip(!isOpenTooltip)}
          className="w-7 h-7 rounded-full bg-white text-neutral-500 border border-neutral-300 shadow-md flex items-center justify-center text-xs hover:bg-neutral-100"
          title="Toggle info"
        >
          ?
        </button>
      </div>
    </div>
  );
};
