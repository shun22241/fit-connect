import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { goals, challenges, timeframe } = await request.json()
    
    // 簡単なモックレスポンス
    const mockAdvice = {
      advice: "頑張ってトレーニングしましょう！",
      exercises: ["腕立て伏せ", "スクワット", "プランク"],
      tips: ["毎日少しずつ", "無理をしない", "継続が大切"]
    }
    
    return NextResponse.json(mockAdvice)
  } catch (error) {
    console.error('AI coaching error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}