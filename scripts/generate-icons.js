const fs = require('fs')
const path = require('path')

// SVGダンベルアイコンのベースデザイン
const createDumbbellSVG = (size, color = '#2563eb') => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9 12h6"/>
  <path d="M6 12h1"/>
  <path d="M17 12h1"/>
  <rect x="4" y="10" width="4" height="4" rx="1"/>
  <rect x="16" y="10" width="4" height="4" rx="1"/>
</svg>
`

// Base64エンコードされたPNG風SVG（簡易版）
const createIconDataURL = (size) => {
  const svg = createDumbbellSVG(size)
  const base64 = Buffer.from(svg).toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

// 必要なアイコンサイズ
const iconSizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512]

// publicディレクトリパス
const publicDir = path.join(__dirname, '..', 'public')
const iconsDir = path.join(publicDir, 'icons')

// iconsディレクトリを作成
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true })
}

// favicon.icoの代わりにSVGファビコンを作成
const faviconSVG = createDumbbellSVG(32)
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSVG)

// 各サイズのアイコンファイルを作成（SVGファイルとして）
iconSizes.forEach((size) => {
  const svgContent = createDumbbellSVG(size)
  const filename = `icon-${size}x${size}.svg`
  fs.writeFileSync(path.join(iconsDir, filename), svgContent)
  console.log(`✅ Created ${filename}`)
})

// PNGファイル名でもアクセスできるようにSVGをコピー
iconSizes.forEach((size) => {
  const svgContent = createDumbbellSVG(size)
  const pngFilename = `icon-${size}x${size}.png`

  // SVGをPNG名でも保存（ブラウザはSVGを受け取る）
  fs.writeFileSync(path.join(iconsDir, pngFilename), svgContent)
  console.log(`✅ Created ${pngFilename} (as SVG)`)
})

// manifest.jsonを更新
const manifestPath = path.join(publicDir, 'manifest.json')
const manifest = {
  name: 'FitConnect',
  short_name: 'FitConnect',
  description: 'ワークアウトを記録し、仲間とつながる筋トレSNS',
  theme_color: '#2563eb',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  start_url: '/',
  icons: iconSizes.map((size) => ({
    src: `/icons/icon-${size}x${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/svg+xml',
    purpose: size >= 192 ? 'any maskable' : 'any',
  })),
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
console.log('✅ Updated manifest.json')

// 簡易favicon.ico作成
const faviconICO = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#2563eb"><path d="M9 12h6M6 12h1M17 12h1"/><rect x="4" y="10" width="4" height="4" rx="1"/><rect x="16" y="10" width="4" height="4" rx="1"/></svg>`
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconICO)

console.log('🎉 All icons generated successfully!')
console.log('📱 FitConnect PWA icons are ready!')
