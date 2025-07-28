import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Heart, MessageCircle, User, Calendar, Plus } from 'lucide-react'
import apiService from '../services/api'

export default function PostList({ user, onPostClick, onCreatePost, onPostUpdated }) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await apiService.getPosts()
      setPosts(response.posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const handleLike = async (postId) => {
    try {
      const response = await apiService.togglePostLike(postId)
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked_by_user: response.liked,
            likes_count: response.likes_count
          }
        }
        return post
      }))
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(date    return date.toLocaleDateString(\'zh-CN\', {
      year: \'numeric\',
      month: \'short\',
      day: \'numeric\',
      hour: \'2-digit\',
      minute: \'2-digit\',
      timeZone: \'Asia/Shanghai\'
    })

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
                    <span>{post.username}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>创建于 {formatDate(post.created_at)}</span>
                  </div>
                  {post.last_modified_at && post.created_at !== post.last_modified_at && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>修改于 {formatDate(post.last_modified_at)}</span>
                    </div>
                  )}
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">正在载入中，不急不急，喝杯茶先☕</h3>

        </div>
      )}
    </div>
  )
}

