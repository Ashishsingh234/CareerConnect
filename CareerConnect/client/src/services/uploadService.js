import api from './api';

const uploadService = {
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);
    // Correct Endpoint: POST /upload/resume
    return (await api.post('/upload/resume', formData)).data;
  },
  async uploadLogo(file, companyId) {
    const formData = new FormData();
    formData.append('logo', file);
    // Correct Endpoint: POST /upload/company/:id/logo
    return (await api.post(`/upload/company/${companyId}/logo`, formData)).data;
  },
  async uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profileImage', file);
    return (await api.post('/upload/profile-image', formData)).data;
  }
  ,
  async uploadJobImage(file) {
    const formData = new FormData();
    formData.append('jobImage', file);
    return (await api.post('/upload/job-image', formData)).data;
  }
  ,
  // Semantic alias used by posts to avoid confusion between job images and post images
  async uploadPostImage(file) {
    const formData = new FormData();
    formData.append('jobImage', file); // server accepts jobImage field for job-image route
    const res = (await api.post('/upload/job-image', formData)).data;
    // normalize response to always include `id`
    return { id: res.id || res.fileId || res._id || res.fileId };
  }
  ,
  // Download file (returns blob) - caller can open in a new tab
  async downloadFile(fileId) {
    const res = await api.get(`/files/${fileId}`, { responseType: 'blob' });
    return res.data;
  }
};

export default uploadService;