import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Heart, MessageCircle, User, Calendar, Plus } from 'lucide-react'

export default function PostList({ user, onPostClick, onCreatePost }) {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: '欢迎来到我们的论坛！',
      content: '这是第一个帖子，欢迎大家积极参与讨论。',
      author: 'admin',
      likes_count: 15,
      comments_count: 8,
      created_at: '2025-01-20 10:30:00',
      liked_by_user: false
    },
    {
      id: 2,
      title: '关于论坛使用规则的说明',
      content: '请大家遵守论坛规则，文明发言，共同维护良好的讨论环境。',
      author: 'moderator',
      likes_count: 12,
      comments_count: 5,
      created_at: '2025-01-20 14:15:00',
      liked_by_user: true
    },
    {
      id: 3,
      title: '技术讨论：Cloudflare Workers的最佳实践',
      content: '分享一些使用Cloudflare Workers开发的经验和技巧。',
      author: 'developer',
      likes_count: 23,
      comments_count: 12,
      created_at: '2025-01-21 09:45:00',
      liked_by_user: false
    }
  ])

  const handleLike = async (postId) => {
    // 模拟点赞API调用
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const isLiked = post.liked_by_user
        return {
          ...post,
          liked_by_user: !isLiked,
          likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
        }
      }
      return post
    }))
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 按点赞数排序
  const sortedPosts = [...posts].sort((a, b) => {
    if (b.likes_count !== a.likes_count) {
      return b.likes_count - a.likes_count
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">论坛首页</h1>
          <p className="text-gray-600 mt-2">欢迎 {user.username}，与大家分享您的想法</p>
        </div>
        <Button onClick={onCreatePost} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          发布新帖
        </Button>
      </div>

      <div className="space-y-4">
        {sortedPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle 
                  className="text-xl hover:text-blue-600 transition-colors"
                  onClick={() => onPostClick(post)}
                >
                  {post.title}
                </CardTitle>
                <Badge variant="secondary" className="ml-2">
                  热度 {post.likes_count}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">{post.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(post.id)
                    }}
                    className={`flex items-center gap-1 ${
                      post.liked_by_user ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.liked_by_user ? 'fill-current' : ''}`} />
                    <span>{post.likes_count}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPostClick(post)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-500"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments_count}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedPosts.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有帖子</h3>
          <p className="text-gray-500 mb-4">成为第一个发帖的人吧！</p>
          <Button onClick={onCreatePost}>发布第一个帖子</Button>
        </div>
      )}
    </div>
  )
}

