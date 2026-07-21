import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { FaPaperPlane } from 'react-icons/fa';

export default function ChatWindow({ messages, onSend }) {
  const ref = useRef();
  const [text, setText] = React.useState('');

  useEffect(() => {
    if (ref.current) {
      // Smooth scroll to bottom to avoid jarring jumps
      try { ref.current.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' }); } catch (e) { ref.current.scrollTop = ref.current.scrollHeight; }
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSend(text.trim()); // Calls the actual sendMessage handler from ChatWindowPage
      setText('');
    }
  };

  const mapMessages = () => messages.map((msg, i) => (
    <MessageBubble
      key={msg._id || i}
      sender={msg.sender}
      text={msg.content || msg.text}
      createdAt={msg.timestamp || msg.createdAt}
      isOwn={msg.isOwn}
    />
  ));

  return (
    <div className="bg-transparent flex flex-col h-full w-full">
      {/* Messages Display Area */}
      <div ref={ref} className="flex-1 overflow-y-auto p-6 space-y-6 w-full custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-textMuted opacity-70">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-2xl"><FaPaperPlane /></div>
            <p className="font-bold">Start the conversation!</p>
          </div>
        ) : (
          mapMessages()
        )}
      </div>

      {/* Sticky Input */}
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-border w-full relative z-20">
        <form className="flex items-center gap-3 w-full" onSubmit={handleSubmit}>
          <input
            className="flex-1 input-field rounded-full px-6 py-4 shadow-sm"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Write a message..."
          />
          <button
            type="submit"
            className="btn-primary w-14 h-14 rounded-full flex items-center justify-center text-lg flex-shrink-0 disabled:opacity-50 disabled:shadow-none shadow-sm"
            disabled={!text.trim()}
          >
            <FaPaperPlane className={text.trim() ? "translate-x-[-2px] translate-y-[2px]" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}