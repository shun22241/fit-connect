import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

import { useAuth } from '../../contexts/AuthContext'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  const colorScheme = useColorScheme()
  const { user } = useAuth()
  const isDark = colorScheme === 'dark'

  const quickActions = [
    {
      title: '新しいワークアウト',
      subtitle: 'トレーニングを記録',
      icon: 'add-circle-outline',
      color: '#3b82f6',
      onPress: () => router.push('/workouts/new'),
    },
    {
      title: 'AIコーチング',
      subtitle: 'パーソナルアドバイス',
      icon: 'sparkles-outline',
      color: '#8b5cf6',
      onPress: () => router.push('/ai-coach'),
    },
    {
      title: '投稿作成',
      subtitle: '進捗をシェア',
      icon: 'camera-outline',
      color: '#10b981',
      onPress: () => router.push('/post/new'),
    },
    {
      title: 'フィード',
      subtitle: 'コミュニティ',
      icon: 'people-outline',
      color: '#f59e0b',
      onPress: () => router.push('/feed'),
    },
  ]

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, isDark && styles.textDark]}>
              おはようございます 👋
            </Text>
            <Text style={[styles.username, isDark && styles.textDark]}>
              {user?.username || 'Guest'}さん
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => router.push('/notifications')}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={isDark ? '#ffffff' : '#1f2937'}
            />
          </TouchableOpacity>
        </View>

        {/* 今日の統計 */}
        <LinearGradient
          colors={['#3b82f6', '#1d4ed8']}
          style={styles.statsCard}
        >
          <Text style={styles.statsTitle}>今日の進捗</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>ワークアウト</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>分間</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>カロリー</Text>
            </View>
          </View>
        </LinearGradient>

        {/* クイックアクション */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            クイックアクション
          </Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.actionCard, isDark && styles.actionCardDark]}
                onPress={action.onPress}
              >
                <View
                  style={[
                    styles.actionIcon,
                    { backgroundColor: action.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={action.icon as any}
                    size={24}
                    color={action.color}
                  />
                </View>
                <Text style={[styles.actionTitle, isDark && styles.textDark]}>
                  {action.title}
                </Text>
                <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 最近のアクティビティ */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              最近のアクティビティ
            </Text>
            <TouchableOpacity onPress={() => router.push('/feed')}>
              <Text style={styles.seeAll}>すべて見る</Text>
            </TouchableOpacity>
          </View>

          <View
            style={[styles.activityCard, isDark && styles.activityCardDark]}
          >
            <Text style={[styles.activityText, isDark && styles.textDark]}>
              まだアクティビティがありません
            </Text>
            <Text style={styles.activitySubtext}>
              最初のワークアウトを記録してみましょう！
            </Text>
          </View>
        </View>

        {/* 今週の目標 */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
            今週の目標
          </Text>
          <View style={[styles.goalCard, isDark && styles.goalCardDark]}>
            <View style={styles.goalHeader}>
              <Text style={[styles.goalTitle, isDark && styles.textDark]}>
                週3回のワークアウト
              </Text>
              <Text style={styles.goalProgress}>0/3</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%' }]} />
            </View>
            <Text style={styles.goalMotivation}>今週も頑張りましょう！💪</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  textDark: {
    color: '#ffffff',
  },
  notificationButton: {
    padding: 8,
  },
  statsCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionCardDark: {
    backgroundColor: '#1f2937',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  activityCardDark: {
    backgroundColor: '#1f2937',
  },
  activityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  activitySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  goalCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
  },
  goalCardDark: {
    backgroundColor: '#1f2937',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  goalProgress: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  goalMotivation: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})
