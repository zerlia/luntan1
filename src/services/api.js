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
      
      // 改進的錯誤處理
      if (!response.ok) {
        let errorMessage;
        try {
          const data = await response.json();
          errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
        } catch (jsonError) {
          // 如果響應不是JSON格式，嘗試讀取為文本
          const textData = await response.text();
          errorMessage = textData || `HTTP error! status: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
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
      // For user login, the backend returns a token. 
      // We need to return a user object for onLogin to work correctly.
      // Assuming the backend /me endpoint returns user details.
      // For now, we'll return a dummy user object with the username and token.
      return { user: { username: username, token: data.token } };
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
      // For admin login, the backend only returns a token. 
      // We need to return a user object for onLogin to work correctly.
      // For now, we'll return a dummy user object with admin role.
      // In a real application, you might fetch user details using the token.
      return { user: { username: username, role: 'admin', token: data.token } };
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


