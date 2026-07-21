import React, { useState } from 'react';
import api from '../../services/api';
import chatService from '../../services/chatService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ReferenceCard({ reference, onApplied }) {
  const [applying, setApplying] = useState(false);
  const [appliedState, setAppliedState] = useState(Boolean(reference.applied));
  const [appCount, setAppCount] = useState(reference.applicantsCount || (reference.applicants ? reference.applicants.length : 0));
  const navigate = useNavigate();
  const { user } = useAuth();

  const normalizeUrl = (url) => {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  // resolve author id (could be populated object or just an id string)
  const authorId = reference.author ? (reference.author._id ? String(reference.author._id) : String(reference.author)) : null;
  const currentUserId = user ? (user.id || user._id || user._id) : null;

  const apply = async () => {
    try {
      setApplying(true);
      await api.post(`/references/${reference._id}/apply`);
      setAppliedState(true);
      setAppCount(c => c + 1);
      if (onApplied) onApplied(reference._id);
      // After applying, create or get chat with reference author and redirect to chat
      try {
        const partnerId = reference.author && (reference.author._id || reference.author);
        if (partnerId) {
          const chat = await chatService.createChat({ referenceId: reference._id, partnerId });
          navigate(`/chats/${chat._id}`);
          return;
        }
      } catch (err) {
        console.error('Failed to create/open chat', err);
      }
      alert('Applied successfully');
    } catch (err) {
      console.error('Apply failed', err);
      alert(err.response?.data?.message || 'Apply failed');
    } finally {
      setApplying(false);
    }
  };

  const isAuthor = currentUserId && authorId ? String(currentUserId) === String(authorId) : false;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-border flex flex-col md:flex-row justify-between items-start gap-5 transition-all hover:shadow-soft">
      <div className="flex-1">
        <h3 className="font-extrabold text-lg text-text tracking-tight">{reference.title}</h3>
        <p className="text-sm font-semibold text-textMuted mb-2">by {reference.author?.name || reference.author?.email || 'Unknown'}</p>
        <p className="mt-1 text-text font-medium leading-relaxed">{reference.description}</p>

        {reference.skills && reference.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {reference.skills.map((s, i) => (
              <span key={i} className="inline-block bg-brand/10 text-brand px-2.5 py-1 rounded-lg text-sm font-bold border border-brand/20">{s}</span>
            ))}
          </div>
        )}

        {reference.externalLink && (
          <div className="mt-4">
            <a href={normalizeUrl(reference.externalLink)} target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand/80 transition-colors font-bold text-sm flex items-center gap-1">Open external link ↗</a>
          </div>
        )}
      </div>
      <div className="text-right flex-shrink-0 bg-gray-50 p-4 rounded-xl border border-border flex flex-col items-center justify-center min-w-[120px]">
        <div className="mb-2 text-xs font-bold text-textMuted uppercase tracking-widest">Applicants</div>
        <div className="mb-3 text-2xl font-extrabold text-text">{appCount}</div>
        <button onClick={apply} disabled={applying || appliedState || isAuthor} className={`w-full px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${appliedState ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-not-allowed' : applying ? 'bg-gray-200 text-textMuted cursor-not-allowed' : isAuthor ? 'bg-gray-100 text-textMuted cursor-not-allowed border border-border' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>
          {applying ? 'Applying...' : (appliedState ? 'Applied' : isAuthor ? 'Your Ref' : 'Apply')}
        </button>
      </div>
    </div>
  );
}
