import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import applicationService from '../services/applicationService';
import jobService from '../services/jobService';
import Loader from '../components/common/Loader';
import { FaBriefcase, FaComments, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFilePdf, FaUser, FaBookmark, FaBuilding } from 'react-icons/fa';
import ChatList from '../components/chat/ChatList';
import ChatWindow from '../components/chat/ChatWindow';
import { useChat } from '../context/ChatContext';
import chatService from '../services/chatService';
import AuthImage from '../components/common/AuthImage';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CandidateDashboard = () => {
  const { user } = useAuth();
  // Using simplified ChatContext as provided
  const { setActiveChatId, messages, setMessages, activeChatId } = useChat();
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [chats, setChats] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function fetchApplicationsAndChats() {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        // viewOwnApplications reads data for the logged-in user (token-based)
        const apps = await applicationService.viewOwnApplications();
        setApplications(apps);

        // Fetch saved jobs
        const saved = await jobService.getSavedJobs();
        setSavedJobs(saved);

        // Fetch real chats for the user
        const fetchedChats = await chatService.getChats();
        // Normalize for ChatList (name, lastMessage)
        const normalized = fetchedChats.map(c => {
          // compute display name for UI: if reference use reference.title, else use the other participant's name
          let displayName = c.reference?.title || c.job?.title || 'Conversation';
          if (!c.reference && Array.isArray(c.participants)) {
            const other = c.participants.find(p => String(p._id || p) !== String(user._id || user.id));
            if (other) displayName = other.name || other.email || (other.role ? other.role.toUpperCase() : displayName);
          }
          // compute avatar from participants
          let avatar = null;
          if (Array.isArray(c.participants)) {
            const other = c.participants.find(p => String(p._id || p) !== String(user._id || user.id));
            if (other) avatar = other.profileImageUrl || other.companyLogoUrl || null;
          }
          return {
            _id: c._id,
            jobId: c.job?._id || c.job,
            jobTitle: c.job?.title || c.job,
            reference: c.reference, // may be undefined
            participants: c.participants,
            lastMessage: c.messages && c.messages.length ? c.messages[c.messages.length - 1].text || c.messages[c.messages.length - 1].content : 'Start conversation...',
            displayName,
            avatar
          };
        });
        setChats(normalized);

      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
        // Show backend message when available for easier debugging
        const message = err?.response?.data?.message || err?.message || 'Failed to fetch dashboard data.';
        setError(message);
      }
      setLoading(false);
    }
    fetchApplicationsAndChats();

    // Listen for chat updates (dispatched by ChatWindowPage polling)
    function onChatUpdated(e) {
      const { chatId, lastMessage } = e.detail || {};
      if (!chatId) return;
      setChats(prev => prev.map(c => c._id === chatId ? { ...c, lastMessage } : c));
    }
    window.addEventListener('chat:updated', onChatUpdated);
    return () => window.removeEventListener('chat:updated', onChatUpdated);
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="text-green-500 mr-2" />;
      case 'rejected': return <FaTimesCircle className="text-red-500 mr-2" />;
      default: return <FaHourglassHalf className="text-yellow-500 mr-2" />;
    }
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setChatLoading(true);
    // Fetch messages for this chat
    chatService.getMessages(chatId)
      .then(async ms => {
        // If no messages returned and this chat may be a reference chat, try to create/get the chat explicitly
        if ((!ms || ms.length === 0)) {
          const chatMeta = chats.find(c => String(c._id) === String(chatId));
          if (chatMeta && chatMeta.reference) {
            try {
              const partnerId = chatMeta.reference.author?._id || chatMeta.reference.author;
              if (partnerId) {
                // createChat will return existing chat if one exists
                const created = await chatService.createChat({ referenceId: chatMeta.reference._id, partnerId });
                // If a different chat id returned, update activeChatId and re-fetch messages
                if (created && created._id && String(created._id) !== String(chatId)) {
                  setActiveChatId(created._id);
                  const ms2 = await chatService.getMessages(created._id);
                  setMessages(ms2.map(m => ({ ...m, text: m.text || m.content, isOwn: m.sender?._id?.toString() === user?.id?.toString() })));
                  return;
                }
              }
            } catch (err) {
              console.error('Failed to create/get reference chat', err);
            }
          }
        }

        setMessages(ms.map(m => ({
          ...m,
          text: m.text || m.content,
          // mark ownership so ChatWindow/MessageBubble can align correctly
          isOwn: m.sender?._id?.toString() === user?.id?.toString()
        })));
      })
      .catch(err => console.error('Failed to fetch messages', err))
      .finally(() => setChatLoading(false));
  };

  const renderChatHeader = () => {
    if (!activeChatId) return null;
    const chat = chats.find(c => String(c._id) === String(activeChatId));
    if (!chat) return null;

    if (chat.reference) {
      // Show reference title and author if available
      const author = chat.reference.author;
      const authorName = author?.name || (author?._id ? 'Author' : null);
      return (
        <div className="mb-3">
          <div>
            <div className="text-sm text-gray-500">Reference</div>
            <div className="text-2xl font-bold">{chat.displayName || chat.reference.title}</div>
            {authorName && <div className="text-sm text-gray-600">by {authorName}</div>}
          </div>
        </div>
      );
    }

    // else normal chat: show avatar + displayName
    return (
      <div className="mb-3 flex items-center gap-3">
        {chat.avatar ? <AuthImage src={chat.avatar} alt={chat.displayName} className="w-12 h-12 rounded-full object-cover" fallback={<div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">{(chat.displayName || 'U')[0]}</div>} /> : <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">{(chat.displayName || 'U')[0]}</div>}
        <div>
          <div className="text-sm text-gray-500">Chatting with</div>
          <div className="text-2xl font-bold">{chat.displayName}</div>
        </div>
      </div>
    );
  };

  const handleSendMessage = async (text) => {
    if (!activeChatId) return;
    try {
      const sent = await chatService.sendMessage(activeChatId, text);
      // Normalize returned message and append to context
      const normalized = { ...sent, text: sent.text || sent.content };
      // Ensure sender info exists for local rendering
      const withSender = {
        ...normalized,
        sender: normalized.sender || { _id: user?.id, name: user?.name || 'You', role: user?.role || 'candidate' },
        isOwn: true
      };
      setMessages(m => [...m, withSender]);

      // Update chats preview
      setChats(prev => prev.map(c => c._id === activeChatId ? { ...c, lastMessage: normalized.text } : c));
    } catch (err) {
      console.error('Failed to send message', err);
      alert('Failed to send message.');
    }
  };

  if (loading) return <Loader />;
  if (error) return <div className="p-4 text-red-600 font-semibold max-w-2xl mx-auto mt-10 p-6 bg-red-50 rounded-lg border border-red-200 shadow-sm">{error}</div>;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-50/40 px-4 py-8 md:py-12 transition-colors duration-500 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Welcome Banner */}
        <div className="glass-card p-8 md:p-12 mb-10 border border-border shadow-soft rounded-3xl relative overflow-hidden group bg-white">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-brand/5 rounded-full mix-blend-multiply filter blur-[80px] group-hover:bg-brand/10 transition-all duration-700"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/5 rounded-full mix-blend-multiply filter blur-[80px] group-hover:bg-accent/10 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-text tracking-tight mb-3">Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent">{user.name}</span></h2>
              <p className="text-textMuted mt-2 text-lg font-medium">Monitor your applications, messages, and saved opportunities effortlessly.</p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex gap-4 mb-10 overflow-x-auto hide-scrollbar pb-2">
          <button
            className={`flex items-center gap-2 py-3 px-6 rounded-xl font-bold transition-all whitespace-nowrap border-2 ${activeTab === 'applications' ? 'bg-brand text-white shadow-soft border-brand' : 'bg-white text-textMuted hover:text-text hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
            onClick={() => setActiveTab('applications')}
          >
            <FaBriefcase /> Applied Jobs <span className={`ml-2 text-xs px-2 py-1 rounded-full ${activeTab === 'applications' ? 'bg-white/20 text-white' : 'bg-gray-100 text-textMuted border border-gray-200'}`}>{applications.length}</span>
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-6 rounded-xl font-bold transition-all whitespace-nowrap border-2 ${activeTab === 'chat' ? 'bg-emerald-500 text-white shadow-soft border-emerald-500' : 'bg-white text-textMuted hover:text-text hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
            onClick={() => setActiveTab('chat')}
          >
            <FaComments /> HR Chat <span className={`ml-2 text-xs px-2 py-1 rounded-full ${activeTab === 'chat' ? 'bg-white/20 text-white' : 'bg-gray-100 text-textMuted border border-gray-200'}`}>{chats.filter(c => !c.reference).length}</span>
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-6 rounded-xl font-bold transition-all whitespace-nowrap border-2 ${activeTab === 'saved' ? 'bg-pink-500 text-white shadow-soft border-pink-500' : 'bg-white text-textMuted hover:text-text hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
            onClick={() => setActiveTab('saved')}
          >
            <FaBookmark /> Saved Jobs <span className={`ml-2 text-xs px-2 py-1 rounded-full ${activeTab === 'saved' ? 'bg-white/20 text-white' : 'bg-gray-100 text-textMuted border border-gray-200'}`}>{savedJobs.length}</span>
          </button>
          <button
            className={`flex items-center gap-2 py-3 px-6 rounded-xl font-bold transition-all whitespace-nowrap border-2 ${activeTab === 'references' ? 'bg-blue-600 text-white shadow-soft border-blue-600' : 'bg-white text-textMuted hover:text-text hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
            onClick={() => setActiveTab('references')}
          >
            <FaComments /> References <span className={`ml-2 text-xs px-2 py-1 rounded-full ${activeTab === 'references' ? 'bg-white/20 text-white' : 'bg-gray-100 text-textMuted border border-gray-200'}`}>{chats.filter(c => c.reference).length}</span>
          </button>
        </div>

        {activeTab === 'applications' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6">
            <motion.div variants={itemVariants} className="bg-white border border-border p-6 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-center transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)]">
              <div className="mb-4 md:mb-0">
                <h3 className="text-xl font-bold text-text flex items-center gap-3 mb-2"><div className="p-2.5 bg-brand/10 rounded-lg text-brand"><FaUser /></div> My Profile Status</h3>
                <p className="text-textMuted font-medium text-sm md:text-base">Ensure your profile and resume are up to date for seamless applications.</p>
              </div>
              <a href="/profile" className="bg-white text-text border border-border px-6 py-3 rounded-xl font-semibold hover:border-brand hover:text-brand hover:bg-brand/5 shadow-sm transition-all whitespace-nowrap">Edit Profile &gt;</a>
            </motion.div>

            {applications.length === 0 ? (
              <motion.div variants={itemVariants} className="p-16 bg-white border border-dashed border-border rounded-2xl text-center mt-4">
                <div className="text-brand/30 mb-6 flex justify-center"><FaBriefcase className="text-7xl drop-shadow-sm" /></div>
                <p className="text-3xl font-extrabold text-text mb-3 tracking-tight">No Applications Yet</p>
                <p className="text-textMuted mb-8 max-w-md mx-auto text-lg">You haven't applied for any jobs yet. Start exploring to find your next great opportunity.</p>
                <Link to="/jobs" className="btn-primary inline-flex px-10 py-3.5 rounded-xl shadow-soft">Find Jobs</Link>
              </motion.div>
            ) : (
              applications.map(app => (
                <motion.div variants={itemVariants} whileHover={{ y: -2 }} key={app._id} className="bg-white p-6 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center border border-border transition-all shadow-sm hover:shadow-md border-l-4 border-l-brand relative overflow-hidden group">
                  <div className="mb-4 md:mb-0 relative z-10 w-full md:w-auto">
                    <h3 className="text-2xl font-bold text-text mb-1 tracking-tight group-hover:text-brand transition-colors">{app.job?.title || 'Unknown Job'}</h3>
                    <p className="text-textMuted font-semibold text-lg flex items-center gap-2">
                      <FaBuilding className="text-gray-400" /> {app.job?.company?.name || 'Unknown Company'}
                    </p>
                    <p className="text-sm text-textMuted mt-4 font-semibold bg-gray-50 w-max px-3 py-1.5 rounded-lg border border-border inline-flex items-center gap-2">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-3 w-full md:w-auto relative z-10">
                    <div className={`px-4 py-2 rounded-lg font-bold text-sm tracking-wide flex items-center gap-2 border shadow-sm ${app.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : app.status === 'rejected' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-200'}`}>
                      {getStatusIcon(app.status)}
                      {app.status.toUpperCase()}
                    </div>
                    {app.resumeFileId && (
                      <button onClick={async () => {
                        try {
                          const blob = await import('../services/uploadService').then(m => m.default.downloadFile(app.resumeFileId));
                          const url = window.URL.createObjectURL(blob);
                          window.open(url, '_blank');
                        } catch (err) {
                          console.error('Failed to download resume', err);
                          alert('Failed to download resume.');
                        }
                      }} className="text-sm font-bold text-textMuted hover:text-brand flex items-center gap-2 bg-white border border-border shadow-sm px-4 py-2.5 rounded-lg transition-colors hover:border-brand/30 hover:bg-brand/5">
                        <FaFilePdf className="text-brand opacity-80" /> View Submitted Resume
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedJobs.length === 0 ? (
              <motion.div variants={itemVariants} className="p-16 bg-white border border-dashed border-border rounded-2xl text-center col-span-full">
                <div className="text-pink-500/30 mb-6 flex justify-center"><FaBookmark className="text-7xl" /></div>
                <p className="text-3xl font-extrabold text-text mb-3 tracking-tight">No Saved Jobs</p>
                <p className="text-textMuted mb-8 max-w-md mx-auto text-lg">Keep track of interesting roles by saving them while browsing.</p>
                <Link to="/jobs" className="inline-flex bg-pink-500 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-pink-600 shadow-soft transition-all">Explore Jobs</Link>
              </motion.div>
            ) : (
              savedJobs.map(job => (
                <motion.div variants={itemVariants} whileHover={{ y: -4 }} key={job._id} className="bg-white p-6 rounded-2xl flex flex-col justify-between hover:shadow-lg transition-all border border-border border-t-4 border-t-pink-500">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-text mb-2 leading-tight tracking-tight">{job.title}</h3>
                    <p className="text-textMuted font-semibold text-sm bg-gray-50 flex items-center gap-2 w-max px-3 py-1.5 rounded-lg border border-border mb-3"><FaBuilding className="text-gray-400" /> {job.company?.name || 'Unknown Company'}</p>
                  </div>
                  <div className="flex flex-col gap-5 mt-auto">
                    <span className="text-emerald-700 font-bold bg-emerald-50 w-max px-3 py-1.5 rounded-lg border border-emerald-100 text-sm">₹{job.salaryRange?.min} - ₹{job.salaryRange?.max}</span>
                    <Link to={`/jobs/${job._id}`} className="block w-full text-center bg-gray-50 text-text py-3.5 rounded-xl font-bold hover:bg-pink-50 hover:text-pink-600 border border-border hover:border-pink-200 transition-all shadow-sm">View Job Details</Link>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 h-[650px]">
            <div className="lg:col-span-1 h-full">
              <div className="bg-white rounded-2xl p-5 border border-border shadow-soft h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-text sticky top-0 bg-white/90 backdrop-blur-md py-3 border-b border-border z-10 block tracking-tight">Recent Conversations</h3>
                <div className="flex-1 overflow-y-auto hide-scrollbar -mx-2 px-2 mt-2">
                  <ChatList
                    chats={chats.filter(c => !c.reference).map(c => ({
                      _id: c._id,
                      participants: c.participants,
                      lastMessage: c.lastMessage,
                      displayName: c.displayName || c.jobTitle || 'Conversation',
                      avatar: c.avatar || null
                    }))}
                    onSelect={handleSelectChat}
                  />
                  {chats.filter(c => !c.reference).length === 0 && <div className="text-textMuted text-center p-6 italic text-sm">No ongoing HR conversations.</div>}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 h-full">
              <div className="bg-white rounded-2xl p-0 border border-border shadow-soft flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex flex-col bg-gray-50/20">
                  {activeChatId ? (
                    chatLoading ? <div className="flex-1 flex items-center justify-center"><Loader /></div> : (
                      <>
                        <div className="px-6 py-5 border-b border-border bg-white shadow-sm z-10">
                          {renderChatHeader()}
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                          <ChatWindow
                            messages={messages}
                            onSend={handleSendMessage}
                          />
                        </div>
                      </>
                    )
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-textMuted p-8 text-center space-y-4">
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl"><FaComments className="text-gray-300" /></div>
                      <p className="text-2xl font-bold text-text tracking-tight">Select a conversation</p>
                      <p className="max-w-xs text-base font-medium">Connecting with recruiters directly speeds up your hiring process.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'references' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 h-[650px]">
            <div className="lg:col-span-1 h-full">
              <div className="bg-white rounded-2xl p-5 border border-border shadow-soft h-full flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-text sticky top-0 bg-white/90 backdrop-blur-md py-3 border-b border-border z-10 block tracking-tight">Reference Chats</h3>
                <div className="flex-1 overflow-y-auto hide-scrollbar -mx-2 px-2 mt-2">
                  <ChatList
                    chats={chats.filter(c => c.reference).map(c => ({ _id: c._id, displayName: c.reference?.title || 'Reference', lastMessage: c.lastMessage, avatar: c.avatar || null }))}
                    onSelect={handleSelectChat}
                  />
                  {chats.filter(c => c.reference).length === 0 && <div className="text-textMuted text-center p-6 italic text-sm">No reference discussions.</div>}
                </div>
              </div>
            </div>
            <div className="lg:col-span-2 h-full">
              <div className="bg-white rounded-2xl p-0 border border-border shadow-soft flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex flex-col bg-gray-50/20">
                  {activeChatId ? (
                    chatLoading ? <div className="flex-1 flex items-center justify-center"><Loader /></div> : (
                      <>
                        <div className="px-6 py-5 border-b border-border bg-white shadow-sm z-10">
                          {renderChatHeader()}
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                          <ChatWindow
                            messages={messages}
                            onSend={handleSendMessage}
                          />
                        </div>
                      </>
                    )
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-textMuted p-8 text-center space-y-4">
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-4xl text-blue-300"><FaComments /></div>
                      <p className="text-2xl font-bold text-text tracking-tight">Reference Discussions</p>
                      <p className="max-w-xs text-base font-medium">Select a reference check conversation to connect with referrers.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
export default CandidateDashboard;