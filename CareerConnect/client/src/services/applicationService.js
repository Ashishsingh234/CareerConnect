import api from './api';

const applicationService = {
  // FIX 1: Corrected endpoint and method name for viewing own applications
  async viewOwnApplications() {
    // Uses /applications/users/me/applications (relies on JWT token)
    return (await api.get(`/applications/users/me/applications`)).data;
  },
  async getApplicationsByJob(jobId) {
    return (await api.get(`/applications/job/${jobId}`)).data;
  },
  // FIX 2: Corrected endpoint to match backend route: POST /applications/jobs/:jobId/apply
  async applyToJob(jobId, payload) {
    return (await api.post(`/applications/jobs/${jobId}/apply`, payload)).data;
  },
  async updateApplicationStatus(appId, status) {
    // Backend expects PATCH /applications/:id/status
    // Sanitize appId in case UI accidentally includes extra suffix (e.g., 'id:1')
    const id = String(appId).split(':')[0];
    return (await api.patch(`/applications/${encodeURIComponent(id)}/status`, { status })).data;
  },
  async deleteApplication(appId) {
    return (await api.delete(`/applications/${appId}`)).data;
  }
};

export default applicationService;