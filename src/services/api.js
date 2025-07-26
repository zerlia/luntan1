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
      
      if (!response.ok) {
        let errorMessage;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
        } else {
          errorMessage = await response.text();
          if (!errorMessage) {
            errorMessage = `HTTP error! status: ${response.status}`;
          }
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (response.status !== 204 && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        return {};
      }
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  async login(username, password) {
    const data = await this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    
    if (data.token) {
      localStorage.setItem("token", data.token);
      
      // 登錄成功後，獲取完整的用戶信息
      try {
        const userInfo = await this.getCurrentUser();
        // 確保返回的 user 對象包含 id
        return { user: userInfo.user || userInfo };
      } catch (error) {
        console.error("Failed to get user info after login:", error);
        // 如果獲取用戶信息失敗，至少返回基本信息，但這可能導致編輯功能不可用
        return { user: { username: username, token: data.token } };
      }
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
      
      try {
        const userInfo = await this.getCurrentUser();
        return { user: { ...(userInfo.user || userInfo), role: 'admin' } };
      } catch (error) {
        console.error("Failed to get user info after admin login:", error);
        return { user: { username: username, role: 'admin', token: data.token } };
      }
    }
    return data;
  }

  async logout() {
    localStorage.removeItem("token");
  }

  async getCurrentUser() {
    return this.request("/api/auth/me");
  }

  async getPosts() {
    return this.request("/api/posts");
  }

  async getPost(postId) {
    return this.request(`/api/posts/${postId}`);
  }

  async createPost(title, content) {
    return this.request("/api/posts", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    });
  }

  async updatePost(postId, title, content) {
    return this.request(`/api/posts/${postId}`, {
      method: "PUT",
      body: JSON.stringify({ title, content }),
    });
  }

  async deletePost(postId) {
    return this.request(`/api/posts/${postId}`, {
      method: "DELETE",
    });
  }

  async togglePostLike(postId) {
    return this.request(`/api/posts/${postId}/like`, {
      method: "POST",
    });
  }

  async getPostComments(postId) {
    return this.request(`/api/posts/${postId}/comments`);
  }

  async createComment(postId, content) {
    return this.request(`/api/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content }),
    });
  }

  async toggleCommentLike(commentId) {
    return this.request(`/api/comments/${commentId}/like`, {
      method: "POST",
    });
  }

  async deleteComment(commentId) {
    return this.request(`/api/comments/${commentId}`, {
      method: "DELETE",
    });
  }
}

export default new ApiService();


