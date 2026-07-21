import api from './api';

const chatService = {
  // Get all chats for the logged-in user (For ChatList)
  async getChatsByUser() {
    return (await api.get('/chat')).data;
  },
  // Backwards-compatible alias used in the app
  async getChats() {
    return (await api.get('/chat')).data;
  },
  // Start or get an existing chat for a job.
  // Accepts either: createChat({ jobId, partnerId, referenceId }) OR createChat(jobId, partnerId)
  async createChat(arg1, arg2) {
    let jobId, partnerId, referenceId;
    if (arg1 && typeof arg1 === 'object' && !Array.isArray(arg1)) {
      ({ jobId, partnerId, referenceId } = arg1);
    } else {
      jobId = arg1;
      partnerId = arg2;
    }
    const payload = { partnerId };
    if (jobId) payload.jobId = jobId && jobId._id ? jobId._id : jobId;
    if (referenceId) payload.referenceId = referenceId;
    return (await api.post('/chat', payload)).data;
  },
  // Get messages for a chat ID
  async getMessages(chatId) {
    // GET /chat/:chatId/messages
    return (await api.get(`/chat/${chatId}/messages`)).data;
  },
  // Send message to an existing chat ID
  async sendMessage(chatId, content) {
    // POST /chat/:chatId/messages
    return (await api.post(`/chat/${chatId}/messages`, { content })).data;
  }
};

export default chatService;