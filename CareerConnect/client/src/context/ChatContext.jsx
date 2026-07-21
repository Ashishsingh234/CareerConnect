import React, { createContext, useContext, useState } from 'react';
const ChatContext = createContext();
export function ChatProvider({ children }) {
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  function sendMessage(msg) {
    setMessages(m => [...m, msg]);
  }
  return <ChatContext.Provider value={{ activeChatId, setActiveChatId, messages, setMessages, sendMessage }}>{children}</ChatContext.Provider>;
}
export function useChat() { return useContext(ChatContext); }