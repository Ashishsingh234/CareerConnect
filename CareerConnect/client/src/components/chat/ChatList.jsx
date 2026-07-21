// components/chat/ChatList.jsx
import React from 'react';
import { FaUserCircle, FaBriefcase, FaCommentDots } from 'react-icons/fa';
import AuthImage from '../../components/common/AuthImage';

export default function ChatList({ chats, onSelect }) {
  const getChatName = (chat) => {
    // Prefer displayName (computed by parent), then name, then fallback
    return chat.displayName || chat.name || 'Unknown Chat';
  }

  return (
    <div className="bg-transparent rounded-3xl flex flex-col h-full bg-white border border-border overflow-hidden">
      {chats.map(chat => (
        <button
          key={chat._id}
          type="button"
          className="w-full text-left p-4 border-b border-border cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-4 group"
          onClick={() => onSelect && onSelect(chat._id)}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && onSelect) { e.preventDefault(); onSelect(chat._id); } }}
          aria-label={`Open chat ${chat.displayName || chat.name || 'conversation'}`}
        >
          {chat.avatar ? (
            <AuthImage src={chat.avatar} alt={chat.displayName || 'Avatar'} className="w-14 h-14 rounded-full object-cover flex-shrink-0 border border-border shadow-sm group-hover:border-brand transition-colors" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-textMuted border border-border shadow-sm group-hover:border-brand group-hover:text-brand transition-colors">
              <FaBriefcase className="text-xl flex-shrink-0" />
            </div>
          )}
          <div className="flex-grow overflow-hidden">
            <div className="font-extrabold text-text truncate group-hover:text-brand transition-colors">{getChatName(chat)}</div>
            <div className="text-sm text-textMuted truncate font-medium mt-0.5">{chat.lastMessage || 'Start conversation...'}</div>
          </div>
        </button>
      ))}
      {chats.length === 0 && <div className="p-8 text-center text-textMuted font-bold bg-gray-50 m-4 rounded-2xl border border-border border-dashed">No active conversations found.</div>}
    </div>
  );
}
