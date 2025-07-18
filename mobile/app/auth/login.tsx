import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useAuth } from '../../contexts/AuthContext'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { signIn } = useAuth()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください')
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
      // 成功時はAuthContextで自動的にリダイレクトされる
    } catch (error: any) {
      Alert.alert('ログインエラー', error.message || 'ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* ヘッダー */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#3b82f6', '#1d4ed8']}
              style={styles.logoContainer}
            >
              <Ionicons name="barbell" size={48} color="#ffffff" />
            </LinearGradient>
            <Text style={[styles.title, isDark && styles.textDark]}>
              FitConnect
            </Text>
            <Text style={styles.subtitle}>フィットネスの旅を始めましょう</Text>
          </View>

          {/* ログインフォーム */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="メールアドレス"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? '#9ca3af' : '#6b7280'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                placeholder="パスワード"
                placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={isDark ? '#9ca3af' : '#6b7280'}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotPassword}>
                パスワードを忘れた方はこちら
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={
                  loading ? ['#9ca3af', '#6b7280'] : ['#3b82f6', '#1d4ed8']
                }
                style={styles.loginButtonGradient}
              >
                {loading ? (
                  <Text style={styles.loginButtonText}>ログイン中...</Text>
                ) : (
                  <Text style={styles.loginButtonText}>ログイン</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ソーシャルログイン */}
          <View style={styles.socialLogin}>
            <Text style={[styles.orText, isDark && styles.textDark]}>
              または
            </Text>

            <TouchableOpacity
              style={[styles.socialButton, isDark && styles.socialButtonDark]}
              onPress={() => {
                // Google ログインの実装
                Alert.alert('準備中', 'Googleログインは準備中です')
              }}
            >
              <Ionicons name="logo-google" size={20} color="#dc2626" />
              <Text
                style={[styles.socialButtonText, isDark && styles.textDark]}
              >
                Googleでログイン
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, isDark && styles.socialButtonDark]}
              onPress={() => {
                // Apple ログインの実装
                Alert.alert('準備中', 'Appleログインは準備中です')
              }}
            >
              <Ionicons
                name="logo-apple"
                size={20}
                color={isDark ? '#ffffff' : '#1f2937'}
              />
              <Text
                style={[styles.socialButtonText, isDark && styles.textDark]}
              >
                Appleでログイン
              </Text>
            </TouchableOpacity>
          </View>

          {/* 新規登録へのリンク */}
          <View style={styles.signupContainer}>
            <Text style={[styles.signupText, isDark && styles.textDark]}>
              アカウントをお持ちでない方は
            </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.signupLink}>新規登録</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  textDark: {
    color: '#ffffff',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 48,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  inputDark: {
    backgroundColor: '#374151',
    color: '#ffffff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  forgotPassword: {
    color: '#3b82f6',
    fontSize: 14,
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialLogin: {
    marginBottom: 32,
  },
  orText: {
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 16,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  socialButtonDark: {
    backgroundColor: '#374151',
  },
  socialButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#6b7280',
    fontSize: 14,
  },
  signupLink: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
})
