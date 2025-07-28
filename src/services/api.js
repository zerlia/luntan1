const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ".";

// Helper function to decode JWT token
const decodeJwtToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(atob(base64).split("").map(function(c) {
      return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(""));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding JWT token:", e);
    return null;
  }
};

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

      // 只有在響應成功且有內容時才嘗試解析JSON
      const contentType = response.headers.get("content-type");
      if (response.status !== 204 && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      } else {
        return {}; // 或返回 null，取決於後端對204或其他無內容響應的處理
      }
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
      const decodedToken = decodeJwtToken(data.token);
      if (decodedToken) {
        return { user: { id: decodedToken.id, username: decodedToken.username, role: decodedToken.role, token: data.token } };
      } else {
        throw new Error("Failed to decode JWT token after login.");
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
      const decodedToken = decodeJwtToken(data.token);
      if (decodedToken) {
        return { user: { id: decodedToken.id, username: decodedToken.username, role: decodedToken.role, token: data.token } };
      } else {
        throw new Error("Failed to decode JWT token after admin login.");
      }
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

  // 評論相關
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


