import React, { useState } from 'react';
import AuthImage from './AuthImage';
import { FaThumbsUp, FaRegComment } from 'react-icons/fa';
import postService from '../../services/postService';
import { useNavigate } from 'react-router-dom';

export default function PostCard({ post, onUpdated }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);

  const handleLike = async () => {
    try {
      const res = await postService.toggleLike(post._id);
      setLikes(res.likes);
      setLiked(res.liked);
    } catch (err) { console.error('Like failed', err); }
  };

  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await postService.addComment(post._id, commentText.trim());
      // res is populated post with comments
      setComments(res.comments || []);
      setCommentText('');
      setShowComments(true);
      onUpdated?.();
    } catch (err) { console.error('Comment failed', err); }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-border mb-6 overflow-hidden transition-all hover:shadow-soft">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <AuthorBlock post={post} />
          {post.category && post.category !== 'General' && (
            <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-sm border ${post.category === 'Announcement' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                post.category === 'Hiring' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  post.category === 'Milestone' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
              {post.category === 'Announcement' ? <FaBullhorn /> :
                post.category === 'Hiring' ? <FaRocket /> :
                  post.category === 'Milestone' ? <FaTrophy /> :
                    <FaEdit />}
              {post.category}
            </div>
          )}
        </div>
        <div className="whitespace-pre-wrap text-text font-medium leading-relaxed mt-2">{post.content}</div>
      </div>

      {post.imageUrl && (
        <div className="w-full bg-gray-50 flex items-center justify-center border-t border-b border-border">
          <AuthImage src={post.imageUrl} alt="post image" className="w-full max-h-[500px] object-contain" />
        </div>
      )}

      <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm ${liked ? 'bg-brand text-white' : 'bg-white text-textMuted border border-border hover:bg-gray-50 hover:text-text'}`}>
            <FaThumbsUp className={liked ? "scale-110 transition-transform" : ""} /> <span>{likes}</span>
          </button>
          <button onClick={() => setShowComments(s => !s)} className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all shadow-sm bg-white text-textMuted border border-border hover:bg-gray-50 hover:text-text">
            <FaRegComment /> <span>{comments.length}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="p-5 border-t border-border bg-gray-50/30 animate-fade-in">
          <div className="space-y-4 mb-5">
            {comments.map((c, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-border flex items-center justify-center shadow-sm flex-shrink-0">
                  {c.authorProfileImageUrl ? <AuthImage src={c.authorProfileImageUrl} alt="av" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-textMuted">{(c.author?.name?.[0] || 'U')}</span>}
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-border inline-block max-w-[85%]">
                  <div className="text-sm font-extrabold text-text tracking-tight mb-0.5">{c.author?.name || 'Unknown'}</div>
                  <div className="text-sm text-textMuted font-medium leading-snug">{c.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <input value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 input-field py-2 px-4 rounded-xl text-sm" placeholder="Write a comment..." />
            <button onClick={submitComment} className="btn-primary py-2 px-5 rounded-xl shadow-sm shrink-0 whitespace-nowrap">Post</button>
          </div>
        </div>
      )}
    </div>
  );
}

function AuthorBlock({ post }) {
  const navigate = useNavigate();
  const author = post.author || {};

  const goToProfile = () => {
    // If author has a role 'candidate' show candidate profile, else go to company profile
    if (author.role === 'candidate' || !author.role) {
      navigate(`/users/${author._id || author}`);
    } else {
      // company or hr
      const companyId = author.company || (post.company && post.company._id);
      if (companyId) navigate(`/companies/${companyId}`);
    }
  };

  return (
    <div className="flex items-center gap-3 cursor-pointer group" onClick={goToProfile}>
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center border border-border shadow-sm group-hover:ring-2 group-hover:ring-brand/30 transition-all">
        {author?.profileImageUrl ? (
          <AuthImage src={author.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : author?.companyLogoUrl ? (
          <AuthImage src={author.companyLogoUrl} alt="company" className="w-full h-full object-cover" />
        ) : <span className="text-lg font-bold text-textMuted">{(author?.name?.[0] || 'U')}</span>}
      </div>
      <div>
        <div className="font-extrabold text-text tracking-tight group-hover:text-brand transition-colors">{author?.companyName || author?.name || 'Unknown'}</div>
        <div className="text-xs font-semibold text-textMuted mt-0.5">{new Date(post.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
}
