/**
 * API Integration Helper
 * Replace localStorage-based progress tracker with real API calls
 */

class PixelAcademyAPI {
  constructor() {
    // Use centralized config - easy to switch backend providers
    const config = window.PIXEL_ACADEMY_CONFIG || {};
    this.baseURL = (config.API_URL || 'http://localhost:8080') + '/api';
    this.token = localStorage.getItem('authToken');
  }

  // Helper method for API calls
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== AUTHENTICATION =====

  async loginWithGoogle(googleToken) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token: googleToken })
    });

    // Store JWT token
    this.token = data.token;
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // ===== COURSES =====

  async getCourses() {
    return await this.request('/courses');
  }

  async getCourse(slug) {
    return await this.request(`/courses/${slug}`);
  }

  async enrollInCourse(courseId) {
    return await this.request(`/courses/${courseId}/enroll`, {
      method: 'POST'
    });
  }

  async getMyProgress(courseId) {
    return await this.request(`/courses/${courseId}/my-progress`);
  }

  // ===== PROGRESS =====

  async markChapterComplete(courseId, moduleId, chapterId, timeSpent = 0) {
    return await this.request('/progress/chapter', {
      method: 'POST',
      body: JSON.stringify({ courseId, moduleId, chapterId, timeSpent })
    });
  }

  async markModuleComplete(courseId, moduleId, timeSpent = 0) {
    return await this.request('/progress/module', {
      method: 'POST',
      body: JSON.stringify({ courseId, moduleId, timeSpent })
    });
  }

  async getCourseProgress(courseId) {
    return await this.request(`/progress/${courseId}`);
  }

  // ===== ASSIGNMENTS =====

  async submitAssignment(moduleId, caseStudy, files) {
    const formData = new FormData();
    formData.append('moduleId', moduleId);
    formData.append('caseStudy', caseStudy);

    // Add actual File objects
    files.forEach(file => {
      formData.append('files', file);
    });

    // Don't set Content-Type, let browser set it with boundary
    const response = await fetch(`${this.baseURL}/assignments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Submission failed');
    }

    return await response.json();
  }

  async getAssignments(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/assignments?${params}`);
  }

  async getPendingAssignments() {
    return await this.request('/assignments/pending');
  }

  async approveAssignment(assignmentId, feedback = '') {
    return await this.request(`/assignments/${assignmentId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ feedback })
    });
  }

  async rejectAssignment(assignmentId, feedback) {
    return await this.request(`/assignments/${assignmentId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ feedback })
    });
  }

  async downloadFile(fileId) {
    window.open(`${this.baseURL}/assignments/files/${fileId}`, '_blank');
  }

  // ===== USERS =====

  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    return await this.request(`/users?${params}`);
  }

  async getUser(userId) {
    return await this.request(`/users/${userId}`);
  }

  async updateUser(userId, updates) {
    return await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async getUserDashboard(userId) {
    return await this.request(`/users/${userId}/dashboard`);
  }

  // ===== ANALYTICS (Admin Only) =====

  async getAnalyticsOverview() {
    return await this.request('/analytics/overview');
  }

  async getCourseAnalytics(courseId) {
    return await this.request(`/analytics/courses/${courseId}`);
  }

  async getStudentAnalytics() {
    return await this.request('/analytics/students');
  }

  async getModuleAnalytics() {
    return await this.request('/analytics/modules');
  }

  // ===== HELPER METHODS =====

  isAuthenticated() {
    return !!this.token;
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isAdmin() {
    const user = this.getStoredUser();
    return user && user.role === 'admin';
  }
}

// Export singleton instance
window.pixelAcademyAPI = new PixelAcademyAPI();
