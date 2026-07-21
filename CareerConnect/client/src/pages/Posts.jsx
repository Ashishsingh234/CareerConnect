import React, { useEffect, useState } from 'react';
import postService from '../services/postService';
import PostComposer from '../components/common/PostComposer';
import PostCard from '../components/common/PostCard';


export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await postService.list();
      setPosts(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="min-h-screen bg-gray-50/40 py-12 px-4 font-sans pb-20">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="animate-fade-in-up">
          <PostComposer onPosted={load} />
        </div>

        {loading ? (
          <div className="text-center text-lg text-textMuted font-bold animate-pulse py-10">Loading posts...</div>
        ) : (
          <div className="space-y-6">
            {posts.map((p, idx) => (
              <div key={p._id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 80, 500)}ms` }}>
                <PostCard post={p} onUpdated={load} />
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center p-12 bg-white border border-border rounded-3xl shadow-sm">
                <p className="text-text font-bold text-lg">No posts to show.</p>
                <p className="text-textMuted mt-2 font-medium">Be the first to share something!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
