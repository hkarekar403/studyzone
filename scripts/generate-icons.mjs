import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Blue circle background
  ctx.fillStyle = '#2563eb'
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // White bold "SZ" text centered
  const fontSize = Math.round(size * 0.38)
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${fontSize}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('SZ', size / 2, size / 2)

  return canvas.toBuffer('image/png')
}

const publicDir = join(__dirname, '..', 'public')

writeFileSync(join(publicDir, 'icon-192.png'), generateIcon(192))
console.log('Generated public/icon-192.png')

writeFileSync(join(publicDir, 'icon-512.png'), generateIcon(512))
console.log('Generated public/icon-512.png')
