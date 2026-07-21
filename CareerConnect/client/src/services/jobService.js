import api from './api';

const jobService = {
  /**
   * Fetches the list of jobs from the backend with filtering parameters.
   */
  async getJobs(params) {
    // GET /jobs?keyword=...&salaryMax=...
    return (await api.get('/jobs', { params })).data;
  },

  /**
   * Fetches detailed information for a single job posting.
   */
  async getJobById(id) {
    // GET /jobs/:id
    return (await api.get(`/jobs/${id}`)).data;
  },

  /**
   * Creates a new job posting.
   */
  async createJob(payload) {
    // POST /jobs
    return (await api.post('/jobs', payload)).data;
  },

  /**
   * Updates an existing job posting.
   */
  async updateJob(id, payload) {
    return (await api.put(`/jobs/${id}`, payload)).data;
  },

  /**
   * Deletes a job posting.
   */
  async deleteJob(id) {
    return (await api.delete(`/jobs/${id}`)).data;
  },

  /**
   * Toggles save status for a job.
   */
  async saveJob(id) {
    return (await api.post(`/jobs/${id}/save`)).data;
  },

  /**
   * Fetches saved jobs for the logged-in candidate.
   */
  async getSavedJobs() {
    return (await api.get('/jobs/saved')).data;
  }
};

export default jobService;