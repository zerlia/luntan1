import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.jsx'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react'
import apiService from '../services/api'

export default function CreatePost({ user, onBack, onPostCreated }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('请填写完整的帖子标题和内容')
      return
    }

    if (title.length > 100) {
      setError('标题不能超过100个字符')
      return
    }

    if (content.length > 5000) {
      setError('内容不能超过5000个字符')
      return
    }

    setLoading(true)

    try {
      const newPost = await apiService.createPost(title.trim(), content.trim())
      onPostCreated(newPost)
    } catch (err) {
      setError(err.message || '发布失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

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

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">发布新帖</CardTitle>
          <p className="text-gray-600">分享您的想法和见解</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>错误</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">帖子标题 *</Label>
              <Input
                id="title"
                type="text"
                placeholder="请输入帖子标题（最多100字符）"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
              <div className="text-sm text-gray-500 text-right">
                {title.length}/100
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">帖子内容 *</Label>
              <Textarea
                id="content"
                placeholder="请输入帖子内容，支持Markdown语法（最多5000字符）"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px]"
                maxLength={5000}
                required
              />
              <div className="text-sm text-gray-500 text-right">
                {content.length}/5000
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">发帖须知</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 请遵守社区规则，文明发言</li>
                <li>• 不得发布违法、违规或不当内容</li>
                <li>• 鼓励原创内容，尊重他人知识产权</li>
                <li>• 保持友善和建设性的讨论氛围</li>
              </ul>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                将以 <span className="font-medium">{user.username}</span> 的身份发布
              </span>
              <div className="space-x-3">
                <Button type="button" variant="outline" onClick={onBack}>
                  取消
                </Button>
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {loading ? '发布中...' : '发布帖子'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

