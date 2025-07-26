// 修復後的 api.js 文件中的關鍵方法

// 修復登錄方法
async login(username, password) {
  const data = await this.request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
    // 修復：登錄成功後獲取完整的用戶信息
    try {
      const userInfo = await this.getCurrentUser();
      return { user: userInfo.user };
    } catch (error) {
      console.error('Failed to get user info after login:', error);
      // 如果獲取用戶信息失敗，返回基本信息，但這可能導致編輯功能不可用
      return { user: { username: username, token: data.token } };
    }
  }
  return data;
}

// 修復管理員登錄方法
async adminLogin(username, password) {
  const data = await this.request("/api/auth/admin/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
    // 修復：管理員登錄成功後也獲取完整的用戶信息
    try {
      const userInfo = await this.getCurrentUser();
      return { user: userInfo.user };
    } catch (error) {
      console.error('Failed to get admin info after login:', error);
      // 如果獲取用戶信息失敗，返回基本信息
      return { user: { username: username, role: 'admin', token: data.token } };
    }
  }
  return data;
}

