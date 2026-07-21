import api from './api';

const contactService = {
  async sendMessage(payload) {
    return (await api.post('/contact', payload)).data;
  }
};

export default contactService;
