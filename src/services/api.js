const API_BASE_URL = 'http://localhost:5000/api'

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 包含cookies用於session
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // 認證相關
  async login(username, password) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  }

  async register(username, password, inviteCode) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, inviteCode }),
    })
  }

  async logout() {
    return this.request('/logout', {
      method: 'POST',
    })
  }

  async getCurrentUser() {
    return this.request('/me')
  }

  // 帖子相關
  async getPosts() {
    return this.request('/posts')
  }

  async getPost(postId) {
    return this.request(`/posts/${postId}`)
  }

  async createPost(title, content) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
    })
  }

  async togglePostLike(postId) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    })
  }

  // 評論相關
  async getPostComments(postId) {
    return this.request(`/posts/${postId}/comments`)
  }

  async createComment(postId, content) {
    return this.request(`/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async toggleCommentLike(commentId) {
    return this.request(`/comments/${commentId}/like`, {
      method: 'POST',
    })
  }
}

export default new ApiService()

