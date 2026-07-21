

import React, { useState, useRef } from 'react';
import { FaRobot, FaUserCircle } from 'react-icons/fa';

const FAQS = [
  { q: 'How do I apply to a job?', a: 'Open the job details and click Apply. Make sure your resume is uploaded in your profile.' },
  { q: 'How to upload resume?', a: 'Go to Profile -> Resume Management and upload a PDF/DOCX file.' },
  { q: 'Interview tips?', a: 'Prepare your projects, practice behavioral questions, and research the company.' },
  { q: 'How long to prepare for interview?', a: 'It depends on role and experience; typically 2-4 weeks to prepare core topics.' }
];

function fakeBotReply(userMsg) {
  // Placeholder for AI integration
  if (!userMsg.trim()) return "Please type your question.";
  for (const faq of FAQS) {
    if (faq.q.toLowerCase().includes(userMsg.toLowerCase()) || userMsg.toLowerCase().includes(faq.q.toLowerCase().split(' ')[0])) {
      return faq.a;
    }
  }
  if (/apply|job/i.test(userMsg)) return FAQS[0].a;
  if (/resume/i.test(userMsg)) return FAQS[1].a;
  if (/interview/i.test(userMsg)) return FAQS[2].a;
  return "I'm here to help! Please ask about jobs, resume, interview, or anything else.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your CareerConnect assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Add FAQ as clickable user questions
  const sendFAQ = (faq) => {
    setMessages(msgs => [...msgs, { sender: 'user', text: faq.q }]);
    setTyping(true);
    setTimeout(() => {
      setMessages(msgs => [...msgs, { sender: 'bot', text: faq.a }]);
      setTyping(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 700);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages(msgs => [...msgs, { sender: 'user', text: input }]);
    setTyping(true);
    setInput('');
    setTimeout(() => {
      const reply = fakeBotReply(input);
      setMessages(msgs => [...msgs, { sender: 'bot', text: reply }]);
      setTyping(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 700);
  };

  return (
    <>
          <div className="fixed bottom-6 right-6 z-50">
            <button onClick={() => setOpen(o => !o)} className="bg-accent text-white rounded-full shadow-lg flex items-center justify-center w-14 h-14 text-2xl">
              <FaRobot className="w-6 h-6" />
            </button>
          </div>

      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-white rounded shadow-lg flex flex-col p-0 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-accent text-white rounded-t">
            <div className="font-semibold">CareerConnect Assistant</div>
            <button onClick={() => setOpen(false)} className="text-sm">✕</button>
          </div>
          <div className="flex-1 px-4 py-2 overflow-auto" style={{ maxHeight: 320 }}>
            {/* FAQ quick questions */}
            <div className="mb-2">
              <div className="text-xs text-gray-500 mb-1">Quick Questions</div>
              <div className="flex flex-wrap gap-2">
                {FAQS.map((faq, idx) => (
                  <button key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-accent hover:text-white transition" onClick={() => sendFAQ(faq)}>{faq.q}</button>
                ))}
              </div>
            </div>
            {/* Chat messages */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex mb-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <FaRobot className="w-8 h-8 text-accent mr-2" />}
                <div className={`px-3 py-2 rounded-lg text-sm max-w-[70%] ${msg.sender === 'bot' ? 'bg-gray-100 text-gray-800' : 'bg-accent text-white'}`}>{msg.text}</div>
                {msg.sender === 'user' && <FaUserCircle className="w-8 h-8 text-gray-400 ml-2" />}
              </div>
            ))}
            {typing && (
              <div className="flex items-center mb-2">
                <FaRobot className="w-8 h-8 text-accent mr-2" />
                <div className="px-3 py-2 rounded-lg bg-gray-100 text-gray-500 text-sm animate-pulse">Typing...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="flex px-4 py-3 border-t bg-white" onSubmit={e => { e.preventDefault(); sendMessage(); }}>
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-accent"
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="ml-2 bg-accent text-white px-4 py-2 rounded font-semibold">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
