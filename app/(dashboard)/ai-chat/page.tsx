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
  Sparkles,
  Settings,
  Crown,
  Lock,
  Heart,
  Zap,
} from 'lucide-react'
import {
  AI_CHARACTERS,
  type CharacterId,
  type Character,
} from '@/lib/ai-characters'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  characterId: CharacterId
}

interface UserSettings {
  selectedCharacter: CharacterId
  plan: 'free' | 'premium' | 'pro'
  chatLimit: number
  chatUsed: number
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userSettings, setUserSettings] = useState<UserSettings>({
    selectedCharacter: 'miku',
    plan: 'free',
    chatLimit: 5,
    chatUsed: 0,
  })
  const [selectedCharacterForView, setSelectedCharacterForView] =
    useState<CharacterId>('miku')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentCharacter = AI_CHARACTERS[userSettings.selectedCharacter]
  const viewCharacter = AI_CHARACTERS[selectedCharacterForView]

  useEffect(() => {
    // 初回の挨拶メッセージ
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: currentCharacter.greeting,
      timestamp: new Date(),
      characterId: userSettings.selectedCharacter,
    }
    setMessages([welcomeMessage])
  }, [userSettings.selectedCharacter, currentCharacter.greeting])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    // チャット制限チェック
    if (
      userSettings.plan === 'free' &&
      userSettings.chatUsed >= userSettings.chatLimit
    ) {
      alert(
        '月間チャット制限に達しました。プレミアムプランにアップグレードして無制限チャットをご利用ください。',
      )
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      characterId: userSettings.selectedCharacter,
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai/character-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          characterId: userSettings.selectedCharacter,
          conversationHistory: messages.slice(-10), // 直近10件の履歴
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          characterId: userSettings.selectedCharacter,
        }

        setMessages((prev) => [...prev, assistantMessage])

        // チャット使用回数を更新
        if (userSettings.plan === 'free') {
          setUserSettings((prev) => ({ ...prev, chatUsed: prev.chatUsed + 1 }))
        }
      } else {
        throw new Error('チャットの送信に失敗しました')
      }
    } catch (error) {
      console.error('Chat error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCharacterChange = (characterId: CharacterId) => {
    // プラン制限チェック
    if (userSettings.plan === 'free' && characterId !== 'miku') {
      alert('キャラクター選択はプレミアムプラン限定の機能です。')
      return
    }

    setUserSettings((prev) => ({
      ...prev,
      selectedCharacter: characterId,
    }))

    // メッセージをリセット
    setMessages([])
  }

  const canUseCharacter = (characterId: CharacterId) => {
    return userSettings.plan !== 'free' || characterId === 'miku'
  }

  const getRemainingChats = () => {
    if (userSettings.plan !== 'free') return '無制限'
    return `${userSettings.chatLimit - userSettings.chatUsed}回`
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* キャラクター選択サイドバー */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                AIコーチ選択
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.values(AI_CHARACTERS).map((character) => (
                <div
                  key={character.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    userSettings.selectedCharacter === character.id
                      ? 'border-blue-500 bg-blue-50'
                      : canUseCharacter(character.id)
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 opacity-50'
                  }`}
                  onClick={() => handleCharacterChange(character.id)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={character.avatar}
                        alt={character.name}
                      />
                      <AvatarFallback
                        style={{ backgroundColor: character.style.secondary }}
                      >
                        {character.style.emoji}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-sm">
                          {character.name}
                        </h4>
                        {!canUseCharacter(character.id) && (
                          <Lock className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 truncate">
                        {character.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {userSettings.plan === 'free' && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      プレミアム限定
                    </span>
                  </div>
                  <p className="text-xs text-yellow-700">
                    全キャラクターを利用するにはプレミアムプランにアップグレード
                  </p>
                  <Button size="sm" className="w-full mt-2" variant="outline">
                    アップグレード
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* チャット制限表示 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">チャット残り回数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: currentCharacter.style.primary }}
                >
                  {getRemainingChats()}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {userSettings.plan === 'free'
                    ? '今月の残り'
                    : '無制限利用可能'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* メインチャット画面 */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            {/* チャットヘッダー */}
            <CardHeader
              className="flex-shrink-0"
              style={{ backgroundColor: currentCharacter.style.secondary }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={currentCharacter.avatar}
                      alt={currentCharacter.name}
                    />
                    <AvatarFallback
                      style={{
                        backgroundColor: currentCharacter.style.primary,
                        color: 'white',
                      }}
                    >
                      {currentCharacter.style.emoji}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {currentCharacter.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentCharacter.description}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: currentCharacter.style.primary,
                    color: 'white',
                  }}
                >
                  {currentCharacter.personality}
                </Badge>
              </div>
            </CardHeader>

            {/* チャットメッセージ */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.1s' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* チャット入力 */}
            <div className="flex-shrink-0 p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`${currentCharacter.name}にメッセージを送信...`}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  style={{ backgroundColor: currentCharacter.style.primary }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* キャラクター詳細表示 */}
      <div className="mt-8">
        <Tabs
          value={selectedCharacterForView}
          onValueChange={(value) =>
            setSelectedCharacterForView(value as CharacterId)
          }
        >
          <TabsList className="grid w-full grid-cols-5">
            {Object.values(AI_CHARACTERS).map((character) => (
              <TabsTrigger
                key={character.id}
                value={character.id}
                className="text-xs"
              >
                {character.style.emoji} {character.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.values(AI_CHARACTERS).map((character) => (
            <TabsContent key={character.id} value={character.id}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {character.style.emoji} {character.name}の詳細
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">性格・特徴</h4>
                      <ul className="space-y-1">
                        {character.traits.map((trait, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <Heart className="h-3 w-3 mr-2 text-pink-500" />
                            {trait}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">専門分野</h4>
                      <ul className="space-y-1">
                        {character.specialties.map((specialty, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-600 flex items-center"
                          >
                            <Zap className="h-3 w-3 mr-2 text-yellow-500" />
                            {specialty}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div
                    className="mt-4 p-3 rounded-lg"
                    style={{ backgroundColor: character.style.secondary }}
                  >
                    <p className="text-sm italic">
                      &ldquo;{character.greeting}&rdquo;
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
