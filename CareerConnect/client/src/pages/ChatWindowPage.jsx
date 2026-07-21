import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';
import chatService from '../services/chatService';
import Loader from '../components/common/Loader';
import { FaComments } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import AuthImage from '../components/common/AuthImage';
import { useNavigate } from 'react-router-dom';

export default function ChatWindowPage() {
    const { chatId } = useParams();
    const { user } = useAuth();
    const currentUserId = user?._id || user?.id; // Current user ID for checking message ownership

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatMeta, setChatMeta] = useState(null);
    const navigate = useNavigate();

    // Memoize fetchMessages to ensure stable function reference
    const fetchMessages = useCallback(async () => {
        if (!chatId) return;

        // Only show full loader on initial fetch
        if (messages.length === 0 && loading === true) setLoading(true);
        setError(null);

        try {
            const fetchedMessages = await chatService.getMessages(chatId);

            // Append-only update: add only messages that don't exist locally (prevents full array replace flicker)
            setMessages(prev => {
                // If prev is empty, just return fetchedMessages
                if (!prev || prev.length === 0) return fetchedMessages;
                const existingKeys = new Set(prev.map(m => (m._id ? String(m._id) : (m.createdAt && m.sender ? `${m.sender._id}-${m.createdAt}` : null))));
                const toAdd = fetchedMessages.filter(m => {
                    const key = m._id ? String(m._id) : (m.createdAt && m.sender ? `${m.sender._id}-${m.createdAt}` : null);
                    return key && !existingKeys.has(key);
                });
                if (toAdd.length === 0) return prev;
                return [...prev, ...toAdd];
            });

            // Dispatch a lightweight event so other UI parts (chat lists) can update previews
            const last = fetchedMessages.length ? fetchedMessages[fetchedMessages.length - 1] : null;
            if (last) {
                try { window.dispatchEvent(new CustomEvent('chat:updated', { detail: { chatId, lastMessage: last.text || last.content || '' } })); } catch (e) { /* ignore */ }
            }

        } catch (err) {
            console.error("Chat polling failed:", err);
            // Show a soft error but keep trying to poll
            setError('Connection error. Trying to restore chat...');
        } finally {
            setLoading(false);
        }
    }, [chatId, messages]); // messages dependency is included for correctness, though polling interval manages frequency

    // Polling setup: Set interval to 5 seconds for smoothness and less noticeable updates
    useEffect(() => {
        // Run initial fetch immediately
        fetchMessages();
        // Try to fetch chat metadata (participants, reference, job)
        (async () => {
            try {
                const chats = await chatService.getChats();
                const found = chats.find(c => String(c._id) === String(chatId));
                if (found) setChatMeta(found);
            } catch (e) { /* ignore */ }
        })();

        // Set up polling interval (5 seconds)
        const intervalId = setInterval(fetchMessages, 5000);

        // Cleanup: Clear interval when component unmounts
        return () => clearInterval(intervalId);
    }, [fetchMessages]); // Dependency array includes memoized function

    const handleSendMessage = async (content) => {
        try {
            // Send the message via API
            const sentMessage = await chatService.sendMessage(chatId, content);

            // Optimistically update the UI to show the sent message immediately.
            // Include sender name and role so own messages display correctly without waiting for server.
            const optimistic = {
                _id: sentMessage._id || `temp-${Date.now()}`,
                text: content,
                content,
                // include avatar information so MessageBubble can show it immediately
                sender: { _id: currentUserId, name: user?.name || 'You', role: user?.role || 'candidate', profileImageUrl: user?.profileImageUrl, companyLogoUrl: user?.companyLogoUrl },
                createdAt: new Date().toISOString(),
                isOwn: true
            };
            setMessages(m => [...m, optimistic]);
        } catch (err) {
            setError('Failed to send message.');
        }
    };

    if (loading && messages.length === 0) return <Loader />;
    // Show error message softly without disrupting chat area if history exists
    if (error && messages.length === 0) return <div className="p-4 text-red-600"><FaComments /> {error}</div>;

    const renderHeader = () => {
        if (!chatMeta) return null;
        // For reference-based chats show reference title, otherwise show the other participant
        if (chatMeta.reference) {
            const refTitle = chatMeta.reference.title || 'Reference';
            const author = chatMeta.reference.author;
            const authorId = author?._id || author;
            return (
                <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-border shadow-sm">
                    <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center text-brand text-xl shadow-sm border border-brand/20"><FaComments /></div>
                    <div>
                        <div className="text-xl font-extrabold text-text tracking-tight">{refTitle}</div>
                        <div className="text-sm font-semibold text-textMuted">by <button className="text-brand hover:underline transition-all" onClick={() => navigate(`/users/${authorId}`)}>{author?.name || 'Author'}</button></div>
                    </div>
                </div>
            );
        }
        // else show other participant
        const other = (chatMeta.participants || []).find(p => String(p._id || p) !== String(user?._id || user?.id));
        if (!other) return null;
        const avatar = other.profileImageUrl || other.companyLogoUrl || null;
        const displayName = other.name || other.email || (other.role ? other.role.toUpperCase() : 'User');
        const go = () => {
            if (other.role === 'candidate' || !other.role) navigate(`/users/${other._id || other}`);
            else navigate(`/companies/${other.company}`);
        };
        return (
            <div className="flex items-center gap-4 mb-6 bg-white p-4 rounded-2xl border border-border shadow-soft transition-all hover:shadow-md cursor-pointer" onClick={go}>
                {avatar ? (
                    <AuthImage src={avatar} alt={displayName} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xl text-text font-bold">{(displayName || 'U')[0]}</div>
                )}
                <div>
                    <div className="text-xl font-extrabold text-text tracking-tight">{displayName}</div>
                    <div className="text-xs font-bold text-textMuted uppercase tracking-widest mt-0.5">{other.role || 'Member'}</div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50/40 py-12 px-4 font-sans pb-20 flex flex-col items-center">
            <div className="w-full max-w-4xl flex-1 flex flex-col">
                {renderHeader()}
                {error && messages.length > 0 && <div className="bg-red-50 text-red-600 text-sm font-bold text-center p-3 rounded-xl border border-red-200 shadow-sm mb-4 animate-fade-in">{error}</div>}
                <div className="flex-1 bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
                    <ChatWindow
                        messages={messages.map(msg => ({
                            ...msg,
                            // Check ownership based on sender ID.
                            isOwn: String(msg.sender?._id || msg.sender) === String(currentUserId),
                            text: msg.content || msg.text // Use content/text field
                        }))}
                        onSend={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    );
}