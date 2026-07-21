import React, { useState } from 'react';
import api from '../../services/api';

export default function ReferenceComposer({ onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = { title, description, skills: skills.split(',').map(s => s.trim()).filter(Boolean), externalLink: externalLink || undefined };
      const res = await api.post('/references', payload);
      setTitle(''); setDescription(''); setSkills('');
      setExternalLink('');
      if (onCreated) onCreated(res.data);
    } catch (err) {
      console.error('Failed to create reference', err);
      alert(err.response?.data?.message || 'Failed to create');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded-3xl shadow-soft border border-border">
      <div className="mb-4">
        <label className="text-text font-bold mb-2 block text-sm">Reference Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Seeking Frontend Role" required className="input-field" />
      </div>
      <div className="mb-4">
        <label className="text-text font-bold mb-2 block text-sm">Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide details about the reference or what you are looking for..." className="input-field resize-none h-24" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-text font-bold mb-2 block text-sm">Tags / Skills</label>
          <input value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node, UI/UX (comma separated)" className="input-field" />
        </div>
        <div>
          <label className="text-text font-bold mb-2 block text-sm">External Link (Optional)</label>
          <input value={externalLink} onChange={e => setExternalLink(e.target.value)} placeholder="https://..." className="input-field" />
        </div>
      </div>
      <div className="text-right mt-6 border-t border-border pt-4">
        <button type="submit" disabled={loading} className="btn-primary py-2.5 px-6 shadow-sm disabled:opacity-50">
          {loading ? 'Posting...' : 'Post Reference'}
        </button>
      </div>
    </form>
  );
}
