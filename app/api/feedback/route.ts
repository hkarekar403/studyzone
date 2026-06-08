import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { name, email, rating, message, curriculum } = await req.json()

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 })
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
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

    await resend.emails.send({
      from: 'StudyZone Feedback <onboarding@resend.dev>',
      to: 'hkarekar01cloud@gmail.com',
      subject: `StudyZone Feedback - ${rating}/5 stars from ${name || 'Anonymous'}`,
      html: `
        <h2>New Feedback from StudyZone</h2>
        <p><strong>Name:</strong> ${name || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
        <p><strong>Curriculum:</strong> ${curriculum}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr/>
        <p><small>Sent from studyzone.co.in</small></p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to send feedback.'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
