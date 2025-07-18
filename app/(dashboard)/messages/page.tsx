'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Send,
  MessageCircle,
  Search,
  UserPlus,
  MoreVertical,
  Phone,
  Video,
  Heart,
  Smile,
  Paperclip,
  Crown,
  Users,
  Clock,
  CheckCheck,
} from 'lucide-react'

interface User {
  id: string
  username: string
  avatar: string
  plan: 'free' | 'premium' | 'pro'
  isOnline: boolean
  lastSeen: Date
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
  type: 'text' | 'image' | 'workout'
}

interface Conversation {
  id: string
  participants: User[]
  lastMessage: Message
  unreadCount: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [userPlan, setUserPlan] = useState<'free' | 'premium' | 'pro'>('free')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // モックデータ
  const mockUsers: User[] = [
    {
      id: '1',
      username: 'タカシ',
      avatar: '/users/takashi.jpg',
      plan: 'premium',
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: '2',
      username: 'ユミ',
      avatar: '/users/yumi.jpg',
      plan: 'pro',
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '3',
      username: 'ケンジ',
      avatar: '/users/kenji.jpg',
      plan: 'free',
      isOnline: true,
      lastSeen: new Date(),
    },
  ]

  const mockConversations: Conversation[] = [
    {
      id: '1',
      participants: [mockUsers[0]],
      lastMessage: {
        id: '1',
        senderId: '1',
        receiverId: 'current-user',
        content: 'お疲れさまです！今日のワークアウトはどうでしたか？',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        type: 'text',
      },
      unreadCount: 2,
    },
    {
      id: '2',
      participants: [mockUsers[1]],
      lastMessage: {
        id: '2',
        senderId: 'current-user',
        receiverId: '2',
        content: 'ありがとうございます！とても参考になりました',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        type: 'text',
      },
      unreadCount: 0,
    },
  ]

  const mockMessages: Message[] = [
    {
      id: '1',
      senderId: '1',
      receiverId: 'current-user',
      content: 'こんにちは！一緒にトレーニング頑張りましょう！',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      read: true,
      type: 'text',
    },
    {
      id: '2',
      senderId: 'current-user',
      receiverId: '1',
      content: 'こちらこそよろしくお願いします！',
      timestamp: new Date(Date.now() - 50 * 60 * 1000),
      read: true,
      type: 'text',
    },
    {
      id: '3',
      senderId: '1',
      receiverId: 'current-user',
      content: 'お疲れさまです！今日のワークアウトはどうでしたか？',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      type: 'text',
    },
  ]

  useEffect(() => {
    setConversations(mockConversations)
    if (selectedConversation) {
      setMessages(mockMessages)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    if (userPlan === 'free') {
      alert(
        'メッセージ機能はプレミアムプラン限定です。アップグレードしてご利用ください。',
      )
      return
    }

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user',
      receiverId: selectedConversation,
      content: newMessage,
      timestamp: new Date(),
      read: false,
      type: 'text',
    }

    setMessages((prev) => [...prev, message])
    setNewMessage('')
  }

  const selectedUser = selectedConversation
    ? mockUsers.find((u) => u.id === selectedConversation)
    : null

  const filteredConversations = conversations.filter((conv) =>
    conv.participants.some((p) =>
      p.username.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  )

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Crown className="h-3 w-3 text-purple-500" />
      case 'premium':
        return <Crown className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'pro':
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-purple-100 text-purple-700"
          >
            PRO
          </Badge>
        )
      case 'premium':
        return (
          <Badge
            variant="secondary"
            className="text-xs bg-blue-100 text-blue-700"
          >
            PREMIUM
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* メッセージリストサイドバー */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  メッセージ
                </div>
                <Button size="sm" variant="outline">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </CardTitle>

              {/* プラン制限表示 */}
              {userPlan === 'free' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      プレミアム限定
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700 mb-2">
                    メッセージ機能はプレミアムプラン限定です
                  </p>
                  <Button size="sm" className="w-full" variant="outline">
                    アップグレード
                  </Button>
                </div>
              )}

              {/* 検索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="ユーザーを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-0">
              <div className="space-y-1">
                {filteredConversations.map((conversation) => {
                  const participant = conversation.participants[0]
                  return (
                    <div
                      key={conversation.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedConversation === participant.id
                          ? 'bg-blue-50 border-r-2 border-blue-500'
                          : ''
                      } ${userPlan === 'free' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => {
                        if (userPlan !== 'free') {
                          setSelectedConversation(participant.id)
                        }
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={participant.avatar}
                              alt={participant.username}
                            />
                            <AvatarFallback>
                              {participant.username.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {participant.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm truncate">
                                {participant.username}
                              </span>
                              {getPlanIcon(participant.plan)}
                            </div>
                            <div className="flex items-center space-x-1">
                              {conversation.unreadCount > 0 && (
                                <Badge
                                  variant="default"
                                  className="bg-blue-500 text-xs"
                                >
                                  {conversation.unreadCount}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {conversation.lastMessage.timestamp.toLocaleTimeString(
                                  'ja-JP',
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインチャット画面 */}
        <div className="lg:col-span-3">
          {selectedUser ? (
            <Card className="h-full flex flex-col">
              {/* チャットヘッダー */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={selectedUser.avatar}
                          alt={selectedUser.username}
                        />
                        <AvatarFallback>
                          {selectedUser.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {selectedUser.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">
                          {selectedUser.username}
                        </h3>
                        {getPlanBadge(selectedUser.plan)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedUser.isOnline ? (
                          <span className="text-green-600">オンライン</span>
                        ) : (
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {selectedUser.lastSeen.toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* メッセージ */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === 'current-user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString('ja-JP', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {message.senderId === 'current-user' && (
                          <CheckCheck
                            className={`h-3 w-3 ${message.read ? 'text-blue-200' : 'text-gray-300'}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* メッセージ入力 */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`${selectedUser.username}にメッセージを送信...`}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={userPlan === 'free'}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || userPlan === 'free'}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {userPlan === 'free' && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    メッセージ機能を利用するにはプレミアムプランにアップグレードしてください
                  </p>
                )}
              </div>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <MessageCircle className="h-16 w-16 text-gray-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    会話を選択してください
                  </h3>
                  <p className="text-gray-600">
                    左側のリストから会話を選択してメッセージを開始しましょう
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* 機能紹介 */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>メッセージ機能について</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <Users className="h-12 w-12 text-blue-500 mx-auto" />
                <h4 className="font-semibold">コミュニティ交流</h4>
                <p className="text-sm text-gray-600">
                  同じ目標を持つメンバーと繋がりましょう
                </p>
              </div>
              <div className="text-center space-y-2">
                <Heart className="h-12 w-12 text-red-500 mx-auto" />
                <h4 className="font-semibold">モチベーション向上</h4>
                <p className="text-sm text-gray-600">
                  励まし合ってトレーニングを継続
                </p>
              </div>
              <div className="text-center space-y-2">
                <MessageCircle className="h-12 w-12 text-green-500 mx-auto" />
                <h4 className="font-semibold">リアルタイム交流</h4>
                <p className="text-sm text-gray-600">
                  即座にアドバイスや質問を共有
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">プレミアム機能</h5>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 無制限メッセージ送信</li>
                <li>• 画像・ワークアウト記録の共有</li>
                <li>• グループチャット作成</li>
                <li>• 既読確認機能</li>
                <li>• メッセージ検索</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
