import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Loader from '../components/common/Loader';
import AuthImage from '../components/common/AuthImage';
import PostCard from '../components/common/PostCard';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [references, setReferences] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // posts by default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    Promise.all([
      api.get(`/profiles/${id}`),
      api.get('/posts')
    ]).then(([profileRes, postsRes]) => {
      setProfile(profileRes.data);
      const p = postsRes.data.filter(p => String(p.author?._id || p.author) === String(id));
      setPosts(p);
      // references come from profileRes
      setReferences(profileRes.data.references || []);
    }).catch(err => {
      console.error('Failed to load profile', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!profile) return <div className="p-4">Profile not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50/40 px-4 py-12 font-sans pb-20">
      <div className="max-w-4xl mx-auto space-y-8">

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-soft relative overflow-hidden flex flex-col md:flex-row items-center gap-6 md:gap-8 text-center md:text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full mix-blend-multiply filter blur-[80px]"></div>

          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-50 border border-border shadow-sm flex-shrink-0 p-1 relative z-10">
            {profile.profileImageUrl ? (
              <AuthImage src={profile.profileImageUrl} alt={profile.user?.name || 'User'} className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300 rounded-full bg-white">
                {(profile.user?.name || 'U').charAt(0)}
              </div>
            )}
          </div>
          <div className="relative z-10 flex-1">
            <h2 className="text-3xl font-extrabold text-text tracking-tight mb-2">{profile.user?.name}</h2>
            {profile.location && <div className="text-textMuted font-semibold mb-3 flex items-center justify-center md:justify-start gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {profile.location}</div>}
            {profile.bio && <p className="text-text mt-2 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border border-border">{profile.bio}</p>}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="flex flex-wrap gap-2 p-3 border-b border-border bg-gray-50/50">
            <button onClick={() => setActiveTab('posts')} className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'posts' ? 'bg-white text-text border border-border' : 'bg-transparent text-textMuted hover:text-text hover:bg-gray-100'}`}>Posts ({posts.length})</button>
            <button onClick={() => setActiveTab('references')} className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === 'references' ? 'bg-white text-text border border-border' : 'bg-transparent text-textMuted hover:text-text hover:bg-gray-100'}`}>References ({references.length})</button>
          </div>

          <div className="p-6 md:p-8 bg-white">
            {activeTab === 'references' ? (
              <div className="space-y-4">
                {references.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {references.map(r => (
                      <div key={r._id} className="p-5 bg-gray-50 rounded-2xl border border-border shadow-sm flex flex-col gap-2">
                        <div className="font-bold text-text text-lg">{r.title}</div>
                        <div className="text-sm font-medium text-textMuted">{r.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-12 bg-gray-50 border border-border border-dashed rounded-2xl">
                    <p className="text-textMuted font-medium">No references provided.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  <div className="text-center p-12 bg-gray-50 border border-border border-dashed rounded-2xl">
                    <p className="text-textMuted font-medium">No posts yet.</p>
                  </div>
                ) : (
                  posts.map(p => <PostCard key={p._id} post={p} />)
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
