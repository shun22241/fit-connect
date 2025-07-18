import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generateCharacterPrompt,
  adjustResponseStyle,
  AI_CHARACTERS,
  type CharacterId,
} from '@/lib/ai-characters'
import { generateCoachingAdvice } from '@/lib/openai'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    const { message, characterId, conversationHistory } = await request.json()

    if (!message || !characterId) {
      return NextResponse.json(
        { error: 'メッセージとキャラクターIDが必要です' },
        { status: 400 },
      )
    }

    if (!(characterId in AI_CHARACTERS)) {
      return NextResponse.json(
        { error: '無効なキャラクターIDです' },
        { status: 400 },
      )
    }

    // ユーザーのプラン制限チェック（実装例）
    // const userSubscription = await getUserSubscription(user?.id || 'demo')
    // if (!canSelectCharacter(userSubscription.plan, characterId)) {
    //   return NextResponse.json(
    //     { error: 'このキャラクターは利用できません' },
    //     { status: 403 },
    //   )
    // }

    try {
      // キャラクター専用のプロンプト生成
      const characterPrompt = generateCharacterPrompt(characterId, message)

      // 会話履歴を含める
      const messages = [
        {
          role: 'system' as const,
          content: characterPrompt,
        },
        // 直近の会話履歴を追加
        ...conversationHistory.slice(-6).map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        {
          role: 'user' as const,
          content: message,
        },
      ]

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.8, // キャラクターらしさを出すため少し高め
        max_tokens: 500,
      })

      let response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('AIからの応答がありません')
      }

      // キャラクターのスタイルに合わせてレスポンスを調整
      response = adjustResponseStyle(characterId, response)

      return NextResponse.json({
        success: true,
        response,
        characterId,
        timestamp: new Date().toISOString(),
      })
    } catch (aiError) {
      console.error('AI character chat error:', aiError)

      // フォールバック: キャラクター別のデモ応答
      const character = AI_CHARACTERS[characterId as CharacterId]
      const demoResponses = getDemoResponses(
        characterId as CharacterId,
        message,
      )
      const randomResponse =
        demoResponses[Math.floor(Math.random() * demoResponses.length)]

      return NextResponse.json({
        success: true,
        response: adjustResponseStyle(characterId, randomResponse),
        characterId,
        timestamp: new Date().toISOString(),
        demo: true,
      })
    }
  } catch (error) {
    console.error('Character chat error:', error)
    return NextResponse.json(
      { error: 'キャラクターチャットの処理に失敗しました' },
      { status: 500 },
    )
  }
}

// キャラクター別のデモ応答
function getDemoResponses(
  characterId: CharacterId,
  userMessage: string,
): string[] {
  const character = AI_CHARACTERS[characterId]

  // キーワードに基づく応答選択
  const lowerMessage = userMessage.toLowerCase()

  if (
    lowerMessage.includes('筋トレ') ||
    lowerMessage.includes('ワークアウト')
  ) {
    switch (characterId) {
      case 'miku':
        return [
          'わあ！筋トレ頑張ってるんですね！今日はどの部位を鍛えますか？',
          '筋トレ素晴らしいです！無理しない程度に頑張りましょう！',
          'ワークアウト大好き！一緒に目標に向かって頑張りましょう！',
        ]
      case 'rin':
        return [
          '筋トレですね。今日のトレーニングプランを確認しましょう。',
          'ワークアウトの効率を最大化するため、正しいフォームを意識してください。',
          'データに基づいて、あなたに最適なトレーニング強度を提案します。',
        ]
      case 'yui':
        return [
          '筋トレお疲れさまです。無理は禁物ですよ。',
          'ワークアウト前後のストレッチもお忘れなく。',
          '健康第一です。体調と相談しながら進めましょう。',
        ]
      case 'kai':
        return [
          '筋トレだ！今日も限界を超えていこう！',
          'ワークアウトで自分を追い込め！俺が付いてる！',
          '筋肉に語りかけろ！今日も勝負の時だ！',
        ]
      case 'luna':
        return [
          '筋トレも心の安定につながりますね。',
          'ワークアウトを通じて、心と体のバランスを整えましょう。',
          '筋トレの後は深呼吸をして、達成感を味わってください。',
        ]
    }
  }

  if (lowerMessage.includes('疲れ') || lowerMessage.includes('つらい')) {
    switch (characterId) {
      case 'miku':
        return [
          'お疲れさまです！今日も頑張ったんですね！',
          '疲れた時こそ、明日への第一歩です！',
          'つらい時は休息も大切。無理しないでくださいね！',
        ]
      case 'rin':
        return [
          '疲労は適切な休息で回復します。睡眠と栄養を重視してください。',
          'つらさを感じるのは成長の証拠です。計画的に休息を取りましょう。',
          '疲労管理も重要なトレーニングの一部です。',
        ]
      case 'yui':
        return [
          'お疲れさま。無理は体に毒ですよ。',
          'つらい時は素直に休んでくださいね。',
          '疲れを感じたら、体が休息を求めているサインです。',
        ]
      case 'kai':
        return [
          '疲れも成長の証だ！でも休息も戦略の一つだぞ！',
          'つらい時こそ真の強さが試される！でも無茶は禁物だ！',
          '疲れた体も明日はまた強くなる！今日はゆっくり休め！',
        ]
      case 'luna':
        return [
          '疲れは自然なもの。ゆっくり呼吸をして心を落ち着けましょう。',
          'つらい時こそ、心の平穏を保つことが大切です。',
          '疲労は体からのメッセージ。優しく受け止めてあげてください。',
        ]
    }
  }

  // デフォルト応答
  switch (characterId) {
    case 'miku':
      return [
        'はい！何でも聞いてください！',
        '一緒に頑張りましょう！',
        'あなたなら絶対できます！',
      ]
    case 'rin':
      return [
        'どのようなサポートが必要でしょうか？',
        'データに基づいてアドバイスします。',
        '効率的な方法を一緒に考えましょう。',
      ]
    case 'yui':
      return [
        'お気軽にご相談ください。',
        '健康が一番大切ですからね。',
        'あなたのペースで大丈夫ですよ。',
      ]
    case 'kai':
      return [
        '何でも相談してくれ！',
        '一緒に頂点を目指そう！',
        '俺が全力でサポートする！',
      ]
    case 'luna':
      return [
        '心穏やかにお話ししましょう。',
        'ゆっくりとお聞きします。',
        '心と体の調和を大切にしましょう。',
      ]
    default:
      return ['こんにちは！何かお手伝いできることはありますか？']
  }
}
