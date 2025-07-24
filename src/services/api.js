const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ".";

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
      ...options,
    };

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // 認證相關
  async login(username, password) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  }

  async register(username, password, inviteCode) {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password, invite_code: inviteCode }),
    });
  }

  async adminLogin(username, password) {
    const data = await this.request("/api/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  }

  async logout() {
    localStorage.removeItem("token");
    // No backend call needed for logout with JWT
  }

  async getCurrentUser() {
    return this.request("/api/auth/me");
  }

  // 帖子相關
  async getPosts() {
    return this.request("/posts");
  }

  async getPost(postId) {
    return this.request(`/posts/${postId}`);
  }

  async createPost(title, content) {
    return this.request("/posts", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
  }

  async updatePost(postId, title, content) {
    return this.request(`/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    });
  }

  async deletePost(postId) {
    return this.request(`/posts/${postId}`, {
      method: "DELETE",
    });
  }

  async togglePostLike(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: "POST",
    });
  }

  // 評論相關
  async getPostComments(postId) {
    return this.request(`/posts/${postId}/comments`);
  }

  async createComment(postId, content) {
    return this.request(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async toggleCommentLike(commentId) {
    return this.request(`/comments/${commentId}/like`, {
      method: "POST",
    });
  }

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, {
      method: "DELETE",
    });
  }
}

export default new ApiService();

