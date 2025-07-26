// 修復後的 App.jsx 文件中的關鍵部分

import { useState, useEffect, useCallback } from 'react'
// ... 其他導入

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('list')
  const [selectedPost, setSelectedPost] = useState(null)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true) // 添加加載狀態

  // 添加：初始化時檢查並獲取用戶信息
  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem('token');
      if (token && !user) {
        try {
          const userInfo = await apiService.getCurrentUser();
          setUser(userInfo.user);
        } catch (error) {
          console.error('Failed to get user info on init:', error);
          // Token 可能已過期，清除它
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    initializeUser();
  }, [user]);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await apiService.getPosts()
      setPosts(response.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user, fetchPosts])

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentView('list')
  }

  // ... 其他方法保持不變

  // 添加加載狀態處理
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">正在加載...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  // ... 其餘組件邏輯保持不變
}

export default App; // 添加這行，將 App 組件作為默認導出

