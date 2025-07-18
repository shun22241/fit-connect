'use client'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import WorkoutRecommendationCard from '@/components/ai/WorkoutRecommendationCard'
import AICoachingCard from '@/components/ai/AICoachingCard'
import FormAnalysisCard from '@/components/ai/FormAnalysisCard'
import {
  Brain,
  Sparkles,
  MessageSquare,
  Wand2,
  Target,
  TrendingUp,
} from 'lucide-react'

export default function AIAssistPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold">AI トレーニングアシスタント</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            人工知能があなたのフィットネスジャーニーをサポート。
            パーソナライズされたワークアウト推奨、フォーム分析、自然言語での記録が可能です。
          </p>
          <Badge
            variant="outline"
            className="mt-2 bg-purple-50 text-purple-700"
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Phase 5 - AI統合機能
          </Badge>
        </div>

        <Tabs defaultValue="recommendation" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger
              value="recommendation"
              className="flex items-center gap-2"
            >
              <Target className="h-4 w-4" />
              AI推奨
            </TabsTrigger>
            <TabsTrigger
              value="form-analysis"
              className="flex items-center gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              フォーム分析
            </TabsTrigger>
            <TabsTrigger value="coaching" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              パーソナルコーチ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recommendation" className="space-y-6">
            <WorkoutRecommendationCard />
          </TabsContent>

          <TabsContent value="form-analysis" className="space-y-6">
            <FormAnalysisCard />
          </TabsContent>

          <TabsContent value="coaching" className="space-y-6">
            <AICoachingCard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
