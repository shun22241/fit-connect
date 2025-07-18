import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FitConnect - フィットネスソーシャルプラットフォーム'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* ロゴアイコン */}
        <div
          style={{
            width: 120,
            height: 120,
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }}
        >
          <div
            style={{
              fontSize: 60,
              fontWeight: 'bold',
              color: '#667eea',
            }}
          >
            💪
          </div>
        </div>

        {/* タイトル */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 20,
            textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          }}
        >
          FitConnect
        </div>

        {/* サブタイトル */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            marginBottom: 40,
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          フィットネス愛好者のためのソーシャルプラットフォーム
        </div>

        {/* 特徴 */}
        <div
          style={{
            display: 'flex',
            gap: 60,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'white',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>📊</div>
            <div style={{ fontSize: 20 }}>記録</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'white',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>🤝</div>
            <div style={{ fontSize: 20 }}>共有</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: 'white',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>🤖</div>
            <div style={{ fontSize: 20 }}>AIコーチ</div>
          </div>
        </div>

        {/* 装飾要素 */}
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 50,
            width: 100,
            height: 100,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 80,
            left: 80,
            width: 150,
            height: 150,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '50%',
          }}
        />
      </div>
    ),
    {
      ...size,
    },
  )
}
