import { NextRequest, NextResponse } from 'next/server'
import { createContact, getAllContacts, type CreateContactInput } from '@/lib/sqlite'
import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function GET() {
  try {
    const contacts = getAllContacts()
    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateContactInput = await request.json()

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, subject, message' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const contact = createContact(body)

    // Send email notification via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'whereatwestforsythhs@gmail.com'
      const adminEmail = process.env.SENDGRID_FROM_EMAIL || 'whereatwestforsythhs@gmail.com'

      await sgMail.send({
        to: adminEmail,
        from: { email: fromEmail, name: 'Where at West Lost & Found' },
        replyTo: body.email,
        subject: `[Contact Form] ${body.subject} — from ${body.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #212661; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #cec481; margin: 0;">New Contact Form Submission</h2>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #ddd;">
              <p><strong>Name:</strong> ${body.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${body.email}">${body.email}</a></p>
              <p><strong>Subject:</strong> ${body.subject}</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap;">${body.message}</p>
            </div>
            <div style="background: #212661; padding: 12px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #cec481; margin: 0; font-size: 12px;">West Forsyth Lost & Found — Where at West</p>
            </div>
          </div>
        `,
        text: `New contact form submission\n\nName: ${body.name}\nEmail: ${body.email}\nSubject: ${body.subject}\n\nMessage:\n${body.message}`,
      })
    }

    return NextResponse.json(contact, { status: 201 })
  } catch (error) {
    console.error('Error creating contact:', error)
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 })
  }
}
