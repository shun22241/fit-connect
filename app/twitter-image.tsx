import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FitConnect - フィットネスソーシャルプラットフォーム'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '60px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* 左側: テキスト */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              marginBottom: 20,
              textShadow: '0 4px 8px rgba(0,0,0,0.3)',
            }}
          >
            FitConnect
          </div>
          <div
            style={{
              fontSize: 28,
              color: 'rgba(255,255,255,0.9)',
              lineHeight: 1.4,
              marginBottom: 30,
            }}
          >
            ワークアウトを記録・共有し、
            <br />
            AIコーチングで目標達成
          </div>
          <div
            style={{
              display: 'flex',
              gap: 30,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                fontSize: 18,
              }}
            >
              <span style={{ marginRight: 10 }}>📊</span>
              ワークアウト記録
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                color: 'white',
                fontSize: 18,
              }}
            >
              <span style={{ marginRight: 10 }}>🤖</span>
              AI分析
            </div>
          </div>
        </div>

        {/* 右側: ビジュアル */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            position: 'relative',
          }}
        >
          {/* メインアイコン */}
          <div
            style={{
              width: 160,
              height: 160,
              background: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div
              style={{
                fontSize: 80,
                fontWeight: 'bold',
              }}
            >
              💪
            </div>
          </div>

          {/* 装飾円 */}
          <div
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              border: '3px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 280,
              height: 280,
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '50%',
              zIndex: 0,
            }}
          />

          {/* フローティング要素 */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 40,
              width: 40,
              height: 40,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🏆
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 60,
              width: 50,
              height: 50,
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}
          >
            📈
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
