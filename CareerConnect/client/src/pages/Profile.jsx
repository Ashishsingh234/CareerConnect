import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../services/api';
import Loader from '../components/common/Loader';
import { FaUserEdit, FaUserCircle, FaCheck, FaTimes, FaUpload, FaFilePdf, FaEnvelope, FaMapMarkerAlt, FaGraduationCap, FaCode, FaLinkedin, FaGithub, FaGlobe, FaTrash } from 'react-icons/fa';
import uploadService from '../services/uploadService';
import AuthImage from '../components/common/AuthImage';
import postService from '../services/postService';
import PostCard from '../components/common/PostCard';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', skills: '', location: '',
    education: [], experience: [], phone: '',
    socialLinks: { linkedin: '', github: '', portfolio: '' }
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  // Normalize external URLs so they open directly instead of as relative links
  const normalizeUrl = (url) => {
    if (!url) return url;
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const fetchProfile = async () => {
    if (user?.role !== 'candidate') return;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/profiles/me');
      const data = res.data;
      setProfile(data);

      // Only populate the editable form when we're NOT currently editing.
      // This prevents background fetches from clobbering user input while editing.
      if (!editMode) {
        setForm(f => ({
          ...f, // Keep existing socialLinks/other fields if not provided by server
          name: user.name || '',
          email: user.email || '',
          skills: data.skills?.join(', ') || '',
          location: data.location || '',
          education: data.education || [],
          experience: data.experience || [],
          phone: data.phone || '',
          // Ensure socialLinks is always a valid object when setting form state
          socialLinks: data.socialLinks || { linkedin: '', github: '', portfolio: '' }
        }));
      }
      // prefer server-provided public URLs
      const merged = { ...data, resumeUrl: data.resumeUrl || null, profileImageUrl: data.profileImageUrl || null };
      setProfile(merged);
      // update AuthContext so other components (Navbar) can show the avatar
      try { updateUser?.({ profileImageUrl: merged.profileImageUrl, resumeUrl: merged.resumeUrl }); } catch (e) { /* ignore */ }
    } catch (err) {
      setError('Failed to fetch profile details.'); // Profile details laane mein nakamyab
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
    loadMyPosts();
  }, [user]);

  const loadMyPosts = async () => {
    try {
      // NOTE: list() fetches all posts, we filter by author ID client-side
      const posts = await postService.list();
      const mine = posts.filter(p => String(p.author?._id || p.author?.id) === String(user?.id || user?._id));
      setMyPosts(mine);
    } catch (err) { console.error('Failed to load posts', err); }
  };

  const handleChange = e => {
    const { name, value } = e.target;

    if (name.startsWith('socialLinks.')) {
      const socialField = name.split('.')[1];
      setForm(f => {
        const updatedSocialLinks = { ...(f.socialLinks || {}), [socialField]: value };
        return { ...f, socialLinks: updatedSocialLinks };
      });
    } else {
      // This generic handler is kept for non-nested fields (name, location, skills, phone)
      setForm(f => ({ ...f, [name]: value }));
    }
    setSuccess(null);
    setError(null);
  };

  // Helpers to update education[0] and experience[0] fields
  const setEducationField = (field, value) => {
    setForm(f => {
      const ed = Array.isArray(f.education) ? [...f.education] : [];
      if (!ed[0]) ed[0] = {};
      ed[0] = { ...ed[0], [field]: value };
      return { ...f, education: ed };
    });
    setSuccess(null); setError(null);
  };

  const setExperienceField = (field, value) => {
    setForm(f => {
      const ex = Array.isArray(f.experience) ? [...f.experience] : [];
      if (!ex[0]) ex[0] = {};
      ex[0] = { ...ex[0], [field]: value };
      return { ...f, experience: ex };
    });
    setSuccess(null); setError(null);
  };

  // FIX: Removed the redundant setSocialField as we are now relying on generic handleChange
  // We re-added the nested logic to handleChange instead.

  const handleResumeUpload = async () => {
    if (!resumeFile) return;
    setLoading(true);
    setError(null);
    try {
      // Calls the correct upload service method
      await uploadService.uploadResume(resumeFile);
      setResumeFile(null);
      setSuccess('Resume uploaded successfully!'); // Resume safaltapoorvak upload ho gaya
      await fetchProfile(); // Re-fetch profile to get the new resumeFileId
    } catch (err) {
      setError('Failed to upload resume. File size limit or server error.'); // Resume upload karne mein nakamyab
    }
    setLoading(false);
  };

  const handleProfileImageSelect = (file) => {
    setProfileImageFile(file);
    if (file) setProfileImagePreview(URL.createObjectURL(file));
    else setProfileImagePreview(null);
  };

  const handleProfileImageUpload = async () => {
    if (!profileImageFile) return;
    setLoading(true);
    setError(null);
    try {
      const uploaded = await uploadService.uploadProfileImage(profileImageFile);
      // Attach the uploaded image id to profile via existing endpoint
      await axios.put('/profiles/me', { profileImageId: uploaded.id || uploaded._id || uploaded.fileId });
      setProfileImageFile(null);
      setProfileImagePreview(null);
      setSuccess('Profile image updated'); // Profile image update ho gayi
      await fetchProfile();
    } catch (err) {
      console.error('Profile image upload failed', err);
      setError('Failed to upload profile image.'); // Profile image upload karne mein nakamyab
    }
    setLoading(false);
  };

  const handleRemoveProfileImage = async () => {
    if (!profile?.profileImageId) return;
    setLoading(true);
    setError(null);
    try {
      await axios.put('/profiles/me', { profileImageId: null });
      setSuccess('Profile image removed'); // Profile image hata di gayi
      await fetchProfile();
    } catch (err) {
      setError('Failed to remove profile image.'); // Profile image hatane mein nakamyab
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    // Validate phone for candidate: required and exactly 10 digits
    if (!form.phone) {
      setError('Phone is required'); // Phone zaroori hai
      setLoading(false);
      return;
    }
    const digits = String(form.phone).replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Phone must be numeric and exactly 10 digits'); // Phone 10 ank ka hona chahiye
      setLoading(false);
      return;
    }
    // normalize before sending
    const normalizedForm = { ...form, phone: digits };
    try {
      // The entire 'form' state is sent, which includes the updated 'socialLinks' object
      await axios.put('/profiles/me', {
        ...normalizedForm,
        skills: form.skills.split(',').map(s => s.trim()).filter(s => s)
      });

      if (form.name !== user.name) {
        // Update AuthContext and persist to localStorage
        try { updateUser?.({ name: form.name }); } catch (e) { /* ignore */ }
      }
      setEditMode(false);
      setSuccess('Profile saved successfully!'); // Profile safaltapoorvak save ho gayi
      setLoading(false);
      await fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile changes.'); // Profile mein badlav save karne mein nakamyab
      setLoading(false);
    }
  };

  if (loading && !profile) return <div className="min-h-screen bg-background flex justify-center items-center"><Loader /></div>;
  if (!user || user?.role !== 'candidate') return <div className="min-h-screen bg-background p-8 text-pink-500 text-center font-medium">Only candidates have access to this profile page.</div>; // Keval candidates ke paas is profile page ka access hai.

  return (
    <div className="min-h-screen bg-gray-50/40 px-4 py-12 font-sans pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white mb-8 p-6 md:p-8 border border-border rounded-3xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full mix-blend-multiply filter blur-[80px]"></div>

          <div className="relative z-10 flex items-center gap-5 mb-4 md:mb-0">
            <div className="w-16 h-16 bg-brand/10 rounded-2xl flex items-center justify-center text-brand text-3xl shadow-sm border border-brand/20"><FaUserEdit /></div>
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text tracking-tight">Candidate Profile</h2>
              <p className="text-textMuted font-medium mt-1">Manage your personal information, resume, and skills.</p>
            </div>
          </div>

          <button
            onClick={() => { setEditMode(!editMode); setSuccess(null); setError(null); }}
            className={`relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${editMode ? 'bg-gray-100 text-text border border-border hover:bg-gray-200' : 'btn-primary'}`}
          >
            {editMode ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {(error || success) && (
          <div className={`p-4 rounded-xl mb-8 font-bold text-sm flex items-center justify-between border shadow-sm ${error ? 'text-red-600 border-red-200 bg-red-50' : 'text-emerald-700 border-emerald-200 bg-emerald-50'}`}>
            {error || success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Personal Info & Resume - Baayan Column: Vyaktigat Jaankari aur Resume */}
          <div className="lg:col-span-1 flex flex-col gap-8">

            {/* Personal Info Card - Vyaktigat Jaankari Card */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-soft relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full filter blur-[40px]"></div>
              <h3 className="text-xl font-bold mb-6 text-text flex items-center gap-2 relative z-10 tracking-tight"><div className="w-1.5 h-6 bg-brand rounded-full"></div> Contact & Location</h3>

              {editMode ? (
                <div className="relative z-10">
                  <div className="mb-8 text-center">
                    <div className="mx-auto w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-border shadow-sm mb-4 relative group">
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="preview" className="w-full h-full object-cover" />
                      ) : profile?.profileImageUrl ? (
                        <AuthImage src={profile.profileImageUrl} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <FaUserCircle className="text-6xl text-gray-300 group-hover:text-brand transition-colors" />
                      )}
                    </div>
                    <div className="flex flex-col gap-3">
                      <input id="profile-image-input" type="file" accept="image/*" className="hidden" onChange={e => handleProfileImageSelect(e.target.files[0])} />
                      <label htmlFor="profile-image-input" className="px-4 py-2 bg-white border border-border text-text rounded-xl cursor-pointer hover:bg-gray-50 transition-colors font-bold text-sm shadow-sm">Choose Image</label>
                      <div className="flex gap-2">
                        {profileImageFile && <button type="button" onClick={handleProfileImageUpload} className="flex-1 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors font-bold text-sm shadow-sm">Upload</button>}
                        {profile?.profileImageId && <button type="button" onClick={handleRemoveProfileImage} className="flex-1 px-3 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors font-bold text-sm shadow-sm"><FaTrash /> Remove</button>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-textMuted text-xs font-bold uppercase tracking-widest mb-2 block">Full Name</label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="input-field" />
                    </div>
                    <div>
                      <label className="text-textMuted text-xs font-bold uppercase tracking-widest mb-2 block">Location</label>
                      <input name="location" value={form.location} onChange={handleChange} placeholder="Location" className="input-field" />
                    </div>
                    <div>
                      <label className="text-textMuted text-xs font-bold uppercase tracking-widest mb-2 block">Phone</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={e => {
                          const digits = (e.target.value || '').replace(/\D/g, '').slice(0, 10);
                          setForm(f => ({ ...f, phone: digits }));
                        }}
                        placeholder="Phone"
                        inputMode="numeric"
                        pattern="\d*"
                        maxLength={10}
                        className="input-field"
                      />
                    </div>
                    <div className="pt-2 flex items-center gap-3 text-textMuted font-medium text-sm"><div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-brand border border-border"><FaEnvelope /></div> {user.email} <span className="text-[10px] bg-gray-100 border border-border px-2 py-0.5 rounded-md text-textMuted font-bold">FIXED</span></div>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-center md:text-left">
                  <div className="mb-6 flex flex-col md:flex-row items-center gap-6">
                    <div className="w-28 h-28 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border border-border shadow-sm flex-shrink-0 p-1">
                      {profile?.profileImageUrl ? (
                        <AuthImage src={profile.profileImageUrl} alt="avatar" className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <FaUserCircle className="text-6xl text-gray-300" />
                      )}
                    </div>
                    <div>
                      <div className="text-2xl font-extrabold text-text mb-1 tracking-tight">{user.name}</div>
                      <div className="text-sm font-bold text-brand uppercase tracking-widest mb-3">Candidate</div>
                    </div>
                  </div>

                  <div className="space-y-4 border-t border-border pt-6 text-left">
                    <div className="flex items-center gap-4 text-text"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand border border-border shadow-sm"><FaEnvelope /></div> <span className="font-semibold">{user.email}</span></div>
                    <div className="flex items-center gap-4 text-text"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand border border-border shadow-sm"><FaMapMarkerAlt /></div> <span className="font-semibold">{form.location || <span className="text-textMuted italic font-normal">Not set</span>}</span></div>
                    <div className="flex items-center gap-4 text-text"><div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-brand border border-border shadow-sm font-bold">#</div> <span className="font-semibold">{form.phone ? form.phone : <span className="text-textMuted italic font-normal">Not set</span>}</span></div>
                  </div>
                </div>
              )}
            </div>

            {/* Resume Upload Card */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-soft">
              <h3 className="text-xl font-bold mb-6 text-text flex items-center gap-2 tracking-tight"><div className="w-1.5 h-6 bg-purple-500 rounded-full"></div> Resume Management</h3>

              <div className="mb-6 p-5 rounded-xl border border-border bg-gray-50 shadow-sm">
                <label className="text-textMuted text-xs font-bold uppercase tracking-widest mb-3 block">Current Status</label>
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 font-bold ${profile?.resumeFileId ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${profile?.resumeFileId ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}><FaFilePdf className="text-xl" /></div>
                  {profile?.resumeFileId ? 'Resume Active & Ready' : 'No Resume Uploaded'}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-text font-bold block text-sm">Upload New Document (PDF/DOCX)</label>
                <input id="resume-upload" type="file" onChange={e => setResumeFile(e.target.files[0])} className="w-full text-sm text-textMuted file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border file:border-border file:shadow-sm file:text-sm file:font-bold file:bg-white file:text-text hover:file:bg-gray-50 transition-colors cursor-pointer" accept=".pdf,.doc,.docx" />

                {resumeFile && (
                  <div className="mt-5 flex flex-col gap-3 p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
                    <span className="text-sm font-semibold text-amber-700 break-all"><span className="font-extrabold text-amber-800">Ready:</span> {resumeFile.name}</span>
                    <button onClick={handleResumeUpload} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 mt-2">
                      <FaUpload /> Upload Now
                    </button>
                  </div>
                )}
              </div>

              {profile?.resumeFileId && (
                <button onClick={async () => {
                  try {
                    const uploadServiceModule = await import('../services/uploadService');
                    const blob = await uploadServiceModule.default.downloadFile(profile.resumeFileId);
                    const url = window.URL.createObjectURL(blob);
                    window.open(url, '_blank');
                  } catch (err) {
                    console.error('Failed to download resume', err);
                    setSuccess('Failed to download resume. Check console for details.');
                  }
                }} className="mt-6 w-full py-3.5 bg-white hover:bg-gray-50 text-text font-bold rounded-xl border border-border transition-all flex items-center justify-center gap-2 shadow-sm">
                  <FaFilePdf size={18} className="text-red-500" /> View Current Document
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Skills, Education, Social - Daayan Column: Kaushal, Shiksha, Social */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Skills Card - Kaushal Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-soft">
              <h3 className="text-2xl font-bold mb-6 text-text flex items-center gap-3 tracking-tight"><div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-500"><FaCode /></div> Core Competencies</h3>
              {editMode ? (
                <div>
                  <label className="form-label">Skills (Comma Separated)</label>
                  <textarea name="skills" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB, AWS" rows="3" className="input-field resize-none" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-3 mt-2">
                  {form.skills.split(',').map(s => s.trim()).filter(s => s).map((skill, i) => (
                    <span key={i} className="bg-gray-50 border border-border text-text text-sm font-bold px-4 py-2 rounded-xl shadow-sm cursor-default">{skill}</span>
                  ))}
                  {form.skills.length === 0 && <div className="p-5 bg-gray-50 border border-border border-dashed rounded-xl text-textMuted font-medium w-full text-center">No skills added yet. Switch to edit mode to add some.</div>}
                </div>
              )}
            </div>

            {/* Education/Experience Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-soft">
              <h3 className="text-2xl font-bold mb-6 text-text flex items-center gap-3 tracking-tight"><div className="w-12 h-12 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-center text-purple-500"><FaGraduationCap /></div> Background</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="bg-gray-50 p-6 rounded-2xl border border-border shadow-sm">
                  <div className="text-textMuted text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>Highest Education</div>
                  {editMode ? (
                    <input value={form.education[0]?.degree || ''} onChange={e => setEducationField('degree', e.target.value)} placeholder="e.g., B.Tech in Computer Science" className="input-field mt-1" />
                  ) : (
                    <div className="text-lg font-extrabold text-text mt-1">{form.education[0]?.degree || <span className="text-textMuted font-medium italic">Not specified</span>}</div>
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-border shadow-sm">
                  <div className="text-textMuted text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>Current / Latest Role</div>
                  {editMode ? (
                    <input value={form.experience[0]?.title || ''} onChange={e => setExperienceField('title', e.target.value)} placeholder="e.g., Senior Developer" className="input-field mt-1" />
                  ) : (
                    <div className="text-lg font-extrabold text-text mt-1">{form.experience[0]?.title || <span className="text-textMuted font-medium italic">Not specified</span>}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-border shadow-soft">
              <h3 className="text-2xl font-bold mb-6 text-text flex items-center gap-3 tracking-tight"><div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-500"><FaGlobe /></div> Web Presence</h3>
              {editMode ? (
                <div className="space-y-6 bg-gray-50 p-6 md:p-8 rounded-2xl border border-border shadow-sm">
                  <div>
                    <label className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaLinkedin className="text-blue-600 text-lg" /> LinkedIn Profile</label>
                    <input
                      name="socialLinks.linkedin"
                      value={form.socialLinks?.linkedin || ''}
                      onChange={handleChange}
                      onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                      placeholder="https://linkedin.com/in/..."
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaGithub className="text-gray-800 text-lg" /> GitHub Profile</label>
                    <input
                      name="socialLinks.github"
                      value={form.socialLinks?.github || ''}
                      onChange={handleChange}
                      onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                      placeholder="https://github.com/..."
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="text-text font-bold mb-2 flex items-center gap-2 text-sm"><FaGlobe className="text-emerald-500 text-lg" /> Personal Portfolio</label>
                    <input
                      name="socialLinks.portfolio"
                      value={form.socialLinks?.portfolio || ''}
                      onChange={handleChange}
                      onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}
                      placeholder="https://yourwebsite.com"
                      className="input-field"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-5 mt-2">
                  {form.socialLinks?.linkedin ? (
                    <a href={normalizeUrl(form.socialLinks.linkedin)} target="_blank" rel="noopener noreferrer" className="flex-1 p-5 bg-white border border-border shadow-sm rounded-2xl hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
                      <FaLinkedin className="text-4xl text-blue-100 group-hover:text-blue-600 transition-colors drop-shadow-sm" />
                      <span className="font-extrabold text-text group-hover:text-blue-600 transition-colors">LinkedIn</span>
                    </a>
                  ) : (
                    <div className="flex-1 p-5 bg-gray-50 border border-border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 opacity-60"><FaLinkedin className="text-4xl text-gray-300" /><span className="text-textMuted font-semibold text-sm">Not provided</span></div>
                  )}

                  {form.socialLinks?.github ? (
                    <a href={normalizeUrl(form.socialLinks.github)} target="_blank" rel="noopener noreferrer" className="flex-1 p-5 bg-white border border-border shadow-sm rounded-2xl hover:border-gray-400 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
                      <FaGithub className="text-4xl text-gray-200 group-hover:text-gray-900 transition-colors drop-shadow-sm" />
                      <span className="font-extrabold text-text group-hover:text-gray-900 transition-colors">GitHub</span>
                    </a>
                  ) : (
                    <div className="flex-1 p-5 bg-gray-50 border border-border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 opacity-60"><FaGithub className="text-4xl text-gray-300" /><span className="text-textMuted font-semibold text-sm">Not provided</span></div>
                  )}

                  {form.socialLinks?.portfolio ? (
                    <a href={normalizeUrl(form.socialLinks.portfolio)} target="_blank" rel="noopener noreferrer" className="flex-1 p-5 bg-white border border-border shadow-sm rounded-2xl hover:border-emerald-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 group">
                      <FaGlobe className="text-4xl text-emerald-100 group-hover:text-emerald-500 transition-colors drop-shadow-sm" />
                      <span className="font-extrabold text-text group-hover:text-emerald-600 transition-colors">Portfolio</span>
                    </a>
                  ) : (
                    <div className="flex-1 p-5 bg-gray-50 border border-border border-dashed rounded-2xl flex flex-col items-center justify-center gap-3 opacity-60"><FaGlobe className="text-4xl text-gray-300" /><span className="text-textMuted font-semibold text-sm">Not provided</span></div>
                  )}
                </div>
              )}
            </div>

            {editMode && (
              <div className="mt-4 flex flex-col sm:flex-row gap-4 p-8 bg-white border border-border shadow-soft rounded-3xl">
                <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2 bg-brand text-white px-6 py-4 rounded-xl font-extrabold hover:bg-brand/90 transition-all text-lg shadow-sm"><FaCheck /> Save All Changes</button>
                <button onClick={() => setEditMode(false)} className="flex-1 flex items-center justify-center gap-2 bg-gray-50 text-text border border-border px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all text-lg shadow-sm"><FaTimes /> Cancel Editing</button>
              </div>
            )}

            {/* User's Posts */}
            {!editMode && (
              <div className="mt-2 bg-white p-6 md:p-8 rounded-3xl border border-border shadow-soft">
                <h3 className="text-2xl font-bold mb-6 text-text border-b border-border pb-5 tracking-tight">Your Career Posts</h3>
                <div className="space-y-6 mt-6">
                  {myPosts.length === 0 ? (
                    <div className="p-10 bg-gray-50 border border-border border-dashed rounded-2xl text-center shadow-sm">
                      <div className="text-5xl text-gray-300 mb-4 flex justify-center"><FaUserEdit /></div>
                      <p className="text-text font-bold text-lg">You haven't published any posts yet.</p>
                      <p className="text-sm text-textMuted mt-2 font-medium">Share your career updates or questions with the community!</p>
                    </div>
                  ) : (
                    myPosts.map(p => <PostCard key={p._id} post={p} onUpdated={loadMyPosts} />)
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;