import { NextRequest, NextResponse } from 'next/server'
import { getAllClaims, createClaim, type CreateClaimInput } from '@/lib/sqlite'
import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined

    const claims = getAllClaims(status)
    return NextResponse.json(claims)
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json({ error: 'Failed to fetch claims' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateClaimInput = await request.json()

    // Validate required fields
    if (!body.item_id || !body.item_title || !body.claimant_name || !body.claimant_email || !body.description) {
      return NextResponse.json(
        { error: 'Missing required fields: item_id, item_title, claimant_name, claimant_email, description' },
        { status: 400 }
      )
    }

    const claim = createClaim(body)

    // Send emails via SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'whereatwestforsythhs@gmail.com'
      const adminEmail = process.env.SENDGRID_FROM_EMAIL || 'whereatwestforsythhs@gmail.com'

      // Email to admin
      await sgMail.send({
        to: adminEmail,
        from: { email: fromEmail, name: 'Where at West Lost & Found' },
        subject: `New Claim Submitted — ${body.item_title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #212661; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #cec481; margin: 0;">New Claim Submitted</h2>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #ddd;">
              <p><strong>Item:</strong> ${body.item_title}</p>
              <p><strong>Claimant:</strong> ${body.claimant_name}</p>
              <p><strong>Email:</strong> <a href="mailto:${body.claimant_email}">${body.claimant_email}</a></p>
              ${body.student_id ? `<p><strong>Student ID:</strong> ${body.student_id}</p>` : ''}
              <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
              <p><strong>Description:</strong></p>
              <p style="white-space: pre-wrap;">${body.description}</p>
            </div>
            <div style="background: #212661; padding: 12px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #cec481; margin: 0; font-size: 12px;">West Forsyth Lost & Found — Where at West</p>
            </div>
          </div>
        `,
        text: `New claim submitted\n\nItem: ${body.item_title}\nClaimant: ${body.claimant_name}\nEmail: ${body.claimant_email}\n${body.student_id ? `Student ID: ${body.student_id}\n` : ''}\nDescription:\n${body.description}`,
      })

      // Confirmation email to claimant
      await sgMail.send({
        to: body.claimant_email,
        from: { email: fromEmail, name: 'Where at West Lost & Found' },
        subject: `Your Claim Has Been Received — ${body.item_title}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #212661; padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: #cec481; margin: 0;">West Forsyth Lost & Found</h2>
            </div>
            <div style="background: #f9f9f9; padding: 24px; border: 1px solid #ddd;">
              <p>Hi ${body.claimant_name},</p>
              <p>Your claim for <strong>${body.item_title}</strong> has been received and is under review.</p>
              <div style="background: #fff3cd; border-left: 4px solid #cec481; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <h4 style="margin: 0 0 10px 0; color: #856404;">Next Steps:</h4>
                <ol style="margin: 0; padding-left: 20px; color: #856404; line-height: 1.8;">
                  <li>The Lost & Found office will review your claim</li>
                  <li>Visit the front office with your student ID to pick up your item</li>
                  <li>You will be contacted if additional information is needed</li>
                </ol>
              </div>
              <p style="color: #666; font-size: 14px;">Front Office | 770-888-3470</p>
            </div>
            <div style="background: #212661; padding: 12px; border-radius: 0 0 8px 8px; text-align: center;">
              <p style="color: #cec481; margin: 0; font-size: 12px;">Go Wolverines! 🐺</p>
            </div>
          </div>
        `,
        text: `Hi ${body.claimant_name},\n\nYour claim for "${body.item_title}" has been received.\n\nNext Steps:\n1. The Lost & Found office will review your claim\n2. Visit the front office with your student ID\n3. You will be contacted if additional info is needed\n\nFront Office | 770-888-3470`,
      })
    }

    return NextResponse.json(claim, { status: 201 })
  } catch (error) {
    console.error('Error creating claim:', error)
    return NextResponse.json({ error: 'Failed to create claim' }, { status: 500 })
  }
}
