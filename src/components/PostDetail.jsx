import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Separator } from '@/components/ui/separator.jsx'
import { Heart, MessageCircle, User, Calendar, ArrowLeft, Send, Edit, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import apiService from '../services/api'

export default function PostDetail({ post: initialPost, user, onBack, onPostUpdated }) {
  const [post, setPost] = useState(initialPost)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [postLiked, setPostLiked] = useState(false) // Will be updated by API
  const [postLikes, setPostLikes] = useState(initialPost.likes_count)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(initialPost.title)
  const [editedContent, setEditedContent] = useState(initialPost.content)
  const [isSaving, setIsSaving] = useState(false) // 新增狀態：是否正在保存

  useEffect(() => {
    setPost(initialPost);
    setPostLikes(initialPost.likes_count);
    // Assuming API will tell us if user liked it or not
    // For now, we'll refetch comments to get updated like status
    fetchComments();
  }, [initialPost]);

  const fetchComments = async () => {
    try {
      const response = await apiService.getPostComments(post.id)
      setComments(response.comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handlePostLike = async () => {
    try {
      const response = await apiService.togglePostLike(post.id)
      setPostLiked(response.liked)
      setPostLikes(response.likes_count)
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }

  const handleCommentLike = async (commentId) => {
    try {
      const response = await apiService.toggleCommentLike(commentId)
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            liked_by_user: response.liked,
            likes_count: response.likes_count
          }
        }
        return comment
      }))
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      await apiService.createComment(post.id, newComment)
      setNewComment('')
      fetchComments()
      setPost(prevPost => ({ ...prevPost, comments_count: prevPost.comments_count + 1 }))
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert(error.message || '發表評論失敗')
    }
  }

  const handleEditPost = () => {
    setIsEditing(true)
  }

  const handleSavePost = async () => {
    setIsSaving(true); // 開始保存，設置為true
    try {
      const response = await apiService.updatePost(post.id, editedTitle, editedContent)
      setPost(response.post) // Assuming API returns updated post
      setIsEditing(false)
      onPostUpdated(response.post) // Notify parent to update post list
    } catch (error) {
      console.error('Error saving post:', error)
      alert(error.message || '保存帖子失敗')
    } finally {
      setIsSaving(false); // 保存完成（無論成功或失敗），設置為false
    }
  }

  const handleDeletePost = async () => {
    if (window.confirm('確定要刪除這篇帖子嗎？此操作不可逆。')) {
      try {
        await apiService.deletePost(post.id)
        alert('帖子刪除成功')
        onBack() // Go back to post list after deletion
      } catch (error) {
        console.error('Error deleting post:', error)
        alert(error.message || '刪除帖子失敗')
      }
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('確定要刪除這條評論嗎？此操作不可逆。')) {
      try {
        await apiService.deleteComment(commentId)
        alert('評論刪除成功')
        fetchComments()
        setPost(prevPost => ({ ...prevPost, comments_count: prevPost.comments_count - 1 }))
      } catch (error) {
        console.error('Error deleting comment:', error)
        alert(error.message || '刪除評論失敗')
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai' // 明確指定時區為東八區
    }).format(date)
  }

  // 按点赞数排序评论
  const sortedComments = [...comments].sort((a, b) => {
    if (b.likes_count !== a.likes_count) {
      return b.likes_count - a.likes_count
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const isAuthor = user && user.id === post.user_id
  const isAdmin = user && user.role === 'admin'

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
            {isEditing ? (
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold w-full p-2 border rounded"
              />
            ) : (
              <CardTitle className="text-2xl">{post.title}</CardTitle>
            )}
            <Badge variant="secondary">
              热度 {postLikes}
            </Badge>
          </div>
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
                <span>最后修改于 {formatDate(post.last_modified_at)}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[200px] w-full p-2 border rounded mb-4"
            />
          ) : (
            <div className="prose max-w-none text-gray-700 mb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />}}>{post.content}</ReactMarkdown>
            </div>
          )}
          
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
              <span>{post.comments_count} 评论</span>
            </div>

            {isAuthor && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEditPost} className="flex items-center gap-1">
                <Edit className="w-4 h-4" />
                编辑
              </Button>
            )}
            {isAuthor && isEditing && (
              <Button size="sm" onClick={handleSavePost} className="flex items-center gap-1" disabled={isSaving}>
                <Send className="w-4 h-4" />
                {isSaving ? '保存中...' : '保存'}
              </Button>
            )}
            {isAdmin && (
              <Button variant="destructive" size="sm" onClick={handleDeletePost} className="flex items-center gap-1">
                <Trash2 className="w-4 h-4" />
                删除帖子
              </Button>
            )}
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
              placeholder="写下您的评论...支持Markdown语法"
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
                        <span className="font-medium text-gray-900">{comment.username}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <div className="prose max-w-none text-gray-700 mb-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />}}>{comment.content}</ReactMarkdown>
                      </div>
                      <div className="flex items-center gap-2">
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
                        {isAdmin && (
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteComment(comment.id)} className="flex items-center gap-1">
                            <Trash2 className="w-4 h-4" />
                            删除
                          </Button>
                        )}
                      </div>
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

