import { NextRequest, NextResponse } from 'next/server'

const escHtml = (s: string) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

export async function POST(req: NextRequest) {
  const { name, email, rating, message, curriculum } = await req.json()

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 })
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ success: false, error: 'Rating must be between 1 and 5.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Dev fallback — succeed silently so the UI still works without a key
    return NextResponse.json({ success: true })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)

    const safeName = escHtml(name || 'Not provided')
    const safeEmail = escHtml(email || 'Not provided')
    const safeMessage = escHtml(message)
    const safeCurriculum = escHtml(curriculum || 'Not provided')
    const stars = '⭐'.repeat(rating)

    await resend.emails.send({
      from: 'StudyZone Feedback <onboarding@resend.dev>',
      to: 'hkarekar01cloud@gmail.com',
      subject: `StudyZone Feedback - ${rating}/5 stars from ${escHtml(name || 'Anonymous')}`,
      html: `
        <h2>New Feedback from StudyZone</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Rating:</strong> ${stars} (${rating}/5)</p>
        <p><strong>Curriculum:</strong> ${safeCurriculum}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <hr/>
        <p><small>Sent from studyzone.co.in</small></p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Failed to send feedback.'
    return NextResponse.json({ success: false, error: errMsg }, { status: 500 })
  }
}
