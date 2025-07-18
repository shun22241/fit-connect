import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
})

// AIワークアウト推奨を生成
export async function generateWorkoutRecommendation(userProfile: {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  equipment: string[]
  timeAvailable: number
  previousWorkouts: string[]
}) {
  try {
    const prompt = `
ユーザーのフィットネスプロフィール:
- レベル: ${userProfile.fitnessLevel}
- 目標: ${userProfile.goals.join(', ')}
- 利用可能な器具: ${userProfile.equipment.join(', ')}
- 利用可能時間: ${userProfile.timeAvailable}分
- 過去のワークアウト: ${userProfile.previousWorkouts.join(', ')}

上記の情報を基に、適切なワークアウトプランを日本語で提案してください。
以下のJSON形式で返してください:

{
  "title": "ワークアウト名",
  "description": "ワークアウトの説明",
  "duration": 時間（分）,
  "exercises": [
    {
      "name": "エクササイズ名",
      "sets": セット数,
      "reps": "レップ数または時間",
      "weight": "推奨重量（該当する場合）",
      "notes": "フォームやコツ"
    }
  ],
  "tips": ["アドバイス1", "アドバイス2"],
  "difficulty": "beginner|intermediate|advanced"
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'あなたは経験豊富なパーソナルトレーナーです。ユーザーの状況に合わせて最適なワークアウトプランを提案してください。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('AIからの応答がありません')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('AI workout recommendation error:', error)

    // フォールバック: デモ用のサンプルワークアウト
    return {
      title: '全身ワークアウト',
      description: '初心者向けの基本的な全身トレーニングプログラム',
      duration: 45,
      exercises: [
        {
          name: 'プッシュアップ',
          sets: 3,
          reps: '10-15回',
          weight: '自重',
          notes: '膝をついても可。胸をしっかり地面に近づける',
        },
        {
          name: 'スクワット',
          sets: 3,
          reps: '15-20回',
          weight: '自重',
          notes: '太ももが床と平行になるまで下げる',
        },
        {
          name: 'プランク',
          sets: 3,
          reps: '30-60秒',
          weight: '自重',
          notes: '体を一直線に保つ',
        },
      ],
      tips: [
        '各エクササイズ間は30-60秒休憩',
        '正しいフォームを優先して重量や回数を調整',
        '週に2-3回実施',
      ],
      difficulty: 'beginner',
    }
  }
}

// フォーム解析
export async function analyzeWorkoutForm(
  exerciseName: string,
  userDescription: string,
) {
  try {
    const prompt = `
エクササイズ: ${exerciseName}
ユーザーの状況説明: ${userDescription}

上記のエクササイズについて、ユーザーの説明を基にフォームの改善点を指摘し、
以下のJSON形式で返してください:

{
  "analysis": "フォーム分析結果",
  "improvements": ["改善点1", "改善点2"],
  "tips": ["コツ1", "コツ2"],
  "safety": ["安全上の注意1", "安全上の注意2"],
  "score": 1-10の点数
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'あなたは経験豊富なパーソナルトレーナーです。正しいフォームとテクニックを教えることに特化しています。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 800,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('AIからの応答がありません')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('AI form analysis error:', error)

    return {
      analysis: 'フォーム分析機能は現在デモモードです',
      improvements: ['正しいフォームを心がけましょう'],
      tips: ['ゆっくりとした動作で行う', '呼吸を意識する'],
      safety: ['無理をしない', '痛みを感じたら中止する'],
      score: 7,
    }
  }
}

// AIコーチング
export async function generateCoachingAdvice(
  workoutHistory: any[],
  currentGoals: string[],
  challenges: string[],
) {
  try {
    const prompt = `
ワークアウト履歴: ${JSON.stringify(workoutHistory.slice(-5))}
現在の目標: ${currentGoals.join(', ')}
現在の課題: ${challenges.join(', ')}

上記の情報を基に、パーソナルコーチとしてのアドバイスを以下のJSON形式で返してください:

{
  "motivation": "モチベーションメッセージ",
  "progress_analysis": "進捗分析",
  "recommendations": ["推奨事項1", "推奨事項2"],
  "next_steps": ["次のステップ1", "次のステップ2"],
  "encouragement": "励ましの言葉"
}
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'あなたは経験豊富で励ましが上手なパーソナルコーチです。ユーザーのモチベーションを高め、継続できるようサポートします。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('AIからの応答がありません')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('AI coaching error:', error)

    return {
      motivation: '素晴らしい努力を続けていますね！',
      progress_analysis: '着実に進歩しています',
      recommendations: ['継続は力なり', '少しずつでも続けることが大切'],
      next_steps: [
        '次回も頑張りましょう',
        '新しいチャレンジを試してみてください',
      ],
      encouragement: 'あなたなら必ず目標を達成できます！',
    }
  }
}

// 自然言語ワークアウト入力の解析
export async function parseNaturalLanguageWorkout(input: string) {
  try {
    const prompt = `
ユーザーの自然言語入力: "${input}"

上記の入力を解析して、ワークアウトの情報を以下のJSON形式で抽出してください:

{
  "title": "ワークアウト名",
  "exercises": [
    {
      "name": "エクササイズ名",
      "sets": セット数,
      "reps": レップ数,
      "weight": 重量（kg、該当する場合）,
      "duration": 時間（秒、該当する場合）
    }
  ],
  "total_duration": 総時間（分）,
  "notes": "その他のメモ"
}

例：
入力: "今日は胸トレをしました。ベンチプレス 80kg 10回を3セット、インクラインダンベルプレス 20kg 12回を3セット、プッシュアップ 15回を2セットやりました。"
出力: 適切なJSON形式
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'あなたはワークアウト記録の専門家です。自然言語で記述されたワークアウト内容を構造化されたデータに変換します。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('AIからの応答がありません')
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Natural language parsing error:', error)

    return {
      title: 'ワークアウト',
      exercises: [
        {
          name: '記録されたエクササイズ',
          sets: 1,
          reps: 1,
          weight: null,
          duration: null,
        },
      ],
      total_duration: 30,
      notes: '自然言語解析機能はデモモードです',
    }
  }
}

export default openai
