import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProtectedRoute from '../components/common/ProtectedRoute';
import ReferenceComposer from '../components/references/ReferenceComposer';
import { useAuth } from '../context/AuthContext';
import ReferenceCard from '../components/references/ReferenceCard';

export default function References() {
  const [refs, setRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRefs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/references');
      setRefs(res.data);
    } catch (err) {
      console.error('Failed to fetch references', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefs();
  }, []);

  const handleCreated = (newRef) => {
    setRefs(prev => [newRef, ...prev]);
  };

  const handleApplied = (id) => {
    setRefs(prev => prev.map(r => r._id === id ? { ...r, applied: true, applicantsCount: (r.applicantsCount || 0) + 1 } : r));
  };

  return (
    <div className="min-h-screen bg-gray-50/40 py-12 px-4 font-sans pb-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-text tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 bg-brand/10 rounded-xl flex items-center justify-center text-brand text-xl shadow-sm border border-brand/20">#</div>
            References
          </h1>
        </div>

        {user?.role === 'candidate' && (
          <div className="mb-8 animate-fade-in-up">
            <ReferenceComposer onCreated={handleCreated} />
          </div>
        )}

        {loading ? (
          <div className="text-center text-lg text-textMuted font-bold animate-pulse py-10">Loading references...</div>
        ) : (
          <div className="space-y-6 mt-4">
            {refs.length === 0 ? (
              <div className="text-center p-12 bg-white border border-border rounded-3xl shadow-sm">
                <p className="text-text font-bold text-lg">No references yet.</p>
                {user?.role === 'candidate' && <p className="text-textMuted mt-2 font-medium">Create one to get started!</p>}
              </div>
            ) : refs.map(r => (
              <div className="animate-fade-in-up" key={r._id}>
                <ReferenceCard reference={r} onApplied={handleApplied} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
