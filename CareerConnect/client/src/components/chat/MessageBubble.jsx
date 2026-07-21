// components/chat/MessageBubble.jsx
import React from 'react';
import AuthImage from '../common/AuthImage';
// Removed FaClock icon per UX request (timestamp text kept)

export default function MessageBubble({ sender, text, createdAt, isOwn = false }) {
  // Extract details from the populated sender object
  const senderName = sender?.name || 'Unknown User';
  const senderRole = sender?.role || 'user';
  const senderAvatar = sender?.profileImageUrl || sender?.companyLogoUrl || sender?.avatar || null;

  // Color mapping: candidates purple, others emerald
  const nameColorClass = senderRole === 'candidate' ? 'text-brand' : 'text-emerald-600';

  return (
    <div className={`mb-4 flex items-end ${isOwn ? 'justify-end' : 'justify-start'} group w-full`}>
      {/* Avatar on the left for incoming messages */}
      {!isOwn && (
        <div className="mr-3 flex-shrink-0">
          {senderAvatar ? (
            <AuthImage src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full object-cover shadow-sm border border-border" fallback={<div className="w-10 h-10 rounded-full bg-gray-100 border border-border flex items-center justify-center text-textMuted font-bold">{(senderName || 'U').charAt(0).toUpperCase()}</div>} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-border flex items-center justify-center text-textMuted font-bold">{(senderName || 'U').charAt(0).toUpperCase()}</div>
          )}
        </div>
      )}

      <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm ${isOwn ? 'bg-brand text-white rounded-br-sm border border-brand/20' : 'bg-gray-50 text-text border border-border rounded-tl-sm'}`}>
        {!isOwn && <div className={`text-xs font-extrabold mb-1 tracking-tight ${nameColorClass}`}>{senderName} <span className="text-textMuted opacity-80 text-[10px] ml-1 uppercase tracking-widest">{senderRole}</span></div>}
        <div className="whitespace-pre-wrap text-[15px] leading-relaxed font-medium">{text}</div>
        <div className={`text-[11px] mt-2 font-mono flex items-center justify-end font-bold ${isOwn ? 'text-blue-100/80' : 'text-textMuted'}`}>
          {createdAt && new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {isOwn && (
        <div className="ml-3 flex-shrink-0">
          {senderAvatar ? (
            <AuthImage src={senderAvatar} alt={senderName} className="w-10 h-10 rounded-full object-cover shadow-sm border border-brand/20" fallback={<div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold">{(senderName || 'U').charAt(0).toUpperCase()}</div>} />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand font-bold">{(senderName || 'U').charAt(0).toUpperCase()}</div>
          )}
        </div>
      )}
    </div>
  );
}