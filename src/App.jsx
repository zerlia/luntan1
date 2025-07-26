import { useState, useEffect, useCallback } from 'react'
import LoginForm from './components/LoginForm.jsx'
import PostList from './components/PostList.jsx'
import PostDetail from './components/PostDetail.jsx'
import CreatePost from './components/CreatePost.jsx'
import apiService from './services/api.js'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [currentView, setCurrentView] = useState('list') // 'list', 'detail', 'create'
  const [selectedPost, setSelectedPost] = useState(null)
  const [posts, setPosts] = useState([]) // State to hold posts
  const [isLoading, setIsLoading] = useState(true) // 添加加載狀態

  const fetchPosts = useCallback(async () => {
    try {
      const response = await apiService.getPosts()
      setPosts(response.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }, [])

  // 自動登錄檢查
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !user) {
      // 如果有token但沒有用戶信息，嘗試獲取用戶信息
      apiService.getCurrentUser()
        .then(response => {
          setUser(response.user);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Auto login failed:', error);
          localStorage.removeItem('token');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchPosts()
    }
  }, [user, fetchPosts])

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentView('list')
  }

  const handleLogout = () => {
    setUser(null)
    setCurrentView('list')
    setSelectedPost(null)
    localStorage.removeItem('token') // Clear token on logout
  }

  const handlePostClick = (post) => {
    setSelectedPost(post)
    setCurrentView('detail')
  }

  const handleCreatePost = () => {
    setCurrentView('create')
  }

  const handlePostCreated = (newPost) => {
    fetchPosts() // Refresh post list after new post is created
    setCurrentView('list')
  }

  const handlePostUpdated = (updatedPost) => {
    setPosts(prevPosts => prevPosts.map(p => p.id === updatedPost.id ? updatedPost : p));
    setSelectedPost(updatedPost); // Update the selected post in detail view
  }

  const handleBackToList = () => {
    fetchPosts(); // Refresh post list when returning to list view
    setCurrentView('list')
    setSelectedPost(null)
  }

  // 顯示加載狀態
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在加載...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 
              className="text-xl font-bold text-gray-900 cursor-pointer"
              onClick={handleBackToList}
            >
              论坛
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                欢迎，{user ? user.username : '访客'}
                {user && user.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    管理员
                  </span>
                )}
              </span>
              {user && (
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  退出登录
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main>
        {currentView === 'list' && (
          <PostList 
            user={user}
            posts={posts} // Pass posts from App state
            fetchPosts={fetchPosts} // Pass fetchPosts to PostList
            onPostClick={handlePostClick}
            onCreatePost={handleCreatePost}
            onPostUpdated={handlePostUpdated} 
          />
        )}
        
        {currentView === 'detail' && selectedPost && (
          <PostDetail 
            post={selectedPost}
            user={user}
            onBack={handleBackToList}
            onPostUpdated={handlePostUpdated} 
          />
        )}
        
        {currentView === 'create' && (
          <CreatePost 
            user={user}
            onBack={handleBackToList}
            onPostCreated={handlePostCreated}
          />
        )}
      </main>
    </div>
  )
}

export default App

