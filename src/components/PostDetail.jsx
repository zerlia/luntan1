import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Heart, MessageCircle, User, Calendar, ArrowLeft, Send } from 'lucide-react'

export default function PostDetail({ post, user, onBack }) {
  const [comments, setComments] = useState([
    {
      id: 1,
      content: '很好的帖子，感谢分享！',
      author: 'user1',
      likes_count: 3,
      created_at: '2025-01-20 11:00:00',
      liked_by_user: false
    },
    {
      id: 2,
      content: '我也有同样的想法，期待更多讨论。',
      author: 'user2',
      likes_count: 5,
      created_at: '2025-01-20 12:30:00',
      liked_by_user: true
    },
    {
      id: 3,
      content: '这个观点很有意思，能详细说说吗？',
      author: 'user3',
      likes_count: 2,
      created_at: '2025-01-20 15:45:00',
      liked_by_user: false
    }
  ])

  const [newComment, setNewComment] = useState('')
  const [postLiked, setPostLiked] = useState(post.liked_by_user)
  const [postLikes, setPostLikes] = useState(post.likes_count)

  const handlePostLike = () => {
    setPostLiked(!postLiked)
    setPostLikes(postLiked ? postLikes - 1 : postLikes + 1)
  }

  const handleCommentLike = (commentId) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const isLiked = comment.liked_by_user
        return {
          ...comment,
          liked_by_user: !isLiked,
          likes_count: isLiked ? comment.likes_count - 1 : comment.likes_count + 1
        }
      }
      return comment
    }))
  }

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    const comment = {
      id: comments.length + 1,
      content: newComment,
      author: user.username,
      likes_count: 0,
      created_at: new Date().toISOString(),
      liked_by_user: false
    }

    setComments([...comments, comment])
    setNewComment('')
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

  // 按点赞数排序评论
  const sortedComments = [...comments].sort((a, b) => {
    if (b.likes_count !== a.likes_count) {
      return b.likes_count - a.likes_count
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-6 flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Button>

      {/* 帖子详情 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            <Badge variant="secondary">
              热度 {postLikes}
            </Badge>
          </div>
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
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{post.content}</p>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handlePostLike}
              className={`flex items-center gap-2 ${
                postLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${postLiked ? 'fill-current' : ''}`} />
              <span>{postLikes} 点赞</span>
            </Button>
            
            <div className="flex items-center gap-2 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length} 评论</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 发表评论 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">发表评论</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <Textarea
              placeholder="写下您的评论..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
              required
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                以 {user.username} 的身份发表
              </span>
              <Button type="submit" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                发表评论
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 评论列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            评论 ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedComments.length > 0 ? (
            <div className="space-y-4">
              {sortedComments.map((comment, index) => (
                <div key={comment.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">{comment.author}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-3">{comment.content}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCommentLike(comment.id)}
                        className={`flex items-center gap-1 ${
                          comment.liked_by_user ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${comment.liked_by_user ? 'fill-current' : ''}`} />
                        <span>{comment.likes_count}</span>
                      </Button>
                    </div>
                  </div>
                  {index < sortedComments.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">还没有评论，来发表第一个评论吧！</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

