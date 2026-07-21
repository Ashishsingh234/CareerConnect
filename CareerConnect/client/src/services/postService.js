import api from './api';

const postService = {
  async create(contentOrPayload) {
    const payload = typeof contentOrPayload === 'string' ? { content: contentOrPayload } : contentOrPayload;
    return (await api.post('/posts', payload)).data;
  },
  async list(params = {}) {
    const res = (await api.get('/posts', { params })).data || [];
    // Normalize any absolute URLs returned by the backend for profile/post images
    return res.map(p => {
      const copy = { ...p };
      try {
        if (copy.author && copy.author.profileImageUrl && typeof copy.author.profileImageUrl === 'string') {
          // If backend accidentally returned an absolute URL, convert to pathname so AuthImage will treat as protected/public path
          if (copy.author.profileImageUrl.startsWith('http')) {
            try { copy.author.profileImageUrl = new URL(copy.author.profileImageUrl).pathname; } catch (e) { /* ignore */ }
          }
        }
        if (copy.comments && copy.comments.length) {
          copy.comments = copy.comments.map(c => {
            const cc = { ...c };
            if (cc.authorProfileImageUrl && typeof cc.authorProfileImageUrl === 'string' && cc.authorProfileImageUrl.startsWith('http')) {
              try { cc.authorProfileImageUrl = new URL(cc.authorProfileImageUrl).pathname; } catch (e) { /* ignore */ }
            }
            return cc;
          });
        }
      } catch (e) { /* ignore normalization errors */ }
      return copy;
    });
  }
  ,
  async toggleLike(postId) {
    return (await api.post(`/posts/${postId}/like`)).data;
  },
  async addComment(postId, text) {
    return (await api.post(`/posts/${postId}/comment`, { text })).data;
  }
};

export default postService;
